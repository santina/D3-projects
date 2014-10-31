
//from http://square.github.io/intro-to-d3/examples/#stacked-bars
    
var bar;

var regions = {"region1" : [[1, 3], [5,7], [10, 20]], 
			   "region2": [[2, 3], [4.5,6], [15, 20]]}

var chart = d3.select(".chart")
	.append("svg")
    .attr("width", width + 30)
    .attr("height", barHeight*10)

			   
var sales = [
  {
    name: "Hoodie",
    values: [
      { count: 6, date: "2014-01-01" },
      { count: 7, date: "2014-01-02" },
      { count: 8, date: "2014-01-03" }
    ]
  },
  {
    name: "Jacket",
    values: [
      { count: 2, date: "2014-01-01" },
      { count: 5, date: "2014-01-02" },
      { count: 7, date: "2014-01-03" }
    ]
  },
  {
    name: "Snuggie",
    values: [
      { count: 3, date: "2014-01-01" },
      { count: 2, date: "2014-01-02" },
      { count: 3, date: "2014-01-03" }
    ]
  }
];

var stack = d3.layout.stack()
  .values(function(d) { return d.values; })
  .x(function(d) { return new Date(Date.parse(d.date)); })
  .y(function(d) { return d.count; });
  

var stacked = stack(sales);

var height = 200;
var width = 200;

// we need to calculate the maximum y-value
// across all our layers, and for each data point,
// we need to combine the start `d.y0` and the
// height `d.y` to get highest point
var maxY = d3.max(stacked, function(d) {
  return d3.max(d.values, function(d) {
    return d.y0 + d.y;
  });
});

var y = d3.scale.linear()
  .range([height, 0])
  .domain([0, maxY]);

var x = d3.time.scale()
  .range([0, width])
  .domain(d3.extent(sales[0].values, function(d) {
    // normally we would check across all our layers,
    // but we can "cheat" and use `sales[0].values`
    // since we know all layers have the same domain
    return new Date(Date.parse(d.date));
  }))
  .nice(4);

var svg = d3.select('svg.stack');
var color = d3.scale.category10();

// bind a <g> tag for each layer
var layers = svg.selectAll('g.layer')
  .data(stacked, function(d) { return d.name; })
    .enter()
      .append('g')
        .attr('class', 'layer')
        .attr('fill', function(d) { return color(d.name); })

// bind a <rect> to each value inside the layer
layers.selectAll('rect')
  .data(function(d) { return d.values; })
  .enter()
    .append('rect')
      .attr('x', function(d) {return x(new Date(Date.parse(d.date))); })
      .attr('width', width / 3)
      .attr('y', function(d) {
        // remember that SVG is y-down while our graph is y-up!
        // here, we set the top-left of this bar segment
        return y(d.y0 + d.y);
      }).attr('height', function(d) {
        // since we are drawing our bar from the top downwards,
        // the length of the bar is the distance from the bottom
        // so we subtract from `height`
        return height - y(d.y)
      });