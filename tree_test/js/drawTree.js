

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
 
var i = 0;

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

root = filteredMutationsInfo[0];
  


var update = function(source){

  // Compute the new tree layout.
    var nodes = tree.nodes(source).reverse(),
        links = tree.links(nodes);

var j = 0; 
  
    //set position of nodes 
    nodes.forEach(function(d, i) {
        if (d.level == "levelOneNodes"){
            if(j%2 == 0){
                d.y = d.depth * 190;
            }
            else{
                d.y = d.depth * 220;
            }
            j++;
        }
        else{
            d.y = d.depth*190;
            
        }
    });


  // Declare the nodes¦
    var node = svg.selectAll("g.node")
        .data(nodes, function(d) { return d.id || (d.id = ++i); });

    //where you can control the orientation (for nodes)
    // Enter the nodes. 
    // the part I need to alter if I want to change the position of the nodes? 
    var nodeEnter = node.enter().append("g")
        .attr("class", function(d){  //this allow us to select nodes of a specific layer 
            return d.level;
        })
        .attr("transform", function(d) { 
	       return "translate(" + d.x + "," + -d.y + ")"; 
        });

    nodeEnter.append("circle")
    .attr("r", 10)
    .style("fill", function(d){
        return nodeColors.hasOwnProperty(d.name) ? nodeColors[d.name] : "red"
    })
    .style("fill-opacity", function(d){
        return d.name == "TreeRoot" ? 0 : 0.6;
    });

    nodeEnter.append("text")
    .attr("x", 0)
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .text(function(d) { return d.name; })
    .style("fill-opacity", function(d){
        return d.name == "TreeRoot" ? 0 : 1;
    })
    .style("font-size", 11);

  // Declare the links¦
    var link = svg.selectAll("path.link")
        .data(links, function(d) { return d.target.id; });

  // Enter the links.
    link.enter().insert("path", "g")
    .attr("class", "link")
    .style("stroke", function(d){
        return linkColors.hasOwnProperty(d.target.impact) ? linkColors[d.target.impact] : "black";
    })
    .style("stroke-width", function(d){
        return d.target.level == "levelOneNodes" ? 1 : 1; 
        //make the lines from root to layer 1 disappear
    })
    .attr("d", diagonal);

} 
update(root);



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



