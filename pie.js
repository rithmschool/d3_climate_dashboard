function createPie(width, height) {
  var pie = d3.select('#pie')
              .attr('width', width)
              .attr('height', height);

  pie.append('g')
      .attr('transform', 'translate(' + width / 2 + ', ' + (height / 2 + 10) + ')')
      .classed('chart', true);

  pie.append('text')
      .attr('x', width / 2)
      .attr('y', '1em')
      .attr('font-size', '1.5em')
      .style('text-anchor', 'middle')
      .classed('pie-title', true);
}

function drawPie(data, currentYear) {
  var pie = d3.select('#pie');

  // path functions
  var arcs = d3.pie()
                   .sort(function(a, b) {
                     if (a.continent < b.continent) return -1;
                     if (a.continent > b.continent) return 1;
                     return a.emissions - b.emissions;
                   })
                   .value(d => d.emissions);

  var path = d3.arc()
                    .outerRadius(+pie.attr('height') / 2 - 20)
                    .innerRadius(0);

  // data
  var yearData = data.filter(d => d.year === currentYear);
  var continents = [];
  for (var i = 0; i < yearData.length; i++) {
    var continent = yearData[i].continent;
    if (continents.indexOf(continent) === -1) {
      continents.push(continent);
    }
  }

  // color scale 
  var colorScale = d3.scaleOrdinal()
                   .domain(continents)
                   .range(['#00ffff', '#ffff74', '#d276ff', '#f7ad93', '#c9c9c9']);

  // update pattern
  var update = pie
                .select('.chart')
                .selectAll('.arc')
                .data(arcs(yearData));

  update
    .exit()
    .remove();

  update  
    .enter()
      .append('path')
      .classed('arc', true)
      .attr('stroke', 'black')
    .merge(update)
      .attr('fill', d => colorScale(d.data.continent))
      .attr('d', path)

  pie.select('.pie-title')
      .text('Total emissions by continent and region, ' + currentYear);

}
