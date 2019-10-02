import React, { useState } from "react";
import "./App.css";
import { ReactiveBase, ReactiveComponent } from "@appbaseio/reactivesearch";
import TreeBeardRender from "./components/TreeBeardRender";
import { getDefaultQuery, getPathLevelData } from "./utils";

function App() {
  const [level, setLevel] = useState(0);
  return (
    <div className="App">
      <ReactiveBase
        app="otaras-historical-data"
        credentials="GGFMhzsXJ:78d1da1d-1e34-4e9c-9e6a-4e47361ecea6"
      >
        <ReactiveComponent
          componentId="TreeBeard"
          defaultQuery={() => getDefaultQuery(level)}
        >
          {props => {
            console.log("data", props);
            return <TreeBeardRender data={getPathLevelData(props.data)} />;
          }}
        </ReactiveComponent>
      </ReactiveBase>
    </div>
  );
}

export default App;
