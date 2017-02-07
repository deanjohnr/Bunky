angular.module('list.roommi', ['ui.bootstrap', 'parse-angular','FacebookPatch'] )

.controller('ListingBoardCtrl', ['$rootScope', '$scope', '$state', '$stateParams', 'FacebookAngularPatch', function($rootScope, $scope, $state, $stateParams, FacebookAngularPatch) {

	if(Parse.User.current()) {
	    Parse.User.current().fetch().then(function (result) {
	    	$rootScope.currentUser = result;
	    });
	    console.log($rootScope.currentUser);
	    console.log('User: ' + $rootScope.currentUser.id);
	}

	getListing = function () {

		var Listing = Parse.Object.extend("listing");
		var query = new Parse.Query(Listing);
		var listing = $rootScope.currentUser.get('listing');
		console.log($rootScope.currentUser);
		console.log(listing);
		console.log(query);
		query.get(listing, {
			success: function(listing) {
				$scope.listing = listing;
			    $scope.listing.listingid = listing.id;
			    $scope.listing.newmessagecount = listing.get('newmessagecount');
			    $scope.listing.apps = listing.get('applications');
			    $scope.listing.fulladdress = listing.get('fulladdress');
			    $scope.listing.refreshdt = listing.get('refreshdt');
			    $scope.today = new Date();
			    $scope.expiredt = 7 - ($scope.today.getDate() - $scope.listing.refreshdt.getDate());
			    console.log($scope.today.getDate() - $scope.listing.refreshdt.getDate());
			    console.log($scope.expiredt);
			},
			error: function(result, error) {
				console.log(error);
			}
		});
	};

	$scope.refresh = function () {
		$scope.listing.set('refreshdt', new Date());
		$scope.listing.set('isActive', true);
		$scope.listing.save(null, {
			success: function(listing) {
				console.log('refreshed the listing');
			},
			error: function(result, error) {
				console.log('error');
			}
		});
	};

	$scope.goManager = function () {
		$scope.refresh();
		$state.go('list.listing.review', {listingId: $scope.listing.listingid});
	}

	getListing();

}])

