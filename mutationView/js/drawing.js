/* this is where everything is drawn. Also can be modified, together with html, to read JSON objects stored in files 
 the content of the files come from the results (with some processing) in query.js
 this is so that I can work on the drawing without having to rely on the cbioportal server */


//class is for a group of elements, id for one specific one... will fix that later. 

var color = d3.scale.category10();


var drawDNA = function(){
	var chart = d3.select(".DNA");  // "#DNA"
	
	var DNAgraph = chart.append("svg")
    .attr("width", "1000") // change from 100% 
    .attr("height",300); 
	
	var DNA = DNAgraph.append("rect")
	.attr("height", 200)
	.attr("y", 20)
	.attr("x", 0)
	.attr("width", 1000)  //according to the random number I put for drawTranscripts
	.attr("fill", "green")
	.attr("fill-opacity", 0.3)
	.attr("class", "DNAstrip")
	.on("mouseover", function(){
		
	})
	.on("mouseout", function(){
		
	});


}

var drawmRNA = function(){
	var chart = d3.select(".mRNA");  
	
	var RNAgraph = chart.append("svg")
    .attr("width", "1000")
    .attr("height",100); 
	
	var mRNA = RNAgraph.append("rect")
	.attr("height", 30)
	.attr("y", 20)
	.attr("x", 0)
	.attr("width", 1000)  //according to the random number I put for drawTranscripts
	.attr("fill", "rgb(148, 58, 190)")
	.attr("fill-opacity", 0.5)
	.attr("id", "mRNA_spliced");

}

var x0,  x1;  //for scaling, they're the earliest start of an exon and further end of another exon

// draw transcript in <div class="inner"> and also set x0 and x1 
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
    .range([0, 1000]); //what do I do with the range? scaled to window size? 
	
	chart.style("width", x(end-start));
	
	// need another for loop inside this 
	// first for loop goes through each transcript 
	// inner for loop goes through each axon in the transcript 
	for (var transcript in exonsOnEachTranscript){
		var minStartSite = Infinity; 
		var maxEndSite = 0; 
		
	//this part finds the start/end of the grey box that will act as a highlighting effect 
		for (var exon in exonsOnEachTranscript[transcript]){ 
		
			var currentExon = exonsOnEachTranscript[transcript][exon]; 
			var start = x(+currentExon["start"]);
			var end = x(+currentExon["end"]);
			
			if (minStartSite > start) minStartSite = start; 
			if (maxEndSite <  end) maxEndSite = end; 
// 			// the old code draws the exons here 
// 			var newrec = RNAgraph.append("rect")  //must declare new variable to create new rect
// 			.attr("height", (transcriptHeight - 3))
// 			.attr("y", transcriptHeight*index)
// 			.attr("x", start)
// 			.attr("width", end - start)
// 			.attr("fill", "steelblue");
// 			
			
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
		.attr("class", "highlightrect")
		.attr("fill-opacity", 0)
		.on("mouseover", function(){
		})
		.on("mouseout", function(){
		})
		.on("click", function(){
			RNAgraph.selectAll(".highlightrect").classed("highlightrect-active", false);
			d3.select(this).classed("highlightrect-active", true);
			drawMutations(mutationsOnEachTranscript[this.getAttribute("id")]);
			drawSplicedRNA(this.getAttribute("id"), exonsOnEachTranscript, mutationsOnEachTranscript); 
		});
		
		
	//this part goes through the same loop again, but this time it draws the blue exons		
		for (var exon in exonsOnEachTranscript[transcript]){
			var currentExon = exonsOnEachTranscript[transcript][exon]; 
			var start = x(+currentExon["start"]);
			var end = x(+currentExon["end"]);
		
		
			var newrec = RNAgraph.append("rect")  //must declare new variable to create new rect
			.attr("height", (transcriptHeight - 3))
			.attr("y", transcriptHeight*index)
			.attr("x", start)
			.attr("width", end - start)
			.attr("fill", "steelblue")
			.attr("class", transcript)
			.on("mouseover", function(){
				d3.select(this).style("fill", "red");
			})
			.on("mouseout", function(){
				d3.select(this).style("fill", "steelblue");
			})
		}
	
	
	//We have two for loops inside this one big for loop because 
	// I don't want the highlight to cover up the exons
		
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


// for pop up box on mutation on DNA, tool tip
var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<strong>Site:</strong> <span style='color:red'>" + d.site + "</span> \n"
    		+ "<strong>Counts:</strong> <span style='color:red'>" + d.count + "</span>";
  })
  

