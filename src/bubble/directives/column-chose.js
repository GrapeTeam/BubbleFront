import angular from "angular";
import app from "../../main";
import $ from "jquery";

app.directive('columnChosen', function () {
    return {
        restrict: 'AE',
        scope: {
            value: "@"
        },
        replace: true,
        template: "",
        controller: ["$scope", "bubble", "$compile", function ($scope, bubble, $compile) {

        }]
    }
});