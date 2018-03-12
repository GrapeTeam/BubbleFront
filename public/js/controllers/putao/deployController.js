bubbleFrame.register('deployController', function ($scope, bubble, $timeout, $compile) {
    $scope.currentTab = 0;
    var Mind = function () {
        var minder = null;
        var _this = this;
        var testObj = {
            "root": {
                "data": {
                    "text": "请选择APP"
                },
                "children": []
            },
            "template": "default",
            "theme": "fresh-blue",
            "version": "1.4.43"
        }

        this.init = function () {
            minder = new kityminder.Minder();
            $("#deploy-mind").html(JSON.stringify(testObj));
            minder.setup("#deploy-mind");
            minder.disable();
            minder.execCommand('Camera', minder.getRoot());
            $(".km-receiver").remove();
            kityminder.Minder.getTemplateList()
            minder.execCommand('template', "default");
            return this;
        }

        this.render = function (v) {
            initSerivceName(v);
            var c = [];
            for (var i = 0; i < v.sname.length; i++) {
                c.push({
                    "data": {
                        "text": v.sname[i],
                    },
                    "children": []
                });
            }
            testObj = {
                "root": {
                    "data": {
                        "text": v.desp
                    },
                    "children": c
                }
            }
            minder.importJson(testObj);
            minder.refresh();
        }

        this.refresh = function () {
            minder.refresh();
        }
    }

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
            if (Object.getOwnPropertyNames(n).length)
                intsertText($scope.currentService.tableConfig);
        }

        $scope.currentService && intsertText($scope.currentService.tableConfig);
        $scope.$watch("value", watchFn, true);
    }

    autoForm();

    $timeout(function () {
        $scope.mind = new Mind().init();
    });

    $scope.tabChange = function (i) {
        $scope.currentTab = i;
        if (i == 0) {
            $timeout(function () {
                $scope.mind.render($scope.currentApp);
            });
        }
    }

    var loading = function (v) {
        if (v) {
            $(".contentbatchMask").fadeIn(200);
        } else {
            $(".contentbatchMask").fadeOut(200);
        }
    }

    var initSerivceName = function (v) {
        if (v.sname) {
            return;
        } else {
            v.sname = [];
        }
        for (var i = 0; i < v.meta.length; i++) {
            for (var x = 0; x < $scope.service.length; x++) {
                if (v.meta[i] == $scope.service[x].serviceName) {
                    v.sname[i] = $scope.service[x].serviceDescription;
                    break;
                }
            }
        }
    }

    bubble._call("service.page|GrapeFW", 1, 1000).success(function (v) {
        $scope.service = v.data;
        $scope.currentService = v.data[0];
        v.data[0].select = true;
        $scope.serviceClick(v.data[0]);
        if ($scope.service && $scope.app) {
            $scope.mind && $scope.mind.render($scope.app[0]);
            loading(false);
        }
    });

    bubble._call("app.page|GrapeFW", 1, 1000).success(function (v) {
        $scope.app = v.data;
        v.data[0].select = true;
        v.data[0].meta = v.data[0].meta.split(",");
        $scope.currentApp = $scope.app[0];

        if ($scope.service && $scope.app) {
            $scope.mind && $scope.mind.render($scope.app[0]);
            loading(false);
        }
    });

    $(".contentbatchMask").show();

    $scope.appClick = function (v) {
        if (v.select) {
            return;
        }
        for (var i = 0; i < $scope.app.length; i++) {
            delete $scope.app[i].select;
        }
        for (var i = 0; i < $scope.service.length; i++) {
            $scope.service[i].active = false;
            if (v.meta.indexOf($scope.service[i].serviceName) >= 0) {
                $scope.service[i].active = true;
            }
        }
        if (typeof v.meta === "string") {
            v.meta = v.meta.split(",");
        }
        v.select = true;
        $scope.currentApp = v;
        $scope.mind.render(v);
    }

    $scope.insertSerivce = function () {
        bubble.customModal("serivceAddModal.html", "serivceAddController", "lg", undefined, function (v) {

        });
    };

    $scope.insertApp = function () {
        bubble.customModal("AppAddModal.html", "AppAddController", "lg", undefined, function (v) {

        });
    };

    $scope.updateService = function (v) {
        bubble.customModal("serivceAddModal.html", "serivceAddController", "lg", v, function (v) {

        });
    };

    $scope.updateApp = function (v) {
        bubble.customModal("AppAddModal.html", "AppAddController", "lg", v, function (v) {

        });
    };

    $scope.deleteApp = function (v) {
        swal({
            title: "确定要删除该APP吗?",
            text: "APP会被立即删除并无法撤销该操作",
            icon: "warning",
            buttons: {
                cancel: "取消",
                defeat: "删除",
            },
        }).then(
            function (s) {
                if (s) {
                    bubble._call("app.delete|GrapeFW", v.id).success(function (v) {
                        if (!v.errorcode) {
                            swal("删除成功");
                            for (var i = 0; i < $scope.app.length; i++) {
                                if ($scope.app[i].id == v.id) {
                                    $scope.app.splice(i, 1);
                                }
                            }
                        } else {
                            swal("删除失败");
                        }
                    });
                }
            });
    };

    $scope.deleteService = function (v) {
        swal({
            title: "确定要删除该Service吗?",
            text: "Service会被立即删除并无法撤销该操作",
            icon: "warning",
            buttons: {
                cancel: "取消",
                defeat: "删除",
            },
        }).then(
            function (s) {
                if (s) {
                    bubble._call("service.delete|GrapeFW", v.id).success(function (v) {
                        if (!v.errorcode) {
                            swal("删除成功");
                            for (var i = 0; i < $scope.service.length; i++) {
                                if ($scope.service[i].id == v.id) {
                                    $scope.service.splice(i, 1);
                                }
                            }
                        } else {
                            swal("删除失败");
                        }
                    });
                }
            });
    };

    $scope.addSerivce = function (v) {
        var idx = $scope.currentApp.meta.indexOf(v.serviceName);
        if (idx >= 0) {
            $scope.currentApp.meta.splice(idx, 1);
            $scope.currentApp.sname.splice(idx, 1);
            v.active = false;
        } else {
            $scope.currentApp.meta.push(v.serviceName);
            $scope.currentApp.sname.push(v.serviceDescription);
            v.active = true;
        }
        loading(true);
        bubble._call("app.update|GrapeFW", $scope.currentApp.id, { meta: $scope.currentApp.meta.join(",") }).success(function (v) {
            loading(false);
            if (!v) {
                swal("添加失败");
            } else {
                $scope.mind.render($scope.currentApp);
            }
        })
    }

    var insertSelect = function () {
        var tpl = $('<select class="form-control m-t"></select>');
        for (var i = 0; i < $scope.serviceConfig.length; i++) {
            tpl.append('<option value="' + $scope.serviceConfig[i] + '">' + $scope.serviceConfig[i] + '</option>');
        }
        $(".config-box select:eq(1)").remove();
        $(".config-box select:eq(0)").after(tpl);
        tpl.change(function () {
            $scope.serviceTableClick($(this).val());
            bubble.updateScope($scope);
        });
    };

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
    }

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
            }
        });
    };

    $scope.serviceTableClick = function (v) {
        $scope.currentRule = $scope.currentService.tableConfig[v].rule;
        $scope.getHtml();
    }

    $scope.serviceFieldClick = function (v) {
        $scope.value = v;
    }

    $scope.save = function (e) {
        if ($scope.ajaxed) {
            return;
        }
        $scope.ajaxed = true;
        $(e.currentTarget).html("请求中...");
        intsertText($scope.currentService.tableConfig);
        bubble._call("service.update|GrapeFW", $scope.currentService.id, { tableConfig: $scope.text }).success(function (v) {
            $scope.ajaxed = false;
            $(e.currentTarget).html("保存");
            if (!v.errorcode) {
                swal("保存成功");
            } else {
                swal("保存失败");
            }
        });
    }
});

