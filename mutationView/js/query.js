// the two URLs for Marvel Server, 
// queryURL for looking up genes, and gets you transcripts' exons 
// querytranscriptURL for getting mutations in each transcripts
var queryURL = "http://cbioportal.mo.bccrc.ca:9200/gene_annotations_index/_search" 
var querytranscriptURL = "http://cbioportal.mo.bccrc.ca:9200/combined_index/_search" 

//gene_annotations_index/_search is the index
// this gets you all exons and associated transcripts for each gene 
var transcripts_group = 
{
  "size": 300,
  "query": {
    "filtered": {
      "filter": {
        "bool": {
          "must": [
            {
              "term": {
              	//prob need to enable user to change this, like in a search box
                "gene_id": "ensg00000141510"
              }
            },
            {
              "term": {
                "feature": "exon"
              }
            }
          ]
        }
      }
    }
  },
  "aggs": {
    "transcripts": {
      "terms": {
        "field": "transcript_id",
        "size": 100
      }
    }
  }
}; 


//you could have multiple transcript ids that are the same 

//this tells you all the mutations on each transcript 
var transcript =
{
  "_source": ["sample_id", "chrom_number", "start"],
  //conceal all bunch of information I don't need, only need position and count...
  // though I might need mutation type later, but not sure if this provides that info
  "size": 0, 
  "query": {
    "filtered": {
      "filter": {
        "bool": {
          "must": [
            {
              "term": {
                "caller": "mutationseq"
              }
            },
            {
              "range": {
                "PR": {
                  "gt": "0.9"
                }
              }
            },
            {
              "term": {
                "project": "hgs_extremes"
              }
            }
          ]
        }
      }
    }
  },
  "aggs": {
    "mutation_counts": {
      "terms": {
        "field": "start",
        "size": 100
      }
    }
  }
}

//where we store unique id of transcripts 
var transcriptsIDs = new Array(); 
var exonsOnEachTranscript = new Array(); 


// make a query to queryURL, get a bunch of transcript ids which will be used to 
// search for details in the transcript 
// multiple same transcript: refer to different exon region of that transcript
// this is where I do everything. 
$.ajax({
	url: queryURL,
	type: "POST",
	crossDomain: true,
	dataType: 'json',
	data: JSON.stringify(transcripts_group), 
	async: true, //true. so if takes a long time, browser won't freeze 
	success: function(response) {
	
		//response is a list of all transcripts, with repeats due to multiple exons 
		console.log("success"); 
		
		
		// 1. get all the information about transcripts, their exons, and mutations sites 
			// get unique transcript ids 
				transcriptsIDs = getUniqueTranscript(response)
			// get exons for each transcript, a list of objects with id being transcript id 
				exonsOnEachTranscript = getExons(response);
			// get transcript info using another AJAX search, use unique transcript ids 
			// for mutation sites and counts 
				getTranscriptInfo(transcriptsIDs);
	
		// 2. now we draw things 
		
			// draw the transcripts in the scrollable box 
				drawTranscripts(exonsOnEachTranscript);
			// add events to all those transcripts 
			
			
			
		
	},
	error: function(err){
		console.log("Error: Problems loading data from tbe server.");
		console.log(err);
	}
});

//for some reason things written here are run before AJAX.  cuz asyn : true 

// lowercase vs capitalized letters in key and IDs, I can't just get the key in aggregations 
var getUniqueTranscript = function(response){
	var RNAs = new Array()
	for (var i = 0; i < response.aggregations.transcripts.buckets.length; i++){
		//convert the first few/four letters to upper case, kind of hacky
		//but need to do this to do the second search 
		RNAs[i] = (response.aggregations.transcripts.buckets[i].key).toUpperCase();
	};
	
	return RNAs;

}


var getExons = function(response){
	var exonsList = {};
	var transcriptsList = response.hits.hits;
	
	for (var i = 0; i < transcriptsList.length; i++){
		
		if (!exonsList.hasOwnProperty(transcriptsList[i]._source.transcript_id)){
			//add the property to exonsList along with the exon site 
			exonsList[transcriptsList[i]._source.transcript_id] = [
				{	start : transcriptsList[i]._source.start, 
					end : transcriptsList[i]._source.end
					//add more stuff here if you want more info 
				}
			]
		}
		
		else{
			//if id already there, just add another exon to it. 
			exonsList[transcriptsList[i]._source.transcript_id].push({
				start : transcriptsList[i]._source.start, 
				end : transcriptsList[i]._source.end
				//add more stuff here if you want more info 
			})
		}
	}
	return exonsList;
}


//to be filled as Ajax queries for transcript's mutation info 
var transcriptMutationList = {}; 
var temp = new Array();


