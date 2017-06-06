var mapWidth = 600;
var mapHeight = 300;
var barChartWidth = 300;
var barChartHeight = 300;
var barChartPadding = 30;
var currentYear = d3.select('#year').attr('value');
var currentData = d3.select('input[name="data-type"]:checked').attr('value');
var currentCountry = null;

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
  var years = continentAgg[0].values.map(function(d) { return d.key; });

  initPie(currentYear, continentAgg, regionAgg)

  d3.select('#year')
    .on('input', function() {
      currentYear = d3.event.target.value;
      updatePieChart(currentYear, continentAgg, regionAgg);
      updateMap(
        d3.event.target.value,
        d3.select('input[name="data-type"]:checked').attr('value')
      );
    });

  d3.selectAll('input[name="data-type"]')
    .on('change', function() {
      updateMap(
        d3.select('#year').attr('value'),
        d3.event.target.value
      )
    });

  // map stuff
  var projection = d3.geoMercator()
    .scale(70)
    .translate([mapWidth / 2, mapHeight / 1.4]);
  var path = d3.geoPath().projection(projection);
  var topoData = topojson.feature(mapData, mapData.objects.countries).features

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
        updateBarChart(
          d.properties,
          d3.select('input[name="data-type"]:checked').attr('value') 
        );
      })
  
  updateMap(
    d3.select('#year').attr('value'),
    d3.select('input[name="data-type"]:checked').attr('value')
  )

  // bar chart
  var barPadding = 1;
  var barWidth = (barChartWidth - 2 * barChartPadding) / years.length - barPadding;

  d3.select('#bar')
      .attr('width', barChartWidth)
      .attr('height', barChartHeight)
    .selectAll('rect')
    .data(years)
    .enter()
    .append('rect')
      .attr('x', function(d, i) {
        return i * (barWidth + barPadding) + barChartPadding - (barWidth + barPadding) / 2;
      })
      .attr('width', barWidth)
      .attr('y', 0)
      .attr('height', 0)
      .attr('fill', 'lightblue');

  // bar chart x axis
  var xScale = d3.scaleLinear()
                      .domain(d3.extent(years))
                      .range([barChartPadding, barChartWidth - barChartPadding]);

  var xAxis = d3.axisBottom(xScale)
                .tickFormat(d3.format(""))

  d3.select('#bar')
    .append('g')
    .attr('transform', 'translate(0, ' + (barChartHeight - barChartPadding) + ')')
    .call(xAxis);

  updateBarChart({}, d3.select('input[name="data-type"]:checked').attr('value'))

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

  function updateBarChart(props, dataType) {
    var yScale = d3.scaleLinear()
                     .domain([0, d3.max(data, function(d) { return d[dataType]; })])
                     .range([barChartHeight - barChartPadding, barChartPadding]);
    
    var yAxis = d3.axisLeft(yScale)
                .tickFormat(d3.formatPrefix(",.0", 1e6));

    d3.select('#bar')
      .append('g')
      .attr('transform', 'translate(' + (barChartPadding - (barWidth + barPadding) / 2) + ', 0)')
      .call(yAxis);

    d3.select("#bar")
      .selectAll('rect')
      .data(Object.keys(props).map(function(year) {
        return props[year] ? props[year][0] : props[year];
      }))
      .attr('y', function(d) {
        return yScale(d ? d[dataType] : 0)
      })
      .attr('height', function(d) {
        return barChartHeight - barChartPadding - yScale(d ? d[dataType] : 0);
      });
  }

  function updateMap(year, dataType) {
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

  // debugger
});