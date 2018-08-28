bubbleFrame.register('dashboardController', function ($scope, bubble) {
    $scope.report = 0;
    $scope.suggest = 0;
    $scope.column = 0;
    $scope.task = [];
    $scope.task = $scope.check;
    $scope.colors = ["warning", "info", "primary", "light"];

    //栏目更新
    bubble._call("task.difft", 1, 1000).success(function (v) {
        $scope.column = v.length;
        $scope.columnData = v;
        for (var i = 0; i < v.length; i++) {
            v[i].time = "请" + (v[i].restTime ? "于" + new Date(parseInt(v[i].restTime)).Format("dd天hh小时mm分钟ss秒") + "内更新" : "立即更新");
        }
    });

    //错链死链
    bubble._call("task.check", 1, 1000).success(function (v) {
        $scope.check = v.data;
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
        $scope.suggest = v.message;
    });

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
        $scope.report = v.message;
    })
});