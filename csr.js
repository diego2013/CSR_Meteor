/**
This csr.js file is part of the implementetion of the MD PnP's (www.mdpnp.org)
Clinical Scenrio Repository protoype using JavaScript and the Meteor Framework.

@author diego@mdpnp.org
@version 1.0

*/

//Database collections (Meteor.server MyCollection = new Mongo.Collection('collection-name-in-mongo'))
Scenarios = new Mongo.Collection("scenarios");
//AllScenarios = new Mongo.Collection("scenariosAll");
FeedbackCollection = new Mongo.Collection("FeedbackCollection");
AllTheUsers = Meteor.users; //new Mongo.Collection(Meteor.users);


//Aux variables
var whichOne = 'one';

//Var
//content of the ScenarioForm
var currentScenarioDTO = { /*_id: undefined,*/ title:'', description:''};
var hazardEntryList;

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

  // partial collections (Minimongo collections)
  MyScenarios = new Mongo.Collection('myScenarios');
  ScenariosAll = new Mongo.Collection('scenariosAll');
 
  Meteor.subscribe("allUsersList");
  Meteor.subscribe('userdata');
  //we may also need 
  /* Deps.autorun or 
  Tracker.autorun(function () {
    Meteor.subscribe("userData");
    Meteor.subscribe("allUserData");
});*/

/*Deps.autorun(function(){
  //useful to know if the user just logged in or out
  if(Meteor.userId()){
    if currentScenario is unsubmitted and has no owner --> change to this owner
    console.log("User Logged in");
  }else{
    console.log("user not logged in");
  }
});*/


  //ROUTES
  //====================================================================

  //global Router option to use a default layout template for all routes 
  Router.configure({
    layoutTemplate: 'complexLayout',
    loadingTemplate: "Loading",
    notFoundTemplate: "NotFound",
    yieldTemplates: {
        'FooterTemplate': {to: 'footer'}
      }
  });

  //map routes with templates
  Router.map(function(){
    this.route('home', {path: '/'});

    this.route('NewScenarioForm' , 
      function ()  {
        currentScenarioDTO = Session.get("currentScenarioDTO"); 
        this.render('NewScenarioForm', {
          data : currentScenarioDTO,
          yieldTemplates: {
            'scenarioFormBasicInfo': {to: 'newScenarioStep'}
          }          
        });
        hideScenarioFormButtons();
      }
    );

    //Find scenarios using the URL
    this.route('/NewScenarioForm/:_id', function () {
      currentScenarioDTO = ScenariosAll.findOne({_id: this.params._id.trim()});
      //check if is a valid scenario or user has permission to see it
/* IMPROVEMENT. Allows to show scenarios tht have been approved
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
        Session.set("currentScenarioDTO", currentScenarioDTO); //Issue #3
      }     
    });
    this.route('new', function(){
      this.render('NewScenarioForm');
    });
    this.route('scenarioFormSubmitConfirmation',  function () {
        currentScenarioDTO = Session.get("currentScenarioDTO"); 
        this.render('scenarioFormSubmitConfirmation', { data : currentScenarioDTO } );
      });
    this.route('scenarioFormThankYou',  function () {
       currentScenarioDTO = Session.get("currentScenarioDTO"); 
      this.render('scenarioFormThankYou', { data : currentScenarioDTO } );
    });

   //this.route('scenarioList' , function(){
   //  console.log(JSON.stringify(MyScenarios.find({}, {sort: {createdAt: -1}})));
   //  this.render('scenarioList', {data : MyScenarios.find({}, {sort: {createdAt: -1}}) })
   //}
   //);
    this.route('scenarioList' 
      //, {data:  function () { return MyScenarios.find({}, {sort: {createdAt: -1}}) /*return Scenarios*/}} 
    );
    this.route('findByIDTemplate');
    this.route('/findByIDTemplate/:_id', function () {
      findByID(this.params._id);
    });
    this.route('findByIDErrorTemplate');

    this.route('userList');
    this.route('userProfile' //, {data :function () { return userDTO.findOne({_id: this.userId} ) }}
       //,{data :function () { return Meteor.user()}} //working code
       // , { data: function(){return Meteor.users.findOne()} } //working code 
       ,{data : function(){ return AllTheUsers.findOne() }}
      //,{data : function(){ return Meteor.users.findOne() }}//working code
      );
    
    //footer
    this.route('disclaimer');
    this.route('privacyStatement');
    this.route('contactInfo');
    this.route('FeedbackForm'); //feedback form
    this.route('FeedbackFormThakYou'); //"thank you" page after submitting feedback


    //test
    this.route('post'
     , 
      function ()  {
        console.log("routing post")
        Session.set("step", 'one');//initialize
        this.render("Post");
      }
    );

  });



  //HELPERS Template helpers
  //======================================================================

  Template.scenarioList.helpers({
    scenarios: function () {
      //return Scenarios.find({}, {sort: {createdAt: -1}});
      return MyScenarios.find({}, {sort: {createdAt: -1}});
      //return ScenariosAll.find({}, {sort: {createdAt: -1}});
    },

    isOwner: function () {
      return this.owner === Meteor.userId();
    }
  });

