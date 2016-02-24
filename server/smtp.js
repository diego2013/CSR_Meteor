  Meteor.startup(function () {

  // 	smtp = {
  //   username: 'your_username',   // eg: server@gentlenode.com
  //   password: 'your_password',   // eg: 3eeP1gtizk5eziohfervU
  //   server:   'smtp.gmail.com',  // eg: mail.gandi.net
  //   port: 25
  // }
  //  process.env.MAIL_URL = 'smtp://' + encodeURIComponent(smtp.username) + ':' + encodeURIComponent(smtp.password) + '@' + encodeURIComponent(smtp.server) + ':' + smtp.port;


    process.env.MAIL_URL="smtp://md.pnp.team%40gmail.com:mdpnpCSR@smtp.gmail.com:465/"; 
    //XXX check this SO Answer in order to know how to allow the less secure applications and allow access to a GMAIL account.
    // http://stackoverflow.com/a/31875371/3961519
    //XXX Also, probably the pwd should not be here in plain text
    //use an environment variable to set process.env.MAIL_URL to keep passwords out of source control.


  //Send verification email on user account creation
  // Format the email
  //-- Application name
  Accounts.emailTemplates.siteName = 'Clinical Scenario Repository';

  //-- Subject line of the email.
  Accounts.emailTemplates.verifyEmail.subject = function(user) {
    return "Confirm Your Email Address for the MD PnP's Clinical Scenario Repository";
  };

  //-- Email text
  Accounts.emailTemplates.verifyEmail.text = function(user, url) {
    var text = "Dear " +user.username +",\r\n\n"
        + 'Thank you for registering with the Clinical Scenario Repository.\r\n'
        + 'Please click on the following link to verify your email address: \r\n' 
        + url
        + "\r\n \n This email contains the username you used to register, so you can be sure it came from a trusted source."
    return text;
  };

  // 3.  Send email when account is created
  Accounts.config({
    sendVerificationEmail: true
    // ,forbidClientAccountCreation : false
  });
//XXX see also http://stackoverflow.com/q/14616524/3961519

  });