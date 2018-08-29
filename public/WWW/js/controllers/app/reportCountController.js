bubbleFrame.register('reportCountController', function ($scope, $timeout, bubble, $http, $modal, $state) {
    var barData = {
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
            top: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                data: ['全部', '已受理', '已拒绝', '已同意', '已完成'],
            }
        ],
        yAxis: [{type: 'value'}],
        series: [
            {
                name: '直接访问',
                type: 'bar',
                barWidth: '60%',
                data: [
                    {value: bubble.random(10, 200), itemStyle: {normal: {color: "#27c24c"}}},
                    {value: bubble.random(10, 200), itemStyle: {normal: {color: "#55c3e6"}}},
                    {value: bubble.random(10, 200), itemStyle: {normal: {color: "#958dc6"}}},
                    {value: bubble.random(10, 200), itemStyle: {normal: {color: "#f7de69"}}},
                    {value: bubble.random(10, 200), itemStyle: {normal: {color: "#f18282"}}},
                ]
            }
        ]
    };
    var pieData = {
        tooltip: {
            trigger: 'item',
            formatter: "{b} : {c} ({d}%)",
            extraCssText: "top:20px;left:20px;"
        },
        series: [
            {
                type: 'pie',
                radius: '65%',
                center: ['50%', '50%'],
                data: [
                    {value: bubble.random(10, 200), itemStyle: {normal: {color: "#27c24c"}}, name: "全部"},
                    {value: bubble.random(10, 200), itemStyle: {normal: {color: "#55c3e6"}}, name: "已受理"},
                    {value: bubble.random(10, 200), itemStyle: {normal: {color: "#958dc6"}}, name: "已拒绝"},
                    {value: bubble.random(10, 200), itemStyle: {normal: {color: "#f7de69"}}, name: "已同意"},
                    {value: bubble.random(10, 200), itemStyle: {normal: {color: "#f18282"}}, name: "已完成"},
                ],
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };
    var lineData = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                label: {
                    backgroundColor: '#6a7985'
                }
            },
            extraCssText: "top:20px;left:20px;"
        },
        grid: {
            left: '3%',
            top: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                boundaryGap: false,
                data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
            }
        ],
        yAxis: [
            {
                type: 'value'
            }
        ],
        series: [
            {
                type: 'line',
                stack: '总量',
                areaStyle: {normal: {opacity: 0}},
                lineStyle: {normal: {color: "#958dc6"}},
                data: [bubble.random(10, 200), bubble.random(10, 200), bubble.random(10, 200), bubble.random(10, 200), bubble.random(10, 200), bubble.random(10, 200), bubble.random(10, 200)]
            },
            {
                type: 'line',
                stack: '总量',
                areaStyle: {normal: {opacity: 0}},
                lineStyle: {normal: {color: "#27c24c"}},
                data: [bubble.random(10, 200), bubble.random(10, 200), bubble.random(10, 200), bubble.random(10, 200), bubble.random(10, 200), bubble.random(10, 200), bubble.random(10, 200)]
            },
            {
                type: 'line',
                stack: '总量',
                areaStyle: {normal: {opacity: 0}},
                lineStyle: {normal: {color: "#f7de69"}},
                data: [bubble.random(10, 200), bubble.random(10, 200), bubble.random(10, 200), bubble.random(10, 200), bubble.random(10, 200), bubble.random(10, 200), bubble.random(10, 200)]
            },
            {
                type: 'line',
                stack: '总量',
                areaStyle: {normal: {opacity: 0}},
                lineStyle: {normal: {color: "#f18282"}},
                data: [bubble.random(10, 200), bubble.random(10, 200), bubble.random(10, 200), bubble.random(10, 200), bubble.random(10, 200), bubble.random(10, 200), bubble.random(10, 200)]
            },
        ]
    };
    $scope.list = [];
    $scope.list.push({
        option: JSON.parse(JSON.stringify(barData)),
        chars: "bar",
        type: "day",
        time: "1",
        control: {},
        title: "举报数量统计",
        onTypeChange: function (v) {
            if (v == this.type) {
                return;
            }
            this.option.series[0].data.map(function (v) {
                v.value = bubble.random(10, 200);
            });
            this.control.refresh();
        },
        onCharsChange: function (v) {
            if (v == this.chars) {
                return;
            }
            eval("this.option = " + v + "Data");
            this.control.refresh(eval(v + "Data"));
        },
        onTimeChange: function (v) {
            if (v == this.time) {
                return;
            }
            this.option.series[0].data.map(function (v) {
                v.value = bubble.random(10, 200);
            });
            this.control.refresh();
        },
    });
    $scope.list.push({
        option: JSON.parse(JSON.stringify(barData)),
        chars: "bar",
        type: "day",
        time: "1",
        control: {},
        title: "举报地区统计",
        onTypeChange: function (v) {
            if (v == this.type) {
                return;
            }
            this.option.series[0].data.map(function (v) {
                v.value = bubble.random(10, 200);
            });
            this.control.refresh();
        },
        onCharsChange: function (v) {
            if (v == this.chars) {
                return;
            }
            eval("this.option = " + v + "Data");
            this.control.refresh(eval(v + "Data"));
        },
        onTimeChange: function (v) {
            if (v == this.time) {
                return;
            }
            this.option.series[0].data.map(function (v) {
                v.value = bubble.random(10, 200);
            });
            this.control.refresh();
        },
    });
    $scope.list.push({
        option: JSON.parse(JSON.stringify(lineData)),
        chars: "bar",
        type: "day",
        time: "1",
        control: {},
        title: "举报趋势",
        charsShow: false,
        onTypeChange: function (v) {
            if (v == this.type) {
                return;
            }
            this.option.series[0].data.map(function (v) {
                v.value = bubble.random(10, 200);
            });
            this.control.refresh();
        },
        onCharsChange: function (v) {
            if (v == this.chars) {
                return;
            }
            eval("this.option = " + v + "Data");
            this.control.refresh(eval(v + "Data"));
        },
        onTimeChange: function (v) {
            if (v == this.time) {
                return;
            }
            this.option.series[0].data.map(function (v) {
                v.value = bubble.random(10, 200);
            });
            this.control.refresh();
        },
    });
    $scope.list.push({
        option: JSON.parse(JSON.stringify(barData)),
        chars: "bar",
        type: "day",
        time: "1",
        control: {},
        title: "举报时段统计",
        date: false,
        charsShow: false,
        timeShow: false,
        onTypeChange: function (v) {
            if (v == this.type) {
                return;
            }
            this.option.series[0].data.map(function (v) {
                v.value = bubble.random(10, 200);
            });
            this.control.refresh();
        },
        onCharsChange: function (v) {
            if (v == this.chars) {
                return;
            }
            eval("this.option = " + v + "Data");
            this.control.refresh(eval(v + "Data"));
        },
        onTimeChange: function (v) {
            if (v == this.time) {
                return;
            }
            this.option.series[0].data.map(function (v) {
                v.value = bubble.random(10, 200);
            });
            this.control.refresh();
        },
    });
    $scope.list.push({
        option: JSON.parse(JSON.stringify(barData)),
        chars: "bar",
        type: "day",
        time: "1",
        control: {},
        title: "举报来源统计",
        onTypeChange: function (v) {
            if (v == this.type) {
                return;
            }
            this.option.series[0].data.map(function (v) {
                v.value = bubble.random(10, 200);
            });
            this.control.refresh();
        },
        onCharsChange: function (v) {
            if (v == this.chars) {
                return;
            }
            eval("this.option = " + v + "Data");
            this.control.refresh(eval(v + "Data"));
        },
        onTimeChange: function (v) {
            if (v == this.time) {
                return;
            }
            this.option.series[0].data.map(function (v) {
                v.value = bubble.random(10, 200);
            });
            this.control.refresh();
        },
    });
});