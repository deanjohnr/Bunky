angular.module('list.roommi')

.controller('ListingChatCtrl', ['$rootScope', '$scope', '$stateParams', function($rootScope, $scope, $stateParams) {

	$scope.chatlisting = $stateParams.listingId;
	$scope.chathunter = $stateParams.hunter;
	//$scope.chatname = $scope.acceptapps[$stateParams.dex].name;
	$scope.d = new Date();
	$scope.fulldate = moment().format('MMMM Do, h:mm a');
	$scope.today = moment().format('MM/dd/YY');
	$scope.now = moment().format('h:mm a');

	var UserQ = new Parse.Query(Parse.User);
	UserQ.get($scope.chathunter, {
		success: function(res) {
			$scope.chatname = res.get('name');
		},
		error: function (res, error) {
			console.log(error);
		}
	});

	var Chat = Parse.Object.extend('Chat');
	var chatquery = new Parse.Query(Chat);
	chatquery.equalTo('listing', $stateParams.listingId);
	console.log($stateParams.listingId);
	chatquery.equalTo('hunter', $stateParams.hunter);
	console.log($stateParams.hunter);
	chatquery.first({
		success: function(chat) {
			console.log(chat);
			$scope.chat = chat;
			$scope.convo = chat.get('convo');
			console.log($scope.convo);
		},
		error: function(result, error) {
			console.log(error);
		}
	});

	$scope.send = function() {

		$scope.d = new Date();
		$scope.fulldate = moment().format('MMMM Do, h:mm a');
		$scope.today = moment().format('MM/dd/YY');
		$scope.now = moment().format('h:mm a');
		$scope.sendername = $rootScope.currentUser.get('name');

		var message = {
			sender: $scope.chatlisting,
			content: $scope.sendInput,
			date: $scope.d,
			fulltime: $scope.fulldate,
			day: $scope.today,
			shorttime: $scope.now
		};

		$scope.chat.addUnique('convo', message);
		console.log($scope.chat);
		$scope.chat.save({
			wait: true,
			success: function(chat) {
				console.log('message sent');
				$scope.convo.push(message);
				$scope.sendInput = '';
				var userquery = new Parse.Query(Parse.User);
				userquery.get($stateParams.hunter, {
					success: function(user) {
						user.set('appnotes', true);
						$scope.chathuntertemp = user.get('name');
						$scope.chathunteremail = user.get('email');
						user.save(null, {
							success: function(user) {
								console.log('user notifcation added');
								Parse.Cloud.run('emailMessage', { 
									content: message.content,
									recname: $scope.chathuntertemp,
									recemail: $scope.chathunteremail,
									sender: $scope.sendername
								}, {
									success: function(message) {
										console.log('message sent');
									},
									error: function(error) {
									}
								});
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
			}
		});

	};

}])