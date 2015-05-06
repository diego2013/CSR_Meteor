/**
This csr.js file is part of the implementetion of the MD PnP's (www.mdpnp.org)
Clinical Scenario Repository protoype using JavaScript and the Meteor Platform.

@author diego@mdpnp.org
@version 1.0

*/

//Database collections (Meteor.server MyCollection = new Mongo.Collection('collection-name-in-mongo'))
Scenarios = new Mongo.Collection("scenarios");
//AllScenarios = new Mongo.Collection("scenariosAll");
FeedbackCollection = new Mongo.Collection("FeedbackCollection");
//AllTheUsers = Meteor.users; //new Mongo.Collection(Meteor.users);


//Var


//Constants
var _SCENARIO_FORM_STEP = 'SCENARIO_FORM_STEP'; //Step of the scenario submission process
var _SCENARIO_FORM_STEP_BASIC_INFO = 'SCENARIO_FORM_STEP_BASIC_INFO'; 
var _SCENARIO_FORM_STEP_ADVANCED_INFO = 'SCENARIO_FORM_STEP_ADVANCED_INFO'; 
var _SCENARIO_FORM_STEP_SOLUTION = 'SCENARIO_FORM_STEP_SOLUTION'; 
var _SCENARIO_FORM_STEP_BASIC_INFO_templateName = "scenarioFormBasicInfo"; 
var _SCENARIO_FORM_STEP_ADVANCED_INFO_templateName = "scenarioFormAdvancedInfo"; 
var _SCENARIO_FORM_STEP_SOLUTION_templateName = "scenarioFormSolution";

//Scenario form step 2: Advanced Details
var _ADVANCEDDETAILS_TAB = 'ADVANCEDDETAILS_TAB'; 
var _ADT_HAZARDS_templateName = "advancedDetailsHazards"; 
var _ADT_EQUIPMENT_templateName = "advancedDetailsEquipment"; 
var _ADT_ROLES_templateName = "advancedDetailsRoles"; 
var _ADT_PLACES_templateName = "advancedDetailsEnvironments"; 
var _ADT_LESSONSLEARNED_templateName = "advancedDetailsLessonsLearned"; 
var _ADT_REFERENCES_templateName = "advancedDetailsReferences"; 


var _LOCKBUTTON_NAME_LOCK = "Lock Modification";
var _LOCKBUTTON_NAME_UNLOCK = "Unlock Modification";
                                        

//Scenario states for governance
var scenarioStatusEnum = {
    UNSUBMITTED : "unsubmitted",      //new. (modified or not). PRIVATE Not yet submitted for approval 
    SUBMITTED   : "submitted",        //submitted. Peding of approval
    APPROVED    : 'approved' ,        //APPROVED. Public
    MODIFIED    : 'modified',         //APPROVED and then modified
    REJECTED    : 'rejected'          //Permantenlty discarded (but not deleted)
}


