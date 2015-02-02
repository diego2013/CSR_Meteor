  Scenarios = new Mongo.Collection("scenarios");


if (Meteor.isClient) {
  // counter starts at 0
  //Session.setDefault("counter", 0);

  //
  Template.body.helpers({
    scenarios: function () {
      return Scenarios.find({}, {sort: {createdAt: -1}});
    }
  });

  Template.NewScenarioForm.events({
  "submit .new-scenario": function (event) {
   // "click .save-scenario": function (event) {
    // This function is called when the new scenario form is submitted
    console.log("saving...");
    var title = event.target.title.value;
    //var title = "title".value;
    console.log(title);
    //console.log(event);
   // var description = event.target.description.value;

    Scenarios.insert({
      title: title,
     // description: description,
      createdAt: new Date() // current time
    });

    // Clear form
    event.target.title.value = "";
    //event.target.description.value = "";

    // Prevent default form submit
    return false;
  }
});

Template.scenario.events({
  "click .delete": function () {
    console.log("deleting... "+this._id+" "+this.title);
    Scenarios.remove(this._id);
  }
});

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
