/** @author https://github.com/diego2013

  Helpful functions to manipulate data from the templates

*/


/** Returns a boolean to indicare if the provided scenario is editable or not.
1. If the scenario is UNSUBMITTED it should only be editable by the the owner (current user is owner)
2. If the scenario is SUBMITTED or APPROVED is editable if the current user is the scenario lock's owner
3. If user is not logged in we don't allow scenario editing (not even 'anonymous sceanrios').
NOTE: tis simple approach does not have in consideration the anonymous scenarios
*/
isScenarioEditable = function(currentScenarioDTO){
  //console.log(JSON.stringify(currentScenarioDTO));
  if(!Meteor.user())
    return false; //issue #99. If user is not logged in scenario is not editable

  if(currentScenarioDTO == undefined ){//so we can edit brand new scenarios not yet persited for the first time.
    return true;
  }
  if(currentScenarioDTO.status == scenarioStatusEnum.UNSUBMITTED){
    //console.log("userID "+Meteor.userId()+ " scenario Owner "+currentScenarioDTO.owner);
    return (Meteor.userId()== currentScenarioDTO.owner) || (currentScenarioDTO.owner==undefined);
  }

  if(currentScenarioDTO.status == scenarioStatusEnum.SUBMITTED || currentScenarioDTO.status == scenarioStatusEnum.APPROVED){
    if(currentScenarioDTO.lockOwnerID && Meteor.userId()){
      return (Meteor.userId()==currentScenarioDTO.lockOwnerID);
    }else{
      return false;
  }
  
}

//otherwise
  return false;
};

/** Returns a boolean to indicare if the provided scenario is locked for modification or not.
*/ 
isScenarioLocked = function(currentScenarioDTO){
  if(currentScenarioDTO && currentScenarioDTO.lockOwnerID)
    return true;
  else
    return false;  
};

//Hides the button corresponding to the panel of the Scenario Form
// in which we are by changing the button class.
hideScenarioFormButtons = function(){

//1. Navigation buttons
//remove the btn-salmon class from all three buttons. Add blue button class for the three of them
//btn btn-small btn-blue
  $("#goToStep1").removeClass("btn-salmon");
  $("#goToStep2").removeClass("btn-salmon");
  $("#goToStep3").removeClass("btn-salmon");
  $("#goToStep1").addClass("btn-blue");
  $("#goToStep2").addClass("btn-blue");
  $("#goToStep3").addClass("btn-blue");

  $("#getToStep1").removeClass("badge-color-selected");
  $("#getToStep2").removeClass("badge-color-selected");
  $("#getToStep3").removeClass("badge-color-selected");

//figure out in which panel we are and add the slamon button class to just that button
  var newScenarioStep = Session.get(_SCENARIO_FORM_STEP);

  if(newScenarioStep === _SCENARIO_FORM_STEP_BASIC_INFO){
    $("#goToStep1").removeClass("btn-blue");
    $("#goToStep1").addClass("btn-salmon");
    $("#getToStep1").addClass("badge-color-selected");
    // $("[id='goToStep1']").addClass("btn-salmon"); // to select more than one elm with the same ID (bad practice)
  }
  else if(newScenarioStep === _SCENARIO_FORM_STEP_ADVANCED_INFO){
    $("#goToStep2").removeClass("btn-blue");
    $("#goToStep2").addClass("btn-salmon");
    $("#getToStep2").addClass("badge-color-selected");
  }
  else if(newScenarioStep === _SCENARIO_FORM_STEP_SOLUTION){
    $("#goToStep3").removeClass("btn-blue");
    $("#goToStep3").addClass("btn-salmon");
    $("#getToStep3").addClass("badge-color-selected");
  }else {//default
    $("#goToStep1").removeClass("btn-blue");
    $("#goToStep1").addClass("btn-salmon");
    $("#getToStep1").addClass("badge-color-selected");
  }

 };


