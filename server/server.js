/**
@author https://github.com/diego2013

*/


//Copmile SSR templates
SSR.compileTemplate( 'htmlEmailFeedback', Assets.getText( 'feedbackemail.html' ) );

/* Finds the emails of the users who have a given role. 
Roles are http://alanning.github.io/meteor-roles/classes/Roles.html
So by http://alanning.github.io/meteor-roles/classes/Roles.html#method_getUsersInRole
@param role Array | String
Name of role/permission. If array, users returned will have at least one of the roles specified but need not have all roles.
@returns list of emails. If a user has more than one email we return the first one found
*/
findEmailsByRole = function(role){
  		var users = Roles.getUsersInRole(role).fetch();
  		var emaillist = [];
  		for (var i =0; i<users.length; i++){
  			if(users[i].emails){
  				emaillist.push(users[i].emails[0].address);
  			}
  		}
  		return emaillist;
  	}