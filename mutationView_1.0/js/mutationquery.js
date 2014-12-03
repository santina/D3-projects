var queryURL = "http://cbioportal.mo.bccrc.ca:9200/combined_index/_search" 
var mutationInfo = {};   //store all the mutation info for that particular transcript that is clicked on 
var mutationtempInfo = {};

var mutation_query  = 
{
  "size": 100,
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
              "term": {
                "EFF.SNPeffTranscript_ID": ""
              }
            },
            {
              "term": {
                "start": ""
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
};


var mutation_search = function(geneID, site){

	mutation_query.query.filtered.filter.bool.must[1].term["EFF.SNPeffTranscript_ID"] = geneID;
	mutation_query.query.filtered.filter.bool.must[2].term["start"] = site;
	var mutationInfoList = {};

	$.ajax({
		url: queryURL,
		type: "POST",
		crossDomain: true,
		dataType: 'json',
		data: JSON.stringify(mutation_query), 
		async: true, 
		success: function(response) {
			console.log("Mutation search: success"); 
			console.log(response);
			mutationInfo[site] = response;
		
		},
		error: function(err){
			console.log("Error: Problems loading data from tbe server.");
			console.log(err);
		}
	});
}

var drawMutationTrees = function(site){
	
}


