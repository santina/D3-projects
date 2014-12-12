var filteredMutationInfo = {};
var mutationNumbs = [7578406, 7577559, 7567687, 
7577114, 7578190, 7579311, 7567693, 7567711, 
7570591, 7574018, 7576928, 7577018, 7577120, 7577121, 
7577124, 7577141, 7577501, 7577536, 7577538, 7577548, 
7577551, 7577569, 7578175, 7578203, 7578235, 7578263, 
7578265, 7578271, 7578275, 7578370, 7578394, 7578404, 
7578442, 7578461, 7578508, 7578526, 7578535, 7582606, 7590693]; 
//got it from all the sites in transcriptMutationList["ENST00000455263"]
//how did I get this again though?

transcriptID = "ENST00000455263";

var filterMutationInfo = function(){
	var hits = example.hits.hits; 

	//root node is the position of the mutation in search 
	filteredMutationInfo.name = hits[0]._source.end; 
	//children to be populated with EFF 
	filteredMutationInfo.children = [];

	for(var i = 0; i < hits.length; i++){
		var EFFs = hits[i]._source.EFF; 
		for (var j = 0; j < EFFs.length; j++){
			if(EFFs[j].SNPeffTranscript_ID == transcriptID){
				var impact = EFFs[j].SNPEffect_Impact;
				var aachange = EFFs[j].SNPeffAmino_Acid_Change;

				filteredMutationInfo.children.push({
					name : hits[i]._id,
					children : [
						{
							name: impact,
							aminoA : aachange
						}
					]
				})
			}
		}
	}
}


filterMutationInfo();

// ===========

var data = mutationInfo;  //pretends this data is generated within code, not external. 
var filteredMutationsInfo = [];  

/*using the accumulated mutation info and list of mutation sites collected from one single transcript 
	this function parse the cumulated mutation info into a format that tree layout can read*/
var filterMutationsInfo = function(data){
	
	//variable root is where we'll add all the stuff 
	filteredMutationsInfo[0] = {}
	var root = filteredMutationsInfo[0]; 

	//initilizing 
	root.name = "TreeRoot";
	root.parent = "null";
	root.level = "rootNode"
	root.children = []; 

	//names 
	var name1 = "mutation site: "
	var name2 = "aa changes: "

	/*pushing information into root.children:  
		level will be used in styling purposes. 
		parent and name will be used to style the link paths */

	/*keep track of which second level node's children array to insert 
		root.children[index] returns the current 2nd-level node */
	var index = 0; 

	//loop1 : through each mutation  
	for(var i = 0; i < mutationNumbs.length; i++){
		if (data.hasOwnProperty(mutationNumbs[i])){


			var current_mutation = data[mutationNumbs[i]];


			var hits = current_mutation.hits.hits; 

			// loop2 : through the hits. # hits = # mutations in that position (mutationNumb[i]) 
			for(var j = 0; j < hits.length; j++){
				var EFFs = hits[j]._source.EFF;
				
				//loop3 : through each entry in EFF:{}, find the info under the transcript
				for (var k = 0 ; k < EFFs.length; k++){
					if(EFFs[k].SNPeffTranscript_ID == transcriptID){
						var length = (EFFs[k].SNPeffAmino_Acid_Change).length;
						if(j == 0){ //if we're sure that this is the first mutation 
							root.children.push( { //second level (on dots of the lollipop)
								name: "",
								site: mutationNumbs[i],
								parent: "TreeRoot",
								counts: hits.length, //number of mutations at that site 
								level: "levelOneNodes",
								children:[ // third level, where we will show reference amino acid 
									{
										name: (EFFs[k].SNPeffAmino_Acid_Change).substring(0,1),
										parent: mutationNumbs[i],
										impact: EFFs[k].SNPEffect_Impact, //HIGH, MODERATE, LOW, MODIFIER
										level: "levelTwoNodes",
										children:[  //forth level, which shows amino acid of the mutation site
											{
												name: (EFFs[k].SNPeffAmino_Acid_Change).substring(length-1,length), //get the last letter 
												parent: (EFFs[k].SNPeffAmino_Acid_Change).substring(0,1),
												impact: EFFs[k].SNPeffFunctional_Class , //NONE, SILENT, MISSENSE, NONSENSE
												level : "levelThreeNodes"
											}
										]
									}
								]
							});
						}
						/* code gets to here if there are more than 1 mutation at the same location. 
						push to the children level of the second level */
						else{ 
							root.children[index].children.push({
								name: (EFFs[k].SNPeffAmino_Acid_Change).substring(0,1),
										parent: mutationNumbs[i],
										impact: EFFs[k].SNPEffect_Impact, //HIGH, MODERATE, LOW, MODIFIER
										level: "levelTwoNodes",
										children:[  //forth level, which shows amino acid of the mutation site
											{
												name: (EFFs[k].SNPeffAmino_Acid_Change).substring(length-1,length),
												parent: (EFFs[k].SNPeffAmino_Acid_Change).substring(0,1),
												impact: EFFs[k].SNPeffFunctional_Class , //NONE, SILENT, MISSENSE, NONSENSE
												level : "levelThreeNodes"
											}
										]
							})
						}

					}
				}

			}

			index++;
		}
	}
	return filteredMutationsInfo;
}

var filteredMutationsInfo= filterMutationsInfo(mutationInfo);