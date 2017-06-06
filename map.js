function initMap(topoData, data, currentYear, currentDataType) {
  var mapWidth = 600;
  var mapHeight = 300;
  var projection = d3.geoMercator()
    .scale(70)
    .translate([mapWidth / 2, mapHeight / 1.4]);
  var path = d3.geoPath().projection(projection);
  var years = getYears(data);

  // put data inside of map
  var nestedData = d3.nest()
                     .key(function(d) { return d.countryCode })
                     .key(function(d) { return d.year })
                     .object(data);

  topoData.forEach(function(d) {
    d.properties = nestedData[d.id] || {};
    years.forEach(function(year) {
      if (!d.properties[year]) {
        d.properties[year] = null;
      }
    })
  });

  d3.select('#map')
      .attr('width', mapWidth)
      .attr('height', mapHeight)
    .selectAll('.country')
    .data(topoData)
    .enter()
      .append('path')
      .classed('country', true)
      .attr('d', path)
      .on('click', function(d) {
        updateBarChart(d.properties, data, currentDataType);
      });

  updateMap(data, currentYear, currentDataType);
}

function updateMap(data, year, dataType) {
  var sortedData = data.slice().sort(function(a, b) { 
    return a[dataType] - b[dataType];
  });
  var colors = ["#00ff00", 'yellow', 'red', 'black'];
  var domain = d3.range(colors.length - 1)
                .map(function(d) {
                  var idx = Math.floor(data.length / colors.length * d)
                  return sortedData[idx][dataType];
                })
                .concat(sortedData[sortedData.length - 1][dataType]);

  var mapColorScale = d3.scaleLinear()
                        .domain(domain)
                        .range(colors);

  d3.selectAll('.country')
    .attr('fill', function(d) {
      if (d.properties && d.properties[year]) {
        var val = d.properties[year][0][dataType];
        if (val) return mapColorScale(val);
      }
      return "#CCC"
    });
}