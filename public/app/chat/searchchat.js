angular.module('search.roommi')

.controller('SearchChatCtrl', ['$rootScope', '$scope', '$stateParams', function($rootScope, $scope, $stateParams) {

	$scope.chatlisting = $stateParams.listingId;
	$scope.chathunter = $rootScope.currentUser.id;
	//$scope.chatname = $scope.listings[$stateParams.dex].lister.name;
	$scope.d = new Date();
	$scope.fulldate = moment().format('MMMM Do, h:mm a');
	$scope.today = moment().format('MM/dd/YY');
	$scope.now = moment().format('h:mm a');

	var UserQ = new Parse.Query(Parse.User);
	UserQ.equalTo('listing',$scope.chatlisting)
	UserQ.first({
		success: function(res) {
			$scope.chatname = res.get('name');
		},
		error: function (res, error) {
			console.log(error);
		}
	});

	var Chat = Parse.Object.extend('Chat');
	var chatquery = new Parse.Query(Chat);
	chatquery.equalTo('listing', $scope.chatlisting);
	console.log($scope.chatlisting);
	chatquery.equalTo('hunter', $scope.chathunter);
	console.log($scope.chathunter);
	chatquery.first({
		success: function(chat) {
			console.log(chat);
			$scope.chat = chat;
			$scope.convo = chat.get('convo');
			// var chatheight = document.getElementById("chatwindow");
			// $("#chatwindow").scrollTop(chatheight);
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
			sender: $scope.chathunter,
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
				console.log($scope.chatlisting);
				userquery.equalTo('listing',$scope.chatlisting);
				userquery.first({
					success: function(user) {
						$scope.chatlistername = user.get('name');
						$scope.chatlisteremail = user.get('email');
						user.set('listnotes', true);
						user.save(null, {
							success: function(user) {
								console.log('user notifcation added');
								Parse.Cloud.run('emailMessage', { 
									content: message.content,
									recname: $scope.chatlistername,
									recemail: $scope.chatlisteremail,
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