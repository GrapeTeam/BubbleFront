import angular from "angular";
import app from "../../main";
import $ from "jquery";
var swal = window.swal;

/**
 * 属性:
 *  multiple    是否可多选
 *  editable    是否可编辑
 *  title       表格标题
 *  onCreate    新建事件 返回值[true | false]
 *  interface   接口类
 *  onEdit      编辑后回调
 */

var boxtpl = `<div class="panel panel-default pos-rlt">
                <div style="position:absolute;top:0px;left:0px;width:100%;height:100%;background:rgba(0,0,0,.14);z-index: 10;" ng-show="loadingshower">
                    <img src="./img/loading.gif" style="position:absolute;top:50%;left:50%;margin-left: -25px;margin-top: -25px;width: 50px;height: 50px;"/>
                </div>
                <div class="panel-heading">
                    @title
                    <span tooltip="{{helper}}" class="text-muted inline wrapper-xs m-r-sm" ng-if="helper"><i class="fa fa-question"></i></span>
                    <a class="pull-right btn btn-sm m-t-n-xs" ng-click="visibleChange()" ng-if="false && list.length"><i class="glyphicon glyphicon-cog"></i></a>
                    <a class="pull-right btn btn-sm m-t-n-xs" ng-click="create()" ng-if="createModal || control.onCreate"><i class="fa fa-plus"></i></a>
                    <a class="pull-right btn btn-sm m-t-n-xs" tooltip="导出" ng-click="export($event)" ng-if="visible.export"><i class="glyphicon glyphicon-export"></i></a>
                    <a class="pull-right btn btn-sm m-t-n-xs" tooltip="导入(目前仅支持Excel文件)" id="tableuploadpicker" ng-click="import($event)" ng-if="visible.import"><i style="color:#363f44;" class="glyphicon glyphicon-import"></i></a>
                </div>
                <div class="row wrapper tableSearchBox" ng-show="searchEnable">
                    <div class="col-sm-4">
                        <select name="account" class="form-control input-sm" ng-model="searchColumn" ng-change="searchChange()">
                            @search
                        </select>
                    </div>
                    <div class="col-sm-8">
                        <div class="input-group inputbox">
                            <input type="text" class="input-sm form-control searchInput" placeholder="搜索">
                            <span class="input-group-btn">
                                <button class="btn btn-sm btn-default" ng-click="search()" type="button">搜索</button>
                            </span>
                        </div>
                    </div>
                </div>
                <div class="table-responsive" style="width: 100%;">@table</div>
                <footer class="panel-footer" ng-show="!hiddenFooter">
                    <div class="row">
                        <div class="col-sm-2 text-right text-center-xs">
                            <button class="btn m-b-xs btn-sm btn-primary btn-addon table-delete-btn pull-left" disabled="disabled" ng-click="openDelete()"><i class="fa fa-trash-o"></i>删除</button>
                        </div>
                        <div class="col-sm-10 text-right text-center-xs">
                            <span ng-show="totalPages > 1" style="float: right;height: 30px;line-height: 30px;margin-left: 5px;">跳至<input type="text" ng-keydown="jump($event)" style="height: 30px; line-height: 30px; width: 40px; margin: 0 5px; text-align: center; border: 1px #ddd solid; border-radius: 5px; font-size: 12px;"/>页</span>
                            <span style="float: right;height: 30px;line-height: 30px;margin-left: 5px;">共<span class="text-muted">{{totalPages}}</span>页</span>
                            <pagination ng-show="!hiddenPagination" max-size="5" last-text="末页" next-text="下一页" first-text="首页" previous-text="上一页" items-per-page="pageSize" total-items="totalItems" ng-change="getPage()" ng-model="currentPage" class="pull-right m-t-none m-b-none pagination-sm m-t-none m-b" boundary-links="true" rotate="true" num-pages="numPages"></pagination>
                            <select class="pull-right m-r-sm b" style="width:50px;height: 30px;border-radius: 5px;" ng-model="pageSize" ng-change="getPage()">
                                <option selected value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                            <span class="pull-right m-r-xs m-t-xs">每页显示:</span>
                        </div>
                    </div>
                </footer>
            </div>`;

