/** @author https://github.com/diego2013
*/

/** Events on the form used to display the complete scenario information in one single place
*/
Template.scenarioCompleteForm.events({
  "click #editLockButton" : function(){

     //toggle value of the button and update reactive variable
      var buttonAction = $('#editLockButton').data('action');
      // console.log(buttonAction);
      if(buttonAction==_LOCKBUTTON_ACTION_LOCK){
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
  ,"click #discardChanges" : function(event, template){


      scenarioID = this._id; //get the scenario ID
      // Router.go("/scenarioComplete/"+scenarioID) //redender this template for this ID (will take docuemnt form mongo col)


      //XXX for some reason I don't understand, Router.go doesn't work here, but work as part of a callback 
      // Meteor.call("saveScenario", Session.get('currentScenarioDTO'), function(err, callbackScenarioDTO) {
      //   // Router.go("/scenarioComplete/"+scenarioID)
      //   Router.go('approvedScenarioList')
      //   Router.go("/scenarioComplete/"+scenarioID)
      // })
      

      scenarioDTO = scenariosAllApproved.findOne({'_id' : scenarioID}); //find the scenario with that ID
      Session.set('currentScenarioDTO', scenarioDTO); //set scenario as context scenario
      forceRenderScenarioCompleteForm(scenarioDTO); //see issue #145
      // Router.go("/scenarioComplete/"+scenarioID)


      /* Since Router.go() is not working well here I am force to manually re render the template, instead
      of letting iron router do the work for me. Thus, I get the old object from the collection and put it in session
      which is enough to refresh most of the fiels.
      For the text areas I am forced though to call the  forceRenderScenarioCompleteForm() method and 
      update those fields manually.
      */


      // scenarioDTO = scenariosAllApproved.find({'_id' : scenarioID}); //find the scenario with that ID
      //Session.set('currentScenarioDTO', scenarioDTO.fetch()[0])
  }
  ,"click #approveScenario" : function(){
    var confirm = window.confirm("Are you sure you want to approve the current scenario: \n\n"+Session.get('currentScenarioDTO').title);
    //console.log(confirm);
    if(confirm){
      //collect new info (if any) from the scenario. Issue #139: we only try to collect if in "editing" mode
      console.log("is scenairo editable "+ isScenarioEditable())
      if(isScenarioEditable(Session.get('currentScenarioDTO')))
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
    ' or if you think this problem is important and requires attention from the community.';
    mybutton.attr('title', text);
    //console.log(mybutton);
  }
  ,"click #like" : function(){

    // console.log("userID: "+Meteor.userId());
    // console.log("scenarioID: "+this._id);
    Meteor.call("persistACK", this._id, Meteor.userId()); //add a callback function for the case insert fails?

    // Meteor.Call("persistACK", scenarioID, userID, callbackfunction());
  }
  ,"click #downloadScn" : function(){
    var currentScenarioDTO = Session.get('currentScenarioDTO');
    var scenarioID = currentScenarioDTO._id;

      Meteor.call('exportScnAsTxt', scenarioID,  function(err, data){

        if (err){  
          // console.log(err);
          window.alert("Error exporting data. \n\n"+err.error);
        }else{
          var blob = base64ToBlob(data, "zip");
          saveAs(blob, "scn_"+scenarioID+".zip");
        }

    });
  }

});