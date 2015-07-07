/** @author https://github.com/diego2013
*/

Template.userList.events({
"click .previous" : function(){
  //make sure we have a minimum
  //if ((x - y)>0) x = x-y;
  if(Number(Session.get('userListCursorStart'))  > Number(Session.get('userListResultsPerPage')-1)){
    Session.set('userListCursorStart', Number(Session.get('userListCursorStart'))-Number(Session.get('userListResultsPerPage')));
  }
}
,"click .next" : function(){
  //XXX check that this is not going "out of range"
  if(Number(Session.get('userListCursorStart')) + Number(Session.get('userListResultsPerPage')) < Counts.get('usersListCounter'))
   Session.set('userListCursorStart', Number(Session.get('userListCursorStart'))+Number(Session.get('userListResultsPerPage')));
}
, "change #resultsPerPage" : function(event){
  var newValue = $(event.target).val();
  Session.set('userListCursorStart', 0);
  Session.set('userListResultsPerPage', newValue);
}
,"click #cabecera" : function(event){
   var obj = Session.get('userListOrder'); 
   var name = event.target.getAttribute("name");
   if(obj && name){
      obj['param'] = name;
      obj['order'] *=  -1;
   }else{
      obj = {};
      obj['param'] = obj['param'] ? name : "username"; // "username" will be "default" val
      obj['order'] =  1;
   }
   Session.set( 'userListOrder', obj );
}
});

/** User profile template
*/ 
Template.userProf.events({
  "click #seeUser" : function(event){
    event.preventDefault();
    Router.go('/userProfile/'+event.target.name);
  }

});