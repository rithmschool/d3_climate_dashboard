function getYears(data) {
  return Object.keys(data.reduce(function(prev, cur) {
    prev[cur.year] = true;
    return prev;
  }, {}));
}

function getData(year, d) {
  for (var i = 0; i < d.values.length; i++) {
    if (d.values[i].key === year) {
      return d.values[i].value.emissions;
    }
  }
  return 0;
}

function aggregateBy(key, data) {
  return d3.nest()
           .key(function(d) { return d[key]; })
           .key(function(d) { return d.year; })
           .rollup(function(dataArr) {
             var summaryStats = dataArr.reduce(function(acc, next) {
               acc.emissions += next.emissions;
               acc.population += next.emissions / next.emissionsPerCapita;
               return acc;
             }, {emissions: 0, population: 0});
             summaryStats.emissionsPerCapita = summaryStats.emissions / summaryStats.population;
             summaryStats.continent = dataArr[0].continent;
             return summaryStats;
           })
           .entries(data);
}