var nulltpl = `<div class="wrapper text-center text-muted">暂无内容</div>`;

var getTable = function () {
    return `<table class="table table-striped b-t b-light">
                <thead>
                    <tr>
                        <th style="width:20px;" ng-show="multiple">
                            <label class="i-checks m-b-none"><input type="checkbox" ng-click="allCheck($event)" ng-model="check"><i></i></label>
                        </th>
                        <th ng-repeat="item in visible" ng-show="item.visible" style="width:{{item.width ? item.width : 'auto'}}">{{item.mark}}</th>
                        <th style="width:30px;" ng-show="editable && needEdit">编辑</th>
                        <th ng-repeat="item in control.title" ng-if="control" style="width:{{item.width ? item.width + 'px' : 'auto'}};text-align:center;">{{item.name}}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr ng-repeat="item in list track by $index">
                        <td ng-show="multiple"><label class="i-checks m-b-none"><input type="checkbox" ng-click="itemCheck($event)" ng-model="item.checked"><i></i></label></td>
                        <td ng-repeat="(key, v) in visible" ng-show="v.visible" ng-class="editable ? 'cursor-p' : ''" ng-click="edit(item[key], key, item, $parent.$index, v)" 
                        ng-bind-html="getBindHtml(v, item, key)" ng-init="replaceAjaxData(v, item, key)">
                        </td>
                        <td ng-show="editable && needEdit" ng-click="tableEdit(item)"><a class="btn btn-sm m-t-n-xs"><i class="fa fa-edit"></i></a></td>
                        <td ng-repeat="v in control.html | render:item:control.onRender" class="cursor-p text-center" ng-click="controlClick(control.title[$index].key, item, $parent.$index, $event)" ng-bind-html="v"></td>
                    </tr>
                </tbody>
            </table>`;
}

app.filter('render', function () {
    return function (v, t, fn) {
        return fn ? fn(v, t) : v;
    }
});

