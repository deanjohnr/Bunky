angular.module('user.roommi', ['parse-angular','FacebookPatch'])

.controller('ProfileCtrl', ['$rootScope', '$scope', '$state', '$stateParams', 'FacebookAngularPatch', function($rootScope, $scope, $state, $stateParams, FacebookAngularPatch) {

	if(Parse.User.current()) {
	    $rootScope.currentUser = Parse.User.current();
	}

	$scope.profile = $rootScope.currentUser;
	$scope.profile.name = $rootScope.currentUser.get('name');
	$scope.profile.gender = $rootScope.currentUser.get('gender');
	$scope.profile.age = $rootScope.currentUser.get('age');
	$scope.profile.education = $rootScope.currentUser.get('education');
	console.log($scope.profile.education);
	if ($scope.profile.education) {$scope.profile.education = $scope.profile.education.reverse();};
	$scope.profile.education = $scope.profile.education.reverse();
	$scope.profile.work = $rootScope.currentUser.get('work');
	$scope.profile.propics = $rootScope.currentUser.get('imgUser');

	function calculateAge(dateString) {
	    var today = new Date();
	    var birthDate = new Date(dateString);
	    var age = today.getFullYear() - birthDate.getFullYear();
	    var m = today.getMonth() - birthDate.getMonth();
	    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
	        age--;
	    }
	    return age;
	}

	$scope.refreshUser = function() {

		var user = {};

		console.log('in refresh');

		  FB.apiAngular('me?fields=id,name,first_name,last_name,email,birthday,bio,education,gender,location,hometown,work,albums')
		  .then(function (profileData) {
		  	console.log('got data');
		    user.profileData = profileData;
		    user.age = calculateAge(profileData.birthday);
		  })
		  .then(function (resList) {
		    user.profilePhotos = [];

		    for (var i = user.profileData.albums.data.length - 1; i >= 0; i--) {
		      if (user.profileData.albums.data[i].name == "Profile Pictures") {
		        user.albumid = user.profileData.albums.data[i].id;
		      };
		    };

		    FB.apiAngular('/'+user.albumid+'/photos')
		    .then(function (photoData) {

		    	for (var i = 10 - 1; i >= 0; i--) {
					user.profilePhotos.push(photoData.data[i].images[1].source);
				};

				var shortname = user.profileData.first_name + " " + user.profileData.last_name.charAt(0) + ".";

				if (user.profileData.gender == 'male') {
					user.profileData.gender = 'Male';
				} else if (user.profileData.gender == 'female') {
					user.profileData.gender = 'Female';
				};

		    	var User = Parse.User.current();

				User.set("name",shortname);
				User.set("fullname",user.profileData.name);
				User.set("gender",user.profileData.gender);
				User.set("bday",user.profileData.birthday);
				User.set("education",user.profileData.education);
				User.set("work",user.profileData.work);
				User.set("imgUser",user.profilePhotos.reverse());
				User.set("age",user.age);
				User.set("email",user.profileData.email);

				User.save(null, {
				  success: function(fbUser) {
				    // Execute any logic that should take place after the object is saved.

				    $scope.profile = $rootScope.currentUser;
				    $scope.profile.name = $rootScope.currentUser.get('name');
					$scope.profile.fullname = $rootScope.currentUser.get('fullname');
					$scope.profile.gender = $rootScope.currentUser.get('gender');
					$scope.profile.age = $rootScope.currentUser.get('age');
					$scope.profile.education = $rootScope.currentUser.get('education').reverse();
					$scope.profile.work = $rootScope.currentUser.get('work');
					$scope.profile.propics = $rootScope.currentUser.get('imgUser');
					console.log('profile refreshed');
				  },
				  error: function(fbUser, error) {
				    // Execute any logic that should take place if the save fails.
				    // error is a Parse.Error with an error code and message.
				    //reject('Failed to create new object, with error code: ' + error.message);
				    console.log('refresh failed');
				  }
				});
		    });
		  });

	}

	// LOGOUT
	$scope.logout = function () {
	    console.log($rootScope.currentUser);
	    Parse.User.logOut();
	    $rootScope.currentUser = Parse.User.current();
	    console.log($rootScope.currentUser);
	    $state.go('home');
	};

}]);