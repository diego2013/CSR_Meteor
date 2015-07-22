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
		console.log(getUser._id);
		userObject = JSON.stringify(getUser); //string or buffer
		// console.log(JSON.stringify(getUser));
		var path = process.env["PWD"] + "/public/";
	 //    fs.writeFile(path+Meteor.userId()+'.txt', userObject, 
	 //    	function (err) {
		// 		if (err) throw err;
		// 		  console.log('It\'s saved!');
		// 	}
		// );
		
		csv.writeToString(JSON.stringify(getUser), {headers: true}, function(error, data){
			  if (error)
			   console.log(error);
			  else{
			   zip.file('friends.csv', data);//adds a file
			   var myZip = zip.generate({type: "base64"});
			   fs.writeFile(path+"prueba"+'.txt', myZip, function (err) {
			   	if (err) throw err;
			   	console.log('It\'s saved!');
			   });
			  }
			   
		// });
  //       fs.writeFile(path+"prueba"+'.txt', zip, function (err) {
		// 	if (err) throw err;
		// 		 console.log('It\'s saved!');
			}
		);
		return zip.generate({type: "base64"});
	}


});