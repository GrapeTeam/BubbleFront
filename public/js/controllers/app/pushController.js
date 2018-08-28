bubbleFrame.register('pushController', function ($scope, bubble, $timeout) {
    var column = "";
    $scope.news = [];
    $scope.pnew = null;
    bubble._call("content.searchPush", 1, 1000, [{
        field: "wbid",
        logic: "==",
        value: window.localStorage.siteid
    }]).success(function (v) {
        if (!v.errorcode) {
            $scope.news = v.data;
            $scope.news.map(function (v) {
                v.time = new Date(parseInt(v.time)).Format("yyyy-MM-dd hh:mm:ss");
            })
        }
    });

    $scope.confirm = function (v, e) {
        column.show(v);
        e.stopPropagation();
    };

    $scope.cancel = function (v, e) {
        swal({
            title: "确定要拒绝推送该新闻吗?",
            icon: "warning",
            buttons: {
                cancel: "取消",
                defeat: "拒绝",
            },
        }).then(
            function (s) {
                if (s) {
                    $(".contentbatchMask").fadeIn(200);
                    bubble._call("content.pushDelete", v._id).success(function (v) {
                        $(".contentbatchMask").fadeOut(200);
                        if (!v.errorcode) {
                            swal("删除成功");
                            for (var i = 0; i < $scope.news.length; i++) {
                                if ($scope.news[i]._id == currentNew._id) {
                                    $scope.news.splice(i, 1);
                                    return;
                                }
                            }
                        } else {
                            swal(v.message);
                        }
                    });
                }
            });
        e.stopPropagation();
    };

    $scope.closeColumn = function () {
        $(".push-cloumn-move").fadeOut(200);
    };

    $scope.preview = function (v) {
        var box = $(".push-preview");
        var d = v ? v : $scope.newItem;
        box.find("h3").html(d.mainName);
        box.find(".content-info").html("").append('<span> 来源: ' + d.souce + ' </span><span> 发布时间：' + d.time + ' </span><span> 作者：' + d.author + ' </span>');
        box.find(".content").html(d.content);
        box.find(".tipsbox").hide();
        box.find(".preview-box").show();
    };

    var Column = function () {
        var current = "";
        var currentNew = "";
        //阻止展开收起触发select
        var stop = function () {
            $timeout(function () {
                $(".tree-icon").length ? $(".tree-icon").click(function (e) {
                    e.stopPropagation();
                }) : stop();
            }, 20);
        };
        stop();

        $scope.onSelect = function (v) {
            v.label != "根栏目" && (current = v);
        };

        $scope.tree = {};

        $scope.save = function () {
            if (!current) {
                swal("请选择栏目");
                return;
            }
            $(".contentbatchMask").fadeIn(200);
            bubble._call("content.pushTo", currentNew._id, {ogid: current._id}).success(function (v) {
                $(".contentbatchMask").fadeOut(200);
                $(".push-cloumn-move").fadeOut(200);
                swal("审核成功");
                for (var i = 0; i < $scope.news.length; i++) {
                    if ($scope.news[i]._id == currentNew._id) {
                        $scope.news.splice(i, 1);
                        return;
                    }
                }
            });
        };

        var initData = function () {
            bubble._call("column.page", 1, 500).success(function (v) {
                $scope.columnData = bubble.getTreeData(v.data, "_id", false, function (v) {
                    v.label = v.name;
                });
                $scope.columnData = [{label: "根栏目", _id: {$oid: 0}, children: $scope.columnData}];
            });
        };

        $(".push-cloumn-move").unbind("click").click(function (e) {
            if (e.target === e.currentTarget) {
                $(this).fadeOut();
            }
        });

        this.show = function (v) {
            initData();
            currentNew = v;
            $(".push-cloumn-move").fadeIn(200);
        };
        initData();
    };
    $timeout(function () {
        column = new Column();
    })
});