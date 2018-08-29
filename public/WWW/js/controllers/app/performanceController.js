bubbleFrame.register('performanceController', function ($scope, bubble) {
    var bar = {
        "color": [
            "#3398DB"
        ],
        "tooltip": {
            "trigger": "axis",
            "axisPointer": {
                "type": "shadow"
            },
            "extraCssText": "top:20px !important;left:20px !important;"
        },
        "grid": {
            "left": "3%",
            "top": "17%",
            "right": "4%",
            "bottom": "3%",
            "containLabel": true
        },
        "yAxis": [
            {
                "type": "category",
                "data": [
                    "GrapeContent.Content.ShowByGroupId",
                    "GrapeTemplate.TemplateContext.TempFindByTids",
                    "GrapeContent.ContentGroup.getPrevCol",
                    "GrapeWord.Word.ShowWord",
                    "GrapeContent.ContentGroup.GroupPageBy",
                    "GrapeMenu.Menu.ShowMenu",
                    "GrapeReport.Report.Count",
                    "GrapeContent.Content.PageBy",
                    "GrapeFile.Files.PageBy",
                    "GrapeUser.user.UserLogin"
                ]
            }
        ],
        "xAxis": [
            {
                "type": "value"
            }
        ],
        "series": [
            {
                "name": "调用次数",
                "type": "bar",
                "itemStyle": {
                    "normal": {
                        "color": "#27c24c"
                    }
                },
                "data": [
                    24555, 4132, 3862, 3324, 3244, 2333, 2159, 1659, 1479, 1400
                ]
            }
        ]
    };

    var bartime = {
        color: ['#3398DB'],
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            extraCssText: "top:20px !important;left:20px !important;"
        },
        grid: {
            left: '3%',
            top: '17%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        yAxis: [
            {
                type: 'category',
                data: [],
            }
        ],
        xAxis: [{type: 'value'}],
        series: []
    };

    var barsize = {
        color: ['#3398DB'],
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            extraCssText: "top:20px !important;left:20px !important;"
        },
        grid: {
            left: '3%',
            top: '17%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        yAxis: [
            {
                type: 'category',
                data: [],
            }
        ],
        xAxis: [{type: 'value'}],
        series: []
    };

    $scope.list = [];
    var color = ["#27c24c", "#55c3e6", "#958dc6", "#f7de69", "#f18282", "#C3BED4", "#376956", "#C7FFEC", "#EEE8AB", "#FD5B78"];

    var insertData = function (v, l, o, i, name) {
        v = v[i];
        var data = [];
        var ydata = [];
        var count = 0;
        for (var i = 0; i < l.length; i++) {
            var t = l[i];
            for (var tmp in v[t]) {
                data.push({value: v[t][tmp], itemStyle: {normal: {color: color[count % 9]}}});
                ydata.push(tmp);
                count++;
            }
            count = 0;
        }
        o.yAxis[0].data = ydata;
        o.series = [{
            name: name,
            type: 'bar',
            data: data
        }];
        return o;
    };

    var time = "";
    var times = [];
    var stime = "";
    var etime = "";
    var current = 0;
    var count = 0;
    var cache = [{}, {}, {}];

    for (var i = 0; i < 1; i++) {
        time = moment().add(-1 * (i + 1), 'days').format('YYYY/MM/DD');
        time = time.split("/");
        current = --time[time.length - 1];
        time = time.join("/");
        stime = Date.parse(new Date(time + " 00:00:00"));
        etime = Date.parse(new Date(time + " 23:59:59"));
        times.push(time.replace(/\//g, "-"));
    }

    for (var i = 0; i < times.length; i++) {
        (function (n) {
            var counttime = 0;
            $.get('http://123.57.214.226:801/GrapeFW/GrapeFW/preAnalysisService/callCount/s:/prelog/s:[{"field":"starttime","logic":">","value":"func:from_unixtime(' + stime + ')"},{"field":"endtime","logic":"<","value":func:from_unixtime(' + etime + ')}]/i:10', function (v) {
                if (!v) {
                    count++;
                    return;
                }
                v = JSON.parse(v);
                v = v.record.data;
                v.map(function (v) {
                    cache[0][n] || (cache[0][n] = {});
                    cache[0][n][v.function] = v["count(*)"];
                });
                if (++count == times.length) {
                    $scope.list.push({
                        title: "调用次数",
                        option: insertData(cache, times, bar, 0, "调用次数"),
                        control: {},
                    });
                    bubble.updateScope($scope);
                }
            });
        })(times[i]);
        (function (n) {
            var counttime = 0;
            $.get('http://123.57.214.226:801/GrapeFW/GrapeFW/preAnalysisService/callTime/s:/prelog/s:[{"field":"starttime","logic":">","value":"func:from_unixtime(' + stime + ')"},{"field":"endtime","logic":"<","value":func:from_unixtime(' + etime + ')}]/i:10', function (v) {
                if (!v) {
                    counttime++;
                    return;
                }
                v = JSON.parse(v);
                v = v.record.data;
                v.map(function (v) {
                    cache[1][n] || (cache[1][n] = {});
                    cache[1][n][v.function] = v["avg(usetime)"];
                });
                if (++counttime == times.length) {
                    $scope.list.push({
                        title: "调用响应时间",
                        option: insertData(cache, times, bartime, 1, "调用响应时间"),
                        control: {},
                    });
                    bubble.updateScope($scope);
                }
            });
        })(times[i]);
        (function (n) {
            var counttime = 0;
            $.get('http://123.57.214.226:801/GrapeFW/GrapeFW/preAnalysisService/callInfo/s:/prelog/s:[{"field":"starttime","logic":">","value":"func:from_unixtime(' + stime + ')"},{"field":"endtime","logic":"<","value":func:from_unixtime(' + etime + ')}]/s:avg(buffsize)/s:function/i:10', function (v) {
                if (!v) {
                    counttime++;
                    return;
                }
                v = JSON.parse(v);
                v = v.record.data;
                v.map(function (v) {
                    cache[2][n] || (cache[2][n] = {});
                    cache[2][n][v.function] = v["avg(buffsize)"];
                });
                if (++counttime == times.length) {
                    $scope.list.push({
                        title: "调用数据量",
                        option: insertData(cache, times, barsize, 2, "调用数据量"),
                        control: {},
                    });
                    bubble.updateScope($scope);
                }
            });
        })(times[i])
    }
});