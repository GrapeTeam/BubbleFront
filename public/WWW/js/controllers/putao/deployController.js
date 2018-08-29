bubbleFrame.register('deployController', function ($scope, bubble, $timeout) {
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
        };

        this.init = function () {
            minder = new kityminder.Minder();
            $("#deploy-mind").html(JSON.stringify(testObj));
            minder.setup("#deploy-mind");
            minder.disable();
            minder.execCommand('Camera', minder.getRoot());
            $(".km-receiver").remove();
            kityminder.Minder.getTemplateList();
            minder.execCommand('template', "default");
            return this;
        };

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
            };
            minder.importJson(testObj);
            minder.refresh();
        };

        this.refresh = function () {
            minder.refresh();
        }
    };

    var intsertText = function (v) {
        v = JSON.parse(JSON.stringify(v));
        for (var tmp in v) {
            for (var i = 0; i < v[tmp].rule.length; i++) {
                delete v[tmp].rule[i].$$hashKey;
            }
        }
        $scope.text = v ? JSON.stringify(v) : {};
    };

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
        };
        $scope.value = {};

        var watchFn = function (n, o) {
            if (Object.getOwnPropertyNames(n).length)
                intsertText($scope.currentService.tableConfig);
        };

        $scope.currentService && intsertText($scope.currentService.tableConfig);
        $scope.$watch("value", watchFn, true);
    };

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
    };

    var loading = function (v) {
        if (v) {
            $(".contentbatchMask").fadeIn(200);
        } else {
            $(".contentbatchMask").fadeOut(200);
        }
    };

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
    };

    bubble._call("service.page|GrapeFW", 1, 1000).success(function (v) {
        $scope.service = v.data;
        v.data[0].select = true;
        $scope.serviceClick(v.data[0]);
        if ($scope.service && $scope.app) {
            $scope.mind.render($scope.app[0]);
            loading(false);
        }
    });

    bubble._call("app.page|GrapeFW", 1, 1000).success(function (v) {
        $scope.app = v.data;
        v.data[0].select = true;
        v.data[0].meta = v.data[0].meta.split(",");
        $scope.currentApp = $scope.app[0];

        if ($scope.service && $scope.app) {
            $scope.mind.render($scope.app[0]);
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
        bubble._call("app.update|GrapeFW", $scope.currentApp.id, {meta: $scope.currentApp.meta.join(",")}).success(function (v) {
            loading(false);
            if (!v) {
                swal("添加失败");
            } else {
                $scope.mind.render($scope.currentApp);
            }
        })
    };

    $scope.serviceClick = function (v) {
        $scope.currentService = v;
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
            }
        } else {
            $scope.serviceConfig = [];
        }
        $scope.value = {};
        $scope.tableFields = null;
    };

    $scope.serviceTableClick = function (v) {
        $scope.tableFields = $scope.currentService.tableConfig[v].rule;
    };

    $scope.serviceFieldClick = function (v) {
        $scope.value = v;
    };

    $scope.save = function () {
        swal("暂未开放，请复制右侧文本手动加至数据库对应数据");
        // bubble._call("service.update|GrapeFW", $scope.currentService.id, { tableConfig: $scope.text }).success(function (v) {

        // });
    }
});