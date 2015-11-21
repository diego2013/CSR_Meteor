/** @author https://github.com/diego2013
*/

Template.scenarioListTable.events({
"click .previous" : function(){
  //make sure we have a minimum
  //if ((x - y)>0) x = x-y;
  if(Number(Session.get('scenarioCursorStart'))  > Number(Session.get('scenarioResultsPerPage')-1)){
    Session.set('scenarioCursorStart', Number(Session.get('scenarioCursorStart'))-Number(Session.get('scenarioResultsPerPage')));
  }
}
,"click .next" : function(){
  var routeName = Router.current().route.getName();
  scenarioCount = scenarioTotalCount(routeName);
  if(Number(Session.get('scenarioCursorStart')) + Number(Session.get('scenarioResultsPerPage')) < scenarioCount)
   Session.set('scenarioCursorStart', Number(Session.get('scenarioCursorStart'))+Number(Session.get('scenarioResultsPerPage')));
}
, "change #resultsPerPage" : function(event){
  var newValue = $(event.target).val();
  Session.set('scenarioCursorStart', 0);
  Session.set('scenarioResultsPerPage', newValue);
}
,"click #cabecera" :function(event){
    var name = event.target.getAttribute("data-name");
    var obj = Session.get('scenarioCursorOrder'); 
    if(obj && name){
       obj['param'] = name;
       obj['order'] *=  -1;
    }else{
       obj = {};
       obj['param'] = obj['param'] ? name : "createdAt"; // "createdAt" will be "default" val
       obj['order'] =  1;
    }
    if(name != '')//we don't sort
      Session.set( 'scenarioCursorOrder', obj );
}
});

Template.MyScenariosScenarioRow.events({
  "click #visitScenario" : function(event){
    var currentPath = Router.current().route.getName()
    visitScenario(this._id, currentPath);
  }
});

Template.scenarioRow.events({
  "click #visitScenario" : function(event){
    var currentPath = Router.current().route.getName()
    visitScenario(this._id, currentPath);
  }
});

Template.publicScenarioRow.events({
  "click #visitScenario" : function(event){
    var currentPath = Router.current().route.getName()
    //do an action or another based on the route
    visitScenario(this._id, currentPath);
  }
});


//************* AUXILIARY FUNCTIONS *************
/**
  Displays one view or another based on the given url to show
  @scenarioID ID of the scenario we want to show
  @currentPath url of the view we are trying to reach
*/
var  visitScenario = function(scenarioID, currentPath){

    if(currentPath=='scenarioList'){
      //find by ID, with the scn ID being in the text of the button just clicked
      // findByID(event.target.name);
       findByID(scenarioID);
    }else if(currentPath=='recentSubmissionsScenarioList'){
      // Router.go("/scenarioComplete/"+event.target.name)
      Router.go("/scenarioComplete/"+scenarioID)
    }else if(currentPath=='approvedScenarioList'){
      //findByID(event.target.name);
      // Router.go("/scenarioComplete/"+event.target.name);
      Router.go("/scenarioComplete/"+scenarioID)
    }
}