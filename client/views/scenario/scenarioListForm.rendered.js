/** @author https://github.com/diego2013
*/

Template.scenarioListTable.rendered = function(){
  //https://github.com/diego2013/CSR_Meteor/issues/47
  //console.log('scenarioListTable has been rendered');
  if(Number(Session.get('scenarioCursorStart')) < Number(Session.get('scenarioResultsPerPage'))){
    $("#previousButton").addClass('previous disabled');
  }else {
    $("#previousButton").removeClass('disabled');
  } 

  var routeName = Router.current().route.getName();
  total = scenarioTotalCount(routeName);
  if(Number(Session.get('scenarioCursorStart'))+ Number(Session.get('scenarioResultsPerPage')) > Number(total)){
    $("#nextButton").addClass('next disabled');
  }else {
    $("#nextButton").removeClass('disabled');
  }
};
