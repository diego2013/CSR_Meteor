/** @author https://github.com/diego2013
*/


Template.scenarioCompleteForm.helpers({
    hazardEntryList : function(){
      currentScenarioDTO = Session.get('currentScenarioDTO')
      if(currentScenarioDTO===undefined)
        return [];
      else
        return currentScenarioDTO.hazardEntryList;
    } 
    //returns if the current scenario is approved
    ,isApproved : function(){
      return this.status == scenarioStatusEnum.APPROVED;
    }
    ,isNotScenarioOwner : function(){
      scenarioDTO = this;
      return scenarioDTO.owner != Meteor.userId()
    }
    /** Indicates if the user can ACK the scenario
       User is logged In (not an anonymous user)
       Current user didn't vote already for the scenario
    */
    ,allowedToACK: function(){
      if(!Meteor.user()) //anonymous user
        return false;

      scenarioDTO = this;

      if(scenarioDTO.acknowledgers!= undefined)
        if ($.inArray(Meteor.userId(), scenarioDTO.acknowledgers) != -1) //using jQuery to check if element in in array
          return false //user ID in the ACKers array
        else 
          return true
      else
        return true 
    }

    /** Indicates if the ACK button should be displayed:
    1- Current user doesn't own the scenario
    2- Current user didn't vote already for the scenario
    3- User is logged In (not an anonymous user)
    */
    ,displayAckButton : function(){
      scenarioDTO = this;

      if(!Meteor.user()) //anonymous user
        return false;

      if(scenarioDTO.owner === Meteor.userId())
        return false;

      var acknowledgers = scenarioDTO.acknowledgers;
      if (acknowledgers == undefined)
        return true;// nobody has "liked" the scenario yet

      var exists = $.inArray(Meteor.userId, acknowledgers)
      
      return (exists == -1)
    }
    //returns the number of users who acknowledged this scenario
    ,acknowledgersCount : function(){
      var scenarioDTO = this
      if (scenarioDTO.acknowledgers == undefined)
        return 0
      else 
        return scenarioDTO.acknowledgers.length
    }
  });

  Template.scenarioCompleteForm.helpers({
    equipmentEntryList : function(){
      currentScenarioDTO = Session.get('currentScenarioDTO')
      if(currentScenarioDTO===undefined)
        return [];
      else
        return currentScenarioDTO.equipmentEntryList;
    } 
  });



  Template.scenarioCompleteForm.helpers({
    referenceEntryList : function(){
      currentScenarioDTO = Session.get('currentScenarioDTO')
      if(currentScenarioDTO===undefined)
        return [];
      else
        return currentScenarioDTO.referenceEntryList;
    } 
  });


  

  Template.scenarioCompleteForm.helpers({
    environmentEntryList : function(){
      currentScenarioDTO = Session.get('currentScenarioDTO')
      if(currentScenarioDTO===undefined)
        return [];
      else
        return currentScenarioDTO.environmentEntryList;
    } 
  });

  

  Template.scenarioCompleteForm.helpers({
    roleEntryList : function(){
      currentScenarioDTO = Session.get('currentScenarioDTO')
      if(currentScenarioDTO===undefined)
        return [];
      else
        return currentScenarioDTO.roleEntryList;
    } 
  });

  Template.scenarioCompleteForm.helpers({
    // hazardEntryListCount : function(){
    //   currentScenarioDTO = Session.get('currentScenarioDTO');
    //   hazardEntryList = currentScenarioDTO==undefined?[]:currentScenarioDTO.hazardEntryList;
    //   if(hazardEntryList==undefined)
    //     return 0;
    //   else
    //     return hazardEntryList.length;
    // },
    // equipmentEntryListCount: function(){
    //   currentScenarioDTO = Session.get('currentScenarioDTO');
    //   equipmentEntryList = currentScenarioDTO==undefined?[]:currentScenarioDTO.equipmentEntryList;
    //   if(equipmentEntryList==undefined)
    //     return 0;
    //   else
    //     return equipmentEntryList.length;
    // }
    // ,referenceEntryListCount: function(){
    //   currentScenarioDTO = Session.get('currentScenarioDTO');
    //   referenceEntryList = currentScenarioDTO==undefined?[]:currentScenarioDTO.referenceEntryList;
    //   if(referenceEntryList==undefined)
    //     return 0;
    //   else
    //     return referenceEntryList.length;
    // },
    getScenarioLockOwner : function(){
      currentScenarioDTO = Session.get('currentScenarioDTO');
      var fa_lock = '<span class="fa fa-lock"></span>';
      var fa_unlock = '<span class="fa fa-unlock"></span>';
      if(currentScenarioDTO && currentScenarioDTO.lockOwnerID)
        return (fa_lock+" Scenario was locked for modification by user "+currentScenarioDTO.lockOwnerID);
      else
        return fa_unlock+" Scenario is unlocked to modification (click <em>Edit</em>)";
    }
    /** retruns true if current user can approve the scenario
    The current user could perform the action to approve a scenario if
    - The scenario is in SUBMITED state AND
    - If scenario is locked, the current user (an admin) is the owner of that lock 
    - OR if nobody has the lock (and user is an admin)
    */
    ,canApproveScenario : function(){
      currentScenarioDTO = Session.get('currentScenarioDTO');
      if(currentScenarioDTO.status!=scenarioStatusEnum.SUBMITTED)
        return false;

      if(isScenarioLocked(currentScenarioDTO)){
        return Meteor.userId()==currentScenarioDTO.lockOwnerID;
      }else
        return true;
    }
  });