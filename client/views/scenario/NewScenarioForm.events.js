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
              window.alert("The scenario could NOT be submitted. \n\n"+err.error);
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
    , "click #goToStep3": function(){
      collectScenarioInfo();
      Session.set(_SCENARIO_FORM_STEP, _SCENARIO_FORM_STEP_SOLUTION);
      hideScenarioFormButtons();
    }
    ,"click #getToStep1": function(){
      collectScenarioInfo();
      Session.set(_SCENARIO_FORM_STEP, _SCENARIO_FORM_STEP_BASIC_INFO);
      hideScenarioFormButtons();
    }
    , "click #getToStep2": function(){
      collectScenarioInfo();
      Session.set(_SCENARIO_FORM_STEP, _SCENARIO_FORM_STEP_ADVANCED_INFO);
      Session.set(_ADVANCEDDETAILS_TAB, _ADT_HAZARDS_templateName);
      hideScenarioFormButtons();
    }
    , "click #getToStep3": function(){
      collectScenarioInfo();
      Session.set(_SCENARIO_FORM_STEP, _SCENARIO_FORM_STEP_SOLUTION);
      hideScenarioFormButtons();
    }
    , "click #showGuidelines" : function(){
     //toggle value of the button and update reactive variable
      var buttonName = $('#showGuidelines').html().trim();
      if(stringStartsWith(buttonName, 'Show'))  {
        $('#showGuidelines').html(_hideguidelinestext);
         Session.set('showGuidelines', true);
      }else{
        $('#showGuidelines').html(_showguidelinestext);
        Session.set('showGuidelines', false);
      }
    }
    ,"click #deleteButton": function () {
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


Template.scenarioFormBasicInfo.events({
  "click .example" : function(event){
    event.preventDefault();
    //we'll show the example is a new window with half of the dimensions of the parent one
    var w = window.innerWidth; w = 2*w/3; 
    var h = window.innerHeight; h = 2*h/3;
    showInWindow(event.target.href, w, h);

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
       cleanupEditingHazards();
       Session.set(_ADVANCEDDETAILS_TAB, $element.data('step'));
  }
  ,"click #currentHazardsInfo" : function(){
    var msg = "You can edit entries on this table by using the 'edit', 'update' and 'delete' buttons on each row."
      + "\n\nClick 'edit' to enable changes and 'update' to save the changes or 'discard' to revert the changes. "
    alert(msg)
  }
});

Template.scenarioFormSolution.events({
  "click .example" : function(event){
    event.preventDefault();
    //we'll show the example is a new window with half of the dimensions of the parent one
    var w = window.innerWidth; w = 2*w/3; 
    var h = window.innerHeight; h = 2*h/3;
    showInWindow(event.target.href, w, h);

  }
});

/** Aux function to show a URL / template in a different window.
*/
showInWindow = function(url, width, height){
  var preferences = "width=" + width  + ", height=" + height;
  window.open(url, "", preferences)
}

/***** HAZARDS *****/

Template.hazardInput.events({
  "click #addNewHazard": function(){
    hazardEntryList = updateHarzardList();
    currentScenarioDTO.hazardEntryList = hazardEntryList;
    //console.log(JSON.stringify(currentScenarioDTO.hazardEntryList));
    Session.set("currentScenarioDTO", currentScenarioDTO);
  }
  ,"click #idAhrqLevels": function(event){
    event.preventDefault();
    var explanatoryText = 
    "The AHRQ Harm Scale (https://www.pso.ahrq.gov/common/generic) was grouped into categories to facilitate comparisons between harm: \n\n "
    +"Unsafe Condition,\n Near Miss,\n No Harm,\n Emotional Distress or Inconvenience,\n Harm—Additional Treatment,\n Temporary Harm," 
    +"\n Permanent Harm,\n Severe Permanent Harm and\n Death."
    window.alert(explanatoryText);
  }
  });

/**
Template for the individual enttries of a scenario hazard's list.
These will be the entries on the table containing the actual hazards of a scenario, either on the Create New Scenario View or 
while editing a submitted scenario.
*/
Template.hazardEntry.events({
  //Click to delete a hazard entry
    "click #deleteHazard" : function(event){
    event.preventDefault();
    currentScenarioDTO =  Session.get("currentScenarioDTO");
    hazardEntryList = currentScenarioDTO.hazardEntryList;
    //find and delete by index
    hazardEntryList = deleteFromArrayByID(this.id, hazardEntryList)
    currentScenarioDTO.hazardEntryList = currentScenarioDTO.hazardEntryList;
    Session.set("currentScenarioDTO", currentScenarioDTO);
    Session.set("editingHazard-"+this.id, false);
  }
  //click to update the information of a hazard
  ,"click #updateHazard" : function(event, template){
     event.preventDefault();

    // currentScenarioDTO =  Session.get("currentScenarioDTO");
    // hazardEntryList = currentScenarioDTO.hazardEntryList;

    var hazardDescription = $('[name="description-' + this.id + '"]').val();
    var hazardRisk = $('[name="risk-' + this.id + '"]').val();
    var hazardSeverity = $('[name="severity-' + this.id + '"]').val();

     hazardEntryList = updateHarzardListByElementID(this.id, hazardDescription, hazardRisk, hazardSeverity);

     currentScenarioDTO.hazardEntryList = hazardEntryList;
     Session.set("currentScenarioDTO", currentScenarioDTO);
     Session.set("editingHazard-"+this.id, false);
  }
  //click to enable the "update" interface of the table rows
  ,"click #editHazard" : function(event, template){
        event.preventDefault();
        Session.set("editingHazard-"+this.id, true);
  }
  //click to discard the changes done to a scenario entry
  ,"click #discardHazardChanges" : function(event, template){
      event.preventDefault();
      Session.set("editingHazard-"+this.id, false);
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
  //click to update the information of a hazard
  ,"click #updateReference" : function(event, template){
     event.preventDefault();

    // // currentScenarioDTO =  Session.get("currentScenarioDTO");
    // // hazardEntryList = currentScenarioDTO.hazardEntryList;

    // var hazardDescription = $('[name="description-' + this.id + '"]').val();
    // var hazardRisk = $('[name="risk-' + this.id + '"]').val();
    // var hazardSeverity = $('[name="severity-' + this.id + '"]').val();

    //  hazardEntryList = updateHarzardListByElementID(this.id, hazardDescription, hazardRisk, hazardSeverity);

    //  currentScenarioDTO.hazardEntryList = hazardEntryList;
    //  Session.set("currentScenarioDTO", currentScenarioDTO);
     Session.set("editingReference-"+this.id, false);
  }
  //click to enable the "update" interface of the table rows
  ,"click #editReference" : function(event, template){
        event.preventDefault();
        Session.set("editingReference-"+this.id, true);
  }
  //click to discard the changes done to a scenario refenrece entry
  ,"click #discardReferenceChanges" : function(event, template){
      event.preventDefault();
      Session.set("editingReference-"+this.id, false);
  }
});


/***** CLINICAL ROLES *****/

Template.roleInput.events({
    "click #addActor": function(){
    roleEntryList = updateRoleList();
    currentScenarioDTO.roleEntryList = roleEntryList;
    Session.set("currentScenarioDTO", currentScenarioDTO);
  }
  ,"change #clinicalRole" : function(){//click works as event
      $('#customActor').val('');
  }
  ,"click #customActor" : function(){
    document.getElementById('clinicalRole').value = "-";//reset dropdown select
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
  ,"change #clinicalEnvironment" : function(){//click works as event
      $('#customEnvironment').val('');
  }
  ,"click #customEnvironment" : function(){
    document.getElementById('clinicalEnvironment').value = "-";//reset dropdown select
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