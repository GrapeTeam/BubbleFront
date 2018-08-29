bubbleFrame.register('interfaceController', function ($scope, bubble, $modal, $http) {
    $scope.interfaceList = "";
    $scope.tmpClass = "";
    $scope.pageMode = "List";

    var initCurrent = function (v) {
        $scope.currentClass = v;
        $scope.tmpClass = JSON.parse(JSON.stringify(v));
        $scope.tablePar = {appclsid: v.id};
    };

    $scope.classClick = function (v) {
        for (var i = 0; i < $scope.classList.length; i++) {
            $scope.classList[i].selected = false;
        }
        v.selected = true;
        initCurrent(v);

    };

    bubble._call("appClass.page", 1, 1000).success(function (v) {
        $scope.classList = v.data;
    });

    $scope.deleteClass = function (v, idx) {
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
                    bubble._call("appClass.delete", v.id)
                        .success(function (x) {
                            if (x.errorcode) {
                                swal("删除失败");
                                return;
                            }
                            $scope.classList.splice(idx, 1);
                            $scope.classList[0].selected = true;
                            initCurrent($scope.classList[0]);
                        });
                }
            });
    };

    $scope.openEdit = function (v) {
        bubble.openModal("edit", "", {
            value: v.classname,
            id: v.id,
            functionName: "appClass.update",
            key: "classname"
        }, function (rs) {
            v.classname = rs;
        });
    };

    $scope.classEdit = function (e) {
        $(e.currentTarget).addClass("data-loading").attr("disabled", "disabled");
        bubble._call("appClass.update", $scope.currentClass.id, {
            classname: $scope.currentClass.classname,
            sid: $scope.currentClass.sid
        }).success(function (v) {
            if (v.errorcode) {
                swal("修改失败");
                $scope.currentClass.classname = tmpClass.classname;
                $scope.currentClass.sid = tmpClass.sid;
            }
            $(e.currentTarget).removeClass("data-loading").removeAttr("disabled");
        })
    };

    $scope.createClass = function () {
        bubble.customModal("classCreate.html", "classCreateController", "lg", {scope: $scope}, function (v) {
            v
        });
    }
});

bubbleFrame.register("classCreateController", function (bubble, items, $scope, $modalInstance) {
    $scope.value = {};

    $scope.ok = function (e) {
        $(e.currentTarget).addClass("data-loading");
        bubble._call("appClass.add", $scope.value).success(function (v) {
            if (v.errorcode) {
                swal("添加失败");
                $modalInstance.dismiss('cancel');
            } else {
                $modalInstance.close(v.message);
            }
        })
    };

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});