/*Highlights the element of the navigation bar that idenfifies the route where we are on
// Is easier to do it this way than using CSS pseudoselectors due to the anidated nev links
@param routeName the path we are currently on 
*/
highLightNavBatItem = function(routeName){

  if(routeName==undefined)
    return;

  //clean. Remove the class from all main nav bar items
  // $("#cnsNavBarItem").removeClass("selectedNavItem");
  // $("#ssNavBarItem").removeClass("selectedNavItem");  
  // $("#fbiNavBarItem").removeClass("selectedNavItem");
  // $("#feedNavBarItem").removeClass("selectedNavItem");  
  // $("#homeNavBarItem").removeClass("selectedNavItem");
  // $("#upNavBarItem").removeClass("selectedNavItem");
  // $("#listUsersNavBarItem").removeClass("selectedNavItem");

  //clean. Remove the class from all main nav bar items
  $('.nav li').removeClass("selectedNavItem");

  //ID the route we are on
  var navItemID;

  if(routeName=='/' || routeName=='home')
    navItemID = 'homeNavBarItem';
  else   if(routeName=='createNewScenario' || routeName=='newScenarioForm' || (routeName.lastIndexOf('NewScenarioForm', 0) === 0) ||
      routeName=='new' || routeName=='scenarioFormSubmitConfirmation' || routeName=='scenarioFormThankYou')
    navItemID = 'cnsNavBarItem';
  else   if(routeName=='scenarioList' || routeName=='approvedScenarioList' || routeName=='recentSubmissionsScenarioList')
    navItemID = 'ssNavBarItem';
  else   if(routeName=='findByIDTemplate')
    navItemID = 'searchNavBarItem';
  else   if(routeName=='userProfile' || (routeName.substring(0,'userProfile'.length)==='userProfile'))
    navItemID = 'upNavBarItem';
  else   if(routeName=='FeedbackForm' || routeName=='FeedbackFormThakYou' || routeName=='feedbackReviewList')
    navItemID = 'feedNavBarItem';
  else if(routeName=='usersList')
    navItemID = 'listUsersNavBarItem';
  else if(routeName=='aboutUs')
    navItemID = 'aboutNavBarItem';
  else if(routeName=='help')
    navItemID = 'helpNavBarItem';

  //add the "shaded" class to that nav bar item
  $("#"+navItemID).addClass("selectedNavItem");

 };

 /** Collects data from the New Scenario form into an object and
 sets the variable currentScenarioDTO with the information from the templates
 */
collectScenarioInfo = function(){
 
  //if there is no scenario in session, we create a new one.
  if(currentScenarioDTO==undefined){
    cleanNewScenarioForm();
    currentScenarioDTO =  Session.get("currentScenarioDTO");
  }


//We need to determin which (sub)template is rendered, becuse otherwise the components won't exits and 
// trying to get their value (which woulb be 'undefined') would persist 'undefined' for those attributes.
  if(Session.get(_SCENARIO_FORM_STEP) === _SCENARIO_FORM_STEP_BASIC_INFO){
    currentScenarioDTO.title = $('#title').val();
    currentScenarioDTO.description = $("#description").val();
  } else  if(Session.get(_SCENARIO_FORM_STEP) === _SCENARIO_FORM_STEP_SOLUTION){
    currentScenarioDTO.solutionDescription = $('#solutionDescription').val();
    currentScenarioDTO.benefitsDescription = $("#benefitsDescription").val();
    currentScenarioDTO.risksDescription = $("#risksDescription").val();
  } else if(Session.get(_SCENARIO_FORM_STEP) === _SCENARIO_FORM_STEP_ADVANCED_INFO){
    
    if(Session.get(_ADVANCEDDETAILS_TAB) === _ADT_LESSONSLEARNED_templateName){
      currentScenarioDTO.lessonsLearned = $('#lesson').val();
      currentScenarioDTO.preventable    = $('#preventable').val();
    }

  }
  Session.set("currentScenarioDTO", currentScenarioDTO);
};

/** Collects the information from the components of the form scenarioCompleteForm
  and puts the object in session
*/
collectScenarioCompleteFormInfo = function(){
  // Collects data from the form into an object
  currentScenarioDTO =  Session.get("currentScenarioDTO");

  //if there is no scenario in session (really unlikely for this template), we create a new one.
  if(currentScenarioDTO==undefined){
    cleanNewScenarioForm();
    currentScenarioDTO =  Session.get("currentScenarioDTO");
    //NOTE: the sceanrio status is going to be "UNSUBMITTED"
  }

  currentScenarioDTO.title = $('#title').val();
  currentScenarioDTO.description = $("#description").val();

  currentScenarioDTO.solutionDescription = $('#solutionDescription').val();
  currentScenarioDTO.benefitsDescription = $("#benefitsDescription").val();
  currentScenarioDTO.risksDescription = $("#risksDescription").val();

  currentScenarioDTO.lessonsLearned = $('#lesson').val();
  currentScenarioDTO.preventable = $('#preventable').val();

  Session.set("currentScenarioDTO", currentScenarioDTO);
 };

 //Cleans the input fields of the new scenario form as well as the currentScenarioDTO session variable
