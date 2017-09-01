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

  var currentYear = +d3.select('#year')
                       .attr('value');
  var currentDataType = d3.select('input[name="data-type"]:checked')
                           .attr('value');
  var geoData = topojson.feature(mapData, mapData.objects.countries).features
  
  // Set Up visualizations
  createMap();
  createPie();
  createBar();
  drawMap(geoData, data, currentYear, currentDataType);
  drawPie(data, currentYear);
  drawBar(data, currentDataType, '');

  d3.select('#year')
    .on('input', function() {
      currentYear = +d3.event.target.value;
      drawMap(geoData, data, currentYear, currentDataType);
      drawPie(data, currentYear);
      highlightBars(currentYear);
    });

  d3.selectAll('input[name="data-type"]')
    .on('change', function() {
      var active = d3.select('.active').data()[0];
      var country = active ? active.properties.country : '';
      currentDataType = d3.event.target.value;
      drawMap(geoData, data, currentYear, currentDataType);
      drawBar(data, currentDataType, country);
    });

});

// tooltips
// more styling
