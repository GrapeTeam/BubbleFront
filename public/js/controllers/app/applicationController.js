bubbleFrame.register('applicationController', function ($scope, bubble, $modal, $http, $stateParams, $timeout) {
    var box = $(".application-wrap");
    var infoBox = box.find(".info-box");
    var tab = 0;
    $scope.ins = [];
    $scope.colors = ["bg-primary lter", "bg-info", "bg-success dk", "bg-warning dk", "bg-danger lter", "bg-primary dk"];
    $scope.tableControl = {
        title: [{name: "实例", key: "sl", width: 30}],
        html: ['<a class="btn btn-sm m-t-n-xs"><i class="fa fa-navicon"></i></a>'],
        onClick: function (key, v) {
            showIns(v);
        }
    };

    $timeout(function () {
        $(".grid-box").height($(".info-box").height() - 102);
    });

    var initMasonry = function () {
        box.find(".grid-box").masonry({
            columnWidth: 340,
            itemSelector: '.grid-item'
        });
    };

    var initInsData = function () {
        $scope.ins.map(function (v) {
            v.ctime = new Date(v.ctime).Format("yyyy-MM-dd hh:mm:ss");
            v.configName = JSON.parse(v.configName);
            v.state = 0;
        });
    };

    var showIns = function (v) {
        $scope.currentApp = v;
        $scope.ins = [];
        bubble._call("ins.pageBy", 1, 1000, [{"field": "sysid", "logic": "==", "value": v.id}]).success(function (v) {
            $scope.ins = v.data;
            initInsData();
        });
        bubble._call("service.page", 1, 1000).success(function (v) {
            $scope.service = v.data;
        });
        $scope.tabChange();
    };

    $scope.tabChange = function () {
        tab === 0 ? infoBox.show() : infoBox.hide();
        box.css("transform", "translateX(" + (tab === 0 ? "-50%" : "0") + ")").css("overflow-y", tab === 0 ? "hidden" : "auto");
        tab = tab === 0 ? 1 : 0;
    };

    $scope.addIns = function (v) {
        var insList = $scope.ins;
        for (var i = 0; i < insList.length; i++) {
            if (insList[i].sid == v.id) {
                swal("已存在该服务实例,不可重复添加");
                return;
            }
        }
        bubble._call("ins.add", {
            sid: v.id,
            configName: {db: "", cache: "", other: ""},
            sysid: $scope.currentApp.id
        }).success(function (v) {
            if (!v.errorcode) {
                $scope.ins.push(v);
                initInsData();
            } else
                swal("添加失败");
        });

    };

    $scope.deleteIns = function (v, idx) {
        swal({
                title: "确定要删除该项吗?",
                text: "该项会被立即删除并无法撤销该操作",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "删除",
                cancelButtonText: "取消",
            },
            function () {
                bubble._call("ins.delete", v.id)
                    .success(function (x) {
                        if (x.errorcode) {
                            swal("删除失败");
                            return;
                        }
                        $scope.ins.splice(idx, 1);
                    });
            });
    };

    $scope.editConfig = function (v) {
        if (v.state == 1) {
            return;
        }
        var field = {
            "db": {
                "data": "s:",
                "mark": "数据库配置"
            },
            "cache": {
                "data": "s:",
                "mark": "缓存配置"
            },
            "other": {
                "data": "array-s:",
                "mark": "其他配置"
            }
        };
        bubble.openModal("jsonedit", "", {
            target: v.configName,
            field: field
        }, function (rs) {
            v.state = 1;
            bubble._call("ins.update", v.id, {configName: rs}).success(function (x) {
                if (!x.errorcode) {
                    v.configName = rs;
                } else {
                    swal("配置修改失败..");
                }
                v.state = 0;
            })
        })
    };

    infoBox.hide();
});