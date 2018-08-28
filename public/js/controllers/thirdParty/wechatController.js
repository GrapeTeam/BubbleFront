'use strict';
bubbleFrame.register('wechatController', function ($scope, bubble) {
    var box = $(".application-wrap");
    var infoBox = box.find(".info-box");
    var tab = 0;
    var platid = "";
    $scope.ins = [];
    $scope.colors = ["bg-primary lter", "bg-info", "bg-success dk", "bg-warning dk", "bg-danger lter", "bg-primary dk"];
    $scope.tableControl = {
        title: [{name: "实例", key: "sl", width: 30}],
        html: ['<a class="btn btn-sm m-t-n-xs"><i class="fa fa-navicon"></i></a>'],
        onClick: function (key, v) {
            showIns(v);
        },
        addFn: function (v, cb) {
            delete v.wbid;
            bubble._call("wechat.add", v).success(cb);
        }
    };

    $scope.tableControl1 = {
        addFn: function (v, cb) {
            delete v.wbid;
            v.configstring = JSON.stringify(v.configstring);
            bubble._call("wechatUser.add", v).success(cb);
        }
    };

    var showIns = function (rs) {
        $scope.currentApp = rs;
        $scope.users = true;
        $scope.ssid = rs._id;
        // bubble._call("wechatUser.pageBy", 1, 1000, { platid: rs.id }).success(function (v) {
        //     for (var i = 0; i < v.data.length; i++) {
        //         var t = v.data[i];
        //         t.configstring = JSON.parse(t.configstring);
        //     }
        //     $scope.users = v.data;
        //     platid = rs.id;
        // });
    };

    $scope.deleteIns = function (v, idx) {
        swal({
            title: "确定要删除该项吗?",
            text: "该项会被立即删除并无法撤销该操作",
            icon: "warning",
            buttons: {
                cancel: "取消",
                defeat: "删除",
            },
        }).then(
            function (s) {
                if (s) {
                    bubble._call("wechatUser.delete", v.id)
                        .success(function (x) {
                            if (x.errorcode) {
                                swal("删除失败");
                                return;
                            }
                            $scope.users.splice(idx, 1);
                        });
                }
            });
    };

    $scope.tabChange = function () {
        tab === 0 ? infoBox.show() : infoBox.hide();
        box.css("transform", "translateX(" + (tab === 0 ? "-50%" : "0") + ")").css("overflow-y", tab === 0 ? "hidden" : "auto");
        tab = tab === 0 ? 1 : 0;
        $scope.users = [];
    };

    $scope.create = function () {
        bubble.customModal("wechatCreateModal.html", "wechatCreateController", "lg", {platid: platid}, function (v) {
            $scope.users.push(v);
        });
    };

    $scope.edit = function (type, v, i) {
        bubble.customModal("wechatEditModal.html", "wechatEditController", "lg", v, function (v) {
            if (typeof v === 'object' && v !== null) {
                for (var tmp in v) {
                    $scope.users[i][tmp] = v[tmp];
                }
            }
        })
    }
});

bubbleFrame.register('wechatCreateController', function ($scope, $modalInstance, items, bubble) {
    $scope.value = {};
    $scope.ok = function (e) {
        $(e.currentTarget).addClass("data-loading");
        $scope.value.platid = items.platid;
        bubble._call("wechatUser.add", JSON.stringify($scope.value))
            .success(function (v) {
                if (v.errorcode) {
                    swal(v.data);
                    return;
                }
                $modalInstance.close(v.message ? v.message : v);
                swal("添加成功");
            });
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

bubbleFrame.register('wechatEditController', function ($scope, $modalInstance, items, bubble) {
    var tmp = JSON.parse(JSON.stringify(items));
    $scope.value = {configstring: {}};
    $scope.value.name = tmp.name;
    $scope.value.configstring = tmp.configstring;
    $scope.ok = function (e) {
        $(e.currentTarget).addClass("data-loading");
        bubble._call("wechatUser.update", items.id, $scope.value)
            .success(function (v) {
                if (v.errorcode) {
                    swal(v.data);
                    $modalInstance.close();
                    return;
                }
                $modalInstance.close($scope.value);
                swal("修改成功");
            });
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});