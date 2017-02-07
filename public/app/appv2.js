angular.module('roommi', [
	'ui.router',
  //'angularytics',
  //'ngTouch',
	//'ngAnimate', 
	'parse-angular',
	'parse-angular.enhance',

	'FacebookPatch', /* our facebook angular wrapper so we can use FB.apiAngular instead of FB.api */
	'fbook.roommi',

	'list.roommi',
	'ngAutocomplete',
  'uiGmapgoogle-maps',
  'search.roommi',
  'listing.roommi',
  'user.roommi',
	
	'ParseServices' /* this is the Parse SDK */
	
])

// hack to disable auto scrolling on hashchange because we're using ui-router to manage states, instead of the core angular router which cannot handle states
// discussion on this here: https://github.com/angular-ui/ui-router/issues/110
.value('$anchorScroll', angular.noop)

.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$anchorScrollProvider', '$provide', function($stateProvider, $urlRouterProvider, $locationProvider, $anchorScrollProvider, $provide) {

  $locationProvider
//  .html5Mode(true)
    .hashPrefix('!');

	// this is required for the root url to direct to /#/
	$urlRouterProvider
    .otherwise('/');
    
    $stateProvider
	
    // Home
    .state('home', {
      url: "/",
      templateUrl: 'app/partials/home.html',
      controller: 'FbookCtrl',
      data: {
        requireLogin: false
      }
    })

    // Craigslist
    .state('listwelcome', {
      url: "/listwelcome",
      templateUrl: 'app/partials/welcome-list.html',
      controller: 'FbookCtrl',
      data: {
        requireLogin: false
      }
    })

    // Profile
    .state('profile', {
      url: "/profile/:userId",
      templateUrl: 'app/partials/profile.html',
      controller: 'ProfileCtrl',
      data: {
        requireLogin: true
      }
    })

    // Search
    .state('search', {
      url: '/search',
      templateUrl: 'app/partials/apartment-search.html',
      controller: 'SearchCtrl',
      data: {
        requireLogin: false
      }
    })

    // Ful Listing
    .state('listing', {
      url: '/listing/:listingId',
      templateUrl: 'app/partials/listing.html',
      controller: 'ListingCtrl',
      data: {
        requireLogin: false
      }
    })

    // Search Review
    .state('appreview', {
      url: '/appreview/:userId',
      templateUrl: 'app/partials/application-management.html',
      controller: 'SearchReviewCtrl',
      data: {
        requireLogin: true
      }
    })

    // Search Review
    .state('appreview.chat', {
      url: '/:listingId',
      templateUrl: 'app/partials/searchchat.html',
      controller: 'SearchChatCtrl'
    })

    // Listing Board
    .state('list', {
      url: '/list/:userId',
      templateUrl: 'app/partials/listing-board.html',
      controller: 'ListingBoardCtrl',
      data: {
        requireLogin: true
      }
    })

    // Listing Manager Shell
    .state('list.newlisting', {
      url: '/addlisting',
      templateUrl: 'app/partials/listing-edit.html',
      controller: 'ListEditCtrl'
    })

    // Listing Manager Shell
    .state('list.editlisting', {
      url: '/edit/:listingId',
      templateUrl: 'app/partials/listing-edit.html',
      controller: 'ListEditCtrl'
    })

    // Listing Manager Shell
    .state('list.listing', {
      abstract: true,
      url: '/review',
      templateUrl: 'app/partials/listing-management.html'
    })

    // Listing Manager Shell
    .state('list.listing.review', {
      url: '/:listingId',
      templateUrl: 'app/partials/listing-review.html',
      controller: 'AppsReviewCtrl'
    })

    // Listing Manager Shell
    .state('list.listing.review.chat', {
      url: '/:hunter',
      templateUrl: 'app/partials/listchat.html',
      controller: 'ListingChatCtrl'
    })

    // Deal
    .state('deal', {
      url: "/deal",
      templateUrl: 'app/partials/deal-form.html',
      data: {
        requireLogin: false
      }
    })

    // Search Side Profile View
    .state('search.listing', {
      url: '/:listingId',
      views: {
        searchside: {
          templateUrl: 'app/partials/search-side-profile.html',
          controller: 'SideViewCtrl'
        },
      }
    })

    .state('terms', {
      url: '/terms',
      templateUrl: 'app/partials/terms.html'
    })

    .state('privacy', {
      url: '/privacy',
      templateUrl: 'app/partials/privacy.html'
    })

    .state('support', {
      url: '/support',
      templateUrl: 'app/partials/support.html'
    })

}])

.controller('MainCtrl', ['$rootScope', '$scope', '$state', '$stateParams', function($rootScope, $scope, $state, $stateParams) {

    $scope.$on('metaUpdate', function(event, metadata) {
        $scope.metadata = metadata;
    });

    $scope.isCollapsed = true;

    // $scope.$watch(function() {
    //       return $scope.metadata;
    //   }, function(newValue, oldValue) {
    //     console.log('metadata changed in $watch');
    //     if ($scope.metadata.imgw) {
    //       window.prerenderReady = true;
    //     };
        
    //   }
    // );

}])

.service('loginModal', function ($modal, $rootScope) {

  function assignCurrentUser (user) {
    $rootScope.currentUser = user;
    return user;
  }

  return function() {
    var instance = $modal.open({
      templateUrl: 'app/partials/login-modal.html',
      controller: 'FbookCtrl',
      controllerAs: 'FbookCtrl'
    })

    return instance.result.then(assignCurrentUser);
  };

})

.run(['ParseSDK', '$rootScope', '$location', '$window', '$state', '$stateParams', 'loginModal', function(ParseService, $rootScope, $location, $window, $state, $stateParams, loginModal) {

	// Parse is initialised by injecting the ParseService into the Angular app
	$rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
  $rootScope.isViewLoading = true;
  $rootScope.currentUser = Parse.User.current();

    // loading animation
  $rootScope.setLoading = function() {
	    $rootScope.isViewLoading = true;
	};
	$rootScope.unsetLoading = function() {
	    $rootScope.isViewLoading = false;
	};


	$rootScope.$on('$stateChangeStart', function(event, toState, toParams, from, fromParams) {
		$rootScope.setLoading();
    var requireLogin = toState.data.requireLogin;

    if (requireLogin && $rootScope.currentUser == null) {
      event.preventDefault();
      // get me a login modal!
      loginModal()
        .then(function (user) {
          $rootScope.currentUser = Parse.User.current();
          if (toParams.userId == "") {
            toParams.userId = $rootScope.currentUser.id;
            return $state.go(toState.name, toParams);
          } else {
            return $state.go(toState.name, toParams);
          };
          
        })
        .catch(function () {
          return $state.go('home');
        });
    } else if (requireLogin && toParams.userId != $rootScope.currentUser.id) {
      event.preventDefault();
      $state.go('home');
    }

	});

	$rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
		$rootScope.unsetLoading();

    if (!$window.ga)
        return;

    $window.ga('send', 'pageview', { page: $location.path() });
    // console.log("state change success");
    // if (to.name == 'search') {
    //   $rootScope.hidefooter = true;
    // } else {
    //   $rootScope.hidefooter = false;
    // };
	});

	$rootScope.$on('$stateChangeError', function (ev, to, toParams, from, fromParams, err) {
		console.log(err);
	});

}]);