cleanNewScenarioForm = function(){

  // var newCleanScenarioDTO = {
  var currentScenarioDTO = {
    title : '',
    description : '',
    solutionDescription : '',
    benefitsDescription : '',
    risksDescription : '',
    status : scenarioStatusEnum.UNSUBMITTED, //new
    lessonsLearned : '',  //scenarioFormAdvancedInfo.LeesonsLearned
    preventable : '',     //scenarioFormAdvancedInfo.preventable
    hazardEntryList : [],       //new empty "list"
    referenceEntryList : [],    //new empty "list"
    roleEntryList : [],               //new empty "list"
    environmentEntryList : [],        //new empty "list"
    equipmentEntryList : []           //new empty "list"

  };


  // currentScenarioDTO = newCleanScenarioDTO;
  //this copy of a new object is to force the creation of a new DTO that
  // does not have an _Id. This way, we won't need to overwrite the one
  // the DTO has and create a problem for Meteor Mongo inserts
  // (with an _Id that is not a non-empty strring or an object ID)

  //scenarioFormBasicInfo
  $('#title').val("");  //currentScenarioDTO.title = "";
  $('#description').val("");  //currentScenarioDTO.description = "";
  //scenarioFormAdvancedInfo
  //TODO
  //scenarioFormSolution
  $('#solutionDescription').val("");  //currentScenarioDTO.solutionDescription = "";
  $('#benefitsDescription').val("");  //currentScenarioDTO.benefitsDescription = "";
  $('#risksDescription').val("");     //currentScenarioDTO.risksDescription = "";

  $('#lesson').val("");

  
  Session.set("currentScenarioDTO", currentScenarioDTO);  
  // Session.set(_SCENARIO_FORM_STEP, _SCENARIO_FORM_STEP_BASIC_INFO);
  
 };

 forceRenderScenarioCompleteForm = function(scenarioDTO){
  if(scenarioDTO == undefined)
    return 

  $('#title').val(currentScenarioDTO.title);
  $("#description").val(currentScenarioDTO.description);

  $('#solutionDescription').val(currentScenarioDTO.solutionDescription);
  $("#benefitsDescription").val(currentScenarioDTO.benefitsDescription);
  $("#risksDescription").val(currentScenarioDTO.risksDescription);

  $('#lesson').val(currentScenarioDTO.lessonsLearned);
  $('#preventable').val(currentScenarioDTO.preventable);

 }

//Finds a scenario from the current collection by ID
findByID = function(scenarioID){
   //1. validation that the input is valid
   if(scenarioID==='')
     alert("The scenario ID can not be empty")
   else{
     //2. Search
     currentScenarioDTO = ScenariosAll.findOne({_id: scenarioID});
     // console.log(currentScenarioDTO)

     //3. Check authorization: user must be scenario owner or scenario must be "approved"
     // and redirect
     if(currentScenarioDTO===undefined ||
       (currentScenarioDTO.owner != Meteor.userId()  && currentScenarioDTO.status != scenarioStatusEnum.APPROVED)){

        Session.set('auxScenarioID', scenarioID);
         //console.log(JSON.stringify(currentScenarioDTO));
        Router.go('/findByIDErrorTemplate'); //redirect to error page
        //Router.go('findByIDErrorTemplate', {data : function() {return scenarioID}});
        
     }else{
          Session.set("currentScenarioDTO", currentScenarioDTO);
          //redirect based on scenario status
          if(currentScenarioDTO.status == scenarioStatusEnum.APPROVED){
            //redirect to complete scenario view
             Router.go("/scenarioComplete/"+currentScenarioDTO._id)
          }else{
            //redirect to the "create sceanro" view
               Session.set(_SCENARIO_FORM_STEP, _SCENARIO_FORM_STEP_BASIC_INFO);
               // Session.set("currentScenarioDTO", currentScenarioDTO);
               Router.go("/newScenarioForm", {
                // data : currentScenarioDTO,
                 yieldTemplates: {
                       'scenarioFormBasicInfo': {to: 'newScenarioStep'}
                 }
               });
          }

     }

   } 
 };

//deletes the element with the given ID from the array
deleteFromArrayByID = function(ID, array){
  for(var i = 0; i<array.length; i++){
    listItem = array[i];
    if(listItem.id !=undefined && listItem.id===ID){
      array.splice(i, 1);
    }
  }
  return array;
};

