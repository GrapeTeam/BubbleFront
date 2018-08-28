bubbleFrame.register('reportAdminController', function ($scope, bubble, $modal, $http, $stateParams, $timeout) {
    var id = "58d21d100d428914848a58e7";
    var tmpInfo = {};
    $scope.Info = {phone: "", time: ""};
    $scope.list = ["天", "小时"];
    $scope.type = "天";

    $scope.click = function (v) {
        $scope.type = v;
    };
    // bubble._call("report.timerSendCount", { day: id }).success(function (v) {
    //     $scope.siteInfo = JSON.parse(JSON.stringify(v[0]));
    //     tmpInfo = JSON.parse(JSON.stringify(v[0]));
    // });

    $scope.confirm = function (e) {
        if (JSON.stringify($scope.siteInfo) === JSON.stringify(tmpInfo) || $(e.currentTarget).hasClass("data-loading")) {
            return;
        }
        $(e.currentTarget).addClass("data-loading");
        bubble._call("site.update", id, $scope.siteInfo).success(function (v) {
            v.errorcode ? swal(v.message) : swal("修改成功");
            $(e.currentTarget).removeClass("data-loading");
        });
    };

    $scope.review = function () {
        if (tmpInfo)
            $scope.siteInfo = JSON.parse(JSON.stringify(tmpInfo));
    }
});