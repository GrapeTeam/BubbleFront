'use strict';
bubbleFrame.register('voteController', function ($scope, bubble) {
    $scope.tableControl = {
        title: [{name: "投票详情", key: "vote", width: 90}],
        html: [""],
        onClick: function (key, v) {
            bubble.customModal("voteInfoModal.html", "voteInfoController", "", v, function (v) {

            });
        },
        onRender: function (v, k) {
            if (!(k.vote instanceof Array && k.vote.length)) {
                v[0] = '<b class="badge bg-success">0</b>';
                return v;
            }
            var c = 0;
            for (var i = 0; i < k.vote.length; i++) {
                c += parseInt(k.vote[i].count);
            }
            v[0] = '<b class="badge bg-success">' + c + '</b>';
            return v;
        }
    }
});

bubbleFrame.register('voteInfoController', function ($scope, bubble, $modalInstance, items) {
    $scope.data = typeof items.vote === 'string' ? JSON.parse(items.vote) : JSON.parse(JSON.stringify(items.vote));
    $scope.colors = ["info", "primary", "warning"];
    $scope.count = 0;
    for (var i = 0; i < $scope.data.length; i++) {
        var t = $scope.data[i];
        $scope.count += parseInt(t.count);
    }

    for (var i = 0; i < $scope.data.length; i++) {
        var t = $scope.data[i];
        t.precent = $scope.count == 0 ? 0 : t.count / $scope.count * 100;
        t.precent = t.precent.toFixed(2);
    }

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});

bubbleFrame.register('voteCreate', function ($scope, $modalInstance, items, bubble) {
    $scope.value = {};
    for (var tmp in items.scope.selectPar) {
        $scope.value[tmp] = items.scope.selectPar[tmp];
    }

    $scope.value.ismulti = "0";
    $scope.value.vote = [{itemName: "", count: "0", itemid: ""}];

    $scope.addItem = function () {
        $scope.value.vote.length < 5 && $scope.value.vote.push({itemName: "", count: "0", itemid: ""});
    };

    $scope.removeItem = function (i) {
        $scope.value.vote.length > 1 && $scope.value.vote.splice(i, 1);
    };

    var check = function () {
        for (var i = 0; i < $scope.value.vote.length; i++) {
            var t = $scope.value.vote[i];
            if (t.itemName == "")
                return false;
        }
        return true;
    };

    $scope.ok = function (e) {
        $(e.currentTarget).addClass("data-loading");
        if (!check()) {
            swal("不允许空投票项");
            return;
        }
        bubble._call("vote.add", $scope.value).success(function (v) {
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