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
        return Meteor.user().emails[0].veified;
      else
        return 'not applicable';
    }
 });
