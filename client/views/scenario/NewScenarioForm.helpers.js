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
    ,hazardEntryListCount : function(){
      currentScenarioDTO = Session.get('currentScenarioDTO');
      hazardEntryList = currentScenarioDTO==undefined?[]:currentScenarioDTO.hazardEntryList;
      if(hazardEntryList==undefined)
        return 0;
      else
        return hazardEntryList.length;
    } 
    ,hasHazards : function(){
      currentScenarioDTO = Session.get('currentScenarioDTO');
      if (currentScenarioDTO==undefined || currentScenarioDTO.hazardEntryList == undefined)
        return false;
      else
        return hazardEntryList.length > 0;
    }
  });

  Template.hazardEntry.helpers({
    editingHazard : function(){
      return Session.get("editingHazard-"+this.id) && isScenarioEditable(Session.get("currentScenarioDTO"));
    }
    ,getHazardUpdateDescription_NameId : function(){
      return "description-"+this.id;
    }
    ,getHazardUpdateRisk_NameId : function(){
      return "risk-"+this.id;
    }
    ,getHazardUpdateSeverity_NameId : function(){
      return "severity-"+this.id;
    }
    ,hazardRiskcategories : function(){
        return ["Not Relevant", "Unknown", "Expected", "Unexpected"]
    }
    ,getHazardUpdateSelected : function(value){
      // console.log($(this));
    }
    ,getHazardRisk : function(riskValue){
        if (this.hazardRisk === riskValue)
          return {selected:'selected'}
        else
          return ''
    }
    ,getHazardSeverity : function(severityValue){
        if (this.hazardSeverity === severityValue)
          return {selected:'selected'}
        else
          return ''
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

    ,equipmentEntryListCount: function(){
      currentScenarioDTO = Session.get('currentScenarioDTO');
      equipmentEntryList = currentScenarioDTO==undefined?[]:currentScenarioDTO.equipmentEntryList;
      if(equipmentEntryList==undefined)
        return 0;
      else
        return equipmentEntryList.length;
    }
    ,hasEquipment : function(){
      currentScenarioDTO = Session.get('currentScenarioDTO');
      if (currentScenarioDTO==undefined || currentScenarioDTO.equipmentEntryList == undefined)
        return false;
      else
        return equipmentEntryList.length > 0;
    }
  });


   Template.equipmentEntry.helpers({
    editingEquipment : function(){
      return Session.get("editingEquipment-"+this.id) && isScenarioEditable(Session.get("currentScenarioDTO"));
    }

    //XXX All these could actually be a setName = function(val){return "update-"+"val"+"-"+this.id}
    ,getEquipmentUpdateDeviceType_NameId : function(){
      return "update-devicetype-"+this.id;
    }
    ,getEquipmentUpdateManufacturer_NameId : function(){
      return "update-manufacturer-"+this.id;
    }
    ,getEquipmentUpdateModel_NameId : function(){
      return "update-model-"+this.id;
    }
    ,getEquipmentUpdateRosetta_NameId : function(){
      return "update-rosetta-"+this.id;
    }
    ,getNameId : function(name){
      return 'update-'+name+"-"+this.id;
    }
    ,getCheckboxValue : function(value){
      if(value == undefined || value.trim()=='')
        return ''

      if(this[value])
        return "checked";
      else
        return '';
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
    ,referenceEntryListCount : function(){
      currentScenarioDTO = Session.get('currentScenarioDTO');
      referenceEntryList = currentScenarioDTO==undefined?[]:currentScenarioDTO.referenceEntryList;
      if(referenceEntryList==undefined)
        return 0;
      else
        return referenceEntryList.length;
    } 
    ,hasReferences : function(){
      currentScenarioDTO = Session.get('currentScenarioDTO');
      if (currentScenarioDTO==undefined || currentScenarioDTO.referenceEntryList == undefined)
        return false;
      else
        return referenceEntryList.length > 0;
    }
  });

  Template.referenceEntry.helpers({
    editingReference : function(){
      return Session.get("editingReference-"+this.id)  &&  isScenarioEditable(Session.get("currentScenarioDTO"));
    }
    ,getReferenceUpdateUrl_NameId : function(){
      return "ref-url-"+this.id;
    }
    ,getReferenceUpdateRelevance_NameId : function(){
      return "ref-relevance-"+this.id;
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
    ,environmentEntryListCount : function(){
      currentScenarioDTO = Session.get('currentScenarioDTO');
      environmentEntryList = currentScenarioDTO==undefined?[]:currentScenarioDTO.environmentEntryList;
      if(environmentEntryList==undefined)
        return 0;
      else
        return environmentEntryList.length;
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
    ,roleEntryListCount : function(){
      currentScenarioDTO = Session.get('currentScenarioDTO');
      roleEntryList = currentScenarioDTO==undefined?[]:currentScenarioDTO.roleEntryList;
      if(roleEntryList==undefined)
        return 0;
      else
        return roleEntryList.length;
    } 
  });

  Template.roleInput.helpers({
    clinicalroles : function(){
      return clinicalRolesArray ;
    }
  });

  Template.environmentInput.helpers({
    clinicalenvironments : function(){
      return clinicalEnvironmentsArray ;
    }
  });

  Template.scenarioFormSolution.helpers({
  });