bubbleFrame.register("serivceAddController", function ($scope, bubble, $timeout, items, $modalInstance) {
    var news = !items;
    $scope.value = items ? { state: items.state, serviceDescription: items.serviceDescription, serviceName: items.serviceName, url: items.url } : {};

    if ($scope.value.state === undefined) {
        $scope.value.state = "0";
    } else {
        $scope.value.state = $scope.value.state + "";
    }

    $scope.ok = function (e) {
        bubble.toggleModalBtnLoading(e, true);
        $scope.value.state = parseInt($scope.value.state);
        if (news) {
            bubble._call("service.add|GrapeFW", $scope.value).success(function (v) {
                $modalInstance.close(v);
            });
        } else {
            bubble._call("service.update|GrapeFW", items.id, $scope.value).success(function (v) {
                $modalInstance.close(v);
            });
        }
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});


bubbleFrame.register("AppAddController", function ($scope, bubble, $timeout, items, $modalInstance) {
    var news = !items;
    $scope.value = items ? { domain: items.domain, name: items.name, desp: items.desp } : {};

    $scope.ok = function (e) {
        bubble.toggleModalBtnLoading(e, true);
        if (news) {
            bubble._call("app.add|GrapeFW", $scope.value).success(function (v) {
                $modalInstance.close(v);
            });
        } else {
            bubble._call("app.update|GrapeFW", items.id, $scope.value).success(function (v) {
                $modalInstance.close(v);
            });
        }
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});