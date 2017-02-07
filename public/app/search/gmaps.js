// uiGmapGoogleMapApiProvider.configure({
//     key: 'AIzaSyCCMEJsPzyGW-oLOShTOJw_Pe9Qv2YMAZo',
//     v: '3.17',
//     libraries: 'geometry,visualization'
// });

angular.module('search.roommi', ['uiGmapgoogle-maps', 'ui.bootstrap', 'parse-angular'])

.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyCCMEJsPzyGW-oLOShTOJw_Pe9Qv2YMAZo',
        v: '3.17',
        libraries: 'places'
    });
})

.controller("SearchCtrl", function($scope, $state, $stateParams, $modal, uiGmapGoogleMapApi, markersFactory) {
    // Do stuff with your $scope.
    // Note: Some of the directives require at least something to be defined originally!
    // e.g. $scope.markers = []
    $scope.isSubCollapsed = true;

    $scope.markers = [];
    $scope.markers[0] = {
		id: '0',
		coords: { latitude: -89, longitude: -179 },
	};

    $scope.map = {
    	center: { latitude: 38.4136992, longitude: -96.0165625 },
    	zoom: 5,
    	options: { 
    		types: "locality, neighborhood, postal_town, colloquial_area, political, postal_code"
    	},
    	events: {
    		center_changed: function() {
    			var curpoint = new Parse.GeoPoint($scope.map.center);
    			var distance = curpoint.milesTo($scope.oldpoint);
    			// Measure center movement, set new center and reload listings
    			if (distance > 30) {
    				$scope.oldpoint = new Parse.GeoPoint($scope.map.center.latitude, $scope.map.center.longitude);
    				getListings();
    				// getMarkers(curpoint.lat, curpoint.lng, $scope.price);
    			};
    		}
    	}
    };

    $scope.oldpoint = new Parse.GeoPoint(38.4136992, -96.0165625);

    var events = {
	    places_changed: function (searchBox) {
	        var place = searchBox.getPlaces();
	        if (!place || place == 'undefined' || place.length == 0) {
	            return;
	        }

	        $scope.map.center = {
	                "latitude": place[0].geometry.location.lat(),
	                "longitude": place[0].geometry.location.lng()
	            };
	        $scope.map.zoom = 13;
	        // $scope.marker = {
	        //     id: 0,
	        //     coords: {
	        //         latitude: place[0].geometry.location.lat(),
	        //         longitude: place[0].geometry.location.lng()
	        //     }
	        // };
	    }
	};

	// $scope.searchbox = { template: 'searchbox.tpl.html', events: events };

    $scope.searchbox = { 
    	template: 'app/partials/searchbox.html', 
		events: events,
		options: { types: "locality, neighborhood, postal_town, colloquial_area, political, postal_code" },
		position: "bottom_left"
	};

    $scope.price = 5000;
    $scope.genderfilter = 'both';
    $scope.laundryfilter = false;

    $scope.$watch(function() {
      		return $scope.oldpoint;
    	}, function(newValue, oldValue) {
	  	}, 
	  	true
	);
	

    getListings = function() {

		var Listing = Parse.Object.extend('listing');
		var locquery = new Parse.Query(Listing);
		locquery.withinMiles('geopoint', $scope.oldpoint, 100);
		locquery.find({
			success: function(listings) {
				 $scope.listings = listings;
				 $scope.priceFilter();
			},
			error: function(result, error) {
				console.log(error);
			}
		})

	}

	makeMarkers = function(listings) {
		// take in listings array and make markers
		if (listings[0]) {
			for (var i = 0; i < listings.length; i++) {
				$scope.markers[i] = {
					id: listings[i].id,
					coords: { latitude: listings[i].attributes.geopoint._latitude, longitude: listings[i].attributes.geopoint._longitude },
					click: function(marker) {
						$scope.showSideView(marker.key);
					}
				};
			};
		} else {
			$scope.markers[0] = {
				id: '0',
				coords: { latitude: -89, longitude: -179 },
			};
		};
	}

	$scope.markerControl = {};

	getListings();

	$scope.today = function() {
	    $scope.dtfilter = new Date();
	};
	$scope.today();

	$scope.open = function($event) {
	    $event.preventDefault();
	    $event.stopPropagation();

	    $scope.opened = true;
	};

	$scope.dateOptions = {
	    formatYear: 'yy',
	    startingDay: 1
	};

    // Some on filter refresh function
    $scope.priceFilter = function() {

    	if ($scope.genderfilter == 'both') {
    		if ($scope.laundryfilter) {
	    		$scope.tempListings = $scope.listings.filter(function (el) {
					return  el.attributes.rent <= $scope.price &&
							el.attributes.isActive == true &&
							el.attributes.availableDate <= $scope.dtfilter ||
							el.attributes.availableDate.toDateString() == $scope.dtfilter.toDateString() &&
							el.attributes.laundry == $scope.laundryfilter;
				});
	    	} else {
	    		$scope.tempListings = $scope.listings.filter(function (el) {
					return  el.attributes.rent <= $scope.price &&
							el.attributes.isActive == true &&
							el.attributes.availableDate <= $scope.dtfilter ||
							el.attributes.availableDate.toDateString() == $scope.dtfilter.toDateString();
				});
	    	};
    	} else {
    		if ($scope.laundryfilter) {
	    		$scope.tempListings = $scope.listings.filter(function (el) {
					return  el.attributes.rent <= $scope.price &&
							el.attributes.isActive == true &&
							el.attributes.gender == $scope.genderfilter &&
							el.attributes.availableDate <= $scope.dtfilter ||
							el.attributes.availableDate.toDateString() == $scope.dtfilter.toDateString() &&
							el.attributes.laundry == $scope.laundryfilter;
				});
	    	} else {
	    		$scope.tempListings = $scope.listings.filter(function (el) {
					return  el.attributes.rent <= $scope.price &&
							el.attributes.isActive == true &&
							el.attributes.gender == $scope.genderfilter &&
							el.attributes.availableDate <= $scope.dtfilter ||
							el.attributes.availableDate.toDateString() == $scope.dtfilter.toDateString();
				});
	    	};
    	};
    	
		makeMarkers($scope.tempListings);

    };

    $scope.showSideView = function(listingId) {

    	var url = $state.href('listing', { listingId: listingId });
    	window.open(url,'_blank');

    };

    uiGmapGoogleMapApi.then(function(maps) {

    });

})

