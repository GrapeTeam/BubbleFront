(function () {
    /**
     * 路由注册
     */
    bubbleFrame.defaultRouter("/access/login");
    var router = bubbleFrame.router();             //获取一级路由对象

    router.add("access", null);
    router.add("app", null);
    //登录路由
    var parent = router.setParent("access", "access");
    parent.add("login");            //登录
    parent.add("register");         //注册
    parent.add("forgotpwd");
    parent.add("changepwd");
    //系统路由
    parent = router.setParent("app", "app");
    parent.add("user")();                 //用户管理
    parent.add("reportReply")("report");          //举报快接回复管理
    parent.add("reportType", "")("report");       //举报类型管理
    parent.add("report{type}", "", "angularBootstrapNavTree")("report");     //举报管理
    parent.add("reportCount")("report");          //举报统计
    parent.add("consult{type}", "")("report");    //咨询管理
    parent.add("usergroup")();        //用户组管理
    parent.add("sensitive");
    parent.add("push", "", "angularBootstrapNavTree")("push");               //下级推送
    parent.add("verify{state}", "", "angularBootstrapNavTree")("push");             //文章审核
    parent.add("qwCompany", "", ["nestable", "angularBootstrapNavTree"]);        //企业管理
    parent.add("dashboard", "");        //控制台
    parent.add("performance");      //性能监测
    parent.add("searchword", null);     //搜索热词
    parent.add("reportAdmin");      //举报管理员
    parent.add("content", "", ["chosen", "angularBootstrapNavTree", "pdf", "step"])();       //内容管理
    parent.add("fex");              //流程图管理
    parent.add("file", "", ["angularBootstrapNavTree"])();        //文件管理
    parent.add("site", "", "nestable");             //站群管理
    parent.add("column{back}", "", ["nestable", "angularBootstrapNavTree"])();     //栏目管理
    parent.add("system");                           //系统设置
    parent.add("advertisement", "", "swiper")();                    //广告管理
    parent.add("template");                         //模板管理
    parent.add("message");                          //留言管理
    parent.add("task", "", "calendar");             //任务管理
    parent.add("vote");                             //投票管理
    parent.add("mechanism");
    parent.add("link", "", "nestable");                             //友情链接管理
    parent.add("maintenanceUnit", null, "", "<div ui-view class='animated fadeIn'></div>");     //维护单位
    parent.add("operatingUnit", null, "", "<div ui-view class='animated fadeIn'></div>");       //运行单位
    parent.add("thirdParty", null, "", "<div ui-view class='animated fadeIn'></div>");          //第三方
    parent.add("activity", null, "", "<div ui-view class='animated fadeIn'></div>");          //活动
    parent.add("statements", null, "", "<div ui-view class='animated fadeIn'></div>");          //统计报表
    parent.add("plugins", null, "", "<div ui-view class='h-full animated fadeIn'></div>");          //API监视
    parent.add("questionnaire", null, "", "<div ui-view class=' fade-in-up'></div>");          //各种附加模块
    parent.add("demonstration", null, "", "<div ui-view class='h-full fade-in-up'></div>");          //错别字演示
    parent.add("putao", null, "", "<div ui-view class='h-full fade-in-up'></div>");          //葡萄云配置
    // parent.add("filetmp", null, "", "<div ui-view class='animated fadeIn'></div>");          //
    //第三方
    parent = router.setParent("thirdParty", "thirdParty");
    parent.add("wechat");           //微信
    parent.add("email");            //email
    //维护单位
    parent = router.setParent("maintenanceUnit", "unit");
    parent.add("maintenanceUnitBase");
    parent.add("maintenanceUnitInfo");
    //运行单位
    parent = router.setParent("operatingUnit", "unit");
    parent.add("operatingUnitBase");
    parent.add("operatingUnitPersonnel");
    parent.add("operatingUnitInfo");
    //活动
    parent = router.setParent("activity", "activity");
    parent.add("actobj{eid}{tid}")("activity");
    parent.add("actevent")("activity");
    parent.add("acttype{eid}")("activity");
    parent.add("actlog{eid}")("activity");
    //统计报表
    parent = router.setParent("statements", "statement");
    parent.add("statement", "", "echarts")();
    parent.add("contentCount", "", "echarts")();
    //API监视
    parent = router.setParent("plugins", "plugins");
    parent.add("monitor");
    parent.add("crawler")();
    parent.add("autoform");
    parent.add("power", "", ["chosen", "angularBootstrapNavTree", "pdf", "step", "mind"])();
    //问卷
    parent = router.setParent("questionnaire", "questionnaire");
    parent.add("questionIndex")("questionnaire");    //问卷管理
    parent.add("questionnaireType");     //问卷类型
    parent.add("question")("questionnaire");     //问卷题目
    parent.add("examination");   //考场
    parent.add("questionanswer{qid}");   //问卷答复
    //葡萄云配置
    parent = router.setParent("putao", "putao");
    parent.add("config");                           //配置管理
    parent.add("interface");                        //接口管理
    parent.add("application", "", "masonry");       //应用管理
    parent.add("service");                          //服务管理
    parent.add("deploy", "", ["mind"])();                           //一体化部署管理
    parent.add("api")();                           //接口测试
    //新版文件
    // parent = router.setParent("filetmp", "filetmp");
    // parent.add("filetest");
    //内容演示
    parent = router.setParent("demonstration", "demonstration");
    parent.add("contentBack", "", ["chosen", "angularBootstrapNavTree", "pdf", "step"])("content");       //内容管理
})();