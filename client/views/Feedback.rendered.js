/** @author https://github.com/diego2013
*/

Template.feedbackListTable.rendered = function(){
  //console.log("rendered feedbackListTable")
  if(Number(Session.get('feedbackCursorStart')) < Number(Session.get('feedbackResultsPerPage'))){
    $("#previousButton").addClass('previous disabled');
  }else {
    $("#previousButton").removeClass('disabled');
  } 

  var filter = Session.get('feedbackReportsStatus')
  var total = 0
  if(filter == FEEDBACK_REPORT_STATUS.REVIEWED)
        total = Counts.get('feedbackCounterReviewed')
  else if (filter == FEEDBACK_REPORT_STATUS.PENDING)
        total = Counts.get('feedbackCounterPending')
  else 
        total = Counts.get('feedbackCounter')

  if(Number(Session.get('feedbackCursorStart'))+ Number(Session.get('feedbackResultsPerPage')) > Number(total)){
    $("#nextButton").addClass('next disabled');
  }else {
    $("#nextButton").removeClass('disabled');
  }
};