//CLIENT SIDE
if (Meteor.isClient) {
  //Meteor.subscribe("scenarios");
  Meteor.subscribe('myScenarios');  //scenarios of the current user
  Meteor.subscribe('scenariosAll'); //all available scenarios
  Meteor.subscribe('scenariosAllApproved'); //all approved scenarios
  
  Meteor.subscribe('allUsersList');
  //Meteor.subscribe('userdata');

  // partial collections (Minimongo collections)
  MyScenarios = new Mongo.Collection('myScenarios');
  ScenariosAll = new Mongo.Collection('scenariosAll');
  scenariosAllApproved = new Mongo.Collection('scenariosAllApproved');
  AllTheUsers = new Mongo.Collection('allUsersList');
  //currentUser = new Mongo.Collection('userdata');

 
  
  //we may also need 
  /* Deps.autorun or 
  Tracker.autorun(function () {
    Meteor.subscribe("userData");
    Meteor.subscribe("allUserData");
});*/


Deps.autorun(function(){
  //Meteor.subscribe('scenariosAll'); //all available scenarios
  //http://stackoverflow.com/questions/15680461/meteor-collection-not-updating-subscription-on-client
  if(Router.current()!= null){
    //      console.log("Current path "+ Router.current().route.path());
  var routeName = Router.current().route.getName();
  //var routeNameOld = Router.previousPage().getName(); //this.location.path; //Location.back;
  //console.log("from "+ routeNameOld+" to " +routeName);
  highLightNavBatItem(routeName);
  }

});


  //ROUTES
  //====================================================================

  //global Router option to use a default layout template for all routes 
  Router.configure({
    layoutTemplate: 'complexLayout',
    loadingTemplate: "Loading",
    notFoundTemplate: "NotFound",
  //  yieldTemplates: {
  //      'FooterTemplate': {to: 'footer'}
  //    }
  });

  //map routes with templates
  Router.map(function(){
    //this.route('home', {path: '/'});
   this.route('/', function(){ //This approach seems to be working better that this.route('home', {path: '/'});
     this.render('home');
     //this.render('FooterTemplate', {to: 'footer'});
     //Router.go('home');
   });
   this.route('home');
   
   this.route('createNewScenario', function(){
      Session.set(_SCENARIO_FORM_STEP, _SCENARIO_FORM_STEP_BASIC_INFO);
      cleanNewScenarioForm();
      currentScenarioDTO = Session.get("currentScenarioDTO"); 
      hideScenarioFormButtons();
      Router.go('/newScenarioForm');

   });

   this.route('newScenarioForm' , 
     function ()  {
       currentScenarioDTO = Session.get("currentScenarioDTO"); 
       if(Session.get(_SCENARIO_FORM_STEP)==undefined){//could happen with reload
          Session.set(_SCENARIO_FORM_STEP, _SCENARIO_FORM_STEP_BASIC_INFO);
       }
       this.render('NewScenarioForm', {
         data : currentScenarioDTO,
         yieldTemplates: {
           'scenarioFormBasicInfo': {to: 'newScenarioStep'}
         }          
       });
       //this.render('FooterTemplate', {to: 'footer'});
       hideScenarioFormButtons();
     }
   );

    //Find scenarios using the URL
    this.route('/NewScenarioForm/:_id', function () {
      currentScenarioDTO = ScenariosAll.findOne({_id: this.params._id.trim()});
      //check if is a valid scenario or user has permission to see it
/* IMPROVEMENT. Allows to show scenarios that have been approved
      if(currentScenarioDTO===undefined){
        Session.set('auxScenarioID', this.params._id);
        this.render('/findByIDErrorTemplate');
      }else if(currentScenarioDTO.owner != Meteor.userId()){
        if(currentScenarioDTO.status == scenarioStatusEnum.APPROVED){
            this.render('NewScenarioForm', {data: currentScenarioDTO});
            Session.set("currentScenarioDTO", currentScenarioDTO);
        }else{
            Session.set('auxScenarioID', this.params._id);
            this.render('/findByIDErrorTemplate');
        }
      }else{
            this.render('NewScenarioForm', {data: currentScenarioDTO});
            Session.set("currentScenarioDTO", currentScenarioDTO);
      }
*/
      if(currentScenarioDTO===undefined || currentScenarioDTO.owner != Meteor.userId()){
        Session.set('auxScenarioID', this.params._id);
        this.render('/findByIDErrorTemplate');
      }else{
        this.render('NewScenarioForm', {data: currentScenarioDTO});
        //this.render('FooterTemplate', {to: 'footer'});
        Session.set("currentScenarioDTO", currentScenarioDTO); //Issue #3
      }     
    });

    this.route('new', function(){
      this.render('NewScenarioForm');
      //this.render('FooterTemplate', {to: 'footer'});
    });

//Template for when we are about to submit a scenario for approval
    this.route('scenarioFormSubmitConfirmation',  function () {
        currentScenarioDTO = Session.get("currentScenarioDTO"); 
        if(currentScenarioDTO == undefined || ! Meteor.userId()){
          //Router.go('/NotFound');
          this.render('NotFound');
        }else if (currentScenarioDTO.owner == Meteor.userId() && currentScenarioDTO.status == scenarioStatusEnum.UNSUBMITTED){
          this.render('scenarioFormSubmitConfirmation', { data : currentScenarioDTO } );
        }else{
          this.render('NotFound');
        }
      });

//Template to confirm submission of scenario
    this.route('scenarioFormThankYou',  function () {
       currentScenarioDTO = Session.get("currentScenarioDTO"); 
       if(currentScenarioDTO==undefined || !Meteor.userId()){
          this.render('NotFound');
       } else if(currentScenarioDTO.owner == Meteor.userId() && currentScenarioDTO.status == scenarioStatusEnum.SUBMITTED)
          this.render('scenarioFormThankYou', { data : currentScenarioDTO } );
      else{
          this.render('NotFound');
      }
    });

    //Template displaying all the info of a scenario
    this.route('/scenarioComplete/:_id', function(){
      currentScenarioDTO = ScenariosAll.findOne({_id: this.params._id.trim()});
      if(currentScenarioDTO===undefined || !Roles.userIsInRole(Meteor.user(), 'admin')
        /*currentScenarioDTO.owner != Meteor.userId()*/){
        Session.set('auxScenarioID', this.params._id);
      }else{
        this.render('scenarioCompleteForm', {data: currentScenarioDTO});
        Session.set("currentScenarioDTO", currentScenarioDTO); //Issue #3
        
      }
    });

/*    this.route('/scenarioComplete/:_id',{
      template : '/scenarioComplete/:_id',
      onBeforeAction : function(){
         currentScenarioDTO = ScenariosAll.findOne({_id: this.params._id.trim()});
         if(currentScenarioDTO===undefined || !Roles.userIsInRole(Meteor.user(), 'admin')
           ){
           Session.set('auxScenarioID', this.params._id);
           this.render('/findByIDErrorTemplate');
         }else{
           //console.log(JSON.stringify(currentScenarioDTO));
           this.render('scenarioCompleteForm', {data: currentScenarioDTO});
           Session.set("currentScenarioDTO", currentScenarioDTO); //Issue #3
          }
      },
      onAfterAction : function(){
        //initializeScenarioCompleteFormElements();
      }

    }
    ); */

   this.route('scenarioList' , function(){
     this.render('scenarioListTable', {data : { scenarios : MyScenarios.find({}, {sort: {createdAt: -1}}) }} );
   });
   this.route('approvedScenarioList' , function(){
     this.render('scenarioListTable', {data : { scenarios : scenariosAllApproved.find({}) }} );
   });
   this.route('recentSubmissionsScenarioList' , function(){
     if(!Roles.userIsInRole(Meteor.user(), ['admin'])){
        this.redirect('/');
     }else{
        this.render('scenarioListTable', {data : { scenarios : ScenariosAll.find({status : scenarioStatusEnum.SUBMITTED}) }} );
     }
   });

   this.route('usersList', {
    template : 'userList' ,//'userListTemplate',
    onBeforeAction : function(){
      if(Meteor.loggingIn()){//if login method is currently in progress
        this.render(this.loadingTemplate);
      }else if(!Roles.userIsInRole(Meteor.user(), ['admin'])){
        this.redirect('/');
      }else{
        //this.render('userListTemplate');
        this.next();
      }
      
    }
   });


////This is working code and is the version that should fly.
//    this.route('scenarioList', {
//       //path: 'scenarioList',
//       data:  function () { return { scenarios : MyScenarios.find({}, {sort: {createdAt: -1}}) /*return Scenarios*/}},
//       template : 'scenarioList'
//    }
//    );
   //this.route('scenarioList' 
   //  //, {data:  function () { return MyScenarios.find({}, {sort: {createdAt: -1}}) /*return Scenarios*/}} 
   //);
    this.route('findByIDTemplate');
    this.route('/findByIDTemplate/:_id', function () {
      findByID(this.params._id);
    });
    this.route('findByIDErrorTemplate');

    this.route('userList');

    this.route('userProfile' //, {data :function () { return userDTO.findOne({_id: this.userId} ) }}
       //,{data :function () { return Meteor.user()}} //working code
       // , { data: function(){return Meteor.users.findOne()} } //working code 
       ,{data : function(){ return AllTheUsers.findOne({_id: Meteor.userId()}) }}
      //,{data : function(){ return Meteor.users.findOne() }}//working code
    );
    this.route('/userProfile/:_id', function(){
      targetUser = AllTheUsers.findOne({_id: this.params._id.trim()});
      if(targetUser==undefined || !Roles.userIsInRole(Meteor.user(), ['admin'])){
        this.redirect('/');
      }else{
        this.render('userProfile', {data: targetUser});
      }
    });
    
    this.route('exampleScenario');

    //***** Footer *****
    this.route('disclaimer');
    this.route('privacyStatement');
    this.route('contactInfo');
    this.route('FeedbackForm'); //feedback form
    this.route('FeedbackFormThakYou'); //"thank you" page after submitting feedback

  });




  //HELPERS Template helpers
  //======================================================================

  Template.NewScenarioForm.helpers({
    //returns the template name of the dynamic template in the NewScenarioForm template  
    newScenarioStep : function(){
      var newScenarioStep = Session.get(_SCENARIO_FORM_STEP);
      if(newScenarioStep === _SCENARIO_FORM_STEP_BASIC_INFO)
        return _SCENARIO_FORM_STEP_BASIC_INFO_templateName;
      else if(newScenarioStep === _SCENARIO_FORM_STEP_ADVANCED_INFO)
        return _SCENARIO_FORM_STEP_ADVANCED_INFO_templateName;
      else if(newScenarioStep === _SCENARIO_FORM_STEP_SOLUTION)
        return _SCENARIO_FORM_STEP_SOLUTION_templateName;
      else //default
        return _SCENARIO_FORM_STEP_BASIC_INFO_templateName;
    },
    //returns if the parameter provided is the same than the ssesion variable "_SCENARIO_FORM_STEP"
    isScenarioStep: function(step) {
      var newScenarioStep = Session.get(_SCENARIO_FORM_STEP);
      return step==newScenarioStep;
    }
  });

  Template.scenarioFormBasicInfo.helpers({
      editableScn : function(){
        if(Session.get('currentScenarioDTO')==undefined)
          return true;
        else
          return Session.get('currentScenarioDTO').status==scenarioStatusEnum.UNSUBMITTED;
      }
  });

  Template.scenarioFormSolution.helpers({
  });

  Template.scenarioFormAdvancedInfo.helpers({
      advancedDetailsTemplateName : function(){
        var _advancedDetailsTemplateName = Session.get(_ADVANCEDDETAILS_TAB);
        if(_advancedDetailsTemplateName==undefined)
          return _ADT_HAZARDS_templateName;
        else
          return _advancedDetailsTemplateName;
      }
  });

//TODO: Should these duplicate methods become a UI.helper???

  Template.advancedDetailsHazards.helpers({
    hazardEntryList : function(){
      currentScenarioDTO = Session.get('currentScenarioDTO')
      if(currentScenarioDTO===undefined)
        return [];
      else
        return currentScenarioDTO.hazardEntryList;
    } 
  });

  Template.scenarioCompleteForm.helpers({
    hazardEntryList : function(){
      currentScenarioDTO = Session.get('currentScenarioDTO')
      if(currentScenarioDTO===undefined)
        return [];
      else
        return currentScenarioDTO.hazardEntryList;
    } 
  });

  Template.advancedDetailsEquipment.helpers({
    equipmentEntryList : function(){
      currentScenarioDTO = Session.get('currentScenarioDTO')
      if(currentScenarioDTO===undefined)
        return [];
      else
        return currentScenarioDTO.equipmentEntryList;
    } 
  });

  Template.scenarioCompleteForm.helpers({
    equipmentEntryList : function(){
      currentScenarioDTO = Session.get('currentScenarioDTO')
      if(currentScenarioDTO===undefined)
        return [];
      else
        return currentScenarioDTO.equipmentEntryList;
    } 
  });

  Template.advancedDetailsReferences.helpers({
    referenceEntryList : function(){
      currentScenarioDTO = Session.get('currentScenarioDTO')
      if(currentScenarioDTO===undefined)
        return [];
      else
        return currentScenarioDTO.referenceEntryList;
    } 
  });

  Template.scenarioCompleteForm.helpers({
    referenceEntryList : function(){
      currentScenarioDTO = Session.get('currentScenarioDTO')
      if(currentScenarioDTO===undefined)
        return [];
      else
        return currentScenarioDTO.referenceEntryList;
    } 
  });


  Template.advancedDetailsEnvironments.helpers({
    environmentEntryList : function(){
      currentScenarioDTO = Session.get('currentScenarioDTO')
      if(currentScenarioDTO===undefined)
        return [];
      else
        return currentScenarioDTO.environmentEntryList;
    } 
  });

  Template.scenarioCompleteForm.helpers({
    environmentEntryList : function(){
      currentScenarioDTO = Session.get('currentScenarioDTO')
      if(currentScenarioDTO===undefined)
        return [];
      else
        return currentScenarioDTO.environmentEntryList;
    } 
  });

  Template.advancedDetailsRoles.helpers({
    roleEntryList : function(){
      currentScenarioDTO = Session.get('currentScenarioDTO')
      if(currentScenarioDTO===undefined)
        return [];
      else
        return currentScenarioDTO.roleEntryList;
    } 
  });

  Template.scenarioCompleteForm.helpers({
    roleEntryList : function(){
      currentScenarioDTO = Session.get('currentScenarioDTO')
      if(currentScenarioDTO===undefined)
        return [];
      else
        return currentScenarioDTO.roleEntryList;
    } 
  });

  Template.scenarioCompleteForm.helpers({
    hazardEntryListCount : function(){
      currentScenarioDTO = Session.get('currentScenarioDTO');
      hazardEntryList = currentScenarioDTO==undefined?[]:currentScenarioDTO.hazardEntryList;
      if(hazardEntryList==undefined)
        return 0;
      else
        return hazardEntryList.length;
    },
    equipmentEntryListCount: function(){
      currentScenarioDTO = Session.get('currentScenarioDTO');
      equipmentEntryList = currentScenarioDTO==undefined?[]:currentScenarioDTO.equipmentEntryList;
      if(equipmentEntryList==undefined)
        return 0;
      else
        return equipmentEntryList.length;
    }
    ,referenceEntryListCount: function(){
      currentScenarioDTO = Session.get('currentScenarioDTO');
      referenceEntryList = currentScenarioDTO==undefined?[]:currentScenarioDTO.referenceEntryList;
      if(referenceEntryList==undefined)
        return 0;
      else
        return referenceEntryList.length;
    }
    ,getScenarioLockOwner : function(){
      currentScenarioDTO = Session.get('currentScenarioDTO');
      if(currentScenarioDTO && currentScenarioDTO.lockOwnerID)
        return ("Scenario is unlocked to user "+currentScenarioDTO.lockOwnerID);
      else
        return "Scenario is locked for modification";
    }
    /** retruns true if current user can approve the scenario
    The current user could perform the action to approve a scenario if
    - The scenario is in SUBMITED state AND
    - If scenario is locked, the current user (an admin) is the owner of that lock 
    - OR if nobody has the lock (and user is an admin)
    */
    ,canApproveScenario : function(){
      currentScenarioDTO = Session.get('currentScenarioDTO');
      if(currentScenarioDTO.status!=scenarioStatusEnum.SUBMITTED)
        return false;

      if(isScenarioLocked(currentScenarioDTO)){
        return Meteor.userId()==currentScenarioDTO.lockOwnerID;
      }else
        return true;

    }
  });


 Template.userProfile.helpers({
   userLoggedIn : function(){
     return Meteor.userId();
   }/*, 
   userData : function(){
     return userDTO;
   }*/
 });

 Template.userList.helpers({
    usuarios: function () {
      //added maping function so there is an index associated with each document
      return AllTheUsers.find().map(function(document, index){
            document.index = index;
            return document;
          });
    },
 });

//Adds an index to each document
var addIndexToDocument = function(document, index){
  document.index = index;
  return document;
}



 Template.findByIDErrorTemplate.helpers({
    scenarioID : function(){
      return Session.get('auxScenarioID');
    }
 });

 Template.userDataTemplate.helpers({
  //XXX these two functions will eventually need to take care of 
  // Meteor.user().services.google.email
    useremail : function(){
      if(Meteor.userId() && Meteor.user().emails){
        return Meteor.user().emails[0].address;
      }else
        return 'not specified';
    },
    verifiedUseremail : function(){
      if(Meteor.userId() && Meteor.user().emails!=undefined)
        return Meteor.user().emails[0].veified;
      else
        return 'not applicable';
    }
 });


 //OTHER HELPERS
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


UI.registerHelper('getTablePijamaClass', function(index){

//  if(typeof index != 'number')
//    index2 = parseInt(index);

  if(index%2==0)
    return "tablePijamaEvenRow";
  else 
    return "tablePijamaOddRow";

});

/** Return the length of an arrayObject
*/
UI.registerHelper('count', function(arrayObject){
  return arrayObject.length;
});

//Returns if a scenario is editable or not
//UI.RegisterHelper('isScenarioEditable', );

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
  return moment(date).format('MM-DD-YYYY, hh:mm:ss');
});

