bubbleFrame.register('configController', function ($scope, bubble, $timeout, $compile) {
    var intsertText = function (v) {
        v = JSON.parse(JSON.stringify(v));
        for (var tmp in v) {
            for (var i = 0; i < v[tmp].rule.length; i++) {
                delete v[tmp].rule[i].$$hashKey;
                v[tmp].rule[i].fieldType = parseInt(v[tmp].rule[i].fieldType);
                v[tmp].rule[i].checkType = parseInt(v[tmp].rule[i].checkType);
            }
        }
        $scope.text = v ? JSON.stringify(v) : {};
    }

    var autoForm = function () {
        $scope.serviceConfig = [];
        $scope.field = {
            fieldName: {
                data: "s:",
                mark: "字段名",
                edit: true,
                visible: false
            },
            fieldType: {
                data: "s:",
                mark: "字段类型",
                edit: true,
                visible: false
            },
            initValue: {
                data: "s:",
                mark: "初始值",
                edit: true,
                visible: false
            },
            failedValue: {
                data: "s:",
                mark: "值",
                edit: true,
                visible: false
            },
            checkType: {
                data: "s:",
                mark: "验证类型",
                edit: true,
                visible: false
            },
        }
        $scope.value = {};

        var watchFn = function (n, o) {
            if (Object.getOwnPropertyNames(n).length) {
                intsertText($scope.currentService.tableConfig);
            }
        };

        $scope.currentService && intsertText($scope.currentService.tableConfig);
        $scope.$watch("value", watchFn, true);
    };

    $scope.serviceTableClick = function (v) {
        $scope.currentRule = $scope.currentService.tableConfig[v].rule;
        $scope.getHtml();
    }

    autoForm();

    bubble._call("service.page|GrapeFW", 1, 1000).success(function (v) {
        console.log(v)
        var count = 0;
        $scope.service = v.data;
        $scope.currentService = v.data[0];
        v.data[0].select = true;
        for (var tmp in $scope.currentService.tableConfig) {
            $scope.serviceConfig.push(tmp);
            if (++count == 1) {
                $scope.currentConfig = tmp;
                $scope.currentRule = $scope.currentService.tableConfig[$scope.currentConfig].rule;
            }
        }
        $scope.serviceClick(v.data[0]);
    });

    $scope.serviceClick = function () {
        if (!$scope.currentService) {
            return;
        }
        var v = $scope.currentService;
        var count = 0;
        for (var i = 0; i < $scope.service.length; i++) {
            $scope.service[i].select = false;
        }
        v.select = true;
        $scope.currentService.tableConfig = v.tableConfig && typeof v.tableConfig === "string" ? JSON.parse(v.tableConfig) : v.tableConfig;
        intsertText($scope.currentService.tableConfig);
        if ($scope.currentService.tableConfig) {
            $scope.serviceConfig = [];
            for (var tmp in $scope.currentService.tableConfig) {
                $scope.serviceConfig.push(tmp);
                if (++count == 1) {
                    $scope.currentConfig = tmp;
                    $scope.currentRule = $scope.currentService.tableConfig[$scope.currentConfig].rule;
                }
            }
        } else {
            $scope.serviceConfig = [];
            $scope.currentConfig = "";
            $scope.currentRule = "";
        }
        $scope.value = {};
        insertSelect();
        $scope.getHtml();
    };

    var insertSelect = function () {
        var tpl = $('<select class="form-control  service"></select>');
        for (var i = 0; i < $scope.serviceConfig.length; i++) {
            tpl.append('<option value="' + $scope.serviceConfig[i] + '">' + $scope.serviceConfig[i] + '</option>');
        }
        $(".config-box select:eq(1)").remove();
        $(".config-box select:eq(0)").after(tpl);
        tpl.change(function () {
            $scope.serviceTableClick($(this).val());
            bubble.updateScope($scope);
        });
        return tpl;
    };

    $(".contentbatchMask").show();

    $scope.fieldTypeList = { "0": "公开", "1": "隐藏", "2": "保护" };
    $scope.checkTypeList = {
        1: "不为空",
        2: "为空",
        3: "大于0",
        4: "小于0",
        5: "等于0",
        6: "整数",
        7: "自然数(包含小数)",
        8: "金额",
        9: "小数",
        10: "email",
        11: "手机号",
        12: "工商执照号",
        13: "纯中文",
        26: "账号ID",
        14: "不包含空格的字符串",
        15: "真实姓名",
        16: "身份证号",
        17: "时间戳（年月日时分秒）",
        18: "星期",
        19: "月",
        20: "IP地址",
        21: "URL",
        22: "密码",
        23: "中国邮政编码",
        24: "日期",
        25: "时间",
        27: "unix时间戳",
        28: "银行卡号",
    };
    $scope.getHtml = function () {
        $timeout(function () {
            var box = $(".config-wrap-box table tbody").html("");
            for (var i = 0; i < $scope.currentRule.length; i++) {
                box.append("<tr></tr>");
                var tbox = box.find("tr:last");
                for (var tmp in $scope.currentRule[i]) {
                    tbox.append("<td></td>");
                    if (tmp == "fieldType") {
                        $scope.currentRule[i][tmp] = $scope.currentRule[i][tmp] + "";
                        box.find("td:last").append($compile("<select class='form-control' ng-model='currentRule[" + i + "][\"" + tmp + "\"]' ng-options='key as value for (key, value) in fieldTypeList'></select>")($scope));
                    } else if (tmp == "checkType") {
                        $scope.currentRule[i][tmp] = $scope.currentRule[i][tmp] + "";
                        box.find("td:last").append($compile("<select class='form-control' ng-model='currentRule[" + i + "][\"" + tmp + "\"]' ng-options='key as value for (key, value) in checkTypeList'></select>")($scope));
                    } else {
                        box.find("td:last").append($compile("<input type='text' ng-model='currentRule[" + i + "][\"" + tmp + "\"]' class='form-control' />")($scope));
                    }
                }
                tbox.append("<td class='removebtn' id='" + i + "'><i class='fa fa-times-circle'></i>删除字段</td>");
            }
            box.append("<tr><td class='addbtn' colspan='6'><i class='fa fa-plus-circle'></i>添加字段</td></tr>");
            box.find(".addbtn").click(addField);
            box.find(".removebtn").click(removeField);
            $(".config-wrap-box .serivce-add-btn").unbind("click").click();
        });
    };

    var addField = function () {
        $scope.currentRule.push({ fieldName: "", fieldType: "0", initValue: "", failedValue: "", checkType: "2" });
        $scope.getHtml();
    };

    var removeField = function () {
        $scope.currentRule.splice(this.id, 1);
        $scope.getHtml();
    };

    $scope.addTable = function () {
        bubble.customModal("configAddModal.html", "configAddController", "lg", "", function (v) {
            if (!$scope.currentService.tableConfig) {
                $scope.currentService.tableConfig = {};
            }
            $scope.currentService.tableConfig[v] = { rule: [], tableName: "objectListCache" };
            $scope.serviceConfig.push(v);
            $scope.currentRule = $scope.currentService.tableConfig[v].rule;
            insertSelect().val(v);
            $scope.getHtml();
        });
    };

    $scope.editTable = function (e) {
        var item = $(".service").find("option:selected").val()
        if (item) {
            bubble.customModal("configEditModal.html", "configEditController", "lg", $scope.currentService.tableConfig, function (v) {
                var name = v.service
                $scope.currentService.tableConfig[item].tableName = v.table
                $scope.currentService.tableConfig[v.service] = $scope.currentService.tableConfig[item]
                delete $scope.currentService.tableConfig[item]
                $scope.serviceClick()
            });
        } else {
            swal('请添加配置')
        }
    };

    $scope.removeTable = function () {
        var item = $(".service").find("option:selected").val();
        if (item) {
            swal({
                title: "确定要删除"+item+"配置吗?",
                text: ""+item+"会被立即删除并无法撤销该操作",
                icon: "warning",
                buttons: {
                    cancel: "取消",
                    defeat: "删除",
                },
            }).then(function (rs) {
                delete $scope.currentService.tableConfig[item]
                $scope.serviceClick()
            })
        } else {
            swal('请选择配置')
        }
    };

    $scope.save = function (e) {
        if ($scope.ajaxed) {
            return;
        }
        $scope.ajaxed = true;
        $(e.currentTarget).html("请求中...");
        intsertText($scope.currentService.tableConfig);
        // bubble._call("service.update|GrapeFW", $scope.currentService.id, { tableConfig: $scope.text }).success(function (v) {
        //     $scope.ajaxed = false;
        //     $(e.currentTarget).html("保存");
        //     if (!v.errorcode) {
        //         swal("保存成功");
        //     } else {
        //         swal("保存失败");
        //     }
        // });
    }
});

bubbleFrame.register('configAddController', function ($scope, bubble, $timeout, items, $modalInstance) {
    $scope.value = items;
    $scope.ok = function () {
        if (!$scope.value) {
            swal("请输入配置名称");
        }
        $modalInstance.close($scope.value);
    }

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    }
});
bubbleFrame.register('configEditController', function ($scope, bubble, $timeout, items, $modalInstance) {
    var item = $(".service").find("option:selected").val()
    $scope.value = {
        service: item,
        table: items[item].tableName
    };

    $scope.ok = function () {
        if (!$scope.value.service) {
            swal("请输入配置名称");
        } else if (!$scope.value.table) {
            swal("请表配置名称");
        } else {
            $modalInstance.close($scope.value);
        }
    }

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    }
});
