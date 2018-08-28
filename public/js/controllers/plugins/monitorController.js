bubbleFrame.register('monitorController', function ($scope, bubble, $timeout) {
    $scope.par = null;
    $scope.tableControl = {
        onColumnClick: function (key, v) {
            if (key == "state") {
                var s = v.state == 1 ? 0 : 1;
                $scope.tableControl.loading(true);
                bubble._call("api.update", v._id, bubble.replaceBase64(JSON.stringify({state: s}))).success(function (rs) {
                    $scope.tableControl.loading(false);
                    if (!rs.errorcode) {
                        v.state = s;
                    } else {
                        swal("修改失败");
                    }
                });
            } else if (key == "host") {
                bubble.customModal("monitorInfoModal.html", "monitorInfoController", "lg", v, function (v) {

                });
            }
        },
        editFn: function (v, fn) {
            v.state = parseInt(v.state);
            bubble._call("api.update", v._id, v).success(function (v) {
                fn(v);
            });
        },
        addFn: function (v, fn) {
            v.state = parseInt(v.state);
            bubble._call("api.add", v).success(function (v) {
                fn(v);
            });
        }
    }
});

bubbleFrame.register('monitorInfoController', function ($scope, bubble, $timeout, items, $modalInstance) {
    $scope.list = items.host.split(",");

    $scope.addItem = function () {
        $scope.list.push("");
    };

    $scope.removeItem = function (v, i) {
        if ($scope.list.length == 1) {
            $scope.list[0] = "";
            return;
        }
        $scope.list.splice(i, 1);
    };

    $scope.ok = function (e) {
        var tmp = JSON.parse(JSON.stringify($scope.list));
        for (var i = 0; i < tmp.length; i++) {
            if (tmp[i] == "") {
                tmp.splice(i, 1);
                i--;
            }
        }
        if (tmp.length == 0) {
            swal("请至少输入一个主机地址!");
            return;
        }
        bubble._call("api.update", items._id, bubble.replaceBase64(JSON.stringify({host: tmp.join(",")}))).success(function (v) {
            if (v.errorcode) {
                swal("修改失败");
            } else {
                items.host = tmp.join(",");
                $modalInstance.close(v);
            }
        });
    };

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});