import angular from "angular";
import app from "../../main";
import $ from "jquery";

app.directive('datetimepicker', function () {
    return {
        restrict: 'AE',
        scope: {
            format: "@",
            time: "=",
            value: "=",
            minDate: '=',
            maxDate: '=',
        },
        replace: true,
        template: '<input type="text" class="form-control timepicker">',
        link: function (scope, el, attr) {
            var init = function (v) {
                var option = {
                    format: scope.format ? scope.format : "Y-m-d H:i",
                    step: 10,
                    value: new Date(!isNaN(v) ? parseInt(v) : v).Format("yyyy-MM-dd hh:mm"),
                    timepicker: scope.time == false ? false : true,
                    closeOnDateSelect: true,
                    onChangeDateTime: function (v) {
                        scope.value = Date.parse(v);
                        !scope.$$phase && scope.$apply();
                    }
                };
                scope.minDate && (option.minDate = scope.minDate);
                scope.maxDate && (option.maxDate = scope.maxDate);
                el.datetimepicker(option);
            }
            scope.$watch("value", function (v) {
                init(v);
            });
            init(scope.value);
            scope.$watch("minDate", function (v) {
                el.datetimepicker({
                    minDate: v
                });
            });
            scope.$watch("maxDate", function (v) {
                el.datetimepicker({
                    maxDate: v
                });
            });
        }
    }
});