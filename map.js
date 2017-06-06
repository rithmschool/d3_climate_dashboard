var currentCountry = null;

function initMap(topoData, data) {
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
                     // .key(function(d) { return d.year })
                     .rollup(function(arr) {
                       return arr.reduce(function(acc, next) {
                         acc.country = next.country;
                         acc.continent = next.continent;
                         acc.countryCode = next.countryCode;
                         acc.region = next.region
                         acc.years[next.year] = {
                           emissions: next.emissions,
                           emissionsPerCapita: next.emissionsPerCapita
                         }
                         return acc;
                       }, {
                         years: {}
                       });
                     })
                     .object(data);

  topoData.forEach(function(d) {
    d.properties = nestedData[d.id] || {countryCode: d.id, years: {}};
    years.forEach(function(year) {
      if (!d.properties.years[year]) {
        d.properties.years[year] = null;
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
      .on('click', function() {
        // update current country and styling
        if (currentCountry) {
          if (currentCountry.node() === this) {
            currentCountry = null;
            d3.select(this)
              .attr('stroke', 'none');
          } else {
            currentCountry
              .attr('stroke', 'none')
            currentCountry = d3.select(this);
            currentCountry
              .attr('stroke', 'dodgerblue')
              .attr('stroke-width', '2px');
          }
        } else {
          currentCountry = d3.select(this);
          currentCountry
            .attr('stroke', 'dodgerblue')
            .attr('stroke-width', '2px')
        }
        updateBarChart(currentCountry, data, currentDataType);
      });
}

function updateMap(data, year, dataType) {
  var sortedData = data.slice().sort(function(a, b) { 
    return a[dataType] - b[dataType];
  });
  var colors = ["#00ff00", 'yellow', 'orange', 'red', 'black'];
  var domains = {
    emissions: [0, 2.5e5, 1e6, 5e6, 1e7],
    emissionsPerCapita: [0, 0.5, 2, 10, 20]
  }

  var mapColorScale = d3.scaleLinear()
                        .domain(domains[dataType])
                        .range(colors);

  d3.selectAll('.country')
    .attr('fill', function(d) {
      if (d.properties.years[year]) {
        var val = d.properties.years[year][dataType];
        if (val) return mapColorScale(val);
      }
      return "#CCC"
    });
}