var barChartWidth = 300;
var barChartHeight = 300;
var barChartPadding = 30;
var barPadding = 1;

function initBarChart(data, dataType) {
  var years = getYears(data)
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

  d3.select('#bar')
    .append('g')
      .classed('y-axis', true)
      .attr('transform', 'translate(' + (barChartPadding - (barWidth + barPadding) / 2) + ', 0)');
  
  updateBarChart({}, data, dataType);
}


function updateBarChart(props, data, dataType) {
  var yScale = d3.scaleLinear()
                   .domain([0, d3.max(data, function(d) { return d[dataType]; })])
                   .range([barChartHeight - barChartPadding, barChartPadding]);
  
  var yAxis = d3.axisLeft(yScale)
              .tickFormat(d3.formatPrefix(",.0", 1e6));

  d3.select('.y-axis')
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