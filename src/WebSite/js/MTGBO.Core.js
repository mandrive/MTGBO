/// <reference path="./angular.min.js" />

var MtgboApp = angular.module('MtgboApp', ['ngRoute', 'ngResource']);

MtgboApp.config(['$routeProvider',
function($routeProvider) {
	$routeProvider.when('/', {
	   templateUrl : 'home.html',
		controller : 'HomeController'
    }).when('/home', {
		templateUrl : 'home.html',
		controller : 'HomeController'
	}).when('/logon', {
		templateUrl : 'logon.html',
		controller : 'LogonController'
	}).otherwise({
		redirectTo : '/logon'
	});
}]);

MtgboApp.controller('MtgboAppController', ['$scope', '$location', '$rootScope', function($scope, $location, $rootScope) { 
    $rootScope.setCurrentUser = function(user){
        $rootScope.currentUser = user;
    };
    
    $rootScope.$on('$routeChangeStart', function(scope, next, current) {
        if ($rootScope.currentUser) {
        } else {
            $location.path('/logon');
        }
    });
    
    $scope.isUserLogged = function()
    {
        if($rootScope.currentUser) return true;
        return false;
    }
    
    $rootScope.loadAllCards = function() {
        $.getJSON('data/AllSets.json', function(data) {         
            $rootScope.allSets = data;
            $rootScope.allCards = [];
            for(var set in data) {
                $rootScope.allCards = $rootScope.allCards.concat(data[set].cards);
            }
        });
    }
    
    $rootScope.loadAllCards();
}]);

MtgboApp.controller('LogonController', ['$scope', '$rootScope', '$location', 'AuthService', function($scope, $rootScope, $location, AuthService) {
  $scope.credentials = {
    username: '',
    password: ''
  };

  $scope.login = function (credentials) {
      if (credentials.username && credentials.password)
      {
        // mock only
        if (credentials.username == "test" && credentials.password == "test")
        {
            $rootScope.setCurrentUser(credentials);
            $location.path('/home');
        }
      }
  };
}]);

MtgboApp.controller('HomeController', ['$scope', '$rootScope', function($scope, $rootScope) {
    /*$scope.addNewEventWindow = initializeDialogs();
    $rootScope.fullCalendar = $('#calendar').data("fullCalendar").getCalendar();
    var addEvent = function() {
        $rootScope.fullCalendar.addEventSource([{title: 'event2', start: '2014-07-29'}]);
    };
    
    var bindDayClickEvent = function() {
        $rootScope.fullCalendar.options.dayClick = function() {$scope.addNewEventWindow.dialog("open");}
    };
    
    addEvent();
    bindDayClickEvent();*/
}]);

MtgboApp.factory('AuthService', function() {
    this.login = function(credentials) {
    }
});

function initializeDialogs() {
var dialog = $( "#eventForm" ).dialog({
      autoOpen: false,
      height: 300,
      width: 350,
      modal: true,
      buttons: {
        "Add new event": function() { return true; },
        Cancel: function() {
          dialog.dialog( "close" );
        }
      },
      close: function() {
        //form[ 0 ].reset();
        //allFields.removeClass( "ui-state-error" );
      }
    });
    return dialog;
}