(function () {
    /**
     * 表格描述配置
     * data:数据类型[int:, s:, array-s:, select:, bool:, json:, ajaxselect:, time:]     冒号后可接默认值
     * mark:说明
     * visible:是否表格中显示
     * edit:是否表格中可编辑
     * dictionaries:描述select各项中文说明和值的对应关系,仅当数据类型为select时有效
     * onRender:表格渲染该数据时的回调,返回值为表格中显示的内容
     * search:{column: "搜索字段|搜索字段|搜索字段|搜索字段"}
     * max: 最大显示字符数
     * ajax:用于ajaxselect接口名
     * contentKey:用于ajaxselect 关联字段名
     * base64: 标识该字段在搜索时是否需要base64编码
     */
    bubbleFrame.registerFields("user", {
        registerip: {
            data: "s:",
            mark: "注册IP",
            visible: false,
            edit: false
        },
        isreview: {
            data: "select:允许|禁止",
            dictionaries: {"1": "允许", "0": "禁止"},
            mark: "审核权限",
            visible: true,
            edit: true
        },
        isvisble: {
            data: "select:是|否",
            dictionaries: {"1": "是", "0": "否"},
            mark: "是否显示",
            visible: false,
            edit: true
        },
        birthday: {
            data: "s:",
            mark: "生日",
            visible: false,
            edit: false
        },
        mobphone: {
            data: "s:",
            mark: "手机号",
            visible: true,
            edit: true
        },
        sex: {
            data: "select:男|女",
            dictionaries: {"1": "男", "0": "女"},
            mark: "性别",
            visible: true,
            edit: true
        },
        name: {
            data: "s:",
            mark: "姓名",
            visible: true,
            edit: true
        },
        roleName: {
            data: "s:",
            mark: "所在用户组",
            visible: true,
            edit: false
        },
        state: {
            data: "select:开启|关闭",
            dictionaries: {"1": "开启", "0": "关闭"},
            mark: "状态",
            visible: true,
            edit: true
        },
        email: {
            data: "s:",
            mark: "邮箱",
            visible: true,
            edit: true
        },
        import: true,
        search: {
            column: "name"
        },
    }).registerFields("content", {
        mainName: {
            data: "s:",
            mark: "文章标题",
            visible: true,
            edit: true
        },
        author: {
            data: "s:",
            mark: "作者",
            visible: true,
            edit: true
        },
        souce: {
            data: "s:",
            mark: "来源",
            visible: true,
            edit: true
        },
        clickcount: {
            data: "s:",
            mark: "阅读量",
            visible: true,
            edit: true
        },
        search: {
            column: "mainName"
        },
    }).registerFields("userGroup", {
        name: {
            data: "s:",
            mark: "组名称",
            visible: true,
            edit: false
        },
        search: {
            column: "name"
        },
    }).registerFields("message", {
        floor: {
            data: "int:",
            mark: "楼层",
            visible: true,
            edit: false
        },
        messageDate: {
            data: "date:",
            mark: "留言时间",
            visible: true,
            edit: false,
            onRender: function (v) {
                return v.$numberLong ? new Date(v.$numberLong * 1000).Format("yyyy-MM-dd hh:mm:ss") : new Date(v * 1000).Format("yyyy-MM-dd hh:mm:ss");
            }
        },
        messageContent: {
            data: "s:",
            mark: "留言内容",
            visible: true,
            edit: true
        },
    }).registerFields("vote", {
        name: {
            data: "s:",
            mark: "投票名称",
            visible: true,
            edit: true
        },
        vote: {
            data: "array-s:",
            mark: "投票项",
            visible: false,
            edit: false
        },
        starttime: {
            data: "int:",
            mark: "开始时间",
            visible: true,
            edit: false,
        },
        endtime: {
            data: "s:",
            mark: "结束时间",
            visible: true,
            edit: true
        },
        timediff: {
            data: "s:",
            mark: "投票间隔时间",
            visible: true,
            edit: true
        },
        ismulti: {
            data: "select:是|否",
            dictionaries: {"1": "是", "0": "否"},
            mark: "是否多选",
            visible: true,
            edit: true
        },
    }).registerFields("advertisement", {
        adname: {
            data: "s:",
            mark: "广告名称",
            visible: true,
            edit: true
        },
        addesp: {
            data: "s:",
            mark: "广告说明",
            visible: true,
            edit: true
        },
        width: {
            data: "s:",
            mark: "广告宽度",
            visible: true,
            edit: true,
        },
        height: {
            data: "s:",
            mark: "广告高度",
            visible: true,
            edit: true,
        },
        adtype: {
            data: "select:横幅|图片轮播图",
            dictionaries: {"2": "横幅", "0": "图片轮播图"},
            mark: "广告类型",
            visible: true,
            edit: true
        },
    }).registerFields("ads", {
        adsname: {
            data: "s:",
            mark: "广告名称",
            visible: true,
            edit: true
        },
        adsdesp: {
            data: "s:",
            mark: "广告说明",
            visible: true,
            edit: true
        },
        adsheight: {
            data: "s:",
            mark: "广告高度",
            visible: true,
            edit: true,
        },
        adswidth: {
            data: "s:",
            mark: "广告宽度",
            visible: true,
            edit: true,
        },
        iseffect: {
            data: "s:",
            mark: "iseffect",
            visible: true,
            edit: false,
        },
    }).registerFields("site", {
        policeid: {
            data: "s:",
            mark: "未知policeid",
            visible: false,
            edit: false
        },
        engerid: {
            data: "s:",
            mark: "未知engerid",
            visible: false,
            edit: false
        },
        isvisble: {
            data: "select:是|否",
            dictionaries: {"1": "是", "0": "否"},
            mark: "是否显示",
            visible: true,
            edit: true,
        },
        sort: {
            data: "s:",
            mark: "排序",
            visible: false,
            edit: false
        },
        title: {
            data: "s:",
            mark: "站点名称",
            visible: true,
            edit: true
        },
        icp: {
            data: "s:",
            mark: "ICP",
            visible: true,
            edit: true
        },
        host: {
            data: "s:",
            mark: "主机",
            visible: true,
            edit: true
        },
        logo: {
            data: "s:",
            mark: "LOGO",
            visible: true,
            edit: true
        },
    }).registerFields("link", {
        desp: {
            data: "s:",
            mark: "链接描述",
            visible: true,
            edit: true
        },
        email: {
            data: "s:",
            mark: "站长邮箱",
            visible: true,
            edit: true
        },
        logo: {
            data: "s:",
            mark: "链接LOGO",
            visible: true,
            edit: true
        },
        name: {
            data: "s:",
            mark: "链接名称",
            visible: true,
            edit: true
        },
        time: {
            data: "s:",
            mark: "创建时间",
            visible: true,
            edit: false
        },
        url: {
            data: "s:",
            mark: "链接地址",
            visible: true,
            edit: true
        },
    }).registerFields("app", {
        id: {
            data: "s:",
            mark: "id",
            visible: true,
            edit: false
        },
        name: {
            data: "s:",
            mark: "app名称",
            visible: true,
            edit: true
        },
        desp: {
            data: "s:",
            mark: "app描述",
            visible: true,
            edit: true
        },
        domain: {
            data: "s:",
            mark: "app域名",
            visible: true,
            edit: true
        },
        ctime: {
            data: "date:",
            mark: "创建时间",
            visible: true,
            edit: false
        },
    }).registerFields("service", {
        id: {
            data: "s:",
            mark: "id",
            visible: true,
            edit: false
        },
        tableConfig: {
            data: "s:",
            mark: "表单描述",
            visible: true,
            edit: true
        },
        serviceName: {
            data: "s:",
            mark: "服务名称",
            visible: true,
            edit: true
        },
        serviceDescription: {
            data: "s:",
            mark: "服务描述",
            visible: true,
            edit: true
        },
        url: {
            data: "s:",
            mark: "服务URL",
            visible: true,
            edit: true
        },
        state: {
            data: "int:",
            mark: "服务状态",
            visible: true,
            edit: true
        },
        useProtocol: {
            data: "int:",
            mark: "服务协议",
            visible: true,
            edit: true
        },
        ctime: {
            data: "s:",
            mark: "创建时间",
            visible: true,
            edit: false
        },
    }).registerFields("interface", {
        interface: {
            data: "s:",
            mark: "接口名称",
            visible: true,
            edit: true
        },
        readtime: {
            data: "s:",
            mark: "readtime",
            visible: true,
            edit: true
        },
        desp: {
            data: "s:",
            mark: "接口描述",
            visible: true,
            edit: true
        },
        appclsid: {
            data: "s:",
            mark: "appclsid",
            visible: true,
            edit: true
        },
    }).registerFields("task", {
        name: {
            data: "s:",
            mark: "任务名称",
            visible: true,
            edit: true,
            required: true,
            type: "email"
        },
        type: {
            data: "select:类型1|类型2|类型3",
            dictionaries: {"1": "类型1", "2": "类型2", "3": "类型3"},
            mark: "任务类型",
            init: "1",
            visible: true,
            edit: true
        },
        lasttime: {
            data: "date:",
            mark: "截止时间",
            visible: true,
            edit: true
        },
        state: {
            data: "select:未开始|已开始|已完成",
            dictionaries: {"0": "未开始", "1": "已开始", "2": "已完成"},
            mark: "任务状态",
            visible: true,
            edit: false
        },
        ownid: {
            data: "s:",
            mark: "任务所有者",
            visible: true,
            edit: false
        },
    }).registerFields("tempList", {
        name: {
            data: "s:",
            mark: "模板组名称",
            visible: true,
            edit: true,
            required: true,
        },
        ownid: {
            data: "s:",
            mark: "模板所有者",
            visible: true,
            edit: true
        },
    }).registerFields("template", {
        name: {
            data: "s:",
            mark: "模板名称",
            visible: true,
            edit: true,
            required: true,
        },
        ownid: {
            data: "s:",
            mark: "模板所有者",
            visible: true,
            edit: true
        },
        time: {
            data: "date:",
            mark: "模板创建时间",
            visible: true,
            edit: false
        }
    }).registerFields("wechat", {
        invoke: {
            data: "s:",
            mark: "回调函数",
            visible: true,
            edit: true,
            required: true,
        },
        sdkname: {
            data: "s:",
            mark: "SDK名称",
            visible: true,
            edit: true
        },
    }).registerFields("wechatUser", {
        name: {
            data: "s:",
            mark: "用户名称",
            visible: true,
            edit: true,
            required: true,
        },
        configstring: {
            data: 'json:',
            mark: "配置字符串",
            visible: true,
            edit: true,
            field: {
                appid: {
                    data: "s:",
                    mark: "appid",
                    edit: true,
                    visible: false
                },
                appsecret: {
                    data: "s:",
                    mark: "appsecret",
                    edit: true,
                    visible: false
                },
            }
        },
    }).registerFields("email", {
        ownid: {
            data: "s:",
            mark: "拥有者",
            visible: true,
            edit: false,
        },
        password: {
            data: "s:",
            mark: "密码",
            visible: true,
            edit: true
        },
        pop3: {
            data: "s:",
            mark: "pop3",
            visible: true,
            edit: true
        },
        smtp: {
            data: "s:",
            mark: "smtp",
            visible: true,
            edit: true
        },
        state: {
            data: "select:未激活|激活",
            dictionaries: {"0": "未激活", "1": "激活"},
            mark: "状态",
            visible: true,
            edit: false
        },
        time: {
            data: "date:",
            mark: "创建时间",
            visible: true,
            edit: false
        },
        userid: {
            data: "s:",
            mark: "用户ID",
            visible: true,
            edit: true
        },
    }).registerFields("report", {
        Wrongdoer: {
            data: "s:",
            mark: "被举报人",
            visible: true,
            edit: false
        },
        WrongdoerSex: {
            data: "select:男|女",
            dictionaries: {"0": "男", "1": "女"},
            mark: "被举报性别",
            visible: true,
            edit: false
        },
        WrongdoerSex: {
            data: "select:公开|非公开",
            dictionaries: {"0": "公开", "1": "非公开"},
            mark: "公开",
            visible: true,
            edit: false
        },
        content: {
            data: "s:",
            mark: "举报内容",
            visible: true,
            edit: false,
            width: "25%",
            base64: true
        },
        time: {
            data: "date:",
            mark: "举报时间",
            visible: true,
            edit: false
        },
        state: {
            data: "select:待处理|处理中|已处理|被拒绝",
            dictionaries: {"0": "待处理", "1": "处理中", "2": "已处理", "3": "被拒绝"},
            mark: "举报状态",
            visible: true,
            edit: false,
            onRender: function (v) {
                switch (v) {
                    case "处理中":
                        return "<span class='text-info'>" + v + "</span>";
                    case "已处理":
                        return "<span class='text-success'>" + v + "</span>";
                    case "被拒绝":
                        return "<span class='text-danger'>" + v + "</span>";
                    default:
                        return v;
                }
            }
        },
        search: {
            column: "content|time"
        },
        export: true
    }).registerFields("reportAdmin", {
        phone: {
            data: "s:",
            mark: "接受短信手机号",
            visible: true,
            edit: true,
        },
        timediff: {
            data: "time:",
            mark: "发送间隔",
            visible: true,
            edit: true
        },
        time: {
            data: "date:",
            mark: "添加时间",
            visible: true,
            edit: false,
        },
        neartime: {
            data: "date:",
            mark: "最后一次接收短信时间",
            visible: true,
            edit: false,
            onRender: function (v) {
                return v ? new Date(v).Format("yyyy-MM-dd hh:mm:ss") : "暂无";
            }
        },
    }).registerFields("reportType", {
        TypeName: {
            data: "s:",
            mark: "类型名称",
            visible: true,
            edit: true,
        }
    }).registerFields("search", {
        content: {
            data: "s:",
            mark: "热词名称",
            visible: true,
            edit: false,
        },
        count: {
            data: "int:",
            mark: "热词使用次数",
            visible: true,
            edit: false,
        }
    }).registerFields("reportReply", {
        Rcontent: {
            data: "s:",
            mark: "回复内容",
            visible: true,
            edit: true,
        },
        count: {
            data: "s:",
            mark: "使用次数",
            visible: true,
            edit: false,
        }
    }).registerFields("person", {
        registerip: {
            data: "s:",
            mark: "注册IP",
            visible: false,
            edit: false
        },
        isvisble: {
            data: "select:是|否",
            dictionaries: {"1": "是", "0": "否"},
            mark: "是否显示",
            visible: false,
            edit: true
        },
        birthday: {
            data: "s:",
            mark: "生日",
            visible: false,
            edit: false
        },
        mobphone: {
            data: "s:",
            mark: "手机号",
            visible: true,
            edit: true
        },
        sex: {
            data: "select:男|女",
            dictionaries: {"1": "男", "0": "女"},
            mark: "性别",
            visible: true,
            edit: true
        },
        name: {
            data: "s:",
            mark: "用户名",
            visible: true,
            edit: true
        },
        state: {
            data: "select:开启|关闭",
            dictionaries: {"1": "开启", "0": "关闭"},
            mark: "状态",
            visible: true,
            edit: true
        },
        email: {
            data: "s:",
            mark: "邮箱",
            visible: true,
            edit: true
        },
    }).registerFields("suggest", {
        name: {
            data: "s:",
            mark: "咨询人姓名",
            visible: true,
            edit: false
        },
        score: {
            data: "s:",
            mark: "评分",
            visible: true,
            edit: false
        },
        consult: {
            data: "s:",
            mark: "被咨询人",
            visible: true,
            edit: false
        },
        content: {
            data: "s:",
            mark: "咨询内容",
            visible: true,
            edit: false
        },
        mode: {
            data: "select:匿名|实名",
            dictionaries: {"1": "匿名", "0": "实名"},
            mark: "咨询方式",
            visible: true,
            edit: false
        },
        time: {
            data: "date:",
            mark: "咨询时间",
            visible: true,
            edit: false
        },
        replyTime: {
            data: "date:",
            mark: "回复时间",
            visible: true,
            edit: false
        },
        replyContent: {
            data: "s:",
            mark: "回复内容",
            visible: true,
            edit: false
        },
        state: {
            data: "select:已受理|已提交|已回复",
            dictionaries: {"1": "已受理", "0": "已提交", "2": "已回复"},
            mark: "咨询状态",
            visible: true,
            edit: false
        },
        slevel: {
            data: "select:公开|非公开",
            dictionaries: {"0": "公开", "1": "非公开"},
            mark: "公开状态",
            visible: true,
            edit: false,
            onRender: function (v) {
                if (v == "公开") {
                    return "<span class='text-info'>" + v + "</span>";
                }
                if (v == "非公开") {
                    return "<span class='text-danger'>" + v + "</span>";
                }
            }
        },
        reviewstate: {
            data: "select:审核不通过|审核通过",
            dictionaries: {"1": "审核不通过", "0": "审核通过"},
            mark: "审核状态",
            visible: true,
            edit: false
        },
    }).registerFields("actobj", {
        name: {
            data: "s:",
            mark: "投稿标题名称",
            visible: true,
            edit: false
        },
        number: {
            data: "s:",
            mark: "编号",
            visible: true,
            edit: false
        },
        tid: {
            data: "s:",
            mark: "所属类型",
            visible: true,
            edit: false
        },
        time: {
            data: "date:",
            mark: "投稿时间",
            visible: true,
            edit: false
        },
        voteCnt: {
            data: "s:",
            mark: "投票数",
            visible: true,
            edit: false
        },
        vCnt: {
            data: "s:",
            mark: "投稿浏览量",
            visible: true,
            edit: false
        },
        state: {
            data: "select:待审核|已审核|审核拒绝",
            dictionaries: {"1": "待审核", "0": "已审核", "4": "审核拒绝"},
            mark: "投稿状态",
            visible: true,
            edit: true
        },
    }).registerFields("actevent", {
        name: {
            data: "s:",
            mark: "活动名称",
            visible: true,
            edit: true
        },
        number: {
            data: "s:",
            mark: "编号",
            visible: true,
            edit: false
        },
        desp: {
            data: "s:",
            mark: "活动说明",
            visible: true,
            edit: true
        },
        time: {
            data: "date:",
            mark: "活动创建时间",
            visible: true,
            edit: false
        },
        startTime: {
            data: "date:",
            mark: "活动开始时间",
            visible: true,
            edit: true
        },
        endTime: {
            data: "date:",
            mark: "活动结束时间",
            visible: true,
            edit: true
        },
        vCnt: {
            data: "s:",
            mark: "活动总访问数",
            visible: true,
            edit: false
        },
        wxid: {
            data: "s:",
            mark: "微信公众号识别符",
            visible: true,
            edit: true
        },
        autherInfo: {
            data: "s:",
            mark: "举办方信息",
            visible: true,
            edit: true
        },
        auther: {
            data: "s:",
            mark: "举办单位",
            visible: true,
            edit: true
        },
        state: {
            data: "select:待审核|已审核|审核拒绝",
            dictionaries: {"1": "待审核", "0": "已审核", "4": "审核拒绝"},
            mark: "活动状态",
            visible: true,
            edit: true
        },
    }).registerFields("actrule", {
        name: {
            data: "s:",
            mark: "活动名称",
            visible: true,
            edit: true
        },
        number: {
            data: "s:",
            mark: "编号",
            visible: true,
            edit: false
        },
        desp: {
            data: "s:",
            mark: "活动说明",
            visible: true,
            edit: true
        },
        time: {
            data: "date:",
            mark: "活动创建时间",
            visible: true,
            edit: false
        },
        startTime: {
            data: "date:",
            mark: "活动开始时间",
            visible: true,
            edit: true
        },
        endTime: {
            data: "date:",
            mark: "活动结束时间",
            visible: true,
            edit: true
        },
        vCnt: {
            data: "s:",
            mark: "活动总访问数",
            visible: true,
            edit: false
        },
        rid: {
            data: "s:",
            mark: "活动规则",
            visible: true,
            edit: true
        },
        wxid: {
            data: "s:",
            mark: "微信公众号识别符",
            visible: true,
            edit: true
        },
        autherInfo: {
            data: "s:",
            mark: "举办方信息",
            visible: true,
            edit: true
        },
        auther: {
            data: "s:",
            mark: "举办单位",
            visible: true,
            edit: true
        },
        state: {
            data: "select:待审核|已审核|审核拒绝",
            dictionaries: {"1": "待审核", "0": "已审核", "4": "审核拒绝"},
            mark: "活动状态",
            visible: true,
            edit: true
        },
    }).registerFields("acttype", {
        name: {
            data: "s:",
            mark: "分类名称",
            visible: true,
            edit: true
        },
        attr: {
            data: "s:",
            mark: "分类描述",
            visible: true,
            edit: true
        },
        number: {
            data: "s:",
            mark: "分类编号",
            visible: true,
            edit: true
        },
        time: {
            data: "date:",
            mark: "分类创建时间",
            visible: true,
            edit: false
        },
    }).registerFields("actlog", {
        wxNickName: {
            data: "s:",
            mark: "投票人微信昵称",
            visible: true,
            edit: true
        },
        wxOpenid: {
            data: "s:",
            mark: "投票人微信ID",
            visible: true,
            edit: true
        },
        target: {
            data: "s:",
            mark: "投票对象",
            visible: true,
            edit: true
        },
        ip: {
            data: "s:",
            mark: "投票人IP",
            visible: true,
            edit: false
        },
        day: {
            data: "s:",
            mark: "投票时间",
            visible: true,
            edit: false
        },
    }).registerFields("api", {
        email: {
            data: "s:",
            mark: "邮箱",
            visible: true,
            edit: true
        },
        phone: {
            data: "s:",
            mark: "手机号",
            visible: true,
            edit: true
        },
        host: {
            data: "s:",
            mark: "监控主机地址",
            visible: true,
            edit: false
        },
        state: {
            data: "select:开启|关闭",
            dictionaries: {"0": "开启", "1": "关闭"},
            mark: "监控状态",
            visible: true,
            edit: false,
            onRender: function (v) {
                if (v == "开启") {
                    return "<span class='text-info'>" + v + "</span>";
                }
                if (v == "关闭") {
                    return "<span class='text-danger'>" + v + "</span>";
                }
            }
        },
    }).registerFields("verify", {
        author: {
            data: "s:",
            mark: "作者",
            visible: true,
            edit: false
        },
        mainName: {
            data: "s:",
            mark: "标题",
            visible: true,
            edit: false,
            max: 20
        },
        souce: {
            data: "s:",
            mark: "来源",
            visible: true,
            edit: false
        },
        columnName: {
            data: "s:",
            mark: "来源栏目",
            visible: true,
            edit: false
        },
        time: {
            data: "date:",
            mark: "发布时间",
            visible: true,
            edit: false
        },
        search: {
            column: "mainName|author|souce|time|columnName"
        },
    }).registerFields("questionnaire", {
        name: {
            data: "s:",
            mark: "问卷名称",
            visible: true,
            edit: true
        },
        qType: {
            data: "ajaxselect:",
            mark: "问卷类型",
            visible: true,
            edit: true,
            ajax: "questionnaireType",
            contentKey: "name"
        },
        // column: {
        //     data: "s:",
        //     mark: "所属栏目",
        //     visible: true,
        //     edit: false
        // },
        createName: {
            data: "s:",
            mark: "创建人",
            visible: true,
            edit: false,
        },
        createTime: {
            data: "date:",
            mark: "创建时间",
            visible: true,
            edit: false
        },
        startTime: {
            data: "date:",
            mark: "开始时间",
            visible: true,
            edit: true
        },
        endTime: {
            data: "date:",
            mark: "结束时间",
            visible: true,
            edit: true
        },
        // timeLimit: {
        //     data: "s:",
        //     mark: "答题时间",
        //     visible: true,
        //     edit: true
        // },
        questionNum: {
            data: "s:",
            mark: "题目数量",
            visible: true,
            edit: false
        },
    }).registerFields("question", {
        name: {
            data: "s:",
            mark: "题目名称",
            visible: true,
            edit: true
        },
        type: {
            data: "select:单选|多选|简答题|问答",
            dictionaries: {"0": "单选", "1": "多选", "4": "简答题", "3": "问答"},
            mark: "题目类型",
            visible: true,
            edit: true,
        },
        options: {
            data: "s:",
            mark: "选项",
            visible: true,
            edit: false,
            onRender: function (v, o) {
                if (o.type == 0 || o.type == 1) {
                    return "点击编辑选项";
                } else {
                    return "选项仅适用于选择题";
                }
            }
        },
        answer: {
            data: "s:",
            mark: "正确答案",
            visible: true,
            edit: true,
            onRender: function (v, o) {
                if (o.type == 0 || o.type == 1) {
                    return "请于编辑选项中查看";
                } else {
                    return v;
                }
            }
        },
        maxTime: {
            data: "s:",
            mark: "最大答题时间",
            visible: true,
            edit: false
        },
    }).registerFields("examination", {
        name: {
            data: "s:",
            mark: "题目类型名称",
            visible: true,
            edit: true
        },
        desp: {
            data: "s:",
            mark: "题目描述",
            visible: true,
            edit: true
        },
        createTime: {
            data: "date:",
            mark: "最大答题时间",
            visible: true,
            edit: true
        },
    }).registerFields("questionAnswer", {
        name: {
            data: "s:",
            mark: "所属问卷",
            visible: true,
            edit: false
        },
        uid: {
            data: "s:",
            mark: "答题用户",
            visible: true,
            edit: false,
            onRender: function (v) {
                return !v ? "暂无" : "v";
            }
        },
        wrongCount: {
            data: "s:",
            mark: "错误数",
            visible: true,
            edit: false
        },
        anserCount: {
            data: "s:",
            mark: "答题总数",
            visible: true,
            edit: false
        },
        pendCount: {
            data: "s:",
            mark: "待判定题目总数",
            visible: true,
            edit: false
        },
        rightCount: {
            data: "s:",
            mark: "正确数",
            visible: true,
            edit: false
        },
        startTime: {
            data: "date:",
            mark: "答题开始时间",
            visible: true,
            edit: false
        },
        endTime: {
            data: "date:",
            mark: "答题结束时间",
            visible: true,
            edit: false
        }
    }).registerFields("questionnaireType", {
        name: {
            data: "s:",
            mark: "问卷名称",
            visible: true,
            edit: false
        },
        name: {
            data: "s:",
            mark: "类型描述",
            visible: true,
            edit: false
        },
        createTime: {
            data: "date:",
            mark: "创建时间",
            visible: true,
            edit: false
        },
    }).registerFields("webInfo", {
        title: {
            data: 's:',
            mark: '站点名称',
            visible: true,
            edit: false,
        }
    }).registerFields("powerContent", {
        name: {
            data: "s:",
            mark: "执行结果",
            visible: true,
            edit: false
        },
    }).registerFields("column", {
        name: {
            data: "s:",
            mark: "栏目名称",
            visible: true,
            edit: false
        },
        isvisble: {
            data: "select:是|否",
            mark: "是否可见",
            dictionaries: {"0": "是", "1": "否"},
            visible: true,
            edit: false
        },
        slevel: {
            data: "select:完全公开|部分公开",
            mark: "是否公开",
            dictionaries: {"0": "完全公开", "1": "部分公开"},
            visible: true,
            edit: false
        },
        isCheck: {
            data: "select:不开启|开启",
            mark: "是否强制隐私检测",
            dictionaries: {"0": "不开启", "1": "开启"},
            visible: true,
            edit: false
        },
        type: {
            data: "select:普通栏目|导航栏目",
            mark: "栏目类型",
            dictionaries: {"0": "普通栏目", "2": "导航栏目"},
            visible: true,
            edit: false
        },
        contentType: {
            data: "select:常规图文新闻|纯图片新闻|视频新闻|咨询新闻|公开新闻|超链接新闻",
            mark: "文章类型",
            dictionaries: {"0": "常规图文新闻", "1": "纯图片新闻", "2": "视频新闻", "3": "咨询新闻", "4": "公开新闻", "5": "超链接新闻"},
            visible: true,
            edit: false
        },
        ColumnProperty: {
            data: "select:长期公开|定期公开|及时公开|无后缀",
            mark: "栏目后缀",
            dictionaries: {"0": "长期公开", "1": "定期公开", "2": "及时公开", "3": "无后缀"},
            visible: true,
            edit: false
        },
    });
})();