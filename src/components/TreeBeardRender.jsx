import React, { Component } from "react";
import { Treebeard } from "react-treebeard";
import { getDefaultQuery, isFile, searchAPI } from "../utils";
import { cloneDeep, get } from "lodash-es";
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

const createChildren = (aggs, node) => {
  const { level } = node;
  if (level === 0) {
    return aggs["path_level_0.keyword"].buckets.map(bucket => ({
      name: bucket.key,
      children: isFile(bucket.key) ? null : [],
      level: level + 1,
      path: bucket.key
    }));
  }
  const paths = node.path.split("/");
  let iterLevel = 0;
  let currBucket = aggs[`path_level_${iterLevel}.keyword`].buckets.find(
    buck => buck.key === paths[0]
  );
  iterLevel++;
  while (iterLevel <= level - 1) {
    currBucket = currBucket[`path_level_${iterLevel}.keyword`].buckets.find(
      buck => buck.key === paths[iterLevel]
    );
    iterLevel++;
  }
  return currBucket[`path_level_${level}.keyword`].buckets.map(bucket => ({
    name: bucket.key,
    children: isFile(bucket.key) ? null : [],
    level: level + 1,
    path: `${node.path}/${bucket.key}`
  }));
};

class TreeBeardRender extends Component {
  state = {
    data: [],
    cursor: null
  };

  async componentDidMount() {
    this.setState({ loading: true });
    const { response } = await searchAPI(getDefaultQuery(0));
    if (response && response.status >= 400) {
      throw new Error("Bad response from server");
    }
    this.setState({
      data: createChildren((await response.json()).aggregations, { level: 0 }),
      loading: false
    });
  }

  onToggle = async (node, toggled) => {
    const { cursor } = this.state;
    if (cursor) cursor.active = false;
    node.active = true;
    if (node.children) {
      node.toggled = toggled;
      node.loading = true;
    }
    this.setState({ cursor: node });
    if (!node.toggled) return;
    const { response } = await searchAPI(getDefaultQuery(node.level));
    if (response && response.status >= 400) {
      throw new Error("Bad response from server");
    }
    node.loading = false;
    node.children = createChildren((await response.json()).aggregations, node);
    this.setState({ cursor: node });
  };

  render() {
    if (this.state.loading)
      return (
        <div style={{ color: "#E2C089", backgroundColor: "#20252b" }}>
          loading...
        </div>
      );
    return <Treebeard data={this.state.data} onToggle={this.onToggle} />;
  }
}

export default TreeBeardRender;
