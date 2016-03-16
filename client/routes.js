/** @author https://github.com/diego2013

Uses Iron:router https://github.com/iron-meteor/iron-router
*/

//ROUTES
//====================================================================

  //global Router option to use a default layout template for all routes 
  Router.configure({
    layoutTemplate: 'complexLayout',
    loadingTemplate: "Loading",
    notFoundTemplate: "NotFound",
  //  yieldTemplates: {
  //      'FooterTemplate': {to: 'footer'}
  //    }
  });

  //map routes with templates
  Router.map(function(){
    //this.route('home', {path: '/'});
   this.route('/', function(){ //This approach seems to be working better that this.route('home', {path: '/'});
     this.render('home');
     //this.render('FooterTemplate', {to: 'footer'});
     //Router.go('home');
   });
   this.route('home');

   //***** Footer *****
   this.route('disclaimer');
   this.route('privacyStatement');
   this.route('aboutUs');
   this.route('help');

   //***** Scenario Examples  *****
   // this.route('exampleScenario_step1');
   this.route('exampleScenario_step1', function(){
      this.layout('examplesTemplate');
      this.render("exampleScenarioStep1", {to: "main"});
   });
   this.route('exampleScenario_step3', function(){
      this.layout('examplesTemplate');
      this.render("exampleScenarioStep3", {to: "main"});
   });


  
   
   this.route('createNewScenario', function(){
      Session.set(_SCENARIO_FORM_STEP, _SCENARIO_FORM_STEP_BASIC_INFO);
      cleanNewScenarioForm();
      currentScenarioDTO = Session.get("currentScenarioDTO"); 
      hideScenarioFormButtons();
      Router.go('/newScenarioForm');

   });

   this.route('newScenarioForm' , 
     function ()  {
       if(!Meteor.userId()){
        window.alert('Please, log in or register to create (even save) a new clinical scenario.');
       }
       currentScenarioDTO = Session.get("currentScenarioDTO"); 
       if(Session.get(_SCENARIO_FORM_STEP)==undefined){//could happen with reload
          Session.set(_SCENARIO_FORM_STEP, _SCENARIO_FORM_STEP_BASIC_INFO);
       }
       this.render('NewScenarioForm', {
         data : currentScenarioDTO,
         yieldTemplates: {
           'scenarioFormBasicInfo': {to: 'newScenarioStep'}
         }          
       });
       //this.render('FooterTemplate', {to: 'footer'});
       hideScenarioFormButtons();
     }
   );

    //Find scenarios using the URL
    this.route('/NewScenarioForm/:_id', function () {
      currentScenarioDTO = ScenariosAll.findOne({_id: this.params._id.trim()});
      //check if is a valid scenario or user has permission to see it
/* IMPROVEMENT. Allows to show scenarios that have been approved
      if(currentScenarioDTO===undefined){
        Session.set('auxScenarioID', this.params._id);
        this.render('/findByIDErrorTemplate');
      }else if(currentScenarioDTO.owner != Meteor.userId()){
        if(currentScenarioDTO.status == scenarioStatusEnum.APPROVED){
            this.render('NewScenarioForm', {data: currentScenarioDTO});
            Session.set("currentScenarioDTO", currentScenarioDTO);
        }else{
            Session.set('auxScenarioID', this.params._id);
            this.render('/findByIDErrorTemplate');
        }
      }else{
            this.render('NewScenarioForm', {data: currentScenarioDTO});
            Session.set("currentScenarioDTO", currentScenarioDTO);
      }
*/
      if(currentScenarioDTO===undefined || currentScenarioDTO.owner != Meteor.userId()){
        Session.set('auxScenarioID', this.params._id);
        this.render('/findByIDErrorTemplate');
      }else{
        this.render('NewScenarioForm', {data: currentScenarioDTO});
        //this.render('FooterTemplate', {to: 'footer'});
        Session.set("currentScenarioDTO", currentScenarioDTO); //Issue #3
      }     
    });

    this.route('new', function(){
      //  this.render('NewScenarioForm');
      Session.set(_SCENARIO_FORM_STEP, _SCENARIO_FORM_STEP_BASIC_INFO);
      cleanNewScenarioForm();
      currentScenarioDTO = Session.get("currentScenarioDTO"); 
      hideScenarioFormButtons();
      Router.go('/newScenarioForm');
    });

    //Template for when we are about to submit a scenario for approval
    this.route('scenarioFormSubmitConfirmation',  function () {
        currentScenarioDTO = Session.get("currentScenarioDTO"); 
        if(currentScenarioDTO == undefined || ! Meteor.userId()){
          //Router.go('/NotFound');
          this.render('NotFound');
        }else if (currentScenarioDTO.owner == Meteor.userId() && currentScenarioDTO.status == scenarioStatusEnum.UNSUBMITTED){
          this.render('scenarioFormSubmitConfirmation', { data : currentScenarioDTO } );
        }else{
          this.render('NotFound');
        }
    });


  //Template to confirm submission of scenario
    this.route('scenarioFormThankYou',  function () {
       currentScenarioDTO = Session.get("currentScenarioDTO"); 
       if(currentScenarioDTO==undefined || !Meteor.userId()){
          this.render('NotFound');
       } else if(currentScenarioDTO.owner == Meteor.userId() && currentScenarioDTO.status == scenarioStatusEnum.SUBMITTED)
          this.render('scenarioFormThankYou', { data : currentScenarioDTO } );
      else{
          this.render('NotFound');
      }
    });

    //Template displaying all the info of a scenario
    // Issue #49. We do this to review scenarios -> need admin priviledges
    // or to see approved scenarios
    // We also need to protect the scenario from being displayed directly with the url
    this.route('/scenarioComplete/:_id', function(){
      currentScenarioDTO = ScenariosAll.findOne({_id: this.params._id.trim()});
      if(currentScenarioDTO==undefined ){
        Session.set('auxScenarioID', this.params._id);
        this.render('/findByIDErrorTemplate');
      }else if(currentScenarioDTO.owner == Meteor.userId()){//scenario belongs to user
        this.render('scenarioCompleteForm', {data: currentScenarioDTO});
        Session.set("currentScenarioDTO", currentScenarioDTO);
      }else if(!Roles.userIsInRole(Meteor.user(), ['admin']) && currentScenarioDTO.status != scenarioStatusEnum.APPROVED){
        // a non-admin trying to reach a non-approved scenario
        Session.set('auxScenarioID', this.params._id);
        this.render('/findByIDErrorTemplate');
      }else{//rest of cases
        this.render('scenarioCompleteForm', {data: currentScenarioDTO});
        Session.set("currentScenarioDTO", currentScenarioDTO); //Issue #3 
      }
    });


   this.route('scenarioList' , function(){
     var obj = Session.get('scenarioCursorOrder');
     var objSort = {};//object to sort the cursor
     objSort[obj.param]= obj.order;
     Session.set('scenarioCursorStart', 0);
    
     // this.render('scenarioListTable', {data : { scenarios : MyScenarios.find({}, {sort: objSort}) }} );
     if(Meteor.user()){
        this.render('scenarioListTable', 
          {data : { scenarios : MyScenarios.find({}, {limit: Number(Session.get('scenarioResultsPerPage')), sort: objSort}) }} ); //issue #75 
     }else{
        this.render('home');//issue #101  
     }
     
   });
   this.route('approvedScenarioList' , function(){
     var obj = Session.get('scenarioCursorOrder');
     var objSort = {};//object to sort the cursor
     objSort[obj.param]= obj.order;
     Session.set('scenarioCursorStart', 0);
     this.render('scenarioListTable', 
      {data : { scenarios : scenariosAllApproved.find({}, {limit: Number(Session.get('scenarioResultsPerPage')), sort: objSort}) }} );
     //Issue #75 add limit to this query
   });
   this.route('recentSubmissionsScenarioList' , function(){
     var obj = Session.get('scenarioCursorOrder');
     var objSort = {};//object to sort the cursor
     objSort[obj.param]= obj.order;
     Session.set('scenarioCursorStart', 0);
     if(!Roles.userIsInRole(Meteor.user(), ['admin'])){
        this.redirect('/');
     }else{
        this.render('scenarioListTable', 
          {data : { scenarios : scenariosAllSubmitted.find({}, {limit: Number(Session.get('scenarioResultsPerPage')), sort: objSort}) }});
        //Issue #75 add limit to this query
     }
   });


   this.route('usersList', function(){
      if(Meteor.loggingIn()){//if login method is currently in progress
        this.render(this.loadingTemplate);
      }else if(!Roles.userIsInRole(Meteor.user(), ['admin'])){
        this.redirect('/');
      }else{
        var obj = Session.get('userListOrder');
        var objSort = {};//object to sort the cursor
        objSort[obj.param]= obj.order;

        this.render('userList', {data: {usuarios : AllTheUsers.find( {}, {limit: Number(Session.get('userListResultsPerPage')), sort: objSort} ) }});
        //Issue #75 add limit to this query
      }
   });


  this.route('findByIDTemplate');
  this.route('/findByIDTemplate/:_id', function () {
      findByID(this.params._id);
  });
  this.route('findByIDErrorTemplate');

  this.route('userList');

  this.route('userProfile' //, {data :function () { return userDTO.findOne({_id: this.userId} ) }}
       //,{data :function () { return Meteor.user()}} //working code
       // , { data: function(){return Meteor.users.findOne()} } //working code 
       ,{data : function(){ return AllTheUsers.findOne({_id: Meteor.userId()}) }}
      //,{data : function(){ return Meteor.users.findOne() }}//working code
  );

  this.route('/userProfile/:_id', function(){
      targetUser = AllTheUsers.findOne({_id: this.params._id.trim()});
      if(targetUser==undefined || !Roles.userIsInRole(Meteor.user(), ['admin'])){
        this.redirect('/');
      }else{
        this.render('userProfile', {data: targetUser});
      }
  });
    
  this.route('FeedbackForm'); //feedback form
  this.route('FeedbackFormThakYou'); //"thank you" page after submitting feedback
  this.route('feedbackReviewList' , function(){
    var obj = Session.get('feedbackCursorOrder');
    var objSort = {};//object to sort the cursor
    objSort[obj.param]= obj.order;
    Session.set('feedbackCursorStart', 0);
    // Session.set('feedbackReportsStatus', FEEDBACK_REPORT_STATUS.ALL);

    this.render('feedbackListTable', 
      {data : {  feedbackCol : feedbackCol.find({}, {limit : Number(Session.get('feedbackResultsPerPage')), sort: objSort}) }} );
      //Issue #75 add limit to this query
  });

  this.route('/feedbackReview/:_id', function(){
    if(!Roles.userIsInRole(Meteor.user(), ['admin'])){
      this.redirect('/');
    }else{
      //var fback =  feedbackCol.find({_id: this.params._id});
      var fback = feedbackCol.findOne({_id: this.params._id});
      if(fback)
        this.render('feedbackReview', {data : fback /*feedbackCol.findOne({_id: this.params._id})*/ });
      else
        this.redirect('/');
    }
  });


  });//end of function for Router.map