D3-projects
===========

Some D3 graphs I made, either for practice or for real applications! 

The data that are being visualized in these graphs come from [Dr. Sohrah Shah's](http://compbio.bccrc.ca/about/dr-sohrab-shah/) lab's cancer genomic database. In other words they're genomic information sequenced from tumour samples. I have partially mutated these data before putting them here in case there are confidentiality issues. 

I made these graphs on them during October and November 2014 as an effort to learn d3 and to explore ways to visualize large, multidimentional biological data. Starting from not knowing JavaScript and any web technology, I'm really glad I somehow made these things. 

This README describes what each visualiation module does, what features they have, and why they were created. To know how the code works, go to the README file of each folder. 

## Pyclone 

A scattered plot that summarizes mutation frequencies in two different tumours. 
![pyclone](/images/pyclone.png)
I think it was inspired by one of the examples in the d3 gallery but I can't find it there anymore. Anyhow, 
it's a fairly standard codes and easy to understand. I added the additional feature that would show mutation name 
of the dot that is hovered over. 


## Mutation View (1.0)

### Main Ideas
This is the one I spent the most time on and couldn't come up with a better name for. The graph summarizes several dimentions of the biological data: DNA, alternative spliced forms of RNA, and mutations that are positioned on DNA or on a spliced RNA. It's inspired by [Variant View](http://www.cs.ubc.ca/labs/imager/tr/2013/VariantView/), a paper on visualizing sequence variants (i.e mutations or differences) in their gene context. This d3 module follows a similar idea but is better because it is interactive, summarizes a gene with numerous transcripts, and mutations in the context of both DNA and each individual transcript. 

### How to use it
This visualization module is hooked with the Ajax query that gets data from Shab lab's genomic database, which is accessible only within the British Columbia Cancer Researche Centre network. So to see the graph, open `local.html` which will reads in the data that I downloaded (and mutated) from the database. 

### Features
![mutationView1](/images/mutationView_info.png)

As you can see, each time a gene name is searched, a number of alternative spliced forms of RNAs translated from that genes are generated and draw as blue boxes (exons, the coding regions of the transcript) connected by grey lines (introns, the non-coding regions). 

When a transcript is clicked on, it is highlighted and the mutations that occur in that transcript are drawn on the green bar that represents a DNA. The height/color of the mutation histogram represents the frequency, or the number of times a mutation is observed at that position. When a mutation line is mouse-overed, information of the nucelotide position and the count of that mutations will show up as a tool-tip. 

If you click on other transcripts, its mutations that are shared with the previously clicked transcript will remain, while the new ones will show up with a transition, and the ones that do not exist in the most recently clicked on will disappear by shrinking themselves. 

![mutationView2](/images/mutationView_spliced.PNG)

The purple bar represents a mature RNA transcript. When a transcript is selected, the purple bar would also changes its color to red when hovered over to indicate that it can be clicked on. Once it's clikced on, the purple bar would acquire black lines, which represent exon boundaries whose position coorespond to that of the selected transcript. As the purple bar now represnts a mature RNA with all its introns spliced out, the mutations lines that fall within the exons (alinging with the blue boxes of the selected transcript) will shift to their new position that align with the mature RNA bar (now a red bar). Those that fall within the intron regions will disappear by shrinking themselves. 

Once these mutation lines move to the position that align with the mature RNA bar, blue dots will appear on top of them, making the histogram look like lollipops. These dots are supposed to be clickable and will show more information about each mutation site similar to that described in the paper, kind of like that in Variant View. However, it's really hard to make such thing without overcrowding the view ( I'll explain why it's hard in the next section) but I'll try to make that happen this winter... 

### Future works 
Like I mentioned, I need to implement the additional dimension that allows people to click on the mutation historgram to get more information about that mutation site (such as type of mutations, frequencies, severity, and amino acid changes, etc). It would be like a branch-out effect, but the view shouldn't get crowded when users want to view information from multiple mutation sites all at once. There must be a way to display all that information without over crowing the view. 

My attempt right now is to make something similar to [Mike Bostock's collapsable tree](http://mbostock.github.io/d3/talk/20111018/tree.html) to take advanage of the dyanmic allocation of space as each node is expanded. The idea is that I can simply build a tree where the second layer (immediate children of the root node) are the dots on the mutations. If each mutation node belongs to the same tree, I can take advantage of that. That way I can allow users to view mutation details of multiple mutation sites at the same time while not overcrowding the view. 

In order to achieve that I need to : 
- draw a tree that grows from the buttom to the top (done)
- query the mutations and encode them in the tree (done)
- hide the root nodes and links from the root node to the first level of nodes (done)
- figure out a way to specify positions of the nodes in the first level (done)
- overwrites part of the dyanamic allocation of space which would move those nodes (no idea how to do it)


## Tree
![tree](/images/tree_branch.PNG)
This is the tree I made as a test for Mutation View to see what is accomplishable and what are the remianing challenges before I integrate it with Mutation View. Right now, the design is that the leave nodes are the amino acids of the mutation, and their parents are the reference amino acids. Color of the nodes show which class of amino acids (hydrophobic, polar, or charged) they are and the color of the links between them indicate the type of mutation (missense, nonsense, silent). The color of the paths from the grey nodes to the reference amino acids indicate the degree of severity of that mutation.  Sorry I will add the legend soon. 