.controller('ListEditCtrl', ['$rootScope', '$scope', '$stateParams', function($rootScope, $scope, $stateParams) {

	$scope.gender = $rootScope.currentUser.get('gender');

	var Listing = Parse.Object.extend("listing");
	var query = new Parse.Query(Listing);
	var listing = $rootScope.currentUser.get('listing');
	console.log(listing);
	if (listing) {
		query.get(listing, {
			success: function(listing) {
				$scope.listing = listing;
			    $scope.listing.listingid = listing.id;
			    $scope.sharelink = listing.id;
			    $scope.listing.address = listing.get("address");
			    $scope.listing.fulladdress = listing.get("fulladdress");
			    $scope.listing.shortaddress = listing.get("shortaddress");
			    $scope.listing.medaddress = listing.get("medaddress");
			    $scope.listing.isaddressfull = listing.get("isaddressfull");
			    $scope.place = { types: ['street_address'] };
			    $scope.listing.beds = listing.get("beds");
			    $scope.listing.baths = listing.get("baths");
			    $scope.listing.rent = listing.get("rent");
			    $scope.listing.aptnum = listing.get("aptnum")
			    $scope.listing.dt = listing.get("availableDate");
			    $scope.listing.enddt = listing.get("enddate");
			    $scope.listing.desc = listing.get("description");
			    $scope.listing.gender = listing.get("gender");
			    $scope.listing.air = listing.get("air");
			    $scope.listing.laundry = listing.get("laundry");
			    $scope.listing.flag = listing.get("flag");
			    $scope.listing.dealflag = listing.get("dealflag");

			    $scope.deal = {};
			    $scope.deal.appfee = listing.get("appfee");
			    $scope.deal.depositfee = listing.get("depositfee");
			    $scope.deal.rentfee = listing.get("rentfee");
			    $scope.deal.otherfee = listing.get("otherfee");

				getPhotos();
			},
			error: function(error) {
				console.log(error);
				console.log('no listing');
			}
		})
	} else {
		$scope.pictureFiles = [];
		$scope.picUrls = [];
		$scope.picExists = [];
		Listing = Parse.Object.extend("listing");
		$scope.listing = new Listing;
		$scope.listing.dt = new Date();
		$scope.listing.enddt = new Date();
		$scope.listing.isaddressfull = true;
		$scope.listing.beds = 0;
		$scope.listing.baths = 1;
		$scope.listing.flag = 0;
		$scope.listing.dealflag = false;
	};

	gmapinitialize();

	$scope.options = { 
		type: 'geocode',
		country: 'us'
	};

	getPhotos = function() {

		$scope.pictureFiles = [];
		$scope.picUrls = [];
		if ($scope.listing.get("photo1")) {
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
			$scope.picExists = [true,true,true,true,true];
			console.log($scope.picUrls);
		} else {
			$scope.$apply();
		};
	};


	// var Listing = Parse.Object.extend("Listing");
	// var query = new Parse.Query(Listing);
	// query.get($stateParams.listingId, {
	//   success: function(listing) {
	//     // The object was retrieved successfully.
	//     $scope.listing = listing;
	//   },
	//   error: function(object, error) {
	//     // The object was not retrieved successfully.
	//     // error is a Parse.Error with an error code and message.
	//   }
	// });

	$scope.saveListing = function () {

		if ($scope.listing.beds < 2) {
			$scope.listing.type = 'place';
		} else {
			$scope.listing.type = 'room';
		};

		if ($scope.listing.isaddressfull) {
			$scope.listing.address = $scope.listing.medaddress;
		} else {
			$scope.listing.address = $scope.listing.shortaddress;
		}

		$scope.listing.set('rent', $scope.listing.rent);
		$scope.listing.set('beds', $scope.listing.beds);
		$scope.listing.set('baths', $scope.listing.baths);
		$scope.listing.set('address', $scope.listing.address);
		$scope.listing.set('fulladdress', $scope.listing.fulladdress);
		$scope.listing.set('medaddress', $scope.listing.medaddress);
		$scope.listing.set('shortaddress', $scope.listing.shortaddress);
		$scope.listing.set('isaddressfull', $scope.listing.isaddressfull);
		$scope.listing.set('aptnum', $scope.listing.aptnum);
		$scope.listing.set('availableDate', $scope.listing.dt);
		$scope.listing.set('enddate', $scope.listing.enddt);
		$scope.listing.set('description', $scope.listing.desc);
		$scope.listing.set('gender', $scope.listing.gender);
		$scope.listing.set('air', $scope.listing.air);
		$scope.listing.set('laundry', $scope.listing.laundry);
		$scope.listing.set('flag', $scope.listing.flag);
		$scope.listing.set('dealflag', $scope.listing.dealflag);
		$scope.listing.set('geopoint', $scope.geopoint);
		$scope.listing.set('refreshdt', new Date());
		$scope.listing.set('isActive', true);
		$scope.listing.set('ownerId', $rootScope.currentUser.id);
		$scope.listing.set('email', $rootScope.currentUser.get('email'));

		$scope.listing.set('appfee', $scope.deal.appfee);
		$scope.listing.set('depositfee', $scope.deal.depositfee);
		$scope.listing.set('rentfee', $scope.deal.rentfee);
		$scope.listing.set('otherfee', $scope.deal.otherfee);

		updatePhotos($scope.listing, $scope.pictureFiles, $scope.picExists, $rootScope.currentUser);

	};

	updatePhotos = function (listing, files, picExists, user) {
		var i = 0;
		console.log(i);
		photoSaveLoop(i, listing, files, picExists, user);
	};

	photoSaveLoop = function(ix, listingx, filesx, picExistsx, userx) {
		var i = ix;
		var listing = listingx;
		var files = filesx;
		var picExists = picExistsx;
		var user = userx;
		if (!picExists[i]) {
			parseFile = new Parse.File(files[i].name,files[i]);
			// Parse.Cloud.run('reformatImage', { file: parseFile }, {
			// 	success: function(imageFile) {
			parseFile.save().then(function() {
				listing.set("photo"+i.toString(), parseFile);
				picExists[i] = true;
				if (i == files.length-1) {
					listing.save(null, {
						success: function(listing) {
							$scope.savealert = "Saved!";
							$scope.sharelink = listing.id;
							if (!user.get("listing")) {
								user.set("listing", listing.id);
								user.save(null, {
									success: function(user) {
									},
									error: function(error) {
										console.log("Error saving user: " + error);
									}
								});
							};
						},
						error: function(error) {
								console.log("Error saving listing: " + error);
						}
					});
				} else {
					i++;
					photoSaveLoop(i, listing, files, picExists, user);
				};
			});
		} else {
			listing.set("photo"+i.toString(), files[i]);
			if (i == files.length-1) {
				listing.save(null, {
					success: function(listing) {
						$scope.savealert = "Saved!";
						$scope.sharelink = listing.id;
					},
					error: function(error) {
						console.log(error);
						return
					}
				});
			} else {
				i++;
				photoSaveLoop(i, listing, files, picExists, user);
			};
		}
	};

	$scope.today = function() {
		if (!$scope.listing.dt) {
			$scope.listing.dt = new Date();
		};
	};

	$scope.toggleMin = function() {
	    $scope.minDate = $scope.minDate ? null : new Date();
	};
	$scope.toggleMin();

    $scope.uploadFile = function(filelist) {
		$scope.picErrors = [];

    	if ($scope.pictureFiles.length+filelist.length > 5) {
    		alert("You can only upload 5 photos, make them count");
    	} else {

    		for (var i = 0; i < filelist.length; i++) {

    			if (filelist[i].size > 200000) {
    				$scope.picErrors.push(filelist[i].name);
    				$scope.$apply();
    			} else {
    				renderImage(filelist[i]);
    			
    				$scope.pictureFiles.push(filelist[i]);
    				$scope.picExists.push(false);
    			};

    		};
    	};
	};

	function renderImage(file) {

	  // generate a new FileReader object
	  var reader = new FileReader();

	  // inject an image with the src url
	  reader.onload = function(event) {
	    the_url = event.target.result
	    $scope.picUrls.push(the_url);
	    $scope.$apply();
	  };
	 
	  // when the file is read it triggers the onload event above.
	  reader.readAsDataURL(file);
	}

	$scope.moveUp = function(loc) {
		var tempUrl = $scope.picUrls[loc];
		var	tempFile = $scope.pictureFiles[loc];
		var tempExistance = $scope.picExists[loc];

		$scope.picUrls.splice(loc,1);
		$scope.pictureFiles.splice(loc,1);
		$scope.picExists.splice(loc,1);
		
		$scope.picUrls.splice(loc-1,0,tempUrl);
		$scope.pictureFiles.splice(loc-1,0,tempFile);
		$scope.picExists.splice(loc-1,0,tempExistance);
	}

	$scope.moveDown = function(loc) {
		var tempUrl = $scope.picUrls[loc];
		var	tempFile = $scope.pictureFiles[loc];
		var tempExistance = $scope.picExists[loc];

		$scope.picUrls.splice(loc,1);
		$scope.pictureFiles.splice(loc,1);
		$scope.picExists.splice(loc,1);
		
		$scope.picUrls.splice(loc+1,0,tempUrl);
		$scope.pictureFiles.splice(loc+1,0,tempFile);
		$scope.picExists.splice(loc+1,0,tempExistance);

	}

	$scope.deletePhoto = function(loc) {
		$scope.picUrls.splice(loc,1);
		$scope.pictureFiles.splice(loc,1);
		$scope.picExists.splice(loc,1);
	}
	
	var placeSearch, autocomplete;
	var componentForm = {
		street_number: 'long_name',
		route: 'long_name',
		locality: 'long_name',
		administrative_area_level_1: 'short_name'
	};

	function gmapinitialize() {
	  // Create the autocomplete object, restricting the search
	  // to geographical location types.
	  autocomplete = new google.maps.places.Autocomplete(
	      /** @type {HTMLInputElement} */(document.getElementById('autocomplete')),
	      { types: ['geocode'] });
	  // When the user selects an address from the dropdown,
	  // populate the address fields in the form.
	  google.maps.event.addListener(autocomplete, 'place_changed', function() {
	    fillInAddress();
	  });
	}

	function fillInAddress() {
	  // Get the place details from the autocomplete object.
	  $scope.place = autocomplete.getPlace();
	  $scope.listing.fulladdress = $scope.place.formatted_address;
	  $scope.geopoint = new Parse.GeoPoint($scope.place.geometry.location.k, $scope.place.geometry.location.D);
	  $scope.$apply();

	  // for (var component in componentForm) {
	  //   document.getElementById(component).value = '';
	  //   document.getElementById(component).disabled = false;
	  // }

	  // Get each component of the address from the place details
	  // and fill the corresponding field on the form.
	  for (var i = 0; i < $scope.place.address_components.length; i++) {
	    var addressType = $scope.place.address_components[i].types[0];
	    if (componentForm[addressType]) {
	    	if (addressType == 'route') {
		    	var addroute = $scope.place.address_components[i][componentForm[addressType]];
		    } else if (addressType == 'locality') {
		    	var addlocality = $scope.place.address_components[i][componentForm[addressType]];
		    } else if (addressType == 'administrative_area_level_1') {
		    	var addadminlone = $scope.place.address_components[i][componentForm[addressType]];
		    } else if (addressType == 'street_number') {
		    	var addhousenumber = $scope.place.address_components[i][componentForm[addressType]];
		    };
	    }
	  }
	  $scope.listing.medaddress = addhousenumber + " " + addroute + ", " + addlocality + ", " + addadminlone;
	  $scope.listing.shortaddress = addroute + ", " + addlocality + ", " + addadminlone;
	  $scope.$apply();
	}

	$scope.geolocate = function () {
	  if (navigator.geolocation) {
	    navigator.geolocation.getCurrentPosition(function(position) {
	      var geolocation = new google.maps.LatLng(
	          position.coords.latitude, position.coords.longitude);
	      var circle = new google.maps.Circle({
	        center: geolocation,
	        radius: position.coords.accuracy
	      });
	      autocomplete.setBounds(circle.getBounds());
	    });
	  }
	}

}])

