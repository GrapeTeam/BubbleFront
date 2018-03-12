import angular from "angular";
import app from "../../main";
var $ = window.$;

var html = `<div class="panel panel-default">
                <div class="panel-heading font-bold">
                    {{title}}
                    <button class="btn btn-xs btn-info pull-right deletebtn m-l" ng-show="deleteShower" tooltip="删除选中" ng-click="sortGropu.delete()">删除选中</button>
                    <button class="btn btn-xs btn-info pull-right" tooltip="添加根项" ng-click="sortGropu.createRoot()">添加根元素</button>
                    <button class="btn btn-xs btn-info pull-right m-r" tooltip="添加根项" ng-click="sortGropu.expandAll()">全部展开</button>
                    <button class="btn btn-xs btn-info pull-right m-r" tooltip="添加根项" ng-click="sortGropu.collapseAll()">全部收起</button>
                </div>
                <div class="panel-body">
                    <div class="dd max-w-full sortbox">
                    </div>
                    <div ng-show="data.length">
                        <button class="btn btn-info ladda-button pull-right m-t-xs animated fadeIn" ng-click="sortGropu.confirm()">
                            <span class="ladda-label">确定</span>
                            <span class="ladda-spinner"><i class="fa fa-spin fa-spinner"></i></span>
                        </button>
                    </div>
                </div>
            </div>`;

var addTreeWeight = function (v, l) {
    var total = 0;
    l = l ? l : 1;
    for (var i = 0; i < v.length; i++) {
        l++;
        v[i].weight = l;
        v[i].children ? v[i].weight = addTreeWeight(v[i].children, l) : v[i].weight = l;
        total += parseInt(v[i].weight);
    }

    return total;
}

