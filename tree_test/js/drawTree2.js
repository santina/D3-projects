//making associative arrays for amino acid node and link colors; 
var nodeColors = new Array();
var linkColors = new Array();

var nodeColors = function(){
  //reference: http://www.proteinstructures.com/Structure/Structure/amino-acids.html 
    var chargedAA = ["R", "K", "D", "E"];
    var polarAA = ["Q", "N", "H", "S", "T", "Y", "C", "M", "W"];
    var hydrophobic = ["A", "I", "L", "F", "V", "P", "G"]; 
    var colormap = new Array(); 

    for (var i = 0 ; i <chargedAA.length ; i++){
        colormap[chargedAA[i]] = "green"; 
    }
    for (var i = 0 ; i <polarAA.length ; i++){
        colormap[polarAA[i]] = "blue"; 
    }
    for (var i = 0 ; i <hydrophobic.length ; i++){
        colormap[hydrophobic[i]] = "purple"; 
    }
    colormap[""] = "grey";

    return colormap; 
}
nodeColors = nodeColors();

//function for coloring the links
var linkColors = function(){
    var colormap = {
        //EFFs[k].SNPEffect_Impact, //HIGH, MODERATE, LOW, MODIFIER
        HIGH : "red",
        MODERATE : "orange",
        LOW: "green",
        MODIFIER : "blue",
        //EFFs[k].SNPeffFunctional_Class , //NONE, SILENT, MISSENSE, NONSENSE
        NONSENSE : "red",
        MISSENSE : "orange",
        SILENT : "green",
        NONE: "blue"
    }
    return colormap; 
}

linkColors = linkColors();


//code based on http://bl.ocks.org/d3noob/8375092, with much modifications

var margin = {top: 10, right: 100, bottom: 10, left: 100},
    width = 1500 - margin.right - margin.left,
    height = 700 - margin.top - margin.bottom;
 
var i = 0, duration = 750;

var tree = d3.layout.tree()
    .size([height, width]);

//where you can control the orientation (for the links)
var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.x, -d.y]; });


//where you need to adjust (last line) according to the orientation 
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + 600+ ")");

var root = filteredMutationsInfo[0];
  
update(root);

d3.select(self.frameElement).style("height", "500px");

function update(source) {

  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),
	  links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 180; });

  // Update the nodes…
  var node = svg.selectAll("g.node")
	  .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
	  .attr("class", "node")
	  .attr("transform", function(d) { return "translate(" + source.x0 + "," + -source.y0 + ")"; })
	  .on("click", click);

  nodeEnter.append("circle")
	  .attr("r", 1e-6)
	  .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

    nodeEnter.append("text")
    .attr("x", 0)
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .text(function(d) { return d.name; })
    .style("fill-opacity", function(d){
        return d.name == "TreeRoot" ? 0 : 1;
    })
    .style("font-size", 11);

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
	  .duration(duration)
	  .attr("transform", function(d) { return "translate(" + d.x + "," + -d.y + ")"; });

  nodeUpdate.select("circle")
	  .attr("r", 10)
	  .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeUpdate.select("text")
	  .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
	  .duration(duration)
	  .attr("transform", function(d) { return "translate(" + source.x + "," + -source.y + ")"; })
	  .remove();

  nodeExit.select("circle")
	  .attr("r", 1e-6);

  nodeExit.select("text")
	  .style("fill-opacity", 1e-6);

  // Update the links…
  var link = svg.selectAll("path.link")
	  .data(links, function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
	  .attr("class", "link")
	  .attr("d", function(d) {
		var o = {x: source.x0, y: source.y0};
		return diagonal({source: o, target: o});
	  });

  // Transition links to their new position.
  link.transition()
	  .duration(duration)
	  .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
	  .duration(duration)
	  .attr("d", function(d) {
		var o = {x: source.x, y: source.y};
		return diagonal({source: o, target: o});
	  })
	  .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
	d.x0 = d.x;
	d.y0 = d.y;
  });
}

// Toggle children on click.
function click(d) {
  if (d.children) {
	d._children = d.children;
	d.children = null;
  } else {
	d.children = d._children;
	d._children = null;
  }
  update(d);
}