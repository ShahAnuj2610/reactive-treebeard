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
