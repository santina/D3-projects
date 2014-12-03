/* this is where everything is drawn. Also can be modified, together with html, to read JSON objects stored in files 
 the content of the files come from the results (with some processing) in query.js
 this is so that I can work on the drawing without having to rely on the cbioportal server */


//class is for a group of elements, id for one specific one... will fix that later. 

var color = d3.scale.category10();


var drawDNA = function(){
	var chart = d3.select(".DNA");  
	
	var DNAgraph = chart.append("svg")
    .attr("width", "1000") // change from 100% 
    .attr("height",300); 
	
	var DNA = DNAgraph.append("rect")
	.attr("height", 30)
	.attr("y", 70)
	.attr("x", 0)
	.attr("width", 1000)  //according to the random number I put for drawTranscripts
	.attr("fill", "green")
	.attr("fill-opacity", 0.3)
	.attr("class", "DNAstrip");

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
	.attr("id", "mRNA_spliced")
	.on("click", function(){
		d3.select(this).classed("hoverActive", false);
	});

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
			drawMutations(this.getAttribute("id"));
			drawSplicedRNA(this.getAttribute("id"), exonsOnEachTranscript, mutationsOnEachTranscript);
			
			//reset behaviour of mRNA bar
			d3.select("#mRNA_spliced").classed("hoverActive", true);
			d3.select("#mRNA_spliced").style("fill", "purple");
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
	
	
	// We have two for loops inside this one big for loop because 
	// I don't want the highlight to cover up the exons
		
		index++;    
	}
}


// for pop up box on mutation on DNA, tool tip
var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<strong>Site:</strong> <span style='color:red'>" + d.site + "</span> \n"
    		+ "<strong>Counts:</strong> <span style='color:red'>" + d.count + "</span>";
  })
  

// for finishing current transition before moving onto the next one. 
// copied from stackoverflow so not exactly sure how it works
function endall(transition, callback) { 
    var n = 0; 
    transition 
        .each(function() { ++n; }) 
        .each("end", function() { if (!--n) callback.apply(this, arguments); }); 
  }


var drawMutations = function(transcriptID){
	mutations = transcriptMutationList[transcriptID]; //transcriptMutationList : global variable frmo query.js
	
	var x = d3.scale.linear()
	.domain([x0, x1])
    .range([0, 1000]);
    
   	
    var DNA = d3.select(".DNA").select("svg");
	
	
	//DNA.selectAll(".scaledMutationLine").remove();
	if (!DNA.selectAll(".scaledMutationLine").empty()) {
		DNA.selectAll(".scaledMutationLine").transition().duration(750).attr("y2", 100).call(endall, function() {
			DNA.selectAll(".scaledMutationLine").remove();
	
			DNA.call(tip);

			var mutationLines = DNA.selectAll("line").data(mutations);
	
			mutationLines.enter()
				.append("line")
				.attr("x1", function(d){return x(d.site)}) 
				.attr("y1", 100)
				.attr("x2", function(d){return x(d.site)}) 
				.attr("y2", 100)
				.attr("class", "mutationLines")
				.attr("stroke-width", 1)
				.attr("stroke", function(d) { return color(d.count*2); })
				.on('mouseover', tip.show) //testing tool tip
				.on('mouseout', tip.hide)
				.transition()
					.duration(1000)
					.attr("y2", function(d) { return 100 - d.count*15; });
		
			mutationLines.exit().transition()
								.duration(1000)
								.attr("y2", 100)
								.remove();
		});
	
 	} else {
 		
	
		DNA.call(tip);

		var mutationLines = DNA.selectAll("line").data(mutations);
	
		mutationLines.enter()
			.append("line")
			.attr("x1", function(d){return x(d.site)}) 
			.attr("y1", 100)
			.attr("x2", function(d){return x(d.site)}) 
			.attr("y2", 100)
			.attr("class", "mutationLines")
			.attr("stroke-width", 1)
			.attr("stroke", function(d) { return color(d.count*2); })
			.on('mouseover', tip.show) //testing tool tip
			.on('mouseout', tip.hide)
			.transition()
				.duration(1000)
				.attr("y2", function(d) { return 100 - d.count*15; });
		
		mutationLines.exit().transition()
							.duration(1000)
							.attr("y2", 100)
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
	RNAbar.on("click", function(){
		//console.log(className);
		redrawMutations(className, exonsOnEachTranscript, mutationsOnEachTranscript);
		d3.select(this).style("fill", "red");
		d3.select(this).classed("hover-active", false);
		
	});
			
	
	indexMatchArray = indicesMatch; //set global variable, so that we can use it in redrawMutation()
}


var redrawMutations = function(className, exonsOnEachTranscript, mutationsOnEachTranscript){

	//from the position in html, scale the number to get back the actual nucleotide position 
	var reverse_x = d3.scale.linear()
	.domain([0, 1000])
    .range([x0, x1]);

	exonList = exonsOnEachTranscript[className]; 

	var lines = d3.select(".DNA").select("svg").selectAll(".mutationLines")[0];
	lines.forEach(function (d,i) {
		var position = reverse_x(d.getAttribute("x1")); 
		//console.log(position)
		//get the html coordinate and get back nucleotide position
		
		if (checkInRange(exonList, position)){
			
			//now we know it's in range, loop through indexMatchArray to find its position 
			for (i in indexMatchArray){
				//if it encounter the first exon w end site that is greater than its position
				//then it must fall within that exon 
				if (indexMatchArray[i][1] > position){ 

					var exonStart   = indexMatchArray[i-1][1];
					var exonEnd     = indexMatchArray[i][1]; 
					var exonStartx1 = indexMatchArray[i-1][0];
					var exonEndx1   = indexMatchArray[i][0]; 

					//scaling with that exon 
					var localExonScale = d3.scale.linear()
						.domain([exonStart, exonEnd])
					    .range([exonStartx1, exonEndx1]);

					//var temp = position - indexMatchArray[i-1][1]
					newposition = localExonScale(position)
					//add an class ID
					d3.select(d).attr("class", "scaledMutationLine");

					//move the line
					d3.select(d).transition()
						.duration(750)
						.attr("x1", newposition)
						.attr("x2", newposition);

					mutation_search(className, position);


					break;
				}
			}

		}
		else{
			d3.select(d).transition()
				.duration(750)
				.attr("y2", 100)
				.remove(); //add some transition if you have some patience 
		}
	});


		

}

var checkInRange = function(exonList, site){
	var inRange = false; 
	for(exon in exonList){
		if (site > exonList[exon].start && site < exonList[exon].end)
			inRange = true; 
	}
	
	return inRange; 
}


//enable those two if you want to run this without accessing cbioportal 
// also fix the html to include the .js files in /data
//drawTranscripts(exonsOnEachTranscript, mutationsOnEachTranscript);
//drawDNA(x0, x1);

