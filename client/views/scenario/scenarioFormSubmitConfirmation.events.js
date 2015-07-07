/** @author https://github.com/diego2013
*/

/** Template used to display the info and form to allow user submitting their scenario for approval
*/
Template.scenarioFormSubmitConfirmation.events({

  "click #declineSubmit": function(){
    Session.set(_SCENARIO_FORM_STEP, _SCENARIO_FORM_STEP_BASIC_INFO);
    Router.go("newScenarioForm");//redirect to the Scenario Form
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
      window.alert("Mark that you have understood the Clinical Scenario Repository policies to submit your scenario");
    }
  }
});