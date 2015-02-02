  Scenarios = new Mongo.Collection("scenarios");


//CLIENT SIDE
if (Meteor.isClient) {
  Meteor.subscribe("scenarios");
  // counter starts at 0
  //Session.setDefault("counter", 0);

  //
  Template.body.helpers({
    scenarios: function () {
      return Scenarios.find({}, {sort: {createdAt: -1}});
    },

    isOwner: function () {
      return this.owner === Meteor.userId();
  }
  });

  Template.NewScenarioForm.events({
  "submit .new-scenario": function (event) {
   // "click .save-scenario": function (event) {
    // This function is called when the new scenario form is submitted
    //console.log("saving...");
    var title = event.target.title.value;
    var description = event.target.description.value;

    //var title = "title".value;
    //console.log(title);
    //console.log(event);
    Meteor.call("saveScenario", title, description);
    

    // Clear form
    event.target.title.value = "";
    event.target.description.value = "";

    // Prevent default form submit
    return false;
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
}


Meteor.methods({
  saveScenario: function(title, description){
    // Make sure the user is logged in before modifiing a scenario
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
