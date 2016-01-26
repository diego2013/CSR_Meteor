/**

@author https://github.com/diego2013
@version 1.0

*/

//Collections
// Scenarios = new Mongo.Collection("scenarios");
// FeedbackCollection = new Mongo.Collection("FeedbackCollection");
// ScenarioAcks = new Mongo.Collection("ScenarioAcks");

//Scenario states for governance
var scenarioStatusEnum = {
    UNSUBMITTED : "unsubmitted",      //new. (modified or not). PRIVATE Not yet submitted for approval 
    SUBMITTED   : "submitted",        //submitted. Peding of approval
    APPROVED    : 'approved' ,        //APPROVED. Public
    MODIFIED    : 'modified',         //APPROVED and then modified
    REJECTED    : 'rejected'          //Permantenlty discarded (but not deleted)
}



//PUBLICATIONS (reference)
//http://www.meteorpedia.com/read/Understanding_Meteor_Publish_and_Subscribe

/** Publish all scenarios from the current user
@cursorStart, skip parameter
@recordLimit, limit parameter
@sortPreferences, object to sort the published cursor
*/
Meteor.publish('myScenarios', function(cursorStart, recordLimit, sortPreferences){
    var objSort = {};//object to sort the cursor
    if(sortPreferences){
      objSort[sortPreferences.param] = sortPreferences.order;
    }else{
      objSort['createdAt'] = 1;
    }
    Mongo.Collection._publishCursor( 
      Scenarios.find({owner: this.userId }, {limit :recordLimit, skip : cursorStart, sort : objSort}), 
      this, 'myScenarios'); 
    this.ready();
});

/** Publish all scenarios in the database 
@cursorStart, skip parameter
@recordLimit, limit parameter
*/
Meteor.publish('scenariosAll', function(cursorStart, recordLimit){
   if(Roles.userIsInRole(this.userId, 'admin')){
        Mongo.Collection._publishCursor( Scenarios.find({}, {limit :recordLimit, skip : cursorStart}), this, 'scenariosAll'); //For admins, all scenarios
   }else{ 
      // approved scenarios + those of this user
      Mongo.Collection._publishCursor( Scenarios.find(
        {$or: [{status : scenarioStatusEnum.APPROVED}, {owner : this.userId} ]},
        {limit :recordLimit, skip : cursorStart}), 
      this, 'scenariosAll'); 
   }
    
  this.ready();
});

/** Publish all SUBMITTED scenarios in the database 
@cursorStart, skip parameter
@recordLimit, limit parameter
@sortPreferences, object to sort the pulbished cursor
*/
Meteor.publish('scenariosAllSubmitted', function(cursorStart, recordLimit, sortPreferences){
  if(Roles.userIsInRole(this.userId, 'admin')){
    var objSort = {};//object to sort the cursor
    if(sortPreferences){
      objSort[sortPreferences.param] = sortPreferences.order;
    }else{
      objSort['createdAt'] = 1;
    }
    Mongo.Collection._publishCursor( 
      Scenarios.find({status : scenarioStatusEnum.SUBMITTED}, {limit :recordLimit, skip : cursorStart, obj : objSort}),
       this, 'scenariosAllSubmitted'); 
  }

  this.ready();
});

/** Publish all APPROVED scenarios in the database 
@cursorStart, skip parameter
@recordLimit, limit parameter
@sortPreferences, object to sort the pulbished cursor
*/
Meteor.publish('scenariosAllApproved', function(cursorStart, recordLimit, sortPreferences){
    var objSort = {};//object to sort the cursor
    if(sortPreferences){
      objSort[sortPreferences.param] = sortPreferences.order;
    }else{
      objSort['createdAt'] = 1;
    }
    Mongo.Collection._publishCursor( 
        Scenarios.find({status : scenarioStatusEnum.APPROVED}, {limit :recordLimit, skip : cursorStart, sort : objSort}),
        this, 'scenariosAllApproved'); 
    this.ready();
});

/** Publish info about the current user
*/
Meteor.publish('userdata', function() {
    //XXX whatch out the fields we are making available to the client (see _published secrets_ http://dweldon.silvrback.com/common-mistakes) 
    Mongo.Collection._publishCursor( Meteor.users.findOne({_id : this.userId}), this, 'userdata');
    this.ready();
});
 
/** Publish data of all users
@cursorStart, skip parameter
@recordLimit, limit parameter
@sortPreferences, object to sort the pulbished cursor
*/
Meteor.publish('allUsersList', function(cursorStart, recordLimit, obj){
  //XXX whatch out the fields we are making available to the client (see _published secrets_ http://dweldon.silvrback.com/common-mistakes) 
  if(Roles.userIsInRole(this.userId, 'admin')){

    var objSort = {};//object to sort the cursor
    if(obj){
      objSort[obj.param] = obj.order;
    }else{
      objSort['username'] = 1;
    }
    
    Mongo.Collection._publishCursor( Meteor.users.find({}, {limit :recordLimit, skip : cursorStart, sort : objSort}), this, 'allUsersList');
  }else{
    Mongo.Collection._publishCursor( Meteor.users.find({_id : this.userId}), this, 'allUsersList'); //only data of current user 
  } 
  this.ready();
});

/** Publishes cursor for the feedback documents
@cursorStart, skip parameter
@recordLimit, limit parameter
@sortPreferences, object to sort the pulbished cursor
*/
Meteor.publish('feedbackDocuments', function(cursorStart, recordLimit, sortPreferences){
  if(Roles.userIsInRole(this.userId, 'admin')){
    var objSort = {};//object to sort the cursor
    if(sortPreferences){
      objSort[sortPreferences.param] = sortPreferences.order;
    }else{
      objSort['createdAt'] = 1;
    }
    Mongo.Collection._publishCursor( FeedbackCollection.find({}, {limit :recordLimit, skip : cursorStart, sort : objSort }), this, 'feedbackDocuments');
  }
  this.ready();
});


//https://github.com/percolatestudio/publish-counts
Meteor.publish('publication', function() {
  Counts.publish(this, 'feedbackCounter', FeedbackCollection.find());
  Counts.publish(this, 'myScenariosCounter', Scenarios.find({owner: this.userId }));
  Counts.publish(this, 'approvedScenariosCounter', Scenarios.find({owner: this.userId , status : scenarioStatusEnum.APPROVED}));
  Counts.publish(this, 'submittedScenariosCounter', Scenarios.find({owner: this.userId , status : scenarioStatusEnum.SUBMITTED}));
  Counts.publish(this, 'unSubmittedScenariosCounter', Scenarios.find({owner: this.userId , status : scenarioStatusEnum.UNSUBMITTED}));
  Counts.publish(this, 'usersListCounter', Meteor.users.find());
});