//This tempalte exists only for experimenting purposes
  Template.Post.helpers({
    whichOne: function () {
      //return Session.get('step') ? 'postOne' : 'postTwo'
      var newScenarioStep = Session.get('step');
      if(newScenarioStep=='one')
        return 'postOne';
      else
        return 'postTwo';
      // note that we return a string - per http://docs.meteor.com/#template_dynamic
    }
  });

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
    }/*, 
    currentScenarioDTO : function(){
      return Session.get('currentScenarioDTO');
    }*/

  });

  Template.scenarioFormBasicInfo.helpers({
    //Indicates if the header with the scenario metainfo (UID, Dates) shall be displayed
    // It will in case the currentScenarioDTO in session has a valid _id
      printScenarioMetainfo : function(){
        if(Session.get('currentScenarioDTO')==undefined)
          return false;
        else
          return Session.get('currentScenarioDTO')._id!=undefined;
      },
      editableScn : function(){
        if(Session.get('currentScenarioDTO')==undefined)
          return true;
        else
          return Session.get('currentScenarioDTO').status==scenarioStatusEnum.UNSUBMITTED;
      }
  });

  Template.scenarioFormSolution.helpers({
    //Indicates if the header with the scenario metainfo (UID, Dates) shall be displayed
    // It will in case the currentScenarioDTO in session has a valid _id
      printScenarioMetainfo : function(){
        if(Session.get('currentScenarioDTO')==undefined)
          return false;
        else
          return Session.get('currentScenarioDTO')._id!=undefined;
      }
  });

  Template.scenarioFormAdvancedInfo.helpers({
        //Indicates if the header with the scenario metainfo (UID, Dates) shall be displayed
    // It will in case the currentScenarioDTO in session has a valid _id
      printScenarioMetainfo : function(){
        if(Session.get('currentScenarioDTO')==undefined)
          return false;
        else
          return Session.get('currentScenarioDTO')._id!=undefined;
      },
      advancedDetailsTemplateName : function(){
        var _advancedDetailsTemplateName = Session.get(_ADVANCEDDETAILS_TAB);
        if(_advancedDetailsTemplateName==undefined)
          return _ADT_HAZARDS_templateName;
        else
          return _advancedDetailsTemplateName;
      }
  });

  Template.advancedDetailsHazards.helpers({
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

  Template.advancedDetailsReferences.helpers({
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

  Template.advancedDetailsRoles.helpers({
    roleEntryList : function(){
      currentScenarioDTO = Session.get('currentScenarioDTO')
      if(currentScenarioDTO===undefined)
        return [];
      else
        return currentScenarioDTO.roleEntryList;
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
    usuarios: function () { //return Meteor.users.find(
      //return AllUsersList.find(
      return AllTheUsers.find(
      //  {_id: /*'GDpyG7Ytu8urGhAcT'*/ Meteor.userId()}
        );
    },
 });

 Template.findByIDErrorTemplate.helpers({
    scenarioID : function(){
      return Session.get('auxScenarioID');
    }
 });

 //OTHER HELPERS
 //============================================================================================

/*
Returns if the provided option selected in the template is the one that the DTO currently holds
*/
UI.registerHelper('selectedLessonLearned', function( value){
  return currentScenarioDTO.preventable == value? {selected:'selected'}: '';
});

/* Formats a Date using moment.js
//https://atmospherejs.com/momentjs/moment
// $ meteor add momentjs:moment
*/
UI.registerHelper('formatDate', function(date) {
  return moment(date).format('MM-DD-YYYY, hh:mm:ss');
});



  //EVENTS Template events
  //============================================================================
  Template.NewScenarioForm.events({

  //"click #newScenarioForm": function(event) {
  // "submit #newScenarioForm": function(event, template) {
    //input[type=button]
    "click input[type=submit]": function(event, template) {
      event.preventDefault(); 

      // Collects data from the form into an object
      collectScenarioInfo();

      //Validations
      //1. Title can't be empty
      //if(title===""){
      //  throw new Meteor.Error("'Title' can NOT be empty"); //TO-DO do something with this error
      //}

      //2. Description can't be empty
      //if(description===""){
      //  throw new Meteor.Error("'Description' can NOT be empty");//TO-DO do something with this error
      //}

      //TODO Probably we can distinguish between inserts and updates with the _id property

      if (event.target.id == "saveScenarioButton") {
          // Save the scenario
          //Meteor.call("saveScenario", currentScenarioDTO); //working code
          Meteor.call("saveScenario", currentScenarioDTO, function(err, callbackScenarioDTO) {
          //callback function
             if (err)
                { console.log(err);}

              //currentScenarioDTO._id = callbackScenarioDTO._id;
              currentScenarioDTO = callbackScenarioDTO;
              Session.set('currentScenarioDTO', currentScenarioDTO);
              Router.go("NewScenarioForm");
              //Meteor._reload.reload();
          });
      } else if (event.target.id == "submitScenarioButton") {
          // Submit the scenario
          Router.go('scenarioFormSubmitConfirmation');
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

});

Template.scenarioFormAdvancedInfo.events({
      //onClick button dinamically change template
      "click #hazardsButton": function(){
     // collectScenarioInfo();
      Session.set(_ADVANCEDDETAILS_TAB, _ADT_HAZARDS_templateName);
     // hideScenarioFormButtons();
    }
    , "click #equipmentButton": function(){
     // collectScenarioInfo();
      Session.set(_ADVANCEDDETAILS_TAB, _ADT_EQUIPMENT_templateName);
     // hideScenarioFormButtons();
    }
    , "click #lessonsLearnedButton": function(){
     // collectScenarioInfo();
      Session.set(_ADVANCEDDETAILS_TAB, _ADT_LESSONSLEARNED_templateName);
     // hideScenarioFormButtons();
    }    
    , "click #referencesButton": function(){
     // collectScenarioInfo();
      Session.set(_ADVANCEDDETAILS_TAB, _ADT_REFERENCES_templateName);
     // hideScenarioFormButtons();
    }  
    , "click #rolesButton": function(){
     // collectScenarioInfo();
      Session.set(_ADVANCEDDETAILS_TAB, _ADT_ROLES_templateName);
     // hideScenarioFormButtons();
    }  
    , "click #environmentsButton": function(){
     // collectScenarioInfo();
      Session.set(_ADVANCEDDETAILS_TAB, _ADT_PLACES_templateName);
     // hideScenarioFormButtons();
    }  

});

//hazardEntryList
Template.advancedDetailsHazards.events({
  "click #addNewHazard": function(){
    hazardEntryList = updateHarzardList();
    currentScenarioDTO.hazardEntryList = hazardEntryList;
    Session.set("currentScenarioDTO", currentScenarioDTO);
  },
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

//equipmentEntryList
Template.advancedDetailsEquipment.events({
  "click #addNewEquipment": function(){
    currentScenarioDTO.equipmentEntryList = updateEquipmentList();
    Session.set("currentScenarioDTO", currentScenarioDTO);
  },
  "click #deleteEquipment" : function(event){
    event.preventDefault();
    currentScenarioDTO =  Session.get("currentScenarioDTO");
    equipmentEntryList = currentScenarioDTO.equipmentEntryList;
    //find and delete by index
    currentScenarioDTO.equipmentEntryList = deleteFromArrayByID(this.id, equipmentEntryList)
    Session.set("currentScenarioDTO", currentScenarioDTO);
  }
});

//referencesEntryList
Template.advancedDetailsReferences.events({
  "click #addNewReference": function(){
    referenceEntryList = updateReferenceList();
    currentScenarioDTO.referenceEntryList = referenceEntryList;
    Session.set("currentScenarioDTO", currentScenarioDTO);
  },
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

Template.advancedDetailsRoles.events({
  "click #addActor": function(){
    roleEntryList = updateRoleList();
    currentScenarioDTO.roleEntryList = roleEntryList;
    Session.set("currentScenarioDTO", currentScenarioDTO);
  },
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

Template.advancedDetailsEnvironments.events({
  "click #addPlace": function(){
    currentScenarioDTO.environmentEntryList = updateEnvironmentList();
    Session.set("currentScenarioDTO", currentScenarioDTO);
  },
  "click #deletePlace" : function(event){
    //event.preventDefault();
    currentScenarioDTO =  Session.get("currentScenarioDTO");
    environmentEntryList = currentScenarioDTO.environmentEntryList;
    //find and delete by index
    currentScenarioDTO.environmentEntryList = deleteFromArrayByID(this.id, environmentEntryList);
    Session.set("currentScenarioDTO", currentScenarioDTO);
  }
});

Template.scenarioFormSubmitConfirmation.events({

  "click #declineSubmit": function(){
      Router.go("NewScenarioForm");//redirect to the Scenario Form
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
      window.alert("Mark that you have understood the Clinical Scenario Repository policies to submit you scenario");
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


//only for test purposes 
Template.Post.events({

  "click #toPostOne": function(event){
    event.preventDefault(); // Prevent default form submit
    whichOne = 'one';
    Session.set("step", whichOne);

  }, 
  "click #toPostTwo": function(event){
    event.preventDefault(); // Prevent default form submit
    whichOne = 'two'; 
    Session.set("step", whichOne);
  }
  
});

//Events on the navigation bar
Template.NavBar.events({
    "click #create-new-scn": function () {
      Session.set(_SCENARIO_FORM_STEP, _SCENARIO_FORM_STEP_BASIC_INFO);
      cleanNewScenarioForm();
      hideScenarioFormButtons();
      Router.go('NewScenarioForm');
    },
    "click #list-scn": function () {
      Router.go('scenarioList');
    },
    "click #goToHomePage": function () {
      Router.go('/');
    },
    "click #disclaimerPage": function () {
      Router.go('disclaimer');
    },
    "click #feedbackPage": function () {
      Router.go('FeedbackForm');
    },
    "click #testPost": function () {
      Session.set("step", 'one'); 
      Router.go('post');
    },
    "click #goToMyProfile": function(){
      Router.go("userProfile");
    }, 
    "click #listUsers" : function(){
      Router.go("userList");
    }, 
    "click #findByID" : function(){
      Router.go("findByIDTemplate");
    }
});

Template.scenario.events({
  "click .delete": function () {
    Meteor.call("deleteScenario", this._id);
  },
  "click #gothere" : function(event){
    //find by ID, with the scn ID being in the text of the button just clicked
    findByID(event.target.name);
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


//OTHER CLINET FUNCTIONS
//========================================================================

//To configure the accounts UI to use usernames instead of email addresses
Accounts.ui.config({
  passwordSignupFields: "USERNAME_ONLY"
});


//AUX FUNCTIONS
//=========================================================================


// trim whitespace helper function
var trimInput = function(val) {
  return val.replace(/^\s*|\s*$/g, "");
}


//Hides the button corresponding to the panel of the Scenario Form
// in which we are by changing the button class.
var hideScenarioFormButtons = function(){

//1. Navigation buttons
//remove the hiddenButton class from all three buttons
  $("#goToStep1").removeClass("hiddenButton");
  $("#goToStep2").removeClass("hiddenButton");
  $("#goToStep3").removeClass("hiddenButton");

//figure out in which panel we are and add the hiddenButton class to just that button
  var newScenarioStep = Session.get(_SCENARIO_FORM_STEP);

  if(newScenarioStep === _SCENARIO_FORM_STEP_BASIC_INFO){
    $("#goToStep1").addClass("hiddenButton");
  }
  else if(newScenarioStep === _SCENARIO_FORM_STEP_ADVANCED_INFO){
    $("#goToStep2").addClass("hiddenButton");
  }
  else if(newScenarioStep === _SCENARIO_FORM_STEP_SOLUTION){
    $("#goToStep3").addClass("hiddenButton");
  }else //default
    $("#goToStep1").addClass("hiddenButton");
 
 //   //2. Save and Submit buttons
 //   if(Session.get('currentScenarioDTO')==undefined ||
 //        Session.get('currentScenarioDTO').status==scenarioStatusEnum.UNSUBMITTED){
 //      $("#saveScenarioButton").removeClass("hiddenButton");
 //   }else{
 //    $("#saveScenarioButton").addClass("hiddenButton");
 //   }

 };

 //sets the variable currentScenarioDTO with the information from the templates
 var collectScenarioInfo = function(){
  // Collects data from the form into an object
  //console.log("_SCENARIO_FORM_STEP: " + Session.get(_SCENARIO_FORM_STEP) );


  if(Session.get(_SCENARIO_FORM_STEP) === _SCENARIO_FORM_STEP_BASIC_INFO){
    currentScenarioDTO.title = $('#title').val();
    currentScenarioDTO.description = $("#description").val();
  } else  if(Session.get(_SCENARIO_FORM_STEP) === _SCENARIO_FORM_STEP_SOLUTION){
    currentScenarioDTO.solutionDescription = $('#solutionDescription').val();
    currentScenarioDTO.benefitsDescription = $("#benefitsDescription").val();
    currentScenarioDTO.risksDescription = $("#risksDescription").val();
  } else if(Session.get(_SCENARIO_FORM_STEP) === _SCENARIO_FORM_STEP_ADVANCED_INFO){
    //determine in which subpanel we are
    //console.log("_ADVANCEDDETAILS_TAB: "+ Session.get(_ADVANCEDDETAILS_TAB));
    currentScenarioDTO =  Session.get("currentScenarioDTO");
    //hazardEntryList = currentScenarioDTO.hazardEntryList;

    //if(Session.get(_ADVANCEDDETAILS_TAB) === _ADT_HAZARDS_templateName){
    //  hazardEntryList = updateHarzardList();
    //  currentScenarioDTO.hazardEntryList = hazardEntryList;
    //}
//
    //if(Session.get(_ADVANCEDDETAILS_TAB) == _ADT_REFERENCES_templateName){
    //  currentScenarioDTO.referenceEntryList = updateReferenceList();
    //}

    ////if we are in this panel?
    //referenceEntryList = updateReferenceList();
    //currentScenarioDTO.referenceEntryList = referenceEntryList;

    currentScenarioDTO.lessonsLearned = $('#lesson').val();
    currentScenarioDTO.preventable = $('#preventable').val();

   // currentScenarioDTO.roleEntryList = updateRoleList();
   // currentScenarioDTO.environmentEntryList = updateEnvironmentList();

  }

 //console.log(JSON.stringify(currentScenarioDTO));
  Session.set("currentScenarioDTO", currentScenarioDTO);

  //return currentScenarioDTO;
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

//Finds a scennrio from the current collection by ID
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
       Scenarios.update(currentScenarioDTO._id, currentScenarioDTO)
    }

    return currentScenarioDTO;
  },

  //delete a scenario
  deleteScenario: function(scnID){
    var scenario = Scenarios.findOne(scnID);    //fetch
    //console.log("ID "+scnID);
    //console.log(JSON.stringify(scenario));
    if (scenario.owner !== Meteor.userId()) {
    // If the current user is not thescenario owner
      throw new Meteor.Error("not-authorized");
    }
    Scenarios.remove(scnID);
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

  },

/*  findByID: function(scnID){
    var scenario = Scenarios.findOne(scnID);    //fetch
    if (scenario.owner !== Meteor.userId()) {
    // If the current user is not thescenario owner
      throw new Meteor.Error("not-authorized");
    }
    return scenario;*/



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



/*
  Meteor.publish("scenariosAll", function () {
    return Scenarios.find({});
  });*/

//Publish all scenarios from the current user
Meteor.publish('myScenarios', function(){
    Mongo.Collection._publishCursor( Scenarios.find({owner: this.userId }), this, 'myScenarios'); 
    this.ready();
});

//Publish all scenarios in the database 
Meteor.publish('scenariosAll', function(){
    Mongo.Collection._publishCursor( Scenarios.find({}), this, 'scenariosAll'); 
    this.ready();
});


//Publish info about users
Meteor.publish('userdata', function() {
    this.ready();
    //return Meteor.users.findOne({_id: this.userId});
    //XXX This may be causing Exception from sub blablabla Error: Publish function can only return a Cursor or an array of Cursors
 
    return Meteor.users.find(); 
});
 
Meteor.publish("allUsersList", function(){ 
  return Meteor.users.find(); 
})

  
}