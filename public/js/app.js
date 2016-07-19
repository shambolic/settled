"use strict";

angular.module('settledUsers', []).
controller('settledUsersController', ['$scope', '$http',
  function($scope, $http) {
    // initialise
    $scope.users = [];
    $scope.form = {
      id: -1,
      username: "",
      firstName : "",
      lastName : "",
      email: ""
    }
    // get all users
    _refreshPage();
    // ADD USER
    $scope.addUser = function() {
      var method = "";
      var appURL ="";
      var created = new Date().toISOString();
      console.log(created);
      $scope.form.createdAt = created;
      $scope.form.status = "Inactive";
      if ($scope.form.id == -1){  // check for new user
        method = "POST";
        appURL = "http://localhost:3001/users";
      } else {
        method = "PUT";
        appURL = "http://localhost:3001/users/" + $scope.form.id
      }
      // console.log(appURL + " " + $scope.form) 
      $http({
        method: method,
        url: appURL,
        data: angular.toJson($scope.form),
        headers: {
          'Content-Type': 'application/json'
        } // handle success and errors.
      }).then(function successCallback(response) {
        console.log("successful post");
        _refreshPage();
        _clearForm();
      }, function errorCallback(response) {
        console.log(response.data);
        _refreshPage();
        _clearForm();
      });
    }; // end of Post
    
    $scope.removeUser = function(user) {
      $http({
        method: 'DELETE',
        url: "http://localhost:3001/users/" + user._id
      }).then(function successCallback(response) {
        $scope.status = response.status;
        console.log($scope.status);
         _refreshPage();
      }, function errorCallback(response) {
        console.log(response.status);
      });
      _clearForm();
    } // end of Remove
    $scope.editUser = function(user){  // simply populates form with existing data for editing
      $scope.form.username = user.username;
      $scope.form.firstName = user.firstName;
      $scope.form.lastName = user.lastName; 
      $scope.form.email = user.email;
      $scope.form.id = user._id;
      console.log(user._id); 
    }
    
    // local functions 
    function _refreshPage() {
      $http({
        method: 'GET',
        url: "http://localhost:3001/users"
      }).then(function successCallback(response) {
        $scope.status = response.status;
        $scope.users = response.data;
        console.log($scope.users);
      }, function errorCallback(response) {
        console.log(response.status);
      });
    }

    function _clearForm() {
      $scope.users = [];
      $scope.form = {
        id: -1,
        username: "",
        firstName: "",
        lastName: "",
        email: ""
      }
    }


  }
]); //close controller
