  Scenarios = new Mongo.Collection("scenarios");


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
    this.route('NewScenarioForm');
    this.route('new', function(){
      this.render('NewScenarioForm');
    })
    this.route('scenarioList', {
    data: function () { return Scenarios}
  }
  );
    //footer
    this.route('disclaimer');
    this.route('privacyStatement');
    this.route('contactInfo');
    this.route('FeedbackForm');


    //test
    this.route('post', {
      //path: '/',
      layoutTemplate: 'complexLayout',
      yieldTemplates: {
        //'myMenu': {to: 'menu'},
        'FooterTemplate': {to: 'footer'}
      }
    });

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

  //EVENTS
  Template.NewScenarioForm.events({
  "submit .new-scenario": function (event) {
   // "click .save-scenario": function (event) {
    // This function is called when the new scenario form is submitted
    //console.log("saving...");
    var title = trimInput(event.target.title.value);
    var description = trimInput(event.target.description.value);

    //Validations
    //1. Title can't be empty
    if(title===""){
      throw new Meteor.Error("'Title' can NOT be empty"); //TO-DO do something with this error
    }

    //2. Description can't be empty
    if(description===""){
      throw new Meteor.Error("'Description' can NOT be empty");//TO-DO do something with this error
    }

    //var title = "title".value;
    //console.log(title);
    //console.log(event);
    Meteor.call("saveScenario", title, description);
    

    // Clear form
    event.target.title.value = "";
    event.target.description.value = "";

    // Prevent default form submit
    return false;
  },

  "click .submit-scenario":function (event) {
    console.log("submitted scenario "+this._id);
  }
});


Template.NavBar.events({
    "click #create-new-scn": function () {
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
  }
});

Template.scenario.events({
  "click .delete": function () {
    console.log("deleting... "+this._id+" "+this.title);
    Meteor.call("deleteScenario", this._id);
  }
});

  //to configure the accounts UI to use usernames instead of email addresses
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

     // trim whitespace helper
  var trimInput = function(val) {
    return val.replace(/^\s*|\s*$/g, "");
  }
}


Meteor.methods({

  
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
