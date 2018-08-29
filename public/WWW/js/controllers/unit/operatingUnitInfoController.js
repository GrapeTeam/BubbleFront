'use strict';
bubbleFrame.register('operatingUnitInfoController', function ($scope, bubble) {
    var tmpInfo = {};
    $scope.siteInfo = {};

    var initInfo = function () {
        $scope.siteInfo = JSON.parse(JSON.stringify(tmpInfo));
        delete $scope.siteInfo._id;
    };

    bubble._call("organ.page", 1, 100).success(function (v) {
        tmpInfo = v.data[0];
        initInfo();
    });

    $scope.review = function () {
        initInfo();
    };

    $scope.confirm = function (e) {
        $(e.currentTarget).addClass("data-loading");
        bubble._call("organ.update", tmpInfo._id, $scope.siteInfo).success(function (v) {
            if (!v.errorcode) {
                var id = tmpInfo._id;
                tmpInfo = $scope.siteInfo;
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