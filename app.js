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
  // Get GeoJSON data
  var currentYear = +d3.select('#year')
                       .attr('value');
  var currentDataType = d3.select('input[name="data-type"]:checked')
                           .attr('value');
  var geoData = topojson.feature(mapData, mapData.objects.countries).features
  
  // Set Up map
  createMap();
  drawMap(geoData, data, currentYear, currentDataType);

  // Draw pie chart
  createPie();
  drawPie(data, currentYear);

  // Draw bar chart
  // Add Event Listeners
  
  // var continentAgg = aggregateBy('continent', data);
  // var regionAgg = aggregateBy('region', data)
  // initPieChart(currentYear, continentAgg, regionAgg);
  // initMap(geoData, data);
  // updateMap(data, currentYear, currentDataType);
  // initBarChart(data, currentDataType);
  // updateBarColoring(currentYear);
  // debugger
  d3.select('#year')
    .on('input', function() {
      currentYear = +d3.event.target.value;
      drawMap(geoData, data, currentYear, currentDataType);
      drawPie(data, currentYear);
      // updatePieChart(currentYear, continentAgg, regionAgg);
      // updateBarColoring(currentYear);
    });

  d3.selectAll('input[name="data-type"]')
    .on('change', function() {
      currentDataType = d3.event.target.value;
      drawMap(geoData, data, currentYear, currentDataType);
      // updateBarChart(currentCountry, data, currentDataType);
    });

});

// TODO:
// tooltips
// more styling
// add map key for colors
