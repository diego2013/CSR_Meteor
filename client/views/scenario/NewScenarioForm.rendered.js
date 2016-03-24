/** @author https://github.com/diego2013

NewScenarioForm.rendered.js

*/

/*
On rendering the scenarioFormAdvancedInfo (New Scenario Form step 2 template)
1- activate the flashing for the red arrow.
2- Cleanup of any "editing entries" on different tabs
	2.1 Hazards
	2.2 Equipment entries
	2.3 References
*/
Template.scenarioFormAdvancedInfo.rendered = function(){
	flashingRedArrow(false);
	
	cleanupEditingHazards();
	cleanupEditingEquipments();
	cleanupEditingReferences();
};