function endall(transition, callback) { 
    var n = 0; 
    transition 
        .each(function() { ++n; }) 
        .each("end", function() { if (!--n) callback.apply(this, arguments); }); 
  } 


// need fix to get lollipop 
var drawMutations = function(mutations){
	//mutations = mutationsOnEachTranscript[transcript];
	
	var x = d3.scale.linear()
	.domain([x0, x1])
    .range([0, 1000]);
    
    
    var DNA = d3.select(".DNA").select("svg");
	
	
	//DNA.selectAll(".scaledMutationLine").remove();
	if (!DNA.selectAll(".scaledMutationLine").empty()) {
		DNA.selectAll(".scaledMutationLine").transition().duration(750).attr("y2", 50).call(endall, function() {
			DNA.selectAll(".scaledMutationLine").remove();
		
			//can't figure out a way to add transition to this without messing up the new mutation lines
	

	
			 DNA.call(tip);

			var mutationLines = DNA.selectAll("line").data(mutations);
	
			mutationLines.enter()
				.append("line")
				.attr("x1", function(d){return x(d.site)}) 
				.attr("y1", 50)
				.attr("x2", function(d){return x(d.site)}) 
				.attr("y2", 50)
				.attr("class", "mutationLines")
				.attr("stroke-width", 1)
				.attr("stroke", function(d) { return color(d.count*2); })
				.on('mouseover', tip.show) //testing tool tip
				.on('mouseout', tip.hide)
				.transition()
					.duration(1000)
					.attr("y2", function(d) { return 50 - d.count*15; });
		
			mutationLines.exit().transition()
								.duration(1000)
								.attr("y2", 50)
								.remove();
		});
	
 	} else {
 		
	
		 DNA.call(tip);

		var mutationLines = DNA.selectAll("line").data(mutations);
	
		mutationLines.enter()
			.append("line")
			.attr("x1", function(d){return x(d.site)}) 
			.attr("y1", 50)
			.attr("x2", function(d){return x(d.site)}) 
			.attr("y2", 50)
			.attr("class", "mutationLines")
			.attr("stroke-width", 1)
			.attr("stroke", function(d) { return color(d.count*2); })
			.on('mouseover', tip.show) //testing tool tip
			.on('mouseout', tip.hide)
			.transition()
				.duration(1000)
				.attr("y2", function(d) { return 50 - d.count*15; });
		
		mutationLines.exit().transition()
							.duration(1000)
							.attr("y2", 50)
							.remove();

 	}
	
}



/* store what index in the spliceRNA bar is matched to what position (actual number) of exon
this would help us map the mutations in exons correctly as we expand them on the DNA bar*/
var indexMatchArray = [];  

