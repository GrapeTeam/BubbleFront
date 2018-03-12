bubbleFrame.register('reportAdminController', function ($scope, bubble) {
    $scope.Info = { phone: "", time: "" };
    $scope.list = ["天", "小时"];
    $scope.type = "天";
    $scope.messageText = "";
    $scope.messageColor = "danger";

    bubble._call("reportAdmin.queryService").success(function (v) {
        if (v.errorcode == 1) {
            $scope.messageColor = "danger";
            $scope.messageText = "未启动";
        } else {
            $scope.messageColor = "success";
            $scope.messageText = "已启动";
        }
    });

    $scope.click = function (v) {
        $scope.type = v;
    };

    $scope.start = function () {
        $scope.messageColor = "danger";
        $scope.messageText = "处理中...";
        bubble._call("reportAdmin.startService").success(function (v) {
            if (!v.errorcode) {
                $scope.messageText = "已启动";
                $scope.messageColor = "success";
            } else {
                $scope.messageText = "未启动";
                swal("操作失败");
            }
        });
    };

    $scope.stop = function () {
        $scope.messageColor = "success";
        $scope.messageText = "处理中...";
        bubble._call("reportAdmin.stopService").success(function (v) {
            if (!v.errorcode) {
                $scope.messageText = "未启动";
                $scope.messageColor = "danger";
            } else {
                $scope.messageText = "已启动";
                swal("操作失败");
            }
        });
    };

    $scope.tableControl = {
        title: [{ name: "接收短信状态", key: "gk", width: 120 }],
        html: ['<span class="text-danger">不接受短信</span>'],
        onClick: function (key, v, i, e) {
            if ($(e.currentTarget).html() == "处理中...") {
                return;
            }
            $(e.currentTarget).html("处理中...");
            if (v.state == 0) {
                bubble._call("reportAdmin.enable", v._id).success(function (rs) {
                    if (rs.errorcode) {
                        swal("操作失败");
                    } else {
                        v.state = 1;
                        swal("操作成功");
                    }
                });
            } else {
                bubble._call("reportAdmin.disable", v._id).success(function (rs) {
                    if (rs.errorcode) {
                        swal("操作失败");
                    } else {
                        v.state = 0;
                        swal("操作成功");
                    }
                });
            }
        },
        onRender: function (v, k) {
            v[0] = '<span class=' + (k.state == 0 ? "text-danger" : "text-success") + '>' + (k.state == 0 ? "不接受短信" : "接受短信") + '</span>';
            return v;
        }
    };
});