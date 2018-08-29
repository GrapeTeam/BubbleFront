(function () {
    var eid = "";
    bubbleFrame.register('acttypeController', function ($scope, bubble, $modal, $state, $stateParams, $timeout) {
        eid = $stateParams.eid;
        $scope.tableControl = {
            pageFn: function (p, s, cb) {
                bubble._call("acttype.page", eid, p, s).success(function (v) {
                    cb(v);
                });
            },
            deleteFn: function (ids, cb) {
                bubble._call("acttype.delete", eid, ids).success(function (v) {
                    cb(v);
                });
            },
            editFn: function (id, value, cb) {
                bubble._call("acttype.update", eid, id, value).success(function (v) {
                    cb(v);
                });
            },
            title: [
                {name: "查看对象", key: "sl", width: 90},
            ],
            html: [
                '<a class="btn btn-sm m-t-n-xs"><i class="fa fa-navicon"></i></a>',
            ],
            onClick: function (key, v) {
                $state.go("app.activity.actobj", {tid: v._id, eid: eid});
            }
        }
    });

    bubbleFrame.register('acttypeCreate', function ($scope, $modalInstance, items, bubble, $timeout) {
        $scope.value = {eid: eid, time: 0, voteCnt: 0, vCnt: 0, state: 1, tid: "0", attr: ""};

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
            bubble._call("acttype.add", eid, bubble.replaceBase64(JSON.stringify($scope.value))).success(function (v) {
                cb(v);
            });
        };

        $scope.cancel = function (e) {
            $modalInstance.dismiss('cancel');
        }
    });
})();