bubbleFrame.register('contentCountController', function ($scope, bubble, $timeout, $compile) {
    var left = null;
    var right = null;
    var currentTime = "";
    var appid = bubble.getAppId();

    var sitemap = [
        {key: "article", value: "文章发布量"},
        {key: "view", value: "文章浏览量"},
        {key: "reported", value: "被举报量"},
        {key: "consulted", value: "被咨询量"},
    ];

    var columnmap = [
        {key: "article", value: "文章发布量"},
        {key: "unChecked", value: "未待审核文章"},
        {key: "refuse", value: "拒绝审核文章"},
        {key: "pass", value: "已审核文章"},
        {key: "view", value: "浏览量"},
    ];

    // $scope.yaqtestdata = [
    //     { "webID": "312314", "appId": "432423422r2", "article": 12, "view": 312, "reported": 32, "consulted": 21, "time": 21341233, "name": "企务公开" },
    //     { "webID": "312314", "appId": "432423422r2", "article": 12, "view": 312, "reported": 32, "consulted": 21, "time": 21341233, "name": "院务公开" },
    //     { "webID": "312314", "appId": "432423422r2", "article": 12, "view": 312, "reported": 32, "consulted": 21, "time": 21341233, "name": "村务公开" },
    //     { "webID": "312314", "appId": "432423422r2", "article": 12, "view": 312, "reported": 32, "consulted": 21, "time": 21341233, "name": "局务公开" },
    //     { "webID": "312314", "appId": "432423422r2", "article": 12, "view": 312, "reported": 32, "consulted": 21, "time": 21341233, "name": "校务公开" },
    // ];

    // $scope.columnData = [
    //     { name: "党务公开", check: 63, uncheck: 32, checked: 25, view: 135, published: 38 },
    //     { name: "财务公开", check: 63, uncheck: 32, checked: 25, view: 135, published: 38 },
    //     { name: "事务公开", check: 63, uncheck: 32, checked: 25, view: 135, published: 38 },
    // ]

    $scope.columnmap = [];
    $scope.default_site = window.localStorage.sitename;
    $scope.sitemap = [];
    $scope.stime = "";
    $scope.etime = "";
    $scope.currentData = [];
    $scope.currentMap = sitemap;
    $scope.currentMode = "site";

    var getTimestamp = function (type) {
        if (type.indexOf(",") >= 0) {
            return type.split(",");
        }
        var rs = [];
        switch (type) {
            case "day":
                rs[0] = moment().subtract(1, type).valueOf();
                rs[1] = moment().valueOf();
                break;
            case "week":
                rs[0] = moment().subtract(1, type).valueOf();
                rs[1] = moment().valueOf();
                break;
            case "month":
                rs[0] = moment().subtract(1, type).valueOf();
                rs[1] = moment().valueOf();
                break;
            default:
                rs = [];
                break;
        }
        return rs;
    };

    var loading = function (v) {
        v ? $(".contentbatchMask").fadeIn(200) : $(".contentbatchMask").fadeOut(200);
    };

    var getBar = function (o) {
        var series = o.legend.map(function (v, i) {
            return {
                name: v,
                type: 'bar',
                data: o.data[i],
                animation: true,
                itemStyle: {
                    normal: {
                        barBorderRadius: [5, 5, 0, 0],
                    },
                    emphasis: {
                        barBorderRadius: [5, 5, 0, 0],
                    }
                },
                label: {
                    normal: {
                        show: true,
                        position: 'top'
                    }
                },
            }
        });
        return {
            tooltip: {
                trigger: 'axis',
                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                    type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                }
            },
            legend: {
                right: '4%',
                y: "top",
                data: o.legend
            },
            grid: {
                top: '8%',
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'category',
                    data: o.Axis,
                    axisTick: {
                        alignWithLabel: true
                    }
                }
            ],
            axisLabel: {
                textStyle: {
                    fontSize: 18,
                }
            },
            yAxis: [
                {
                    type: 'value'
                }
            ],
            series: series
        }
    };

    var getPie = function (o) {
        var series = o.legend.map(function (v, i) {
            return {
                type: 'bar',
                data: o.data[i],
                coordinateSystem: 'polar',
                name: v,
                label: {
                    normal: {
                        show: true,
                        position: 'inside'
                    }
                },
                stack: 'a'
            }
        });
        return {
            angleAxis: {},
            tooltip: {format: ''},
            polar: {},
            radiusAxis: {
                center: ['50%', '50%'],
                type: 'category',
                data: o.Axis,
                z: 10
            },
            legend: {
                orient: 'vertical',
                x: 'left',
                y: 'top',
                show: true,
                data: o.legend,
            },
            series: series,
        }
    };

    var resize = function () {
        if (!$(".content-count-box").length) {
            $(window).unbind("resize", resize);
        } else {
            left && left.resize();
            right && right.resize();
        }
    };

    $scope.getDataByTime = function () {
        $scope.getData(Date.parse(new Date($scope.stime)) + "," + Date.parse(new Date($scope.etime)));
        $scope.columnmap = [];
        $scope.currentMap = sitemap;
        $(".btnitem").removeClass("cur");
    };

    $scope.getDataByType = function (type, e) {
        $(".btnitem").removeClass("cur");
        $(e.target).addClass("cur");
        $scope.getData(type);
        $scope.columnmap = [];
        $scope.currentMap = sitemap;
    };

    $scope.sort = function (k, e) {
        var obj = $(e.currentTarget);
        var i = obj.find("i");
        $(".content-count-box").find("table i").remove();
        if (i.length) {
            if (i.hasClass("fa-long-arrow-up")) {
                obj.append('<i class="m-l-xs text-danger fa fa-long-arrow-down"></i>');
                bubble.sortBy($scope.currentData, k, false);
            } else {
                obj.append('<i class="m-l-xs text-success fa fa-long-arrow-up"></i>');
                bubble.sortBy($scope.currentData, k, true);
            }
        } else {
            obj.append('<i class="m-l-xs text-danger fa fa-long-arrow-down"></i>');
            bubble.sortBy($scope.currentData, k, false);
        }
    };

    $scope.goPrev = function () {
        if ($scope.columnmap.length) {
            $scope.currentData = $scope.columnmap.pop();
            initColumnChart(getOptionData($scope.currentMap, $scope.currentData));
        } else {
            $scope.columnmap.pop();
            $scope.sitemap = [];
            $scope.getData(currentTime);
        }
    };

    $scope.goNext = function (v, i) {
        if ($scope.currentMode == "column") {
            if (v.children) {
                $scope.columnmap.push(v);
                $scope.currentData = $scope.columnmap[$scope.columnmap.length - 1].children;
                initColumnChart(getOptionData($scope.currentMap, $scope.currentData.slice(0, 5)));
            }
        } else {
            if (v.children) {
                //有子站点时
                $scope.sitemap.push(v);
                $scope.currentData = v.children;
                initSiteChart();
            } else {
                //无子站点时
                $scope.currentMode = "column";
                $scope.sitemap.push(v);
                getColumn(v)
            }
        }
    };

    $scope.navClick = function (type, v, i) {
        if (type == "root") {
            $scope.getData(currentTime);
            $scope.columnmap = [];
            $scope.sitemap = [];
            $scope.currentMode = "site";
        }
        if (type == "site") {
            if (i == $scope.sitemap.length - 1 && $scope.columnmap.length) {
                $scope.columnmap = [];
                getColumn(v);
                return;
            }
            if (!(i == $scope.sitemap.length - 1 && !$scope.columnmap.length)) {
                $scope.columnmap = [];
                $scope.sitemap.splice(i + 1, $scope.sitemap.length);
                $scope.currentData = v.children;
                initSiteChart();
                $scope.currentMode = "site";
            }
        }
        if (type == "column") {
            $scope.currentMode = "column";
            $scope.currentData = v.children;
            $scope.columnmap.splice(i + 1, $scope.columnmap.length);
            initColumnChart();
        }
    };

    $scope.changeMode = function () {
        if ($scope.currentMode === "site") {
            $scope.currentMode = "column";
            if ($scope.sitemap.length) {
                getColumn($scope.sitemap[$scope.sitemap.length - 1]);
            } else {
                getColumn($scope.currentData[0]);
            }
        } else {
            $scope.columnmap = [];
            if ($scope.sitemap.length > 0) {
                if ($scope.sitemap[$scope.sitemap.length - 1].children) {
                    $scope.currentData = $scope.sitemap[$scope.sitemap.length - 1].children;
                } else {
                    // $scope.currentData = $scope.sitemap[$scope.sitemap.length - 2].children;
                    // $scope.sitemap.pop();
                    swal("该网站无子站点");
                    return;
                }
            } else {
                $scope.navClick("root");
            }
            $scope.currentMode = "site";
            initSiteChart();
        }
    };

    var getOptionData = function (v, d) {
        var data = [];
        var legend = [];
        var Axis = [];
        for (var i = 0; i < d.length; i++) {
            var e = d[i];
            for (var n = 0; n < v.length; n++) {
                data[n] || (data[n] = []);
                data[n].push(e[v[n].key]);
                legend[n] = v[n].value;
            }
            Axis.push(e.name);
        }

        return {data: data, legend: legend, Axis: Axis};
    };

    var offEnent = function () {
        left.off("click");
        right.off("click");
    };

    var initSiteChart = function () {
        var o = getOptionData($scope.currentMap, $scope.currentData.slice(0, 5));
        left.setOption(getPie(o));
        right.setOption(getBar(o));
        offEnent();
        var click = function (params) {
            if (!$scope.currentData[params.dataIndex].children) {
                //无子站点时
                $scope.currentMode = "column";
                $scope.sitemap.push($scope.currentData[params.dataIndex]);
                getColumn($scope.currentData[params.dataIndex])
            } else {
                //有子站点时
                $scope.sitemap.push($scope.currentData[params.dataIndex]);
                $scope.currentData = $scope.currentData[params.dataIndex].children;
                initSiteChart();
            }
            bubble.updateScope($scope);
        };
        left.on('click', click);
        right.on('click', click);
    };

    var initColumnChart = function () {
        var o = getOptionData($scope.currentMap, $scope.currentData.slice(0, 5));
        left.setOption(getPie(o));
        right.setOption(getBar(o));
        offEnent();
        var cb = function (params) {
            if ($scope.currentData[params.dataIndex].children) {
                $scope.columnmap.push($scope.currentData[params.dataIndex]);
                $scope.currentData = $scope.currentData[params.dataIndex].children;
                initColumnChart();
            }
            bubble.updateScope($scope);
        };
        left.on('click', cb);
        right.on('click', cb);
    };

    var getColumn = function (v) {
        $scope.currentMap = columnmap;
        loading(true);
        var cb = function (rs) {
            loading(false);
            if (rs && !rs.errorcode) {
                $scope.currentData = reviewData(rs, "contentId");
                initColumnChart();
            }
        };
        if (currentTime != "all") {
            bubble._call("webShow.getcolumn|17", appid, v.webId, getTimestamp(currentTime).join(",")).success(cb);
        } else {
            bubble._call("webShow.getcolumnall|17", appid, v.webId).success(cb);
        }
    };

    var reviewData = function (v, key) {
        var rs = [];
        for (var tmp in v) {
            rs.push(v[tmp]);
        }
        rs = bubble.sortBy(rs, "article");
        rs = bubble.getTreeData(rs, key);
        return rs;
    };

    $scope.getData = function (type) {
        currentTime = type;
        loading(true);
        var cb = function (v) {
            loading(false);
            if (v && !v.errorcode) {
                var name = Object.getOwnPropertyNames(v);
                $scope.yaqtestdata = v[name[0]];
                left = echarts.init($(".charts-left")[0]);
                right = echarts.init($(".charts-right")[0]);
                $scope.currentData = reviewData($scope.yaqtestdata, "webId");
                $scope.currentMap = sitemap;
                initSiteChart();
            }
        };
        if (type.indexOf(",") >= 0) {
            bubble._call("webShow.state|17", appid, type, 1, 50).success(cb);
            return;
        }
        switch (type) {
            case "day":
            case "week":
            case "month":
                bubble._call("webShow.state|17", appid, getTimestamp(type).join(","), 1, 50).success(cb);
                break;
            case "all":
                bubble._call("webShow.all|17", appid, 1, 50).success(cb);
                break;
            default:
                bubble._call("webShow.state|17", appid, getTimestamp("day").join(","), 1, 50).success(cb);
                break;
        }
    };

    $scope.getData("all");

    $(window).resize(resize);
});