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

// EMAIL CUSTOMIZATION
//  Options to customize emails sent from the Accounts system.
//  http://docs.meteor.com/#/full/accounts_emailtemplates

  //-- Application name
  Accounts.emailTemplates.siteName = 'Clinical Scenario Repository';
  Accounts.emailTemplates.from = 'md.pnp.team@gmail.com';

  //verification email on user account creation
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

   //reset password email customization
  //-- Subject line of the email.
  Accounts.emailTemplates.resetPassword.subject = function(user) {
    return "Request to reset password on MD PnP's Clinical Scenario Repository";
  };

  //body of the email
  Accounts.emailTemplates.resetPassword.text = function(user, url) {
    var text = "Dear " +user.username +",\r\n\n"
        + 'We received a request to reset your password on the Clinical Scenario Repository.\r\n'
        + 'To reset your password, simply click the link below: \r\n' 
        + url
        + "\r\n \n Thanks."
    return text;
  };



  //Send verification email when account is created
  Accounts.config({
    sendVerificationEmail: true
    // ,forbidClientAccountCreation : false
  });
//XXX see also http://stackoverflow.com/q/14616524/3961519

  });