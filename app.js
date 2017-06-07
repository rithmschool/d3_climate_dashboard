var currentYear = d3.select('#year').attr('value');
var currentDataType = d3.select('input[name="data-type"]:checked').attr('value');

d3.queue()
  .defer(d3.json, '//unpkg.com/world-atlas@1.1.4/world/50m.json')
  .defer(d3.csv, './data/all_data.csv', function(d) {
    return {
      continent: d.Continent,
      country: d.Country,
      countryCode: d['Country Code'],
      emissions: +d['Total Emissions'],
      emissionsPerCapita: +d['Emissions Per Capita'],
      region: d.Region,
      year: +d.Year
    }
  })
  .await(function (error, mapData, data) {
  if (error) throw error;

  // Pie chart stuff
  var continentAgg = aggregateBy('continent', data);
  var regionAgg = aggregateBy('region', data)
  var topoData = topojson.feature(mapData, mapData.objects.countries).features

  initPieChart(currentYear, continentAgg, regionAgg);
  initMap(topoData, data);
  updateMap(data, currentYear, currentDataType);
  initBarChart(data, currentDataType);
  updateBarColoring(currentYear);

  d3.select('#year')
    .on('input', function() {
      currentYear = d3.event.target.value;
      updatePieChart(currentYear, continentAgg, regionAgg);
      updateMap(data, currentYear, currentDataType);
      updateBarColoring(currentYear);
    });

  d3.selectAll('input[name="data-type"]')
    .on('change', function() {
      currentDataType = d3.event.target.value;
      updateMap(data, currentYear, currentDataType);
      updateBarChart(currentCountry, data, currentDataType);
    });

  // // TEXT LABELS
  // d3.select('svg')
  //   .append('text')
  //   .attr('x', width / 2)
  //   .attr('y', height - padding)
  //   .attr('dy', '2em')
  //   .style('text-anchor', 'middle')
  //   .text('Release Date');

  // d3.select('svg')
  //   .append('text')
  //   .attr('transform', 'rotate(-90)')
  //   .attr('x', - height / 2)
  //   .attr('y', padding)
  //   .attr('dy', '-2em')
  //   .style('text-anchor', 'middle')
  //   .text('Gross Revenue, North America');

  // debugger
});

// TODO:
// labels + axes
// tooltips
// more styling
// add map key for colors
