angular.module('fbook.roommi', ['ParseServices','FacebookPatch'])

.controller('FbookCtrl', ['$rootScope', '$scope', '$state', '$stateParams', 'FacebookAngularPatch', 'fbookFactory', function($rootScope, $scope, $state, $stateParams, FacebookAngularPatch, fbookFactory) {
    
  $scope.profileData = [];
  $scope.profilePhotos = [];

  if(Parse.User.current()) {
    console.log("in current user");
    Parse.User.current().fetch().then(function (result) {
      $rootScope.currentUser = result;
      $rootScope.appnotes = $rootScope.currentUser.get('appnotes');
      $rootScope.listnotes = $rootScope.currentUser.get('listnotes');
    });
  }

  $scope.fbConnect = function () {
    console.log("trying to login");
    // NB: this is a contrived example for demo purposes, you would never write the following code in a real app
    // normally you would define a User.js data module for all your user objects and the method below would be on the user, e.g. $rootScope.currentUser.fbConnect() 
    Parse.FacebookUtils.logIn("public_profile,email,user_birthday,user_education_history,user_photos,user_work_history", {}).then(function(user) {
      console.log('facebook connected!');
      //$rootScope.currentUser = Parse.User.current().id;
      $rootScope.currentUser = Parse.User.current();
      console.log($rootScope.currentUser);
      console.log(Parse.User.current());

      updateProf();

    }, function(result, error) {
      console.log(error);
      console.log('something went wrong, try again');
    });
  }

  $scope.cancel = $scope.$dismiss;

  // LOGOUT
  $scope.logout = function () {
    console.log($rootScope.currentUser)
    Parse.User.logOut()
    $rootScope.currentUser = Parse.User.current();
    console.log($rootScope.currentUser)
    $state.go('home');
  };

  $scope.refreshUser = function () {
    updateProfile().then(function (result) {
      console.log(result);
    });
  }

  $scope.exampleCall = function() {
    FB.apiAngular(
      '/me/apprequests',
      { message: 'From the app to the user.' },
      'POST')
    .then(function(data) {
      alert('FB Request Successfully Sent!');
      $scope.facebookCtrl.response = data;
    }, function(error) {
      alert('FB Request Unsuccessful!');
      $scope.facebookCtrl.response = error;
    });
  }

  var user = {};

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

    // FACEBOOK PROFILE UPDATE
  updateProf = function () {

      FB.apiAngular('me?fields=id,name,first_name,last_name,email,birthday,education,gender,work,albums')
      .then(function (profileData) {
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

        var User = Parse.User.current();

        var shortname = user.profileData.first_name + " " + user.profileData.last_name.charAt(0) + ".";

        if (user.profileData.gender == 'male') {
          user.profileData.gender = 'Male';
        } else if (user.profileData.gender == 'female') {
          user.profileData.gender = 'Female';
        };

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
            if (typeof $scope.$close() == 'function') {
              $scope.$close(user);
            };
          },
          error: function(fbUser, error) {
            // Execute any logic that should take place if the save fails.
            // error is a Parse.Error with an error code and message.
            //reject('Failed to create new object, with error code: ' + error.message);
            console.log(error);
          }
        });
        });
      });
  }

}])

