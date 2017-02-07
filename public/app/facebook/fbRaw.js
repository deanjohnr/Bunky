
	// FACEBOOK PROFILE SAVE
	user.profileSave = function () {

		updateProfile();

		var User = Parse.User.current();
		user.set("name",$scope.profileData.name);
		user.set("gender",$scope.profileData.gender);
		user.set("bday",$scope.profileData.birthday);
		user.set("education",$scope.profileData.education);
		user.set("work",$scope.profileData.work);
		user.set("imgUser",$scope.profilePhotos);
		user.set("age",$scope.age);

		user.save(null, {
		  success: function(fbUser) {
		    // Execute any logic that should take place after the object is saved.
		    alert('Profile Saved');
		  },
		  error: function(fbUser, error) {
		    // Execute any logic that should take place if the save fails.
		    // error is a Parse.Error with an error code and message.
		    alert('Failed to create new object, with error code: ' + error.message);
		  }
		});
	}


  // SAVE NEW LISTING
  $scope.addListing = function (listing) {
    $scope.master = angular.copy(listing);
    console.log($scope.master);
    // $scope.listings.push($scope.listing);
  }



  

  // APPLICATION FUNCTION (used for testing)
  $scope.applycount = function () {

    var AppCount = Parse.Object.extend("AppCount");
    var appCount = new AppCount();
    appCount.set("count",1);

    appCount.save(null, {
      success: function(fbUser) {
        // Execute any logic that should take place after the object is saved.
        alert('Application Submitted');
        $scope.applied = 'true';
      },
      error: function(fbUser, error) {
        // Execute any logic that should take place if the save fails.
        // error is a Parse.Error with an error code and message.
        alert('Failed to submit application');
      }
    });
  }

  // Save Listing
  function addListing () {
    // add apartment posting
    var Listing = Parse.Object.extend("Posting");
    var listing = new Posting();

    listing.set("description",desc);
    listing.set("Address",address);
    listing.set("Rent",rent);
    listing.set("isActive",true);
    listing.set("availableDate",date);
    listing.set("beds",beds);
    listing.set("baths",baths);

    listing.save({
      success: function(posting) {
        // Execute any logic that should take place after the object is saved.
        alert('New object created with objectId: ' + posting.id);
      },
      error: function(posting, error) {
        // Execute any logic that should take place if the save fails.
        // error is a Parse.Error with an error code and message.
        alert('Failed to create new object, with error code: ' + error.message);
      }
    });
  }

  // Deactivate Listing
  function deactivateListing () {
    // remove apartment posting
    var Listing = Parse.Object.extend("Posting");
    var mainQuery = new Parse.Query(Posting);
    mainQuery.equalTo("fbId",$scope.postingData.id)
    mainQuery.first({
      success: function(posting) {
        posting.set("isActive",false);

        posting.save(null, {
          success: function(posting) {
            // Execute any logic that should take place after the object is saved.
            alert('Object updated with objectId: ' + posting.id);
          },
          error: function(posting, error) {
            // Execute any logic that should take place if the save fails.
            // error is a Parse.Error with an error code and message.
            alert('Failed to update object, with error code: ' + error.message);
          }
        });
      },
      error: function() {
        alert('Something went wrong, could not deactivate listing');
      }
    });
  }

  function calculateAge(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    $rootScope.currentUser.age = age;
  }

  // INCOMPLETE filter listing results
  function filterResults () {
    // input filters, get results
    var Posting = Parse.Object.extend("Posting");
    var mainQuery = new Parse.Query(FbUser);

    // add rent queries to main query
    mainQuery.lessThanOrEqualTo("Rent",maxrent);
    mainQuery.greaterThanOrEqualTo("Rent",minrent);

    // add active filter
    mainQuery.equalTo("isActive",true);
  }

  // INCOMPLETE Paginate filter results
  function handleFilterResults () {
  }

  // INCOMPLETE User apply to listing
  function userApply () {
    updateMe().then(function() {
      $scope.listingId // Push listingId into User Applications Array
      // Push userId into Listing Applications Array
      var user = Parse.User.current();
      if (user){
        user.addUnique("applications", $scope.listingId)
        user.save();
      } else {
        alert("Yikes! For some reason the little magic elves aren't working hard enougha and your application did not submit. Try again later. Every good elf needs a break.")
      }
    });
  }

  // INCOMPLETE User passes on listing and remove pin from map
  function userPass () {
  }

  function getUserApps () {
    // get all active listings current user applied to
  }

  function getListingApps () {
    // get all users who applied to listing
  }


  /**
   * Update api('/me') result
   */
  function updateProfile () {
    if(Parse.User.current()) {
      FB.apiAngular('me/albums?fields=name,id').then(function(profileData) {
        $scope.profileData = profileData;
        calculateAge($scope.profileData.birthday);
        profileSave();
      })
    } else {
      fbConnect();
      FB.apiAngular('me/albums?fields=name,id').then(function(profileData) {
        $scope.profileData = profileData;
        calculateAge($scope.profileData.birthday);
        profileSave();
      }
    }
  }

  $scope.albumId = "";
  function profileAlbumId () {

      FB.apiAngular('me/albums?fields=name,id')
      .then(function (albums) {
        for (var i = albums[0].data.length - 1; i >=0; i--) {
          if (albums[0].data[i].name == "Profile Pictures") {
            $rootScope.currentUser.profAlbumId = albums[0].data[i].id
          };
        };
      });
  }

  /**
   * Update demostration api calls result
   */
  
