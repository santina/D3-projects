/* this is a temporary in which things are read from the JSON objects stored in files 
 the content of the files come from the results (with some processing) in query.js
 this is so that I can work on the drawing without having to rely on the bioportal server */


//class is for a group of elements, id for one specific one... will fix that later. 

var color = d3.scale.category10();


var drawDNA = function(){
	var chart = d3.select(".DNA");  // "#DNA"
	
	var DNAgraph = chart.append("svg")
    .attr("width", "1000") // change from 100% 
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
		.attr("fill-opacity", 0)
		.on("mouseover", function(){
			d3.select(this).style("fill-opacity", 0.4);
		})
		.on("mouseout", function(){
			d3.select(this).style("fill-opacity", 0);
		})
		.on("click", function(){
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


// need fix to get lollipop 
var drawMutations = function(mutations){
	//mutations = mutationsOnEachTranscript[transcript];
	
	var x = d3.scale.linear()
	.domain([x0, x1])
    .range([0, 1000]);
    
    
    var DNA = d3.select(".DNA").select("svg");
    //var DNAy = DNA.getAttribute("y"); //why doesn't this run?
    
     DNA.call(tip);

	var mutationLines = DNA.selectAll("line").data(mutations);
	
	mutationLines.enter()
		.append("line")
		.attr("x1", function(d){return x(d.site)}) 
		.attr("y1", 50)
		.attr("x2", function(d){return x(d.site)}) 
		.attr("y2", function(d) { return 50 - d.count*15; })
		.attr("stroke-width", 1)
		.attr("stroke", function(d) { return color(d.count*2); })
		.on('mouseover', tip.show) //testing tool tip
 		.on('mouseout', tip.hide);
		
	mutationLines.exit().remove();

	// for drawing circles instead 
// 	var mutationDots = DNA.selectAll("circle").data(mutations);
// 	
// 	mutationDots.enter()
// 		.append("circle")
// 		.attr("cx", function(d) {return x(d.site); })
// 		.attr("cy", 20)
// 		.attr("r", function(d) { return d.count*5; })
// 		.style("fill", function(d) { return color(d.count); })
// 		.attr("fill-opacity", 0.8)
// 		.on('mouseover', tip.show) //testing tool tip
// 		.on('mouseout', tip.hide)
// 		.transition()
//       		.duration(750); // doesn't seem to work 
// 	mutationDots.exit().transition().remove(); 
	
}

var drawSplicedRNA = function (className, exonsOnEachTranscript, mutationsOnEachTranscript){
	//drawmRNA()
	
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
			currentStartSite = currentStartSite + (d.end - d.start); 
			; return RNAscale(currentStartSite); }) 
		.attr("y1", 20)
		.attr("x2", function(d){ 
			currentStartSite2 = currentStartSite2 + (d.end - d.start); 
			; return RNAscale(currentStartSite2); }) 
		.attr("y2", 50)
		.attr("stroke-width", 1)
		.attr("stroke", "black");
		
	exonLines.exit().remove(); //works kind of weirdly. not the way i want it to.
	
	//make the inactive spliced RNA bar suddenly interactive, hinting you can click on it 
	var RNAbar = d3.select("#mRNA_spliced"); //select by ID
	RNAbar.on("mouseover", function(){
				d3.select(this).style("fill", "red");
			})
			.on("mouseout", function(){
				d3.select(this).style("fill", "rgb(148, 58, 190)");
			})
			.on("click", function(){
				console.log("make the DNA transition to show mutations on exons only");
				console.log(className);
				redrawMutations(className, exonsOnEachTranscript, mutationsOnEachTranscript);
			});
}


var redrawMutations = function(className, exonsOnEachTranscript, mutationsOnEachTranscript){
	d3.select(".DNA").select("svg").selectAll("line").remove();
	
	mutationList = mutationsOnEachTranscript[className];
	exonList = exonsOnEachTranscript[className]; 
	inRangeMutations = mutationInRange(exonList, mutationList);
	//console.log(inRangeMutations);

	
	
	//don't forget your scaling 
}

//return a boolean 
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
//drawTranscripts(exonsOnEachTranscript, mutationsOnEachTranscript);
//drawDNA(x0, x1);

