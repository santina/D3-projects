var regions = {"region1" : [[1, 3], [5,7], [10, 20]], 
			   "region2": [[2, 3], [4.5,6], [15, 20]]};
var region1 = [[2, 3], [4.5,6], [15, 20]]; 

var domains = 
[
	[[1, 3], [5,7], [10, 20]],
	[[2, 3], [5,7], [10, 19]],
	[[2, 3], [4.5,6], [15, 20]]
]; 

var width = 420,
    barHeight = 20;

//this is a function 
var x = d3.scale.linear()
    .range([0, width]);

var chart = d3.select(".chart")
	.append("svg")
    .attr("width", width + 30)
    .attr("height", barHeight*10); 
    
var bar;

x.domain([0, 16]); 

//idk how to use d3.max 
//x.domain([0, d3.max(region1, function(d, i) { return d.region1[i][2]; })]);


//the svg's height is being adjusted based on your data length. That's why chart.attr got overwritten
chart.attr("height", barHeight * (domains.length + 10) + 50);

      //.attr("transform", function(d, i) { return "translate(0," + (i * barHeight + 30) + ")"; });


// 	//hopefully d gives access to each row and i would be each element in each row
// bar.append("rect")
//  	.attr("y", function(d,i){
//  		return d[i][0];} )
//    	.attr("width", function(d, i) { 
//    		return (d[i][1] - d[i][0]); })
//    	.attr("height", (barHeight - 1));
//    	

// function draw (element, index, array){
// 	rectangle = bar.append("rect")
// 	.attri("height", barHeight) 
// 	.attri("y", 


//can't think of a smarter way
for (var index = 0; index < domains.length; index ++){
 	
	bar = chart.append("g");
	
	for (var i = 0; i < domains[index].length; i++){
	
		var newrec = bar.append("rect")  //must declare new variable to create new rect
		.attr("height", (barHeight - 1))
		.attr("y", barHeight*(index+1))
 		.attr("x", x(domains[index][i][0] ))
   		.attr("width", x(domains[index][i][1] - domains[index][i][0] ))
		.on("mouseover", function(){
			d3.select(this).style("fill", "red");
			var x1 = +d3.select(this).attr("x"); 
			var x2 = +d3.select(this).attr("x") + +d3.select(this).attr("width");
			var y  = +d3.select(this).attr("y");
			
			highlight(x1, x2, y);
		})
		.on("mouseout", function(){
			unhighlight();
		});
   	
   	}
}



var highlight = function(x1, x2, y){
	d3.selectAll("rect").each(function(){
	
		var x3 = +d3.select(this).attr("x"); 
		var x4 = +d3.select(this).attr("x") + +d3.select(this).attr("width");
		var y2  = +d3.select(this).attr("y");
		
		if((x1 >= x3 && x1 <= x4 && y2 < y) || (x2 >= x3 && x2 <= x4 && y2 < y)){
			//console.log("x3: " +x3 + "; x4: " +x4+ "; y2: " + y2); 
			//console.log("x1: " +x1 + "; x2: " +x2+ "; y: " + y2); 
			
			//lesson learned: just coerce everything to a number 
			d3.select(this).style("fill", "yellow");
		}
	});
};

var unhighlight = function(){
	d3.selectAll("rect").each(function(){
		d3.select(this).style("fill", "steelblue");
	});
}


// var line = chart.append("line")
// 	.attr("x1", 42)
// 	.attr("x2", 42)
// 	.attr("y1", 90) 
// 	.attr("y2", 60) 
// 	.attr("stroke-width", 5) 
// 	.attr("stroke", "red");


