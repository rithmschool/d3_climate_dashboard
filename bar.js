var barChartWidth = 550;
var barChartHeight = 300;
var barChartPadding = {
  top: 20,
  right: 10,
  bottom: 20,
  left: 50
};
var barPadding = 1;

function initBarChart(data, dataType) {
  var years = getYears(data)
  var chartWidth = barChartWidth - barChartPadding.left - barChartPadding.right
  var barWidth = chartWidth / years.length - barPadding;
  var bar = d3.select("#bar");

  bar
      .attr('width', barChartWidth)
      .attr('height', barChartHeight)
    .selectAll('rect')
    .data(years.map(function(year) {
      return {year: year}
    }))
    .enter()
    .append('rect')
      .attr('x', function(d, i) {
        return i * (barWidth + barPadding) + barChartPadding.left;
      })
      .attr('width', barWidth)
      .attr('y', 0)
      .attr('height', 0)
      .attr('fill', 'dodgerblue');
  // bar chart x axis
  var xScale = d3.scaleLinear()
                      .domain(d3.extent(years))
                      .range([barChartPadding.left + barWidth / 2, barChartWidth - barChartPadding.right - barWidth / 2]);

  var xAxis = d3.axisBottom(xScale)
                .tickFormat(d3.format(""))

  bar
    .append('g')
      .attr('transform', 'translate(-0.5, ' + (barChartHeight - barChartPadding.bottom) + ')')
      .call(xAxis);

  bar
    .append('g')
      .classed('y-axis', true)
      .attr('transform', 'translate(' + barChartPadding.left + ', 0)');

  bar
    .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', - barChartHeight / 2)
      .attr('y', barChartPadding.left)
      .attr('dy', '-2.5em')
      .style('text-anchor', 'middle')
      .classed('y-axis-label', true);

  bar
    .append('text')
      .attr('x', barChartWidth / 2)
      .attr('y', '1em')
      .attr('font-size', '1.5em')
      .style('text-anchor', 'middle')
      .classed('bar-title', true);
  
  updateBarChart(null, data, dataType);
}

function updateBarColoring(year) {
  d3.selectAll('rect')
    .attr('fill', function(d) {
      return +d.year === +year ? 'midnightblue' : 'dodgerblue';
    })
}

function updateBarChart(country, data, dataType) {
  var axisLabel = dataType === 'emissions' ?
    "Carbon dioxide emissions, thousand metric tons" :
    "Carbon dioxide emissions, metric tons per capita";

  var barTitle = country ? 
    "Carbon Dioxide Emissions, " + country.data()[0].properties.country :
    "Click on a country to see annual trends.";

  d3.select('.y-axis-label')
    .text(axisLabel);

  d3.select('.bar-title')
    .text(barTitle);

  var yScale = d3.scaleLinear()
                   .domain([0, d3.max(data, function(d) { return d[dataType]; })])
                   .range([barChartHeight - barChartPadding.bottom, barChartPadding.top]);
  
  var units = {
    emissions: 1e6,
    emissionsPerCapita: 1
  }

  var yAxis = d3.axisLeft(yScale)
              .tickFormat(d3.formatPrefix(",.0", units[dataType]));

  d3.select('.y-axis')
    .call(yAxis);

  if (!country) {
    d3.selectAll('rect')
      .attr('y', 0)
      .attr('height', 0);
    return;
  }

  var years = country.data()[0].properties.years;

  d3.selectAll('rect')
    .data(Object.keys(years).map(function(year) {
      var obj = years[year] || {};
      obj.year = year;
      return obj;
    }))
    .attr('y', function(d) {
      return yScale(d[dataType] || 0)
    })
    .attr('height', function(d) {
      return barChartHeight - barChartPadding.bottom - yScale(d[dataType] || 0);
    });

}

