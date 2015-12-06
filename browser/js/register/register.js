'use strict';

app.config(function($stateProvider){
  $stateProvider.state('register', {
    url: '/register',
    templateUrl: 'js/register/register.html',
    controller: 'RegisterCtrl'
  })
})

app.controller('RegisterCtrl', function($scope, AuthService, $state){
  $scope.credentials = {};

  $scope.register = function(userData){
    AuthService.register(userData)
      .then(function(){
        $state.go('home')
      })
  }
})