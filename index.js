/**
@author https://github.com/diego2013

*/



//Names for the steps on the creation of a new scenario
_SCENARIO_FORM_STEP = 'SCENARIO_FORM_STEP'; //Step of the scenario submission process
_SCENARIO_FORM_STEP_BASIC_INFO = 'SCENARIO_FORM_STEP_BASIC_INFO'; 
_SCENARIO_FORM_STEP_ADVANCED_INFO = 'SCENARIO_FORM_STEP_ADVANCED_INFO'; 
_SCENARIO_FORM_STEP_SOLUTION = 'SCENARIO_FORM_STEP_SOLUTION'; 
_SCENARIO_FORM_STEP_BASIC_INFO_templateName = "scenarioFormBasicInfo"; 
_SCENARIO_FORM_STEP_ADVANCED_INFO_templateName = "scenarioFormAdvancedInfo"; 
_SCENARIO_FORM_STEP_SOLUTION_templateName = "scenarioFormSolution";

//Scenario form step 2: Advanced Details. Names of each tab's associated template
 _ADVANCEDDETAILS_TAB = 'ADVANCEDDETAILS_TAB'; 
 _ADT_HAZARDS_templateName = "advancedDetailsHazards"; 
 _ADT_EQUIPMENT_templateName = "advancedDetailsEquipment"; 
 _ADT_ROLES_templateName = "advancedDetailsRoles"; 
 _ADT_PLACES_templateName = "advancedDetailsEnvironments"; 
 _ADT_LESSONSLEARNED_templateName = "advancedDetailsLessonsLearned"; 
 _ADT_REFERENCES_templateName = "advancedDetailsReferences"; 
                                        

//Scenario states for governance
scenarioStatusEnum = {
    UNSUBMITTED : "unsubmitted",      //new. (modified or not). PRIVATE Not yet submitted for approval 
    SUBMITTED   : "submitted",        //submitted. Peding of approval
    APPROVED    : 'approved' ,        //APPROVED. Public
    MODIFIED    : 'modified',         //APPROVED and then modified
    REJECTED    : 'rejected'          //Permantenlty discarded (but not deleted)
}


