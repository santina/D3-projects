Mutation View
==========

# Purpose 
My attempt to turn Variant View into a D3 thing that can be added to elastic search 
and ofc look much prettier 

# Tools
AJAX:  Web applications can send data to and retrieve from a server asynchronously 
(in the background) without interfering with the display and behavior of the existing page



# Notes for myself 
- svg objects' coordinates systems are relative to the container that you put them in. 
- d3.select("#ID");  d3.select(".class")
- when you do something like for (mutation in mutationList)... mutation is number/index of of the list

- I probably should clean up my code at some point so that the functions don't depend on 
	some specific variables so much. 

	d3.select(this).style("fill", "red"); not d3.select(this).attr("fill", "red");


# Running without the cbioportal server 
- the files in the data folder are downloaded from the Cbioportal (ours, not the publicly available one) database 
- numbers/names have been randomly altered in case of confidentiality issues
- stuff in mutationInfo.js is from gene: ensg00000141510 and the first transcript on the top of the list 
	* mutationlist is for the 22 scaled mutations 
