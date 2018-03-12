import angular from "angular";
import app from "../../main";
import $ from "jquery";
var swal = window.swal;

app.directive('jsonEdit', ['$http', 'bubble', '$compile', function ($http, bubble, $compile) {
    return {
        restrict: 'AE',
        scope: {
            json: '=',
            field: '=',
            Syntax: '='
        },
        controller: "jsonEditController",
        compile: function () {
            return function ($scope, el) {
                el.append($compile(
                    `<div class="form-group config-json-content config-json-content-0" ng-repeat="(key, value) in json track by $index"
                         ng-if="field[key].edit && (field[key] ? field[key].mark != \'hide\' : true)" ng-init="getJsonHtml(json, key, field[key], $index, 0)">
                        <label class="w-full">{{field[key] && field[key].mark ? field[key].mark : key}}</label>
                    </div>`
                )($scope));
            };
        }
    };
}]);

/**
 * Json编辑弹窗
 */
app.controller('jsonEditController', ["$scope", "bubble", "$compile", function ($scope, bubble, $compile) {
    var getLevel = function (v, i, o) {
        var rs = o ? o : {};
        for (var tmp in v) {
            typeof v[tmp] === 'object' && v[tmp] != null && !(v[tmp] instanceof Array) ? (rs[tmp] = i + 1, getLevel(v[tmp], i + 1, rs)) : rs[tmp] = i;
        }
        return rs;
    };

    //所有时间类型数据
    $scope.dateList = {};
    $scope.tempTime = {};               //作为实际时间戳数值和逻辑时间数值转换的中间层,使用字段名区分
    $scope.currentTimeType = {};        //当前时间类型数据所用类型,使用字段名区分
    $scope.timeType = ["秒", "分钟", "小时", "天"];       //时间类型数据所所有类型
    $scope.dateOptions = {
        formatYear: 'yyyy',
        startingDay: 1,
        class: 'datepicker'
    };

    $scope.level = getLevel($scope.json, 0);
    $scope.colors = ["text-success", "text-info", "text-warning", "text-primary"];
    $scope.b_colors = ["b-success", "b-info", "b-warning", "b-primary"];

    var review = function () {
        for (var tmp in $scope.field) {
            try {
                var e = $scope.field[tmp];
                if (e.data.indexOf("json") >= 0) {
                    e.old = typeof $scope.json[tmp];
                    e.old == "string" && ($scope.json[tmp] = JSON.parse($scope.json[tmp]));
                }
            } catch (e) {
                continue;
            }
        }
    };

    review();

    var getObjectHtml = function (d, k) {
        return `<div class="wrapper b b-light"><json-edit json="$parent.json.${k}" field="$parent.field.${k}.field"></json-edit></div>`;
    };

    var getBoolHtml = function () {
        return ['<div class="w-full">',
            '    <select class="form-control w-full" ng-model="value" ng-options="item for item in [true, false]"></select>',
            '</div>'].join("");
    };

    var getArrayHtml = function () {

        return ['<div class="row">',
            '    <div class="col-xs-12 padder">',
            '        <div class="b-a bg-light lter wrapper">',
            // '            <div class="input-group" ng-class="' + i + ' != 0 ? \'m-t\' : \'\'" ng-repeat="item in value track by $index">',
            '            <div class="input-group" ng-class="1 != 0 ? \'m-t\' : \'\'" ng-repeat="item in value track by $index">',
            '                <span class="input-group-addon"><i class="fa fa-fw fa-circle" ng-class="colors[$index % 3]"></i></span>',
            '                <input type="text" class="form-control" placeholder="" ng-model="item">',
            '                <span ng-click="deleteArray(value, $event)" class="input-group-addon cursor-p">',
            '                    <a><i class="fa fa-fw fa-minus text-info-lter"></i></a>',
            '                </span>',
            '            </div>',
            '            <div class="input-group m-t">',
            '                <span tooltip="输入内容后点击添加" ng-click="insertArray(value, $event)" class="input-group-addon cursor-p">',
            '                    <a><i class="fa fa-fw fa-plus text-info-lter"></i></a>',
            '                </span>',
            '                <input type="text" class="form-control" placeholder="">',
            '            </div>',
            '        </div>',
            '    </div>',
            '</div>'].join("");
    };

    var getSelectHtml = function (d, k) {
        return `<div class="w-full">
                    <select class="form-control w-full" ng-model="json['${k}']" ng-options="getOptionValue(item, '${k}') as item for item in field['${k}'].data.split(':')[1].split('|')">
                    </select>
                </div>`;
    };

    var getDateHtml = function (d, k) {
        return `<datetimepicker value="json['${k}']"></datetimepicker>`;
    };

    var getAjaxHtml = function (d, k, f) {
        return `<async-select key="${f.contentKey}" interface="${f.ajax}" ng-model="json['${k}']"></async-select>`;
    };

    var getTimeInfo = function (v, t) {
        if (isNaN(v)) {
            return 0;
        }

        if (v > 1000 && v <= 1000 * 60) {
            return t ? parseInt((v / 1000).toFixed(0)) : 0;
        }

        if (v > 1000 * 60 && v <= 1000 * 60 * 60) {
            return t ? parseInt((v / (1000 * 60)).toFixed(0)) : 1;
        }

        if (v > 1000 * 60 * 60 && v <= 1000 * 60 * 60 * 24) {
            return t ? parseInt((v / (1000 * 60 * 60)).toFixed(0)) : 2;
        }

        if (v > 1000 * 60 * 60 * 24) {
            return t ? parseInt((v / (1000 * 60 * 60 * 24)).toFixed(0)) : 3;
        }

        return 0;
    };

    var logic2stamp = function (v, i) {
        var t = [1000, 1000 * 60, 1000 * 60 * 60, 1000 * 60 * 60 * 24];
        return v * t[i];
    }

    var getTimeHtml = function (d, k) {
        $scope.currentTimeType[k] = getTimeInfo(d[k]);
        $scope.tempTime[k] = getTimeInfo(d[k], true);
        return `<div class="form-group">
                    <div class="input-group w-full">
                        <input type="text" ng-model="tempTime['${k}']" ng-change="timeChange('${k}')" class="form-control">
                        <div class="input-group-btn dropdown" dropdown>
                            <button type="button" class="btn btn-default" dropdown-toggle>{{timeType[currentTimeType['${k}']]}}<span class="caret"></span></button>
                            <ul class="dropdown-menu pull-right">
                                <li ng-repeat="item in timeType" ng-click="timeTypeChange($index, '${k}')"><a href>{{item}}</a></li>
                            </ul>
                        </div>
                    </div>
                </div>`;
    };

    var isHidden = function (v, value) {
        if (!v) {
            return typeof value === 'object' && value != null ? (value instanceof Array ? "array-s" : "json") : "text";
        }
        var type = v.split(":")[0];
        if (type === "s" || type === "int" || type === "float") {
            return "text";
        }

        return type;
    };

    $scope.timeChange = function (k) {
        $scope.json[k] = logic2stamp($scope.tempTime[k], $scope.currentTimeType[k]);
    };

    $scope.timeTypeChange = function (i, k) {
        $scope.currentTimeType[k] = i;
        $scope.json[k] = logic2stamp($scope.tempTime[k], i);
    };

    $scope.getOptionValue = function (v, k) {
        var rs = "";
        var tmp = "";
        if ($scope.field[k].dictionaries) {
            for (tmp in $scope.field[k].dictionaries) {
                if ($scope.field[k].dictionaries[tmp] == v) {
                    rs = tmp;
                    break;
                }
            }
        } else {
            rs = v;
        }
        if (typeof $scope.json[k] !== typeof tmp) {
            switch (typeof $scope.json[k]) {
                case 'number':
                    rs = parseInt(rs);
                    break;
                case 'string':
                    rs = rs + "";
                    break;
            }
        }
        return rs;
    };

    $scope.getJsonHtml = function (d, k, f, i, l) {
        var rs = "";

        switch (isHidden(f ? f.data : f, d[k])) {
            case "text":
                rs = '<input type="value" ng-model="' + (l ? "$parent.value[key]" : "json[key]") + '" class="form-control" ng-change="inputChange(key, ' + (l ? "$parent.value[key]" : "json[key]") + ')">';
                break;
            case "disabled":
                rs = '<input type="value" ng-model="' + (l ? "$parent.value[key]" : "json[key]") + '" class="form-control" disabled="disabled">';
                break;
            case "array-s":
                rs = getArrayHtml(d, k, f, i);
                break;
            case "select":
                rs = getSelectHtml(d, k, f, i);
                break;
            case "bool":
                rs = getBoolHtml(d, k, f, i);
                break;
            case "json":
                rs = getObjectHtml(d, k, f, i);
                break;
            case "time":
                rs = getTimeHtml(d, k, f, i);
                break;
            case "date":
                $scope.dateList[i] = { open: false };
                rs = getDateHtml(d, k, f, i);
                break;
            case "ajaxselect":
                rs = getAjaxHtml(d, k, f, i);
                break;
        }

        if (rs) {
            rs += `<div class="line line-dashed b-b line-lg"></div>`
            var o = $(".config-json-content-" + l + ":last");
            o.append($compile(rs)(angular.element(o[0]).scope()));
        }
    }
    //错误检查
    $scope.inputChange = function (k, v) {
        var reg = "";
        // if($scope.field[k].type){
        //     switch (typeof $scope.field[k].type) {
        //         case "string":
        //             bubble.getValidateType($scope.field[k].type).test(v);
        //             break;
        //     }
        // }
    }

    $scope.openDate = function (i, e) {
        $scope.dateList[i].open = true;
        e.preventDefault();
        e.stopPropagation();
    }

    $scope.dateChange = function (k) {
        $scope.json[k] = Date.parse($scope.json[k]).toString();
    }

    $scope.insertArray = function (v, e) {
        var f = false;
        $scope
        var target = $(e.currentTarget).siblings("input");
        var value = target.val();
        if (value !== "") {
            v.map(function (x) {
                if (x === value) {
                    f = true;
                }
            });
            if (f) {
                swal("该数据已存在");
            } else {
                v.push(value);
                target.val("");
            }
        }
    }

    $scope.deleteArray = function (v, e) {
        var target = $(e.currentTarget).siblings("input");
        var value = target.val();
        for (var i = 0; i < v.length; i++) {
            value === v[i] && (v.splice(i, 1), i--);
        }
    }

    $scope.insertObject = function (v, e) {
        var target = $(e.currentTarget).siblings("input");
        var value = target.val();
        // for (var i = 0; i < v.length; i++) {
        //     value === v[i] && (v.splice(i, 1), i--);
        // }
    }
}]);