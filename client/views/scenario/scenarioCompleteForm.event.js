/** @author https://github.com/diego2013
*/

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
  ,"mouseover #like" : function(){
    var mybutton = $('a#like');
    var text = 'ACKnowledge this scenario if you have heard or experieced a similar problem,'+
    ' or if you think this problem is important and requires attention from the community';
    mybutton.attr('title', text);
    //console.log(mybutton);
  }
  ,"click #like" : function(){

    // console.log("userID: "+Meteor.userId());
    // console.log("scenarioID: "+this._id);
    Meteor.call("persistACK", this._id, Meteor.userId()); //add a callback function for the case insert fails?

    // Meteor.Call("persistACK", scenarioID, userID, callbackfunction());
  }

});