import angular from "angular";
import $ from "jquery";
import app from "../../main";
angular.module('app')
    .directive('uiScrollLoad', ['$location', '$anchorScroll', function ($location, $anchorScroll) {
        return {
            restrict: 'AE',
            scope: {
                control: "="
            },
            link: function (scope, el, attr) {
                el.on('scroll', function (e) {
                    var ht = $(e.currentTarget).height();
                    var s = $(e.currentTarget).scrollTop();
                    var o = attr.uiScrollLoad ? el.find(attr.uiScrollLoad) : el;
                    var h = o.height();
                    if (s + ht > h - 40) {
                        scope.control && scope.control.onload && scope.control.onload();
                    }
                });
            }
        };
    }]);