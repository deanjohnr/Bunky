var app = angular.module('roommi', ['ui.router','ui.bootstrap','uiGmapgoogle-maps'])

.run(function($rootScope){

    Parse.initialize("SereYcSxK4s7g7NYlAV8cpDFp3UvjvCVfFXCFt6p", "wQ362WdIfThd2wmrzIiRQ65Na9pMcWKiJu01jOi2");

    window.fbAsyncInit = function() {
      Parse.FacebookUtils.init({ // this line replaces FB.init({
        appId      : '600805203353143', // Facebook App ID
        status     : true,  // check Facebook Login status
        cookie     : true,  // enable cookies to allow Parse to access the session
        xfbml      : true,  // initialize Facebook social plugins on the page
        version    : 'v2.2' // point to the latest Facebook Graph API version
      });
      // Run code after the Facebook SDK is loaded.

      $scope.login = function () {
        Parse.FacebookUtils.logIn("public_profile,email,user_likes,user_friends,user_about_me,user_birthday,user_education_history,user_hometown,user_photos,user_work_history", {
          success: function(user) {
            if (!user.existed()) {
              alert("User signed up and logged in through Facebook!");
            } else {
              alert("User logged in through Facebook!");
            }
          },
          error: function(user, error) {
            alert("User cancelled the Facebook login or did not fully authorize.");
          }
        });
      }

      $scope.logout = function () {
        Parse.FacebookUtils.logIn("public_profile,email,user_likes,user_friends,user_about_me,user_birthday,user_education_history,user_hometown,user_photos,user_work_history", {
          success: function(user) {
            if (!user.existed()) {
              alert("User signed up and logged in through Facebook!");
            } else {
              alert("User logged in through Facebook!");
            }
          },
          error: function(user, error) {
            alert("User cancelled the Facebook login or did not fully authorize.");
          }
        });
      }
    }

  (function(d, s, id){
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {return;}
      js = d.createElement(s); js.id = id;
      js.src = "//connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    $rootScope.currentUser = Parse.User.current();
    console.log($rootScope.currentUser);

    // $rootScope
    //     .$on('$stateChangeStart', 
    //         function(event, toState, toParams, fromState, fromParams){ 
    //             console.log("State Change: transition begins!");
    //     });

    $rootScope
        .$on('$stateChangeSuccess',
            function(event, toState, toParams, fromState, fromParams){ 
                console.log("State Change: State change success!");
        });

    $rootScope
        .$on('$stateChangeError',
            function(event, toState, toParams, fromState, fromParams){ 
                console.log("State Change: Error!");
        });

    // $rootScope.$on('$stateChangeStart',function(event, toState, toParams, fromState, fromParams){
    //   console.log('$stateChangeStart to '+toState.to+'- fired when the transition begins. toState,toParams : \n',toState, toParams);
    // });
    // $rootScope.$on('$stateChangeError',function(event, toState, toParams, fromState, fromParams){
    //   console.log('$stateChangeError - fired when an error occurs during transition.');
    //   console.log(arguments);
    // });
    // $rootScope.$on('$stateChangeSuccess',function(event, toState, toParams, fromState, fromParams){
    //   console.log('$stateChangeSuccess to '+toState.name+'- fired once the state transition is complete.');
    // });
    // $rootScope.$on('$viewContentLoading',function(event, viewConfig){
    //   // runs on individual scopes, so putting it in "run" doesn't work.
    //   console.log('$viewContentLoading - view begins loading - dom not rendered',viewConfig);
    // });
    // $rootScope.$on('$viewContentLoaded',function(event){
    //   console.log('$viewContentLoaded - fired after dom rendered',event);
    // });
    // $rootScope.$on('$stateNotFound',function(event, unfoundState, fromState, fromParams){
    //   console.log('$stateNotFound '+unfoundState.to+'  - fired when a state cannot be found by its name.');
    //   console.log(unfoundState, fromState, fromParams);
    // });

  }

  [          '$rootScope', '$state', '$stateParams',
    function ($rootScope,   $state,   $stateParams) {

    // It's very handy to add references to $state and $stateParams to the $rootScope
    // so that you can access them from any scope within your applications.For example,
    // <li ng-class="{ active: $state.includes('contacts.list') }"> will set the <li>
    // to active whenever 'contacts.list' or one of its decendents is active.
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    }
  ]
)

// .run(
//   [          '$rootScope', '$state', '$stateParams',
//     function ($rootScope,   $state,   $stateParams) {

//     // It's very handy to add references to $state and $stateParams to the $rootScope
//     // so that you can access them from any scope within your applications.For example,
//     // <li ng-class="{ active: $state.includes('contacts.list') }"> will set the <li>
//     // to active whenever 'contacts.list' or one of its decendents is active.
//     $rootScope.$state = $state;
//     $rootScope.$stateParams = $stateParams;
//     }
//   ]
// )



.config(
  [          '$stateProvider', '$urlRouterProvider',
    function ($stateProvider,   $urlRouterProvider) {
      $urlRouterProvider
        // .when('/list/{listingId:[]{}}','/list/{listingId:[]{}}/review')
        .otherwise('/');

      $stateProvider

        // INDEX
        .state('home', {
          url: "/",
          templateUrl: 'app/partials/home.html'
        })

        // Search
        .state('search', {
          url: '/search',
          templateUrl: 'app/partials/apartment-search.html'
        })

        // Listing Board
        .state('list', {
          url: '/list',
          templateUrl: 'app/partials/listing-board.html'
        })

        // Listing Manager Shell
        .state('list.newlisting', {
          url: '/addlisting',
          templateUrl: 'app/partials/listing-edit.html'
        })

        // Listing Manager Shell
        .state('list.listing', {
          abstract: true,
          url: '/{listingId:[]{}}',
          templateUrl: 'app/partials/listing-management.html'
        })

        // Listing Manager Shell
        .state('list.listing.review', {
          url: '/review',
          views: {
            apptabs: {
              templateUrl: 'app/partials/listing-review.html',
              // controller: 'AppsReviewCtrl'
            },
            chat: {
              templateUrl: 'app/partials/chat.html',
              // controller: 'ChatCtrl'
            }
          }
        })

        // Search Side Profile View
        .state('search.listing', {
          url: '/{listingId:[]{}}',
          views: {
            searchside: {
              templateUrl: 'app/partials/search-side-profile.html',
              // controller: 'AppsReviewCtrl'
            },
          }
        })
    }
  ]
)

.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyCCMEJsPzyGW-oLOShTOJw_Pe9Qv2YMAZo',
        v: '3.17',
        libraries: 'weather,geometry,visualization'
    });
  }



)

.controller("MainCtrl", function($scope, uiGmapGoogleMapApi) {
    // Do stuff with your $scope.
    // Note: Some of the directives require at least something to be defined originally!
    // e.g. $scope.markers = []
    $scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };
    // uiGmapGoogleMapApi is a promise.
    // The "then" callback function provides the google.maps object.
    uiGmapGoogleMapApi.then(function(maps) {

    });

    // FACEBOOK STUFF
    $scope.facebookCtrl = {
      fbAuthData : {},
      response : {}
    };

    // if(Parse.User.current()) {
    //   $scope.facebookCtrl.fbAuthData = Parse.User.current().get('authData');
    // };

    // $scope.fbConnect = function() {

      // NB: this is a contrived example for demo purposes, you would never write the following code in a real app

    // normally you would define a User.js data module for all your user objects and the method below would be on the user, e.g. $rootScope.currentUser.fbConnect() 

    //   Parse.FacebookUtils.logIn("user_likes", {}).then(function(user) {
    //     alert('facebook connected!');

    //     $scope.facebookCtrl.fbAuthData = user.get('authData');

    //   }, function(error) {

    //     alert('something went wrong, try again');

    //     $scope.facebookCtrl.fbAuthData = error;
        
    //   });

    // }



});