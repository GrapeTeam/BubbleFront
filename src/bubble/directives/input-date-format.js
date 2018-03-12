import angular from "angular";
import $ from "jquery";

angular.module('app')
    .directive('dateFormat', function () {
        return {
            restrict: 'AC',
            link: function (scope, el, attr, ctrl) {
                el.val(new Date(el.val()).Format("yyyy-MM-dd hh:mm:ss"));
            }
        };
    });