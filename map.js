var currentCountry = null;

function createMap() {
  var width = 780;
  var height = 600;

  var map = d3.select("#map")
                .attr("width", width)
                .attr("height", height);

  map
    .append('text')
      .attr('x', width / 2)
      .attr('y', '1em')
      .attr('font-size', '1.5em')
      .style('text-anchor', 'middle')
      .classed('map-title', true);
}

function drawMap(geoData, climateData, year, dataType) {
  var map = d3.select("#map");
  // projection
  var projection = d3.geoMercator()
                     .scale(130)
                     .translate([
                       +map.attr("width") / 2, 
                       +map.attr("height") / 1.4
                     ]);

  var path = d3.geoPath()
               .projection(projection);

  // color scale
  var colors = ["#00ff00", 'yellow', 'orange', 'red', 'black'];
  // data
  geoData.forEach(function(d) {
    var countries = climateData.filter(row => row.countryCode === d.id);
    d.properties = countries.filter(c => c.year === year)[0] || {};
  });

  var update = map
                 .selectAll(".country")
                 .data(geoData);
  
  var domains = {
    emissions: [0, 2.5e5, 1e6, 5e6, 1e7],
    emissionsPerCapita: [0, 0.5, 2, 10, 20]
  }

  var mapColorScale = d3.scaleLinear()
                        .domain(domains[dataType])
                        .range(colors);

  update
    .enter()
    .append('path')
    .classed('country', true)
    .attr('d', path)
    .on('click', function() {
      // ADD EVENT LISTENER
      // update current country and styling
      // if (currentCountry) {
      //   if (currentCountry.node() === this) {
      //     currentCountry = null;
      //     d3.select(this)
      //       .attr('stroke', 'none');
      //   } else {
      //     currentCountry
      //       .attr('stroke', 'none')
      //     currentCountry = d3.select(this);
      //     currentCountry
      //       .attr('stroke', 'dodgerblue')
      //       .attr('stroke-width', '2px');
      //   }
      // } else {
      //   currentCountry = d3.select(this);
      //   currentCountry
      //     .attr('stroke', 'dodgerblue')
      //     .attr('stroke-width', '2px')
      // }
      // updateBarChart(currentCountry, data, currentDataType);
    })
  .merge(update)
    .transition()
    .duration(750)
    .attr("fill", d => {
      var val = d.properties[dataType];
      return val ? mapColorScale(val) : "#ccc"
    });
  
  d3.select('.map-title')
      .text("Carbon dioxide " + graphTitle(dataType) + ", " + year); 
}