import React, { useState } from "react";
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
      children: [{ name: "child1" }, { name: "child2" }]
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
  console.log(finalTreeData);
  return [];
};

const TreeBeardRender = props => {
  const [data, setData] = useState(buildTree(props.data));
  const [cursor, setCursor] = useState(false);
  const onToggle = (node, toggled) => {
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
