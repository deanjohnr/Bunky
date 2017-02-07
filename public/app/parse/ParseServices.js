angular.module('ParseServices', [])
.factory('ParseSDK', function() {

  // pro-tip: swap these keys out for PROD keys automatically on deploy using grunt-replace
  Parse.initialize(KEYS GO HERE);

  // FACEBOOK init
  window.fbPromise.then(function() {

    Parse.FacebookUtils.init({ // this line replaces FB.init({
        appId      : 'APP ID HERE', // Facebook App ID
        // status     : true,  // check Facebook Login status
        cookie     : true,  // enable cookies to allow Parse to access the session
        xfbml      : true,  // initialize Facebook social plugins on the page
        version    : 'v2.3' // point to the latest Facebook Graph API version
      });

  });

});