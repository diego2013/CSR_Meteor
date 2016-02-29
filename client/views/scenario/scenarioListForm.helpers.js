/** @author https://github.com/diego2013
*/

Template.scenarioListTable.helpers({
  //XXX this should take into account the current path route and use one counter or another
    totalCount : function(){
      var routeName = Router.current().route.getName();
      return total = scenarioTotalCount(routeName);
    }
    ,paginationCaption : function(event, template){
      total = scenarioTotalCount(Router.current().route.getName());
      minVal = Math.min(Number(Session.get('scenarioCursorStart'))+Number(Session.get('scenarioResultsPerPage')), total);
      return 'Showing results '+Number(Session.get('scenarioCursorStart')+1) + " to "+minVal+".";
    }
    ,nextText : function(){
      var routeName = Router.current().route.getName();
      total = scenarioTotalCount(routeName);
      minVal = Math.min(Number(Session.get('scenarioCursorStart')+ 2*Session.get('scenarioResultsPerPage')), total);
      if(Number(Session.get('scenarioCursorStart'))+ Number(Session.get('scenarioResultsPerPage')) > Number(total)){
        $("#nextButton").addClass('disabled');
        return ''
      }
      else {
        $("#nextButton").removeClass('disabled');
        return (Number(Session.get('scenarioCursorStart'))+Number(Session.get('scenarioResultsPerPage'))+1) + " - " + minVal;  
      }
    }
    ,prevText : function(){
      if(Number(Session.get('scenarioCursorStart')) < Number(Session.get('scenarioResultsPerPage'))){
        $("#previousButton").addClass('disabled');
        return '';
      }
      else {
        $("#previousButton").removeClass('disabled');
        return (Number(Session.get('scenarioCursorStart'))-Number(Session.get('scenarioResultsPerPage'))+1) + " - " +Number(Session.get('scenarioCursorStart'));
      }        
    }
    ,selectResultPerPage : function(value){
      current = Session.get('scenarioResultsPerPage');
      if(current)
        return current == value? {selected:'selected'}: '';
      else
        return '';
    }
    ,getTypeOfTableView : function(){
      var currentPath = Router.current().route.getName();
      if(currentPath == ROUTE_scenarioList)
        return myScenariosTableView_templateName
      else if (Roles.userIsInRole(Meteor.user(), ['admin']))
        return scenarioTableViewAdmin_templateName;
      else
        return scenarioTableViewPublic_templateName;
    }
    /** Returns true if the current view is "My Scenarios" 
    */
    ,isMyScenariosView : function(){
      var currentPath = Router.current().route.getName();
      return currentPath == ROUTE_scenarioList;
    }
 });


 