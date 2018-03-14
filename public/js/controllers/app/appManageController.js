bubbleFrame.register('appManageController', function ($scope, bubble, $timeout, $compile) {
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
        // $scope.serviceClick(v.data[0]);
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