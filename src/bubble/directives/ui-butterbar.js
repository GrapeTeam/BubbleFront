import angular from "angular";
import $ from "jquery";
import app from "../../main";

app.directive('uiButterbar', ['$rootScope', '$anchorScroll', function ($rootScope, $anchorScroll) {
    return {
        restrict: 'AC',
        template: '<span class="bar"></span>',
        link: function (scope, el, attrs) {
            el.addClass('butterbar hide');
            scope.$on('$stateChangeStart', function (event) {
                $anchorScroll();
                el.removeClass('hide').addClass('active');
            });
            scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState) {
                event.targetScope.$watch('$viewContentLoaded', function () {
                    el.addClass('hide').removeClass('active');
                })
            });
        }
    };
}]);