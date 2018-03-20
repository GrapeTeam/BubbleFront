bubbleFrame.register('beforeHookController', function ($scope, bubble, $timeout, $compile) {
    $scope.tableControl = {
        title: [{ name: "编辑", key: "bj", width: 100 },
        ],
        html: ['<a class="btn btn-sm m-t-n-xs"><i class="fa fa-edit"></i></a>'

    ],
        onClick: function (key, v) {
            var id = v.appid;
            var f = v.fiter;
            var c = v.callback;
            var n = v.name;
            bubble.customModal("editAll.html", "editAllController", "lg", v, function (rs) {
                bubble._call('filter.update', rs.id, rs, 0).success(function (data) {
                    if (data.errorcode == 0) {
                        swal('更新成功')
                    }else{
                        console.log(v)
                        v.appid = id;
                        v.callback = c;
                        v.filter = f;
                        v.name = n;
                        console.log(v)
                        swal('更新失败')
                    }
                })
            })
        },
        deleteFn: function (v, fn) {
            //在这里写删除代码，删除后调用fn回掉，有问题再找我
            //其他的hook钩子函数类似
            //特征码$scope.control && $scope.control.xxxFn
            bubble._call('filter.delete', v, 0).success(function (rs) {


            })
        },
        onPage: function (v) {
            console.log(v)
            for (var i = 0; i < v.length; i++) {
                if (!v[i].name) {
                    v[i].name = '非法app'
                }
            }
            console.log(v)
        },
        onColumnClick: function (k, v, i) {
            var name = v[k];
            var id = v.appid
            if (k == 'name') {
                bubble.customModal("editApp.html", "editAppController", "lg", v, function (rs) {
                    bubble._call('filter.update', rs.id, rs, 0).success(function (data) {
                        if (data.errorcode == 0) {
                            swal('更新成功')
                        }else{
                            v.appid = id;
                            v[k] = name;
                            console.log(v)
                            swal('更新失败')
                        }
                    })
                });
            }else{
                bubble.customModal("editFilter.html", "editFilterController", "lg", {key:k,value:v}, function (rs) {
                    bubble._call('filter.update', rs.id, rs, 0).success(function (data1) {
                        if (data1.errorcode == 0) {
                            swal('更新成功')
                        }else{
                            v.appid = id;
                            v[k] = name;
                            console.log(v)
                            swal('更新失败')
                        }
                    })
                });
            }
            //返回false通知插件由程序接管，后续工作停止

        }
    }
})
bubbleFrame.register('editAppController', function ($scope, bubble, $timeout, items, $modalInstance) {
    $scope.value = items
    $scope.ok = function () {
        if (!$scope.value) {
            swal("请输入app名称");
            return;
        }
        var text = $(".ng-valid select").find("option:selected").text();
        $scope.value.name = text;
        $modalInstance.close($scope.value);
    }

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    }
});
bubbleFrame.register('editFilterController', function ($scope, bubble, $timeout, items, $modalInstance) {
    $scope.attr = items.key;
    $scope.value = items.value[$scope.attr]
    $scope.ok = function () {
        if (!$scope.value) {
            swal("请输入app名称");
            return;
        }
        items.value[$scope.attr] = $scope.value;

        console.log(items)
        $modalInstance.close(items.value);
    }

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    }
});
bubbleFrame.register('editAllController', function ($scope, bubble, $timeout, items, $modalInstance) {
$scope.value = items;
console.log(items)
console.log($scope.value)
    $scope.ok = function () {
        if (!$scope.value) {
            swal("请输入app名称");
            return;
        }
        var text = $(".ng-valid select").find("option:selected").text();
        console.log(text)
        $scope.value.name = text;
        $modalInstance.close($scope.value);
    }

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    }
});