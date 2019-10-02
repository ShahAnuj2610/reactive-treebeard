import React, { useState, useEffect } from "react";
import { Treebeard } from "react-treebeard";
import { isFile } from "../utils";
import { cloneDeep } from "lodash-es";
import { Tree } from "./Tree";

const sampleData = {
  name: "root",
  toggled: true,
  children: [
    {
      name: "parent",
      children: []
    },
    {
      name: "loading parent",
      loading: true,
      children: []
    },
    {
      name: "parent",
      children: [
        {
          name: "nested parent",
          children: [
            { name: "nested child 1", children: [{ name: "nested child 3" }] },
            { name: "nested child 2" }
          ]
        }
      ]
    }
  ]
};

const constructChildParentsRel = (data = []) => {
  const clonedData = cloneDeep(data);
  if (!clonedData.length) return [];
  const newData = [{ name: clonedData[0], parent: "root" }];
  let currParent = clonedData[0];
  clonedData.shift();
  clonedData.forEach(dataItem => {
    newData.push({ name: dataItem, parent: currParent });
    if (!isFile(dataItem)) currParent = dataItem;
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

const getTreeData = data => {
  const root = { name: "root", toggle: true, children: [] };
  const treeStruct = JSON.parse(JSON.stringify(buildTree(data)));
  treeStruct.forEach(data => root.children.push(data));
  return root;
};

const TreeBeardRender = props => {
  const {aggregations, level} = props;
  const [aggregatedData, setAggregatedData] = useState([]);
  // const concatAggregations = ()
  const [data, setData] = useState(getTreeData(props.data));
  useEffect(() => {
    setData(getTreeData(props.data));
  }, [props.data]);
  const [cursor, setCursor] = useState(false);
  const onToggle = (node, toggled) => {
    console.log({node, toggled})
    if (cursor) {
      cursor.active = false;
    }
    node.active = true;
    if (node.children) {
      node.toggled = toggled;
    }
    setCursor(node);
    setData(Object.assign({}, data));
  };

  return <Treebeard data={data} onToggle={onToggle} />;
};

export default TreeBeardRender;
