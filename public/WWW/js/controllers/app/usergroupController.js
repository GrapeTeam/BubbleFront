bubbleFrame.register('usergroupController', function ($scope, bubble, $modal, $http) {
    $scope.systemList = null;
    var currentId = "";
    $scope.contentList = [
        {name: "政策法规", icon: "fa fa-fw fa-user", seleted: true},
        {name: "法律法规", icon: "fa fa-fw fa-file-text-o", seleted: false},
        {name: "局情概括", icon: "fa fa-fw fa-list-ul", seleted: false},
        {name: "新闻发布", icon: "fa fa-fw fa-user", seleted: false},
        {name: "决策规划", icon: "fa fa-fw fa-user", seleted: false},
        {name: "行政权利运行", icon: "fa fa-fw fa-user", seleted: false},
        {name: "发布实录", icon: "fa fa-fw fa-user", seleted: false},
        {name: "通知公告", icon: "fa fa-fw fa-user", seleted: false},
        {name: "机构领导", icon: "fa fa-fw fa-user", seleted: false},
        {name: "机构简介", icon: "fa fa-fw fa-user", seleted: false},
        {name: "内设机构", icon: "fa fa-fw fa-user", seleted: false},
    ];
    $scope.control = {
        title: [{name: "权限", key: "sl", width: 30}],
        html: ['<a class="btn btn-sm m-t-n-xs"><i class="fa fa-navicon"></i></a>'],
        onClick: function (key, v) {
            currentId = v._id;
            if ($scope.systemList) {
                reviewMenu($scope.systemList, v._id);
                showTemp($scope.systemList, v.name);
            } else {
                bubble._call("menu.getAll").success(function (rs) {
                    $scope.systemList = rs;
                    reviewMenu(rs, v._id);
                    showTemp(rs, v.name);
                });
            }
        }
    };

    var reviewMenu = function (v, id) {
        for (var i = 0; i < v.length; i++) {
            var t = v[i];
            t.prvid.indexOf(id) >= 0 ? t.check = true : t.check = false;
        }
    };

    var showTemp = function (v, name) {
        $scope.infoName = name;
        $(".temp-wrap-box").fadeIn(200);
    };

    $scope.selectAll = function (v) {
        v.check = true;
    };

    $scope.cancelAll = function (v) {
        v.check = false;
    };

    $scope.confirmTemp = function () {
        var d = $scope.systemList;
        var r = [];
        for (var i = 0; i < d.length; i++) {
            var t = d[i];
            if (t.check) {
                r.push(t._id);
            }
        }
        bubble._call("menu.set", currentId, r.join(",")).success(function (v) {
            if (!v.errorcode) {
                swal("设置成功");
                $scope.closeTemp();
                $scope.systemList = null;
            } else {
                swal("设置失败");
                $scope.closeTemp();
            }
        });
    };

    $scope.closeTemp = function (v) {
        $(".temp-wrap-box").fadeOut(200);
    };

    $scope.closeTempMask = function (e) {
        e.currentTarget === e.target && $(e.target).fadeOut(200);
    }
});