import angular from "angular";
import $ from "jquery";

angular.module('app')
    .directive('uiToggleButton', ['$timeout', '$document', function ($timeout, $document) {
        return {
            restrict: 'AC',
            link: function (scope, el, attr) {
                var bind = function () {
                    el.find("button").unbind("click").click(function (e) {
                        $(this).addClass("active").siblings().removeClass("active");
                    });
                }
                el.bind('DOMNodeInserted', bind);
                bind();
            }
        };
    }]);