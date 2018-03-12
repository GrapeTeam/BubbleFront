import angular from "angular";
import app from "../../main";
var $ = window.$;

app.directive('uiImg', ['$http', 'bubble', function ($http, bubble) {
    return {
        restrict: 'AE',
        scope: {

        },
        link: function (scope, element, attr) {
            var pos = function () {
                var w = attr.uiWidth;
                var h = attr.uiHeight;
                if (attr.scale == "false") {
                    $(this).css({ height: h + "px", width: h + "px" });
                } else {
                    if (this.naturalHeight == 0 || $(this).parent(".ui-img-wrap").length) {
                        element[0].onload = function () {
                            var hn = this.naturalHeight;
                            var wn = this.naturalWidth;
                            $(this).css({ position: "relative", top: "-" + (hn > h ? (hn - h) / 2 : 0) + "px", left: "-" + (wn > w ? (wn - w) / 2 : 0) + "px" });
                        }.bind(this)
                    }
                }
            }

            if (attr.uiImg == "popup") {
                element.unbind("click").click(function () {
                    var deg = 0;
                    var img = $(`<img class="hover-rotate none" src="${attr.src}" />`);
                    var box = $(`<div class="popup-img-box animated fadeIn"><div class="imgpopup-closebtn"><i class="glyphicon glyphicon-remove"></i></div></div>`);
                    box.append(img);
                    $("body").append(box);
                    box.find(".hover-rotate").viewer({
                        url: "src",
                        navbar: false
                    }).viewer("show");
                    box.find(".imgpopup-closebtn").unbind("click").click(function(){

                    });
                    box.click(function (e) {
                        if (e.target === e.currentTarget || $(e.target).hasClass("imgpopup-closebtn") || $(e.target).hasClass("glyphicon")) {
                            $(this).addClass("fadeOut");
                            setTimeout(function () {
                                $("body .popup-img-box").remove();
                            }, 200);
                        }
                    });
                });
            }
            pos.call(element[0]);
        }
    };
}]);