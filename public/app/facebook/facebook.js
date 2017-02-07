angular.module('fbook.roommi')

.factory('fbookFactory', function($q) {

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
	updateProfile = function () {

		if(Parse.User.current()) {
		  FB.apiAngular('me?fields=id,name,first_name,last_name,email,birthday,bio,education,gender,location,hometown,work,albums')
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
				    alert('Profile Saved');
				  },
				  error: function(fbUser, error) {
				    // Execute any logic that should take place if the save fails.
				    // error is a Parse.Error with an error code and message.
				    //reject('Failed to create new object, with error code: ' + error.message);
				  }
				});
		    });
		  });
		} else {
		  fbConnect();
		  FB.apiAngular('me?fields=id,name,email,birthday,bio,education,gender,location,hometown,work,albums')
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
				User.set("name",user.profileData.name);
				User.set("gender",user.profileData.gender);
				User.set("bday",user.profileData.birthday);
				User.set("education",user.profileData.education);
				User.set("work",user.profileData.work);
				User.set("imgUser",user.profilePhotos);
				User.set("age",user.age);

				User.save(null, {
				  success: function(fbUser) {
				    // Execute any logic that should take place after the object is saved.
				    //resolve('Profile Saved');
				  },
				  error: function(fbUser, error) {
				    // Execute any logic that should take place if the save fails.
				    // error is a Parse.Error with an error code and message.
				    //refresh('Failed to create new object, with error code: ' + error.message);
				  }
				});
		    });
		  });
		}
	}
})