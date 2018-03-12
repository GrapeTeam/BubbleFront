import angular from "angular";
import app from "../../main";
import $ from "jquery";
var Swiper = window.Swiper;

app.directive('uiSwiper', ['$http', 'bubble', '$compile', '$timeout', function ($http, bubble, $compile, $timeout) {
    return {
        restrict: 'AE',
        scope: {
            config: "=",
        },
        replace: true,
        template: `<div class="ui-swiper-box">
                        <div class="view">
                            <div class='swiper-container'>
                                <div class='swiper-wrapper'>
                                    <div class='swiper-slide' ng-class="{'min':config.type == 2}" ng-repeat="item in config.data">
                                        <a target="_blank" href="{{item.url ? item.url : ''}}">
                                            <img src="{{item.img}}" width="100%" height="100%"/>
                                            <div style="position:absolute;bottom:0;left:0;height:30px;line-height:30px;padding:0 10px;width: 100%;color: #fff;background: rgba(0, 0, 0, 0.5);">{{item.text}}</div>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="nav-view" ng-show="config.type == 1 || config.type == 0">
                            <a class="arrow-left" href=""><i class="fa fa-angle-left"></i></a>
                            <a class="arrow-right" href=""><i class="fa fa-angle-right"></i></a>
                            <div class="swiper-container">
                                <div class="swiper-wrapper">
                                    <div class="swiper-slide {{item.active ? 'active-nav' : ''}}" ng-repeat="item in config.data">
                                        <img src="{{item.img}}">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`,
        link: function ($scope, element, attr) {
            var swiper1 = null;
            var swiper2 = null;
            var type = $scope.config.type;
            $scope.config.data[0].active = true;

            function updateNavPosition(v) {
                $scope.config.data.forEach(function (x) {
                    x.active = false;
                });
                $scope.config.data[v] && ($scope.config.data[v].active = true);
                bubble.updateScope($scope);
            }

            $scope.$watch("config", function (n, o) {
                if (n.data.length != o.data.length) {
                    n.data[0].active = true;
                }
            }, true);

            var initSwiper = function () {
                swiper1 = new window.Swiper('.ui-swiper-box .view .swiper-container', {
                    onSlideChangeStart: function (v) {
                        updateNavPosition(v.activeIndex)
                    },
                    autoplay: 1000,
                    observer: true
                });
                if (type == 0 || type == 1) {
                    swiper2 = new window.Swiper('.ui-swiper-box .nav-view .swiper-container', {
                        onlyExternal: true,
                        visibilityFullFit: true,
                        slidesPerView: 'auto',
                        autoplay: 1000,
                        onTap: function (v) {
                            swiper1.slideTo(v.clickedIndex);
                        },
                        observer: true
                    });
                    element.find(".arrow-left").click(function () {
                        swiper1.activeIndex > 0 && swiper1.slideTo(swiper1.activeIndex - 1);
                        swiper2.activeIndex > 0 && swiper2.slideTo(swiper2.activeIndex - 1);
                    });
                    element.find(".arrow-right").click(function () {
                        swiper1.activeIndex < $scope.config.data.length - 1 && swiper1.slideTo(swiper1.activeIndex + 1);
                        swiper2.activeIndex < $scope.config.data.length - 1 && swiper2.slideTo(swiper2.activeIndex + 1);
                    });
                }
            }

            $timeout(initSwiper);
        }
    }
}]);