var SortGropu = function (bubble) {
    var box = "";
    var _this = this;
    var dataList = "";
    var currentState = {};
    var initState = {};
    var deleteList = [];
    var searchMap = {};
    var $scope = "";

    var getbtn = function (v, d) {
        var btn = $scope.btn;
        var html = "";
        var tmp = "";
        if (typeof btn !== 'object') {
            return v.replace("@btn", "");
        }
        for (var i = 0; i < btn.length; i++) {
            tmp = btn[i].onRender ? btn[i].onRender(btn[i].tpl, d) : "";
            html += tmp ? tmp : btn[i].tpl;
        }
        return v.replace("@btn", html);
    }

    var initHtml = function (v, i, p) {
        var idx = i || i === 0 ? i : "";
        var html = "";
        var tpl = '<li class="dd-item dd3-item" data-id="@id" data-sid="@sid" data-father="@fatherid"><div class="dd-handle dd3-handle">Drag</div><div class="dd3-content"><span>@name</span>@btn</div>@c</li>';
        var btn = '<span class="pull-right btn-box">@btn<a><i class="fa fa-pencil fa-fw m-r-xs"></i></a><a><i class="fa fa-plus fa-fw m-r-xs"></i></a><a class="column-delete-btn"><input type="checkbox"></a></span>';
        var data = v ? v : dataList;

        for (var i = 0; i < data.length; i++) {
            searchMap[idx || idx === 0 ? idx + "-" + i : i] = data[i][$scope.name];
            html += tpl.replace("@id", idx || idx === 0 ? idx + "-" + i : i).replace("@name", data[i][$scope.name] + (data[i][$scope.subname] ? "[ " + data[i][$scope.subname] + " ]" : "")).replace("@sid", data[i][$scope.fatherkey] ? data[i][$scope.fatherkey] : data[i]._id ? data[i]._id : data[i].id)
                .replace("@fatherid", data[i].fatherid)
                .replace("@c", data[i].children ? initHtml(data[i].children, idx || idx === 0 ? idx + "-" + i : i, data[i]) : "").replace("@btn", getbtn(btn, data[i]));
        }
        return dataList.length ? '<ol class="dd-list"' + (p ? "data-id='" + p._id + "'" : "data-id='0'") + '>' + html + '</ol>' : "<p class='text-center'>暂无数据</p>";
    }

    var initBtnEvent = function () {
        var btn = $scope.btn;
        box.find("input[type='checkbox']").unbind("change").change(_this.deleteListChange);
        box.find(".fa.fa-plus").click(_this.create);
        box.find(".fa.fa-pencil").click(_this.edit);
        box.find(".movebox").unbind("click").click();
        if (btn && btn.length) {
            for (var i = 0; i < btn.length; i++) {
                (function (n) {
                    box.find(".btn-box").each(function () {
                        $(this).find("a:eq(" + n + ")").unbind("click").click(function (e) {
                            var o = getEventObject(e);
                            btn[n].onClick(o);
                        });
                    })
                })(i)
            }
        }
    }

    var initLinster = function () {
        try {
            box.on("change", _this.change);
            box.nestable("init");
            initState = box.nestable('serialize');
            // _this.collapseAll();
        } catch (e) {

        }
    }

    var getCheckedItem = function (v) {
        for (var i = 0; i < deleteList.length; i++) {
            if (deleteList[i][0] === v) {
                return i;
            }
        }
    }

    var searchChange = function () {
        var value = this.key.value;
        var rs = [];
        var tmpobj = null;
        if (!value) {
            return;
        }
        for (var tmp in searchMap) {
            if (searchMap[tmp].indexOf(value) >= 0) {
                tmpobj = getDomObject(tmp)[0];
                tmpobj.obj.removeClass("cur").addClass("cur");
            }
        }
    }

    var initToolBox = function () {
        var move = false;
        var box = $(".ui-tree-toolbox");
        var sx = 0;
        var sy = 0;
        var ox = 0;
        var oy = 0;
        box.find("form").submit(searchChange);
        box.find(".movebox").mousedown(function (e) {
            var offset = $(this).offset();
            sx = e.clientX;
            sy = e.clientY;
            ox = offset.left;
            oy = offset.top;
            move = true;
        });
        $("body").mousemove(function (e) {
            if (move) {
                var x = e.clientX - sx;
                var y = e.clientY - sy;
                var _ox = ox + x;
                var _oy = oy + y;
                box.css({ "top": _oy + "px", "left": _ox + "px" });
            } else {
                if (!$(".ui-tree-toolbox").length) {
                    $("body").unbind("mousemove");
                }
            }
        });
        box.find(".movebox").mouseup(function () {
            sx = 0;
            sy = 0;
            ox = 0;
            oy = 0;
            move = false;
        });
    }

    this.clearSearch = function () {
        $(".ui-tree-toolbox form input").val("");
        box.find(".dd-item").removeClass("cur");
    }

    this.deleteListChange = function (e) {
        $scope.ischeckupdate = true;
        var o = getEventObject(e);
        var id = o[0];
        id.checked = e.currentTarget.checked;
        e.currentTarget.checked ? deleteList.push([id, $(e.currentTarget).parents("li:first"), o[3]]) : deleteList.splice(getCheckedItem(id), 1);
        $scope.deleteShower = !!deleteList.length;
        bubble.updateScope($scope);
    }

    var getDomObject = function (maps) {
        var p = "";
        var n = "";
        var d = box.nestable('serialize');
        var idx = maps.split("-");

        while (idx.length) {
            if (idx.length === 1) {
                p = d.children ? d.children : d;
            }
            n = idx.shift();
            d = d.children ? d.children[n] : d[n];
        }
        return [d, p, n, maps];
    }

    var getEventObject = function (e) {
        var t = $(e.target);
        var d = dataList;
        var p = "";
        var n = "";
        var maps = t.parents("li:first").attr("data-id");
        var idx = maps.split("-");

        while (idx.length) {
            if (idx.length === 1) {
                p = d.children ? d.children : d;
            }
            n = idx.shift();
            d = d.children ? d.children[n] : d[n];
        }

        return [d, p, n, maps];
    }

    var getSingleItemHtml = function (v, idx) {
        var tpl = '<li class="dd-item dd3-item" data-id="@id"><div class="dd-handle dd3-handle">Drag</div><div class="dd3-content">@name@btn</div>@c</li>';
        var btn = '<span class="pull-right"><a><i class="fa fa-pencil fa-fw m-r-xs"></i></a><a><i class="fa fa-plus fa-fw m-r-xs"></i></a><a class="column-delete-btn"><input type="checkbox"></a></span>';
        return tpl.replace("@id", idx).replace("@name", v[$scope.name] + (v[$scope.subname] ? "[ " + v[$scope.subname] + " ]" : ""))
            .replace("@c", "").replace("@btn", btn);
    }

    this.init = function (data, e, s, $compile, tool) {
        // box.html('<div ui-jq="nestable" ui-options="{maxDepth: 10}" class="dd max-w-full"></div>' + initHtml() + '</div>');
        deleteList = [];
        dataList = data;
        $scope = s;
        this.reload(e);
        return this;
    }

    this.reload = function (e) {
        var o = null;
        if (box) {
            o = box.clone();
            box.after(o);
            box.remove();
            box.data("nestable", null);
        }
        box = o ? o : $(".sortbox:first");
        box.html(initHtml());
        initBtnEvent();
        initToolBox();
        initLinster();
    }

    this.expandItem = function (v) {
        box.nestable("expandItem", v);
    }

    this.expandAll = function () {
        box.nestable("expandAll");
    }

    this.collapseAll = function () {
        box.nestable("collapseAll");
    }

    this.create = function (e) {
        var o = getEventObject(e);
        $scope.control.create(o, function (rs) {
            o[1][o[2]].children ? o[1][o[2]].children.push(rs) : (o[1][o[2]].children = [], o[1][o[2]].children.push(rs));
            o[3] = o[3].split("-");
            o[3].push(o[1][o[2]].children.length - 1);
            o[1][o[2]].children.length > 1 ? $(e.target).parents("li:first").find("ol").append(getSingleItemHtml(rs, o[3].join("-"))) : _this.reload();
            initBtnEvent();
        });
    }

    var deleteCheckItem = function (v) {
        var d = v ? v : dataList;
        for (var i = 0; i < d.length; i++) {
            d[i].checked ? (d.splice(i, 1), i--) : d[i].children && deleteCheckItem(d[i].children);
        }
    }

    this.delete = function () {
        var list = deleteList.map(function (v) {
            return v[0]._id;
        }).join(",");
        $scope.control.delete(list, function (x) {
            if (x.errorcode) {
                window.swal("删除失败");
                return;
            }
            window.swal("删除成功");
            deleteCheckItem();
            deleteList = [];
            $scope.deleteShower = false;
            _this.reload();
        })
    }

    this.edit = function (e) {
        var o = getEventObject(e);
        $scope.control.edit(o, function (rs) {
            for (var tmp in o[1][o[2]]) {
                if (rs[tmp])
                    o[1][o[2]][tmp] = rs[tmp];
            }
            $(e.target).parents("li:first").find("span:eq(0)").html(rs.name);
        })
    }

    _this.createRoot = function () {
        $scope.control.createRoot(function (rs) {
            dataList.push(rs);
            $(".sortbox:first>ol").append(getSingleItemHtml(rs, dataList.length - 1));
            dataList.length == 1 ? (box = "", _this.reload()) : initBtnEvent();
            $scope.data = dataList;
        })
    }

    this.change = function (e) {
        // var state = box.nestable('serialize');
        // if(JSON.stringify(state) !== JSON.stringify(initState)){         //含排序判断
        // if (hasChange(initState, state)) {
        //     // box.parent().find(".ladda-button").show();
        //     currentState = state;
        // } else {
        //     // box.parent().find(".ladda-button").hide();
        // }
        if (!$scope.control.move) {
            return;
        }
        var list = getIdxChange();
        if (list.length) {
            $scope.control.move(list, function (rs) {
                list[0][0].fatherid = list[0][1];
                _this.reload();
            });
        }
    }

    var getChangeItem = function (init, cur) {
        var rs = [];
        if (init.length !== cur.length && init.length < cur.length) {
            for (var i = 0; i < cur.length; i++) {
                if (cur[i].id !== init[i].id) {
                    rs.push(cur[i]);
                }
            }
        }
        return rs;
    }

    var hasChange = function (init, cur) {
        getChangeItem(init, cur);
        for (var i = 0; i < init.length; i++) {
            init[i].children && cur[i].children && hasChange(init[i].children, cur[i].children);
        }
    }

    var getObjByIdMap = function (map, p) {
        var o = dataList;
        var tmp = null;
        if (!isNaN(map)) {
            o = p ? dataList : dataList[map];
        } else {
            tmp = map.split("-");
            for (; tmp.length > (p ? 1 : 0);) {
                o = tmp.length == 1 ? o[tmp.shift()] : o[tmp.shift()].children;
            }
        }
        return o;
    }

    var getIdxChange = function (s, p) {
        var rs = [];
        var s = s ? s : box.nestable('serialize');
        var fid = "";
        for (var i = 0; i < s.length; i++) {
            fid = p ? s[i].obj.parents("li:first").attr("data-sid") : 0;
            if (s[i].father != fid) {
                rs.push([getObjByIdMap(s[i].id), fid, s[i].id]);
            }
            s[i].children && (rs = rs.concat(getIdxChange(s[i].children, s[i])));
        }

        return rs;
    }

    var updateDataList = function (v) {
        var f = "";
        for (var i = 0; i < v.length; i++) {
            var o = getObjByIdMap(v[i][2], true);
            var o2 = getObjByIdMap(v[i][2]);
            for (var n = 0; n < o.length; n++) {
                var x = o[n];
                if (x._id && x._id == v[i][0]._id) {
                    o.splice(n, 1);
                    break;
                }
                if (x.id && x.id == v[i][0].id) {
                    o.splice(n, 1);
                    break;
                }
            }
            bubble.getTreeById(dataList, "_id", v[i][1], function (d) {
                o2.fatherid = d.id ? d.id : d._id;
                d.children ? d.children.push(o2) : (d.children = [], d.children.push(o2));
            });
        }

        _this.reload();
    }

    this.confirm = function () {
        // var list = getIdxChange();
        // setTimeout(function () {
        //     updateDataList(list);
        // }, 10);
    }
}

