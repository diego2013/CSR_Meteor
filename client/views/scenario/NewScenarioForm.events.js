/** @author https://github.com/diego2013
*/

Template.NewScenarioForm.events({
    "click #saveScenarioButton" : function(){ 
      //event.preventDefault();  
      collectScenarioInfo(); // Collects data from the form into an object
      currentScenarioDTO = Session.get('currentScenarioDTO');
     // console.log("save "+JSON.stringify(currentScenarioDTO));
      if(currentScenarioDTO.title.trim()==''){
        window.alert("The scenario needs at least a TITLE in order to be persisted. \n\nTitles are a human-friendly way of summarizing the content of the scenario and will make easier to identify your scenario later.");

        //set focus on the title text area
        var step = Session.get(_SCENARIO_FORM_STEP);
        if(step==undefined || step === _SCENARIO_FORM_STEP_BASIC_INFO){
          $("#title").focus();
        }
      } else {
        // Save the scenario
        //Meteor.call("saveScenario", currentScenarioDTO); //working code
        Meteor.call("saveScenario", currentScenarioDTO, function(err, callbackScenarioDTO) {
          //callback function
             if (err){  
              console.log(err);
              window.alert("The scenario could NOT be persisted. \n\n"+err.error);
            }else{
              //currentScenarioDTO._id = callbackScenarioDTO._id;
              currentScenarioDTO = callbackScenarioDTO;
              Session.set('currentScenarioDTO', currentScenarioDTO);
              Router.go("/NewScenarioForm");
              //Meteor._reload.reload();
            }

          });
        }
    }
    ,"click #submitScenarioButton" : function(){ 
      collectScenarioInfo(); // Collects data from the form into an object
       //Validations
       //1. Title can't be empty
       //2. Description can't be empty
      
       if(currentScenarioDTO.title.trim()=='')
         window.alert("To submit a scenario for revision and approval, the scenario TITLE can not be empty");
         // throw new Meteor.Error("'Title' can NOT be empty"); //TO-DO do something with this error
       else if (currentScenarioDTO.description.trim()==''){
         window.alert("To submit a scenario for revision and approval, the scenario DESCRIPTION can not be empty");
         //  throw new Meteor.Error("'Description' can NOT be empty");//TO-DO do something with this error
       }else{
          Meteor.call("saveScenario", currentScenarioDTO, function(err, callbackScenarioDTO) {
          //callback function
            if (err) { 
              console.log(err);
            }else{
             //currentScenarioDTO._id = callbackScenarioDTO._id;
             currentScenarioDTO = callbackScenarioDTO;
             Session.set('currentScenarioDTO', currentScenarioDTO);
             Router.go('scenarioFormSubmitConfirmation');//submit
             //Meteor._reload.reload();
            }
          });
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
      Session.set(_ADVANCEDDETAILS_TAB, _ADT_HAZARDS_templateName);
      hideScenarioFormButtons();
    }
    , "click #goToStep3": function(event, template){
      collectScenarioInfo();
      Session.set(_SCENARIO_FORM_STEP, _SCENARIO_FORM_STEP_SOLUTION);
      hideScenarioFormButtons();
    }
    , "click #showGuidelines" : function(){
     //toggle value of the button and update reactive variable
      var buttonName = $('#showGuidelines').html();
      if(buttonName=='Show Guidelines'){
        $('#showGuidelines').html('Hide Guidelines');
         Session.set('showGuidelines', true);
      }else{
        $('#showGuidelines').html('Show Guidelines');
        Session.set('showGuidelines', false);
      }
    }
    ,  "click #deleteButton": function () {
    var confirm = window.confirm("Are you sure you want to delete scenario with UID "+this._id+ " \ntitled \""+ this.title+"\"");
    if(confirm){

      if(this._id)
        Meteor.call("deleteScenario", this._id, function(err, result) {
            //callback function
               if (err){
                  console.log(err);
               }else{
                  Session.set('currentScenarioDTO', undefined);
               }
            });
      else
        Session.set('currentScenarioDTO', undefined);
    }

    }
});


Template.scenarioFormAdvancedInfo.events({
  "click #setp2tab a" : function( event ){
       var element = $(event.target)[0] //element that triggered the event
        $element = $(element);
       // console.log(element);
       $('div#setp2tab a').removeClass('selectedTab');//remove the class for all the tabs
       $element.addClass('selectedTab'); //add the class to the appropriate tab
       collectScenarioInfo();
       Session.set(_ADVANCEDDETAILS_TAB, $element.data('step'));
  }
});

/***** HAZARDS *****/

Template.hazardInput.events({
  "click #addNewHazard": function(){
    hazardEntryList = updateHarzardList();
    currentScenarioDTO.hazardEntryList = hazardEntryList;
    //console.log(JSON.stringify(currentScenarioDTO.hazardEntryList));
    Session.set("currentScenarioDTO", currentScenarioDTO);
  }
  });

Template.hazardEntry.events({
    "click #deleteHazard" : function(event){
    event.preventDefault();
    currentScenarioDTO =  Session.get("currentScenarioDTO");
    hazardEntryList = currentScenarioDTO.hazardEntryList;
    //find and delete by index
    hazardEntryList = deleteFromArrayByID(this.id, hazardEntryList)
    currentScenarioDTO.hazardEntryList = currentScenarioDTO.hazardEntryList;
    Session.set("currentScenarioDTO", currentScenarioDTO);
  }
});

/***** EQUIPMENT *****/

Template.equipmentInput.events({
  "click #addNewEquipment": function(){
    currentScenarioDTO.equipmentEntryList = updateEquipmentList();
    Session.set("currentScenarioDTO", currentScenarioDTO);
  }
});

Template.equipmentEntry.events({
  "click #deleteEquipment" : function(event){
    event.preventDefault();
    currentScenarioDTO =  Session.get("currentScenarioDTO");
    equipmentEntryList = currentScenarioDTO.equipmentEntryList;
    //find and delete by index
    currentScenarioDTO.equipmentEntryList = deleteFromArrayByID(this.id, equipmentEntryList)
    Session.set("currentScenarioDTO", currentScenarioDTO);
  }
});


/***** REFERENCES *****/

Template.referenceInput.events({
  "click #addNewReference": function(){
    referenceEntryList = updateReferenceList();
    currentScenarioDTO.referenceEntryList = referenceEntryList;
    Session.set("currentScenarioDTO", currentScenarioDTO);
  }
});

Template.referenceEntry.events({
  "click #deleteReference" : function(event){
    event.preventDefault();
    currentScenarioDTO =  Session.get("currentScenarioDTO");
    referenceEntryList = currentScenarioDTO.referenceEntryList;
    //find and delete by index
    referenceEntryList = deleteFromArrayByID(this.id, referenceEntryList)
    currentScenarioDTO.referenceEntryList = currentScenarioDTO.referenceEntryList;
    Session.set("currentScenarioDTO", currentScenarioDTO);
  }
});


/***** CLINICAL ROLES *****/

Template.roleInput.events({
    "click #addActor": function(){
    roleEntryList = updateRoleList();
    currentScenarioDTO.roleEntryList = roleEntryList;
    Session.set("currentScenarioDTO", currentScenarioDTO);
  }
});

Template.roleEntry.events({
  "click #deleteRole" : function(event){
    //event.preventDefault();
    currentScenarioDTO =  Session.get("currentScenarioDTO");
    roleEntryList = currentScenarioDTO.roleEntryList;
    //find and delete by index
    roleEntryList = deleteFromArrayByID(this.id, roleEntryList)
    currentScenarioDTO.roleEntryList = roleEntryList;
    Session.set("currentScenarioDTO", currentScenarioDTO);
  }
});


/***** CLINICAL ENVIRONMENTS *****/

Template.environmentInput.events({
  "click #addPlace": function(){
    currentScenarioDTO.environmentEntryList = updateEnvironmentList();
    Session.set("currentScenarioDTO", currentScenarioDTO);
  }
});

Template.environmentEntry.events({
  "click #deletePlace" : function(event){
    //event.preventDefault();
    currentScenarioDTO =  Session.get("currentScenarioDTO");
    environmentEntryList = currentScenarioDTO.environmentEntryList;
    //find and delete by index
    currentScenarioDTO.environmentEntryList = deleteFromArrayByID(this.id, environmentEntryList);
    Session.set("currentScenarioDTO", currentScenarioDTO);
  }
});