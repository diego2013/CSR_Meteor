/** @author https://github.com/diego2013
*/

Template.findByIDTemplate.events({
  //on click the search button
  "click #searchByIDButton" : function(event, template){
    //event.preventDefault();
    //Fetch and process input
    var scenarioID = template.find("#findByIDbox").value;
    // console.log(scenarioID)
    scenarioID = scenarioID.trim();
    findByID(scenarioID); 
    //clear
    template.find("#findByIDbox").value = "";
  }

//on pressing "enter" on the "scneario ID" find text box
  ,"keypress #findByIDbox" : function(event, template){
      //Fetch and process input
      if(event.keyCode==13){
        var scenarioID = template.find("#findByIDbox").value;
        scenarioID = scenarioID.trim();
        findByID(scenarioID); 

        event.preventDefault();
      }
  }

});

Template.findByIDErrorTemplate.events({
  //on click the search button
  "click #searchByIDButton" : function(event, template){
    //Fetch and process input
    var scenarioID = template.find("#findByIDbox").value;
    scenarioID = scenarioID.trim();
    findByID(scenarioID);
    //clear
    template.find("#findByIDbox").value = "";
  }
  
  //on pressing "enter" on the "scneario ID" find text box
  ,"keypress #findByIDbox" : function(event, template){
      //Fetch and process input
      if(event.keyCode==13){
        var scenarioID = template.find("#findByIDbox").value;
        scenarioID = scenarioID.trim();
        findByID(scenarioID); 

        event.preventDefault();
      }
  }
});