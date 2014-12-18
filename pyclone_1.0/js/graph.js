var margin = {top: 40, right: 40, bottom: 40, left: 40},
    width = 600 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

///////check if they work/////////////////
//from http://bl.ocks.org/biovisualize/1016860
var tooltip = d3.select("body")
	.append("div")
	.style("position", "absolute")
	.style("z-index", "10")
	.style("visibility", "hidden")
	.text("a simple tooltip"); 
	
//http://bl.ocks.org/Caged/6476579
var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<strong>Frequency:</strong> <span style='color:red'>" + d.frequency + "</span>";
  });
///////////////////////////////////////

d3.tsv("./data/results.tsv", function(error, data) {
    // Convert each data point from a string into a number
    data.forEach(function (d) {
        d["FL1004T1_AMP01"]     = +d["FL1004T1_AMP01"];
        d["FL1004T1_AMP01_std"] = +d["FL1004T1_AMP01_std"];
        d["FL1004T2_AMP01"]     = +d["FL1004T2_AMP01"];
        d["FL1004T2_AMP01_std"] = +d["FL1004T2_AMP01_std"];
    });

    // Go through the array, get the min and max values of 
    // `FL1004T1_AMP01` and then create a scale from that.
    // `.nice()` just rounds it to a nice value.
    x.domain(d3.extent(data, function (d) {
        return d["FL1004T1_AMP01"];
    })).nice();

    // Same but with the y-axis and the other set of data.
    y.domain(d3.extent(data, function (d) {
        return d["FL1004T2_AMP01"];
    })).nice();  //make it even number 

	//draw the axis 
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
    .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("T1 Mutation Cellular Frequency");
	//draw the y axis 
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
    .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("T2 Mutation Cellular Frequency");
        
	//draw the dots and appropriately locate them 
    svg.selectAll(".dot")
        .data(data)
    .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        // Set the position of x by running the function 
        // on each value of the data.
        .attr("cx", function(d) { return x(d["FL1004T1_AMP01"]); })
        // Set the position of y by running the function 
        // on each value of the data.
        .attr("cy", function(d) { return y(d["FL1004T2_AMP01"]); }) //d.variable, d["name"]
        .style("fill", function(d) { return color(d["cluster_id"]); })
        .on("mouseover", function(d){
        	//d.attr("fill", "red");  //how do I make it change color??? 
        	//console.log(d3.select(d3.event.target));
        	
        	var positionOfSVG = $('svg').position();
        	//console.log(positionOfSVG);
        	
        	//somehow d3.event.target gets the specific dot.... 
        	d3.select(d3.event.target).style("fill", "red");
        	d3.select("infoBox").style("display", "block");
			d3.select("p").text(d["mutation"] );
			$(".infoBox")
			
			$("#popup").show();
			$("#popup").text(d["mutation"] );
			$("#popup").css("top", (y(d["FL1004T2_AMP01"]) + positionOfSVG.top) + "px");
			$("#popup").css("left", (x(d["FL1004T1_AMP01"])+ positionOfSVG.left) + "px");
			
			//now how do I make the box disappear ? 
			})
		//moving your mouse away makes the dots return to their original colors 	
        .on("mouseout", function(d){
        	d3.select(d3.event.target).style("fill",color(d["cluster_id"]));
        	$("#popup").hide(); 
		})
		.call(tip);
});


//=========================

/*TO DO LIST : 
- Figure out showing the text bubble label 
	- tipsy? or whatever that library is called 
- Hover over will change color
- Color opacity to decrease the look of over clustering 
- (omg) maybe select a certain region and graph will zoom into that ? 

*/