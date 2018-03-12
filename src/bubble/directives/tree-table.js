import app from "../../main";
import $ from "jquery";
var swal = window.swal;

app.directive('treeTable', ['$http', 'bubble', '$compile', '$timeout', function ($http, bubble, $compile, $timeout) {
    return {
        restrict: 'AE',
        scope: {
            interface: "@",
            select: "@",
            callback: "=",
            data: "=",
            btn: "=",
            itembtn: "="
        },
        template: `<div class="wrapper tree-table-box">
                        <div class="panel panel-default pos-rlt ng-scope">
                            <div class="panel-heading">
                                栏目列表
                                <button class="btn btn-xs btn-info pull-right" ng-repeat="item in btn" ng-click="item.onClick()">{{item.name}}</button>
                                <button class="btn btn-xs btn-info pull-right m-r" ng-show="checkList.length" ng-click="delete()">删除选中</button>
                                <button class="btn btn-xs btn-info pull-right m-r" ng-click="expandAll()">全部展开</button>
                                <button class="btn btn-xs btn-info pull-right m-r" ng-click="collapseAll()">全部收起</button>
                            </div>
                            <p class="text-center m-t m-b" ng-if="!tree">数据加载中...</p>
                            <div class="table-responsive" ng-show="tree">
                                <table class="table table-striped b-t b-light table-bordered tree-table">
                                    <thead>
                                    </thead>
                                    <tbody>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>`,
        link: function ($scope, ele) {
            var ajaxReplacrList = {};
            var currentItem = "";
            bubble._call($scope.interface + ".page", 1, 10000).success(function (v) {
                $scope.tree = bubble.getTreeData(v.data, "_id", true);
                $scope.field = bubble.getFields($scope.interface);
                initTree($scope.tree, $scope.field);
            });

            $scope.checkList = [];

            if ($scope.callback) {
                $scope.callback.addRoot = function (v) {
                    appendTree(ele.find(".tree-table-box tbody"), [v], true);
                };

                $scope.callback.update = function (v) {
                    for (var tmp in v) {
                        currentItem[tmp] = v[tmp];
                        $scope.field[tmp] && currentItem.ele.find(".field-" + tmp).html(getHtml($scope.field[tmp], currentItem, tmp));
                    }
                };

                $scope.callback.delete = function () {
                    var d = currentItem.ele.prev().data("data");
                    if (d.children.length == 1) {
                        delete d.children;
                        clearIcon(d.ele);
                        delete d.open;
                    } else {
                        for (var i = 0; i < d.children.length; i++) {
                            if (d.children[i]._id == currentItem._id) {
                                d.children.splice(i, 1);
                            }
                        }
                    }

                    initBtnEvent(currentItem.ele, currentItem);
                    currentItem.ele.remove();
                };

                $scope.callback.addItem = function (v) {
                    currentItem.open && appendTree(currentItem.ele, [v]);
                    if (!currentItem.children) {
                        currentItem.children = [];
                        setIcon(currentItem.ele, false);
                    }
                    currentItem.children.push(v);
                    initBtnEvent(currentItem.ele, currentItem);
                };
            }

            $scope.delete = function () {
                swal({
                    title: "确定要删除该条数据吗?",
                    icon: "warning",
                    buttons: {
                        cancel: "取消",
                        defeat: "删除",
                    },
                }).then(
                    function (s) {
                        if (s) {
                            bubble._call($scope.interface + ".delete", $scope.checkList.map(function (v) { return v._id; }).join(",")).success(function (v) {
                                if (!v.errorcode) {
                                    swal("删除成功");
                                    for (var i = 0; i < $scope.checkList.length; i++) {
                                        $scope.checkList[i].ele.remove();
                                    }
                                    $scope.checkList = [];
                                } else {
                                    swal("删除失败");
                                }
                            });
                        }
                    });
            };

            var initTree = function (d, f) {
                var box = ele.find(".tree-table-box");
                var th = box.find("thead");
                var tb = box.find("tbody");

                th.append("<tr></tr>");
                var tr = th.find("tr");
                if ($scope.select != "false") {
                    tr.append('<th style="width:50px;"><label class="i-checks m-b-none timeline"><input type="checkbox"><i></i></label></th>');
                }
                for (var tmp in f) {
                    tr.append("<th>" + f[tmp].mark + "</th>");
                }
                if ($scope.itembtn && $scope.itembtn.length) {
                    tr.append('<th class="text-center">操作</th>');
                }
                appendTree(tb, d, true);
                tr.find("input").change(function () {
                    if ($(this).prop("checked")) {
                        $scope.checkList = [];
                        tb.find("tr").each(function () {
                            $scope.checkList.push($(this).data("data"));
                            $(this).find("input").prop("checked", true);
                        });
                    } else {
                        $scope.checkList = [];
                        tb.find("tr").each(function () {
                            $(this).find("input").prop("checked", false);
                        });
                    }
                    bubble.updateScope($scope);
                });
            };

            var appendTree = function (o, d, init, i) {
                var f = $scope.field;
                var rs = [];
                $scope.srcdiv = null;
                var index = '';
                var item = {};
                for (var i = 0; i < d.length; i++) {
                    var tr = $("<tr draggable='true' data=" + i + " data-index=" + (o.data("index") ? o.data("index") + "-" + i : i) + "></tr>");
                    $(tr).on({
                        dragstart: function (ev) {
                            index = $(this).attr('data-index').split('-');
                            $scope.srcdiv = this;
                        },
                        dragover: function (ev) {
                            ev.preventDefault();
                        },
                        drop: function (ev) {
                            ev.preventDefault();
                            var a = this;
                            var ind = $(this).attr('data-index').split('-');
                            var dd = $(this).attr('data');
                            var aa = $($scope.srcdiv).attr('data');
                            if ($scope.srcdiv != this && index.length == ind.length == 1) {
                                // d[$(this).attr('data')] = d[$($scope.srcdiv).attr('data')]
                                var bb = d[dd];
                                d[dd] = d[aa];
                                d[aa] = bb;
                                var item1 = d[$(this).attr('data')].children
                                var item = d[$($scope.srcdiv).attr('data')].children
                                var td = $(this).find('td')
                                var td1 = $($scope.srcdiv).find('td');
                                for (var i = 0; i < td.length - 1; i++) {
                                    var c = $(td[i]).html();
                                    $(td[i]).html($(td1[i]).html());
                                    $(td1[i]).html(c)

                                }
                                if (item1!=undefined) {
                                    var dn = d[$(this).attr('data')]
                                    $(this).find($scope.select == "false" ? "td:eq(0)" : "td:eq(1)").unbind("click").click(function () {
                                        expand.call($(a), dn);
                                    });
                                }
                                if (item!=undefined) {
                                    
                                    var dn = d[$($scope.srcdiv).attr('data')]
                                    $($scope.srcdiv).find($scope.select == "false" ? "td:eq(0)" : "td:eq(1)").unbind("click").click(function () {
                                        expand.call($($scope.srcdiv), dn);
                                    });
                                    return;
                                }
                            }
                            else {
                                if ($scope.srcdiv != this && index[0] == ind[0]) {
                                    this.data('data', d[$(this).attr('data')])
                                    if (d[$(this).attr('data')].children) {
                                        var dn = d[$(this).attr('data')]
                                        $(this).find($scope.select == "false" ? "td:eq(0)" : "td:eq(1)").unbind("click").click(function () {
                                            expand.call(ev, dn);
                                        });
                                        return;
                                    }
                                }
                            }
                            // bubble._call($scope.interface + ".sort").success(function (v) {
                            //     if (!v.errorcode) {
                            //         console.log(123)
                            //        appendTree()
                            //     } else {
                            //         swal("移动失败");
                            //     }
                            // });
                        }


                    })
                    rs.push(tr);
                    tr.data("data", d[i]);
                    init ? o.append(tr) : o.after(tr);
                    d[i].ele = tr;
                    var count = 0;
                    if ($scope.select != "false") {
                        tr.append('<td><label class="i-checks m-b-none timeline"><input type="checkbox"' + ($(".tree-table-box thead input").prop("checked") ? ($scope.checkList.push(d[i]), "checked='checked'") : "") + '><i></i></label></td>');
                    }
                    for (var tmp in f) {
                        var icon = d[i].children ? '<i class="collapsebtn fa fa-plus-square-o cursor-p"></i>' : '<i class="collapsebtn fa fa-minus cursor-p"></i>';
                        var padding = init ? 15 : parseInt(o.find($scope.select == "false" ? "td:first" : "td:eq(1)").css("paddingLeft")) + 15;
                        tr.append("<td " + (count != 0 ? "class='field-" + tmp + "'" : "") + " style='padding-left:" + padding + "px'>" + (count == 0 ? icon : '') + "<span " + (count == 0 ? "class='field-" + tmp + "'" : "") + ">" + (d[i][tmp] !== undefined ? getHtml(f[tmp], d[i], tmp) : "") + "</span></td>");
                        count++;
                    }
                    if ($scope.itembtn && $scope.itembtn.length) {
                        tr.append('<td class="text-center"></td>');
                        var td = tr.find("td:last");
                        $scope.itembtn.forEach(function (v, n) {
                            (function (i) {
                                var btn = $('<button class="btn btn-xs btn-default m-r">' + (typeof v.name === 'function' ? v.name(d[i]) : v.name) + '</button>');
                                td.append(btn);
                                btn.unbind("click").click(function (e) {
                                    currentItem = d[i];
                                    v.onClick(getCopy(d[i]), function () {
                                        btn.html(typeof v.name === 'function' ? v.name(d[i]) : v.name);
                                    });
                                });
                            })(i);
                        });
                    }
                    initBtnEvent(tr, d[i]);
                }
                return rs;
            };

            var getCopy = function (v) {
                var rs = {};
                for (var tmp in v) {
                    if (tmp != "ele" && tmp != "cele" && tmp != "open" && tmp != "children") {
                        rs[tmp] = v[tmp];
                    }
                }
                return rs;
            }

            var initBtnEvent = function (tr, d) {
                tr.find($scope.select == "false" ? "td:not(:last)" : "td:not(:eq(1)):not(:last)").unbind("click").click(function () {
                    var input = tr.find("input");
                    if (!input.prop("checked")) {
                        $scope.checkList.indexOf(d) < 0 && $scope.checkList.push(d);
                        tr.find("input").prop("checked", true);
                    } else {
                        for (var n = 0; n < $scope.checkList.length; n++) {
                            if ($scope.checkList[n] === d) {
                                $scope.checkList.splice(n, 1);
                                tr.find("input").prop("checked", false);
                            }
                        }
                        $(".tree-table-box thead input").prop("checked", false);
                    }
                    bubble.updateScope($scope);
                });
                tr.find($scope.select == "false" ? "td:eq(0)" : "td:eq(1)").unbind("click").click(function () {
                    expand.call(tr, d);
                });
            }

            var removeTree = function (o, d) {
                var count = d.length;
                while (count > 0) {
                    for (var n = 0; n < $scope.checkList.length; n++) {
                        if ($scope.checkList[n] === o.next().data("data")) {
                            $scope.checkList.splice(n, 1);
                        }
                    }
                    o.next().remove();
                    count--;
                }
            };

            var clearIcon = function (o) {
                $(o).find(".collapsebtn").removeClass("fa-plus-square-o").removeClass("fa-minus-square-o").addClass("fa-minus");
            };

            var setIcon = function (o, v) {
                v ? $(o).find(".collapsebtn").removeClass("fa-plus-square-o").removeClass("fa-minus").addClass("fa-minus-square-o") : $(o).find(".collapsebtn").removeClass("fa-minus").removeClass("fa-minus-square-o").addClass("fa-plus-square-o");
            };

            var expand = function (d) {
                if (d.children) {
                    d.open = !d.open;
                    setIcon(this, d.open);
                    d.open ? d.cele = appendTree(this, d.children) : removeTree(this, d.children);
                }
            };

            $scope.expandAll = function (d) {
                d = d ? d : $scope.tree;
                for (var i = 0; i < d.length; i++) {
                    if (d[i].children && !d[i].open) {
                        d[i].open = true;
                        setIcon(d[i].ele, d[i].open);
                        d[i].cele = appendTree(d[i].ele, d[i].children);
                        $scope.expandAll(d[i].children);
                    }
                }
            };

            $scope.collapseAll = function (d) {
                d = d ? d : $scope.tree;
                for (var i = 0; i < d.length; i++) {
                    if (d[i].children && d[i].open) {
                        $scope.collapseAll(d[i].children);
                        d[i].open = false;
                        setIcon(d[i].ele, d[i].open);
                        removeTree(d[i].ele, d[i].children);
                    }
                }
            };

            var getHtml = function (v, item, key) {
                if (!v.data) {
                    return;
                }
                if (v.onRender) {
                    return v.onRender(v.dictionaries ? v.dictionaries[item[key]] : item[key], item);
                }
                if (v.data.indexOf('date') >= 0) {
                    return getDateHtml(item[key]);
                }

                if (v.data.indexOf('ajaxselect') >= 0) {
                    return ajaxReplacrList[key].state == "done" ? ajaxReplacrList[key].result[item[key]] : (replaceAjaxData(item, v, key), "加载中...");
                }

                if (v.data.indexOf('time') >= 0) {
                    return getTime(item[key]);
                }

                return v.dictionaries ? (v.dictionaries[item[key]] ? v.dictionaries[item[key]] : "") : (v.max && item[key].length > v.max ? item[key].substring(0, v.max) + '...' : item[key]);
            };

            var replaceAjaxData = function (v, item, key) {
                if (v.ajax) {
                    ajaxReplacrList[key] || (ajaxReplacrList[key] = { result: "" });
                    if (ajaxReplacrList[key].state == undefined) {
                        ajaxReplacrList[key].state = "process";
                        bubble._call(v.ajax + ".page", 1, 1000).success(function (rs) {
                            ajaxReplacrList[key].state = "done";
                            ajaxReplacrList[key].result = {};
                            for (var i = 0; i < rs.data.length; i++) {
                                ajaxReplacrList[key].result[rs.data[i]._id] = rs.data[i][v.contentKey];
                            }
                        });
                    }
                }
            };

            var getTime = function (v) {
                if (v > 1000 && v <= 1000 * 60) {
                    return (v / 1000).toFixed(0) + "秒";
                }

                if (v > 1000 * 60 && v <= 1000 * 60 * 60) {
                    return (v / (1000 * 60)).toFixed(0) + "分钟";
                }

                if (v > 1000 * 60 * 60 && v <= 1000 * 60 * 60 * 24) {
                    return (v / (1000 * 60 * 60)).toFixed(0) + "小时";
                }

                if (v > 1000 * 60 * 60 * 24) {
                    return (v / (1000 * 60 * 60 * 24)).toFixed(0) + "天";
                }

                return 0;
            };

            var getDateHtml = function (v) {
                v = v + "";
                return v.length === 13 ? new Date(parseInt(v)).Format("yyyy-MM-dd hh:mm") : v == 0 ? "" : new Date(v * 1000).Format("yyyy-MM-dd hh:mm");
            };
        }
    }
}]);