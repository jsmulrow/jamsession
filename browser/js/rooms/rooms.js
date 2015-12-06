app.config(function ($stateProvider) {

    // Register our *about* state.
    $stateProvider.state('rooms', {
        url: '/rooms',
        controller: 'RoomsController',
        templateUrl: 'js/rooms/rooms.html'
    });

});

app.controller('RoomsController', function ($scope) {


});