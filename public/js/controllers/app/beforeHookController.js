bubbleFrame.register('beforeHookController', function ($scope, bubble, $timeout, $compile) {
    $scope.tableControl = {
        title: [{ name: "编辑", key: "bj", width: 100 },
        ],
        html: ['<a class="btn btn-sm m-t-n-xs"><i class="fa fa-edit"></i></a>'

        ],
        onClick: function (key, v) {
            var id = v.appid;
            var f = v.Callback;
            var c = v.callback;
            var n = v.name;
            bubble.customModal("editAll.html", "editAllController", "lg", v, function (rs) {
                console.log(rs)
                bubble._call('filter.update',v.id,bubble.replaceBase64(JSON.stringify(rs)),0).success(function (data) {
                    if (data.errorcode == 0) {
                        $scope.tableControl.reload();
                        swal('更新成功')
                    } else {
                        v.appid = id;
                        v.callback = c;
                        v.Callback = f;
                        v.name = n;
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
                fn(rs)

            })
        },
        onPage: function (v) {
            bubble._call('app.page', 1, 10000).success(function (rs) {
                $scope.app = rs.data;
                for (var i = 0; i < v.length; i++) {
                    for (var j = 0; j < $scope.app.length; j++) {
                        if (Number(v[i].appid) == $scope.app[j].id) {
                            v[i].name = $scope.app[j].desp
                            break;
                            
                        } else {
                            v[i].name = '非法app'
                        }
                    }
                }
            })
        },
        onColumnClick: function (k, v, i) {
            var name = v[k];
            var id = v.appid
            if (k == 'name') {
                bubble.customModal("editApp.html", "editAppController", "lg", v, function (rs) {
                    console.log(rs)
                    bubble._call('filter.update', v.id, bubble.replaceBase64(JSON.stringify(rs)), 0).success(function (data) {
                        if (data.errorcode == 0) {
                            swal('更新成功')
                            $scope.tableControl.reload();
                        } else {
                            v.appid = id;
                            v[k] = name;
                            swal('更新失败')
                        }
                    })
                });
            } else if(k=='ctime'){
                return false;
            }else if(k=='callback'){
                bubble.customModal("editCallback.html", "editCallbackController", "lg", { key: k, value: v }, function (rs) {
                    console.log(rs)
                    bubble._call('filter.update', v.id, bubble.replaceBase64(JSON.stringify(rs)), 0).success(function (data1) {
                        if (data1.errorcode == 0) {
                            swal('更新成功')
                            $scope.tableControl.reload();
                        } else {
                            v.appid = id;
                            v[k] = name;
                            swal('更新失败')
                        }
                    })
                });
            }else{
                bubble.customModal("editfilter.html", "editfilterController", "lg", { key: k, value: v }, function (rs) {
                    console.log(rs)
                    bubble._call('filter.update', v.id, bubble.replaceBase64(JSON.stringify(rs)), 0).success(function (data1) {
                        if (data1.errorcode == 0) {
                            swal('更新成功')
                            $scope.tableControl.reload();
                        } else {
                            v.appid = id;
                            v[k] = name;
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
    $scope.value = { 
        appid:items.appid 
    }
    $scope.ok = function () {
        if (!$scope.value) {
            swal("请输入app名称");
            return;
        }
        $modalInstance.close($scope.value);
    }

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    }
});
bubbleFrame.register('editCallbackController', function ($scope, bubble, $timeout, items, $modalInstance) {
    $scope.attr = items.key;
    $scope.value = {
        callback:items.value[$scope.attr]
    }
    $scope.ok = function () {
        if (!$scope.value) {
            swal("请输入app名称");
            return;
        }
        $modalInstance.close($scope.value);
    }

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    }
});
bubbleFrame.register('editfilterController', function ($scope, bubble, $timeout, items, $modalInstance) {
    $scope.attr = items.key;
    $scope.value = {
        filter:items.value[$scope.attr]
    }
    $scope.ok = function () {
        if (!$scope.value) {
            swal("请输入app名称");
            return;
        }
        $modalInstance.close($scope.value);
    }

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    }
});
bubbleFrame.register('editAllController', function ($scope, bubble, $timeout, items, $modalInstance) {
    $scope.value = {
        callback:items.callback,
        appid:items.appid,
        filter:items.filter
    };
    $scope.ok = function () {
        if (!$scope.value) {
            swal("请输入app名称");
            return;
        }
        $modalInstance.close($scope.value);
    }

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    }
});