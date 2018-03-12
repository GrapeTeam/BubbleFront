/**
 * key: 显示的字段名
 * interface: 接口名
 * ngModel: 数据绑定
 * condition: 查询条件[可选]
 */
import angular from "angular";
import app from "../../main";
import $ from "jquery";

app.directive('asyncSelect', ['$http', 'bubble', '$compile', function ($http, bubble, $compile) {
    return {
        restrict: 'AE',
        scope: {
            key: "@",
            interface: "@",
            width: "@",
            ngModel: "=",
            condition: "=",
            btn: "=",
            textinput: "="
        },
        link: function (scope, element, attr) {
            var isexist = function (v, l) {
                for (var i = 0; i < l.length; i++) {
                    var t = l[i];
                    if ((attr.output ? v == t[attr.output] : v == t.id)) {
                        scope.ngModel1 = t.id;
                        return true;
                    }
                }
                return false;
            }
            scope.list = [];
            var call = scope.condition ? bubble._call(scope.interface + ".pageBy", 1, 100, scope.condition) : bubble._call(scope.interface + ".page", 1, 100);
            call.success(function (v) {
                if (!v.errorcode) {
                    scope.list = v.data.map(function (v) {
                        var r = {};
                        if (v[scope.key] === undefined) {
                            throw new Error("asyncSelect中的interface结果不存在[" + scope.key + "]字段");
                        }
                        r.id = v.id ? v.id : v._id;
                        r[scope.key] = v[scope.key];
                        return r
                    });
                    if (!scope.list.length) {
                        scope.list.push({ id: "0", text: "暂无数据" });
                        return;
                    }
                    !scope.btn && !scope.textinput && !isexist(scope.ngModel, scope.list) && (scope.ngModel1 = scope.textinput ? { text: "" } : scope.list[0].id);
                    scope.width && element.find("select").width(scope.width);
                    scope.ngModel = attr.output ? scope.ngModel1[attr.output] : scope.ngModel1;
                    render();
                }
            });

            scope.change = function (v) {
                scope.ngModel = v;
            }

            scope.click = function (v) {
                scope.ngModel = JSON.parse(JSON.stringify(v));
            }

            var render = function () {
                element.html("");
                if (scope.textinput) {
                    element.append($compile(`<div class="input-group w-full">
                                                <textarea rows="1" type="text" ng-model='ngModel.text' class="form-control" placeholder="请输入内容"></textarea>
                                                <div class="input-group-btn dropdown" dropdown>
                                                    <button type="button" class="btn btn-default" dropdown-toggle>快捷回复<span class="caret"></span></button>
                                                    <ul class="dropdown-menu pull-right">
                                                        <li ng-repeat="item in list" ng-click="click(item)"><a href>{{key ? item[key] : item.text}}</a></li>
                                                    </ul>
                                                </div>
                                            </div>`)(scope));
                } else if (scope.btn) {
                    element.append($compile(`<div class="btn-group dropdown dropup" dropdown="">
                                                <button class="btn btn-info">快捷回复</button>
                                                <button class="btn btn-info" dropdown-toggle="" aria-haspopup="true" aria-expanded="false"><span class="caret"></span></button>
                                                <ul class="dropdown-menu">
                                                    <li ng-repeat="item in list" ng-click="click(item)"><a href>{{key ? item[key] : item.text}}</a></li>
                                                </ul>
                                            </div>`)(scope));
                } else {
                    var tmphtml = "";
                    for (let i = 0; i < scope.list.length; i++) {
                        tmphtml += `<option value="${attr.output ? scope.list[i][attr.output] : (scope.list[i]._id ? scope.list[i]._id : scope.list[i].id)}">${scope.list[i][scope.key]}</option>`
                    }
                    element.append(`<select class='form-control'>${tmphtml}</select>`);
                    element.find("select").val(scope.ngModel).change(function () {
                        scope.change(this.value);
                    });
                }
            }
            render();
        }
    };
}]);