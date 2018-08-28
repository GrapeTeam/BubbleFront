'use strict';
bubbleFrame.register('templateController', function ($scope, bubble) {
    // $scope.tableControl = {
    //     title: [{ name: "详情", key: "sl", width: 30 }],
    //     html: ['<a class="btn btn-sm m-t-n-xs"><i class="fa fa-navicon"></i></a>'],
    //     onClick: function (key, v) {
    //         showTemp(v);
    //     }
    // }

    $scope.tablePar = {tid: ""};

    var showTemp = function (v) {
        $(".temp-wrap-box").fadeIn(200);
        $scope.tablePar.tid = v._id;
    };

    $scope.closeTemp = function (v) {
        $(".temp-wrap-box").fadeOut(200);
    };

    $scope.close = function (e) {
        e.target === e.currentTarget && $(e.target).fadeOut(200);
    }
});