
//============make a graph for population: horizontal========== 


//testing data 




//preparing margin 
var width = 420,
    barHeight = 20;

var x = d3.scale.linear()
    .range([0, width]);

var chart = d3.select(".chart")
	.append("svg")
    .attr("width", width + 30)
    .attr("height", barHeight*10)
    
var bar;


//reading data 
d3.tsv("./data/names.tsv", type, function(error, data) {

	//let you scale properly
  	x.domain([0, d3.max(data, function(d) { return d.value; })]);

	//the svg's height is being adjusted based on your data length. That's why chart.attr got overwritten
 	 chart.attr("height", barHeight * data.length + 50);

	//not sure what translate does 
	bar = chart.selectAll("g")
      .data(data)
    .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + (i * barHeight + 30) + ")"; });

 	 bar.append("rect")
      .attr("width", function(d) { 
      	return x(d.value); })
      .attr("height", barHeight - 1);
	
  	bar.append("text")
      .attr("x", function(d) { 
      	return x(d.value) - 3; })
      .attr("y", barHeight / 2)
      .attr("dy", ".35em")
      .text(function(d) { return d.value; });
      
      
	var line = bar.append("line")
		.attr("x1", function(d) { return x(d.value); })
		.attr("y1", 20)
		.attr("x2", function(d) { return x(d.value); })
		.attr("y2", function(d, i) { return -i * barHeight -10})
		.attr("stroke-width", 2);
		.attr("stroke", "red");
		
	var circles = bar.append("circle")
		.attr("cx", function(d) { return x(d.value); })
		.attr("cy", function(d, i) { return -i * barHeight -10})
		.attr("r", 10)
		.style("fill", "green")
		.on("mouseover", function(){
			//console.log(this);
			//console.log(d3.select(this));
			d3.select(this).style("fill", "red");
			d3.select(this).transition().attr("r", 20);
		})
		//.on("mouseover", function(){
			//anything here would overwrite the previous mouseover 
		//})
		.on("mouseout", function(){
			//console.log(this);
			//console.log(d3.select(this));
			d3.select(this).style("fill", "green");
			d3.select(this).transition().attr("r", 10);
		});
		
		
});

function type(d) {
  d.value = +d.value; // coerce to number
  return d;
}