.controller('AppsReviewCtrl', ['$rootScope', '$scope', '$window', '$stateParams', '$state', 'listFactory', function($rootScope, $scope, $window, $stateParams, $state, listFactory) {

	$scope.newapps = [];
	$scope.acceptapps = [];
	$scope.rejectapps = [];

	// $rootScope.currentUser.set('listnotes', false);
	// $rootScope.currentUser.save({
	// 	success: function(result) {
	// 		console.log('removed notifications');
	// 		$rootScope.listnotes = false;
	// 	},
	// 	error: function(result, error) {
	// 		console.log(error);
	// 	}
	// });

	var Listing = Parse.Object.extend("listing");
	var userquery = new Parse.Query(Parse.User);
	var query = new Parse.Query(Listing);
	var listing = $stateParams.listingId;
	query.get(listing, {
		success: function(listing) {
			$scope.listing = listing;
		    $scope.listing.listingid = listing.id;
		    var appfee = listing.get('appfee');
		    var depositfee = listing.get('depositfee');
		    var rentfee = listing.get('rentfee');
		    var otherfee = listing.get('otherfee');
		    $scope.listing.collectval = appfee + depositfee + rentfee + otherfee;
		    $scope.listing.dealflag = listing.get('dealflag');
		    $scope.listing.apps = listing.get('applications');
		    $scope.listing.appids = _.pluck($scope.listing.apps, 'id');
		    userquery.containedIn('objectId', $scope.listing.appids);
		    userquery.find({
		    	success: function(users) {
		    		$scope.users = users;
		    		var elementPos = 0;
		    		for (var i = 0; i < users.length; i++) {
		    			elementPos = $scope.listing.apps.map(function(x) {return x.id; }).indexOf(users[i].id);
		    			var tempObj = {};
		    			$scope.tempuserapp = $scope.listing.apps.filter(function (el) {
							return el.id = users[i].id;
						});
		    			if ($scope.tempuserapp[0].appstatus == 'new') {
		    				tempObj.ndx = elementPos;
		    				tempObj.dt = $scope.tempuserapp[0].modifieddt;
		    				tempObj.profile = users[i];
		    				tempObj.hunter = users[i].id;
		    				tempObj.education = users[i].get('education');
		    				tempObj.work = users[i].get('work');
		    				tempObj.age = users[i].get('age');
		    				tempObj.gender = users[i].get('gender');
		    				tempObj.picUrls = users[i].get('imgUser');
		    				tempObj.name = users[i].get('name');
		    				tempObj.email = users[i].get('email');
		    				$scope.newapps.push(tempObj);
		    			} else if ($scope.tempuserapp[0].appstatus == 'accepted') {
		    				tempObj.ndx = elementPos;
		    				tempObj.dt = $scope.tempuserapp[0].modifieddt;
		    				tempObj.profile = users[i];
		    				tempObj.hunter = users[i].id;
		    				tempObj.education = users[i].get('education');
		    				tempObj.work = users[i].get('work');
		    				tempObj.age = users[i].get('age');
		    				tempObj.gender = users[i].get('gender');
		    				tempObj.picUrls = users[i].get('imgUser');
		    				tempObj.name = users[i].get('name');
		    				tempObj.email = users[i].get('email');
		    				$scope.acceptapps.push(tempObj);
		    			} else if ($scope.tempuserapp[0].appstatus == 'rejected') {
		    				tempObj.ndx = elementPos;
		    				tempObj.dt = $scope.tempuserapp[0].modifieddt;
		    				tempObj.profile = users[i];
		    				tempObj.hunter = users[i].id;
		    				tempObj.education = users[i].get('education');
		    				tempObj.work = users[i].get('work');
		    				tempObj.age = users[i].get('age');
		    				tempObj.gender = users[i].get('gender');
		    				tempObj.picUrls = users[i].get('imgUser');
		    				tempObj.name = users[i].get('name');
		    				tempObj.email = users[i].get('email');
		    				$scope.rejectapps.push(tempObj);
		    			};
		    		};
		    	},
		    	error: function(error) {
		    		console.log(error);
		    	}
		    });
		},
		error: function(error) {
			console.log(error);
		}
	});

	function compare(a,b) {
	  if (a.dt < b.dt)
	     return -1;
	  if (a.dt > b.dt)
	    return 1;
	  return 0;
	}

	if ($scope.acceptapps) {$scope.acceptapps.sort(compare);};
	if ($scope.rejectapps) {$scope.rejectapps.sort(compare);};

	$scope.newToReject = function () {
		$scope.rejectapps.unshift($scope.newapps[0]);
		$scope.listing.apps[$scope.newapps[0].ndx].appstatus = 'rejected';
		$scope.listing.apps[$scope.newapps[0].ndx].chatstatus = false;
		$scope.listing.apps[$scope.newapps[0].ndx].modifieddt = new Date;
		$scope.newapps.splice(0,1);
		$scope.listing.newappcount = $scope.newapps.length;
		// save applications data
		$scope.listing.set('applications',$scope.listing.apps);
		$scope.listing.save({
			success: function(listing) {
			},
			error: function(listing, error) {
				console.log(error);
			}
		});
	}

	$scope.newToAccept = function () {
		$scope.acceptapps.unshift($scope.newapps[0]);
		$scope.listing.apps[$scope.newapps[0].ndx].appstatus = 'accepted';
		$scope.listing.apps[$scope.newapps[0].ndx].chatstatus = true;
		$scope.listing.apps[$scope.newapps[0].ndx].modifieddt = new Date;

		// save applications data
		$scope.listing.set('applications',$scope.listing.apps);

		$scope.listing.save({
			wait: true,
			success: function(listing) {
				// run matching function
				Parse.Cloud.run('emailAccept', {
					recname: $scope.newapps[0].name,
					recemail: $scope.newapps[0].email,
					sender: $rootScope.currentUser.get('name')
				}, {
					success: function(message) {
					},
					error: function(result, error) {
						console.log(error)
					}
				});
				var Chat = Parse.Object.extend('Chat');
				var chat = new Chat();
				chat.set('hunter', $scope.newapps[0].hunter);
				chat.set('lister', $rootScope.currentUser.id);
				chat.set('listing', $stateParams.listingId);
				chat.set('convo', []);
				chat.save({
					wait: true,
					success: function (chat) {
						console.log('chat saved');
						$scope.listing.newappcount = $scope.newapps.length;
						var userquery = new Parse.Query(Parse.User);
						userquery.get($scope.newapps[0].hunter, {
							success: function(user) {
								$scope.newapps.splice(0,1);
								user.set('appnotes', true);
								user.save(null, {
									success: function(user) {
									},
									error: function(result, error) {
										console.log(error);
									}
								})
							},
							error: function(result, error) {
								console.log(error);
							}
						})
					},
					error: function (result, error) {
						console.log(error);
						$scope.acceptapps.pop();
						$scope.listing.apps[$scope.newapps[0].ndx].appstatus = 'new';
						$scope.listing.apps[$scope.newapps[0].ndx].chatstatus = false;
					}
				})
				
			},
			error: function(listing, error) {
				console.log(error);
				$scope.acceptapps.pop();
				$scope.listing.apps[$scope.newapps[0].ndx].appstatus = 'new';
				$scope.listing.apps[$scope.newapps[0].ndx].chatstatus = false;
			}
		});
	}

	$scope.rejectToAccept = function (i) {
		$scope.acceptapps.unshift($scope.rejectapps[i]);
		$scope.listing.apps[$scope.rejectapps[i].ndx].appstatus = 'accepted';
		var tempChatStat = $scope.listing.apps[$scope.rejectapps[i].ndx].chatstatus;
		$scope.listing.apps[$scope.rejectapps[i].ndx].chatstatus = true;
		$scope.listing.apps[$scope.rejectapps[i].ndx].modifieddt = new Date;

		// save applications data
		$scope.listing.set('applications',$scope.listing.apps);
		$scope.listing.save({
			success: function(listing) {
				console.log('listing saved');
				// run matching function
				if (tempChatStat == false) {
					Parse.Cloud.run('emailAccept', {
						recname: $scope.rejectapps[i].name,
						recemail: $scope.rejectapps[i].email,
						sender: $rootScope.currentUser.get('name')
					}, {
						success: function(message) {
						},
						error: function(error) {
						}
					});
					var Chat = Parse.Object.extend('Chat');
					var chat = new Chat();
					chat.set('hunter', $scope.rejectapps[0].hunter);
					chat.set('lister', $rootScope.currentUser.id);
					chat.set('listing', $stateParams.listingId);
					chat.set('convo', []);
					chat.save({
						wait: true,
						success: function(chat) {
							var userquery = new Parse.Query(Parse.User);
							userquery.get($scope.rejectapps[0].hunter, {
								success: function(user) {
									$scope.rejectapps.splice(i,1);
									user.set('listnotes', true);
									user.save(null, {
										success: function(user) {
										},
										error: function(result, error) {
											console.log(error);
										}
									})
								},
								error: function(result, error) {
									console.log(error);
								}
							})
						},
						error: function(result, error) {
							console.log(error);
							$scope.rejectapps.pop();
							$scope.listing.apps[$scope.rejectapps[i].ndx].appstatus = 'new';
							$scope.listing.apps[$scope.rejectapps[i].ndx].chatstatus = false;
						}
					})
				} else {
					$scope.rejectapps.splice(i,1);
				};
				
			},
			error: function(listing, error) {
				console.log(error);
				$scope.rejectapps.pop();
				$scope.listing.apps[$scope.rejectapps[i].ndx].appstatus = 'new';
				$scope.listing.apps[$scope.rejectapps[i].ndx].chatstatus = false;
			}
		});
	}

	$scope.acceptToReject = function (i) {
		$scope.rejectapps.unshift($scope.acceptapps[i]);
		$scope.listing.apps[$scope.acceptapps[i].ndx].appstatus = 'rejected';
		$scope.listing.apps[$scope.acceptapps[i].ndx].modifieddt = new Date;
		$scope.acceptapps.splice(i,1);
		// save applications data

		$scope.listing.set('applications',$scope.listing.apps);
		$scope.listing.save({
			success: function(listing) {
			},
			error: function(listing, error) {
				console.log('listing save error');
				console.log(error);
			}
		});
	}

	$scope.acceptToDeal = function (i) {
		if ($scope.listing.dealflag == false) {

			$window.ga('Deal', 'click', 'collect', $scope.listing.collectval);

			$scope.listing.set('dealflag', true);
			$scope.listing.save({
				success: function(listing) {
					$state.go('deal', {});
				},
				error: function(listing, error) {
					console.log('listing save error');
					console.log(error);
				}
			});
		} else {
			$state.go('deal', {});
		};
	}

	initChat = function() {
		// notify users
	}

	$scope.openChat = function (hunter) {
		$state.go('list.listing.review.chat', { hunter: hunter });
	}




}])

