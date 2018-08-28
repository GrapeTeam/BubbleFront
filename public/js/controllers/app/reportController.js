bubbleFrame.register('reportController', function ($scope, $timeout, bubble, $http, $modal, $state, $sce) {
    $scope.circulation = null;
    $scope.gkList = [];
    $scope.title = $state.params.type == "5" ? "全部举报" : $state.params.type == "0" ? "待处理举报" : $state.params.type == "1" ? "处理中举报" : $state.params.type == "2" ? "已完成举报" : "已拒绝举报";
    $scope.par = $state.params.type == "5" ? "" : [{
        "field": "state",
        "logic": "==",
        "value": parseInt($state.params.type)
    }];
    $scope.column_tree_data = [];
    $scope.list = [];
    $scope.tableControl = {
        title: [{name: "转发", key: "gk", width: 60}],
        html: [$sce.trustAsHtml('<a class="btn btn-sm m-t-n-xs"><label class="i-checks"><input type="checkbox" value=""><i></i></label></a>')],
        onClick: function (key, v, i, e, p, s, t) {
            var o = $(e.currentTarget).find("input")[0];
            o.checked = !o.checked;
            if (o.checked) {
                $scope.gkList.indexOf(v._id) < 0 && $scope.gkList.push(v._id);
            } else {
                for (var i = 0; i < $scope.gkList.length; i++) {
                    var t = $scope.gkList[i];
                    t == v._id && $scope.gkList.splice(i, 1) && i--;
                }
            }
        },
        onColumnClick: function (key, v, i, e, p, s, t) {
            !(v.state == "0" || v.state == "1") ? showReport(v, i, p, s, t, true) : showReport(v, i, p, s, t);
        },
        onPage: function (v) {
            $scope.list = v;
            $scope.gkList = [];
        }
    };

    $scope.publicReport = function () {
        var ids = $scope.gkList.join(",");
        $scope.circulation.show();
        //批量公开
        // bubble._call("report.circulation", "", "").success(function (v) {

        // });
    };

    var showReport = function (v, i, p, s, t, b) {
        bubble.customModal("replyReportModal.html", "replyReportController", "lg", {
            data: v,
            list: $scope.list,
            scope: $scope,
            idx: i,
            page: p,
            size: s,
            total: t,
            currentState: $state.params.type,
            finish: b
        }, function () {

        });
    };

    var CirculationConfig = function () {
        var _this = this;
        var box = $(".push-config-wrap");
        var list = [];
        var selectSite = "";

        this.init = function () {
            this.initEvent();
            this.initList();
            return this;
        };

        this.show = function (v) {
            box.fadeIn(200);
        };

        this.initList = function () {
            initSite();
            // initSdk();
        };

        var initListHtml = function (v, name, key, fn) {
            var title = '<div class="subtitle">' + name + '</div>';
            var html = "";
            for (var i = 0; i < v.length; i++) {
                html += '<div class="item" id="' + v[i]._id + '">' + v[i][key] + '</div>';
            }
            var t = $("<div>" + title + html + "</div>");
            t.find(".item").click(fn);
            box.find(".content-box").append(t);
            box.find(".tipsbox").hide();
        };

        $scope.ctree = {};
        $scope.treeSelect = function (v) {
            selectSite = v._id;
        };

        var initSite = function () {
            bubble._call("site.getall", 1, 1000, window.localStorage.siteid).success(function (v) {
                $scope.column_tree_data = bubble.getTreeData(v.data, "_id", false, function (v) {
                    v.label = v.title;
                });
                $scope.column_tree_data.length && box.find(".tipsbox").hide();
            });
        };

        this.hide = function () {
            box.fadeOut(200);
            box.find(".cur").removeClass("cur");
            pushItem = [];
        };

        this.push = function () {
            if (!selectSite) {
                swal("请选择站点!");
                return;
            }
            if (!selectSite == window.localStorage.siteid) {
                swal("不可选择本站点!");
                return;
            }
            bubble._call("report.circulation", $scope.gkList.join(","), selectSite).success(function (v) {

            });
        };

        this.initEvent = function () {
            box.unbind("click").click(function (e) {
                if (e.target === e.currentTarget) {
                    _this.hide();
                }
            });
        }
    };
    $timeout(function () {
        $scope.circulation = new CirculationConfig().init();
    });
});

