/// <reference path="./angular.min.js" />

var MtgboApp = angular.module('MtgboApp', ['ngRoute', 'ngResource', 'ui.bootstrap'])

.config(['$routeProvider',
function ($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'home.html',
            controller: 'HomeController'
        }).when('/home', {
            templateUrl: 'home.html',
            controller: 'HomeController'
        }).when('/logon', {
            templateUrl: 'logon.html',
            controller: 'LogonController'
        }).otherwise({
            redirectTo: '/logon'
        });
}])

.controller('MtgboAppController', ['$scope', '$location', '$rootScope',
    function ($scope, $location, $rootScope) {
        $rootScope.setCurrentUser = function (user) {
            $rootScope.currentUser = user;
        };

        /*$rootScope.$on('$routeChangeStart', function(scope, next, current) {
        if ($rootScope.currentUser) {
        } else {
            $location.path('/logon');
        }
    });*/

        $scope.isUserLogged = function () {
            if ($rootScope.currentUser) return true;
            return false;
        }
}])

.controller('LogonController', ['$scope', '$rootScope', '$location', 'AuthService',
    function ($scope, $rootScope, $location, AuthService) {
        $scope.credentials = {
            username: '',
            password: ''
        };

        $scope.login = function (credentials) {
            if (credentials.username && credentials.password) {
                // mock only
                if (credentials.username == "test" && credentials.password == "test") {
                    $rootScope.setCurrentUser(credentials);
                    $location.path('/home');
                }
            }
        };
}])

.controller('HomeController', ['$scope', '$rootScope', 'CardsService',
    function ($scope, $rootScope, CardsService) {

        // pagination
        $scope.pageChanged = function () {
            $scope.prepareCardsSample();
        };

        $scope.allSets = null;
        $scope.allCards = [];
        $scope.cardsPart = [];
        $scope.itemsPerPage = 10;
        $scope.currentPage = 1;
        $scope.deckCards = [];
        $scope.currentCard = null;

        $scope.showEditDeckTitle = function () {
            angular.element('.deck-title').hide();
            angular.element('.edit-deck-title-form').show();
        };

        $scope.changeDeckTitle = function (deckTitle) {
            if (deckTitle) {
                angular.element('.deck-title').text(deckTitle);
            } else {
                angular.element('.deck-title').text("Deck");
            }
            $scope.cancelEditionDeckTitle();
        };

        $scope.cancelEditionDeckTitle = function () {
            angular.element('.deck-title').show();
            angular.element('.edit-deck-title-form').hide();
        };

        $scope.filterAllCards = function (input) {
            $scope.allCardsFiltered = $scope.allCards.filter(function (element) {
                return element.name.toLowerCase().indexOf(input.toLowerCase()) > -1;
            });
        };
        
        $scope.removeCardFromDeck = function (index) {
            $scope.deckCards[index].count--;
            if (!$scope.deckCards[index].count)
                $scope.deckCards.splice(index, 1);
        }

        $scope.prepareCardsSample = function () {
            var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
            var end = begin + $scope.itemsPerPage;
            $scope.cardsPart = $scope.allCardsFiltered.slice(begin, end);
        };

        var cardsPromise = CardsService.getCards();
        cardsPromise.then(function (data) {
            $scope.allSets = data;
            $scope.allCards = [];
            for (var set in data) {
                $scope.allCards = $scope.allCards.concat(data[set].cards);
                $scope.allCardsFiltered = $scope.allCards;
            }
            $scope.prepareCardsSample();
        });

        $scope.$watch('searchCardName', function (term) {
            // Create $scope.filtered and then calculat $scope.noOfPages, no racing!
            $scope.filterAllCards(term); // $scope.filtered = filterFilter($scope.list, term);
            //$scope.noOfPages = Math.ceil($scope.filtered.length/$scope.entryLimit);
            $scope.prepareCardsSample();
        });

        $scope.showCardInfo = function (index) {
            $scope.currentCard = $scope.cardsPart[index];
        }
}])

.service('CardsService', function ($http, $q) {
    var deferred = $q.defer();
    $.getJSON('data/AllSets.json', function (data) {
        var i = 0;
        i++;
        deferred.resolve(data);
    });
    this.getCards = function () {
        return deferred.promise;
    };
})

.factory('AuthService', function () {
    this.login = function (credentials) {}
})

.directive('carddraggable', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.draggable({
                revert: false,
                helper: function () {
                    var helper = $(this).clone(); // Untested - I create my helper using other means...
                    // jquery.ui.sortable will override width of class unless we set the style explicitly.
                    helper.css({'width': '200px'});
                    return helper;
                }
            });
        }
    };
})

.directive('decksortable', function ($compile) {
    return {
        restrict: 'A',
        link: function (scope, element, sttrs) {
            element.sortable({});
        }
    };
})

.directive('deckdroppable', function ($compile) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            //This makes an element Droppable
            element.droppable({
                hoverClass: 'deck-over',
                drop: function (event, ui) {
                    var dragIndex = ui.draggable.index(),
                        dragEl = angular.element(ui.draggable).parent(),
                        dropEl = angular.element(this);

                    if (dragEl.hasClass('cardsList') && !dropEl.children().hasClass('deckCardsList')) {
                        var existingCard = scope.deckCards.filter(function (elem) {
                            return elem === scope.cardsPart[dragIndex];
                        });
                        if (existingCard.length > 0) {
                            var index = scope.deckCards.indexOf(existingCard[0]);
                            scope.deckCards[index].count++;
                        } else {
                            scope.deckCards = scope.deckCards.concat(scope.cardsPart[dragIndex]);
                            _.last(scope.deckCards).count = 1
                        }
                    }
                    scope.$apply();
                }
            });
        }
    };
});

function initializeDialogs() {
    var dialog = $("#eventForm").dialog({
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true,
        buttons: {
            "Add new event": function () {
                return true;
            },
            Cancel: function () {
                dialog.dialog("close");
            }
        },
        close: function () {}
    });
    return dialog;
}