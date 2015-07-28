/** @author https://github.com/diego2013

utils.js Common utilities

*/


/** (pretty) Prints the info of a scenario in txt format
@scenarioDTO original scenario as an object
@acks number of users who ACKed the scenario
*/
scenarioToTxt = function(scenarioDTO, acks) {
	var result = "Scenario Title: "+ scenarioDTO.title+"\n\n";

	result += "This scenario has been acknowledged by "+acks+" users."+"\n\n";

	result += "Description: " +"\n"
	        + "------------"+"\n"+ scenarioDTO.description+"\n\n";


	//hazards
	var hazardEntryList = scenarioDTO.hazardEntryList;
	var i;
	if(hazardEntryList != undefined){
	    result += "Hazards: " +"\n" + "--------"+"\n";
		for( i =0; i<hazardEntryList.length; i++){
			result += " Hazard #"+(Number(i)+1)
			+" Description: "+ hazardEntryList[i].hazardDescription + "."
			+" Expected risk level: "+ hazardEntryList[i].hazardRisk + "."
			+" Expected severity: "+ hazardEntryList[i].hazardSeverity + "."
			+"\n";
		}
		result += "\n\n";
	}

	//EQUIPMENT 
	var equipmentEntryList = scenarioDTO.equipmentEntryList;
	if(equipmentEntryList != undefined){
	    result += "Equiment involved: " +"\n" + "------------------"+"\n";
		for(i =0; i<equipmentEntryList.length; i++){
			result += " Equiment entry #"+(Number(i)+1)
			+ " Device type " + equipmentEntryList[i].deviceType +"."
			+ " Device manufacturer " + equipmentEntryList[i].manufacturer +"."
			+ " Device model " + equipmentEntryList[i].model +"."
			+ " Rosseta ID " + equipmentEntryList[i].rosetta +"."

			if(equipmentEntryList[i].trainingRelated) result += " Training-related problem. ";
			if(equipmentEntryList[i].confusingRelated) result += " Device was confuisng to use. ";

			result += "\n";
		}
		result += "\n"+"\n";
	}

	//Lessons learned
	if(scenarioDTO.preventable){
		result += "Could this incident have been prevented or mitigated through better technology? "+scenarioDTO.preventable;
		result += "\n\n";
	}
	if(scenarioDTO.lessonsLearned){
		result += "Lessons Learned: "+scenarioDTO.lessonsLearned;
		result += "\n\n";
	}


	//ROLES
	var roleEntryList = scenarioDTO.roleEntryList;
	if(roleEntryList != undefined && roleEntryList.length > 0){
		result += "Clinical Roles Involved: ";
		for(i =0; i<roleEntryList.length-1; i++){
			result +=  roleEntryList[i].role + ", ";
		}
		result +=  roleEntryList[roleEntryList.length-1].role;
		result += "\n\n";
	}

	//Clinical environments
	var environmentEntryList = scenarioDTO.environmentEntryList;
	if(environmentEntryList != undefined && environmentEntryList.length> 0){
		result += "Clinical Environments Involved: ";
		for(i =0; i<environmentEntryList.length-1; i++){
			result +=  environmentEntryList[i].place + ", ";
		}
		result +=  environmentEntryList[environmentEntryList.length-1].place;
		result += "\n\n";
	}

	//References
	var referenceEntryList = scenarioDTO.referenceEntryList;
	if(referenceEntryList != undefined && referenceEntryList.length > 0){
		result += "References: " + "\n" + "-----------"+"\n";
		for(i =0; i<referenceEntryList.length; i++){
			result +=  " Reference entry #"+(Number(i)+1)+ " ";
			result +=  "Description: " + referenceEntryList[i].referenceRelevance + " URL: " +referenceEntryList[i].referenceUrl +"\n";
		}
		result += "\n\n";
	}

	//Solution
	if(scenarioDTO.solutionDescription)
	result += "Proposed solution: " +"\n"
             +"------------------"+"\n" + scenarioDTO.solutionDescription+"\n\n";

	if(scenarioDTO.benefitsDescription)
	result += "Benefits of the New System: "+"\n"
             +"---------------------------"+"\n" + scenarioDTO.benefitsDescription+"\n\n";

	if(scenarioDTO.risksDescription)
	result += "Foreseen Risks of the New System: "+"\n"
             +"---------------------------------"+"\n" + scenarioDTO.risksDescription+"\n\n";

  return result;
};