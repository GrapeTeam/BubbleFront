import angular from "angular";
import $ from "jquery";
import app from "../../main";

app.directive('uiBubbleModal', ['$timeout', function ($timeout) {
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        template: `<div class="popup-wrap-box" ng-click="close($event)">
                        <div class="popup-box">
                            <div class="popup-header wrapper b-b">
                                <h2 class="m-n">
                                    {{name}}
                                    <a class="pull-right btn btn-sm btn-default m-r-sm ng-binding" ng-click="close()">关闭</a>
                                    <a class="pull-right btn btn-sm btn-info m-r-sm ng-binding" ng-click="confirm()">确定</a>
                                </h2>
                            </div>
                            <div class="popup-content-wrap">
                                <div class="popup-content" ng-transclude></div>
                            </div>
                        </div>
                    </div>`,
        scope: {
            show: "=",
            name: "@",
            confirm: "=",
        },
        link: function ($scope, ele, attr) {
            $scope.$watch("show", function (v) {
                if (!!v) {
                    ele.fadeIn(150);
                } else {
                    ele.fadeOut(150);
                }
            });

            $scope.close = function (e) {
                if (!e) {
                    $scope.show = false;
                    return;
                }
                if (e.target === e.currentTarget)
                    $scope.show = false;
            }
        }
    };
}]);