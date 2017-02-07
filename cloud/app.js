
// These two lines are required to initialize Express in Cloud Code.
var express = require('express');
var app = express();

var parseAdaptor = require('cloud/prerender-parse.js');

app.use(require('cloud/prerenderio.js').setAdaptor(parseAdaptor(Parse)).set('prerenderToken','TOKEN HERE'));

// Global app configuration section
app.set('views', 'cloud/views');  // Specify the folder to find templates
app.set('view engine', 'ejs');    // Set the template engine
app.use(express.bodyParser());    // Middleware for reading request body

app.get('/', function(req, res) {
  res.render('index');
});

// for angular html5mode
app.get('/:pageCalled', function(req, res) {
  // res.header('Content-Type', 'text/html');
  console.log('retrieving page: ' + req.params.pageCalled);
  res.render('index');
});

var Mandrill = require('mandrill');
Mandrill.initialize('MANDRILL KEY');

// Chat Notifcation
Parse.Cloud.define('emailMessage', function(request, response) {
    var message = request.params;

	Mandrill.sendTemplate({
		template_name: "message-received",
	    template_content: [],
		message: {
			subject: message.sender + " sent you a message",
			from_email: "no-reply@bunky.com",
			from_name: "Bunky",
			to: [
			  {
			    email: message.recemail,
			    name: message.recname
			  }
			],
			track_opens: true,
        	track_clicks: true,
        	view_content_link: true,
        	global_merge_vars: [
		        {
		            name: "address",
		            content: "Hi " + message.recname + ","
		        },
		        {
		        	name: "sender",
		        	content: message.sender
		        },
		        {
		            name: "main",
		            content: message.content
		        }
		    ]
		},
		async: true
		},{
		success: function(httpResponse) {
			console.log(httpResponse);
			response.success("Email sent!");
		},
		error: function(httpResponse) {
			console.error(httpResponse);
			response.error("Uh oh, something went wrong");
		}
	});
});

// Accepted Application Notifcation
Parse.Cloud.define('emailAccept', function(request, response) {
    var message = request.params;

	Mandrill.sendTemplate({
		template_name: "accept-application-notification",
	    template_content: [],
		message: {
			subject: message.sender + " accepted your application",
			from_email: "no-reply@bunky.com",
			from_name: "Bunky",
			to: [
			  {
			    email: message.recemail,
			    name: message.recname
			  }
			],
			track_opens: true,
        	track_clicks: true,
        	view_content_link: true,
        	global_merge_vars: [
		        {
		            name: "receiver",
		            content: message.recname
		        },
		        {
		        	name: "sender",
		        	content: message.sender
		        }
		    ]
		},
		async: true
		},{
		success: function(httpResponse) {
			console.log(httpResponse);
			response.success("Email sent!");
		},
		error: function(httpResponse) {
			console.error(httpResponse);
			response.error("Uh oh, something went wrong");
		}
	});
});

// New Application Notifcation
Parse.Cloud.define('emailNewApp', function(request, response) {
    var message = request.params;

	Mandrill.sendTemplate({
		template_name: "new-application-notification",
	    template_content: [],
		message: {
			subject: message.sender + " applied to your listing",
			from_email: "no-reply@bunky.com",
			from_name: "Bunky",
			to: [
			  {
			    email: message.recemail,
			    name: message.recname
			  }
			],
			track_opens: true,
        	track_clicks: true,
        	view_content_link: true,
        	global_merge_vars: [
		        {
		            name: "receiver",
		            content: message.recname
		        },
		        {
		        	name: "sender",
		        	content: message.sender
		        }
		    ]
		},
		async: true
		},{
		success: function(httpResponse) {
			console.log(httpResponse);
			response.success("Email sent!");
		},
		error: function(httpResponse) {
			console.error(httpResponse);
			response.error("Uh oh, something went wrong");
		}
	});
});

// Cloud Code Functions
Parse.Cloud.job("listingCleanup", function(request, status) {
  
	var Listing = Parse.Object.extend('listing');
	var listingquery = new Parse.Query(Listing);
	listingquery.equalTo('isActive', true);
	var expiredt = new Date();
	var warndt = new Date();
	warndt.setDate(warndt.getDate() - 6);
	listingquery.lessThan('refreshdt', warndt);
	listingquery.find({
		success: function(listings) {
			for (var i = 0; i < listings.length; i++) {
				var refdt = listings[i].get('refreshdt');
				if (refdt < expiredt) {
					listings[i].set('isActive',false);
				} else {
					var useremail = listings[i].get('email');
					var listowner = listings[i].get('ownerId');
					var listaddress = listings[i].get('fulladdress');
					Mandrill.sendTemplate({
						template_name: "expire-warning",
					    template_content: [],
						message: {
							subject: "Listing Expiration",
							from_email: "no-reply@bunky.com",
							from_name: "Bunky",
							to: [
							    {
							    	email: useremail
							    }
							],
							track_opens: true,
				        	track_clicks: true,
				        	view_content_link: true,
				        	global_merge_vars: [
						        {
						            name: "address",
						            content: listaddress
						        },
						        {
						        	name: "listlink",
						        	content: 'https://www.bunky.co/#!/list/' + listowner
						        }
						    ]
						},
						async: true
						},{
						success: function(httpResponse) {
							console.log(httpResponse);
							response.success("Email sent!");
						},
						error: function(httpResponse) {
							console.error(httpResponse);
							response.error("Uh oh, something went wrong");
						}
					});
				};
				
			};
			Parse.Object.saveAll(listings, {
				success: function(listings) {
					status.success('listing cleanup complete');
				},
				error: function(result, error) {
					status.error(error);
				}
			})
		},
		error: function(result, error) {
			status.error(error);
		}
	})
});

// Attach the Express app to Cloud Code.
app.listen();