//reads the hazard description that is in the form and returns the 
// updated hazards list
updateHarzardList = function(){
  
    currentScenarioDTO = Session.get("currentScenarioDTO");
    hazardEntryList = currentScenarioDTO.hazardEntryList;

    var _hazardDescription = $("#hazardDescription").val();
    var _hazardRisk = $("#hazardRisk").val();
    var _hazardSeverity = $("#hazardSeverity").val();
    if(_hazardDescription.trim()!= ''){
      var listItem = {
        hazardDescription : _hazardDescription,
        hazardRisk : _hazardRisk,
        hazardSeverity : _hazardSeverity,
        id :  hazardEntryList.length
      }
  
      hazardEntryList[hazardEntryList.length] = listItem;
      //currentScenarioDTO.hazardEntryList = hazardEntryList;
    }

    //clear form. Initialize dropdownd and clear text areas
    $("#hazardDescription").val('');
    $("#hazardRisk")[0].selectedIndex = 0
    $("#hazardSeverity")[0].selectedIndex = 0


    return hazardEntryList
};


/**
Updates a hazard on the current scenario dto (in session) given an element ID
*/
updateHarzardListByElementID = function(itemID, description, risk, severity){

    currentScenarioDTO = Session.get("currentScenarioDTO");
    hazardEntryList = currentScenarioDTO.hazardEntryList;

    if (itemID == undefined || itemID < 0)
      return hazardEntryList;

    if(description.trim()!= ''){
      for(var i = 0; i<hazardEntryList.length; i++){
        if(hazardEntryList[i].id==Number(itemID)){
          hazardEntryList[i].hazardDescription = description;
          hazardEntryList[i].hazardRisk = risk;
          hazardEntryList[i].hazardSeverity = severity;
        }
      }
    }

    return hazardEntryList;

}

//reads the equipment description that is in the form and returns the 
// updated equipment list
updateEquipmentList = function(){
  
    currentScenarioDTO = Session.get("currentScenarioDTO");
    equipmentEntryList = currentScenarioDTO.equipmentEntryList;

    var _deviceType = $("#deviceType").val();
    var _manufacturer = $("#deviceManufacturer").val();
    var _model = $("#deviceModel").val();
    var _rosetta = $("#deviceRosetta").val();
    if(_deviceType.trim()!= ''){
      var listItem = {
        deviceType : _deviceType,
        manufacturer : _manufacturer,
        model : _model,
        rosetta : _rosetta,
        trainingRelated :  $("#trainingRelated:checked").val(),
        instructionsRelated : $("#instructionsRelated:checked").val(),
        confusingRelated : $("#confusingRelated:checked").val(),
        softwareRelated :  $("#softwareRelated:checked").val(),
        hardwareRelated :  $("#hardwareRelated:checked").val(),
        id :  equipmentEntryList.length
      }
  
      equipmentEntryList[equipmentEntryList.length] = listItem;
    }
    //clear form
    $("#deviceType").val('');
    $("#deviceManufacturer").val('');
    $("#deviceModel").val('');
    $("#deviceRosetta").val('');

    //Issue #8. Uncheck all
    $("#trainingRelated")[0].checked = false;//.attr('checked', false); //.checked = false;
    $("#instructionsRelated").attr('checked', false); //.checked = false;
    $("#confusingRelated").attr('checked', false); //.checked = false;
    $("#softwareRelated").prop('checked', false); //for jQuery 1.6+ //.checked = false;
    $("#hardwareRelated:checked").attr('checked', false); //.checked = false;

    return equipmentEntryList
};


//reads the reference description that is in the advancedDetailsReferences template
// and updates the references list
updateReferenceList = function(){

    currentScenarioDTO = Session.get("currentScenarioDTO");
    referenceEntryList = currentScenarioDTO.referenceEntryList;

    var _referenceUrlProtocol = $("#referenceUrlProtocol").val();
    var _referenceUrl = $("#referenceUrl").val();
    var _referenceRelevance = $("#referenceRelevance").val();
    // if(_referenceUrl.trim() != ""){ Issue #172. URL not mandatory to add references.
    var listItem = {
      referenceUrl : _referenceUrl.trim() != "" ? _referenceUrlProtocol + _referenceUrl : "",
      referenceRelevance : _referenceRelevance,
      id : referenceEntryList.length
    }
    referenceEntryList[referenceEntryList.length] = listItem;
    // }

    //clean form 
    $("#referenceUrlProtocol").val("http://");
    $("#referenceUrl").val('');
    $("#referenceRelevance").val('');

    return referenceEntryList;
};

/**
Updates a reference on the current scenario dto (in session) given an element ID
*/
updateReferenceListByElementID = function(itemID, url, relevance){

    currentScenarioDTO = Session.get("currentScenarioDTO");
    referenceEntryList = currentScenarioDTO.referenceEntryList;

    if (itemID == undefined || itemID < 0)
      return referenceEntryList;

    if(url.trim()!= '' || relavance.trim() != ''){
      for(var i = 0; i<referenceEntryList.length; i++){
        if(referenceEntryList[i].id==Number(itemID)){
          referenceEntryList[i].referenceUrl = url;
          referenceEntryList[i].referenceRelevance = relevance;

        }
      }
    }

    return referenceEntryList;

}