//run processTranscriptInfo() on each transcript
var getTranscriptInfo = function(transcriptIDs){

	for (var i = 0; i < transcriptIDs.length; i++){
		//console.log(hits[i]._source.transcript_id); 
		var tempTranscript = transcript; //equal to the global variable, json search
		
		//push allow you to change part of the sequence, will change the transcript ids
		tempTranscript.query.filtered.filter.bool.must.push(
			{
              "term": {
                "EFF.SNPeffTranscript_ID": transcriptIDs[i]
              }
            }
		);
		//console.log(transcriptIDs[i]);
		processTranscriptInfo(tempTranscript, transcriptIDs[i])
	}
}

//combined_index/ : get mutation info and store it in 'transcriptMutationList' using getMutations()
//took this out of getTranscriptInfo so that ajax can run parallel indepedently of for loop
var processTranscriptInfo = function(tempTranscript, transcriptID) {
	$.ajax({
		url: querytranscriptURL,
		type: "POST",
		crossDomain: true,
		dataType: 'json',
		data: JSON.stringify(tempTranscript),  //should be tempTranscript ? 
		async: true, //if takes a long time, browser won't freeze 
		success: function(response) { 
			temp[temp.length] = response;
			//transcriptMutationList[transcriptIDs[i]] = [{dna: response}]; 
			//console.log("success2"); 
			getMutations(response, transcriptID);
		},
		error: function(err){
			console.log("Error: Problems loading data from the server.");
			console.log(err);
		}
	});
}

// fill the object 'transcriptMutationList'
var getMutations = function(response, transcript_id){
	
	//add the property to mutation along with the mutation counts and site 
	var mutationList = response.aggregations.mutation_counts.buckets; 
	
	//initializing 
	transcriptMutationList[transcript_id] = [
		{	site : mutationList[0].key, 
			count : mutationList[0].doc_count
			//add more stuff here if you want more info 
		} 	
	]	
	//fill the rest 
	for (var i = 1 ; i < mutationList.length; i++){
		transcriptMutationList[transcript_id].push(
			{	site : mutationList[i].key, 
				count : mutationList[i].doc_count
				//add more stuff here if you want more info 
			} 	
		)
	}
	
}

// draw transcript in <div class="inner">
var drawTranscripts = function(exonsOnEachTranscript){ 
	var transcriptHeight = 30; 
	
	//resize the container class = "inner" 
	var numItems = countObjects(exonsOnEachTranscript);
	
	console.log(numItems); 
	var chart = d3.select(".inner")
	.style("height", transcriptHeight*(numItems+3))  //not sure if this is necessary if svg is bigger
	
	// var chart = $('.inner').style("height", value);
	
	var RNAgraph = chart.append("svg")
    .attr("width", "100%")
    .attr("height", transcriptHeight*numItems); 

	var index = 1; //to be incremented as for loop goes on 


//this doesn't work :( 
// 	var minExonStart = d3.min(exonsOnEachTranscript, function(d){
// 		for (var exon in exonsOnEachTranscript[d]){
// 			return (exonsOnEachTranscript[d][exon]["start"]);
// 		};
// 	});
	
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


	//http://alignedleft.com/tutorials/d3/scales. 
	var x = d3.scale.linear()
	.domain([findMin(exonsOnEachTranscript), findMax(exonsOnEachTranscript)])
    .range([0, 1600]); //what do I do with the range, scaled to window size? 
	
	
	// need another for loop inside this 
	// first for loop goes through each transcript 
	// inner for loop goes through each axon in the transcript 
	for (var transcript in exonsOnEachTranscript){
		//console.log(transcript);
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
			.attr("fill", "steelblue")
			.on("mouseover", function(){
				d3.select(this).style("fill", "red");
				highlight(transcriptHeight*index);
			})
			.on("mouseout", function(){
				d3.select(this).style("fill", "steelblue");
				unhighlight(transcriptHeight*index);
			});
			
			
		}
		
		var line = RNAgraph.append("line")
		.attr("x1", minStartSite)
		.attr("y1", transcriptHeight*index + 10)
		.attr("x2", maxEndSite)
		.attr("y2", transcriptHeight*index + 10)
		.attr("stroke-width", 0.3)
		.attr("stroke", "black");
		
		var box = RNAgraph.append("rect")
		.attr("x1", minStartSite)
		.attr("y1", transcriptHeight*index)
		.attr("width", maxEndSite - minStartSite )
		.attr("height", transcriptHeight)
		.attr("fill", "grey")
		.attr("fill-opacity", 0);
		
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



//count how many elements are in an object, such as in exonsOnEachTranscript
//I can't believe there's no simplier way to do this
var countObjects = function(object){
    var count = 0;

    for(var prop in object) {
        if(object.hasOwnProperty(prop))
            ++count;
    }
    return count;
}


// var object_structure = {
// 	"ENSTT000035325": [
// 		{start: 123123, end: 123123},
// 		{start: 123123, end: 123123}
// 	],
// 	"EMST1231239": []
// }

