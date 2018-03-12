bubbleFrame.register('dashboardController', function ($scope, bubble) {
    $scope.report = 0;
    $scope.suggest = 0;
    $scope.column = 0;
    $scope.checkLink = 0;
    $scope.sysLog = 0;
    $scope.task = [];
    $scope.task = $scope.check;
    $scope.colors = ["warning", "info", "primary", "light"];
    $scope.count = 5;
    $scope.count1 = 5;
    $scope.count2 = 5;
    $scope.show = true;
    $scope.show1 = true;
    $scope.show2 = true;
    $scope.sys = [];
    //栏目更新
    bubble._call("task.difft", 1, $scope.count).success(function (v) {
        if (v && !v.errorcode) {
            $scope.column = v.totalSize;
            for (var i = 0; i < v.data.length; i++) {
                v.data[i].time = "请" + (v.data[i].time ? "于" + new Date().Format("dd天hh小时mm分钟ss秒") + "内更新" : "立即更新");
            }
            $scope.columnData = v.data;
            $scope.loadMore = function (event) {
                $(event.target).attr('disabled', 'disabled')
                $(event.target).html('加载中...')
                if ($scope.columnData.length == v.totalSize) {
                    swal('没有更多数据了');
                    $scope.show = false;
                    return;
                }
                $scope.count += 5;
                bubble._call("task.difft", 1, $scope.count).success(function (v) {
                    $(event.target).removeAttr('disabled')
                    $(event.target).html('加载更多')
                    $scope.column = v.totalSize;
                    for (var i = 0; i < v.data.length; i++) {
                        v.data[i].time = "请" + (v.data[i].time ? "于" + new Date().Format("dd天hh小时mm分钟ss秒") + "内更新" : "立即更新");
                    }
                    $scope.columnData = v.data;
                });
            }
        } else {
            swal('待更新栏目数据加载失败');
        }
    });

    // 错链死链
    bubble._call("content.checkTop", 1, $scope.count1).success(function (v) {
        if (v && !v.errorcode) {
            $scope.checkLink = v.totalSize;
            $scope.check = v.data;
            $scope.loadMore1 = function (event) {
                $(event.target).attr('disabled', 'disabled')
                $(event.target).html('加载中...')
                if ($scope.check.length == v.totalSize) {
                    swal('没有更多数据了');
                    $scope.show1 = false;
                    return;
                }
                $scope.count1 += 5;
                bubble._call("content.checkTop", 1, $scope.count1).success(function (v) {
                    if (v && !v.errorcode) {
                        $(event.target).removeAttr('disabled')
                        $(event.target).html('加载更多')
                        $scope.check = v.data;
                    }
                    else {
                        swal('数据加载失败');
                    }
                })
            }
        } else {
            swal('错链死链数据加载失败');
        }
    });

    //待回复留言
    // bubble._call("count.group", undefined, "message_13", [{ field: "replynum", logic: ">", value: 0 }], "messageId", "count", "messageContent", "0").success(function (v) {
    //     var data = v.record.data;
    //     var count = 0;
    //     for (var i = 0; i < data.length; i++) {
    //         count += data[i].count;
    //     }
    //     $scope.message = count;
    // });

    //待处理咨询
    // bubble._call("count.group", undefined, "suggest_13", "[]", "content", "count", "name", "0").success(function (v) {
    //     var data = v.record.data;
    //     var count = 0;
    //     for (var i = 0; i < data.length; i++) {
    //         count += data[i].count;
    //     }
    //     $scope.suggest = count;
    // });
    bubble._call("suggest.count").success(function (v) {
        if (v && !v.errorcode) {
            $scope.suggest = v;
        } else {
            swal('待处理咨询数据加载失败');
        }
    })

    //待处理举报
    // bubble._call("count.group", undefined, "reportInfo_13", "[]", "refusetime", "count", "time", "0").success(function (v) {
    //     var data = v.record.data;
    //     var count = 0;
    //     for (var i = 0; i < data.length; i++) {
    //         count += data[i].count;
    //     }
    //     $scope.report = count;
    // });
    bubble._call("report.reportCount").success(function (v) {
        if (v && !v.errorcode) {
            $scope.report = v;
        } else {
            swal('待处理举报数据加载失败');
        }

    })
    // 系统日志
    bubble._call('log.logPage', 1, $scope.count2).success(function (v) {
        if (v && !v.errorcode) {
            $scope.sysLog = v.totalSize;
            for (var i = 0; i < v.data.length; i++) {
                v.data[i].time = new Date(v.data[i].time).Format("yyyy-MM-dd hh:mm:ss");
            }
            $scope.sys = v.data;
            $scope.loadMore2 = function (event) {
                $(event.target).attr('disabled', 'disabled')
                $(event.target).html('加载中...')
                if ($scope.sys.length == v.totalSize) {
                    swal('没有更多数据了');
                    $scope.show2 = false;
                    return;
                }
                $scope.count2 += 5;
                bubble._call('log.logPage', 1, $scope.count2).success(function (v) {
                    if (v && !v.errorcode) {
                        $(event.target).removeAttr('disabled')
                        $(event.target).html('加载更多')
                        for (var i = 0; i < v.data.length; i++) {
                            v.data[i].time = new Date(v.data[i].time).Format("yyyy-MM-dd hh:mm:ss");
                        }
                        $scope.sys = v.data;
                    } else {
                        swal('数据加载失败');
                    }
                })
            }
        } else {
            swal('系统日志数据加载失败');
        }
    })
});
