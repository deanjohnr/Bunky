angular.module('listing.roommi', ['uiGmapgoogle-maps', 'ui.bootstrap', 'parse-angular', 'fbook.roommi'])

.config(function(uiGmapGoogleMapApiProvider) {
	console.log('config maps');
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyCCMEJsPzyGW-oLOShTOJw_Pe9Qv2YMAZo',
        v: '3.17',
        libraries: 'places'
    });
})

.controller("ListingCtrl", function($scope, $rootScope, $state, $stateParams, $modal, fbookFactory, FacebookAngularPatch, uiGmapGoogleMapApi, markersFactory) {

	$scope.pictureFiles = [];
	$scope.picUrls = [];

	var Listing = Parse.Object.extend("listing");
	var userquery = new Parse.Query(Parse.User);
	var query = new Parse.Query(Listing);
	var listing = $stateParams.listingId;
	console.log(listing);
	query.get(listing, {
		success: function(listing) {
			console.log(listing);
			$scope.listing = listing;
		    $scope.listing.listingid = listing.id;
		    $scope.listing.ownerId = listing.get('ownerId');
		    $scope.listing.apps = listing.get('applications');
		    $scope.listing.appids = _.pluck($scope.listing.apps, 'id');
		    $scope.listing.address = listing.get("address");
		    $scope.pageTitle = $scope.listing.address;
		    $scope.place = { types: ['street_address'] };
		    $scope.listing.beds = listing.get("beds");
		    $scope.listing.baths = listing.get("baths");
		    $scope.listing.rent = listing.get("rent");
		    $scope.listing.aptnum = listing.get("aptnum")
		    $scope.listing.tempdt = listing.get("availableDate");
		    $scope.listing.dt = $scope.listing.tempdt.toLocaleDateString();
		    $scope.listing.tempenddt = listing.get("enddate");
		    $scope.listing.enddt = $scope.listing.tempenddt.toLocaleDateString();
		    $scope.listing.gender = listing.get("gender");
		    $scope.listing.desc = listing.get("description");
		    $scope.listing.templaundry = listing.get("laundry");
		    $scope.listing.tempair = listing.get("air");
		    $scope.listing.appcount = listing.get('applications').length;
		    $scope.pictureFiles[0] = $scope.listing.get("photo0");
			$scope.pictureFiles[1] = $scope.listing.get("photo1");
			$scope.pictureFiles[2] = $scope.listing.get("photo2");
			$scope.pictureFiles[3] = $scope.listing.get("photo3");
			$scope.pictureFiles[4] = $scope.listing.get("photo4");
			$scope.picUrls[0] = $scope.pictureFiles[0].url();
			$scope.picUrls[1] = $scope.pictureFiles[1].url();
			$scope.picUrls[2] = $scope.pictureFiles[2].url();
			$scope.picUrls[3] = $scope.pictureFiles[3].url();
			$scope.picUrls[4] = $scope.pictureFiles[4].url();

			$scope.share = {};

			var desclen = $scope.listing.desc.length;
			var desccut = "";
			if (desclen < 141) {
				desccut = $scope.listing.desc;
			} else {
				desccut = $scope.listing.desc.substr(0, 140) + "...";
			};

			$scope.share.title = $scope.listing.beds + " bed, " + $scope.listing.baths + "bath for $" + $scope.listing.rent + "/month";
			$scope.share.desc = "Located at " + $scope.listing.address + " and available starting " + $scope.listing.dt + ". " + desccut;
			$scope.share.url = "http://piip.parseapp.com/#!/listing/" + $scope.listing.listingid;
			$scope.share.geopoint = $scope.listing.get('geopoint');
			//$scope.share.url = "http://piip.parseapp.com/?_escaped_fragment_=%2Flisting%2F" + $scope.listing.listingid;
			$scope.share.image = $scope.picUrls[0];

			$scope.$emit('metaUpdate', $scope.share);

			$("<img/>").attr("src", $scope.picUrls[0]).load(function(){
			    s = {w:this.width, h:this.height};
			    $scope.share.imgw = s.w
			    $scope.share.imgh = s.h;
			    $scope.$emit('metaUpdate', $scope.share);
			    console.log('$emit triggered');
			});

			if ($scope.listing.gender == 'both') {
				$scope.listing.gender = 'Male and Female';
			}

			if ($scope.listing.templaundry == true) {
				$scope.listing.laundry = 'In Building';
			}

			if ($scope.listing.tempair == true) {
				$scope.listing.air = 'A/C';
			}
			

			$scope.map = {
		    	center: { latitude: $scope.listing.attributes.geopoint._latitude, longitude: $scope.listing.attributes.geopoint._longitude },
		    	zoom: 13
		    	// options: { 
		    	// 	types: "locality, neighborhood, postal_town, colloquial_area, political, postal_code"
		    	// }
		    };

			$scope.marker = {
				id: listing.id,
				coords: { latitude: $scope.listing.attributes.geopoint._latitude, longitude: $scope.listing.attributes.geopoint._longitude },
			};

			uiGmapGoogleMapApi.then(function(maps) {

    		});

			userquery.get($scope.listing.ownerId, {
				success: function(profile) {
					$scope.profile = profile;
					$scope.profile.name = profile.get('name');
					$scope.profile.email = profile.get('email');
					$scope.profile.gender = profile.get('gender');
					$scope.profile.age = profile.get('age');
					$scope.profile.education = profile.get('education').reverse();
					$scope.profile.work = profile.get('work');
					$scope.profile.propics = profile.get('imgUser');
				},
				error: function(error) {
					console.log(error);
				}
			})
		},
		error: function(error) {
			console.log(error);
		}
	});

	$scope.listflag = function () {
		$scope.listing.increment('flag');
		$scope.listing.save();
		$scope.flagged = true;
	}

	$scope.apply = function () {

		if ($rootScope.currentUser) {

			var tempindex = _.indexOf($scope.listing.appids, $rootScope.currentUser.id);

			if (tempindex == -1) {
				$scope.listing.addUnique('applications', {
					id: $rootScope.currentUser.id,
					appstatus: 'new',
					chatstatus: false,
					modifieddt: new Date()
				});
				$rootScope.currentUser.addUnique('applications', $scope.listing.listingid);
				$scope.listing.save(null, {
					success: function(result) {
						// Notification Email
						Parse.Cloud.run('emailNewApp', {
							recname: $scope.profile.name,
							recemail: $scope.profile.email,
							sender: $rootScope.currentUser.get('name')
						}, {
							success: function(message) {
							},
							error: function(result, error) {
								console.log(error)
							}
						});
					},
					error: function(result, error) {
						console.log(error);
					}
				});
				$rootScope.currentUser.save(null, {
					success: function(result) {
						$scope.applyalert = "Applied!";
					},
					error: function(error) {
						console.log(error);
					}
				});
			} else {
				$scope.applyalert = "Applied!";
			};
		};
	}

	$scope.fbConnect = function () {
	    // NB: this is a contrived example for demo purposes, you would never write the following code in a real app
	    // normally you would define a User.js data module for all your user objects and the method below would be on the user, e.g. $rootScope.currentUser.fbConnect() 
	    Parse.FacebookUtils.logIn("public_profile,email,user_birthday,user_education_history,user_photos,user_work_history", {}).then(function(user) {
	    	console.log('facebook connected!');
	    	$rootScope.currentUser = Parse.User.current();
	    	updateProf();
	    }, function(error) {
	    	console.log('something went wrong, try again');
	    });
	}

	$scope.fbShare = function() {
		FB.ui({
			method: 'share',
			url: 'http://piip.parseapp.com/#!/listing/' + $scope.listing.listingid,
			title: $scope.share.title,
			description: $scope.share.desc,
			image: $scope.share.image,
			href: 'http://piip.parseapp.com/#!/listing/' + $scope.listing.listingid
		}, function(response){});
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

})