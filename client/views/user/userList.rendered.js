/** @author https://github.com/diego2013
*/

Template.userList.rendered = function(){
  if(Number(Session.get('userListCursorStart')) < Number(Session.get('userListResultsPerPage'))){
    $("#previousButton").addClass('previous disabled');
  }else {
    $("#previousButton").removeClass('disabled');
  } 

  total = Counts.get('usersListCounter');
  if(Number(Session.get('userListCursorStart'))+ Number(Session.get('userListResultsPerPage')) > Number(total)){
    $("#nextButton").addClass('next disabled');
  }else {
    $("#nextButton").removeClass('disabled');
  }
};