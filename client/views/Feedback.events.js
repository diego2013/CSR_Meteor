/** @author https://github.com/diego2013
*/

Template.FeedbackForm.events({

  //detect a submit event in the form FeedbackForm
  "submit #feedbackPanel": function(event) {

    event.preventDefault(); // Prevent default form submit
    //validation
    if(trimInput(event.target.rateSite.value)===""){
      window.alert("Fields marked with an asterisk are mandatory");
        throw new Meteor.Error("'rateSite' can NOT be empty"); //TO-DO do something with this error
    }

    var submitAnonymously = (event.target.submitAnonymously) ? event.target.submitAnonymously.checked : true;
    var feedbackDto = {
      rateSite :         trimInput(event.target.rateSite.value),
      rateNavigation :   trimInput(event.target.rateNavigation.value),
      rateOrganization : trimInput(event.target.rateOrganization.value),
      rateLogin :        trimInput(event.target.rateLogin.value),
      rateClarity :      trimInput(event.target.rateClarity.value),

      rateSections :     trimInput(event.target.rateSections.value),
      rateUsefulness :   trimInput(event.target.rateUsefulness.value),
      rateAppearance :   trimInput(event.target.rateAppearance.value),
      rateGeneral :      trimInput(event.target.rateGeneral.value),
      visualDesign :     event.target.visualDesign.value,

      username : Meteor.userId() && !submitAnonymously ? Meteor.user().username : "anonymous",
      userID :   Meteor.userId() && !submitAnonymously ? Meteor.userId() : "anonymous",

      //auditing fields
      createdAt : new Date(),
      reviewed  : 'Pending',
      reviewer  : undefined,
      reviewedAt: undefined
    }

    Meteor.call("saveFeedback", feedbackDto, function(err, callbackFeedbackDto){
            if (err){  
              console.log(err);
            }/*else{
              feedbackDto = callbackFeedbackDto;
              // Meteor.call('sendEmailFeedbackSubmitted',callbackFeedbackDto);
            }*/
      });
    
    Router.go("/FeedbackFormThakYou") //redirect user to "Thank you page"

  }
});

Template.feedbackReport.events({
  "click #seeFeedbackReport" : function(){
    Router.go("/feedbackReview/"+this._id);
  }
});

Template.feedbackReview.events({
  "click #markAsPending" : function(){
    var feedbackDto = feedbackCol.findOne({_id: this._id});
    if(feedbackDto){
      feedbackDto.reviewer = undefined;
      feedbackDto.reviewed = "Pending";
      feedbackDto.reviewedAt = undefined;
      Meteor.call('saveFeedback', feedbackDto);
      Router.go("/feedbackReview/"+this._id);
    }    
  }
  , "click #markAsReviewed" : function(){
    var feedbackDto = feedbackCol.findOne({_id: this._id});
    if(feedbackDto){
      feedbackDto.reviewer = Meteor.user().username;
      feedbackDto.reviewed = "Reviewed";
      feedbackDto.reviewedAt = new Date();
      Meteor.call('saveFeedback', feedbackDto);
      Router.go("/feedbackReview/"+this._id);
    }
  }
});

Template.feedbackListTable.events({
"click .previous" : function(){
  //make sure we have a minimum
  //if ((x - y)>0) x = x-y;
  if(Number(Session.get('feedbackCursorStart'))  > Number(Session.get('feedbackResultsPerPage')-1)){
    Session.set('feedbackCursorStart', Number(Session.get('feedbackCursorStart'))-Number(Session.get('feedbackResultsPerPage')));
  }
}
,"click .next" : function(){
  //XXX check that this is not going "out of range"
  if(Number(Session.get('feedbackCursorStart')) + Number(Session.get('feedbackResultsPerPage')) < Counts.get('feedbackCounter'))
   Session.set('feedbackCursorStart', Number(Session.get('feedbackCursorStart'))+Number(Session.get('feedbackResultsPerPage')));
}
, "change #resultsPerPage" : function(event){
  var newValue = $(event.target).val();
  Session.set('feedbackCursorStart', 0);
  Session.set('feedbackResultsPerPage', newValue);
}
,"click #cabecera" :function(event){
    var name = event.target.getAttribute("data-name");
    var obj = Session.get('feedbackCursorOrder'); 
    if(obj && name){
       obj['param'] = name;
       obj['order'] *=  -1;
    }else{
       obj = {};
       obj['param'] = obj['param'] ? name : "createdAt"; // "createdAt" will be "default" val
       obj['order'] =  1;
    }
    Session.set( 'feedbackCursorOrder', obj );
}
});