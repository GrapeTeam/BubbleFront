'use strict';
bubbleFrame.register('maintenanceUnitInfoController', function ($scope, bubble) {
    var tmpInfo = {};
    $scope.info = {};

    var initInfo = function () {
        $scope.info = JSON.parse(JSON.stringify(tmpInfo));
        delete $scope.info._id;
    };

    bubble._call("maintenanceInfo.page", 1, 100).success(function (v) {
        tmpInfo = v.data[0];
        initInfo();
    });

    $scope.review = function () {
        initInfo();
    };

    $scope.confirm = function (e) {
        $(e.currentTarget).addClass("data-loading");
        bubble._call("maintenanceInfo.update", tmpInfo._id, $scope.info).success(function (v) {
            if (!v.errorcode) {
                var id = tmpInfo._id;
                tmpInfo = $scope.info;
                tmpInfo._id = id;
                initInfo();
                $(e.currentTarget).removeClass("data-loading");
                swal("修改成功");
            } else {
                swal("修改失败");
            }
        });
    }
});