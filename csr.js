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

//Constants
var _SCENARIO_FORM_STEP = 'SCENARIO_FORM_STEP'; //Step of the scenario submission process
var _SCENARIO_FORM_STEP_BASIC_INFO = 'SCENARIO_FORM_STEP_BASIC_INFO'; 
var _SCENARIO_FORM_STEP_ADVANCED_INFO = 'SCENARIO_FORM_STEP_ADVANCED_INFO'; 
var _SCENARIO_FORM_STEP_SOLUTION = 'SCENARIO_FORM_STEP_SOLUTION'; 
var _SCENARIO_FORM_STEP_BASIC_INFO_templateName = "scenarioFormBasicInfo"; 
var _SCENARIO_FORM_STEP_ADVANCED_INFO_templateName = "scenarioFormAdvancedInfo"; 
var _SCENARIO_FORM_STEP_SOLUTION_templateName = "scenarioFormSolution"; 

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
      //if currentScenarioDTO===undefined redirect to error page instead??
      Session.set("currentScenarioDTO", currentScenarioDTO);
      this.render('NewScenarioForm', {data: currentScenarioDTO});
     // findByID(this.params._id.trim()); //TODO Find out why it doesn't work with this call
    });
    this.route('new', function(){
      this.render('NewScenarioForm');
    });
    this.route('scenarioList' /*, {
      data: function () { return Scenarios}
      }*/
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



  //HELPERS
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
      printScnearioMetainfo : function(){
        return Session.get('currentScenarioDTO')._id!=undefined;
      }
  });

  Template.scenarioFormSolution.helpers({
    //Indicates if the header with the scenario metainfo (UID, Dates) shall be displayed
      printScnearioMetainfo : function(){
        return Session.get('currentScenarioDTO')._id!=undefined;
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



  //EVENTS
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
          //1. Offer disclaimer
          var agrees = window.confirm("Here goes the disclaimer");
          if(agrees)
            console.log("Si, quiero");
          else
            console.log("No, ni muerto");

          //2. if disclaimer is accepted, SAVE and submit (update scenario status)
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
      hideScenarioFormButtons();
    }
    , "click #goToStep3": function(event, template){
      collectScenarioInfo();
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
    console.log("deleting... "+this._id+" "+this.title);
    Meteor.call("deleteScenario", this._id);
  },
  "click #gothere" : function(event){
    //find by ID, with the scn ID being in the text of the button just clicked
    findByID(event.target.innerText);
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
 
 };

 //sets the variable currentScenarioDTO with the information from the templates
 //XXX TODO
 var collectScenarioInfo = function(){
  // Collects data from the form into an object
  if(Session.get(_SCENARIO_FORM_STEP) === _SCENARIO_FORM_STEP_BASIC_INFO){
    currentScenarioDTO.title = $('#title').val();
    currentScenarioDTO.description = $("#description").val();
  } else  if(Session.get(_SCENARIO_FORM_STEP) === _SCENARIO_FORM_STEP_SOLUTION){
    currentScenarioDTO.solutionDescription = $('#solutionDescription').val();
    currentScenarioDTO.benefitsDescription = $("#benefitsDescription").val();
    currentScenarioDTO.risksDescription = $("#risksDescription").val();
  }

  //Session.set("currentScenarioDTO", currentScenarioDTO);//DAG
  //return currentScenarioDTO;

// console.log("template name "+template.id);
// if(template === undefined){
//   return myScenarioDto;
// }else{

//   console.log($('#titleRemainder').val());
//   var title = template.find("#title").value; //$('#title').val(),
//   var description = template.find("#description").value;
//   //should use myScenarioDTO?
//   var scenarioDto = {
//     title : title,
//     description : description
// 
//   };
//   console.log("title: "+scenarioDto.title+" description: "+scenarioDto.description);
//   myScenarioDto = scenarioDto;
//   return scenarioDto;
// }
 };

 //Cleans the input fields of the new scenario form as well as the currentScenarioDTO aux var
 var cleanNewScenarioForm = function(){

  var auxCopy = {
    title : '',
    description : '',
    solutionDescription : '',
    benefitsDescription : '',
    risksDescription : ''

  };
  currentScenarioDTO = auxCopy;
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
  
  Session.set("currentScenarioDTO", currentScenarioDTO);
 };

//Finds a sceanrio from the current collection by ID
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




}//meteor.isClient



Meteor.methods({

  //persist an scenario
  //save-insert
  /*saveScenario: function(title, description){
    // Make sure the user is logged in before allowing manipulating a scenario
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    console.log("inserting scn "+title);
    //TODO Probably we can distinguish between inserts and updates with the _id property

    Scenarios.insert({
      title: title,                     //title of the scenario
      description: description,         //description of the scenario
      createdAt: new Date(),            // current time
      owner: Meteor.userId(),           // _id of logged in user
      username: Meteor.user().username  // username of logged in user
    });

  },*/

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
      currentScenarioDTO.status = scenarioStatusEnum.UNSUBMITTED;
      currentScenarioDTO.formattedModifiedDate = currentScenarioDTO.modifiedAt.toString().substring(0, 24);
/*      var scenarioUID = Scenarios.insert({
        title: currentScenarioDTO.title,                     //title of the scenario
        description: currentScenarioDTO.description,         //description of the scenario
        createdAt: new Date(),            // current time
        owner: Meteor.userId(),           // _id of logged in user
        username: Meteor.user().username  // username of logged in user
       });

*/

    var scenarioUID = Scenarios.insert(currentScenarioDTO);
    currentScenarioDTO._id = scenarioUID;

    }else{
      //update
       currentScenarioDTO.modifiedAt = new Date();
       currentScenarioDTO.formattedModifiedDate = currentScenarioDTO.modifiedAt.toString().substring(0, 24);

       Scenarios.update(currentScenarioDTO._id, currentScenarioDTO)
    }

    return currentScenarioDTO;
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