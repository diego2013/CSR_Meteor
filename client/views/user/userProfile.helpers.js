/** @author https://github.com/diego2013
*/

 Template.userProfile.helpers({
   userLoggedIn : function(){
     return Meteor.userId();
   }/*, 
   userData : function(){
     return userDTO;
   }*/
 });

 Template.userDataTemplate.helpers({
  //XXX these two functions will eventually need to take care of 
  // Meteor.user().services.google.email
    useremail : function(){
      if(Meteor.userId() && Meteor.user().emails){
        return Meteor.user().emails[0].address;
      }else
        return 'not specified';
    },
    verifiedUseremail : function(){
      if(Meteor.userId() && Meteor.user().emails!=undefined)
        return Meteor.user().emails[0].verified;
      else
        return 'not applicable';
    }
 });

Template.userPreferencesStats.helpers({
  //mark/unmark options for the user preferences panel
  checkshowcontexthelp : function(){
    if (Meteor.user().profile && Meteor.user().profile.user_preferences){
      if (Meteor.user().profile.user_preferences.show_context_help)
        return 'checked'
    }
    else 
      return 'checked'; //by default show contextual help
  }
  /**if the current user preference resembles the parameter
  this functoin returns a string that will make the option in the dropwon which called with this value selected
  and will return an empty string if not
  */
  ,selectedResultPerPageScenarios : function(param){
    if (Meteor.user().profile && Meteor.user().profile.user_preferences){
        return Meteor.user().profile.user_preferences.selectedResultPerPageScenarios === param ? {selected:'selected'}: '';
    }
    else 
      return param === 10 ? {selected:'selected'}: ''; //default value is 10

  }

  /** Returns TRUE if the provided ID is the current user's _ID
  @param an _id as in the meteor.users collection
  */
    ,isCurrentUserID : function(user_id){
      return user_id == Meteor.userId();
    }
   /** Returns empty string if the user preferences are editable and 'disabled="disabled" ' if not, making the components on the UI disabled.
   In order to know if the components should be enabled the current user ID must be the user_id provided as a parameter (from the template)
   @param an _id as in the meteor.users collection
   */ 
   ,areUserPreferencesEnabled : function(user_id){
      if (user_id == Meteor.userId())
        return ''
      else 
        return 'disabled'
   }
})
