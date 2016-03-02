/** @author https://github.com/diego2013
*/

Template.feedbackListTable.helpers({
    paginationCaption : function(){
      var filter = Session.get('feedbackReportsStatus')
      var total = getReportCountByStatus(filter);

      minVal = Math.min(Number(Session.get('feedbackCursorStart'))+Number(Session.get('feedbackResultsPerPage')), total);
      return 'Showing results '+Number(Session.get('feedbackCursorStart')+1) + " to "+minVal+".";
    }
    ,totalCount : function(){
      var filter = Session.get('feedbackReportsStatus');
      return getReportCountByStatus(filter);
    }
    ,nextText : function(){
      var filter = Session.get('feedbackReportsStatus')
      var total = getReportCountByStatus(filter);

      minVal = Math.min(Number(Session.get('feedbackCursorStart')+ 2*Session.get('feedbackResultsPerPage')), total);
      if(Number(Session.get('feedbackCursorStart'))+ Number(Session.get('feedbackResultsPerPage')) > Number(total)){
        $(".next").addClass('disabled');
        return ''
      }
      else {
        $(".next").removeClass('disabled');
        return (Number(Session.get('feedbackCursorStart'))+Number(Session.get('feedbackResultsPerPage'))+1) + " - " + minVal;  
      }
      //return Number(Session.get('feedbackCursorStart')+Session.get('feedbackResultsPerPage')+1) + " - " + Number(Session.get('feedbackCursorStart')+(2*Session.get('feedbackResultsPerPage')));  
        
    }
    ,prevText : function(){
      if(Number(Session.get('feedbackCursorStart')) < Number(Session.get('feedbackResultsPerPage'))){
        $("#previousButton").addClass('disabled');
        return '';
      }
      else {
        $("#previousButton").removeClass('disabled');
        return (Number(Session.get('feedbackCursorStart'))-Number(Session.get('feedbackResultsPerPage'))+1) + " - " +Number(Session.get('feedbackCursorStart'));
      }        
    }
    ,selectResultPerPage : function(value){
      current = Session.get('feedbackResultsPerPage');
      if(current)
        return current == value? {selected:'selected'}: '';
      else
        return '';
    }

 });

  Template.feedbackReview.helpers({
  isReviewed : function(feedbackReport){
    if(feedbackReport && feedbackReport.reviewer)
      return true;
    else
      return false;
  }
 });

 Template.feedbackReport.helpers({
  completion : function(feedbackReport){
      count = 0;
      if(feedbackReport.rateSite!='') count++;
      if(feedbackReport.rateNavigation!='') count++;
      if(feedbackReport.rateOrganization!='') count++;
      if(feedbackReport.rateLogin!='') count++;

      if(feedbackReport.rateClarity!='') count++;
      if(feedbackReport.rateSections!='') count++;
      if(feedbackReport.rateUsefulness!='') count++;
      if(feedbackReport.rateAppearance!='') count++;

      if(feedbackReport.rateGeneral!='') count++;

      return count + " of 9 fields completed";
  }
 });

/** Return the total number of reports in a given state
@param filter feedback report status
*/
 getReportCountByStatus = function(filter){
  // console.log("filter "+filter)
   // return Counts.get('feedbackCounter');

      if(filter == FEEDBACK_REPORT_STATUS.REVIEWED)
        return Counts.get('feedbackCounterReviewed')
      else if (filter == FEEDBACK_REPORT_STATUS.PENDING)
        return Counts.get('feedbackCounterPending')
      else 
        return Counts.get('feedbackCounter')

 }