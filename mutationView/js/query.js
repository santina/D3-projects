// the two URLs for Marvel Server, 
// queryURL for looking up genes, and gets you transcripts' exons 
// querytranscriptURL for getting mutations in each transcripts
var queryURL = "http://cbioportal.mo.bccrc.ca:9200/gene_annotations_index/_search" 
var querytranscriptURL = "http://cbioportal.mo.bccrc.ca:9200/combined_index/_search" 

var transcripts_exons;
var mutations_counts;
var transcriptMutationList = {}; 
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
var search = function(geneID){

	transcripts_group.query.filtered.filter.bool.must[0].term.gene_id = geneID;

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
		
			transcripts_exons = response;
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
					drawTranscripts(exonsOnEachTranscript, transcriptMutationList);
					drawDNA()
					drawmRNA()
		
		},
		error: function(err){
			console.log("Error: Problems loading data from tbe server.");
			console.log(err);
		}
	});


}


search("ensg00000141510");

$('#searchBtn').click(function() {
	var geneID = $('#geneIDInput').val();
	search(geneID);
	$('.DNA').empty();
	$('.inner').empty();
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



// var object_structure = {
// 	"ENSTT000035325": [
// 		{start: 123123, end: 123123},
// 		{start: 123123, end: 123123}
// 	],
// 	"EMST1231239": []
// }

