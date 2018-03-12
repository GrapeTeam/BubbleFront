import angular from "angular";
import app from "../../main";
import $ from "jquery";
var swal = window.swal;

app.directive('minScroll', ['bubble', function (bubble) {
    return {
        restrict: 'A',
        link: function (scope, el, attr) {
            el.mCustomScrollbar({
                setHeight: attr.minScroll ? attr.minScroll : $(window).height() - (attr.offsetHeight ? attr.offsetHeight : 0),
                theme: "minimal-dark",
                scrollInertia: 500
            });
        }
    }
}]);