import $ from "jquery";
var BubbleCount = function (bubble) {
    var _this = this;
    var echarts = window.echarts;
    var siteid = "597ff7609c93690f5a54291b";

    var yaqtestdata = [
        { "webID": "312314", "appId": "432423422r2", "article": 12, "view": 312, "reported": 32, "consulted": 21, "time": 21341233, "name": "企务公开" },
        { "webID": "312314", "appId": "432423422r2", "article": 12, "view": 312, "reported": 32, "consulted": 21, "time": 21341233, "name": "院务公开" },
    ];

    var keymap = {
        article: "文章发布量",
        view: "文章浏览量",
        reported: "被举报量",
        consulted: "被咨询量",
    }

    var renderCheck = function (v) {
        if (v.selector === undefined) {
            throw new Error("渲染缺少参数[selector],请于option中确认");
        }
        if (v.type === undefined) {
            throw new Error("渲染缺少参数[type],请于option中确认");
        }
        if (v.call === undefined) {
            throw new Error("渲染缺少参数[call],请于option中确认");
        }
    }

    var getBar = function () {
        return {
            color: ['#3398DB'],
            tooltip: {
                trigger: 'axis',
                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                    type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                }
            },
            grid: {
                top: '3%',
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'category',
                    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    axisTick: {
                        alignWithLabel: true
                    }
                }
            ],
            yAxis: [
                {
                    type: 'value'
                }
            ],
            series: [
                {
                    name: '直接访问',
                    type: 'bar',
                    barWidth: '40%',
                    data: [10, 52, 200, 334, 390, 330, 220],
                    animation: true,
                    itemStyle: {
                        normal: {
                            barBorderRadius: [5, 5, 0, 0],
                            color: new echarts.graphic.LinearGradient(
                                0, 0, 0, 1,
                                [
                                    { offset: 0, color: '#83bff6' },
                                    { offset: 0.5, color: '#188df0' },
                                    { offset: 1, color: '#188df0' }
                                ]
                            )
                        },
                        emphasis: {
                            barBorderRadius: [5, 5, 0, 0],
                            color: new echarts.graphic.LinearGradient(
                                0, 0, 0, 1,
                                [
                                    { offset: 0, color: '#2378f7' },
                                    { offset: 0.7, color: '#2378f7' },
                                    { offset: 1, color: '#83bff6' }
                                ]
                            )
                        }
                    },
                }
            ]
        }
    }

    var getPie = function () {
        return {
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            series: [
                {
                    name: '访问来源',
                    type: 'pie',
                    radius: '70%',
                    center: ['50%', '50%'],
                    data: [
                        { value: 335, name: '直接访问' },
                        { value: 310, name: '邮件营销' },
                        { value: 234, name: '联盟广告' },
                        { value: 135, name: '视频广告' },
                        { value: 1548, name: '搜索引擎' }
                    ],
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                }
            ]
        }
    }

    var getOption = function (option) {
        var rs = null;
        switch (option.type) {
            case "pie":
                rs = getPie(option);
                break;
            case "line":
                throw new Error("统计模块暂不支持[折线图]类型,请于更新日志中确认");
            case "bar":
                rs = getBar(option);
                break;
        }

        return rs;
    }

    /**
     * @description 渲染echarts图表
     * @param {object} option
     * type        string       Echarts图表类型
     * charts      object       该对象中的值将会覆写默认配置,内层配置由["_"]
     * selector    string       图表容器选择器
     * call        string       数据来源接口
     * theme       string       所用主题
     * onClick     function     Echarts点击事件
     * @returns {object} Echarts Object.
     */
    this.render = function (option) {
        renderCheck(option);
        var box = $(option.selector);

        var obj = box.length ? echarts.init(box[0]) : undefined;
        obj.setOption(getOption(option));

        return obj;
    }
}

export default BubbleCount;