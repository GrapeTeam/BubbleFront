(function () {
    var config226 = {
        api: "226:801",
        upload: "226:8080"
    };

    var config60 = {
        api: "60:801",
        upload: "60:9000"
    };

    var config185 = {
        api: "185:7000",
        upload: "185:9000"
    };

    bubbleFrame.setHost({
        "226:801": "http://123.57.214.226:801",
        "226:802": "http://123.57.214.226:802",
        "226:803": "http://123.57.214.226:803",
        "226:8080": "http://123.57.214.226:8080",
        "60:801": "http://60.173.0.46:801",
        "60:803": "http://60.173.0.46:803",
        "60:9801": "http://60.173.0.46:9801",
        "60:9000": "http://60.173.0.46:9000",
        "185:7000": "http://60.173.1.185:7000",
        "185:9000": "http://60.173.1.185:9000",
        "59:803": "http://59.110.21.171:803"
    });

    bubbleFrame.setDistributive({
        debug: {
            "GrapeFW": {
                api: "59:803",
                upload: "226:8080"
            },
            22: config226,
            23: config226,
            25: config226,
            13: config226,
            19: config226,
            18: config226,
            17: config226,
            // 17: {
            //     api: "226:802",
            //     upload: "226:8080"
            // },
            15: config185
        },
        runner: {
            "GrapeFW": config60,
            23: config60,
            25: config60,
            22: config60,
            13: config60,
            19: config60,
            18: config60,
            17: {
                api: "60:9801",
                upload: "60:9000"
            },
            15: config185
        }
    });

    bubbleFrame.setIns({
        "common": {
            app: "GrapeFW",
            site: "GrapeWebInfo",
            user: "GrapeUser",
            content: "GrapeContent",
            file: "GrapeFile",
            message: "GrapeMessage",
            adv: "GrapeAdvert",
            maintenanceUnit: "GrapeMcomp",
            operatingUnit: "GrapeOComp",
            vote: ["18", "72"],
            link: "GrapeLink",
            task: "GrapeTask",
            // api: ["18", "78"],
            template: "GrapeTemplate",
            // search: ["18", "85"],
            wechat: "GrapeThird",
            email: "GrapeThird",
            report: "GrapeReport",
            suggest: "GrapeSuggest",
            menu: "GrapeMenu",
            Statistics: "GrapeStatistics",
            webShow: "webshow",
            crawler: "crawler",
            question: "GrapeQuestionnaire",
            act: "vote",
            power: "GrapeRight",
            log: "GrapeLog",
            webInfo: 'GrapeWebInfo'
        },
        //若配置其他ID,则覆写通用配置
        "17": {
            wechat: "GrapeWechatArticle"
        },
        "GrapeFW": {
            app: ""
        },
    });

    var typeList = bubbleFrame.ParameType;
    /**
     * 接口注册
     */
    bubbleFrame.registerInterface({
        //配置
        config: {
            select: ["app", "configService", "select"],
            page: ["app", "configService", "page"],
            update: ["app", "configService", "update"],
            delete: ["app", "configService", "delete"],
        },
        //配置类型
        configType: {
            select: ["app", "configTypeService", "select"],
            page: ["app", "configTypeService", "page"],
            delete: ["app", "configTypeService", "delete"],
            add: ["app", "configTypeService", "insert"],
            update: ["app", "configTypeService", "update"],
        },
        //配置描述
        configField: {
            select: ["app", "configTypeNextService", "select"],
            page: ["app", "configTypeNextService", "page"],
        },
        app: {
            page: ["app", "appService", "page"],
            update: ["app", "appService", "update"],
            delete: ["app", "appService", "delete", [typeList.Int]],
            add: ["app", "appService", "insert"],
        },
        //实例
        ins: {
            page: ["app", "insService", "page"],
            pageBy: ["app", "insService", "pageby"],
            update: ["app", "insService", "update"],
            delete: ["app", "insService", "delete"],
            add: ["app", "insService", "insert"],
        },
        //服务
        service: {
            page: ["app", "serviceService", "page"],
            update: ["app", "serviceService", "update"],
            delete: ["app", "serviceService", "delete", [typeList.Int]],
            add: ["app", "serviceService", "insert"],
        },
        //接口
        interface: {
            page: ["app", "classInterfaceService", "page"],
            pageBy: ["app", "classInterfaceService", "pageby"],
            update: ["app", "classInterfaceService", "update"],
            delete: ["app", "classInterfaceService", "delete"],
            add: ["app", "classInterfaceService", "insert"],
        },
        //接口类
        appClass: {
            page: ["app", "appClassService", "page"],
            update: ["app", "appClassService", "update"],
            delete: ["app", "appClassService", "delete"],
            add: ["app", "appClassService", "insert"],
        },
        //统计
        webShow: {
            state: ["webShow", "Home", "stat", [typeList.Int, typeList.String, typeList.Int, typeList.Int]],
            all: ["webShow", "Home", "getReal", [typeList.Int, typeList.Int, typeList.Int]],
            getcolumn: ["webShow", "ContentShow", "getContent", [typeList.Int, typeList.String, typeList.String]],
            getcolumnall: ["webShow", "ContentShow", "getRealContent", [typeList.Int, typeList.String]],
        },
        //站群
        siteGroup: {
            page: ["site", "WebGroup", "WebGroupPage"],
            update: ["site", "WebGroup", "WebGroupUpdate"],
            delete: ["site", "WebGroup", "WebGroupDelete"],
            add: ["site", "WebGroup", "WebGroupInsert"],
        },
        //网站
        site: {
            add: ["site", "WebInfo", "WebInsert"],
            update: ["site", "WebInfo", "WebUpdate"],
            find: ["site", "WebInfo", "Webfind"],
            page: ["site", "WebGroup", "WebGroupPage"],
            pageBy: ["site", "WebInfo", "WebPageBy"],
            delete: ["site", "WebInfo", "WebDelete"],
            batchDelete: ["site", "WebInfo", "WebBatchDelete"],
            switch: ["site", "WebInfo", "SwitchWeb"],
            getFather: ["site", "WebInfo", "getFatherWeb", [typeList.Int, typeList.Int, typeList.String]],
            getChild: ["site", "WebInfo", "getChild", [typeList.String]],
            getall: ["site", "WebInfo", "getWebAll", [typeList.Int, typeList.Int, typeList.String]],     //获取所有子站点(包含当前站点)
            getalls: ["site", "WebInfo", "getAllWeb", [typeList.Int, typeList.Int, typeList.String, typeList.String]]     //获取所有子站点(包含当前站点以及虚站点)
        },
        // 子站管理
        webInfo: {
            page: ["webInfo", 'WebInfo', "WebPageBack_ALL", [typeList.Int, typeList.Int]],
            delete: ["webInfo", "WebInfo", "WebBatchDelete"],
        },
        //活动对象
        actobj: {
            add: ["act", "voteManage", "newObj", [typeList.String, typeList.String]],
            update: ["act", "voteManage", "updateOne", [typeList.String, typeList.String, typeList.String]],
            delete: ["act", "voteManage", "delete", [typeList.String, typeList.String]],
            page: ["act", "voteManage", "page", [typeList.String, typeList.Int, typeList.Int]],
            pages: ["act", "voteManage", "page", [typeList.String, typeList.String, typeList.Int, typeList.Int]]
        },
        //活动分类
        acttype: {
            add: ["act", "voteManage", "newType", [typeList.String, typeList.String]],
            update: ["act", "voteManage", "updateOne", [typeList.String, typeList.String, typeList.String]],
            delete: ["act", "voteManage", "delete", [typeList.String, typeList.String]],
            page: ["act", "voteManage", "pageType", [typeList.String, typeList.Int, typeList.Int]]
        },
        //活动规则
        actrule: {
            add: ["act", "eventRuleManage", "newEvent", [typeList.String]],
            update: ["act", "eventRuleManage", "updateOne", [typeList.String, typeList.String]],
            get: ["act", "eventRuleManage", "get", [typeList.String]]
        },
        //活动投票
        actlog: {
            page: ["act", "eventLog", "page", [typeList.String, typeList.Int, typeList.Int]]
        },
        //活动
        actevent: {
            add: ["act", "eventManage", "newEvent", [typeList.String]],
            update: ["act", "eventManage", "updateOne", [typeList.String, typeList.String]],
            update: ["act", "eventManage", "updateOne", [typeList.String, typeList.String]],
            delete: ["act", "eventManage", "delete", [typeList.String, typeList.String]],
            page: ["act", "eventManage", "page", [typeList.Int, typeList.Int]]
        },
        // 系统日志
        log: {
            logPage: ["log", "Logs", "xi_tong_ji_lu_pageby", [typeList.Int, typeList.Int]]
        },
        //用户
        user: {
            page: ["user", "user", "UserPage"],
            pageBy: ["user", "user", "UserPageBy"],
            update: ["user", "user", "UserEdit"],
            add: ["user", "user", "UserRegister"],
            delete: ["user", "user", "UserDelete"],
            import: ["user", "user", "ExcelImport", [typeList.String]],
            login: ["user", "user", "UserLogin", [typeList.String]],
            logout: ["user", "user", "UserLogout", [typeList.String]],
            changePW: ["user", "user", "UserChangePW", [typeList.String, typeList.String, typeList.String]],
        },
        //用户组
        userGroup: {
            add: ["user", "roles", "RoleInsert"],
            page: ["user", "roles", "RolePage"],
            pageBy: ["user", "roles", "RolePageBy"],
            update: ["user", "roles", "RoleUpdate"],
            delete: ["user", "roles", "RoleDelete"],
        },
        //栏目
        column: {
            page: ["content", "ContentGroup", "GroupPageBack"],
            update: ["content", "ContentGroup", "GroupEdit"],
            find: ["content", "ContentGroup", "GroupFind"],
            add: ["content", "ContentGroup", "GroupInsert"],
            delete: ["content", "ContentGroup", "GroupDelete"],
            getpush: ["content", "ContentGroup", "getPushArticle", [typeList.String]],
            batchDelete: ["content", "ContentGroup", "GroupDelete"],
            pageByWbid: ["content", "ContentGroup", "getColumns", [typeList.Int, typeList.Int, typeList.String]],         //根据网站ID获取该网站栏目
            getGovColumn: ["content", "PushContentToGov", "getColumnID"],         //获取政府信息公开网栏目
            SetLinkOgid: ["content", "ContentGroup", "SetLinkOgid", [typeList.String, typeList.String, typeList.Int]],
        },
        //新闻
        content: {
            page: ["content", "Content", "PageBack"],
            pageBy: ["content", "Content", "PageByBack"],
            add: ["content", "Content", "PublishArticle"],
            addtest: ["content", "Content", "Publish", [typeList.String]],
            edittest: ["content", "Content", "Edit"],
            find: ["content", "Content", "findArticle", [typeList.String]],
            all: ["content", "Content", "AddAllArticle", [typeList.String]],
            check: ["content", "Content", "Typos", [typeList.String]],
            update: ["content", "Content", "EditArticle"],
            export: ["content", "Content", "ExportContent", [typeList.String, typeList.String]],
            updatetest: ["content", "Content", "Edit", [typeList.String, typeList.String, typeList.String]],
            delete: ["content", "Content", "DeleteArticle"],
            batchDelete: ["content", "Content", "DeleteArticle"],
            search: ["content", "Content", "SearchArticleBack", [typeList.Int, typeList.Int, typeList.String]],
            searchPush: ["content", "ContentCache", "searchPushArticle", [typeList.Int, typeList.Int, typeList.String]],
            transmit: ["content", "ContentGroup", "UploadMpNew", [typeList.String, typeList.String, typeList.String]],
            pushDelete: ["content", "ContentCache", "DeletePushArticle", [typeList.String]],
            pushTo: ["content", "ContentCache", "pushToColumn", [typeList.String, typeList.String]],
            push: ["content", "ContentCache", "pushArticle", [typeList.String, typeList.String]],
            pushToColumn: ["ContentCache", "Content", "pushArticles", [typeList.String, typeList.String]],
            show: ["content", "Content", "ShowArticle", [typeList.Int, typeList.Int, typeList.String]],
            review: ["content", "Content", "ReviewPass", [typeList.String]],
            refuse: ["content", "Content", "ReviewNotPass", [typeList.String]],
            append: ["content", "Content", "AddAppend", [typeList.String, typeList.String]],
            total: ["content", "Content", "totalArticle", [typeList.String]],
            totaltime: ["content", "Content", "total", [typeList.String, typeList.String, typeList.String]],
            totalcolumn: ["content", "Content", "totalColumn", [typeList.String, typeList.String, typeList.String]],
            checkAllArticle: ["content", "Content", "checkAllArticle", [typeList.String]],
            getEventProgress: ["content", "Content", "getEventProgress", [typeList.String]],
            getEventReport: ["content", "Content", "getEventReport", [typeList.String]],
            getError: ["content", "ContentError", "get", [typeList.String]],
            searchNotCheck: ["content", "Content", "searchNotCheck", [typeList.Int, typeList.Int]],
            SetTop: ["content", "Content", "SetTop", [typeList.String]],
            cancelTop: ["content", "Content", "cancelTop", [typeList.String]],
            checkTop: ["content", "Content", "CheckLink", [typeList.Int, typeList.Int]],
            contentBind: ['content', 'Content', 'move_articles_to_another_ogid', [typeList.String, typeList.String, typeList.String]],
            yulan: ['content', 'ContentGroup', 'getTemplateContect_by_ogid', [[typeList.String], [typeList.String], [typeList.String], [typeList.String]]]

        },
        //审核
        verify: {
            pageBy: ["content", "Content", "ShowArticle", [typeList.Int, typeList.Int, typeList.String]],
        },
        //小微权力
        power: {
            pageBy: ["power", "RightInfo", "pageby"],
            add: ["power", "RightInfo", "AddHistory"],
            insert: ["power", "RightInfo", "insert", [typeList.String]],
            update: ["power", "RightInfo", "updateOne"],
            delete: ["power", "RightInfo", "delete"],
            getHistory: ["power", "RightInfo", "getHistory"],
        },
        powerContent: {
            pageBy: ["power", "RightContent", "pageby"],
            insert: ["power", "RightContent", "insert", [typeList.String]],
            append: ["power", "RightContent", "AddAppend", [typeList.String, typeList.String]],
            getInfo: ["power", "RightContent", "getInfo", [typeList.String]],
            get: ["power", "RightContent", "get", [typeList.String]],
            update: ["power", "RightContent", "updateOne"],
            delete: ["power", "RightContent", "delete"],
        },
        powerType: {
            page: ["power", "RightType", "page"],
            pageBy: ["power", "RightType", "pageby"],
            add: ["power", "RightType", "insert"],
            delete: ["power", "RightType", "delete"],
            update: ["power", "RightType", "updateOne"],
        },
        //文件
        file: {
            page: ["file", "Files", "Page"],
            pageBy: ["file", "Files", "PageBy"],
            updateBatch: ["file", "Files", "FileUpdateBatch"],
            update: ["file", "Files", "FileUpdate"],
            delete: ["file", "Files", "Delete"],
            batchDelete: ["file", "Files", "BatchDelete"],
            add: ["file", "Files", "AddFolder"],
            rename: ["file", "Files", "Rename", typeList.update],
            getWord: ["file", "Files", "getWord", [typeList.String]],
            download: "{uploadhost}/FileServer/Download?_id=",
        },
        //留言评论
        message: {
            page: ["message", "Message", "PageMessage"],
            pageBy: ["message", "Message", "PageByMessage"],
            update: ["message", "Message", "UpdateMessage "],
            delete: ["message", "Message", "DeleteMessage "],
            batchDelete: ["message", "Message", "DeleteBatchMessage "],
            add: ["message", "Message", "AddMessage"],
            find: ["message", "Message", "SearchMessage"],
        },
        //广告
        advertisement: {
            page: ["adv", "Advert", "PageADBack"],
            pageBy: ["adv", "Advert", "PageByAD"],
            update: ["adv", "Advert", "UpdateAD"],
            delete: ["adv", "Advert", "DeleteAD"],
            batchDelete: ["adv", "Advert", "DeleteBatchAD"],
            add: ["adv", "Advert", "AddAD"],
        },
        //广告位
        ads: {
            page: ["adv", "Adsense", "PageADS"],
            pageBy: ["adv", "Adsense", "PageByADS"],
            update: ["adv", "Adsense", "UpdateADS"],
            delete: ["adv", "Adsense", "DeleteADS"],
            batchDelete: ["adv", "Adsense", "DeleteBatchADS"],
            add: ["adv", "Adsense", "AddADS"],
        },
        //维护单位
        maintenanceUnit: {
            page: ["maintenanceUnit", "MCompany", "PageMComp"],
            pageBy: ["maintenanceUnit", "MCompany", "PageByMComp"],
            update: ["maintenanceUnit", "MCompany", "updateComp"],
        },
        //维护单位
        operatingUnit: {
            page: ["operatingUnit", "OCompany", "OCompPage"],
            pageBy: ["operatingUnit", "OCompany", "OCompPageBy"],
            update: ["operatingUnit", "OCompany", "OCompUpdate"],
        },
        //投票
        vote: {
            page: ["vote", "vote", "VotePage"],
            pageBy: ["vote", "vote", "VotePageBy"],
            update: ["vote", "vote", "VoteUpdate"],
            delete: ["vote", "vote", "VoteDelete"],
            count: ["vote", "vote", "VoteCount"],
            add: ["vote", "vote", "VoteAdd"],
            batchDelete: ["vote", "vote", "VoteBatchDelete"],
        },
        //友情链接
        link: {
            page: ["link", "flink", "PageFlink"],
            pageBy: ["link", "flink", "PageByFlink"],
            update: ["link", "flink", "UpdateFlink"],
            delete: ["link", "flink", "DeleteFlink"],
            add: ["link", "flink", "flinkAdd"],
            batchDelete: ["link", "flink", "DeleteBatchFlink"],
        },
        //任务
        task: {
            page: ["task", "task", "TaskPage"],
            pageBy: ["task", "task", "TaskPageBy"],
            update: ["task", "task", "TaskUpdate"],
            delete: ["task", "task", "TaskDelete"],
            add: ["task", "task", "TaskAdd"],
            batchDelete: ["task", "task", "TaskBatchDelete"],
            difft: ["task", "Task", "getPendingColumn", [typeList.Int, typeList.Int]],
            check: ["task", "task", "CheckLink", [typeList.Int, typeList.Int]],
        },
        //API
        api: {
            pageBy: ["task", "task", "PageTask"],
            excute: ["task", "task", "ExcuteTask"],
            update: ["task", "task", "UpdateTask"],
            add: ["task", "task", "AddTask"],
            delete: ["task", "task", "DeleteTask"],
        },
        //爬虫
        crawler: {
            // getContent: ["crawler", "CollectInfo", "getInfo", [typeList.String]],
            // getRule: ["crawler", "cRule", "ShowRule", [typeList.Int, typeList.Int]],
            // deleteRule: ["crawler", "cRule", "RemoveRule", [typeList.String]],
            // findContent: ["crawler", "cInfo", "findByRID", [typeList.String]],
            // getTestInfo: ["crawler", "CollectInfo", "getTestInfo", [typeList.String]],
            pageBy: ["crawler", "task", "pageby"],
            page: ["crawler", "task", "page"],
            add: ["crawler", "task", "insert"],
            delete: ["crawler", "task", "delete"],
            update: ["crawler", "task", "updateOne"],
            run: ["crawler", "task", "enable", [typeList.String]],
            stop: ["crawler", "task", "disable", [typeList.String]],
            taskstart: ["crawler", "task", "startService"],
            taskstop: ["crawler", "task", "stopService"],
            query: ["crawler", "task", "queryService"],
        },
        //模板组
        tempList: {
            page: ["template", "TempList", "TempListPage"],
            pageBy: ["template", "TempList", "TempListPageBy"],
            update: ["template", "TempList", "TempListUpdate"],
            delete: ["template", "TempList", "TempListDelete"],
            add: ["template", "TempList", "TempListInsert"],
            batchDelete: ["template", "TempList", "TempListBatchDelete"],
        },
        //模板
        template: {
            page: ["template", "TemplateContext", "TempPage"],
            pageBy: ["template", "TemplateContext", "TempPageBy"],
            update: ["template", "TemplateContext", "TempUpdate"],
            delete: ["template", "TemplateContext", "TempDelete"],
            add: ["template", "TemplateContext", "TempInsert"],
            batchDelete: ["template", "TemplateContext", "TempBatchDelete"],
        },
        //搜索热词
        search: {
            page: ["search", "Word", "Page"],
            delete: ["search", "Word", "DeleteWord"],
            batchDelete: ["search", "Word", "DeleteWord"],
        },
        //第三方平台
        wechat: {
            page: ["wechat", "SDKRoute", "PageRoute"],
            update: ["wechat", "SDKRoute", "UpdateRoute"],
            delete: ["wechat", "SDKRoute", "DeleteRoute"],
            add: ["wechat", "SDKRoute", "AddRoute"],
            batchDelete: ["wechat", "SDKRoute", "DeleteBatchRoute"],
        },
        //第三方平台用户
        wechatUser: {
            page: ["wechat", "SDKUser", "PageSdkUser"],
            pageBy: ["wechat", "SDKUser", "PageBySdkUser"],
            update: ["wechat", "SDKUser", "UpdateSdkUser"],
            delete: ["wechat", "SDKUser", "DeleteBatchSdkUser"],
            add: ["wechat", "SDKUser", "AddSdkUser"],
            savetowechat: ["wechat", "Wechat", "getNews", [typeList.String, typeList.String]],
            pushtowechat: ["wechat", "Wechat", "pushArcToWechat", [typeList.String, typeList.String]],
            batchDelete: ["wechat", "SDKUser", "DeleteBatchPUser"],
        },
        //模板
        email: {
            active: ["email", "Email", "ActiveEmail", [typeList.String, typeList.String]],
            verify: ["email", "Email", "VerifyEmail", [typeList.String, typeList.String]],
            send: ["email", "Email", "sendEmail", [typeList.String, typeList.String]],
            page: ["email", "Email", "PageEmail"],
            pageBy: ["email", "Email", "PageByEmail"],
            update: ["email", "Email", "UpdateEmail"],
            delete: ["email", "Email", "DeleteEmail"],
            add: ["email", "Email", "AddEmail"],
            batchDelete: ["email", "Email", "DeleteBatchEmail"],
        },
        //举报
        report: {
            export: ["report", "Report", "Export", [typeList.String, typeList.String]],
            count: ["report", "Report", "Count"],
            circulation: ["report", "Report", "circulationReport", [typeList.String, typeList.String]],
            kick: ["report", "Report", "kick", [typeList.String, typeList.String]],
            page: ["report", "Report", "PageReport"],
            pageBy: ["report", "Report", "PageByReport"],
            update: ["report", "Report", "UpdateReport"],
            delete: ["report", "Report", "DeleteReport"],
            search: ["report", "Report", "SearchReport"],
            select: ["report", "Report", "BatchSelect", [typeList.String, typeList.Int], false],
            batchDelete: ["report", "Report", "DeleteBatchReport"],
            complete: ["report", "Report", "CompleteReport", typeList.update],
            refuse: ["report", "Report", "RefuseReport", typeList.update],
            setLevel: ["report", "Report", "setSelvel", [typeList.String]],
            timerSendCount: ["report", "Report", "TimerSendCount", [typeList.String]],
            reportCount: ["report", "Report", "CountReport"],
            handle: ["report", "Report", "HandleReport"],
        },
        //举报类型
        reportType: {
            page: ["report", "Rtype", "PageType"],
            pageBy: ["report", "Rtype", "search"],
            update: ["report", "Rtype", "UpdateType"],
            delete: ["report", "Rtype", "DeleteType"],
            add: ["report", "Rtype", "AddType"],
            batchDelete: ["report", "Rtype", "DeleteBatchType", typeList.update],
        },
        //快捷回复
        reportReply: {
            page: ["report", "Reason", "PageReson"],
            pageBy: ["report", "Reason", "search"],
            update: ["report", "Reason", "UpdateReson"],
            delete: ["report", "Reason", "DeleteReson"],
            add: ["report", "Reason", "AddReson"],
            batchDelete: ["report", "Reason", "DeleteBatchReson"],
        },
        //举报管理员
        reportAdmin: {
            page: ["report", "ReportTask", "page"],
            pageBy: ["report", "ReportTask", "pageby"],
            update: ["report", "ReportTask", "update"],
            delete: ["report", "ReportTask", "delete"],
            add: ["report", "ReportTask", "insert"],
            enable: ["report", "ReportTask", "enable", [typeList.String]],
            disable: ["report", "ReportTask", "disable", [typeList.String]],
            queryService: ["report", "ReportTask", "queryService"],
            startService: ["report", "ReportTask", "startService"],
            stopService: ["report", "ReportTask", "stopService"],
        },
        //运行单位人员信息
        person: {
            page: ["operatingUnit", "personal", "PersonPage"],
            pageBy: ["operatingUnit", "personal", "PersonPageBy"],
            update: ["operatingUnit", "personal", "PersonUpdate"],
            delete: ["operatingUnit", "personal", "PersonDelete"],
        },
        //运行单位机构信息
        organ: {
            page: ["operatingUnit", "Ognization", "OrganPage"],
            pageBy: ["operatingUnit", "Ognization", "OrganPageBy"],
            update: ["operatingUnit", "Ognization", "OrganUpdate"],
        },
        //咨询
        suggest: {
            page: ["suggest", "Suggest", "Page"],
            pageBy: ["suggest", "Suggest", "PageBy"],
            reply: ["suggest", "Suggest", "Reply", [typeList.String, typeList.String]],
            count: ["suggest", "Suggest", "CountSuggest"],
            slevel: ["suggest", "Suggest", "setSelvel", [typeList.String]],
        },
        //统计
        statistics: {
            count: ["Statistics", "Statistics", "count", [typeList.String, typeList.String, typeList.String]]
        },
        //问卷
        questionnaire: {
            page: ["question", "QuestionnaireInfo", "page"],
            pageBy: ["question", "QuestionnaireInfo", "pageby"],
            update: ["question", "QuestionnaireInfo", "update"],
            delete: ["question", "QuestionnaireInfo", "delete"],
            add: ["question", "QuestionnaireInfo", "insert"],
        },
        //问卷类型
        questionnaireType: {
            page: ["question", "QuestionnaireType", "page"],
            pageBy: ["question", "QuestionnaireType", "pageby"],
            update: ["question", "QuestionnaireType", "update"],
            delete: ["question", "QuestionnaireType", "delete"],
            add: ["question", "QuestionnaireType", "insert"],
            get: ["question", "QuestionnaireType", "get"],
        },
        //题目类型
        examination: {
            page: ["question", "Examination", "page"],
            pageBy: ["question", "Examination", "pageby"],
            update: ["question", "Examination", "update"],
            delete: ["question", "Examination", "delete"],
            add: ["question", "Examination", "insert"],
            get: ["question", "Examination", "get"],
        },
        //问卷题目
        question: {
            page: ["question", "QuestionInfo", "page"],
            pageBy: ["question", "QuestionInfo", "pageby"],
            update: ["question", "QuestionInfo", "update"],
            delete: ["question", "QuestionInfo", "delete"],
            add: ["question", "QuestionInfo", "insert"],
            getall: ["question", "QuestionInfo", "getAll"],
        },
        //问卷答题
        questionAnswer: {
            page: ["question", "Examination", "page"],
            pageBy: ["question", "Examination", "pageby"],
        },
        //菜单
        menu: {
            show: ["menu", "Menu", "ShowMenu"],
            set: ["menu", "Menu", "SetMenu", [typeList.String, typeList.String]],
            getAll: ["menu", "Menu", "getAll"],
        },
        upload: {
            file: "{uploadhost}/FileServer/UploadFile?appid={appid}",
            visible: "{uploadhost}",
        }
    });
})();