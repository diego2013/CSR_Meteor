/** @author https://github.com/diego2013
*/

 Template.findByIDErrorTemplate.helpers({
    scenarioID : function(){
      return Session.get('auxScenarioID');
    }
 });