angular.module('roommi').
  factory('roommiUser', function() {
 
    var User = Parse.User.extend({
 
      getApplications : function() {
        // return the applications array from user
        return this.get("applications");
      }
 
    }, {
      // Class methods
    });
 
    return User;
  });