.controller("SideViewCtrl", function($scope, $rootScope, $state, $stateParams, listingId, uiGmapGoogleMapApi) {

	$scope.pictureFiles = [];
	$scope.picUrls = [];

	var Listing = Parse.Object.extend("listing");
	var userquery = new Parse.Query(Parse.User);
	var query = new Parse.Query(Listing);
	var listing = listingId;
	query.get(listing, {
		success: function(listing) {
			$scope.listing = listing;
		    $scope.listing.listingid = listing.id;
		    $scope.listing.ownerId = listing.get('ownerId');
		    $scope.listing.apps = listing.get('applications');
		    $scope.listing.appids = _.pluck($scope.listing.apps, 'id');
		    $scope.listing.address = listing.get("address");
		    $scope.place = { types: ['street_address'] };
		    $scope.listing.beds = listing.get("beds");
		    $scope.listing.baths = listing.get("baths");
		    $scope.listing.rent = listing.get("rent");
		    $scope.listing.aptnum = listing.get("aptnum")
		    $scope.listing.dt = listing.get("availableDate");
		    $scope.listing.enddt = listing.get("enddate");
		    $scope.listing.gender = listing.get("gender");
		    $scope.listing.desc = listing.get("description");
		    $scope.listing.laundry = listing.get("laundry");
		    $scope.listing.air = listing.get("air");
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
			userquery.get($scope.listing.ownerId, {
				success: function(profile) {
					$scope.profile = profile;
					$scope.profile.name = profile.get('name');
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

	$scope.apply = function () {

		// var app = Parse.Object.extend('Application');
		// var listingrel = app.relation('listing');
		// var hunterrel = app.relation('hunter');
		// var listerrel = app.relation('lister');
		// listingrel.add($scope.listing);
		// hunterrel.add($rootScope.currentUser);
		// listerrel.add($scope.profile);
		// app.set('appstatus', 'new');
		// app.save()

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
				},
				error: function(result, error) {
					console.log(error);
				}
			});
			$rootScope.currentUser.save(null, {
				success: function(result) {
				},
				error: function(error) {
					console.log(error);
				}
			});
		} else {
			alert('you have already applied to this listing');
		};
		
	}

})


.controller("SearchReviewCtrl", function($scope, $rootScope, $state, $stateParams) {

	if(Parse.User.current()) {
	    Parse.User.current().fetch().then(function (result) {
	    	$rootScope.currentUser = result;
	    });
	}

	// $rootScope.currentUser.set('appnotes', false);
	// $rootScope.currentUser.save(null, {
	// 	success: function(result) {
	// 		console.log('removed notifications');
	// 		$rootScope.appnotes = false;
	// 	},
	// 	error: function(result, error) {
	// 		console.log(error);
	// 	}
	// });

	var user = $rootScope.currentUser;

	$scope.pictureFiles = [];

	var Listing = Parse.Object.extend('listing');
	var listingquery = new Parse.Query(Listing);
	user.apps = $rootScope.currentUser.get('applications');
    listingquery.containedIn('objectId', user.apps);
    listingquery.equalTo('isActive', true);
    listingquery.find({
    	success: function(listings) {

    		$scope.listings = listings;

    		for (var i = 0; i < listings.length; i++) {

    			$scope.listings[i].listing = {};
    			$scope.listings[i].lister = {};
    			$scope.listings[i].listing.id = listings[i].id;
    			
    			$scope.listings[i].listing.apps = listings[i].get('applications');
    			elementPos = $scope.listings[i].listing.apps.map(function(x) {return x.id; }).indexOf(user.id);
    			$scope.listings[i].modifieddt = $scope.listings[i].listing.apps[elementPos].modifieddt;

				$scope.listings[i].listing.ownerId = listings[i].get('ownerId');
			    $scope.listings[i].listing.address = listings[i].get("address");
			    $scope.listings[i].listing.beds = listings[i].get("beds");
			    $scope.listings[i].listing.baths = listings[i].get("baths");
			    $scope.listings[i].listing.rent = listings[i].get("rent");
			    $scope.listings[i].listing.aptnum = listings[i].get("aptnum")
			    $scope.listings[i].listing.tempdt = listings[i].get("availableDate");
		    	$scope.listings[i].listing.dt = $scope.listings[i].listing.tempdt.toLocaleDateString();
			    $scope.listings[i].listing.tempenddt = listings[i].get("enddate");
			    $scope.listings[i].listing.enddt = $scope.listings[i].listing.tempenddt.toLocaleDateString();
			    $scope.listings[i].listing.gender = listings[i].get("gender");
			    $scope.listings[i].listing.desc = listings[i].get("description");
			    $scope.listings[i].listing.laundry = listings[i].get("laundry");
			    $scope.listings[i].listing.air = listings[i].get("air");
			    $scope.listings[i].listing.pictureFiles = [];
			    $scope.listings[i].listing.pictureFiles[0] = $scope.listings[i].get("photo0");
				$scope.listings[i].listing.pictureFiles[1] = $scope.listings[i].get("photo1");
				$scope.listings[i].listing.pictureFiles[2] = $scope.listings[i].get("photo2");
				$scope.listings[i].listing.pictureFiles[3] = $scope.listings[i].get("photo3");
				$scope.listings[i].listing.pictureFiles[4] = $scope.listings[i].get("photo4");
				$scope.listings[i].listing.picUrls = [];
				$scope.listings[i].listing.picUrls[0] = $scope.listings[i].listing.pictureFiles[0].url();
				$scope.listings[i].listing.picUrls[1] = $scope.listings[i].listing.pictureFiles[1].url();
				$scope.listings[i].listing.picUrls[2] = $scope.listings[i].listing.pictureFiles[2].url();
				$scope.listings[i].listing.picUrls[3] = $scope.listings[i].listing.pictureFiles[3].url();
				$scope.listings[i].listing.picUrls[4] = $scope.listings[i].listing.pictureFiles[4].url();

				var tempObj = {};

				var userquery = new Parse.Query(Parse.User);
				userquery.get($scope.listings[i].listing.ownerId, {
					success: function(user) {
						tempObj.profile = user;
	    				tempObj.lister = user.id;
	    				tempObj.education = user.get('education');
	    				tempObj.work = user.get('work');
	    				tempObj.age = user.get('age');
	    				tempObj.gender = user.get('gender');
	    				tempObj.propics = user.get('imgUser');
	    				tempObj.name = user.get('name');
					},
					error: function(result, error) {
						console.log(error);
					}
				})

				$scope.listings[i].lister = tempObj;

    		};
    		$scope.listings.sort(compare);
    	},
    	error: function(error) {
    		console.log(error);
    	}
    });

	function compare(a,b) {
	  if (a.modifieddt < b.modifieddt)
	     return -1;
	  if (a.modifieddt > b.modifieddt)
	    return 1;
	  return 0;
	}

	$scope.openSearchChat = function (listingId) {
		$state.go('appreview.chat', { listingId: listingId});
	}

})



