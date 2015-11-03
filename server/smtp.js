  Meteor.startup(function () {

  // 	smtp = {
  //   username: 'your_username',   // eg: server@gentlenode.com
  //   password: 'your_password',   // eg: 3eeP1gtizk5eziohfervU
  //   server:   'smtp.gmail.com',  // eg: mail.gandi.net
  //   port: 25
  // }
  //  process.env.MAIL_URL = 'smtp://' + encodeURIComponent(smtp.username) + ':' + encodeURIComponent(smtp.password) + '@' + encodeURIComponent(smtp.server) + ':' + smtp.port;

    // code to run on server at startup
    process.env.MAIL_URL="smtp://md.pnp.team%40gmail.com:mdpnpCSR@smtp.gmail.com:465/"; 
    //XXX check this SO Answer in order to know how to allow the less secure applications and allowe access to a GMAIL account.
    // http://stackoverflow.com/a/31875371/3961519
    //XXX Also, probably the pwd should not be here in plain text
  });