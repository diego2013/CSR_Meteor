/**
@author https://github.com/diego2013

*/

Meteor.methods({

/* Send an email to all users who are administrators to notify of a new feedback submission
*/
	sendEmailFeedbackSubmitted: function (feedbackDto) {
    var to = findEmailsByRole('admin');
    check(to, Match.OneOf(String, [String]));

    var subject = "New feedback submitted with ID "+feedbackDto._id;
    var emailData = {
      link: "https://csr.openice.info/feedbackReviewList/"+feedbackDto._id,
      rateSite: feedbackDto.rateSite,
      rateNavigation: feedbackDto.rateNavigation,
      rateOrganization: feedbackDto.rateOrganization,
      rateLogin: feedbackDto.rateLogin,
      rateClarity: feedbackDto.rateClarity,
      rateSections: feedbackDto.rateSections,
      rateUsefulness:feedbackDto.rateUsefulness,
      rateAppearance: feedbackDto.rateAppearance,
      visualDesign: feedbackDto.visualDesign,
      rateGeneral: feedbackDto.rateGeneral
    };

    // check([to, from, subject, text], [String]);

	  // Let other method calls from the same client start running,
	  // without waiting for the email sending to complete.
	  this.unblock();

	  Email.send({
	    to: to,
	    subject: subject,
	    // text: text
      html : SSR.render( 'htmlEmailFeedback', emailData )
	  });
	}


/* Send an email with Meteor's Email package accoriding to http://docs.meteor.com/#/full/email_send
*/
	, sendEmail: function (to, from, subject, text) {
    check([to, from, subject, text], [String]);

    // Let other method calls from the same client start running,
    // without waiting for the email sending to complete.
    this.unblock();

    Email.send({
      to: to,
      from: from,
      subject: subject,
      text: text
    });
  }

});

