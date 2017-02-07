app.service('loginModal', function ($modal, $rootScope) {

  function assignCurrentUser (user) {
    $rootScope.currentUser = user;
    return user;
  }

  return function() {
    var instance = $modal.open({
      templateUrl: 'partials/login-modal.html',
      controller: 'FbookCtrl',
      controllerAs: 'FbookCtrl'
    })

    return instance.result.then(assignCurrentUser);
  };

});