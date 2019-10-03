import React, { useState, useEffect } from "react";
import { Treebeard } from "react-treebeard";
import { isFile } from "../utils";
import { cloneDeep, get } from "lodash-es";
import { Tree } from "./Tree";

const constructChildParentsRel = (data = []) => {
  const clonedData = cloneDeep(data);
  if (!clonedData.length) return [];
  let level = 0;
  const newData = [{ name: clonedData[0], parent: "root", level }];
  level++;
  let currParent = clonedData[0];
  clonedData.shift();
  clonedData.forEach(dataItem => {
    newData.push({ name: dataItem, parent: currParent, level });
    if (!isFile(dataItem)) {
      currParent = dataItem;
      level++;
    }
  });
  return newData;
};

const buildTree = data => {
  const finalTreeData = [];
  data.forEach(nestedData => {
    const tree = new Tree();
    constructChildParentsRel(nestedData).forEach(nestedDataItem => {
      tree.add(nestedDataItem);
    });
    finalTreeData.push(tree.root);
  });
  return finalTreeData;
};

const getTreeData = aggData => {
  const data = flatAggregations(aggData);
  const root = { name: "root", toggle: true, children: [], level: 0 };
  const treeStruct = JSON.parse(JSON.stringify(buildTree(data)));
  treeStruct.forEach(data => root.children.push(data));
  console.log({ root });
  return root;
};

const flatAggregations = aggregations => {
  if (!aggregations) return [];
  function flat(array = [], level = 2) {
    let result = [];
    const keyWord = `path_level_${level}.keyword`;
    array.forEach(function(a) {
      result.push(a.key);
      if (Array.isArray(get(a, [keyWord, "buckets"]))) {
        result = result.concat(flat(get(a, [keyWord, "buckets"]), level + 1));
      }
    });
    return result;
  }

  const flatTreeData = [];
  aggregations["path_level_0.keyword"].buckets.forEach(agg => {
    flatTreeData.push([
      agg.key,
      ...flat(get(agg, ["path_level_1.keyword", "buckets"]))
    ]);
  });
  return flatTreeData;
};

const TreeBeardRender = props => {
  const { aggregations, level, setLevel, loading } = props;
  const [data, setData] = useState(getTreeData(aggregations));
  useEffect(() => {
    setData(getTreeData(aggregations));
  }, [aggregations]);
  const [cursor, setCursor] = useState(false);
  const onToggle = async (node, toggled) => {
    console.log({ node, toggled });
    if (cursor) {
      cursor.active = false;
    }
    node.active = true;
    if (node.children) {
      node.toggled = toggled;
      node.loading = loading;
    }
    setLevel(node.level + 1);
    setCursor(node);
    setData(Object.assign({}, data));
  };

  return <Treebeard data={data} onToggle={onToggle} />;
};

export default TreeBeardRender;
