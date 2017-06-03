var pieWidth = 400;
var pieHeight = 400;

d3.csv('./data/all_data.csv', function(d) {
  return {
    continent: d.Continent,
    country: d.Country,
    countryCode: d["Country Code"],
    emissions: +d["Total Emissions"],
    emissionsPerCapita: +d["Emissions Per Capita"],
    region: d.Region,
    year: +d.Year
  }
}, function(error, data) {
  if (error) throw error;

  // Pie chart stuff
  var continentAgg = aggregateBy('continent', data);
  var regionAgg = aggregateBy('region', data)
  var colorScale = d3.scaleOrdinal()
                   .domain(continentAgg.map(function(c) { return c.key; }).sort())
                   .range(['blue', 'orange', 'green', 'red', 'purple']);

  // adding inner rings
  var innerPie = d3.pie()
                   .sort(function(a, b) {
                     if (b.key < a.key) return 1;
                     if (a.key < b.key) return -1;
                     return 0;
                   });

  var innerArcs = innerPie
                    .value(getData.bind(null, d3.select('#year').attr('value')))
                    (continentAgg)

  var innerPath = d3.arc()
                    .outerRadius(pieWidth / 4)
                    .innerRadius(0);

  d3.select("#pie")
      .attr('width', pieWidth)
      .attr('height', pieHeight)
    .append('g')
      .attr('transform', 'translate(' + pieWidth / 2 + ', ' + pieHeight / 2 + ')')
    .selectAll('.innerarc')
    .data(innerArcs)
    .enter()
      .append('path')
      .classed('innerarc', true)
      .attr('d', innerPath)
      .attr('fill', function(d) {
        return colorScale(d.data.key)
      })
      .attr('stroke', 'black')

  // adding outer rings
  var outerPie = d3.pie()
                   .sort(function(a, b) {
                     var bCont = b.values[0].value.continent;
                     var aCont = a.values[0].value.continent;
                     if (bCont < aCont || bCont === aCont && b.key < a.key) return 1;
                     if (aCont < bCont || aCont === bCont && a.key < b.key) return -1;
                     return 0
                   });

  var outerArcs = outerPie
                    .value(getData.bind(null, d3.select('#year').attr('value')))
                    (regionAgg)

  var outerPath = d3.arc()
                    .outerRadius(pieWidth / 2)
                    .innerRadius(pieWidth / 4);

  d3.select("#pie")
    .append('g')
      .attr('transform', 'translate(' + pieWidth / 2 + ', ' + pieHeight / 2 + ')')
    .selectAll('.outerarc')
    .data(outerArcs)
    .enter()
      .append('path')
      .classed('outerarc', true)
      .attr('d', outerPath)
      .attr('fill', function(d) {
        return d3.color(colorScale(d.data.values[0].value.continent)).brighter(2)
      })
      .attr('stroke', 'black') 

  d3.select('input')
    .on('input', function() {
      var newInnerArcs = innerPie
                            .value(getData.bind(null, d3.event.target.value))
                            (continentAgg);
      var newOuterArcs = outerPie
                            .value(getData.bind(null, d3.event.target.value))
                            (regionAgg);
      d3.selectAll('.innerarc')
        .data(newInnerArcs)
        .attr('d', innerPath);

      d3.selectAll('.outerarc')
        .data(newOuterArcs)
        .attr('d', outerPath);
    })

});

function getData(year, d) {
  for (var i = 0; i < d.values.length; i++) {
    if (d.values[i].key === year) {
      return d.values[i].value.emissions
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