//reads the Roles Involved panel and updates the clinical roles list
updateRoleList = function(){
   currentScenarioDTO = Session.get("currentScenarioDTO");
   roleEntryList = currentScenarioDTO.roleEntryList;

   var role = $("#clinicalRole").val();
   var customRole = $('#customActor').val().trim();
   if(role === '-'){
    if(customRole != ''){//non-empty
         item = {role : customRole, id : roleEntryList.length};
         roleEntryList[roleEntryList.length] = item;
    }
   }else{
       item = {role : role, id : roleEntryList.length};
       roleEntryList[roleEntryList.length] = item;
   }
   $('#customActor').val('');//clean

   // item = {role : role, id : roleEntryList.length};
   // roleEntryList[roleEntryList.length] = item;
   
   return roleEntryList;
};

//reads the Environments Involved panel and updates the clinical environments list
updateEnvironmentList = function(){
   currentScenarioDTO = Session.get("currentScenarioDTO");
   environmentEntryList = currentScenarioDTO.environmentEntryList;

   var place = $("#clinicalEnvironment").val();
   var customEnv = $('#customEnvironment').val().trim();
   if(place === '-'){
    if(customEnv != ''){//non-empty
         item = {place : customEnv, id : environmentEntryList.length};
         environmentEntryList[environmentEntryList.length] = item;
    }
   }else{
       item = {place : place, id : environmentEntryList.length};
       environmentEntryList[environmentEntryList.length] = item;
   }
   $('#customEnvironment').val('');//clean
   // item = {place : place, id : environmentEntryList.length};
   // environmentEntryList[environmentEntryList.length] = item;
   
   return environmentEntryList;
};


/** gives the number of documents in the collection being displayed on the template
@routeName current route
*/
scenarioTotalCount = function(routeName){
  if(routeName == 'scenarioList'){
    var scenarioStatusFilter = Session.get('scenarioStatusFilter');
    if(scenarioStatusFilter == scenarioStatusEnum.UNSUBMITTED)
      return Counts.get('myScenariosCounter_unsubmitted')
    else if (scenarioStatusFilter == scenarioStatusEnum.SUBMITTED)
      return Counts.get('myScenariosCounter_submitted')
    else if (scenarioStatusFilter == scenarioStatusEnum.APPROVED)
      return Counts.get('myScenariosCounter_approved')
    else
      return Counts.get('myScenariosCounter');
  }
  else if(routeName == 'approvedScenarioList')
    return Counts.get('approvedScenariosCounter');
  else if(routeName == 'recentSubmissionsScenarioList')
    return Counts.get('submittedScenariosCounter');
  else
    return '-'
};



/** Convert from as a base64 string to a Blob Object
@base64String base64 string 
@blobType type of the blob
*/
base64ToBlob = function(base64String, blobType) {
  var byteCharacters = atob(base64String);
  var byteNumbers    = new Array(byteCharacters.length);
  var i              = 0;
  while (i < byteCharacters.length){
    byteNumbers[i] = byteCharacters.charCodeAt(i)
    i++
  }

  var byteArray = new Uint8Array(byteNumbers);
  return blob = new Blob([byteArray], {type: blobType});
};


/* Returns if the given string strats with the prefix. It is case sensitive.
@param String the string to text
@param prefix
@reruns true or false
*/
 stringStartsWith = function(string, prefix) {
    return string.slice(0, prefix.length) == prefix;
};



/*
Flashing (animated) red arrow for the tab bar panel
@param a boolean parameter to switch between two states
*/
flashingRedArrow = function(back){
    if(back==undefined)
      var back=false;
    $('#tabbarredarrow').animate(
      { opacity: (back) ? 1 : 0.5
        // ,"padding-left": (back) ? "+=5" :"0"
      }, 1000
      , function(){flashingRedArrow(!back)}
    );
};

/**
Clean-up function for eny entris on the "Add Hazard" that might be updating/editing entries
This clean up function will set to "false" all editing variables.
*/

cleanupEditingHazards = function(){
    currentScenarioDTO =  Session.get("currentScenarioDTO");
    if (currentScenarioDTO == undefined)
      return;

    hazardEntryList = currentScenarioDTO.hazardEntryList;
    for (var i =0; i< hazardEntryList.length; i++){
      Session.set("editingHazard-"+i, false);
    }

}