var drawSplicedRNA = function (className, exonsOnEachTranscript, mutationsOnEachTranscript){
	//drawmRNA()
	
	var indicesMatch = []; 
		
	//makeshift solution. still don't understand why exit() doesn't work. 
	d3.select(".mRNA").select("svg").selectAll("line").remove(); 
	
	var exonsList = exonsOnEachTranscript[className]; 
	var totalTranscriptLength = 0;
	
	for (exon in exonsList){
		totalTranscriptLength += (exonsList[exon]["end"] - exonsList[exon]["start"])
	}
	var RNAscale = d3.scale.linear()
	.domain([0, totalTranscriptLength])
    .range([0, 1000]);
	
	
	// to make it easier, we sort the exons by their start sites first 
	// and then we draw the boundaries
	exonsList.sort(function(a, b){return a["start"]-b["start"];}) //increasing 
	var currentStartSite = 0, currentStartSite2 = 0; 
	
	
	var exons = d3.select(".mRNA").select("svg");
	var exonLines = exons.selectAll("line").data(exonsList);
	exonLines.enter()
		.append("line")
		.attr("x1",function(d){ 
			indicesMatch.push([RNAscale(currentStartSite), d.start]);
			currentStartSite = currentStartSite + (d.end - d.start); 
			indicesMatch.push([RNAscale(currentStartSite), d.end]);
			return RNAscale(currentStartSite); }) 
		.attr("y1", 20)
		.attr("x2", function(d){ 
			currentStartSite2 = currentStartSite2 + (d.end - d.start); 
			return RNAscale(currentStartSite2); }) 
		.attr("y2", 50)
		.attr("stroke-width", 1)
		.attr("stroke", "black")
		.attr("opacity", 0)
		.transition()
			.duration(750)
			.attr("opacity", 0.9);
		
	exonLines.exit().transition()
			.duration(750)
			.attr("opacity", 0)
			.remove(); //works kind of weirdly. not the way i want it to.
	
	//make the inactive spliced RNA bar suddenly interactive, hinting you can click on it 
	var RNAbar = d3.select("#mRNA_spliced"); //select by ID
	RNAbar.on("mouseover", function(){
				d3.select(this).style("fill", "red");
			})
			.on("mouseout", function(){
				d3.select(this).style("fill", "rgb(148, 58, 190)");
			})
			.on("click", function(){
				console.log(className);
				redrawMutations(className, exonsOnEachTranscript, mutationsOnEachTranscript);
				redrawMutations2();
			});
			
	
	indexMatchArray = indicesMatch; //set global variable, so that we can use it in redrawMutation()
}


var redrawMutations = function(className, exonsOnEachTranscript, mutationsOnEachTranscript){
	
	var DNA = d3.select(".DNA").select("svg");
	DNA.selectAll("line").remove();
	DNA.call(tip);
	
	mutationList = mutationsOnEachTranscript[className];
	exonList = exonsOnEachTranscript[className]; 
	inRangeMutations = mutationInRange(exonList, mutationList);
	//console.log(inRangeMutations);
	//some crazy loop goes here 
	
	for (mutation in inRangeMutations){
		var position; //scaled/mutated position of the mutation on DNA bar
		for (i in indexMatchArray){
			var m = inRangeMutations[mutation];
			if (indexMatchArray[i][1] > m.site){
				position = m.site - indexMatchArray[i-1][1] + indexMatchArray[i-1][0];
				m.position = position; 
				break;
			}
		}
	
	}
	var mutationLines = DNA.selectAll("line").data(inRangeMutations);
	
	mutationLines.enter()
		.append("line")
		.attr("x1", function(d){return d.position;}) 
		.attr("y1", 50)
		.attr("x2", function(d){return d.position;}) 
		.attr("y2", function(d) { return 50 - d.count*15; })
		.attr("stroke-width", 2)
		.attr("stroke", function(d) { return color(d.count*2); })
		.attr("class", "scaledMutationLine")
		.on('mouseover', function(d){
			tip.show 
			DNA.append("circle")
			.attr("cx", d.position )
			.attr("cy", (50 - d.count*15))
			.attr("r",  d.count*5 )
			.style("fill",  color(d.count) )
			.attr("fill-opacity", 0.8);

		})
 		.on('mouseout', function(d){
			tip.hide 
			DNA.selectAll("circle").remove();

		})
		
	mutationLines.exit().remove();
	
}

var redrawMutations2 = function(){

	d3.select(".DNA").select("svg").selectAll("line").each(function (d,i) {
		var position = d3.select(this).attr("x1");
		if (position > 500){
			d3.select(this).remove
		}
		else{
		
		}
	});
		

}


//this method seems to be a computationally expensive/dumb way to check things  
var mutationInRange = function(exonList, mutationList){
	var list = [];
	for(mutation in mutationList){
		if(checkInRange(exonList, mutationList[mutation])){
			list.push(mutationList[mutation]);
		}
	}
	return list; 
		
}

var checkInRange = function(exonList, mutation){
	var inRange = false; 
	for(exon in exonList){
		if (mutation.site > exonList[exon].start && mutation.site < exonList[exon].end)
			inRange = true; 
	}
	
	return inRange; 
}

//enable those two if you want to run this without accessing cbioportal 
// also fix the html to include the .js files in /data
//drawTranscripts(exonsOnEachTranscript, mutationsOnEachTranscript);
//drawDNA(x0, x1);