bubbleFrame.register('replyReportController', function ($scope, $modalInstance, items, bubble, $compile, $timeout) {
    $scope.stateText = ["未受理", "处理中", "已处理", "被拒绝"];
    var doneNext = false;
    var dateList = items.scope.list;
    var idx = items.idx;
    var toggleLoading = function (type, is) {
        var o = $(".report-modal-title-btn." + type + " h1");
        if (is) {
            $(e.currentTarget).find("i").remove();
            $(e.currentTarget).append('<i class="fa fa-spin fa-refresh"></i>');
        } else {
            $(e.currentTarget).find("i").remove();
            $(e.currentTarget).append('<i class="fa fa-angle-' + type + '"></i>');
        }
    };

    var getUrlData = function () {
        var data = $scope.data;
        if (data.image && data.image.indexOf("http") >= 0) {
            var html = '<label class="col-sm-2 control-label">举报视频</label>' +
                '<div class="col-sm-9">' +
                '<div class="input-group m-b" style="margin: 0 auto;">' +
                '<ui-video url="{{data.image}}" type="video/ogg" width="400" height="300"></ui-video>' +
                '</div>' +
                '</div>';
            $(".reportvideobox").append($compile(html)($scope));
        }

        if (data.media && data.media.indexOf("http") >= 0) {
            var list = data.media.split(",");
            var html = '<label class="col-sm-2 control-label">举报图片</label>' +
                '<div class="col-sm-9">' +
                '@imgs' +
                '</div>';
            var imgs = [];
            list.map(function (v) {
                imgs.push('<img src="' + v + '" ui-img="popup" ui-width="100" ui-height="100" class="pull-left m-r-sm cursor-p" />');
            });
            $(".reportaudiobox").append($compile(html.replace("@imgs", imgs.join("")))($scope));
        }

    };

    var getFiles = function () {
        var list = items.data.file ? items.data.file.split(",") : [];
        for (var i = 0; i < list.length; i++) {
            var n = 0;
            while (items.data["attrFile" + n]) {
                if (list[i] == items.data["attrFile" + n].filepath) {
                    list[i] = {name: items.data["attrFile" + n].fileoldname, path: items.data["attrFile" + n].filepath};
                    break;
                }
                n++;
            }
        }

        return list;
    };
    $scope.files = getFiles();

    $scope.downloadfile = function (v) {
        window.open(v.replace(/\\/g, "/"));
    };

    var refresh = function () {
        $scope.refresh = false;
        $scope.imgs = [];
        $timeout(function () {
            $scope.videoCurrent = 0;
            $scope.videoList = $scope.data.video ? $scope.data.video.split(",") : [];
            $scope.imgs = $scope.data.image ? $scope.data.image.split(",") : [];
            $scope.refresh = true;
        })
    };

    var getNextItem = function (i, type, async) {
        if (!async) {
            var jump = type ? i == (dateList.length == items.size ? items.size - 1 : dateList.length - 1) ? pageNext() : i++ : i == 0 ? pagePrev() : i--;
            if (jump === false) {
                return;
            }
        }
        var t = null;
        for (; type ? i < dateList.length : i >= 0; type ? i++ : i--) {
            t = dateList[i];
            idx = i;
            $scope.data = JSON.parse(JSON.stringify(t));
            $scope.data.time = new Date(parseInt(t.time)).Format("yyyy-MM-dd hh:mm");
            $scope.data.completetime = $scope.data.completetime && $scope.data.completetime.indexOf("1970") < 0 ? new Date(parseInt($scope.data.completetime)).Format("yyyy-MM-dd hh:mm") : "暂无";
            $scope.data.refusetime = $scope.data.refusetime && $scope.data.refusetime.indexOf("1970") < 0 ? new Date(parseInt($scope.data.refusetime)).Format("yyyy-MM-dd hh:mm") : "暂无";
            return t;
        }

        if (i <= 0) {
            pagePrev();
            return;
        }
        if (i == dateList.length) {
            pageNext();

        }
    };

    var pageNext = function () {
        if (items.page < items.total) {
            doneNext = false;
            $scope.data = {};
            items.scope.tableControl.next(function (v) {
                items.page++;
                idx = -1;
                dateList = v;
                getNextItem(idx, true);
            });
        } else {
            doneNext && $modalInstance.close();
            swal("已经是最后一条数据了");
            return false;
        }
        refresh();
    };

    var pagePrev = function () {
        if (items.page > 1) {
            $scope.data = {};
            items.scope.tableControl.prev(function (v) {
                items.page--;
                idx = v.length;
                dateList = v;
                getNextItem(idx, false);
            });
        } else {
            swal("已经是第一条数据了");
            return false;
        }
        refresh();
    };

    $scope.deg = 0;

    $scope.next = function (e) {
        if (!e && items.currentState != "5") {
            $scope.data = {};
            if (dateList.length != 1) {
                items.scope.tableControl.reload(function (v) {
                    dateList = v;
                    dateList[idx] || (idx = dateList.length - 1);
                    v.length ? getNextItem(idx, true, true) : swal("已经是最后一条数据了");
                });
            } else {
                pagePrev();
            }
        } else {
            getNextItem(idx, true);
        }
        refresh();
    };

    $scope.prev = function (e) {
        if (!e && items.currentState != "5") {
            $scope.data = {};
            items.scope.tableControl.reload(function (v) {
                dateList = v;
                dateList[idx] || (idx = dateList.length - 1);
                v.length ? getNextItem(idx, false) : swal("已经是最后一条数据了");
            });
        } else {
            getNextItem(idx, false);
        }
        refresh();
    };

    $scope.refresh = true;
    $scope.refreshVideo = true;
    $scope.resumeImg = [];
    $scope.data = JSON.parse(JSON.stringify(items.data));
    $scope.data.time = new Date(parseInt($scope.data.time)).Format("yyyy-MM-dd hh:mm");
    $scope.data.completetime = $scope.data.completetime && !isNaN($scope.data.completetime) ? new Date(parseInt($scope.data.completetime)).Format("yyyy-MM-dd hh:mm") : "暂无";
    $scope.data.refusetime = $scope.data.refusetime && $scope.data.refusetime.indexOf("1970") < 0 ? new Date(parseInt($scope.data.refusetime)).Format("yyyy-MM-dd hh:mm") : "暂无";
    $scope.imgs = $scope.data.image ? $scope.data.image.split(",") : [];
    $scope.value = {state: "0"};
    $scope.mode = true;
    $scope.videoCurrent = 0;
    $scope.videoList = $scope.data.video ? $scope.data.video.split(",") : [];
    $scope.modeChange = function (e) {
        if (!$scope.mode) {
            if (!!$scope.value.newContent) {
                bubble._call("reportReply.add", {"Rcontent": $scope.value.newContent}).success(function (v) {
                    $scope.mode = !$scope.mode;
                    swal(!v.errorcode ? "添加成功" : "添加失败");
                    $(e.currentTarget).parent().parent().find("select").show();
                    $(e.currentTarget).parent().parent().find("input").hide();
                });
            } else {
                $(e.currentTarget).parent().parent().find("select").show();
                $(e.currentTarget).parent().parent().find("input").hide();
            }
        } else {
            $scope.mode = !$scope.mode;
            $(e.currentTarget).parent().parent().find("select").hide();
            $(e.currentTarget).parent().parent().find("input").show();
        }
    };
    $scope.ok = function (e, type) {
        if ($scope.data.time === undefined) {
            return
        }
        bubble.customModal("replyReportContentModal.html", "replyReportContentController", "lg", {}, function (rs) {
            if (!rs) {
                swal("反馈内容不可为空");
                return;
            }
            $(e.currentTarget).addClass("data-loading");
            bubble._call(type == "0" ? "report.complete" : "report.refuse", dateList[idx]._id, {reason: rs})
                .success(function (v) {
                    $(e.currentTarget).removeClass("data-loading");
                    if (v.errorcode) {
                        swal(v.data);
                        return;
                    }
                    dateList[idx].state = type == "0" ? "2" : "3";
                    dateList[idx].reason = rs;
                    swal("操作成功");
                    doneNext = true;
                    $scope.next();
                });
        });
    };

    $scope.kill = function (e) {
        bubble.customModal("replyReportContentModal.html", "replyReportContentController", "lg", {kick: true}, function (rs, t) {
            $(e.currentTarget).addClass("data-loading");
            bubble._call("report.kick", dateList[idx].userid, {"kickTime": t, _id: dateList[idx]._id, reason: rs})
                .success(function (v) {
                    $(e.currentTarget).removeClass("data-loading");
                    if (v.errorcode) {
                        swal(v.data);
                        return;
                    }
                    dateList[idx].state = "3";
                    dateList[idx].reason = "";
                    swal("操作成功");
                    doneNext = true;
                    $scope.next();
                });
        });
    };

    $scope.proces = function (e) {
        if ($scope.data.time === undefined) {
            return
        }
        $(e.currentTarget).addClass("data-loading");
        bubble._call("report.handle", dateList[idx]._id, {state: 1})
            .success(function (v) {
                $(e.currentTarget).removeClass("data-loading");
                if (v.errorcode) {
                    swal(v.data);
                    return;
                }
                dateList[idx].state = 1;
                swal("操作成功");
                doneNext = true;
                $scope.next();
            });
    };

    var refreshVideo = function () {
        $scope.refreshVideo = false;
        $timeout(function () {
            $scope.refreshVideo = true;
        })
    };

    $scope.download = function () {
        window.open($scope.videoList[$scope.videoCurrent]);
    };

    $scope.videoleft = function () {
        $scope.videoCurrent > 0 && ($scope.videoCurrent-- , refreshVideo());
    };

    $scope.videoright = function () {
        $scope.videoCurrent < $scope.videoList.length - 1 && ($scope.videoCurrent++ , refreshVideo());
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});
