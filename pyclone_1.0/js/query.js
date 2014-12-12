

var queryURL = "http://cbioportal.mo.bccrc.ca:9200/gene_annotations_index/_search" 
var querytranscriptURL = "http://cbioportal.mo.bccrc.ca:9200/combined_index/_search" 

//gene_annotations_index/_search is the index

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


var transcript =
{
  "_source": ["sample_id", "chrom_number", "start"],
  "size": 0, //conceal all bunch of information I don't need, only need position and count
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



//make a query to queryURL 
$.ajax({
	url: queryURL,
	type: "POST",
	crossDomain: true,
	dataType: 'json',
	data: JSON.stringify(transcripts_group), 
	async: true, //if takes a long time, browser won't freeze 
	success: function(response) { 
		console.log("success"); 
		console.log(response);
		getTranscriptInfo(response);
	},
	error: function(err){
		console.log("Error: Problems loading data from server.");
		console.log(err);
	}
});





//function loop() {}


//combined_index/_search
var getTranscriptInfo = function(response){
	var hits = response.hits.hits;
	for (var i = 0; i < hits.length; i++){
		//console.log(hits[i]._source.transcript_id); 
		var tempTranscript = transcript;
		tempTranscript.query.filtered.filter.bool.must.push(
			{
              "term": {
                "EFF.SNPeffTranscript_ID": hits[i]._source.transcript_id
              }
            }
		);
		$.ajax({
			url: querytranscriptURL,
			type: "POST",
			crossDomain: true,
			dataType: 'json',
			data: JSON.stringify(transcript), 
			async: true, //if takes a long time, browser won't freeze 
			success: function(response) { 
				console.log("success"); 
				console.log(response);
				//loop(response);
			},
			error: function(err){
				console.log("Error: Problems loading data from server.");
				console.log(err);
			}
		});
		
		
	}
		

}
