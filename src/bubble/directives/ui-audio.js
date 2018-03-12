import angular from "angular";
import $ from "jquery";
import app from "../../main";
import audiojs from "../modules/audiojs/audio.min";

app.directive('uiAudio', ['$timeout', function ($timeout) {
    return {
        restrict: 'AE',
        template: `<audio src=""></audio>`,
        replace: true,
        scope: {
            url: "=",
            type: "@",
            style: "@",
            class: "@"
        },
        link: function ($scope, ele, attr) {
            $scope.open = function () {
                if (!$scope.url) {
                    window.swal("音频地址错误,请与我们联系");
                    return;
                }
                $("body").append(`<div class="popup-video-box"></div>`);
                $("body .popup-video-box").fadeIn(200).click(function (e) {
                    if (this === e.currentTarget) {
                        $(this).remove();
                    }
                });
            }
            var p = $(ele.parent());
            p.find("audio").attr("src", $scope.url.replace(/\\/g, "/"));
            audiojs.events.ready(function () {
                var as = audiojs.createAll();
            });
            var o = p.find("audio").parent();
            if ($scope.style) {
                var list = $scope.style.split(";")
                for (var i = 0; i < list.length; i++) {
                    o.css(list[i].split(":")[0], list[i].split(":")[1]);
                }
            }
        }
    };
}]);