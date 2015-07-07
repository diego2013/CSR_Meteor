/** @author https://github.com/diego2013
*/

Template.userList.helpers({
    totalCount : function(){
      return Counts.get('usersListCounter');
    }
    ,paginationCaption : function(){
      total = Counts.get('usersListCounter');
      minVal = Math.min(Number(Session.get('userListCursorStart'))+Number(Session.get('userListResultsPerPage')), total);
      return 'Showing results '+Number(Session.get('userListCursorStart')+1) + " to "+minVal+".";
    }
    ,nextText : function(){
      total = Counts.get('usersListCounter');
      minVal = Math.min(Number(Session.get('userListCursorStart')+ 2*Session.get('userListResultsPerPage')), total);
      if(Number(Session.get('userListCursorStart'))+ Number(Session.get('userListResultsPerPage')) > Number(total)){
        $(".next").addClass('disabled');
        return ''
      }
      else {
        $(".next").removeClass('disabled');
        return (Number(Session.get('userListCursorStart'))+Number(Session.get('userListResultsPerPage'))+1) + " - " + minVal;  
      }
    }
    ,prevText : function(){
      if(Number(Session.get('userListCursorStart')) < Number(Session.get('userListResultsPerPage'))){
        $("#previousButton").addClass('disabled');
        return '';
      }
      else {
        $("#previousButton").removeClass('disabled');
        return (Number(Session.get('userListCursorStart'))-Number(Session.get('userListResultsPerPage'))+1) + " - " +Number(Session.get('userListCursorStart'));
      }        
    }
    ,selectResultPerPage : function(value){
      current = Session.get('userListResultsPerPage');
      if(current)
        return current == value? {selected:'selected'}: '';
      else
        return '';
    }
 });

 