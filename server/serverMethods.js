/**
@author https://github.com/diego2013

*/

Meteor.methods({

	  sendEmailFeedbackSubmitted: function (to, from, subject, text) {
	  	console.log('calling sendEmailFeedbackSubmitted ...')
    	check([to, from, subject, text], [String]);

	    // Let other method calls from the same client start running,
	    // without waiting for the email sending to complete.
	    this.unblock();

		console.log('sending email')

	    Email.send({
	      to: to,
	      from: from,
	      subject: subject,
	      text: text
	    });
	  }

	  ,sendEmail: function (text) {
	  	
	    check([text], [String]);
	    this.unblock();

	    Email.send({
		  to: "alonsogarciadiego@gmail.com",
		  from: "from.address@email.com",
		  subject: "Example Email",
	      text: text
	    });
  }

});