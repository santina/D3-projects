
//d3.select("body").transition().style("background-color", "black");

//why doesn't this do anything?   (because your paragrpah comes after the script is loaded)
d3.select("infoBox").style("color", "red");

d3.selectAll("p").style("color", function() {
  return "hsl(" + Math.random() * 360 + ",100%,50%)";
});

d3.selectAll("p").style("color", function(d, i) {
  return i % 2 ? "#fff" : "#eee";
});


d3.selectAll("p").style("color", function() {
  return "hsl(" + Math.random() * 360 + ",100%,50%)";
});



// ===== not sure about this part ====
// Update…
var p = d3.select("body").selectAll("p")
    .data([4, 8, 15, 16, 23, 42])
    .text(String);

// Enter…
p.enter().append("p")
    .text(String);

// Exit…
p.exit().remove();


//================make a bar chart ==================

var data = [1,2,3,4];

var data2 = [
  {name: "Locke",    value:  4},
  {name: "Reyes",    value:  8},
  {name: "Ford",     value: 15},
  {name: "Jarrah",   value: 16},
  {name: "Shephard", value: 23},
  {name: "Kwon",     value: 42}
];


//for scaling, a function, use maximum point of data to determine range 
var x = d3.scale.linear()
    .domain([0, d3.max(data)])
    .range([0, d3.max(data)*40]);


//for actually making the chart 
d3.select(".chart") // .select() for something already there, .selectAll() for to add
  .selectAll("div")
    .data(data)
  .enter().append("div")
    .style("width", function(d) { return x(d) + "px"; })
    .text(function(d) { return d; });

//=============make a svg bar chart =================


// var container = d3.select(".chart").append("svg")
// 	.attr("width", 400)
// 	.attr("height", 400)
// 
// 	container.data(data)
//   .enter().append("chart")
//     .style("width", function(d) { return d * 10 + "px"; })
//     .text(function(d) { return d; });
// 		

// var data = [1,2,3,4];
// d3.select(".chart")
//   .selectAll("div")
//     .data(data)
//   .enter().append("div")
//     .style("width", function(d) { return d * 10 + "px"; })
//     .text(function(d) { return d; });

//make circles and know how to update the information 
var jsonCircles =[
	{
	"x_axis":30,
	"y_axis":30, 
	"radius":20,
	"color":"green"
	},{
	"x_axis":70,
	"y_axis":70, 
	"radius":20,
	"color":"purple"
	},{
	"x_axis":110,
	"y_axis":100, 
	"radius":20,
	"color":"red"
	}
];

var jsonCircles2 =[
	{
	"x_axis":100,
	"y_axis":20, 
	"radius":2,
	"color":"green"
	},{
	"x_axis":70,
	"y_axis":70, 
	"radius":5,
	"color":"purple"
	}
];
var container2 = d3.select("body").append("svg")
	.attr("width", 200)
	.attr("height", 200)

populateElements(jsonCircles);
var flag = 1; 

$('#press').click(function() {
	if (flag == 1) {
		populateElements(jsonCircles2);
		flag = 2;
	} 
	else {
	 	populateElements(jsonCircles);
	 	flag = 1; 
	}
});


//example of updating things: http://bl.ocks.org/mbostock/3808218
function populateElements(data) {

	var circles = container2.selectAll("circle")
		.data(data);
	
		//enter phase 
		circles.enter()
			.append("circle")
			//.attr("cx", function(d) { return d.x_axis; })
			//.attr("cy", function(d) { return d.y_axis; })
			//.attr("r", 2.5);
		
		//update phase: update the circles w new attributes  
		circles.attr("cx", function(d) { return d.x_axis; })
			.attr("cy", function(d) { return d.y_axis; })
			.attr("r", function(d) { return d.radius; });
		
		//exit phase : remove the extra circles 
		//without this line the third circle will still be there
		circles.exit().remove(); 

}


// var circles = container2.selectAll("circle")
// 	.data(jsonCircles2);
// 	console.log(circles.enter());
// 	circles.enter()
// 		.append("circle")
// 		.attr("cx", function(d) { return d.x_axis; })
// 		.attr("cy", function(d) { return d.y_axis; })
// 		.attr("r", 2.5);
// 	circles.exit().remove();


// now you have reserved some space for the circles



//use var because you might want to use it later? (like with circles and container)
// var circleAttr = circles
// 	.attr("cx", function(d) {return d.x_axis;})
// 	.attr("cy", function(d) {return d.y_axis;})
// 	.attr("r", function(d) {return d.radius;})
// 	.style("fill", function(d) {return d.color;})
	

var body = d3.select("body");
var div = body.append("div");
div.html("Hello, world!");


    
//does nothing because you don't have "section, though I thought you could do that?" 
var section = d3.select("body");
var div = section.append("div");
div.html("Hello, world again!");

d3.select("body")
  .append("p")
    .attr("class", "special")
    .html("Hello, world!");
    
var dataCircle = [{"x": 1.0, "y": 1.1}, {"x": 2.0, "y": 2.5}]

// //work flow for adding something after selecting thing that doesn't exist yet
// svg.selectAll("circle")
//     .data(dataCircle)
//   .enter().append("circle")
//     .attr("cx", function(d) { return d.x; })
//     .attr("cy", function(d) { return d.y; })
//     .attr("r", 2.5);







	