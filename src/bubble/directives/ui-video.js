import angular from "angular";
import $ from "jquery";
import app from "../../main";

app.directive('uiVideo', ['$timeout', function ($timeout) {
    return {
        restrict: 'AE',
        template: '<div id="video"><div id="videoa1"></div><div>123123</div></div>',
        replace: true,
        scope: {
            url: "=",
            rotate: "=",
            type: "@",
            width: "@",
            height: "@",
        },
        controller: ["$scope", function ($scope) {
            var init = function () {
                var flashvars = {
                    f: $scope.url ? $scope.url : '',
                    c: 0,
                    b: 1,
                };

                var params = { bgcolor: '#FFF', allowFullScreen: true, allowScriptAccess: 'always' };
                window.CKobject.embedSWF('./js/modules/ckplayer/ckplayer.swf', 'videoa1', 'ckplayer_a1', '600', '400', flashvars, params);

                var video = [$scope.url.replace(/\\/g, "/") + '->' + $scope.type];
                var support = ['iPad', 'iPhone', 'ios', 'android+false', 'msie10+false', 'webKit'];
                window.CKobject.embedHTML5('video', 'ckplayer_a1', $scope.width, $scope.height, video, flashvars, support);
            }
            init();
            $scope.$watch("rotate", function (v) {
                $("#video").css({ transform: "rotate(" + v + "deg)" });
            });
            // $scope.open = function () {
            //     if (!$scope.url) {
            //         window.swal("视频地址错误,请与我们联系");
            //         return;
            //     }
            //     $("body").append(`<div class="popup-video-box"></div>`);
            //     $("body .popup-video-box").fadeIn(200).click(function (e) {
            //         if (this === e.currentTarget) {
            //             $(this).remove();
            //         }
            //     });
            //     init();
            // }
        }]
    };
}]);