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