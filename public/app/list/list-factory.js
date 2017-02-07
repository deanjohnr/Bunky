angular.module('list.roommi')

.factory('listFactory', function($q) {

	updatePhotos = function (listing, files, picExists, user) {
		return $q(function(resolve, reject) {
    		setTimeout(function() {
				var i = 0;
				console.log(i);
				photoSaveLoop(i, listing, files, picExists, user);
			}, 1000);
    	});
	};

	photoSaveLoop = function(ix, listingx, filesx, picExistsx, userx) {
		// return $q(function(resolve, reject) {
  //   		setTimeout(function() {
				var i = ix;
				var listing = listingx;
				var files = filesx;
				var picExists = picExistsx;
				var user = userx;
				console.log(i);
				console.log(picExists);
				if (!picExists[i]) {
					parseFile = new Parse.File(files[i].name,files[i]);
					console.log(parseFile);
					// Parse.Cloud.run('reformatImage', { file: parseFile }, {
					// 	success: function(imageFile) {
					parseFile.save().then(function() {
						console.log('parse file saved');
						listing.set("photo"+i.toString(), parseFile);
						picExists[i] = true;
						console.log(i == files.length-1);
						console.log(files.length-1);
						if (i == files.length-1) {
							console.log('in final save');
							listing.save(null, {
								success: function(listing) {
									console.log('listing saved');
									resolve(listing);
									if (!user.get("listing")) {
										console.log('in user saving listing id')
										user.set("listing", listing.id);
										user.save(null, {
											success: function(user) {
												console.log('saved user');
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
					console.log('photo array set');
					if (i == files.length-1) {
						listing.save(null, {
							success: function(listing) {
								console.log("listing saved: " + listing.id);
								resolve(listing);
							},
							error: function(error) {
								console.log("Error saving listing: " + error);
								console.log(error);
								return
							}
						});
					} else {
						i++;
						photoSaveLoop(i, listing, files, picExists, user);
					};
				}
		// 	}, 1000);
		// });
		
	};

	saveMarker = function(geopoint, listingId) {

		var marker = new Parse.Object.extend('marker');

		marker.set('marker', { 
			idKey: listingId,
			coords: { latitude: geopoint.lat, longitude: geopoint.lng }
		});
		marker.set('isActive', true);
        // icon='{expression}'
        // click='{expression}'
        // options='{expression}'
        // events='{expression}'
        // control='{expression}'

        marker.save(null, {
        	success: function(marker) {
        		console.log("marker saved: " + marker.id);
        	},
        	error: function(error) {
        		console.log("error saving marker");
        	}
        });

	}

})