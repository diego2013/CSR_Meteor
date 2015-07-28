/**
@author https://github.com/diego2013

export.js
*/

jsZip 	   = Meteor.npmRequire('jszip');
xmlBuilder = Meteor.npmRequire('xmlbuilder');
fastCsv    = Meteor.npmRequire('fast-csv');
fs = Npm.require('fs');

Meteor.methods({
	exportData : function(){
		// create an instance of JSZip
		zip = new jsZip();
		csv = fastCsv;
		getUser = Meteor.users.findOne({_id : Meteor.userId()});
		// console.log(getUser._id);
		userObject = JSON.stringify(getUser); //string or buffer



	 //    csv.writeToString(userObject, {headers: true}, 
		// 	function(error, data){
		// 	  if (error)
		// 	   console.log(error);
		// 	  else{
		// 	   // zip.file('user.csv', data);//adds a file
		// 	   console.log(data);
		// 	  }
		// 	}
		// );

		// zip.file("Hello.txt", "Hello World\n");
		zip.file('user.csv', userObject);//adds a file
		return zip.generate({type: "base64"});
	}
	,exportScnAsTxt : function(scenarioID){
		
		zip = new jsZip();// create an instance of JSZip
		// csv = fastCsv;  //create an instance of fast-csv
		var scenarioDTO = Scenarios.findOne({_id: scenarioID});
		var acks = ScenarioAcks.find({scnID : scenarioID}).count();
		scnInfo = scenarioToTxt(scenarioDTO, acks);
		zip.file('scenario_'+scenarioID+'.txt', scnInfo);//adds a file
		return zip.generate({type: "base64"});

	}
	/*
	,exportAsXML : function(){
		profile = xmlBuilder.create('profile');
		profileXmlString = profile.end({pretty: true})
	}
	*/

});