app.directive('selectTable', ['$http', 'bubble', '$compile', '$timeout', function ($http, bubble, $compile, $timeout) {
    var ele = "";
    return {
        restrict: 'AE',
        scope: {
            interface: '@',
            title: "@",
            helper: "@",
            createModal: "@",
            createController: "@",
            selectPar: '=',
            multiple: '=',
            editable: '=',
            control: '='
        },
        link: function ($scope, ele) {
            var TableUpload = function () {
                var uploader = "";
                var box = $(".dialog-web-uploader");
                var _this = this;

                this.init = function (s, p) {
                    uploader = new window.WebUploader.Uploader({
                        auto: true,
                        swf: './js/modules/webuploader/Uploader.swf',
                        server: bubble.getUploadServer(),
                        pick: '#tableuploadpicker',
                        accept: {
                            title: 'Excel',
                            extensions: 'xls,xlsx',
                            mimeTypes: '.xls,.xlsx'
                        }
                    });
                    uploader.on("fileQueued", this.fileQueued);
                    uploader.on("uploadProgress", p || this.uploadProgress);
                    uploader.on("uploadSuccess", s || this.uploadSuccess);
                    return this;
                }

                this.fileQueued = function (file) {

                }

                this.uploadProgress = function (file, percentage) {

                }

                this.uploadSuccess = function (file, v) {
                    // !v.errorcode ? $scope.imgList[file.ListIndex] = bubble.getInterface("upload").visible + v.filepath.replace(/\\/g, "/") : swal("上传失败");
                    // $scope.newItem.content = $scope.imgList.join(",");
                    // bubble.updateScope($scope);
                    bubble._call(getFunctionName("import"), bubble.replaceSymbol(bubble.getInterface("upload").visible + v.filepath.replace(/\\/g, "/"))).success(function (v) {
                        v
                    })
                }

                this.uploadError = function (file, msg) {
                    swal("上传失败");
                }
            }
            $scope.pageSize = "10";
            var uploader = null;
            var field = $scope.field = bubble.getFields($scope.interface);
            $scope.searchColumn = "0";      //搜索字段
            $scope.searchType = "1";        //搜索类型
            $scope.searchDate = ["", new Date().Format("yyyy-MM-dd hh:mm"), new Date().Format("yyyy-MM-dd hh:mm")];         //搜索时间[开始时间, 结束时间, 最大时间]
            $scope.searchEnable = !!field.search;
            $scope.check = false;
            $scope.currentPage = 1;
            $scope.visible = field || [];
            $scope.list = $scope.list || [];
            var ajaxReplacrList = {};       //异步数据替换队列
            (function (v) {
                var rs = false;
                for (var tmp in field) {
                    if (field[tmp].edit) {
                        rs = true;
                        break;
                    }
                }

                $scope.needEdit = rs;
            })(field)

            var toggleDeleteBtn = function (v) {
                v ? ele.find(".table-delete-btn:first").addClass("opa1").removeAttr("disabled") : ele.find(".table-delete-btn:first").removeClass("opa1").attr("disabled", "");
            }

            var getFunctionName = function (v) {
                return $scope.interface + "." + v;
            }

            var getSearch = function (v) {
                if (!field.search) {
                    return v;
                }
                var html = field.search.column.split("|").map(function (n, i) {
                    if (!field[n]) {
                        throw new Error("不存在的描述符字段,请在field['" + $scope.interface + "']的search字段中确诊")
                    }
                    i == 0 && ($scope.searchColumn = n);
                    return `<option value="${n}">${field[n].mark}</option>`;
                });
                return v.replace("@search", html.join(""));
            }

            $scope.replaceAjaxData = function (v, item, key) {
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
            }

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
            }

            $scope.getBindHtml = function (v, item, key) {
                if (!v.data) {
                    return;
                }
                if (v.onRender) {
                    return v.onRender(v.dictionaries ? v.dictionaries[item[key]] : item[key], item);
                }
                if (v.data.indexOf('date') >= 0) {
                    return $scope.getDateHtml(item[key]);
                }

                if (v.data.indexOf('ajaxselect') >= 0) {
                    return ajaxReplacrList[key].state == "done" ? ajaxReplacrList[key].result[item[key]] : "加载中...";
                }

                if (v.data.indexOf('time') >= 0) {
                    return getTime(item[key]);
                }

                return v.dictionaries ? v.dictionaries[item[key]] : (v.max && item[key].length > v.max ? item[key].substring(0, v.max) + '...' : item[key]);
            }

            $scope.jump = function (e) {
                if (e.keyCode === 13) {
                    if (isNaN(e.currentTarget.value) || e.currentTarget.value < 1) {
                        e.currentTarget.value = "1";
                    } else if (e.currentTarget.value > $scope.totalPages) {
                        e.currentTarget.value = $scope.totalPages;
                    }
                    $scope.currentPage = e.currentTarget.value;
                    $scope.getPage();
                    e.currentTarget.value = "";
                    return;
                }
            }

            $scope.search = function () {
                $scope.currentPage = 1;
                var value = "";
                var start = "";
                var end = "";
                if ($scope.searchType != "3") {
                    value = $(".tableSearchBox .searchInput").val();
                    if (value == "0" || value == "" || $scope.searchColumn == "0") {
                        $scope.searchPar = undefined;
                        $scope.getPage();
                        return;
                    }
                    $scope.searchPar = [{ field: $scope.searchColumn, logic: "like", value: $scope.field[$scope.searchColumn].base64 ? bubble.replaceBase64(typeof value === 'string' ? value : JSON.stringify(value)) : value }];
                    // $scope.searchPar = '{"' + $scope.searchColumn + '":"' + value + '"}';
                } else {
                    start = $(".tableSearchBox .searchInput:eq(0)").val();
                    end = $(".tableSearchBox .searchInput:eq(1)").val();
                    if (start == "0" || start == "" || end == "0" || end == "" || $scope.searchColumn == "0") {
                        $scope.searchPar = undefined;
                        $scope.getPage();
                        return;
                    }
                    $scope.searchPar = [{ field: $scope.searchColumn, logic: ">=", value: Date.parse(new Date(start)) }, { field: $scope.searchColumn, logic: "<=", value: Date.parse(new Date(end)) }];
                }

                if ($scope.selectPar && $scope.selectPar != "null") {
                    $scope.searchPar = $scope.searchPar.concat($scope.selectPar);
                }
                $scope.getPage(undefined, true);
            }

            $scope.searchChange = function (v) {
                var box = $(".tableSearchBox");
                $scope.searchValue = "";
                if (!$scope.searchColumn)
                    return;
                var f = field[$scope.searchColumn];
                if ($scope.searchColumn == "0") {
                    return;
                }
                if (!field[$scope.searchColumn]) {
                    swal("搜索字段错误,请于fieldConfig中确认");
                    throw new Error("搜索字段错误,请于fieldConfig中确认");
                }

                if (f.data.indexOf("s:") >= 0 || f.data.indexOf("int:") >= 0) {
                    $scope.searchType = "1";
                    box.find(".searchInput").remove();
                    box.find(".inputbox").prepend('<input type="text" class="input-sm form-control searchInput" placeholder="搜索">');
                    return;
                }
                if (f.data.indexOf("date:") >= 0) {
                    $scope.searchType = "3";
                    box.find(".searchInput").remove();
                    box.find(".inputbox").prepend($compile(`<datetimepicker style="width:49%;" max-date="searchDate[1]" value="searchDate[0]" class="input-sm form-control searchInput"></datetimepicker>
                                                            <datetimepicker value="searchDate[1]" min-date="searchDate[0]" style="width:49%;margin-left:2%;" class="input-sm form-control searchInput"></datetimepicker>`)($scope));
                    return;
                }
                if (f.data.indexOf("select:") >= 0) {
                    $scope.searchType = "2";
                    var html = '<select name="account" class="form-control input-sm searchInput" ng-if="searchType == \'2\'">@option</select>';
                    var option = "<option value='0' selected>请选择搜索内容</option>";
                    for (var tmp in f.dictionaries) {
                        option += "<option value='" + tmp + "'>" + f.dictionaries[tmp] + "</option>";
                    }
                    box.find(".searchInput").remove();
                    box.find(".inputbox").prepend(html.replace("@option", option));
                    return;
                }
            }

            $scope.control && ($scope.control.next = function (fn) {
                if ($scope.currentPage < $scope.totalItems / $scope.pageSize) {
                    $scope.currentPage++;
                    $scope.getPage(fn);
                }
            })

            $scope.control && ($scope.control.prev = function (fn) {
                if ($scope.currentPage > 1) {
                    $scope.currentPage--;
                    $scope.getPage(fn);
                }
            });

            $scope.control && ($scope.control.reload = function (fn) {
                bubble.clearCache($scope.interface);
                $scope.getPage(fn);
            });

            $scope.control && ($scope.control.loading = function (v) {
                $scope.loadingshower = !!v;
            });

            $scope.getDateHtml = function (v) {
                v = v + "";
                return v.length === 13 ? new Date(parseInt(v)).Format("yyyy-MM-dd hh:mm") : v == 0 ? "" : new Date(v * 1000).Format("yyyy-MM-dd hh:mm");
            }

            $scope.controlClick = function (k, v, i, e) {
                bubble.isFunction($scope.control.onClick) && $scope.control.onClick(k, v, i, e, $scope.currentPage, $scope.pageSize, $scope.totalPages);
            }

            $scope.edit = function (v, k, o, i, f) {
                if ($scope.control && $scope.control.onColumnClick && $scope.control.onColumnClick(k, o, i, $scope.currentPage, $scope.pageSize, $scope.totalPages) === false) {
                    return;
                };
                if (!f.edit) {
                    return;
                }
                if (!$scope.editable) {
                    return;
                }
                bubble.openModal("edit", "", {
                    value: v !== "" ? v : "",
                    id: o._id ? o._id : o.id,
                    functionName: getFunctionName("update | GrapeFW"),
                    key: k,
                    field: $scope.visible[k],
                    hook: $scope.control && $scope.control.editFn
                }, function (rs) {
                    o[k] = rs;
                    f.ajax && $scope.replaceAjaxData(f, o, k);
                    $scope.control && bubble.isFunction($scope.control.onEdit) && $scope.control.onEdit(o);
                });
            }

            $scope.itemCheck = function (e) {
                var o = $scope.list;
                var count = 0;
                o.map(function (v) {
                    v.checked && count++;
                });
                $scope.check = count == o.length;
                toggleDeleteBtn(!!count);
            }

            $scope.allCheck = function (e) {
                var o = $scope.list;
                toggleDeleteBtn($scope.check);
                o.map(function (v) {
                    v.checked = e.target.checked;
                })
            }

            $scope.openDelete = function () {
                var list = $scope.list;
                var ids = [];
                var names = [];
                for (var i = 0; i < list.length; i++) {
                    list[i].checked && (ids.push(list[i]._id ? list[i]._id : list[i].id), names.push(list[i].name ? list[i].name : list[i]._id ? list[i]._id : list[i].id));
                }
                var cb = function (v) {
                    if (v) {
                        var count = 0;
                        for (var i = 0; i < list.length; i++) {
                            list[i].checked && count++;
                        }
                        if (count == list.length) {
                            $scope.totalItems - $scope.pageSize;
                            $scope.currentPage > 1 && $scope.currentPage--;
                        }
                        $scope.check = false;
                        $scope.getPage();
                        ele.find(".table-delete-btn:first").removeClass("opa1").attr("disabled", "")
                    } else {
                        swal("删除失败");
                    }
                }
                bubble.openModal("deleteitem", "", { names: names, ids: ids, functionName: getFunctionName("delete"), hook: $scope.control && $scope.control.deleteFn }, cb)
            };

            $scope.tableEdit = function (v) {
                if (!$scope.editable) {
                    return;
                }
                bubble.openModal("tableEdit", "", {
                    value: v,
                    id: v._id ? v._id : v.id,
                    visible: $scope.visible,
                    hook: $scope.control && $scope.control.editFn,
                    functionName: getFunctionName("update"),
                }, function (rs) {
                    for (var tmp in rs) {
                        v[tmp] = rs[tmp];
                    }
                    $scope.control && bubble.isFunction($scope.control.onEdit) && $scope.control.onEdit(v);
                })
            }

            $scope.visibleChange = function () {
                bubble.openModal("visibleitem", "", {
                    data: $scope.list,
                    visibleItem: $scope.visible,
                })
            }

            $scope.getPage = function (fn, search) {
                $scope.hiddenFooter = false;
                $scope.loadingshower = true;
                var success = function (v) {
                    if (v.errorcode) {
                        swal(v.message || v.data);
                        return;
                    }
                    var obj = ele.find(".table-responsive");
                    v.data = typeof v.data === 'string' ? JSON.parse(v.data) : v.data;
                    var o = v;
                    var d = $scope.list = o.data;
                    $scope.control && $scope.control.onPage && $scope.control.onPage(d);

                    var html = "";
                    var idx = 0;

                    var html = obj.length ? (!d.length ? nulltpl : getTable()) : boxtpl.replace("@table", !d.length ? nulltpl : getTable()).replace("@title", $scope.title || "");
                    html = getSearch(html);

                    $scope.loadingshower = false;
                    if (!d.length && $scope.currentPage > 1) {
                        $scope.getPage($scope.currentPage--);
                        return;
                    }
                    if (!d.length) {
                        $scope.hiddenFooter = true;
                        obj.length ? obj.html($compile(html)($scope)) : ele.html($compile(html)($scope));
                        return;
                    }

                    if (field.import) {
                        $timeout(function () {
                            uploader = new TableUpload().init();
                        });
                    }
                    $scope.totalItems = v.totalSize;
                    $scope.totalPages = Math.ceil($scope.totalItems / $scope.pageSize);
                    $scope.hiddenPagination = v.totalPages == 1 && false;

                    if (!field) {
                        throw new Error("不存在[ " + $scope.interface + " ]的描述符,请确认该描述是否registered");
                    }

                    obj.length ? obj.html($compile(html)($scope)) : ele.html($compile(html)($scope));
                    fn && fn($scope.list);
                }
                if (!$scope.control || !$scope.control.pageFn) {
                    ($scope.selectPar === "" || $scope.selectPar === undefined) && $scope.searchPar === undefined ? bubble._call(getFunctionName("page"), $scope.currentPage, $scope.pageSize === null ? "10" : $scope.pageSize).success(success) : bubble._call(getFunctionName(search && bubble.getInterface($scope.interface).search ? "search" : "pageBy"), $scope.currentPage, $scope.pageSize === null ? "10" : $scope.pageSize, $scope.searchPar || $scope.selectPar).success(success);
                } else {
                    $scope.control.pageFn($scope.currentPage, $scope.pageSize === null ? "10" : $scope.pageSize, success);
                }
            }

            $scope.getPage();

            $scope.selectPar && $scope.$watch("selectPar", function (v, o) {
                JSON.stringify(v) != JSON.stringify(o) && $scope.getPage();
            }, true);

            $scope.create = function () {
                if ($scope.control && $scope.control.onCreate) {
                    $scope.control.onCreate();
                    return;
                }
                bubble.customModal($scope.createModal, $scope.createController ? $scope.createController : "selectTableCreate", "lg", { scope: $scope, hook: $scope.control && $scope.control.addFn }, function (v) {
                    console.log(v)
                    if (typeof v === 'string') {
                        $scope.list.length < $scope.pageSize ? $scope.getPage() : ($scope.totalItems + $scope.pageSize, $scope.currentPage++ , $scope.getPage());
                        return;
                    }
                    $scope.list.length < $scope.pageSize ? $scope.list.push(v) : ($scope.totalItems + $scope.pageSize, $scope.currentPage++ , $scope.getPage());
                    console.log($scope.list)
                    if ($scope.list.length == 1) {
                        $scope.hiddenFooter = false;
                        ele.html($compile(boxtpl.replace("@table", getTable()).replace("@title", $scope.title || ""))($scope));
                    }
                });
            }

            $scope.export = function (e) {
                var success = function (v) {
                    $(e.currentTarget).html('<i class="glyphicon glyphicon-export"></i>');
                    !v.errorcode ? window.open(v) : swal("导出失败");
                }
                if (!getFunctionName("export")) {
                    throw new Error("不存在" + $scope.interface + ".expoer接口,请在interface配置中确认");
                }
                $(e.currentTarget).html('<i class="fa fa-spin fa-spinner"></i>');
                $scope.selectPar ? bubble._call(getFunctionName("export"), $scope.selectPar, "data.xls").success(success) : bubble._call(getFunctionName("export"), {}, "data.xls").success(success);
            }

            $scope.import = function () {

            }
        }
    };
}]);