//Formats a Date using mask MM-DD-YYYY
UI.registerHelper('formatDate', function(date) {
  return moment(date).format('MM-DD-YYYY');
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



/* Shows or hides the guidelines div according to the value of the button
*/
UI.registerHelper('getGuidelinesButtonClass' , function(){
  if(!Session.get('showGuidelines')){
    return 'guidelinesHidden';
  }else{
    return '';
  }
});

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



  //EVENTS Template events
  //============================================================================
  Template.NewScenarioForm.events({
    "click #saveScenarioButton" : function(){ 
      //event.preventDefault();  
      collectScenarioInfo(); // Collects data from the form into an object
      currentScenarioDTO = Session.get('currentScenarioDTO');
     // console.log("save "+JSON.stringify(currentScenarioDTO));
      if(currentScenarioDTO.title.trim()==''){
        window.alert("The scenario needs at least a TITLE in order to be persisted. \n\nTitles are a human-friendly way of summarizing the content of the scenario and will make easier to identify your scenario later.");

        //set focus on the title text area
        var step = Session.get(_SCENARIO_FORM_STEP);
        if(step==undefined || step === _SCENARIO_FORM_STEP_BASIC_INFO){
          $("#title").focus();
        }
      } else {
        // Save the scenario
        //Meteor.call("saveScenario", currentScenarioDTO); //working code
        Meteor.call("saveScenario", currentScenarioDTO, function(err, callbackScenarioDTO) {
          //callback function
             if (err){  
              console.log(err);
              window.alert("The scenario could NOT be persisted. \n\n"+err.error);
            }else{
              //currentScenarioDTO._id = callbackScenarioDTO._id;
              currentScenarioDTO = callbackScenarioDTO;
              Session.set('currentScenarioDTO', currentScenarioDTO);
              Router.go("/NewScenarioForm");
              //Meteor._reload.reload();
            }

          });
        }
    }
    ,"click #submitScenarioButton" : function(){ 
      collectScenarioInfo(); // Collects data from the form into an object
       //Validations
       //1. Title can't be empty
       //2. Description can't be empty
      
       if(currentScenarioDTO.title.trim()=='')
         window.alert("To submit a scenario for revision and approval, the scenario TITLE can not be empty");
         // throw new Meteor.Error("'Title' can NOT be empty"); //TO-DO do something with this error
       else if (currentScenarioDTO.description.trim()==''){
         window.alert("To submit a scenario for revision and approval, the scenario DESCRIPTION can not be empty");
         //  throw new Meteor.Error("'Description' can NOT be empty");//TO-DO do something with this error
       }else{
          Meteor.call("saveScenario", currentScenarioDTO, function(err, callbackScenarioDTO) {
          //callback function
            if (err) { 
              console.log(err);
            }else{
             //currentScenarioDTO._id = callbackScenarioDTO._id;
             currentScenarioDTO = callbackScenarioDTO;
             Session.set('currentScenarioDTO', currentScenarioDTO);
             Router.go('scenarioFormSubmitConfirmation');//submit
             //Meteor._reload.reload();
            }
          });
       }
    }
    //onClick button change template
    , "click #goToStep1": function(){
      collectScenarioInfo();
      Session.set(_SCENARIO_FORM_STEP, _SCENARIO_FORM_STEP_BASIC_INFO);
      hideScenarioFormButtons();
    }
    , "click #goToStep2": function(){
      collectScenarioInfo();
      Session.set(_SCENARIO_FORM_STEP, _SCENARIO_FORM_STEP_ADVANCED_INFO);
      Session.set(_ADVANCEDDETAILS_TAB, _ADT_HAZARDS_templateName);
      hideScenarioFormButtons();
    }
    , "click #goToStep3": function(event, template){
      collectScenarioInfo();
      Session.set(_SCENARIO_FORM_STEP, _SCENARIO_FORM_STEP_SOLUTION);
      hideScenarioFormButtons();
    }
    , "click #showGuidelines" : function(){
     //toggle value of the button and update reactive variable
      var buttonName = $('#showGuidelines').html();
      if(buttonName=='Show Guidelines'){
        $('#showGuidelines').html('Hide Guidelines');
         Session.set('showGuidelines', true);
      }else{
        $('#showGuidelines').html('Show Guidelines');
        Session.set('showGuidelines', false);
      }
    }
    ,  "click #deleteButton": function () {
    var confirm = window.confirm("Are you sure you want to delete scenario with UID "+this._id+ " \ntitled \""+ this.title+"\"");
    if(confirm){

      if(this._id)
        Meteor.call("deleteScenario", this._id, function(err, result) {
            //callback function
               if (err){
                  console.log(err);
               }else{
                  Session.set('currentScenarioDTO', undefined);
               }
            });
      else
        Session.set('currentScenarioDTO', undefined);
    }

    }
});

Template.scenarioFormAdvancedInfo.events({
      //onClick buttons from Advanded Info nav bar dinamically change (sub)template
      "click #hazardsButton": function(){
      collectScenarioInfo();
      Session.set(_ADVANCEDDETAILS_TAB, _ADT_HAZARDS_templateName);
     // hideScenarioFormButtons();
    }
    , "click #equipmentButton": function(){
     collectScenarioInfo();
      Session.set(_ADVANCEDDETAILS_TAB, _ADT_EQUIPMENT_templateName);
     // hideScenarioFormButtons();
    }
    , "click #lessonsLearnedButton": function(){
     collectScenarioInfo();
      Session.set(_ADVANCEDDETAILS_TAB, _ADT_LESSONSLEARNED_templateName);
     // hideScenarioFormButtons();
    }    
    , "click #referencesButton": function(){
     collectScenarioInfo();
      Session.set(_ADVANCEDDETAILS_TAB, _ADT_REFERENCES_templateName);
     // hideScenarioFormButtons();
    }  
    , "click #rolesButton": function(){
     collectScenarioInfo();
      Session.set(_ADVANCEDDETAILS_TAB, _ADT_ROLES_templateName);
     // hideScenarioFormButtons();
    }  
    , "click #environmentsButton": function(){
     collectScenarioInfo();
      Session.set(_ADVANCEDDETAILS_TAB, _ADT_PLACES_templateName);
     // hideScenarioFormButtons();
    }  

});

/***** HAZARDS *****/

Template.hazardInput.events({
  "click #addNewHazard": function(){
    hazardEntryList = updateHarzardList();
    currentScenarioDTO.hazardEntryList = hazardEntryList;
    //console.log(JSON.stringify(currentScenarioDTO.hazardEntryList));
    Session.set("currentScenarioDTO", currentScenarioDTO);
  }
  });

Template.hazardEntry.events({
    "click #deleteHazard" : function(event){
    event.preventDefault();
    currentScenarioDTO =  Session.get("currentScenarioDTO");
    hazardEntryList = currentScenarioDTO.hazardEntryList;
    //find and delete by index
    hazardEntryList = deleteFromArrayByID(this.id, hazardEntryList)
    currentScenarioDTO.hazardEntryList = currentScenarioDTO.hazardEntryList;
    Session.set("currentScenarioDTO", currentScenarioDTO);
  }
});

/***** EQUIPMENT *****/

Template.equipmentInput.events({
  "click #addNewEquipment": function(){
    currentScenarioDTO.equipmentEntryList = updateEquipmentList();
    Session.set("currentScenarioDTO", currentScenarioDTO);
  }
});

Template.equipmentEntry.events({
  "click #deleteEquipment" : function(event){
    event.preventDefault();
    currentScenarioDTO =  Session.get("currentScenarioDTO");
    equipmentEntryList = currentScenarioDTO.equipmentEntryList;
    //find and delete by index
    currentScenarioDTO.equipmentEntryList = deleteFromArrayByID(this.id, equipmentEntryList)
    Session.set("currentScenarioDTO", currentScenarioDTO);
  }
});


/***** REFERENCES *****/

Template.referenceInput.events({
  "click #addNewReference": function(){
    referenceEntryList = updateReferenceList();
    currentScenarioDTO.referenceEntryList = referenceEntryList;
    Session.set("currentScenarioDTO", currentScenarioDTO);
  }
});

Template.referenceEntry.events({
  "click #deleteReference" : function(event){
    event.preventDefault();
    currentScenarioDTO =  Session.get("currentScenarioDTO");
    referenceEntryList = currentScenarioDTO.referenceEntryList;
    //find and delete by index
    referenceEntryList = deleteFromArrayByID(this.id, referenceEntryList)
    currentScenarioDTO.referenceEntryList = currentScenarioDTO.referenceEntryList;
    Session.set("currentScenarioDTO", currentScenarioDTO);
  }
});


/***** CLINICAL ROLES *****/

Template.roleInput.events({
    "click #addActor": function(){
    roleEntryList = updateRoleList();
    currentScenarioDTO.roleEntryList = roleEntryList;
    Session.set("currentScenarioDTO", currentScenarioDTO);
  }
});

Template.roleEntry.events({
  "click #deleteRole" : function(event){
    //event.preventDefault();
    currentScenarioDTO =  Session.get("currentScenarioDTO");
    roleEntryList = currentScenarioDTO.roleEntryList;
    //find and delete by index
    roleEntryList = deleteFromArrayByID(this.id, roleEntryList)
    currentScenarioDTO.roleEntryList = roleEntryList;
    Session.set("currentScenarioDTO", currentScenarioDTO);
  }
});


/***** CLINICAL ENVIRONMENTS *****/

Template.environmentInput.events({
  "click #addPlace": function(){
    currentScenarioDTO.environmentEntryList = updateEnvironmentList();
    Session.set("currentScenarioDTO", currentScenarioDTO);
  }
});

Template.environmentEntry.events({
  "click #deletePlace" : function(event){
    //event.preventDefault();
    currentScenarioDTO =  Session.get("currentScenarioDTO");
    environmentEntryList = currentScenarioDTO.environmentEntryList;
    //find and delete by index
    currentScenarioDTO.environmentEntryList = deleteFromArrayByID(this.id, environmentEntryList);
    Session.set("currentScenarioDTO", currentScenarioDTO);
  }
});

/** Template used to display the info and form to allow user submitting their scenario for approval
*/
Template.scenarioFormSubmitConfirmation.events({

  "click #declineSubmit": function(){
    Session.set(_SCENARIO_FORM_STEP, _SCENARIO_FORM_STEP_BASIC_INFO);
    Router.go("newScenarioForm");//redirect to the Scenario Form
  },
  "click #acceptSubmit": function(event, template){
    var acceptChecked = $("#acceptanceCheck").prop("checked");
    if(acceptChecked){
      //1. save (persist) scenario
      //2. redirect to thank you page (on callback)
      currentScenarioDTO = Session.get('currentScenarioDTO');
      currentScenarioDTO.status = scenarioStatusEnum.SUBMITTED;
      Meteor.call("saveScenario", currentScenarioDTO, function(err, callbackScenarioDTO) {
          //callback function
             if (err){
                console.log(err);
                //redirect to "Sorry the wasa problem - retry page"
             }
            currentScenarioDTO = callbackScenarioDTO;
            Session.set('currentScenarioDTO', currentScenarioDTO);
            Router.go("scenarioFormThankYou");//2. redirect to thank you page (on callback)
          });  
    }else{
      window.alert("Mark that you have understood the Clinical Scenario Repository policies to submit your scenario");
    }
  }
});


/** Events on the form used to display the complete scenario information in one single place
*/
Template.scenarioCompleteForm.events({
  "click #lockButton" : function(){

     //toggle value of the button and update reactive variable
      var buttonName = $('#lockButton').html();
      //console.log(buttonName);
      if(buttonName==_LOCKBUTTON_NAME_LOCK){
        Meteor.call('lockScenario', Session.get('currentScenarioDTO'), function(err, callbackScenarioDTO){
          //callback function
             if (err){  
              console.log(err);
              window.alert("The scenario could NOT be locked. \n\n"+err.error);
            }else{
              Session.set('currentScenarioDTO', callbackScenarioDTO);
            }
        });
      }else{//unlock
        Meteor.call('unlockScenario', Session.get('currentScenarioDTO'), function(err, callbackScenarioDTO){
          //callback function
             if (err){  
              console.log(err);
              window.alert("The scenario could NOT be unlocked. \n\n"+err.error);

            }else{
              Session.set('currentScenarioDTO', callbackScenarioDTO);
            }
        });
      }
  }
  ,"click #saveChanges" : function(){
      collectScenarioCompleteFormInfo();
      Meteor.call("saveScenario", Session.get('currentScenarioDTO'), function(err, callbackScenarioDTO) {
          //callback function
            if (err){
                console.log(err);
                //redirect to "Sorry the wasa problem - retry page"
            }else{
                Session.set('currentScenarioDTO', callbackScenarioDTO);
            }
      }); 


  }
  ,"click #discardChanges" : function(){
  }
  ,"click #approveScenario" : function(){
    var confirm = window.confirm("Are you sure you want to approve the current scenario: \n\n"+Session.get('currentScenarioDTO').title);
    //console.log(confirm);
    if(confirm){
      //collect new info (if any) from the scenario
      collectScenarioCompleteFormInfo();

      currentScenarioDTO = Session.get('currentScenarioDTO');

      currentScenarioDTO.status = scenarioStatusEnum.APPROVED;
      currentScenarioDTO.lockOwnerID = undefined;
      currentScenarioDTO.lockOwnerName = undefined;
      currentScenarioDTO.approverID = Meteor.userId();
      currentScenarioDTO.approverName = Meteor.user().username;  
      currentScenarioDTO.approvedAt = new Date();  

      Meteor.call("saveScenario", currentScenarioDTO, function(err, callbackScenarioDTO) {
          //callback function
            if (err){
                console.log(err);
                //redirect to "Sorry the wasa problem - retry page"
            }else{
                Session.set('currentScenarioDTO', callbackScenarioDTO);
            }

          }); 
    }

  }

});

Template.FeedbackForm.events({

  //detect a submit event in the form FeedbackForm
  "submit #feedbackPanel": function(event) {

    event.preventDefault(); // Prevent default form submit
    //harvest values from the form
    //template.find("#title").value;
    var rateSite = trimInput(event.target.rateSite.value);
    var rateNavigation = trimInput(event.target.rateNavigation.value);
    var rateOrganization = trimInput(event.target.rateOrganization.value);
    var rateLogin = trimInput(event.target.rateLogin.value);
    var rateClarity = trimInput(event.target.rateClarity.value); 

    var rateSections = trimInput(event.target.rateSections.value);
    var rateUsefulness = trimInput(event.target.rateUsefulness.value);
    var rateAppearance = trimInput(event.target.rateAppearance.value);
    var rateGeneral = trimInput(event.target.rateGeneral.value);

    //validation
    if(rateSite===""){
      window.alert("Fields marked with an asterisk are mandatory");
        throw new Meteor.Error("'rateSite' can NOT be empty"); //TO-DO do something with this error
    }

    var feedbackDto = {
      rateSite : rateSite,
      rateNavigation : rateNavigation,
      rateOrganization :rateOrganization,
      rateLogin : rateLogin,
      rateClarity : rateClarity,
      rateSections :rateSections,
      rateUsefulness : rateUsefulness,
      rateAppearance : rateAppearance,
      rateGeneral : rateGeneral
    }

    Meteor.call("saveFeedback", feedbackDto);
    //TODO? clean from
    Router.go("/FeedbackFormThakYou") //redirect user to "Thank you page"

  }
});


//Events on the navigation bar
Template.NavBar.events({
});

Template.scenarioRow.events({
  "click #visitScenario" : function(event){
    var currentPath = Router.current().route.getName()
    //do an action or another based on the route
    if(currentPath=='scenarioList'){
      //find by ID, with the scn ID being in the text of the button just clicked
      findByID(event.target.name);
    }else if(currentPath=='recentSubmissionsScenarioList'){
      Router.go("/scenarioComplete/"+event.target.name)
    }else if(currentPath=='approvedScenarioList'){
      //findByID(event.target.name);
      Router.go("/scenarioComplete/"+event.target.name);
    }

  }
});

Template.findByIDTemplate.events({
  //on click the search button
  "click #searchByIDButton" : function(event, template){
    //event.preventDefault();
    //Fetch and process input
    var scenarioID = template.find("#findByIDbox").value;
    scenarioID = scenarioID.trim();
    findByID(scenarioID); 
    //clear
    template.find("#findByIDbox").value = "";
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
});


/** User profile template
*/ 
Template.userProf.events({
  "click #seeUser" : function(event){
    event.preventDefault();
    Router.go('/userProfile/'+event.target.name);
  }

});


//OTHER CLIENT FUNCTIONS
//========================================================================

//To configure the accounts UI
Accounts.ui.config({
  //passwordSignupFields: "USERNAME_ONLY"
  passwordSignupFields: 'USERNAME_AND_EMAIL'
});


//AUX FUNCTIONS
//=========================================================================


// trim whitespace helper function
var trimInput = function(val) {
  return val.replace(/^\s*|\s*$/g, "");
}

/** Returns a boolean to indicare if the provided scenario is editable or not.
1. If the scenario is UNSUBMITTED it should only be editable by the the owner (current user is owner)
2. If the scenario is SUBMITTED or APPROVED is editable if the current user is the scenario lock's owner
NOTE: tis simple approach does not have in consideration the anonymous scenarios
*/
var isScenarioEditable = function(currentScenarioDTO){
  //console.log(JSON.stringify(currentScenarioDTO));
  if(currentScenarioDTO == undefined ){
    return true;
  }
  if(currentScenarioDTO.status == scenarioStatusEnum.UNSUBMITTED){
    //console.log("userID "+Meteor.userId()+ " scenario Owner "+currentScenarioDTO.owner);
    return (Meteor.userId()== currentScenarioDTO.owner) || (currentScenarioDTO.owner==undefined);
  }

  if(currentScenarioDTO.status == scenarioStatusEnum.SUBMITTED || currentScenarioDTO.status == scenarioStatusEnum.APPROVED){
    if(currentScenarioDTO.lockOwnerID && Meteor.userId()){
      return (Meteor.userId()==currentScenarioDTO.lockOwnerID);
    }else{
      return false;
  }
  
}

//otherwise
  return false;
}

/** Returns a boolean to indicare if the provided scenario is locked for modification or not.
*/ 
var isScenarioLocked = function(currentScenarioDTO){
  if(currentScenarioDTO && currentScenarioDTO.lockOwnerID)
    return true;
  else
    return false;  
}

//Hides the button corresponding to the panel of the Scenario Form
// in which we are by changing the button class.
var hideScenarioFormButtons = function(){

//1. Navigation buttons
//remove the btn-salmon class from all three buttons. Add blue button class for the three of them
//btn btn-small btn-blue
  $("#goToStep1").removeClass("btn-salmon");
  $("#goToStep2").removeClass("btn-salmon");
  $("#goToStep3").removeClass("btn-salmon");
  $("#goToStep1").addClass("btn-blue");
  $("#goToStep2").addClass("btn-blue");
  $("#goToStep3").addClass("btn-blue");

//figure out in which panel we are and add the slamon button class to just that button
  var newScenarioStep = Session.get(_SCENARIO_FORM_STEP);

  if(newScenarioStep === _SCENARIO_FORM_STEP_BASIC_INFO){
    $("#goToStep1").removeClass("btn-blue");
    $("#goToStep1").addClass("btn-salmon");
  }
  else if(newScenarioStep === _SCENARIO_FORM_STEP_ADVANCED_INFO){
    $("#goToStep2").removeClass("btn-blue");
    $("#goToStep2").addClass("btn-salmon");
  }
  else if(newScenarioStep === _SCENARIO_FORM_STEP_SOLUTION){
    $("#goToStep3").removeClass("btn-blue");
    $("#goToStep3").addClass("btn-salmon");
  }else {//default
    $("#goToStep1").removeClass("btn-blue");
    $("#goToStep1").addClass("btn-salmon");
  }

 };


//Highlights the element of the navigation bar that idenfifies the route where we are on
 var highLightNavBatItem = function(routeName){
  //clean. Remove the class from all main nav bar items
  $("#cnsNavBarItem").removeClass("selectedNavItem");
  $("#ssNavBarItem").removeClass("selectedNavItem");  
  $("#fbiNavBarItem").removeClass("selectedNavItem");
  $("#feedNavBarItem").removeClass("selectedNavItem");  
  $("#homeNavBarItem").removeClass("selectedNavItem");
  $("#upNavBarItem").removeClass("selectedNavItem");
  $("#listUsersNavBarItem").removeClass("selectedNavItem");

  //ID the route we are on
  var navItemID;

  if(routeName==undefined)
    return;

  if(routeName=='/' || routeName=='home')
    navItemID = 'homeNavBarItem';
  else   if(routeName=='createNewScenario' || routeName=='newScenarioForm' || (routeName.lastIndexOf('NewScenarioForm', 0) === 0) ||
      routeName=='new' || routeName=='scenarioFormSubmitConfirmation' || routeName=='scenarioFormThankYou')
    navItemID = 'cnsNavBarItem';
  else   if(routeName=='scenarioList' || routeName=='approvedScenarioList')
    navItemID = 'ssNavBarItem';
  else   if(routeName=='findByIDTemplate')
    navItemID = 'fbiNavBarItem';
  else   if(routeName=='userProfile' || (routeName.substring(0,'userProfile'.length)==='userProfile'))
    navItemID = 'upNavBarItem';
  else   if(routeName=='FeedbackForm' || routeName=='FeedbackFormThakYou')
    navItemID = 'feedNavBarItem';
  else if(routeName=='usersList')
    navItemID = 'listUsersNavBarItem';

  //add the "shaded" class to that nav bar item
  $("#"+navItemID).addClass("selectedNavItem");
 }

 /** Collects data from the New Scenario form into an object and
 sets the variable currentScenarioDTO with the information from the templates
 */
 var collectScenarioInfo = function(){
 
  //if there is no scenario in session, we create a new one.
  if(currentScenarioDTO==undefined){
    cleanNewScenarioForm();
    currentScenarioDTO =  Session.get("currentScenarioDTO");
  }


//We need to determin which (sub)template is rendered, becuse otherwise the components won't exits and 
// trying to get their value (which woulb be 'undefined') would persist 'undefined' for those attributes.
  if(Session.get(_SCENARIO_FORM_STEP) === _SCENARIO_FORM_STEP_BASIC_INFO){
    currentScenarioDTO.title = $('#title').val();
    currentScenarioDTO.description = $("#description").val();
  } else  if(Session.get(_SCENARIO_FORM_STEP) === _SCENARIO_FORM_STEP_SOLUTION){
    currentScenarioDTO.solutionDescription = $('#solutionDescription').val();
    currentScenarioDTO.benefitsDescription = $("#benefitsDescription").val();
    currentScenarioDTO.risksDescription = $("#risksDescription").val();
  } else if(Session.get(_SCENARIO_FORM_STEP) === _SCENARIO_FORM_STEP_ADVANCED_INFO){
    
    if(Session.get(_ADVANCEDDETAILS_TAB) === _ADT_LESSONSLEARNED_templateName){
      currentScenarioDTO.lessonsLearned = $('#lesson').val();
      currentScenarioDTO.preventable    = $('#preventable').val();
    }

  }
  Session.set("currentScenarioDTO", currentScenarioDTO);
}

/** Collects the information from the components of the form scenarioCompleteForm
  and puts the object in session
*/
  var collectScenarioCompleteFormInfo = function(){
  // Collects data from the form into an object
  currentScenarioDTO =  Session.get("currentScenarioDTO");

  //if there is no scenario in session (really unlikely for this template), we create a new one.
  if(currentScenarioDTO==undefined){
    cleanNewScenarioForm();
    currentScenarioDTO =  Session.get("currentScenarioDTO");
    //NOTE: the sceanrio status is going to be "UNSUBMITTED"
  }

  currentScenarioDTO.title = $('#title').val();
  currentScenarioDTO.description = $("#description").val();

  currentScenarioDTO.solutionDescription = $('#solutionDescription').val();
  currentScenarioDTO.benefitsDescription = $("#benefitsDescription").val();
  currentScenarioDTO.risksDescription = $("#risksDescription").val();

  currentScenarioDTO.lessonsLearned = $('#lesson').val();
  currentScenarioDTO.preventable = $('#preventable').val();

  Session.set("currentScenarioDTO", currentScenarioDTO);
 };

 //Cleans the input fields of the new scenario form as well as the currentScenarioDTO session variable
 var cleanNewScenarioForm = function(){

  var newCleanScenarioDTO = {
    title : '',
    description : '',
    solutionDescription : '',
    benefitsDescription : '',
    risksDescription : '',
    status : scenarioStatusEnum.UNSUBMITTED, //new
    lessonsLearned : '',  //scenarioFormAdvancedInfo.LeesonsLearned
    preventable : '',     //scenarioFormAdvancedInfo.preventable
    hazardEntryList : [],       //new empty "list"
    referenceEntryList : [],    //new empty "list"
    roleEntryList : [],               //new empty "list"
    environmentEntryList : [],        //new empty "list"
    equipmentEntryList : []           //new empty "list"

  };
  currentScenarioDTO = newCleanScenarioDTO;
  //this copy of a new object is to force the creation of a new DTO that
  // does not have an _Id. This way, we won't need to overwrite the one
  // the DTO has and create a problem for Meteor Mongo inserts
  // (with an _Id that is not a non-empty strring or an object ID)

  //scenarioFormBasicInfo
  $('#title').val("");  //currentScenarioDTO.title = "";
  $('#description').val("");  //currentScenarioDTO.description = "";
  //scenarioFormAdvancedInfo
  //TODO
  //scenarioFormSolution
  $('#solutionDescription').val("");  //currentScenarioDTO.solutionDescription = "";
  $('#benefitsDescription').val("");  //currentScenarioDTO.benefitsDescription = "";
  $('#risksDescription').val("");     //currentScenarioDTO.risksDescription = "";

  $('#lesson').val("");
  
  Session.set("currentScenarioDTO", currentScenarioDTO);
 };

//Finds a scenario from the current collection by ID
var findByID = function(scenarioID){
   //1. validation that the input is valid
   if(scenarioID==='')
     alert("The scenario ID can not be empty")
   else{
     //2. Search
     currentScenarioDTO = ScenariosAll.findOne({_id: scenarioID});
    // console.log("recovered "+JSON.stringify(currentScenarioDTO));

     //3. Check authorization: user must be scenario owner or scenario must be "approved"
     if(currentScenarioDTO===undefined ||
       currentScenarioDTO.owner != Meteor.userId()){

        Session.set('auxScenarioID', scenarioID);
         //console.log(JSON.stringify(currentScenarioDTO));
        Router.go('/findByIDErrorTemplate'); //redirect to error page
        //Router.go('findByIDErrorTemplate', {data : function() {return scenarioID}});
        
     }else{
       Session.set(_SCENARIO_FORM_STEP, _SCENARIO_FORM_STEP_BASIC_INFO);
       Session.set("currentScenarioDTO", currentScenarioDTO);
       Router.go("/newScenarioForm", {
        // data : currentScenarioDTO,
         yieldTemplates: {
               'scenarioFormBasicInfo': {to: 'newScenarioStep'}
         }
       });
     }

   } 
 }

//deletes the element with the given ID from the array
var deleteFromArrayByID = function(ID, array){
  for(var i = 0; i<array.length; i++){
    listItem = array[i];
    if(listItem.id !=undefined && listItem.id===ID){
      array.splice(i, 1);
    }
  }
  return array;
}

//reads the hazard description that is in the form and returns the 
// updated hazards list
var updateHarzardList = function(){
  
    currentScenarioDTO = Session.get("currentScenarioDTO");
    hazardEntryList = currentScenarioDTO.hazardEntryList;

    var _hazardDescription = $("#hazardDescription").val();
    var _hazardRisk = $("#hazardRisk").val();
    var _hazardSeverity = $("#hazardSeverity").val();
    if(_hazardDescription.trim()!= ''){
      var listItem = {
        hazardDescription : _hazardDescription,
        hazardRisk : _hazardRisk,
        hazardSeverity : _hazardSeverity,
        id :  hazardEntryList.length
      }
  
      hazardEntryList[hazardEntryList.length] = listItem;
      //currentScenarioDTO.hazardEntryList = hazardEntryList;
    }
    //clear form
    $("#hazardDescription").val('');
    $("#hazardRisk").val("Unknown");
    $("#hazardSeverity").val("Unknown");

    return hazardEntryList
}

//reads the equipment description that is in the form and returns the 
// updated equipment list
var updateEquipmentList = function(){
  
    currentScenarioDTO = Session.get("currentScenarioDTO");
    equipmentEntryList = currentScenarioDTO.equipmentEntryList;

    var _deviceType = $("#deviceType").val();
    var _manufacturer = $("#deviceManufacturer").val();
    var _model = $("#deviceModel").val();
    var _rosetta = $("#deviceRosetta").val();
    if(_deviceType.trim()!= ''){
      var listItem = {
        deviceType : _deviceType,
        manufacturer : _manufacturer,
        model : _model,
        rosetta : _rosetta,
        trainingRelated :  $("#trainingRelated:checked").val(),
        instructionsRelated : $("#instructionsRelated:checked").val(),
        confusingRelated : $("#confusingRelated:checked").val(),
        softwareRelated :  $("#softwareRelated:checked").val(),
        hardwareRelated :  $("#hardwareRelated:checked").val(),
        id :  equipmentEntryList.length
      }
  
      equipmentEntryList[equipmentEntryList.length] = listItem;
    }
    //clear form
    $("#deviceType").val('');
    $("#deviceManufacturer").val('');
    $("#deviceModel").val('');
    $("#deviceRosetta").val('');

    //Issue #8. Uncheck all
    $("#trainingRelated")[0].checked = false;//.attr('checked', false); //.checked = false;
    $("#instructionsRelated").attr('checked', false); //.checked = false;
    $("#confusingRelated").attr('checked', false); //.checked = false;
    $("#softwareRelated").prop('checked', false); //for jQuery 1.6+ //.checked = false;
    $("#hardwareRelated:checked").attr('checked', false); //.checked = false;

    return equipmentEntryList
}


//reads the reference description that is in the advancedDetailsReferences template
// and updates the references list
var updateReferenceList = function(){

    currentScenarioDTO = Session.get("currentScenarioDTO");
    referenceEntryList = currentScenarioDTO.referenceEntryList;

    var _referenceUrlProtocol = $("#referenceUrlProtocol").val();
    var _referenceUrl = $("#referenceUrl").val();
    var _referenceRelevance = $("#referenceRelevance").val();
    if(_referenceUrl.trim() != ""){
      var listItem = {
        referenceUrl : _referenceUrlProtocol + _referenceUrl,
        referenceRelevance : _referenceRelevance,
        id : referenceEntryList.length
      }
      referenceEntryList[referenceEntryList.length] = listItem;
    }

    //clean form 
    $("#referenceUrlProtocol").val("http://");
    $("#referenceUrl").val('');
    $("#referenceRelevance").val('');

    return referenceEntryList;
}

//reads the Roles Involved panel and updates the clinical roles list
var updateRoleList = function(){
   currentScenarioDTO = Session.get("currentScenarioDTO");
   roleEntryList = currentScenarioDTO.roleEntryList;

   var role = $("#clinicalRole").val();
   item = {role : role, id : roleEntryList.length};
   roleEntryList[roleEntryList.length] = item;
   
   return roleEntryList;
}

//reads the Environments Involved panel and updates the clinical environments list
var updateEnvironmentList = function(){
   currentScenarioDTO = Session.get("currentScenarioDTO");
   environmentEntryList = currentScenarioDTO.environmentEntryList;

   var place = $("#clinicalEnvironment").val();
   item = {place : place, id : environmentEntryList.length};
   environmentEntryList[environmentEntryList.length] = item;
   
   return environmentEntryList;
}


}//meteor.isClient


//COMMON METHODS 
//======================================================================================

Meteor.methods({

  //persist an scenario
  saveScenario: function(currentScenarioDTO){
    // Make sure the user is logged in before allowing manipulating a scenario
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }


    //Distinguish between inserts and updates with the _id property
    // we could have used the "upsert" modifier of the update
    if(currentScenarioDTO._id===undefined){
      //insert
      currentScenarioDTO.createdAt = new Date();              //current time
      currentScenarioDTO.modifiedAt =  currentScenarioDTO.createdAt;
      currentScenarioDTO.owner = Meteor.userId();             // _id of logged in user
      currentScenarioDTO.username = Meteor.user().username;   // username of logged in user
      //currentScenarioDTO.status = scenarioStatusEnum.UNSUBMITTED;
    
      var scenarioUID = Scenarios.insert(currentScenarioDTO);
      currentScenarioDTO._id = scenarioUID;

    }else{
      //update
       currentScenarioDTO.modifiedAt = new Date();
       Scenarios.update(currentScenarioDTO._id, currentScenarioDTO);
    }

    return currentScenarioDTO;
  },

  //delete a scenario
  deleteScenario: function(scnID){
    //console.log(scnID);
    var scenario = Scenarios.findOne(scnID);    //fetch
    //var scenario = Scenarios.findOne({_id : scnID});
    //console.log("ID "+scnID);
    //console.log(JSON.stringify(scenario));
    if ( scenario== undefined || (scenario.owner != Meteor.userId()) ) {
    // If the current user is not thescenario owner
      throw  new Meteor.Error("not-authorized");
    }else{
      Scenarios.remove(scnID);
    }
    return '';
  },

  //save Feedback entry
  saveFeedback : function (feedbackDto){

    var username =Meteor.userId()?Meteor.user().username :"anonymous";
    var userID = Meteor.userId()? Meteor.userId():"anonymous";

    FeedbackCollection.insert({
          rateSite : feedbackDto.rateSite,
          rateNavigation : feedbackDto.rateNavigation,
          rateOrganization : feedbackDto.rateOrganization,
          rateLogin : feedbackDto.rateLogin,
          rateClarity : feedbackDto.rateClarity,
          rateSections : feedbackDto.rateSections,
          rateUsefulness : feedbackDto.rateUsefulness,
          rateAppearance : feedbackDto.rateAppearance,
          rateGeneral : feedbackDto.rateGeneral,
          username : username,
          userID : userID
    });

  }

  /** Unlocks a scenario for modification, granting the lock ownership to the current (logged in) user
  */
  ,unlockScenario : function(currentScenarioDTO){
    // Make sure the user is logged in before allowing manipulating a scenario
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    if(currentScenarioDTO.lockOwnerID && currentScenarioDTO.lockOwnerID!=Meteor.userId()){
      throw new Meteor.Error("Not authorized. Scenario currently unlocked for user "+currentScenarioDTO.lockOwnerID);
    }

    currentScenarioDTO.lockOwnerID = Meteor.userId();            // _id of logged in user
    currentScenarioDTO.lockOwnerName = Meteor.user().username;   // username of logged in user

    Scenarios.update(currentScenarioDTO._id, currentScenarioDTO);
    return currentScenarioDTO;
  }

  /** Locks a scenario for modification, deleting lock ownership
  */
  ,lockScenario : function(currentScenarioDTO){
    // Make sure the user is logged in before allowing manipulating a scenario
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    currentScenarioDTO.lockOwnerID = undefined;     // _id of logged in user
    currentScenarioDTO.lockOwnerName = undefined;   // username of logged in user

    Scenarios.update(currentScenarioDTO._id, currentScenarioDTO);
    return currentScenarioDTO;
  }
});


//SERVER SIDE
//======================================================================

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });

  //Meteor.publish("scenarios", function () {
  //  return Scenarios.find({owner: this.userId });
