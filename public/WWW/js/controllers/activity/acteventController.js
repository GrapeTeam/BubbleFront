bubbleFrame.register('acteventController', function ($scope, bubble, $modal, $state, $http, $stateParams, $timeout) {
    $scope.tableControl = {
        pageFn: function (p, s, cb) {
            bubble._call("actevent.page", p, s).success(function (v) {
                cb(v);
            });
        },
        deleteFn: function (ids, cb) {
            bubble._call("actevent.delete", ids).success(function (v) {
                cb(v);
            });
        },
        editFn: function (id, value, cb) {
            value = typeof value === "string" ? JSON.parse(value) : JSON.parse(JSON.stringify(value));
            value.time != undefined && (value.time = Date.parse(new Date(value.time)));
            value.startTime != undefined && (value.startTime = Date.parse(new Date(value.startTime)));
            value.endTime != undefined && (value.endTime = Date.parse(new Date(value.endTime)));
            value.vCnt != undefined && (value.vCnt = parseInt(value.vCnt));
            value.number != undefined && (value.number = parseInt(value.number));
            value.state != undefined && (value.state = parseInt(value.state));
            value.wxid != undefined && (value.wxid = parseInt(value.wxid));
            bubble._call("actevent.update", id, bubble.replaceBase64(typeof value === "string" ? value : JSON.stringify(value))).success(function (v) {
                cb(value);
            });
        },
        title: [
            {name: "查看对象", key: "sl", width: 90},
            {name: "投票详情", key: "vote", width: 90},
            {name: "活动类型", key: "type", width: 90},
            {name: "活动规则", key: "key", width: 90}
        ],
        html: [
            '<a class="btn btn-sm m-t-n-xs"><i class="fa fa-navicon"></i></a>',
            '<a class="btn btn-sm m-t-n-xs"><i class="fa fa-info-circle"></i></a>',
            '<a class="btn btn-sm m-t-n-xs"><i class="fa fa-list"></i></a>',
            '<a class="btn btn-sm m-t-n-xs"><i class="fa fa-key"></i></a>'
        ],
        onClick: function (key, v) {
            if (key == "sl") {
                $state.go("app.activity.actobj", {eid: v._id});
            } else if (key == "key") {
                bubble.customModal("actRule.html", "actRuleController", "lg", v, function (v) {

                })
            } else if (key == "type") {
                $state.go("app.activity.acttype", {eid: v._id});
            } else {
                $state.go("app.activity.actlog", {eid: v._id});
            }
        }
    }
});

bubbleFrame.register('actRuleController', function ($scope, $modalInstance, items, bubble, $timeout) {
    var tmp = null;
    $scope.disabled = true;

    $scope.timeCD = "加载中...";
    $scope.repeatNo = "加载中...";
    $scope.ownNo = "加载中...";

    bubble._call("actrule.get", items.rid).success(function (v) {
        tmp = JSON.parse(JSON.stringify(v));
        $scope.timeCD = v.timeCD;
        $scope.repeatNo = v.repeatNo;
        $scope.ownNo = v.ownNo;
        $scope.disabled = false;
    });

    $scope.ok = function (e) {
        $(e.currentTarget).addClass("data-loading");
        if ($scope.timeCD != tmp.timeCD || $scope.repeatNo != tmp.repeatNo || $scope.ownNo != tmp.ownNo) {
            if (isNaN($scope.timeCD) || isNaN($scope.repeatNo) || isNaN($scope.ownNo)) {
                swal("请输入正确的数值");
                return;
            }
            bubble._call("actrule.update", tmp._id, bubble.replaceBase64(JSON.stringify({
                timeCD: parseInt($scope.timeCD),
                repeatNo: parseInt($scope.repeatNo),
                ownNo: parseInt($scope.ownNo)
            }))).success(function (v) {
                $modalInstance.close(v);
            });
        } else {
            $modalInstance.dismiss('cancel');
        }
    };

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});

bubbleFrame.register('acteventCreate', function ($scope, $modalInstance, items, bubble, $timeout) {
    $scope.value = {};

    var cb = function (v) {
        if (v.errorcode) {
            swal(v.message);
            $modalInstance.dismiss('cancel');
        } else {
            $modalInstance.close(v.message ? v.message : v);
        }
    };

    $scope.ok = function (e) {
        $(e.currentTarget).addClass("data-loading");
        $scope.value.startTime = Date.parse(new Date($scope.value.startTime));
        $scope.value.endTime = Date.parse(new Date($scope.value.endTime));
        bubble._call("actevent.add", $scope.value).success(function (v) {
            cb(v);
        });
    };

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});