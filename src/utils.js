export function getValuesByPrefix(object = {}, prefix) {
  return Object.keys(object).reduce((arrAcc, item) => {
    if (item.startsWith(prefix)) arrAcc.push(object[item]);
    return arrAcc;
  }, []);
}

export function getPathLevelData(data = []) {
  return data.map(dataItem => {
    return getValuesByPrefix(dataItem, "path_level");
  });
}

export function isFile(fileName) {
  return fileName.indexOf(".") > -1;
}

const getPathLevelQuery = level => ({
  [`path_level_${level}.keyword`]: {
    terms: { field: `path_level_${level}.keyword` }
  }
});

export const getDefaultQuery = level => {
  let lastLevelQuery = getPathLevelQuery(level);
  level--;
  while (level >= 0) {
    const currQuery = getPathLevelQuery(level);
    currQuery[`path_level_${level}.keyword`].aggs = lastLevelQuery;
    lastLevelQuery = currQuery;
    level--;
  }
  return { size: 0, aggs: lastLevelQuery };
};

export const searchAPI = async query => {
  try {
    const response = await fetch(
      "https://scalr.api.appbase.io/otaras-historical-data/_search",
      {
        method: "post",
        body: JSON.stringify(query),
        headers: {
          authorization: `Basic ${btoa(
            "GGFMhzsXJ:78d1da1d-1e34-4e9c-9e6a-4e47361ecea6"
          )}`
        }
      }
    );
    return { response };
  } catch (e) {
    return { error: e };
  }
};
