function createMap(width, height) {
  var map = d3.select('#map')
                .attr('width', width)
                .attr('height', height);

  map
    .append('text')
      .attr('x', width / 2)
      .attr('y', '1em')
      .attr('font-size', '1.5em')
      .style('text-anchor', 'middle')
      .classed('map-title', true);
}

function drawMap(geoData, climateData, year, dataType) {
  var map = d3.select('#map');
  // projection
  var projection = d3.geoMercator()
                     .scale(110)
                     .translate([
                       +map.attr('width') / 2, 
                       +map.attr('height') / 1.4
                     ]);

  var path = d3.geoPath()
               .projection(projection);

  // data
  geoData.forEach(function(d) {
    var countries = climateData.filter(row => row.countryCode === d.id);
    var name = '';
    if (countries.length > 0) name = countries[0].country;
    d.properties = countries.filter(c => c.year === year)[0] || {country: name};
  });

  var update = map
                 .selectAll('.country')
                 .data(geoData);


  // color scale
  var colors = ['#00ff00', 'yellow', 'orange', 'red', 'black'];
  
  var domains = {
    emissions: [0, 2.5e5, 1e6, 5e6, 1e7],
    emissionsPerCapita: [0, 0.5, 2, 10, 20]
  }

  var mapColorScale = d3.scaleLinear()
                        .domain(domains[dataType])
                        .range(colors);

  // update pattern
  update
    .enter()
    .append('path')
      .classed('country', true)
      .attr('d', path)
      .on('click', function() {
        var country = d3.select(this);
        var isActive = country.classed('active');
        d3.selectAll('.country').classed('active', false);
        var countryName = isActive ? '' : country.data()[0].properties.country;
        var currentDataType = d3.select('input:checked').property('value');
        drawBar(climateData, currentDataType, countryName);
        highlightBars(+d3.select("#year").property("value"));
        country.classed('active', !isActive);
      })
    .merge(update)
      .transition()
      .duration(750)
      .attr('fill', d => {
        var val = d.properties[dataType];
        return val ? mapColorScale(val) : '#ccc'
      });

  d3.select('.map-title')
      .text('Carbon dioxide ' + graphTitle(dataType) + ', ' + year); 
}

function graphTitle(str) {
  return str.replace(/[A-Z]/g, c => ' ' + c.toLowerCase());
}