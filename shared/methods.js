/**

@author https://github.com/diego2013
@version 1.0

*/

//COMMON METHODS 
//======================================================================================

Meteor.methods({



  //persist an scenario
  saveScenario : function(currentScenarioDTO){
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
  }

  //delete a scenario
  ,deleteScenario : function(scnID){
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
  }

  //save Feedback entry
  ,saveFeedback  : function (feedbackDto){

   if(feedbackDto){
    if(feedbackDto._id)
      FeedbackCollection.update(feedbackDto._id, feedbackDto);
    else
      var feedbackDtoUID = FeedbackCollection.insert(feedbackDto);

    feedbackDto._id = feedbackDtoUID;
    return feedbackDto;
  }

  return '';

  }

  //update Feedback entry
  ,updateFeedback : function (feedbackDto){

   if(feedbackDto){
        FeedbackCollection.update(feedbackDto);
        return feedbackDto;
   } 

    return '';
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

  /** Persist a scenario ACK
  */
  ,persistACK : function (scenarioID, userID){
    var ack = {
      _id : scenarioID + userID,
      scnID : scenarioID,
      userID : userID
    }

    ScenarioAcks.insert(ack);
  }
});