app.controller("selectTableCreate", ["$scope", "$modalInstance", "items", "bubble", function ($scope, $modalInstance, items, bubble) {
    $scope.value = { };
    if (items.scope.selectPar instanceof Array) {
        for (var i = 0; i < items.scope.selectPar.length; i++) {
            if (items.scope.selectPar[i].logic == "==") {
                $scope.value[items.scope.selectPar[i].field] = items.scope.selectPar[i].value;
            }
        }
    } else {
        for (var tmp in items.scope.selectPar) {
            $scope.value[tmp] = items.scope.selectPar[tmp];
        }
    }

    var cb = function (v) {
        if (v.errorcode) {
            swal(v.message);
            $modalInstance.dismiss('cancel');
        } else {
            $modalInstance.close(v.message ? v.message : v);
        }
    }

    $scope.ok = function (e) {
        $(e.currentTarget).addClass("data-loading");
        if (items.hook) {
            items.hook($scope.value, cb);
        } else {
            var type = $scope.value.type
            delete $scope.value.type
            console.log($scope.value)
            bubble._call(items.scope.interface + ".add", bubble.replaceBase64(JSON.stringify($scope.value)),type).success(function(v){
                if (!v.errorcode) {
                    swal("添加成功");
                    $modalInstance.dismiss('cancel');
                } else {
                    swal("添加失败");
                    $modalInstance.dismiss('cancel');
                }
            });
        }
    }

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
}]);