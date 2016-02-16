Template.userPreferencesStats.events({
	"click #savepreferences" : function(event, template){
		//create JSON object to store in the user's profile JSON object
		user_preferences = {}
		user_preferences.show_context_help = $('#showcontexthelp:checked').val() === 'on'

		//call saveUserProfile with the preferences
		affectedRows = Meteor.call('updateUserProfilePreferences', user_preferences);

	}
})