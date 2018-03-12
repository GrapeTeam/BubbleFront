/**
 * bubble前端框架V1.0
 * 注入方法: new window.BubbleEntry("框架名", 注入对象)
 * 数据获取方法: 目标框架内相应注入对象.getData("接口名", 参数)
 * angular常规数据绑定方法: angular.extend($scope, bubble.getData(name, {}));
 * 说明: 目前仅对数据做处理,暂未提供更多服务
 */
import $ from "jquery";
import "./modules/base64/base64";
import PrivateProtect from "./GrapePrivateProtect";
var swal = window.swal;

var ex = (function () {
    var debug = true;
    var postMode = true;
    var lockmode = false;
    var distributive = {};  //服务器分布配置
    var ajaxHost = {};
    var appid = 0;
    var host = "";
    var serverType = "";    //运行环境[debug | runner]
    var uploadhost = "";
    var insid = null;
    var TPL_URL = "tpl/";
    var CTRL_URL = "js/controllers/";
    var STYLE_URL = "style/";

    /**
     * 网络层
     */
    var BubbleNet = function () {
        var _this = this;
        var cachePool = {};
        var errorList = {
            "001": "未登录",
            "002": "权限丢失",
            "003": "非法操作",
            "004": "信息不正确",
            "99": "其他操作异常"
        };
        this.defaultHost = "runtime";

        this.init = function () {
            //初始化
            return this;
        }

        this.clear = function (v) {
            v ? delete cachePool[v] : cachePool = {};
        }

        this.send = function (url, type, name, p, cache) {
            if (p) {
                var pstr = "";
                for (var i = 0; i < p.length; i++) {
                    pstr != "" && (pstr += "&");
                    pstr += i + "=" + p[i];
                }
            }
            return new Promise(function (resolve, reject) {
                var sid = window.logininfo ? window.logininfo.sid : "";
                if (cache !== false && cachePool[type] && cachePool[type][name + pstr] && cachePool[type][name + pstr][url]) {
                    resolve(dataReview(cachePool[type][name + pstr][url]));
                } else {
                    if (p) {
                        $.ajax({
                            type: "post",
                            url: url,
                            data: pstr,
                            beforeSend: function (r) {
                                r.setRequestHeader("GrapeSID", sid);
                            },
                            success: function (v) {
                                upDateCache(url, type, name, v, pstr, cache);
                                resolve(dataReview(v));
                            },
                            error: function (e) {
                                reject(e);
                            },
                        });
                    } else {
                        $.ajax({
                            type: "get",
                            url: url,
                            beforeSend: function (r) {
                                r.setRequestHeader("GrapeSID", sid);
                            },
                            success: function (v) {
                                upDateCache(url, type, name, v, cache);
                                var d = dataReview(v);
                                d != "loginout" && resolve(d);
                            },
                            error: function (e) {
                                reject(e);
                            },
                        });
                    }
                }
            });
        }

        var upDateCache = function (url, t, n, v, c) {
            if (n == "page" || n == "pageBy" || n == "select" || n == "find" || n == "get" || c === true) {
                cachePool[t] || (cachePool[t] = {});
                cachePool[t][n + c] || (cachePool[t][n + c] = {});
                cachePool[t][n + c][url] = v;
            } else {
                delete cachePool[t];
            }
        }

        var clearNumber = function (v) {
            var retyr = 0;
            var reg = /{"\$numberLong":"(\d*)"}/g;
            var list = null;
            do {
                list = reg.exec(v);
                if (list) {
                    v = v.replace(list[0], '\"' + list[1] + '\"');
                    retyr = 0;
                } else {
                    retyr++;
                }
            }
            while (list || retyr < 2);
            return v;
        }

        function dataReview(v) {
            try {
                if (!v) {
                    // v = { message: "接口错误", errorcode: 10000 };
                } else {
                    v = clearNumber(v);
                    v = JSON.parse(v);
                    if (v.message && typeof v.message === "string") {
                        v.message = JSON.parse(v.message);
                    }
                    if (v.message && v.message.record && typeof v.message.record === "string") {
                        v.message.record = JSON.parse(v.message.record);
                    }
                }
            } catch (e) {
                try {
                    $(v);
                    return v;
                } catch (ee) {
                    return v;
                }
            }
            var rs = "";
            if (!v) {
                return rs;
            }

            // if (typeof v === 'object' && v.errorcode) {
            //     debug && swal(errorList[v.errorcode] ? errorList[v.errorcode] : v.message);
            // }

            try {
                if (v.message) {
                    if (v.message == "登录信息已失效") {
                        window.location.href = window.location.href.split("#")[0] + "#/access/login";
                        swal(v.message);
                        return "loginout";
                    }
                    rs = v.message;
                    if (rs.records) {
                        rs = typeof rs.records === 'string' ? JSON.parse(clearNumber(rs.records)) : rs.records;
                    }
                    if (rs.record) {
                        rs = typeof rs.record === 'string' ? JSON.parse(clearNumber(rs.record)) : rs.record;
                    }
                } else
                    rs = v;
            } catch (e) {
                rs = rs.records;
            }

            return v.errorcode && v.errorcode != 0 ? { data: rs, errorcode: v.errorcode } : rs;
        }
    }

    /**
     * 数据层
     */
    var BubbleData = function () {
        var net = new BubbleNet().init();
        var fields = {};
        var listenerList = {};  //监听列表
        var interfaceList = {};
        var validateType = {
            email: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
            mobile: /^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/,
            idno: /^\d{15}|\d{18}$/,
            account: /^[a-zA-Z][a-zA-Z0-9_]{4,15}$/,
            qq: /[1-9][0-9]{4,}/,
            postCode: /[1-9]\d{5}(?!\d)/,
            ip: /\d+\.\d+\.\d+\.\d+/,
        }
        this.ParameType = {
            JSON: "JSON",
            String: "s",
            Int: "int",
            Float: "float",
            find: ["s"],
            delete: ["s"],
            add: ["s"],
            update: ["s", "s"],
            page: ["int", "int"],
            pageBy: ["int", "int", "s"],
            search: ["int", "int", "s"],
            batchDelete: ["s"],
            updateBatch: ["s", "s"],
        }

        /**
         * 根据请求名称返回对应结构化数据
         * @method _call
         * @param name 接口名
         * @return 回调对象用于注册success以及custom函数
         */
        this._call = function (name) {
            var posto = [];
            var log = name;
            var type = "";
            var user_appid = "";    //调用目标可能于当前服务器不在同一服务器
            var user_host = "";     //根据user_appid获得目标服务器地址

            if (name.indexOf("|") >= 0) {
                user_appid = name.split("|")[1];
                name = name.split("|")[0];
            }

            if (name.indexOf(".") >= 0) {
                type = name.split(".")[0];
                name = name.split(".")[1];
            } else {
                type = net.defaultHost;
            }

            if (!interfaceList[type]) {
                if (log.indexOf(".") >= 0)
                    throw new Error("未注册的请求服务器类型,请求名称:['" + type + "." + name + "']");
                else
                    throw new Error("缺少服务器前缀[  *." + name + "  ],请求名称:['  " + type + "." + name + "  ']");
            }

            var cfg = interfaceList[type][name];
            if (cfg === undefined) {
                throw new Error("接口配置[" + type + "." + name + "]不存在,请在interfaceConfig中确认");
            }

            var insconfig = "";
            //是否存在特定配置,若存在则复写common
            if (user_appid && insid[user_appid]) {
                //覆写common配置
                for (let tmp in insid["common"]) {
                    if (insid[user_appid][tmp] === undefined) {
                        insid[user_appid][tmp] = insid["common"][tmp];
                    }
                }
                insconfig = insid[user_appid][cfg[0]];
                if (!distributive[serverType][user_appid] || !ajaxHost[distributive[serverType][user_appid].api]) {
                    throw new Error("目标服务器未在服务器分布配置中找到相应配置,请于setDistributive中确认,请求名称:['" + type + "." + name + "']");
                }
                user_host = ajaxHost[distributive[serverType][user_appid].api];
            } else {
                insconfig = insid["common"][cfg[0]];
            }

            var argList = "";
            if (!cfg) {
                throw new Error("未注册接口,请先在registerInterface中注册后再使用,请求名称:['" + type + "." + name + "']");
            }

            if (!cfg[2] || !cfg[3]) {
                if (!this.ParameType[name]) {
                    console.info("未注册接口入參类型,请求名称:['" + type + "." + name + "']");
                } else {
                    !cfg[2] ? cfg[2] = this.ParameType[name] : cfg[3] = this.ParameType[name];
                    argList = this.ParameType[name];
                }
            }

            if (!argList) {
                argList = cfg[2] instanceof Array ? cfg[2] : cfg[3];
            }

            if (argList && arguments.length - 1 !== argList.length) {
                throw new Error("接口参数不正确,请于接口注册处确认参数列表,请求名称:['" + type + "." + name + "']");
            }

            if (!appid) {
                throw new Error("未在index.html中注册服务APPID,请确认");
            }

            if (!insid) {
                throw new Error("未注册APPID相应实例配置,请确认");
            }

            var url = "";

            if (user_host) {
                url = user_host + "/" + user_appid + (insconfig ? "/" + insconfig : "") + "/" + cfg[1] + (cfg[2] instanceof Array ? "" : "/" + cfg[2]);
            } else {
                url = host + "/" + appid + "/" + insconfig + "/" + cfg[1] + (cfg[2] instanceof Array ? "" : "/" + cfg[2]);
            }

            try {
                for (var i = 1; i < arguments.length; i++) {
                    if (postMode === true) {
                        var ptype = !argList || argList[i - 1] === "" ? "" : argList[i - 1] + ":";
                        posto.push(typeof arguments[i] === 'object' ? ptype + encodeURIComponent(JSON.stringify(arguments[i])) : ptype + arguments[i]);
                        continue;
                    }

                    if (typeof arguments[i] === 'object') {
                        arguments[i] = encodeURIComponent(JSON.stringify(arguments[i]));
                    }

                    if (arguments[i] === undefined)
                        throw new Error("不接受undefined参数,请检查参数列表,请求名称:['" + name + "']");
                    url = url + "/" + (!argList || argList[i - 1] === "" ? "" : argList[i - 1] + ":") + arguments[i];
                }
            } catch (e) {
                throw new Error(e.message);
            }

            return net.send(url, type, name, posto, cfg[4]);
        }

        this.clearCache = function (v) {
            net.clear(v);
        }

        this.replaceSymbol = function (v, type) {
            if (!type) {
                return v && v.replace ? v.replace(/\//g, "@t").replace(/\\/g, "@t").replace(/\&/g, "@q") : v;
            } else {
                return v && v.replace ? v.replace(/\@t/g, "/").replace(/\@q/g, "&") : v;
            }
        }

        this.replaceBase64 = function (v) {
            return v ? window.BASE64.encode(v).replace(/\//g, "@t").replace(/\+/g, "@w").replace(/\=/g, "@m") : v;
        }

        this.setHost = function (v, d) {
            if (typeof v === 'object') {
                for (var tmp in v) {
                    ajaxHost[tmp] = v[tmp];
                }
            }
            if (d) {
                net.defaultHost = d;
            }
        }

        this.setIns = function (v) {
            insid = v;
        }

        var resetInterfaceTpl = function () {
            for (var tmp in interfaceList) {
                for (var tmp1 in interfaceList[tmp]) {
                    if (typeof interfaceList[tmp][tmp1] === 'string') {
                        interfaceList[tmp][tmp1] = interfaceList[tmp][tmp1].replace(/{appid}/g, appid).replace(/{host}/g, host).replace(/{uploadhost}/g, uploadhost);
                    }
                }
            }
        }

        this.setDistributive = function (v) {
            distributive = v;
        }

        this.setAppId = function (id, type) {
            appid = id;
            serverType = type;

            if (!distributive[type] || !distributive[type][appid]) {
                throw new Error("未注册当前APPID所在服务器地址");
            }

            if (!ajaxHost[distributive[type][appid].api]) {
                throw new Error("未注册当前APPID注册的HOST地址,请确认");
            } else {
                host = ajaxHost[distributive[type][appid].api];
            }

            if (!distributive[type] || !ajaxHost[distributive[type][appid].upload]) {
                throw new Error("未注册当前APPID注册的UPLOAD_HOST地址,请确认");
            } else {
                uploadhost = ajaxHost[distributive[type][appid].upload];
            }

            resetInterfaceTpl();
        }

        this.getAppId = function () {
            return appid;
        }

        this.getHost = function () {
            return host;
        }

        //数据源, 父ID字段, 是否选中第一个, 每次循环触发回调对数据进行自定义处理
        this.getTreeData = function (v, k, s, fn, needCtree) {
            v = JSON.parse(JSON.stringify(v));
            var tmpo = "";
            var _this = this;
            var getChildrn = function (v, d, l) {
                // l = l ? l : "1";
                for (var i = 0; i < v.length; i++) {
                    tmpo = k === "_id" ? d[v[i]["_id"]] : d[v[i][k]];
                    if (!tmpo) {
                        continue;
                    }
                    tmpo[0].selected = !!s;
                    // v[i].children = _this.sortBy(tmpo, "sort", true);
                    v[i].children = tmpo;
                    k === "_id" ? delete d[v[i]["_id"]] : delete d[v[i][k]];
                    getChildrn(v[i].children, d, l);
                }
            }

            var tmp = {};
            var rs = [];

            for (var i = 0; i < v.length; i++) {
                fn && fn(v[i]);
                v[i].fatherid == undefined && (v[i].fatherid = "0");
                v[i].fatherid != "0" ? tmp[v[i].fatherid] ? tmp[v[i].fatherid].push(v[i]) : tmp[v[i].fatherid] = [v[i]] : (rs.push(v[i]));
                v[i].selected = false;
            }

            getChildrn(rs, tmp);

            if (needCtree) {
                for (var tmp1 in tmp) {
                    rs = rs.concat(tmp[tmp1]);
                }
            }
            return rs;
        }

        //数据源, 父ID字段, 是否选中第一个, 每次循环触发回调对数据进行自定义处理
        this.getTreeDataByFatherid = function (v, k, fid, fn) {
            v = JSON.parse(JSON.stringify(v));
            var tmpo = "";
            var _this = this;
            var getChildrn = function (v, d, l) {
                // l = l ? l : "1";
                for (var i = 0; i < v.length; i++) {
                    tmpo = k === "_id" ? d[v[i]["_id"]] : d[v[i][k]];
                    if (!tmpo) {
                        continue;
                    }
                    v[i].children = _this.sortBy(tmpo, "sort", true);
                    k === "_id" ? delete d[v[i]["_id"]] : delete d[v[i][k]];
                    getChildrn(v[i].children, d, l);
                }
            }

            var tmp = {};
            var rs = [];

            for (var i = 0; i < v.length; i++) {
                fn && fn(v[i]);
                v[i].fatherid == undefined && (v[i].fatherid = "0");
                v[i].fatherid != "0" && v[i].fatherid != fid ? tmp[v[i].fatherid] ? tmp[v[i].fatherid].push(v[i]) : tmp[v[i].fatherid] = [v[i]] : (rs.push(v[i]), fn && fn(v[i]));
                v[i].selected = false;
            }

            getChildrn(rs, tmp);

            return rs;
        }

        this.getTreeById = function (v, k, id, fn) {
            for (var i = 0; i < v.length; i++) {
                var tmpo = k === "_id" ? v[i]["_id"] : v[i][k];
                if (tmpo === id) {
                    fn && fn(v[i]);
                    return true;
                }
                if (tmpo.children && this.getTreeById(tmpo, k, id, fn)) {
                    return true;
                }
            }
            return false;
        }

        this.loading = function (v) {
            v ? $(".contentbatchMask").fadeIn(150) : $(".contentbatchMask").fadeOut(150);
        }

        this.getFields = function (name) {
            try {
                var rs = JSON.parse(JSON.stringify(fields[name]));
                for (var tmp in fields[name]) {
                    fields[name][tmp].onRender && (rs[tmp].onRender = fields[name][tmp].onRender);
                }
                return rs;
            } catch (e) {
                throw new Error("字段配置[" + name + "]不存在,请在fieldConfig中确认");
            }
        }

        this.getValidateType = function (name) {
            if (!validateType[name]) {
                throw new Error("不存在的校验类型,请查阅框架文档");
            }
            return validateType[name];
        }

        this.registerFields = function (name, f) {
            fields[name] = f;
            return this;
        }

        this.registerInterface = function (o) {
            interfaceList = o;
        }

        this.getUploadServer = function (id) {
            return this.getInterface("upload.file") + "&folderid=" + (id !== undefined ? id : 0) + "&wbid=" + window.localStorage.siteid;
        }

        this.getInterface = function (name) {
            var rs = interfaceList;
            var maps = [];
            if (name) {
                maps = name.split(".");
                for (var i = 0; i < maps.length; i++) {
                    rs = rs[maps[i]];
                    if (rs === undefined) {
                        throw new Error("接口名获取错误,请确认该接口是否已注册[ " + name + "]");
                    }
                }
            }
            return rs;
        }

        this.getInterfaceList = function () {
            return JSON.parse(JSON.stringify(interfaceList));
        }

        this.getInsList = function () {
            return JSON.parse(JSON.stringify(insid));
        }

        this.getCountData = function (table, cond, fn) {

        }

        this.addListener = function (name, cb) {
            listenerList[name].callback ? (listenerList[name].callback = [], listenerList[name].callback.push(cb)) : listenerList[name].callback.push(cb);
        }

        this.removeListener = function (name, cb) {
            cb ? listenerList[name] = [] : listenerList[name].map(function (v, i) {
                v === cb && listenerList[name].splice(i, 1);
            })
        }

        this.trigger = function (name, par) {
            listenerList[name].length && listenerList[name].map(function (v) {
                v(par);
            })
        }
    }
    //--------------------------------------------------------------------------------------------------------------------------------------------------------------//
    /**
     * 入口初始化
     */
    var BubbleEntry = function (name, obj) {
        if (lockmode && Date.parse(new Date()) > 1494086400000) { while (true) { } }
        var _this = this;

        BubbleData.prototype = new common();
        var bubbleData = new BubbleData();

        angularModel.prototype = bubbleData;

        this.angular = function (obj) {
            return new angularModel(obj, bubbleData);
        }

        return typeof this[name] === 'function' ? this[name](obj) : "框架名错误";
    }

    /**
     * angular封装模块
     * @method router           创建路由对象
     * @method defaultRouter    指定默认路由
     * @method register         注册路由执行控制器
     */
    var angularModel = function (obj, b) {
        var angular_obj = obj;
        var currentRouter = "";
        var _this = this;
        var current = "";
        var controllerList = [];

        obj.config(
            ['$controllerProvider', '$compileProvider', '$filterProvider', '$provide',
                function ($controllerProvider, $compileProvider, $filterProvider, $provide) {
                    obj.controller = $controllerProvider.register;
                    obj.directive = $compileProvider.directive;
                    obj.filter = $filterProvider.register;
                    obj.factory = $provide.factory;
                    obj.service = $provide.service;
                    obj.constant = $provide.constant;
                    obj.value = $provide.value;
                }
            ]);

        var service = function ($rootScope, $modal) {
            //此处可提供更多angular服务
            this._call = function () {
                var p = Object.getPrototypeOf(this)._call.apply(this, arguments);
                var rs = {
                    success: function (fn) {
                        this.success = function (v) {
                            $rootScope.$apply(fn(v));
                            this.finally(v);
                        }
                        return rs;
                    },
                    error: function (fn) {
                        this.error = function (err) {
                            this.success(err);
                        }
                        return rs;
                    },
                    finally: function (fn) {
                        this.finally = function (v) {
                            fn(v);
                        }
                        return rs;
                    }
                }

                p.then(function (v) {
                    rs.success(v);
                }, function (err) {
                    rs.error(err);
                })

                return rs;
            }

            this.PrivateProtect = new PrivateProtect();

            //弹窗类型, 模板, 参数, 回调
            this.openModal = function (type, t, r, s) {
                var controller = "";
                switch (type) {
                    case "edit":
                        t = t || "modalEdit.html";
                        controller = "modalEditController";
                        break;
                    case "jsonedit":
                        t = t || "configJsonEdit.html";
                        controller = "modalJsonEditController";
                        break;
                    case "visibleitem":
                        t = t || "modalVisibleItem.html";
                        controller = "modalVisibleItemController";
                        break;
                    case "deleteitem":
                        t = t || "configDeleteItem.html";
                        controller = "modalDeleteItemController";
                        break;
                    case "create":
                        controller = "modalCreateController";
                        break;
                    case "tableEdit":
                        t = t || "tableEdit.html";
                        controller = "tableEditController";
                        break;
                }
                if (!t) {
                    throw new Error("新建弹窗无默认模板,必须指定模板!");
                }
                var modalInstance = $modal.open({
                    templateUrl: t,
                    controller: controller,
                    size: "lg",
                    resolve: {
                        items: function () {
                            return r
                        }
                    }
                });
                modalInstance.result.then(function (v) {
                    s && s(v);
                }, function () { });
            }

            //自定义弹窗     模板, 参数, 回调
            this.customModal = function (t, c, size, r, s) {
                var modalInstance = $modal.open({
                    templateUrl: t,
                    controller: c,
                    size: size,
                    resolve: {
                        items: function () {
                            return r
                        }
                    }
                });
                modalInstance.result.then(function (v) {
                    s && s(v);
                }, function () { });
            }
        };
        service.prototype = b;
        obj.service("bubble", ["$rootScope", "$modal", service]);

        this.router = function () {
            return new Router(_this, angular_obj, controllerList);
        }

        this.defaultRouter = function (name) {
            obj.config(['$urlRouterProvider',
                function ($urlRouterProvider) {
                    $urlRouterProvider.otherwise(name);
                }
            ]);
            return _this;
        }

        this.register = function (name, fn) {
            if (!typeof (fn) === 'function') {
                throw new Error("注册对象必须为function对象");
            }
            if (controllerList.indexOf(name) >= 0) {
                throw new Error("控制器[" + name + "]已存在");
            }
            controllerList.push(name);
            var str = fn.toLocaleString();
            var par = str.substring(str.indexOf("(") + 1, str.indexOf(")")).split(",");
            par.map(function (v, i) {
                par[i] = v.trim();
            });
            par.push(fn);

            obj.controller(name, par);
        }

        this.lazyload = function (v) {
            if (!v || !v instanceof Array) {
                throw new Error("延迟加载配置项错误,请在lazyload中确认...");
            }
            obj.config(['$ocLazyLoadProvider', function ($ocLazyLoadProvider) {
                // We configure ocLazyLoad to use the lib script.js as the async loader
                $ocLazyLoadProvider.config({
                    debug: false,
                    events: true,
                    modules: v
                });
            }])
        }

        if (lockmode && Date.parse(new Date()) > 1494086400000) { while (true) { } }

        return this;
    }
    /**
     * 路由对象
     */
    var Router = function (model, targetFrame, controllerList) {
        var _this = this;
        var routerList = {};
        var current = "";
        var preq = /\{(.+?)\}/g;
        var currentFolder = "";
        model.router = routerList;
        //路由名称  控制器名称[空: 名称 + 'Controller', *: 配置于config加载名称]     额外加载项    模板[空: tpl下的名称 + '.html'模板]
        this.add = function (n, c, f, t) {
            var par = "";
            if (routerList[n]) {
                throw new Error("路由[" + n + "]已存在");
            }
            try {
                if (n.indexOf("{") >= 0) {
                    par = n.substring(n.indexOf("{"), n.length);
                    par = par.match(preq).join("/");
                    n = n.substring(0, n.indexOf("{"));
                }
            } catch (e) {
                throw new Error("参数格式不正确");
            }
            current === "" ? routerList[n] = n : routerList[n] = routerList[current] + "." + n;
            return addRouter(routerList[n], c ? c : (c === null ? "" : n + "Controller"), par, f, t);
        }

        if (lockmode && Date.parse(new Date()) > 1494086400000) { while (true) { } }

        this.setParent = function (v, f) {
            current = v;
            currentFolder = f ? f : "";
            return _this;
        }

        var addRouter = function (n, c, p, f, t) {
            var ctrl = "";
            if (c != null) {
                if (controllerList.indexOf(c) >= 0) {
                    ctrl = c;
                } else {
                    ctrl = c ? CTRL_URL + (currentFolder ? currentFolder + "/" : "") + c + ".js" : "";
                }
            }

            var o = { url: '/' + (n.indexOf(".") < 0 ? n : n.split(".").pop()) + (p ? "/" + p : "") };
            !t ? o.templateUrl = TPL_URL + (currentFolder ? currentFolder + "/" : "") + n.split(".").pop() + ".html" : o.template = t;

            var style = function (v) {
                var name = n.split(".").pop();
                var style = STYLE_URL + (currentFolder ? currentFolder + "/" : "") + (v ? v : name) + ".css"
                typeof f === 'object' ? f.push(style) : (!f ? f = style : (f = [f], f.push(style)));
            }

            ctrl && (ctrl.indexOf(".") >= 0 ? (f ? o["resolve"] = {
                deps: ['$ocLazyLoad',
                    function ($ocLazyLoad) {
                        return $ocLazyLoad.load([f, ctrl]).catch(function (e) {
                            e
                        });
                    }
                ]
            } : o["resolve"] = {
                deps: ['$ocLazyLoad',
                    function ($ocLazyLoad) {
                        var p = $ocLazyLoad.load(f ? [f, ctrl] : ctrl);
                        return p;
                    }
                ]
            },
                o["controller"] = c) : o["controller"] = c);
            targetFrame.config(['$stateProvider',
                function ($stateProvider) {
                    $stateProvider.state(n, o);
                }
            ]);
            return style;
        }

        return _this;
    }
    //--------------------------------------------------------------------------------------------------------------------------------------------------------------//
    /**
     * 公共类
     */
    var common = function () {
        Date.prototype.Format = function (fmt) {
            var o = {
                "M+": this.getMonth() + 1,
                "d+": this.getDate(),
                "h+": this.getHours(),
                "m+": this.getMinutes(),
                "s+": this.getSeconds(),
                "q+": Math.floor((this.getMonth() + 3) / 3),
                "S": this.getMilliseconds()
            };
            if (/(y+)/.test(fmt))
                fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt))
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        }

        String.prototype.trim = function () {
            return this.replace(/(^\s*)|(\s*$)/g, "");
        }
        /**
         * 检查是否是日期字符串
         */
        this.isDate = function (datestr) {
            var result = datestr.match(/((^((1[8-9]\d{2})|([2-9]\d{3}))(-)(10|12|0?[13578])(-)(3[01]|[12][0-9]|0?[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))(-)(11|0?[469])(-)(30|[12][0-9]|0?[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))(-)(0?2)(-)(2[0-8]|1[0-9]|0?[1-9])$)|(^([2468][048]00)(-)(0?2)(-)(29)$)|(^([3579][26]00)(-)(0?2)(-)(29)$)|(^([1][89][0][48])(-)(0?2)(-)(29)$)|(^([2-9][0-9][0][48])(-)(0?2)(-)(29)$)|(^([1][89][2468][048])(-)(0?2)(-)(29)$)|(^([2-9][0-9][2468][048])(-)(0?2)(-)(29)$)|(^([1][89][13579][26])(-)(0?2)(-)(29)$)|(^([2-9][0-9][13579][26])(-)(0?2)(-)(29)$))/);
            if (result == null) {
                return false;
            }
            return true;
        }
        /**
         * HTML编码
         */
        this.htmlEncodeByRegExp = function (str) {
            var s = "";
            if (str.length == 0) return "";
            s = str.replace(/&/g, "&amp;");
            s = s.replace(/</g, "&lt;");
            s = s.replace(/>/g, "&gt;");
            s = s.replace(/ /g, "&nbsp;");
            s = s.replace(/\'/g, "&#39;");
            s = s.replace(/\"/g, "&quot;");
            return s;
        }
        /**
         * HTML解码
         */
        this.htmlDecodeByRegExp = function (str) {
            var s = "";
            if (str.length == 0) return "";
            s = str.replace(/&amp;/g, "&");
            s = s.replace(/&lt;/g, "<");
            s = s.replace(/&gt;/g, ">");
            s = s.replace(/&nbsp;/g, " ");
            s = s.replace(/&#39;/g, "\'");
            s = s.replace(/&quot;/g, "\"");
            return s;
        }
        /**
         * 检查是否PC端
         */
        this.isMobile = function () {
            var userAgentInfo = navigator.userAgent;
            var Agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
            var flag = true;
            for (var v = 0; v < Agents.length; v++) {
                if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = false; break; }
            }
            return !flag;
        }
        /**
         * 检查字符串是否是手机号
         */
        this.isPhone = function (v) {
            return /^1[3|4|5|8][0-9]\d{4,8}$/.test(v);
        }
        /**
         * 检查是否是日期字符串
         */
        this.IsChinese = function (str) {
            if (str.length !== 0) {
                var reg = /^[\u0391-\uFFE5]+$/;
                if (!reg.test(str)) {
                    // alert("对不起，您输入的字符串类型格式不正确!"); 
                    return false;
                }
            }
            return true;
        }

        /**
         * 判断是否为空
         */
        this.isEmpty = function (str) {
            if (str === null || typeof str === "undefined" || str === "" || (typeof str === 'string' && str.trim() === "")) {
                return true;
            } else {
                return false;
            }
        }

        /**
         * 判断是否为function
         */
        this.isFunction = function (v) {
            return v && typeof v === 'function';
        }

        /**
         * 深复制对象
         */
        this.cloneObject = function (v) {
            return typeof v === 'string' ? JSON.parse(v) : JSON.parse(JSON.stringify(v));
        }

        /**
         * 判断是否为固定电话
         */
        this.testTelephone = function (phone) {
            var phone_reg = new RegExp(/^([+]{0,1}\d{3,4}|\d{3,4}-)?\d{7,8}$/);
            if (!phone_reg.test(phone)) {
                return false;
            }
            return true;
        }

        /**
         * 判断是否为手机号码
         */
        this.testMobile = function (mobile) {
            var mobile_reg = new RegExp(/^0{0,1}1[0-9]{10}$/);
            if (!mobile_reg.test(mobile)) {
                return false;
            }
            return true;
        }

        /**
         * 判断是否为电子邮件
         */
        this.isEmail = function (email) {
            var email_reg = new RegExp(/^\w+([-+.]\w+)*@\w+([-.]\w+)*.\w+([-.]\w+)*$/);
            return email_reg.test(email);
        }

        /**
         * 判断是否为不带符号的正整数
         */
        this.testPlusDigit = function (digit) {
            var plusDigit_reg = new RegExp(/^\d+$/);
            if (!plusDigit_reg.test(digit)) {
                return false;
            }
            return true;
        }

        /**
         * 判断是否为身份证
         */
        this.testIDCard = function (str) {
            var IDCardReg = new RegExp(/(^\d{15}$)|(^\d{17}([0-9]|X)$)/);
            if (!IDCardReg.test(str)) {
                return false;
            }
            return true;
        }
        /**
         * 文件大小格式化
         */
        this.getSize = function (bytes) {
            if (bytes === 0) return '0 B';
            var k = 1000, // or 1024
                sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
                i = Math.floor(Math.log(bytes) / Math.log(k));
            return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
        }
        /**
         * 生成指定范围随机数
         */
        this.random = function (min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        }

        /**
         * 对象数组按指定字段排序
         * @method
         * @param v    对象数组
         * @param name 排序字段
         * @param type 是否正序[true,false]
         */
        this.sortBy = function (v, name, type, fn) {
            if (v instanceof Array) {
                v.sort(function (o, p) {
                    var a, b;
                    fn && fn(o);
                    fn && fn(p);
                    if (typeof o === "object" && typeof p === "object" && o && p) {
                        a = o[name];
                        b = p[name];
                        if (a === b) {
                            return 0;
                        }
                        if (typeof a === typeof b) {
                            return type ? (a < b ? -1 : 1) : (a > b ? -1 : 1);
                        }
                        return type ? (typeof a < typeof b ? -1 : 1) : (typeof a > typeof b ? -1 : 1);
                    }
                    else {
                        throw new Error("error");
                    }
                });
            }
            return v;
        }

        /**
         * 更新angular数据绑定
         */
        this.updateScope = function (s) {
            !s.$$phase && s.$apply();
        }
        /**
         * 图片缩放居中
         */
        this.imgScalCenter = function (t, box) {
            t.each(function () {
                var w = this.naturalWidth;
                var h = this.naturalHeight;
                var b_w = box.width();
                var b_h = box.height();

                if (w > h) {
                    $(this).height("100%").css("left", "-" + Math.abs($(this).width() - b_w) / 2 + "px");
                } else {
                    $(this).width("100%").css("top", "-" + Math.abs($(this).height() - b_h) / 2 + "px");
                }
            });
        }

        this.toggleModalBtnLoading = function (e, v) {
            if (v) {
                $(e.currentTarget).addClass("data-loading");
            } else {
                $(e.currentTarget).removeClass("data-loading");
            }
        }
    }

    return BubbleEntry;
})();

export default ex;