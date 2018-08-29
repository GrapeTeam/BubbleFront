bubbleFrame.register('crawlerController', function ($scope, bubble, $timeout) {
    $scope.task = [];
    $scope.timetype = "2";
    $scope.mode = "new";
    $scope.state = "0";

    var loading = function (v) {
        v ? $(".contentbatchMask").fadeIn(200) : $(".contentbatchMask").fadeOut(200);
    };

    var initState = function () {
        bubble._call("crawler.query").success(function (v) {
            $scope.state = !v.errorcode ? "1" : "0";
        });
    };

    $scope.start = function () {
        bubble._call("crawler.taskstart").success(function (v) {
            initState();
            swal(v.errorcode ? "任务启动失败" : "任务启动成功");
        });
    };

    $scope.stop = function () {
        bubble._call("crawler.taskstop").success(function (v) {
            initState();
            swal(v.errorcode ? "任务停止失败" : "任务停止成功");
        });
    };

    initState();

    $scope.selectAll = function () {
        count = 0;
        for (var i = 0; i < $scope.task.length; i++) {
            var e = $scope.task[i];
            if (!e.check) {
                e.check = true;
            } else {
                count++;
            }
        }
        if (count == $scope.task.length) {
            for (var i = 0; i < $scope.task.length; i++) {
                $scope.task[i].check = false;
            }
        }
    };

    $scope.copy = function (v, e) {
        $scope.mode = "new";
        $scope.json = JSON.parse(JSON.stringify(v));
        delete $scope.json._id;
        e.stopPropagation();
    };

    $scope.create = function () {
        $scope.mode = "new";
        $scope.json = (window.localStorage.cacheBugConfig && JSON.parse(window.localStorage.cacheBugConfig)) || {
            name: "",
            desc: "",
            runtime: 6000,
            time: Date.parse(new Date()),
            info: {
                host: "",
                init: {
                    base: "",
                    type: "0",
                    method: "0",
                    selecter: [""]
                },
                loop: {
                    mode: "0",
                    selecter: [""]
                },
                data: [
                    {key: "", selecter: "", isTEXT: true}
                ],
                collectApi: ""
            }
        }
    };

    $scope.export = function () {
        var text = [];
        var list = [];
        var tmp = "";
        for (var i = 0; i < $scope.task.length; i++) {
            var e = $scope.task[i];
            if (e.check) {
                tmp = JSON.parse(JSON.stringify($scope.task[i]));
                switchData(tmp, true);
                // text.push(JSON.stringify(tmp));
                text.push(JSON.stringify({
                    name: tmp.name,
                    desc: tmp.desc,
                    info: tmp.info,
                    runtime: tmp.runtime * 60 * 60000
                }));
                list.push(tmp);
            }
        }
        if (!list.length) {
            swal("请先选择需要导出的任务");
            return;
        }
        bubble.customModal("crawlerJsonModal.html", "crawlerJsonController", "lg", text, function (v) {

        });
    };

    $scope.import = function () {
        bubble.customModal("crawlerJsonModal.html", "crawlerJsonController", "lg", "", function (v) {
            try {
                loading(true);
                var count = 0;
                var list = JSON.parse(v);
                for (var i = 0; i < list.length; i++) {
                    bubble._call("crawler.add", bubble.replaceBase64(list[i])).success(function (v) {
                        if (++count == list.length) {
                            loading(false);
                            if (!v.errorcode) {
                                window.localStorage.cacheBugConfig = "";
                                initTasks();
                                $scope.create();
                                swal("导入成功");
                            } else {
                                swal("导入失败");
                            }
                        }
                    });
                }
            } catch (e) {
                swal("请输入正确的JSON数组");
            }
        });
    };

    $scope.removeSelector = function (i) {
        $scope.json.info.init.selecter.length > 1 && $scope.json.info.init.selecter.splice(i, 1);
    };

    $scope.addSelector = function () {
        $scope.json.info.init.selecter.push("");
    };

    $scope.removeLoop = function (i) {
        $scope.json.info.loop.selecter.length > 1 && $scope.json.info.loop.selecter.splice(i, 1);
    };

    $scope.addLoop = function () {
        $scope.json.info.loop.selecter.push("");
    };

    $scope.removeContent = function (i) {
        $scope.json.info.data.length > 1 && $scope.json.info.data.splice(i, 1);
    };

    $scope.addContent = function () {
        $scope.json.info.data.push({key: "", selecter: "", isTEXT: "1"});
    };

    $scope.addContentBatch = function () {
        bubble.customModal("crawlerBatchModal.html", "crawlerBatchController", "lg", {}, function (v) {
            var s = v.start;
            var e = v.end;
            delete v.start;
            delete v.end;
            for (var i = s; i < e; i++) {
                $scope.json.info.data.push({
                    key: v.key.replace(/\?/g, i),
                    selecter: v.selecter.replace(/\?/g, i),
                    isTEXT: v.isTEXT
                });
            }
        });
    };

    $scope.getDate = function (v) {
        return new Date(parseInt(v)).Format("yyyy-MM-dd");
    };

    $scope.showItem = function (v, e) {
        if (e.target.nodeName === "INPUT") {
            return;
        }
        $scope.json = v;
        $scope.mode = "show";
    };

    $scope.neartimeChange = function () {
        bubble.customModal("crawlerNearTimeModal.html", "crawlerNearTimeController", "lg", {}, function (v) {
            var list = [];
            for (var i = 0; i < $scope.task.length; i++) {
                var e = $scope.task[i];
                if (e.check) {
                    list.push(e);
                }
            }
            if (!list.length) {
                swal("请先选择需要导出的任务");

            }
        });
    };

    $scope.run = function (v) {
        loading(true);
        if (v.state == 1) {
            bubble._call("crawler.stop", v._id).success(function (v) {
                loading(false);
                if (!v.errorcode) {
                    v.state = 0;
                } else {
                    swal("状态更新失败");
                }
            });
        } else {
            bubble._call("crawler.run", v._id).success(function (v) {
                loading(false);
                if (!v.errorcode) {
                    v.state = 1;
                } else {
                    swal("状态更新失败");
                }
            });
        }
    };

    $scope.deleteTask = function () {
        var list = [];
        for (var i = 0; i < $scope.task.length; i++) {
            var e = $scope.task[i];
            e.check && list.push(e._id);
        }
        if (!list.length) {
            swal("请先选择需要删除的任务");
            return;
        }
        loading(true);
        bubble._call("crawler.delete", list.join(",")).success(function (v) {
            loading(false);
            if (!v.errorcode) {
                for (var i = 0; i < $scope.task.length; i++) {
                    var e = $scope.task[i];
                    if (e.check) {
                        $scope.task.splice(i, 1);
                        i--;
                    }
                }
                $scope.create();
            } else {
                swal("删除失败");
            }
        });
    };

    $scope.timechange = function () {
        for (var i = 0; i < $scope.task.length; i++) {
            $scope.task[i].runtime = 1;
        }
    };

    var switchTime = function (v, x) {
        var timetype = $scope.timetype;
        var s = 0;

        if (timetype == 0) {
            s = 1000;
        }
        if (timetype == 1) {
            s = 60000;
        }
        if (timetype == 2) {
            s = 60 * 60000;
        }
        if (timetype == 3) {
            s = 24 * 60 * 60000;
        }

        v = x ? v / s : v * s;
        return parseInt(v.toFixed(2));
    };

    var switchData = function (e, type) {
        try {
            if (!type) {
                if (typeof e.info === "string") {
                    e.info = JSON.parse(e.info);
                }
                e.check = false;
                e.info.init.selecter = e.info.init.selecter.split(",");
                e.info.loop.selecter = e.info.loop.selecter.split(",");
                e.info.init.type = e.info.init.type + "";
                e.info.init.method = e.info.init.method + "";
                e.info.loop.mode = e.info.loop.mode + "";
                e.runtime = switchTime(parseInt(e.runtime), true);
                for (var i = 0; i < e.info.data.length; i++) {
                    var s = e.info.data[i];
                    s.isTEXT = s.isTEXT ? "1" : "0";
                }
            } else {
                e.info.init.selecter = e.info.init.selecter.join(",");
                e.info.loop.selecter = e.info.loop.selecter.join(",");
                e.info.init.type = parseInt(e.info.init.type);
                e.info.init.method = parseInt(e.info.init.method);
                e.info.loop.mode = parseInt(e.info.loop.mode);
                e.runtime = switchTime(parseInt(e.runtime));
                for (var i = 0; i < e.info.data.length; i++) {
                    var s = e.info.data[i];
                    s.isTEXT = s.isTEXT == "1";
                }
                e.info.loop.selecter == 1 && e.info.loop.selecter[0] == "" && (e.info.loop.selecter = "");
                e.info = JSON.stringify(e.info);
            }
        } catch (error) {
            swal("存在非标准JSON字段在[" + e.name + "],请删除后重新添加");
        }
    };

    var initTasks = function () {
        loading(true);
        bubble._call("crawler.page", 1, 1000).success(function (v) {
            loading(false);
            if (v.errorcode) {
                swal("数据读取失败");
            } else {
                for (var i = 0; i < v.data.length; i++) {
                    switchData(v.data[i]);
                }
                $scope.task = v.data;
            }
        });
    };

    var inputCheck = function () {
        var o = $scope.json;
        for (var i = 0; i < o.info.init.selecter.length; i++) {
            var e = o.info.init.selecter[i];
            if (!e) {
                o.info.init.selecter.splice(i, 1);
                i--;
            }
        }
        for (var i = 0; i < o.info.loop.selecter.length; i++) {
            var e = o.info.loop.selecter[i];
            if (!e) {
                o.info.loop.selecter.splice(i, 1);
                i--;
            }
        }
        for (var i = 0; i < o.info.data.length; i++) {
            var e = o.info.data[i];
            if (!e.key || !e.selecter) {
                o.info.data.splice(i, 1);
                i--;
            }
        }
        if (!o.name) {
            swal("请输入任务名称");
            return false;
        }
        if (!o.info.host) {
            swal("请输入基础HOST");
            return false;
        }
        if (o.info.loop.selecter.length) {
            o.info.loop.selecter.push("");
        }
        if (!o.info.data.length) {
            o.info.data.push({isTEXT: true, key: "", selecter: ""});
            swal("请输入至少一个有效内容所在选择器");
            return false;
        }

        return true;
    };

    $scope.ok = function () {
        if (inputCheck()) {
            loading(true);
            $scope.mode == "new" && (window.localStorage.cacheBugConfig = JSON.stringify($scope.json));
            var o = JSON.parse(JSON.stringify($scope.json));
            switchData(o, true);
            if ($scope.mode == "new") {
                bubble._call("crawler.add", bubble.replaceBase64(JSON.stringify(o))).success(function (v) {
                    loading(false);
                    if (!v.errorcode) {
                        window.localStorage.cacheBugConfig = "";
                        initTasks();
                        $scope.create();
                    } else {
                        swal("新建失败");
                    }
                });
            } else {
                bubble._call("crawler.update", $scope.json._id, bubble.replaceBase64(JSON.stringify(o))).success(function (v) {
                    loading(false);
                    if (!v.errorcode) {
                        initTasks();
                    } else {
                        swal("更新失败");
                    }
                });
            }
        }
    };

    $scope.create();
    initTasks();
});

bubbleFrame.register('crawlerBatchController', function ($scope, bubble, $timeout, items, $modalInstance) {
    $scope.json = {key: "", selecter: "", isTEXT: "1", start: "0", end: "0"};
    $scope.ok = function (e) {
        $modalInstance.close($scope.json);
    };

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});

bubbleFrame.register('crawlerJsonController', function ($scope, bubble, $timeout, items, $modalInstance) {
    $scope.json = items ? JSON.stringify(items) : "";
    $scope.ok = function (e) {
        $modalInstance.close($scope.json);
    };

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});

bubbleFrame.register('crawlerNearTimeController', function ($scope, bubble, $timeout, items, $modalInstance) {
    $scope.json = items ? JSON.stringify(items) : "";
    $scope.ok = function (e) {
        $modalInstance.close($scope.json);
    };

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});