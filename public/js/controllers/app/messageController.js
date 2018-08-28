'use strict';
bubbleFrame.register('messageController', function ($scope, bubble) {
    $scope.tableControl = {
        title: [{name: "回复", key: "hf", width: 60}, {name: "查看回复", key: "view", width: 90}],
        html: ['<a class="btn btn-sm m-t-n-xs"><i class="fa fa-comment-o"></i></a>', "123123"],
        onClick: function (key, v) {
            if (key == "hf") {
                bubble.customModal("replyMessageModal.html", "replyMessageController", "lg", v, function () {
                    v.replynum += 1;
                });
            }
            if (key == "view") {
                bubble.customModal("messageViewModal.html", "messageViewController", "lg", v._id, function () {

                });
            }
        },
        onRender: function (v, k) {
            v[1] = '<b class="badge bg-info">' + (k.replynum || 0) + '</b>';
            return v;
        }
    }
});

bubbleFrame.register('replyMessageController', function ($scope, bubble, items, $modalInstance) {
    $scope.value = "";

    $scope.ok = function (e) {
        $(e.currentTarget).addClass("data-loading");
        bubble._call("message.add", {fatherid: items._id, messageContent: $scope.value}).success(function (v) {
            if (!v.errorcode) {
                $modalInstance.close(v);
            } else {
                swal(v.data);
                $(e.currentTarget).removeClass("data-loading");
            }
        });
    };

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});

bubbleFrame.register('messageViewController', function ($scope, bubble, items, $modalInstance) {
    var initData = function (v) {
        var rs = {};
        for (var i = 0; i < v.length; i++) {
            rs[v[i]._id] = v[i];
        }
        return rs;
    };
    $scope.list = "";

    bubble._call("message.pageBy", 1, 1000, {fatherid: items}).success(function (v) {
        if (!v.errorcode) {
            $scope.list = initData(v.data);
            for (var tmp in $scope.list) {
                $scope.list[tmp].messageDate.length !== 13 && ($scope.list[tmp].messageDate = $scope.list[tmp].messageDate * 1000 + "");
            }
        } else {
            swal("回复数据加载失败");
            $modalInstance.dismiss('cancel');
        }
        if (v.data && !v.data.length) {
            $scope.tipscontent = "暂无回复信息";
        } else {
            $scope.tipscontent = "";
        }
    });

    $scope.ok = function (e) {
        $(e.currentTarget).addClass("data-loading");

    };

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});