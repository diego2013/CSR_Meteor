/** @author https://github.com/diego2013
*/

  Template.NewScenarioForm.helpers({
    //returns the template name of the dynamic template in the NewScenarioForm template  
    newScenarioStep : function(){
      var newScenarioStep = Session.get(_SCENARIO_FORM_STEP);
      if(newScenarioStep === _SCENARIO_FORM_STEP_BASIC_INFO)
        return _SCENARIO_FORM_STEP_BASIC_INFO_templateName;
      else if(newScenarioStep === _SCENARIO_FORM_STEP_ADVANCED_INFO)
        return _SCENARIO_FORM_STEP_ADVANCED_INFO_templateName;
      else if(newScenarioStep === _SCENARIO_FORM_STEP_SOLUTION)
        return _SCENARIO_FORM_STEP_SOLUTION_templateName;
      else //default
        return _SCENARIO_FORM_STEP_BASIC_INFO_templateName;
    },
    //returns if the parameter provided is the same than the ssesion variable "_SCENARIO_FORM_STEP"
    isScenarioStep: function(step) {
      var newScenarioStep = Session.get(_SCENARIO_FORM_STEP);
      return step==newScenarioStep;
    }
  });

    Template.scenarioFormBasicInfo.helpers({
      editableScn : function(){
        if(Session.get('currentScenarioDTO')==undefined)
          return true;
        else
          return Session.get('currentScenarioDTO').status==scenarioStatusEnum.UNSUBMITTED;
      }
  });

//XXX These helpers may actually be duplicated in the completeScenarioForm panel/template
  Template.scenarioFormAdvancedInfo.helpers({
      advancedDetailsTemplateName : function(){
        var _advancedDetailsTemplateName = Session.get(_ADVANCEDDETAILS_TAB);
        if(_advancedDetailsTemplateName==undefined)
          return _ADT_HAZARDS_templateName;
        else
          return _advancedDetailsTemplateName;
      }
  });

  Template.advancedDetailsHazards.helpers({
    hazardEntryList : function(){
      currentScenarioDTO = Session.get('currentScenarioDTO')
      if(currentScenarioDTO===undefined)
        return [];
      else
        return currentScenarioDTO.hazardEntryList;
    } 
  });

  Template.advancedDetailsEquipment.helpers({
    equipmentEntryList : function(){
      currentScenarioDTO = Session.get('currentScenarioDTO')
      if(currentScenarioDTO===undefined)
        return [];
      else
        return currentScenarioDTO.equipmentEntryList;
    } 
  });

  Template.advancedDetailsReferences.helpers({
    referenceEntryList : function(){
      currentScenarioDTO = Session.get('currentScenarioDTO')
      if(currentScenarioDTO===undefined)
        return [];
      else
        return currentScenarioDTO.referenceEntryList;
    } 
  });

  Template.advancedDetailsEnvironments.helpers({
    environmentEntryList : function(){
      currentScenarioDTO = Session.get('currentScenarioDTO')
      if(currentScenarioDTO===undefined)
        return [];
      else
        return currentScenarioDTO.environmentEntryList;
    } 
  });

  Template.advancedDetailsRoles.helpers({
    roleEntryList : function(){
      currentScenarioDTO = Session.get('currentScenarioDTO')
      if(currentScenarioDTO===undefined)
        return [];
      else
        return currentScenarioDTO.roleEntryList;
    } 
  });

  Template.scenarioFormSolution.helpers({
  });

