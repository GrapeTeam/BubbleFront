import angular from "angular";
import swal from "./bubble/modules/sweetalert/sweetalert.min.js";

var app = angular.module('app', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngTouch',
    'ngStorage',
    'ngSanitize',
    'ui.router',
    'ui.bootstrap',
    'ui.load',
    'ui.calendar',
    'ui.jq',
    'ui.validate',
    'oc.lazyLoad',
]);

app.constant('JQ_CONFIG', {
    easyPieChart: ['./js/jquery/charts/easypiechart/jquery.easy-pie-chart.js'],
    sparkline: ['./js/jquery/charts/sparkline/jquery.sparkline.min.js'],
    plot: ['./js/jquery/charts/flot/jquery.flot.min.js',
        './js/jquery/charts/flot/jquery.flot.resize.js',
        './js/jquery/charts/flot/jquery.flot.tooltip.min.js',
        './js/jquery/charts/flot/jquery.flot.spline.js',
        './js/jquery/charts/flot/jquery.flot.orderBars.js',
        './js/jquery/charts/flot/jquery.flot.pie.min.js'],
    slimScroll: ['./js/jquery/slimscroll/jquery.slimscroll.min.js'],
    sortable: ['./js/jquery/sortable/jquery.sortable.js'],
    nestable: ['./js/jquery/nestable/jquery.nestable.js',
        './js/jquery/nestable/nestable.css'],
    filestyle: ['./js/jquery/file/bootstrap-filestyle.min.js'],
    slider: ['./js/jquery/slider/bootstrap-slider.js',
        './js/jquery/slider/slider.css'],
    chosen: [],
    TouchSpin: ['./js/jquery/spinner/jquery.bootstrap-touchspin.min.js',
        './js/jquery/spinner/jquery.bootstrap-touchspin.css'],
    wysiwyg: ['./js/jquery/wysiwyg/bootstrap-wysiwyg.js',
        './js/jquery/wysiwyg/jquery.hotkeys.js'],
    dataTable: ['./js/jquery/datatables/jquery.dataTables.min.js',
        './js/jquery/datatables/dataTables.bootstrap.js',
        './js/jquery/datatables/dataTables.bootstrap.css'],
    vectorMap: ['./js/jquery/jvectormap/jquery-jvectormap.min.js',
        './js/jquery/jvectormap/jquery-jvectormap-world-mill-en.js',
        './js/jquery/jvectormap/jquery-jvectormap-us-aea-en.js',
        './js/jquery/jvectormap/jquery-jvectormap.css'],
    footable: ['./js/jquery/footable/footable.all.min.js',
        './js/jquery/footable/footable.core.css']
})
export default app;