//CLIENT SIDE
if (Meteor.isClient) {

  // Scenarios = new Mongo.Collection("scenarios");
  // FeedbackCollection = new Mongo.Collection("FeedbackCollection");
  // ScenarioAcks = new Mongo.Collection("ScenarioAcks");

  var defaultSortObject = {param : 'createdAt', order : 1};

  Session.setDefault('feedbackCursorStart', 0);
  Session.setDefault('feedbackResultsPerPage', 10 /*25*/);
  Session.setDefault('feedbackCursorOrder', defaultSortObject);

  Session.setDefault('scenarioCursorStart', 0);
  Session.setDefault('scenarioResultsPerPage', 10 /*25*/);
  Session.setDefault('scenarioCursorOrder', defaultSortObject);

  Session.setDefault('userListCursorStart', 0);
  Session.setDefault('userListResultsPerPage', 10 /*25*/);
  Session.setDefault('userListOrder', defaultSortObject);

  // Session.setDefault('showGuidelines', true); Issue #147
  if (Meteor.user()&& Meteor.user().profile && Meteor.user().profile.user_preferences){
    Session.setDefault('showGuidelines', Meteor.user().profile.user_preferences.show_context_help)
  }
  else
    Session.setDefault('showGuidelines', true);

  //Meteor.subscribe("scenarios");
//  Meteor.subscribe('myScenarios');  //scenarios of the current user
  Meteor.subscribe('scenariosAll'); //all available scenarios
//  Meteor.subscribe('scenariosAllApproved'); //all approved scenarios
  
  // Meteor.subscribe('allUsersList');
  //Meteor.subscribe('feedbackDocuments', Session.get('feedbackCursorStart'), 10 /*limit*/);
  //Meteor.subscribe('userdata');
  Meteor.subscribe('publication');

  // partial collections (Minimongo collections)
  MyScenarios = new Mongo.Collection('myScenarios');
  ScenariosAll = new Mongo.Collection('scenariosAll');
  scenariosAllApproved = new Mongo.Collection('scenariosAllApproved');
  scenariosAllSubmitted = new Mongo.Collection('scenariosAllSubmitted');
  AllTheUsers = new Mongo.Collection('allUsersList');
  feedbackCol = new Mongo.Collection('feedbackDocuments')
  //currentUser = new Mongo.Collection('userdata');
  scenarioAcks = new Mongo.Collection("scenarioAcks");
  Meteor.subscribe('scenarioAcks')

// Tracker.autorun(function(){
  Deps .autorun(function(){

    //http://stackoverflow.com/questions/15680461/meteor-collection-not-updating-subscription-on-client
    if(Router.current()!= null){
      var routeName = Router.current().route.getName();
      highLightNavBatItem(routeName);
    }

    //subscriptions
    Meteor.subscribe('feedbackDocuments', Number(Session.get('feedbackCursorStart')), Number(Session.get('feedbackResultsPerPage')), Session.get('feedbackCursorOrder'));
    Meteor.subscribe('myScenarios', Number(Session.get('scenarioCursorStart')), Number(Session.get('scenarioResultsPerPage')), Session.get('scenarioCursorOrder'));  //scenarios of the current user
    Meteor.subscribe('scenariosAllSubmitted', Number(Session.get('scenarioCursorStart')), Number(Session.get('scenarioResultsPerPage')), Session.get('scenarioCursorOrder')); //all available scenarios
    Meteor.subscribe('scenariosAllApproved', Number(Session.get('scenarioCursorStart')), Number(Session.get('scenarioResultsPerPage')), Session.get('scenarioCursorOrder')); //all approved scenarios
    Meteor.subscribe('allUsersList', Number(Session.get('userListCursorStart')), Number(Session.get('userListResultsPerPage')), Session.get('userListOrder'));//all available users

});


Template.NavBar.events({
  "click #downloadAllItem" : function(event){
    event.preventDefault();

    var date = moment(new Date()).format('MM-DD-YYYY');
    var folderName = "MDPnP_CSR_Scenarios_Export_"+date;

    Meteor.call('exportAllScenarios', folderName, function(err, data){
      if (err){  
        console.log(err);
        window.alert("Error exporting data. \n\n"+err.error);
      }else{
        var blob = base64ToBlob(data, "zip");
        saveAs(blob, folderName+".zip");
      }
    });
  }

});


// //Adds an index to each document
// var addIndexToDocument = function(document, index){
//   document.index = index;
//   return document;
// }


 //UI HELPERS
 //============================================================================================

/*
Returns if the provided option selected in the template is the one that the DTO currently holds
*/
UI.registerHelper('selectedLessonLearned', function( value){
  currentScenarioDTO = Session.get('currentScenarioDTO');
  if(currentScenarioDTO && currentScenarioDTO.preventable)
    return currentScenarioDTO.preventable == value? {selected:'selected'}: '';
  else
    return '';
});



/** Return the length of an arrayObject
*/
UI.registerHelper('count', function(arrayObject){
  return arrayObject.length;
});


/********* UTILITY FUNCTIONS *********/

/* Trims the length of a string of charaters to the desired length*/
UI.registerHelper('trimLength', function(string, length){
      if (string!= undefined && string.trim()!=''){
        if(length>0){
          if(string.length> length)
            return string.substring(0, length)+"...";
          else
            return string;
        }else
          return '';
      }else
        return '';
});

/* Formats a Date using moment.js
//https://atmospherejs.com/momentjs/moment
// $ meteor add momentjs:moment
*/
//Formats a date time using the mask MM-DD-YYYY, hh:mm:ss
UI.registerHelper('formatDateTime', function(date) {
  if(date)
    return moment(date).format('MM-DD-YYYY, hh:mm:ss');
  else
    return ''
});

//Formats a Date using mask MM-DD-YYYY
UI.registerHelper('formatDate', function(date) {
  if(date)
    return moment(date).format('MM-DD-YYYY');
  else
    return ''
});

/* Indicates if the header with the scenario metainfo (UID, Dates) shall be displayed.
   It will be in case the currentScenarioDTO in session has a valid _id
*/
UI.registerHelper('printScenarioMetainfo' , function(){
   if(Session.get('currentScenarioDTO')==undefined)
     return false;
   else
     return Session.get('currentScenarioDTO')._id!=undefined;
});


/** Returns a boolean that indicates if the current scenario is editable or not
*/
UI.registerHelper('isScenarioEditable', function(){
  currentScenarioDTO = Session.get('currentScenarioDTO');
  return isScenarioEditable(currentScenarioDTO);
  // return false;
});

/** Returns an HTML "readonly" attribute that indicates if the current scenario is editable or not
*/
UI.registerHelper('isScenarioReadOnly', function(){
  currentScenarioDTO = Session.get('currentScenarioDTO');
  if(isScenarioEditable(currentScenarioDTO))
    return ''
  else
    return 'readonly';

});

/** Returns a boolean that indicates if the current scenario is locked for modification or not
*/
UI.registerHelper('isScenarioLocked', function(){
  currentScenarioDTO = Session.get('currentScenarioDTO');
  return isScenarioLocked(currentScenarioDTO);
});

/** Returns a boolean that indicates if the user has a certain role
*/
UI.registerHelper('userHasRole', function(role){
  return Roles.userIsInRole(Meteor.user(), [role]) ;
});



/* Shows or hides the guidelines div according to the value of the button
*/
UI.registerHelper('getGuidelinesButtonClass' , function(){
  if(!Session.get('showGuidelines')){
    return 'guidelinesHidden';
  }else{
    return '';
  }
});

/* Returns TRUE if we are in "expert mode" (showing guidelines for new scenario Submissions)
*/
UI.registerHelper('getExpertMode' , function(){
  if(!Session.get('showGuidelines')){
    return false;
  }else{
    return true;
  }
});

//UI.registerHelper('getNextButtonClass' , function(){
//  //console.log(JSON.stringify(obj));
//  return 'next';
//});

/** returns a HTML string with the status of the scenario
*/
UI.registerHelper('showScenarioStatus', function(){
  scenario = Session.get('currentScenarioDTO');
  if(scenario)
    return scenario.status;
  else
    return '-';

});


/** Returns the main email of a user based on the provided email collection
*/
UI.registerHelper('getEmail' , function(emailsObject){
    if (emailsObject && emailsObject[0])
      return emailsObject[0].address;
    else
      return "not provided";
});

/** Returns if the main email of a user based on the provided email collection is verified
*/
UI.registerHelper('isVerifiedEmail' , function(emailsObject){
    if (emailsObject && emailsObject[0]){
      //console.log(emailsObject[0].verified).toString());
      return  (emailsObject[0].verified).toString();
    }
    else
      return "not applicable";
});


/**Returns the number of ACKs / LIKES of a scenario with the given ID
@param ScnId ID of the scenario
*/
UI.registerHelper('getScenarioACKcount', function(ScnId){
  return scenarioAcks.find({scnID : ScnId}).count();
})

/** Returns the number of scenarios of this user by status
@param scnState state of the scenario : values from scenarioStatusEnum or empty string for "ALL"
*/
UI.registerHelper('myContributionsCountByState', function(scnState){
  if (scnState == scenarioStatusEnum.UNSUBMITTED)
    return Counts.get('unSubmittedScenariosCounter');
  else if (scnState == scenarioStatusEnum.SUBMITTED)
    return Counts.get('submittedScenariosCounter');
  else if (scnState == scenarioStatusEnum.APPROVED)
    return Counts.get('approvedScenariosCounter')
  else if (scnState == '')
    return Counts.get('myScenariosCounter');
  else
    return 0;
})


//OTHER CLIENT FUNCTIONS
//======================================================================

//To configure the accounts UI https://docs.meteor.com/#/full/accounts_ui_config
Accounts.ui.config({
  //passwordSignupFields: "USERNAME_ONLY"
  passwordSignupFields: 'USERNAME_AND_EMAIL'
});


}//meteor.isClient



//SERVER SIDE
//======================================================================

if (Meteor.isServer) {
  
}