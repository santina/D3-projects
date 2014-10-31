console.log("hi");

var d = [1,2,3];
var p = d3.select("body")
	.selectAll("p")
	.data(d).enter()
	.append("p")
	//.text(function(d) {return d+2;}); 
	//anonymous function returning data bound to the DOM element 
	.text(function(d,i){ return "i: " + i + " d = " +d;});
	//this and i, i is index
	
	
//add an svg element 
/* 
var bodySelect = d3.select("body");
var svgSelect = bodySelect.append("svg").attr("width", 50).attr("height", 50); 
var circleSelect = svgSelect.append("circle")
	.attr("cx", 25)
	.attr("cy", 25)
	.attr("r", 25)
	.style("fill", "green");
	*/	
	
	

//add an SVG element, style it with bound data 
/*
var radii = [40,20,10];
var circleSpace = [30,70,100]; //can't use it :(

var container = d3.select("body").append("svg")
	.attr("width", 200)
	.attr("height", 200)
	.style("border", "1px solid black");

var circles = container.selectAll("circle")
	.data(radii)
	.enter()
	.append("circle");
	
var circleAttr = circles 
	.attr("cx", function(x){return x;})
	.attr("cy",50)
	.attr("r", function(c){return c;})
	.style("fill", function(r){  //what other style are there? can't find in API (css?)
		var color;		
		if(r == 40){color = "green";  
		} else if (r == 20){ color = "yellow";
		} else {color = "blue";}
		return color;
	});
*/

//use JSON to simply code 
//that way cx and cy don't have to be the same number 

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
var container = d3.select("body").append("svg")
	.attr("width", 200)
	.attr("height", 200)
	
var circles = container.selectAll("circle")
	.data(jsonCircles)
	.enter()
	.append("circle");	
	
var circleAttr = circles
	.attr("cx", function(d) {return d.x_axis;})
	.attr("cy", function(d) {return d.y_axis;})
	.attr("r", function(d) {return d.radius;})
	.style("fill", function(d) {return d.color;})
	
	
	
	
	
	
	