//
  //  /* $or: [
  //    { status: "public" },
  //    { owner: this.userId }
  //  ]*/
  //});


//Publish all scenarios from the current user
Meteor.publish('myScenarios', function(){
    Mongo.Collection._publishCursor( Scenarios.find({owner: this.userId }), this, 'myScenarios'); 
    this.ready();
});

//Publish all scenarios in the database 
Meteor.publish('scenariosAll', function(){
   // Old version
   // Mongo.Collection._publishCursor( Scenarios.find({}), this, 'scenariosAll'); 
   //
   if(Roles.userIsInRole(this.userId, 'admin'))
        Mongo.Collection._publishCursor( Scenarios.find({}), this, 'scenariosAll'); //For admins, all scenarios
   else 
      // approved scenarios + those of this user OR condition
      Mongo.Collection._publishCursor( Scenarios.find({$or: [ {status : scenarioStatusEnum.APPROVED}, {_id : this.userId} ]}), this, 'scenariosAll'); 
    
  this.ready();
});

//Publish all APPROVED scenarios in the database 
Meteor.publish('scenariosAllApproved', function(){
    Mongo.Collection._publishCursor( Scenarios.find({status : scenarioStatusEnum.APPROVED}), this, 'scenariosAllApproved'); 
    this.ready();
});

//Publish info about users
Meteor.publish('userdata', function() {
    //this.ready();
    //return Meteor.users.findOne({_id: this.userId});
    //XXX This may be causing Exception from sub blablabla Error: Publish function can only return a Cursor or an array of Cursors
 
    //return Meteor.users.findOne({_id : this.userId}); 
    Mongo.Collection._publishCursor( Meteor.users.findOne({_id : this.userId}), this, 'userdata');
    this.ready();
});
 
 /*
Meteor.publish("allUsersList", function(){ 
  return Meteor.users.find(); 
})*/

/** Publishes a list of all the users the current user is allowed to see, based on the user's role
*/
Meteor.publish('allUsersList', function(){
  if(Roles.userIsInRole(this.userId, 'admin')){
    Mongo.Collection._publishCursor( Meteor.users.find(), this, 'allUsersList');
  }else{
    Mongo.Collection._publishCursor( Meteor.users.find({_id : this.userId}), this, 'allUsersList'); 
  } 
  this.ready();
});

  
}