app.directive('uiTree', ['$http', 'bubble', '$compile', function ($http, bubble, $compile) {
    return {
        restrict: 'AE',
        scope: {
            control: "=",
            data: "=ngModel",
            tool: "@",
            name: "@",
            fatherkey: "@",
            title: "@",
            btn: "=",
            subname: "@"
        },
        link: function ($scope, element, attr) {
            element.append($compile(html)($scope));
            $scope.$watch("data", function (n, o) {
                if ($scope.control) {
                    if (!$scope.control.edit) {
                        console.error("[edit]方法未填充至[tree]组件的control中,请于控制器中检查control定义");
                    }
                    if (!$scope.control.create) {
                        console.error("[create]方法未填充至[tree]组件的control中,请于控制器中检查control定义");
                    }
                    if (!$scope.control.createRoot) {
                        console.error("[createRoot]方法未填充至[tree]组件的control中,请于控制器中检查control定义");
                    }
                    if (!$scope.control.delete) {
                        console.error("[delete]方法未填充至[tree]组件的control中,请于控制器中检查control定义");
                    }
                } else {
                    console.error("ui-tree:[control]参数未定义,请于控制器中检查control定义");
                }
                if (!$scope.ischeckupdate) {
                    // $scope.data = n;
                    $scope.sortGropu = new SortGropu(bubble).init($scope.data, element, $scope, $compile, $scope.tool);
                }
            }, true);
        }
    };
}]);