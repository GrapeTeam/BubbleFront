import $ from "jquery";
import app from "../../main";
var swal = window.swal;

app.controller('modalJsonEditController', ["$scope", "$modalInstance", "items", "bubble", function ($scope, $modalInstance, items, bubble) {
    $scope.configjsonlist = JSON.parse(JSON.stringify(items.target));        //深复制原json
    $scope.field = items.field;
    $scope.jsonReturn = function (v) {

    }

    $scope.ok = function () {
        items.target
        $scope.configjsonlist
        $scope.list
        $modalInstance.close($scope.configjsonlist);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);
/**
 * 名称编辑弹窗
 */
app.controller('modalEditController', ["$scope", "$modalInstance", "items", "bubble", function ($scope, $modalInstance, items, bubble) {
    $scope.textchange = function () {
        $scope.value = this.value;
    }
    if (!(items.value !== undefined && items.key && !bubble.isEmpty(items.id))) {
        console.info("编辑弹窗参数错误,当前数据不存在该字段");
    }
    if (items.field) {
        var tvalue = {};
        var tfield = {};
        tvalue[items.key] = items.value;
        tfield[items.key] = items.field;
        $scope.value = tvalue;
        $scope.field = tfield;
    } else {
        $scope.value = items.value;
    }
    $scope.mode = !!items.field;

    $scope.ok = function (e) {
        var p = {};
        if ($scope.error) {
            return;
        }

        $(e.currentTarget).addClass("data-loading");

        var cb = function (v) {
            if (items.field && items.field.data && items.field.data.split(":")[0] == "date") {
                $scope.value[items.key] = Date.parse(new Date($scope.value[items.key])) + "";
            }
            if (items.field.data && items.field.data.indexOf("json") >= 0 && typeof items.value === 'string') {
                $scope.value[items.key] = JSON.stringify($scope.value[items.key]);
            }
            $modalInstance.close(v && v.errorcode ? items.value : (items.field ? $scope.value[items.key] : $scope.value));
            v && v.errorcode && swal(v.message);
        }

        if (items.value != $scope.value[items.key] && items.functionName) {
            p[items.key] = items.field ? $scope.value[items.key] : $scope.value;
            if (items.field.data && items.field.data.indexOf("json") >= 0 && typeof items.value === 'string') {
                p[items.key] = JSON.stringify(p[items.key]);
            }
            if (items.hook) {
                items.hook(items.id, p, cb);
            } else {
                bubble._call(items.functionName, items.id, p).success(cb);
            }
        } else {
            $modalInstance.close($scope.value);
        }
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);
/**
 * 表格显示项编辑弹窗
 */
app.controller('modalVisibleItemController', ["$scope", "$modalInstance", "items", "bubble", function ($scope, $modalInstance, items, bubble) {
    $scope.items = JSON.parse(JSON.stringify(items.visibleItem));
    if (!items.data || !items.visibleItem) {
        throw new Error("显示项配置器参数错误!");
    }

    for (var tmp in $scope.items) {
        if (!$scope.items[tmp].data) {
            delete $scope.items[tmp];
            continue;
        }
    }

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);
/**
 * 表格显示项编辑弹窗
 */
app.controller('modalDeleteItemController', ["$scope", "$modalInstance", "items", "bubble", function ($scope, $modalInstance, items, bubble) {
    $scope.name = items.names.join(" , ");
    $scope.name = !$scope.name ? items.ids.join(" , ") : $scope.name
    var ids = items.ids;

    var cb = function (v) {
        $modalInstance.close(v);
    }

    $scope.ok = function () {
        if (items.hook) {
            items.hook(ids.join(","), cb);
        } else {
            bubble._call(items.functionName, ids.join(",")).success(cb)
        }
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);
/**
 * 表格内容编辑弹窗
 */
app.controller('tableEditController', ["$scope", "$modalInstance", "items", "bubble", function ($scope, $modalInstance, items, bubble) {
    $scope.json = JSON.parse(JSON.stringify(items.value));
    $scope.visible = items.visible;
    if (!items.visible) {
        throw new Error("表格编辑器参数错误!");
    }

    for (var tmp in items.visible) {
        if (items.visible[tmp].data && items.visible[tmp].data.indexOf("date") >= 0) {
            $scope.json[tmp] = isNaN(parseInt($scope.json[tmp])) ? $scope.json[tmp] : new Date(parseInt($scope.json[tmp])).Format("yyyy-MM-dd hh:mm:ss");
        }
    }

    var getVisibleObject = function () {
        var v = {};

        for (var tmp in $scope.visible) {
            v[tmp] = $scope.json[tmp];
        }

        return v;
    }

    var cacheValue = getVisibleObject();
    $scope.value = getVisibleObject();

    $scope.textchange = function () {
        if (items.field && !items.field($scope.value)) {
            $scope.error = true;
        } else
            $scope.error = false;
    }

    var cb = function (v) {
        for (var tmp in items.visible) {
            if (items.visible[tmp].data && items.visible[tmp].data.indexOf("date") >= 0) {
                $scope.value[tmp] = Date.parse(new Date($scope.value[tmp]));
            }
            if (items.visible[tmp].data && items.visible[tmp].data.indexOf("json") >= 0 && typeof items.value[tmp] === 'string') {
                $scope.value[tmp] = JSON.stringify($scope.value[tmp]);
            }
        }
        $modalInstance.close(v && v.errorcode ? cacheValue : $scope.value);
        v && v.errorcode && swal(v.message);
    }

    $scope.ok = function (e) {
        if (JSON.stringify($scope.value) != JSON.stringify(cacheValue)) {
            var p = {};
            for (var tmp in items.visible) {
                if (items.visible[tmp].data && items.visible[tmp].data.indexOf("json") >= 0 && typeof $scope.value[tmp] === 'string') {
                    p[tmp] = JSON.stringify($scope.value[tmp]);
                    continue;
                }
                if (items.visible[tmp].data && items.visible[tmp].data.indexOf("date") >= 0 && typeof $scope.value[tmp] === 'string') {
                    p[tmp] = Date.parse(new Date($scope.value[tmp]));
                    continue;
                }
                p[tmp] = $scope.value[tmp];
            }
            $(e.currentTarget).addClass("data-loading");
            if (items.hook) {
                items.hook(items.id, p, cb);
            } else {
                bubble._call(items.functionName, items.id, JSON.stringify(p)).success(cb);
            }
        } else {
            $modalInstance.close();
        }
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);
/**
 * 新建辑弹窗
 */
app.controller('modalCreateController', ["$scope", "$modalInstance", "items", "bubble", function ($scope, $modalInstance, items, bubble) {
    $scope.value = items.value;
    $scope.ok = function (e) {
        $(e.currentTarget).addClass("data-loading");
        bubble._call(items.functionName, $scope.value).success(function (v) {
            if (!v.errorcode) {
                $modalInstance.close(v);
            } else {
                swal("添加失败");
            }
            $(e.currentTarget).removeClass("data-loading");
        });
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);