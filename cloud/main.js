require('cloud/app.js');

// These two lines are required to initialize Express in Cloud Code.
// var express = require('express');
// var app = express();

// // Global app configuration section
// app.set('views', 'cloud/views');  // Specify the folder to find templates

// app.set('view engine', 'ejs');

// app.use(express.bodyParser());    // Middleware for reading request body



// // This is an example of hooking up a request handler with a specific request
// // path and HTTP verb using the Express routing API.
// app.get('/', function(req, res) {
// 	// res.header('Content-Type', 'text/html');
// 	res.render('index');
// });

// // for angular html5mode
// app.get('/:pageCalled', function(req, res) {
//   // res.header('Content-Type', 'text/html');
//   console.log('retrieving page: ' + req.params.pageCalled);
//   res.render('index');
// });

// app.listen();



// Parse.Cloud.define('reformatImage', function(imageFile, response) {

// 	Parse.Cloud.httpRequest({
// 		url: imageFile.url(),
// 		success: function(response) {
// 		    // The file contents are in response.buffer.
// 		    var image = new Image();
// 		    return image.setData(response.buffer, {
// 		      	success: function() {

// 		        console.log("Image is " + image.width() + "x" + image.height() + ".");
// 		    	},
// 		    	error: function(error) {
// 		        // The image data was invalid.
// 		      	}
// 		    })
// 		},
// 		error: function(error) {
// 		    // The networking request failed.
// 		}
// 	});

// });



// /* 
//  * Sample Cloudinary Parse Cloud Code that uses the Cloudinary Parse Module 
//  */ 
// cloudinary = require("cloud/cloudinary");

// /* 
//    Configuration sample:
//     cloudinary.config({
//         cloud_name: 'my_cloud_name',
//         api_key: 'my_api_key',
//         api_secret: 'my_api_secret',
//     });
//  */

// /// The following lines install a beforeSave filter for the given field within the given object
// var OBJECT_NAME = "listing";
// var CLOUDINARY_IDENTIFIER_FIELD_NAME = "cloudinaryidentifier";
// /// You can either use and modify the example beforeSaveFactory in this file, or use the one from the library:
// // beforeSaveFactory(object_name, field_name);
// cloudinary.beforeSaveFactory(OBJECT_NAME, CLOUDINARY_IDENTIFIER_FIELD_NAME);

// /**
//  * The following declaration exposes a cloud code function that enables you
//  * to sign a direct-upload request from your app. 
//  * @note This function assumes no extra parameters are needed for the upload.
//  * @note This function embeds the username in the cloudinary tags field and eagerly creates a thumbnail.
//  */
// Parse.Cloud.define("sign_cloudinary_upload_request", function(request, response) {
//     if (!request.user || !request.user.authenticated()) {
//         response.error("Needs an authenticated user");
//         return;
//     }
//     response.success(
//         cloudinary.sign_upload_request({tags: request.user.getUsername(), eager: {crop: "fill", width: 150, height: 100, gravity: "face"}})
//     );
// });


// Parse.Cloud.define("sign_cloudinary_destroy_request", function(request, response) {
//     if (!request.user || !request.user.authenticated()) {
//         response.error("Needs an authenticated user");
//         return;
//     }
//     var query = new Parse.Query(OBJECT_NAME);
//     query.get(request.params.objectId, {
//       success: function(result) {
// 	    response.success(
// 	        cloudinary.sign_upload_request({public_id: result.get(CLOUDINARY_IDENTIFIER_FIELD_NAME)})
// 	    );
// });


// Parse.Cloud.define("uploadPhoto_url", function(request, response) {
//     if (!request.user || !request.user.authenticated()) {
//         response.error("Needs an authenticated user");
//         return;
//     }

//     var query = new Parse.Query(OBJECT_NAME);
//     query.get(request.params.objectId, {
//       success: function(result) {
//         response.success({
//             url: cloudinary.url(result.get(CLOUDINARY_IDENTIFIER_FIELD_NAME), {})
//         });
//       },
//       error: function() {
//         response.error("image lookup failed");
//       }
//     });
// });


// Parse.Cloud.define("deletePhoto_url", function(request, response) {
//     if (!request.user || !request.user.authenticated()) {
//         response.error("Needs an authenticated user");
//         return;
//     }

//     var query = new Parse.Query(OBJECT_NAME);
//     query.get(request.params.objectId, {
//       success: function(result) {
//         response.success({
//             url: cloudinary.url(result.get(CLOUDINARY_IDENTIFIER_FIELD_NAME), {type: "destroy"})
//         });
//       },
//       error: function() {
//         response.error("image lookup failed");
//       }
//     });
// });


// /**
//  * The following declaration exposes a cloud code function that enables you to get a 
//  * thumbnail url for Cloudinary of a the Photo entity. 
//  * Cloud-based image manipulation URLs can also be generated on the mobile apps based 
//  * on the identifier returned when uploading a object using the beforeSaveFactory above.
//  */
// Parse.Cloud.define("photo_thumbnail_url", function(request, response) {
//     if (!request.user || !request.user.authenticated()) {
//         response.error("Needs an authenticated user");
//         return;
//     }

//     var query = new Parse.Query(OBJECT_NAME);
//     query.get(request.params.objectId, {
//       success: function(result) {
//         response.success({
//             url: cloudinary.url(result.get(CLOUDINARY_IDENTIFIER_FIELD_NAME), {crop: "fill", width: 150, height: 100, gravity: "face"})
//         });
//       },
//       error: function() {
//         response.error("image lookup failed");
//       }
//     });
// });

// Parse.Cloud.define("photo_normal", function(request, response) {
//     if (!request.user || !request.user.authenticated()) {
//         response.error("Needs an authenticated user");
//         return;
//     }

//     var query = new Parse.Query(OBJECT_NAME);
//     query.get(request.params.objectId, {
//       success: function(result) {
//         response.success({
//             url: cloudinary.url(result.get(CLOUDINARY_IDENTIFIER_FIELD_NAME), {crop: "fill", width: 150, height: 100, gravity: "face"})
//         });
//       },
//       error: function() {
//         response.error("image lookup failed");
//       }
//     });
// });