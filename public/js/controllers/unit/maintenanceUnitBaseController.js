'use strict';
bubbleFrame.register('maintenanceUnitBaseController', function ($scope, bubble) {
    var tmpInfo = {};
    $scope.info = {};

    var initInfo = function () {
        $scope.info = JSON.parse(JSON.stringify(tmpInfo));
        delete $scope.info._id;
    };

    bubble._call("maintenanceUnit.page", 1, 100).success(function (v) {
        tmpInfo = v.data[0];
        initInfo();
    });

    $scope.review = function () {
        initInfo();
    };

    $scope.confirm = function (e) {
        $(e.currentTarget).addClass("data-loading");
        $scope.info.companyURL = bubble.replaceBase64($scope.info.companyURL);
        bubble._call("maintenanceUnit.update", tmpInfo._id, $scope.info).success(function (v) {
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
    };

    $scope.sel = "123";

    //初始化数据
    bubble._call("siteGroup.page", 1, 1000).success(function (v) {
        v = v.data;
        $scope.gropuList = bubble.getTreeData(v, "wbgid", true);
    });
});