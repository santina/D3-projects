/* this is a temporary in which things are read from the JSON objects stored in files 
 the content of the files come from the results (with some processing) in query.js
 this is so that I can work on the drawing without having to rely on the bioportal server */



var color = d3.scale.category10();


var drawDNA = function(start, end){
	var chart = d3.select(".DNA");  // "#DNA"
	
	var DNAgraph = chart.append("svg")
    .attr("width", "100%")
    .attr("height",100); 
	
	var DNA = DNAgraph.append("rect")
	.attr("height", 30)
	.attr("y", 20)
	.attr("x", 0)
	.attr("width", 1000)  //according to the random number I put for drawTranscripts
	.attr("fill", "green")
	.attr("fill-opacity", 0.3)
	.attr("class", "DNAstrip")
	.on("mouseover", function(){
		//d3.select(this).style("fill", "red");

	})
	.on("mouseout", function(){
		//d3.select(this).style("fill", "steelblue");
	});

}

var x0,  x1;  //for scaling 

// draw transcript in <div class="inner">
var drawTranscripts = function(exonsOnEachTranscript, mutationsOnEachTranscript){ 
	var transcriptHeight = 30; 
	
	//resize the container class = "inner" 
	var numItems = Object.keys(exonsOnEachTranscript).length;
	
	var chart = d3.select(".inner")
	.style("height", transcriptHeight*(numItems+1))  
	
	// jquery equivalent: 
	// var chart = $('.inner').style("height", value);
	
	var RNAgraph = chart.append("svg")
    .attr("width", "100%")
    .attr("height", transcriptHeight*numItems); 

	var index = 1; //to be incremented as for loop goes on 
	
	var findMin = function(exonsOnEachTranscript){
		var min = Infinity; 
		for (var transcript in exonsOnEachTranscript){
			for (var exon in exonsOnEachTranscript[transcript]){ 
				if (exonsOnEachTranscript[transcript][exon]["start"] < min)
					min = exonsOnEachTranscript[transcript][exon]["start"]; 
			}
		}
		return min;
	}

	var findMax = function(exonsOnEachTranscript){
		var max = 0; 
		for (var transcript in exonsOnEachTranscript){
			for (var exon in exonsOnEachTranscript[transcript]){ 
				if (exonsOnEachTranscript[transcript][exon]["end"] > max)
					max = exonsOnEachTranscript[transcript][exon]["end"]; 
			}
		}
		return max;
	}	
	
	x0 = findMin(exonsOnEachTranscript); 
	x1 = findMax(exonsOnEachTranscript);
	//http://alignedleft.com/tutorials/d3/scales. 
	var x = d3.scale.linear()
	.domain([x0, x1])
    .range([0, 1000]); //what do I do with the range, scaled to window size? 
	
	chart.style("width", x(end-start));
	
	// need another for loop inside this 
	// first for loop goes through each transcript 
	// inner for loop goes through each axon in the transcript 
	for (var transcript in exonsOnEachTranscript){
		
		var minStartSite = Infinity; 
		var maxEndSite = 0; 
		for (var exon in exonsOnEachTranscript[transcript]){ 
		
			var currentExon = exonsOnEachTranscript[transcript][exon]; 
			var start = x(+currentExon["start"]);
			var end = x(+currentExon["end"]);
			
			if (minStartSite > start) minStartSite = start; 
			if (maxEndSite <  end) maxEndSite = end; 

			var newrec = RNAgraph.append("rect")  //must declare new variable to create new rect
			.attr("height", (transcriptHeight - 3))
			.attr("y", transcriptHeight*index)
			.attr("x", start)
			.attr("width", end - start)
			.attr("fill", "steelblue");
			
			
		}
		
		var line = RNAgraph.append("line")
		.attr("x1", minStartSite)
		.attr("y1", transcriptHeight*index + 10)
		.attr("x2", maxEndSite)
		.attr("y2", transcriptHeight*index + 10)
		.attr("stroke-width", 0.3)
		.attr("stroke", "black");
		
		var box = RNAgraph.append("rect")
		.attr("x", minStartSite)
		.attr("y", transcriptHeight*(index))
		.attr("width", maxEndSite - minStartSite )
		.attr("height", transcriptHeight-2)
		.attr("fill", "grey")
		.attr("id", transcript) //change the name 
		.attr("fill-opacity", 0)
		.on("mouseover", function(){
			d3.select(this).style("fill-opacity", 0.4);
		})
		.on("mouseout", function(){
			d3.select(this).style("fill-opacity", 0);
		})
		.on("click", function(){
			drawMutations(this.getAttribute("id"), mutationsOnEachTranscript);
			
		});
		
		index++;    
	}
}


var highlight = function (height){
	d3.selectAll("rect").each(function(){
		var height2 = +d3.select(this).attr("y");
		if (height2 == height){
			d3.select(this).style("fill", "red");
		}
	});
};

var unhighlight = function (height){
	d3.selectAll("rect").each(function(){
		var height2 = +d3.select(this).attr("y");
		if (height2 == height){
			d3.select(this).style("fill", "steelblue");
		}
	});
};


// for pop up box, tool tip

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<strong>Site:</strong> <span style='color:red'>" + d.site + "</span> \n"
    		+ "<strong>Counts:</strong> <span style='color:red'>" + d.count + "</span>";
  })


var drawMutations = function(transcript, mutationsOnEachTranscript){
	mutations = mutationsOnEachTranscript[transcript];
	
	var x = d3.scale.linear()
	.domain([x0, x1])
    .range([0, 1000]);
    
    
    var DNA = d3.select(".DNA").select("svg");
    //var DNAy = DNA.getAttribute("y"); //why doesn't this run?
    
     DNA.call(tip);

	var mutationDots = DNA.selectAll("circle").data(mutations);
	
	mutationDots.enter()
		.append("circle")
		.attr("cx", function(d) {return x(d.site); })
		.attr("cy", 20)
		.attr("r", function(d) { return d.count*5; })
		.style("fill", function(d) { return color(d.count); })
		.attr("fill-opacity", 0.8)
		.on('mouseover', tip.show) //testing tool tip
		.on('mouseout', tip.hide)
		.transition()
      		.duration(750); // doesn't seem to work 
	mutationDots.exit().transition().remove(); 
	
}

drawTranscripts(exonsOnEachTranscript, mutationsOnEachTranscript);
drawDNA(x0, x1);

