bubbleFrame.register('apiController', function ($scope, bubble, $modal, $http, $stateParams, $timeout) {
    $scope.process = {show: false, content: "", type: ""};
    $scope.newpar = {type: "s", value: ""};
    $scope.header = "";
    var ParameType = {
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
    };
    $scope.oneAtATime = true;

    $scope.groups = window.localStorage.apitester ? JSON.parse(window.localStorage.apitester) : {};
    var intf = bubble.getInterfaceList();
    var ins = bubble.getInsList().common;
    $scope.interfaceList = {};

    for (var tmp in ins) {
        if (typeof ins[tmp] === 'string') {
            $scope.interfaceList[ins[tmp]] = intf[tmp];
        }
    }

    $scope.url = "http://60.173.0.46:801/19/GrapeContent/Content/totalArticle/s:597ff7609c93690f5a54291b";
    $scope.type = "GET";
    $scope.req = {
        isGrape: true,
        host: "",
        port: "",
        appid: "",
        jar: "",
        class: "",
        func: "",
        par: []
    };

    $scope.save = function () {
        bubble.customModal("ApiSaveModal.html", "ApiSaveController", "lg", $scope, function (v) {
            $scope.groups = v;
        });
    };

    $scope.userClick = function (v) {
        $scope.header = v.header;
        $scope.url = v.url;
        $scope.type = v.type;
        $scope.req.isGrape = v.isGrape;
        initReq();
    };

    $scope.systemClick = function (v, name) {
        if (typeof v == "string") {
            swal("该接口定义因前端使用需要而定义,无法填充");
            return;
        }
        var par = [];
        if (v.length < 4) {
            par = ParameType[name];
        } else {
            par = v[3];
        }

        var url = "http://" + ($scope.req.host ? ($scope.req.port ? $scope.req.host + ":" + $scope.req.port : $scope.req.host) : "") + "/" + ($scope.req.appid ? $scope.req.appid : "") + "/" + ins[v[0]] + "/" + v[1] + "/" + v[2];
        for (var i = 0; i < par.length; i++) {
            url += "/" + par[i] + ":";
        }
        $scope.url = url;
        $scope.req.isGrape = true;
        initReq();
    };

    var initReq = function () {
        var url = $scope.url.split("/");
        $scope.req.host = url[2].split(":")[0] ? url[2].split(":")[0] : $scope.req.host;
        $scope.req.port = url[2].split(":")[1] ? url[2].split(":")[1] : $scope.req.port;
        $scope.req.appid = url[3] ? url[3] : $scope.req.appid;
        $scope.req.jar = url[4] ? url[4] : $scope.req.jar;
        $scope.req.class = url[5] ? url[5] : $scope.req.class;
        $scope.req.func = url[6] ? url[6] : $scope.req.func;
        $scope.req.par = [];
        for (var i = 7; i < url.length; i++) {
            if (url[i].indexOf(":") >= 0)
                $scope.req.par.push({type: url[i].split(":")[0], value: url[i].split(":")[1]});
            else
                $scope.req.par.push({type: "s", value: url[i]});
        }
    };

    initReq();

    $scope.request = function () {
        var p = {};
        p.url = $scope.url;
        if ($scope.header) {
            p.beforeSend = function (r) {
                r.setRequestHeader("GrapeSID", $scope.header);
            }
        }
        if ($scope.type == "GET") {
            p.type = "get";
        } else {
            p.type = "post";
            if ($scope.req.par.length) {
                var pstr = "";
                for (var i = 0; i < p.length; i++) {
                    pstr != "" && (pstr += "&");
                    pstr += i + "=" + p[i];
                }
            }
            p.data = pstr;
        }
        p.success = function (v, status, o) {
            $scope.json.runder(v);
            $scope.result = true;
            initProcess(o.status);
            bubble.updateScope($scope);
        };
        p.error = function (v) {
            $scope.result = false;
            initProcess(v.status);
            bubble.updateScope($scope);
        };
        $scope.process.type = "info";
        $scope.process.content = "请求正在处理中";
        $scope.process.show = true;
        $.ajax(p);
    };

    var initProcess = function (status) {
        $scope.process.type = status == 200 ? "success" : "danger";
        $scope.process.content = status == 200 ? "<p>请求已完成</p>" : "<p>请求发生错误</p>";
        if ($scope.req.isGrape) {
            if ($scope.header) {
                $scope.process.content += "<p>请求头部 : " + $scope.header + "</p>";
            }
            $scope.process.content += "<p>请求请求URL : " + $scope.url + "</p>";
            if ($scope.req.par.length) {
                for (var i = 0; i < $scope.req.par.length; i++) {
                    $scope.process.content += "<p>参数" + (i + 1) + " : " + $scope.req.par[i].value + "</p>";
                }
            }
        }
        $scope.process.content += "<p>请求返回码 : " + status + "</p>";
    };

    $scope.changeHost = function (v) {
        $scope.req.host = v ? v : $scope.req.host;
        var url = $scope.url.split("/");
        if (url[2].indexOf(":") >= 0) {
            url[2] = url[2].split(":");
            url[2][0] = $scope.req.host;
            url[2] = url[2].join(":");
        } else {
            url[2] = $scope.req.host;
        }
        $scope.url = url.join("/");
    };

    $scope.changePort = function (v) {
        $scope.req.port = v ? v : $scope.req.port;
        var url = $scope.url.split("/");
        if (url[2].indexOf(":") >= 0) {
            url[2] = url[2].split(":");
            url[2][1] = $scope.req.port;
            url[2] = url[2].join(":");
        } else {
            url[2] = url[2] + ":" + $scope.req.port;
        }
        $scope.url = url.join("/");
    };

    $scope.changeReq = function (v, i, name) {
        $scope.req[name] = v ? v : $scope.req[name];
        var url = $scope.url.split("/");
        url[i] = $scope.req[name];
        $scope.url = url.join("/");
    };

    $scope.changePar = function (v, i) {
        var url = $scope.url.split("/");
        url[url.length - $scope.req.par.length + i] = v.type + ":" + v.value;
        $scope.url = url.join("/");
    };

    $scope.addPar = function () {
        if (!$scope.url) {
            swal("请先输入URL");
            return;
        }
        if (!$scope.newpar.value) {
            swal("请输入参数值");
            return;
        }
        $scope.url += "/" + $scope.newpar.type + ":" + $scope.newpar.value;
        $scope.newpar = {type: "s", value: ""};
        initReq();
    };

    $scope.changeUrl = function () {
        if ($scope.url.split("/").length < 7) {
            $scope.req.isGrape = false;
        } else
            initReq();
    };

    var Json = function () {
        window.SINGLE_TAB = "  ";
        window.ImgCollapsed = "./img/Collapsed.gif";
        window.ImgExpanded = "./img/Expanded.gif";
        window.QuoteKeys = true;

        function $id(id) {
            return document.getElementById(id);
        }

        function IsArray(obj) {
            return obj &&
                typeof obj === 'object' &&
                typeof obj.length === 'number' &&
                !(obj.propertyIsEnumerable('length'));
        }

        this.runder = function (v) {
            Process(v);
        };

        this.coll = function () {
            CollapseAllClicked();
        };

        this.level = function (i) {
            CollapseLevel(i);
        };

        this.ex = function () {
            ExpandAllClicked();
        };

        function Process(v) {
            SetTab();
            window.IsCollapsible = true;
            var json = v;
            var html = "";
            try {
                if (json == "") {
                    json = "\"无返回数据\"";
                    $id("Canvas").innerHTML = "<PRE class='CodeContainer'>" + json + "</PRE>";
                    return;
                }
                var obj = eval("[" + json + "]");
                html = ProcessObject(obj[0], 0, false, false, false);
                $id("Canvas").innerHTML = "<PRE class='CodeContainer'>" + html + "</PRE>";
                $(".ImgExpanded").click(function () {
                    ExpImgClicked(this);
                });
            } catch (e) {
                alert("JSON数据格式不正确:\n" + e.message);
                $id("Canvas").innerHTML = v;
            }
        }

        window._dateObj = new Date();
        window._regexpObj = new RegExp();

        function ProcessObject(obj, indent, addComma, isArray, isPropertyContent) {
            var html = "";
            var comma = (addComma) ? "<span class='Comma'>,</span> " : "";
            var type = typeof obj;
            var clpsHtml = "";
            if (IsArray(obj)) {
                if (obj.length == 0) {
                    html += GetRow(indent, "<span class='ArrayBrace'>[ ]</span>" + comma, isPropertyContent);
                } else {
                    clpsHtml = window.IsCollapsible ? "<span><img class=\"ImgExpanded\" src=\"" + window.ImgExpanded + "\" /></span><span class='collapsible'>" : "";
                    html += GetRow(indent, "<span class='ArrayBrace'>[</span>" + clpsHtml, isPropertyContent);
                    for (var i = 0; i < obj.length; i++) {
                        html += ProcessObject(obj[i], indent + 1, i < (obj.length - 1), true, false);
                    }
                    clpsHtml = window.IsCollapsible ? "</span>" : "";
                    html += GetRow(indent, clpsHtml + "<span class='ArrayBrace'>]</span>" + comma);
                }
            } else if (type == 'object') {
                if (obj == null) {
                    html += FormatLiteral("null", "", comma, indent, isArray, "Null");
                } else if (obj.constructor == window._dateObj.constructor) {
                    html += FormatLiteral("new Date(" + obj.getTime() + ") /*" + obj.toLocaleString() + "*/", "", comma, indent, isArray, "Date");
                } else if (obj.constructor == window._regexpObj.constructor) {
                    html += FormatLiteral("new RegExp(" + obj + ")", "", comma, indent, isArray, "RegExp");
                } else {
                    var numProps = 0;
                    for (var prop in obj) numProps++;
                    if (numProps == 0) {
                        html += GetRow(indent, "<span class='ObjectBrace'>{ }</span>" + comma, isPropertyContent);
                    } else {
                        clpsHtml = window.IsCollapsible ? "<span><img class=\"ImgExpanded\" src=\"" + window.ImgExpanded + "\" /></span><span class='collapsible'>" : "";
                        html += GetRow(indent, "<span class='ObjectBrace'>{</span>" + clpsHtml, isPropertyContent);

                        var j = 0;

                        for (var prop in obj) {

                            var quote = true ? "\"" : "";

                            html += GetRow(indent + 1, "<span class='PropertyName'>" + quote + prop + quote + "</span>: " + ProcessObject(obj[prop], indent + 1, ++j < numProps, false, true));

                        }

                        clpsHtml = window.IsCollapsible ? "</span>" : "";

                        html += GetRow(indent, clpsHtml + "<span class='ObjectBrace'>}</span>" + comma);

                    }

                }

            } else if (type == 'number') {

                html += FormatLiteral(obj, "", comma, indent, isArray, "Number");

            } else if (type == 'boolean') {

                html += FormatLiteral(obj, "", comma, indent, isArray, "Boolean");

            } else if (type == 'function') {

                if (obj.constructor == window._regexpObj.constructor) {

                    html += FormatLiteral("new RegExp(" + obj + ")", "", comma, indent, isArray, "RegExp");

                } else {

                    obj = FormatFunction(indent, obj);

                    html += FormatLiteral(obj, "", comma, indent, isArray, "Function");

                }

            } else if (type == 'undefined') {

                html += FormatLiteral("undefined", "", comma, indent, isArray, "Null");

            } else {

                html += FormatLiteral(obj.toString().split("\\").join("\\\\").split('"').join('\\"'), "\"", comma, indent, isArray, "String");

            }

            return html;

        }

        function FormatLiteral(literal, quote, comma, indent, isArray, style) {

            if (typeof literal == 'string')

                literal = literal.split("<").join("&lt;").split(">").join("&gt;");

            var str = "<span class='" + style + "'>" + quote + literal + quote + comma + "</span>";

            if (isArray) str = GetRow(indent, str);

            return str;

        }

        function FormatFunction(indent, obj) {

            var tabs = "";

            for (var i = 0; i < indent; i++) tabs += window.TAB;

            var funcStrArray = obj.toString().split("\n");

            var str = "";

            for (var i = 0; i < funcStrArray.length; i++) {

                str += ((i == 0) ? "" : tabs) + funcStrArray[i] + "\n";

            }

            return str;

        }

        function GetRow(indent, data, isPropertyContent) {

            var tabs = "";

            for (var i = 0; i < indent && !isPropertyContent; i++) tabs += window.TAB;

            if (data != null && data.length > 0 && data.charAt(data.length - 1) != "\n")

                data = data + "\n";

            return tabs + data;

        }

        function CollapsibleViewClicked() {

            $id("CollapsibleViewDetail").style.visibility = $id("CollapsibleView").checked ? "visible" : "hidden";

            Process();

        }


        function QuoteKeysClicked() {

            window.QuoteKeys = $id("QuoteKeys").checked;

            Process();

        }


        function CollapseAllClicked() {

            EnsureIsPopulated();

            TraverseChildren($id("Canvas"), function (element) {

                if (element.className == 'collapsible') {

                    MakeContentVisible(element, false);

                }

            }, 0);

        }

        function ExpandAllClicked() {

            EnsureIsPopulated();

            TraverseChildren($id("Canvas"), function (element) {

                if (element.className == 'collapsible') {

                    MakeContentVisible(element, true);

                }

            }, 0);

        }

        function MakeContentVisible(element, visible) {

            var img = element.previousSibling.firstChild;

            if (!!img.tagName && img.tagName.toLowerCase() == "img") {

                element.style.display = visible ? 'inline' : 'none';

                element.previousSibling.firstChild.src = visible ? window.ImgExpanded : window.ImgCollapsed;

            }

        }

        function TraverseChildren(element, func, depth) {

            for (var i = 0; i < element.childNodes.length; i++) {

                TraverseChildren(element.childNodes[i], func, depth + 1);

            }

            func(element, depth);

        }

        function ExpImgClicked(img) {

            var container = img.parentNode.nextSibling;

            if (!container) return;

            var disp = "none";

            var src = window.ImgCollapsed;

            if (container.style.display == "none") {

                disp = "inline";

                src = window.ImgExpanded;

            }

            container.style.display = disp;

            img.src = src;

        }

        function CollapseLevel(level) {

            EnsureIsPopulated();

            TraverseChildren($id("Canvas"), function (element, depth) {

                if (element.className == 'collapsible') {

                    if (depth >= level) {

                        MakeContentVisible(element, false);

                    } else {

                        MakeContentVisible(element, true);

                    }

                }

            }, 0);

        }

        function TabSizeChanged() {

            Process();

        }

        function SetTab() {
            window.TAB = MultiplyString(parseInt(2), window.SINGLE_TAB);
        }

        function EnsureIsPopulated() {

            if (!$id("Canvas").innerHTML && !!$id("RawJson").value) Process();

        }

        function MultiplyString(num, str) {

            var sb = [];

            for (var i = 0; i < num; i++) {

                sb.push(str);

            }

            return sb.join("");

        }

        function SelectAllClicked() {


            if (!!document.selection && !!document.selection.empty) {

                document.selection.empty();

            } else if (window.getSelection) {

                var sel = window.getSelection();

                if (sel.removeAllRanges) {

                    window.getSelection().removeAllRanges();

                }

            }


            var range =

                (!!document.body && !!document.body.createTextRange)

                    ? document.body.createTextRange()

                    : document.createRange();


            if (!!range.selectNode)

                range.selectNode($id("Canvas"));

            else if (range.moveToElementText)

                range.moveToElementText($id("Canvas"));


            if (!!range.select)

                range.select($id("Canvas"));

            else

                window.getSelection().addRange(range);

        }

        function LinkToJson() {

            var val = $id("RawJson").value;

            val = escape(val.split('/n').join(' ').split('/r').join(' '));

            $id("InvisibleLinkUrl").value = val;

            $id("InvisibleLink").submit();

        }
    };

    $scope.json = new Json();
});

bubbleFrame.register('ApiSaveController', function ($scope, bubble, $timeout, items, $modalInstance) {
    var s = {
        header: items.header,
        url: items.url,
        type: items.type,
        isGrape: items.req.isGrape
    };

    $scope.name = "";
    $scope.type = Object.getOwnPropertyNames(items.groups).length ? "0" : "-1";
    $scope.newtype = "";
    $scope.list = items.groups;
    $scope.listshow = Object.getOwnPropertyNames(items.groups).length;

    $scope.ok = function (e) {
        var o = window.localStorage.apitester ? JSON.parse(window.localStorage.apitester) : {};
        s.name = $scope.name;
        if ($scope.type == -1) {
            o[$scope.newtype] = {name: $scope.newtype, data: []};
            o[$scope.newtype].data.push(s);
        } else {
            o[$scope.list[$scope.type].name].data.push(s);
        }
        window.localStorage.apitester = JSON.stringify(o);
        $modalInstance.close(o);
    };

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});
