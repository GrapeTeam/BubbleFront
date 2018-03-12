import angular from "angular";
import app from "../../main";
import $ from "jquery";

app.directive('uiSitechose', ['$http', 'bubble', function ($http, bubble) {
    return {
        restrict: 'AE',
        scope: {
            config: "="
        },
        template: `<div class="site-chose-wrap none">
                        <div class="site-chose-box pos-rlt">
                            <div class="header b-b">
                                {{config.title}}
                                <a class="pull-right btn btn-sm btn-default m-t-sm ng-binding" ng-click="closeChose()">关闭</a>
                                <a class="pull-right btn btn-sm btn-info m-t-sm m-r-sm ng-binding" ng-click="ok()">确定</a>
                            </div>
                            <div class="wrapper list-wrap">
                                <div class="contentbatchMask">
                                    <div class="loading-spinner">
                                        <div class="rect1"></div>
                                        <div class="rect2"></div>
                                        <div class="rect3"></div>
                                        <div class="rect4"></div>
                                        <div class="rect5"></div>
                                    </div>
                                </div>
                                <div class="b-a h-full r-2x">
                                    <div class="list-box b-r" ng-class="{hmax: !config.multiple}">
                                        <div class="title b-b">{{typename[config.type].left}}</div>
                                        <div class="list list1 wrapper">
                                        
                                        </div>
                                    </div>
                                    <div class="list-box" ng-class="{hmax: !config.multiple}">
                                        <div class="title b-b">{{typename[config.type].right}}</div>
                                        <div class="tipsbox" ng-show="!data[1].length">暂无</div>
                                        <div class="list list2 wrapper">
                                        
                                        </div>
                                    </div>
                                    <div class="itembox b-t" ng-if="config.multiple">
                                        <div class="title b-b">已选项</div>
                                        <div class="itemwrap">
                                            <div class="tipsbox" ng-show="!config.items.length">请选择内容</div>
                                            <div class="list listb wrapper">
                                                <div class="item" ng-repeat="item in config.items">{{item.path}}<span class="deletebtn pull-right" ng-click="removeItem(item, $index, $event)"><i class="glyphicon glyphicon-remove"></i></span></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`,
        replace: true,
        link: function (scope, element, attr) {
            var config = scope.config;
            var multiple = config.multiple;
            var panel = config.panel;
            scope.data = [];
            var current1 = "";      //左侧当前选中文字
            var panel1 = element.find(".list1");
            var panel2 = element.find(".list2");
            var keylist = [];
            scope.leftname = "";
            scope.rightname = "";

            scope.typename = {
                column: {
                    left: "站点选择",
                    right: "栏目选择",
                },
                content: {
                    left: "栏目选择",
                    right: "新闻选择",
                },
                sdk: {
                    left: "平台选择",
                    right: "实例选择",
                },
                onlyColumn: {
                    right: "栏目列表"
                },
                onlyGovColumn: {
                    right: "政府信息公开网栏目列表"
                }
            }

            var typeCall = {
                column: {
                    left: function () {
                        bubble._call("site.getall", 1, 1000, window.localStorage.siteid).success(function (v) {
                            initLeft(v, "title");
                        });
                    },
                    right: function (id) {
                        bubble._call("column.pageByWbid", 1, 1000, id).success(function (v) {
                            initRight(v, "name");
                        });
                    }
                },
                content: {
                    left: function () {
                        bubble._call("column.pageByWbid", 1, 1000, window.localStorage.siteid).success(function (v) {
                            initLeft(v, "name");
                        });
                    },
                    right: function (id) {
                        bubble._call("content.pageBy", 1, 100, [{ "field": "ogid", "logic": "=", "value": id }]).success(function (v) {
                            initRight(v, "mainName");
                        });
                    }
                },
                sdk: {
                    left: function () {
                        bubble._call("wechat.page", 1, 1000).success(function (v) {
                            initLeft(v, "sdkname", "id");
                        });
                    },
                    right: function (id) {
                        bubble._call("wechatUser.pageBy", 1, 100, { platid: id }).success(function (v) {
                            initRight(v, "name", "id");
                        });
                    }
                },
                onlyColumn: {
                    left: function (id) {
                        bubble._call("column.page", 1, 1000).success(function (v) {
                            initSingle(v, "name");
                        });
                    }
                },
                onlyGovColumn: {
                    left: function (id) {
                        bubble._call("column.getGovColumn").success(function (v) {
                            initGovColumn(v, "Name");
                        });
                    }
                }
            }

            var initLeft = function (v, key, id) {
                keylist[0] = key;
                v = v.data;
                scope.data[0] = v.length ? bubble.getTreeData(v, id || "_id", true) : [];
                initSiteHtml(scope.data[0], key);
                initSiteEvent();
                $(".contentbatchMask").fadeOut(200);
            }

            var initRight = function (v, key, id) {
                keylist[1] = key;
                v = v.data;
                scope.data[1] = v.length ? bubble.getTreeData(v, id || "_id", true) : [];
                initContentHtml(scope.data[1], key);
                $(".contentbatchMask").fadeOut(200);
            }

            var initSingle = function (v, key) {
                keylist[1] = key;
                v = v.data;
                scope.data[1] = v.length ? bubble.getTreeData(v, "_id", true) : [];
                $(".site-chose-box .list-box:eq(0)").hide();
                $(".site-chose-box .list-box:eq(1)").addClass("wmax");
                initContentHtml(scope.data[1], key);
                $(".contentbatchMask").fadeOut(200);
            }

            var initGovColumn = function(v, key){
                var initTree = function (v) {
                    for (var i = 0; i < v.length; i++) {
                        if (v[i].Child && v[i].Child.length) {
                            v[i].children = v[i].Child;
                            initTree(v[i].children);
                        } else {
                            delete v[i].Child;
                        }
                    }
                    return v;
                }
                keylist[1] = "_id";
                scope.data[1] = v.length ? initTree(v) : [];
                $(".site-chose-box .list-box:eq(0)").hide();
                $(".site-chose-box .list-box:eq(1)").addClass("wmax");
                initContentHtml(scope.data[1], key);
                $(".contentbatchMask").fadeOut(200);
            }

            scope.visible = true;
            //参数check
            if (!config) {
                throw new Error("[ui-sitechose]组件的[config]参数未配置,请于控制器中查看配置");
            }
            if (!config.type) {
                throw new Error("[ui-sitechose]组件的[config][type]参数未配置,请于控制器中查看配置");
            }
            if (!typeCall[config.type]) {
                throw new Error("[ui-sitechose]组件当前不支持该类型选择,请查阅相关文档");
            }
            if (!scope.config.method) {
                scope.config.method = {};
            }

            scope.closeChose = function () {
                scope.config.method.hide();
            }

            scope.config.method.show = function () {
                element.fadeIn(200);
                $(".contentbatchMask").fadeIn(200);
                typeCall[config.type].left();
            }

            scope.config.method.refresh = function () {

            }

            scope.config.method.hide = function () {
                element.fadeOut(200);
                scope.config.items = [];
                element.find(".list2 .item").remove();
                element.find(".list1 .item").removeClass("cur");
            }

            scope.removeItem = function (v, i, e) {
                $(e.target).parents("div:first").remove();
                scope.config.items.splice(i, 1);
            }

            scope.ok = function () {
                config.onConfirm && config.onConfirm(config.items);
                scope.config.closeOnSelected && scope.config.method.hide();
            }

            var getObjByIdMap = function (map, o) {
                var tmp = null;
                var t = "";
                tmp = map.split("-");
                var path = [];

                while (tmp.length > 0) {
                    o = o.children ? o.children : o;
                    t = tmp.shift();
                    o = o[t];
                    path.push(o[keylist[1]]);
                }
                return [o, path];
            }

            var initSiteHtml = function (v, key, l, idx) {
                l = l || 0;
                var obj = panel1;
                if (l === undefined) {
                    obj.html("");
                }
                for (var i = 0; i < v.length; i++) {
                    (function (n) {
                        var x = idx !== undefined ? idx + "-" + n : n;
                        obj.append(`<div class="item" id="${v[i].Id ? v[i].Id : (v[i]._id ? v[i]._id : v[i].id)}" style="margin-left:${l * 15}px">${v[n][key]}</div>`);
                        if (v[n].children) {
                            initSiteHtml(v[n].children, key, l + 1, x);
                        }
                    })(i)
                }
            }

            var initSiteEvent = function () {
                element.find(".list1 .item").unbind("click").click(function () {
                    $(".contentbatchMask").fadeIn(200);
                    $(".list1 .item").removeClass("cur");
                    $(this).addClass("cur");
                    typeCall[config.type].right(this.id);
                    current1 = $(this).html();
                });
            }

            var initContentEvent = function () {
                element.find(".list2 .item").unbind("click").click(function () {
                    if ($(this).hasClass("cur")) {
                        return;
                    }
                    if (!scope.config.multiple) {
                        element.find(".list2 .item").removeClass("cur");
                        scope.config.items = [];
                        element.find(".listb .item").remove();
                    }
                    var v = getObjByIdMap(this.id, scope.data[1]);
                    $(this).addClass("cur");
                    scope.config.items.push({ id: v[0].Id ? v[0].Id : (v[0]._id ? v[0]._id : v[0].id), path: current1 + " > " + v[1].join(" > "), value: v[0] });
                    if (!scope.config.multiple && scope.config.closeOnSelected) {
                        config.onConfirm && config.onConfirm(config.items);
                        scope.config.closeOnSelected && scope.config.method.hide();
                    } else {
                        config.onSelect && config.onSelect(config.items);
                    }
                    bubble.updateScope(scope);
                });
            }

            var initContentHtml = function (v, key, l, idx) {
                var obj = panel2;
                if (l === undefined) {
                    obj.html("");
                }
                l = l || 0;
                if (!v.length && l === undefined) {
                    obj.append(`<div class="tipsbox">暂无数据</div>`);
                    return;
                }
                for (var i = 0; i < v.length; i++) {
                    (function (n) {
                        var x = idx !== undefined ? idx + "-" + n : n;
                        obj.append(`<div class="item" id="${x}" style="margin-left:${l * 15}px">${v[n][key]}</div>`);
                        if (v[n].children) {
                            initContentHtml(v[n].children, key, l + 1, x);
                        }
                    })(i)
                }
                initContentEvent();
            }

            element.unbind("click").click(function (e) {
                if (e.target === e.currentTarget) {
                    scope.config.method.hide();
                }
            });
        }
    }
}]);