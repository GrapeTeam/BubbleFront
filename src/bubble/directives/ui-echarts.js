import angular from "angular";
import app from "../../main";
import echarts from "echarts";
import $ from "jquery";
app.directive('uiEcharts', ["bubble", function (bubble) {
    return {
        scope: {
            control: "=",
            option: "=",
            height: "@",
            width: "@",
            class: "@",
            style: "@"
        },
        template: `<div style="{{style}}" class="{{class}} pos-rlt"></div>`,
        replace: true,
        link: function (scope, element, attr) {
            element.width(scope.width);
            element.height(scope.height);
            echarts.init(element[0]).setOption(scope.option);
            scope.control.refresh = function (v) {
                element.width(scope.width);
                element.height(scope.height);
                echarts.init(element[0]).setOption(v || scope.option);
            }
        }
    };
}]);