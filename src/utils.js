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
