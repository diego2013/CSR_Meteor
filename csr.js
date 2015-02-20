/**
This csr.js file is part of the implementetion of the MD PnP's (www.mdpnp.org)
Clinical Scenrio Repository protoype using JavaScript and the Meteor Framework.

@author diego@mdpnp.org
@version 1.0

*/

//Database collections
Scenarios = new Mongo.Collection("scenarios");
FeedbackCollection = new Mongo.Collection("FeedbackCollection");

//Aux variables
var whichOne = 'one';

//Constants
var _SCENARIO_FORM_STEP = 'SCENARIO_FORM_STEP'; //Step of the scenario submission process
var _SCENARIO_FORM_STEP_BASIC_INFO = 'SCENARIO_FORM_STEP_BASIC_INFO'; 
var _SCENARIO_FORM_STEP_ADVANCED_INFO = 'SCENARIO_FORM_STEP_ADVANCED_INFO'; 
var _SCENARIO_FORM_STEP_SOLUTION = 'SCENARIO_FORM_STEP_SOLUTION'; 
var _SCENARIO_FORM_STEP_BASIC_INFO_templateName = "scenarioFormBasicInfo"; 
var _SCENARIO_FORM_STEP_ADVANCED_INFO_templateName = "scenarioFormAdvancedInfo"; 
var _SCENARIO_FORM_STEP_SOLUTION_templateName = "scenarioFormSolution"; 


//CLIENT SIDE
if (Meteor.isClient) {
  Meteor.subscribe("scenarios");

  //ROUTES

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
        //if(Session.get(_SCENARIO_FORM_STEP)===undefined){
        //  Session.set(_SCENARIO_FORM_STEP, _SCENARIO_FORM_STEP_BASIC_INFO);//initialize
        //}
        this.render('NewScenarioForm');
        hideScenarioFormButtons();
      }
    );
    this.route('new', function(){
      this.render('NewScenarioForm');
    });
    this.route('scenarioList', {
      data: function () { return Scenarios}
      }
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


  //HELPERS
  Template.scenarioList.helpers({
    scenarios: function () {
      return Scenarios.find({}, {sort: {createdAt: -1}});
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
    }
  });



  //EVENTS
  Template.NewScenarioForm.events({

  //"click #newScenarioForm": function(event) {
  // "submit #newScenarioForm": function(event, template) {
    //input[type=button]
    "click input[type=submit]": function(event, template) {
      event.preventDefault(); 

      // Collects data from the form into an object
      var title = template.find("#title").value;
      var description = template.find("#description").value;
      var buttonPressed = '';

      //Validations
      //1. Title can't be empty
      //if(title===""){
      //  throw new Meteor.Error("'Title' can NOT be empty"); //TO-DO do something with this error
      //}

      //2. Description can't be empty
      //if(description===""){
      //  throw new Meteor.Error("'Description' can NOT be empty");//TO-DO do something with this error
      //}

      if (event.target.id == "saveScenarioButton") {
          // Save the scenario
          buttonPressed = "saveScenarioButton";
      } else if (event.target.id == "submitScenarioButton") {
          // Submit the scenario
          buttonPressed = "submitScenarioButton";
      }

      console.log("title "+title+" description "+description+" Button "+buttonPressed);
      //  Meteor.call("saveScenario", title, description);
    }
    //onClick button change template
    , "click #goToStep1": function(){
      Session.set(_SCENARIO_FORM_STEP, _SCENARIO_FORM_STEP_BASIC_INFO);
      hideScenarioFormButtons();
    }
    , "click #goToStep2": function(){
      Session.set(_SCENARIO_FORM_STEP, _SCENARIO_FORM_STEP_ADVANCED_INFO);
      hideScenarioFormButtons();
    }
    , "click #goToStep3": function(){
      Session.set(_SCENARIO_FORM_STEP, _SCENARIO_FORM_STEP_SOLUTION);
      hideScenarioFormButtons();
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


Template.NavBar.events({
    "click #create-new-scn": function () {
      //Router.go('NewScenarioForm');
      Session.set(_SCENARIO_FORM_STEP, _SCENARIO_FORM_STEP_BASIC_INFO);
      hideScenarioFormButtons();
      Router.go('NewScenarioForm');

    },
    "click #list-scn": function () {
      console.log("list-scn... ");
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
    }
});

Template.scenario.events({
  "click .delete": function () {
    console.log("deleting... "+this._id+" "+this.title);
    Meteor.call("deleteScenario", this._id);
  }
});

//To configure the accounts UI to use usernames instead of email addresses
Accounts.ui.config({
  passwordSignupFields: "USERNAME_ONLY"
});

//Aux functions  
// trim whitespace helper
var trimInput = function(val) {
  return val.replace(/^\s*|\s*$/g, "");
}


//Hides the button corresponding to the panel of the Scenario Form
// in which we are by changing the button class.
var hideScenarioFormButtons = function(){

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
 
 }

}//meteor.isClient



Meteor.methods({

  //persist an scenario
  //save-insert
  saveScenario: function(title, description){
    // Make sure the user is logged in before allowing manipulating a scenario
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Scenarios.insert({
      title: title,                     //title of the scenario
      description: description,         //description of the scenario
      createdAt: new Date(),            // current time
      owner: Meteor.userId(),           // _id of logged in user
      username: Meteor.user().username  // username of logged in user
    });

  },


  deleteScenario: function(scnID){
    var scenario = Scenarios.findOne(scnID);    //fetch
    if (scenario.owner !== Meteor.userId()) {
    // If the current user is not thescenario owner
      throw new Meteor.Error("not-authorized");
    }
    Scenarios.remove(scnID);
  },

  //Feedback
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


});


//SERVER SIDE
if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });

  Meteor.publish("scenarios", function () {
    return Scenarios.find({owner: this.userId });

    /* $or: [
      { status: "public" },
      { owner: this.userId }
    ]*/
  });

  
}