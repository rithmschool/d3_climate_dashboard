var pieChartWidth = 300;
var pieChartHeight = 300;

var innerPie = d3.pie()
                 .sort(function(a, b) {
                   if (b.key < a.key) return 1;
                   if (a.key < b.key) return -1;
                   return 0;
                 });

var outerPie = d3.pie()
            .sort(function(a, b) {
              var bCont = b.values[0].value.continent;
              var aCont = a.values[0].value.continent;
              if (bCont < aCont || bCont === aCont && b.key < a.key) return 1;
              if (aCont < bCont || aCont === bCont && a.key < b.key) return -1;
              return 0;
            });

var innerPath = d3.arc()
                  .outerRadius(pieChartWidth / 4)
                  .innerRadius(0);

var outerPath = d3.arc()
                  .outerRadius(pieChartWidth / 2)
                  .innerRadius(pieChartWidth / 4);

function initPieChart(year, continentData, regionData) {
  var colorScale = d3.scaleOrdinal()
                   .domain(continentData.map(function(c) { return c.key; }).sort())
                   .range(['#009688', '#cddc39', '#673ab7', '#795548', '#9e9e9e']);

  var innerArcs = innerPie
                    .value(getData.bind(null, year))
                    (continentData);

  var outerArcs = outerPie
                    .value(getData.bind(null, year))
                    (regionData);

  var pie = d3.select("#pie");

  pie
      .attr('width', pieChartWidth)
      .attr('height', pieChartHeight)
    .append('g')
      .attr('transform', 'translate(' + pieChartWidth / 2 + ', ' + pieChartHeight / 2 + ')')
    .selectAll('.innerarc')
    .data(innerArcs)
    .enter()
      .append('path')
      .classed('innerarc', true)
      .attr('d', innerPath)
      .attr('fill', function(d) {
        return colorScale(d.data.key)
      })
      .attr('stroke', 'black');

  pie
    .append('g')
      .attr('transform', 'translate(' + pieChartWidth / 2 + ', ' + pieChartHeight / 2 + ')')
    .selectAll('.outerarc')
    .data(outerArcs)
    .enter()
      .append('path')
      .classed('outerarc', true)
      .attr('d', outerPath)
      .attr('fill', function(d) {
        var color = colorScale(d.data.values[0].value.continent);
        return d3.color(color).brighter(2);
      })
      .attr('stroke', 'black');
}

function updatePieChart(year, continentData, regionData) {
  var newInnerArcs = innerPie
                        .value(getData.bind(null, year))
                        (continentData);
  var newOuterArcs = outerPie
                        .value(getData.bind(null, year))
                        (regionData);

  d3.selectAll('.innerarc')
    .data(newInnerArcs)
    .attr('d', innerPath);

  d3.selectAll('.outerarc')
    .data(newOuterArcs)
    .attr('d', outerPath);
}