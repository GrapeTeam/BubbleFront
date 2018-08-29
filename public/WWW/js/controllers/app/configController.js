bubbleFrame.register('configController', function ($scope, bubble, $modal, $http) {
    var current = 0;
    var currentType = 0;
    var configfield = null;
    var typefield = {};          //配置大类约束

    $scope.editCheckItem = [];  //编辑模式选中项
    $scope.type = [];           //配置项分类列表
    $scope.list = {};           //配置项分组列表
    $scope.configList = [];     //配置项列表
    $scope.visibleItem = [];    //表格可视项

    $scope.createType = function () {
        bubble.customModal("configCreate.html", "configCreateContorller", "lg", {
            scope: $scope,
            configfield: configfield,
            currentType: currentType,
            current: current
        }, function (v) {

        });
    };

    $scope.deleteConfig = function () {
        openDelete();
    };

    var openDelete = function () {
        var list = $scope.type[currentType].list[current].list;
        var ids = [];
        var names = [];
        for (var i = 0; i < list.length; i++) {
            list[i].checked && (ids.push(list[i].id), names.push(list[i].configname));
        }
        bubble.openModal("deleteitem", "", {names: names, ids: ids, functionName: "config.delete"}, function (v) {
            if (v) {
                for (var i = 0; i < list.length; i++) {
                    list[i].checked && list.splice(i, 1) && i--;
                }
            } else {
                swal("删除失败");
            }
        })
    };

    $scope.allCheck = function (e) {
        var o = $scope.type[currentType].list[current];
        toggleDeleteBtn(o.checked);
        o.list.map(function (v) {
            v.checked = e.target.checked;
        })
    };

    $scope.itemCheck = function (e) {
        var o = $scope.type[currentType].list[current];
        var count = 0;
        o.list.map(function (v) {
            v.checked && count++;
        });
        o.checked = count == o.list.length;
        toggleDeleteBtn(count);
    };

    $scope.closeMask = function (e) {
        e.target === e.currentTarget && $(e.target).removeClass("active");
    };

    $scope.deleteType = function (v, d) {
        swal({
                title: "确定要删除该项吗?",
                text: "该项会被立即删除并无法撤销该操作",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "删除",
                cancelButtonText: "取消",
            },
            function () {
                bubble._call("configType.delete", v.id)
                    .success(function (x) {
                        if (!x) {
                            swal("删除失败");
                            return;
                        }
                        for (var i = 0; i < d.length; i++) {
                            if (d[i].id == v.id) {
                                d.splice(i, 1);
                                break;
                            }
                        }
                    });
            });
    };

    $scope.openVisible = function () {
        bubble.openModal("visibleitem", "", {
            data: $scope.type[currentType].list[current].list,
            visibleItem: $scope.type[currentType].list[current].visibleItem,
        }, function (v) {
            $scope.type[currentType].list[current].visibleItem = v;
            initScopeVar();
        })
    };

    $scope.openEdit = function (idx, value, type, key) {
        var target = type == "type" ? $scope.type[idx] : $scope.type[currentType].list[current].list[idx];
        bubble.openModal("edit", "", {
            value: value,
            id: target.id,
            functionName: type == "type" ? "configType.update" : "config.update",
            key: key
        }, function (rs) {
            target[key] = rs;
        })
    };

    $scope.openJsonEdit = function (idx) {
        if ($scope.type[currentType].list[current].field == "") {
            swal("当前config不存在描述,请先添加描述");
            return;
        }
        bubble.openModal("jsonedit", "", {
            target: $scope.type[currentType].list[current].list[idx].configjson,
            field: $scope.type[currentType].list[current].field
        }, function (v) {
            var id = $scope.type[currentType].list[current].list[idx].id;
            bubble._call("config.update", id, {configjson: JSON.stringify(v)})
                .success(function (v) {

                });
        })
    };

    $scope.typeClick = function (e, idx) {
        $scope.type[currentType].select = false;
        currentType = idx;
        $scope.type[idx].select = true;
        $scope.list = $scope.type[idx].list;
        $scope.type[idx].list.map(function (v, i) {
            v.select && (current = i);
        });
        isDeleteBtnShow();
        initScopeVar();
    };

    $scope.groupClick = function (e, idx) {
        $scope.type[currentType].list[current].select = false;
        current = idx;
        $scope.type[currentType].list[idx].select = true;
        isDeleteBtnShow();
        initScopeVar();
    };

    var toggleDeleteBtn = function (v) {
        v ? $(".table-delete-btn:first").addClass("opa1").removeAttr("disabled") : $(".table-delete-btn:first").removeClass("opa1").attr("disabled", "")
    };

    var isDeleteBtnShow = function () {
        var rs = false;
        var o = $scope.type[currentType].list[current];
        if (o.checked) {
            rs = o.checked;
        }

        rs || o.list.map(function (v) {
            v.checked && (rs = true);
        });
        toggleDeleteBtn(rs);
    };

    var initScopeVar = function () {
        $scope.configList = $scope.type[currentType].list[current];
        $scope.visibleItem = $scope.type[currentType].list[current].visibleItem;
    };

    var initTypeName = function (fn) {
        bubble._call("configType.page", 1, 1000)
            .success(function (v) {
                v = v.data;
                v.map(function (x) {
                    typefield[x.id] = {name: x.name, groupBy: x.childfield};
                });

                fn();
            })
    };

    var initConfigField = function (fn) {
        return function () {
            bubble._call("configField.page", 1, 1000)
                .success(function (v) {
                    var o = {};
                    v = v.data;
                    v.map(function (x) {
                        try {
                            o[x.typeid] || (o[x.typeid] = {});
                            x.typekey ? o[x.typeid][x.typekey] = JSON.parse(x.typefield) : o[x.typeid] = JSON.parse(x.typefield);
                        } catch (e) {
                            throw new Error("configtypenext表中存在错误数据[id='" + x.id + "']");
                        }
                    });
                    configfield = o;
                    fn();
                })
        }
    };

    var getGroup = function (v, target, groupBy, typeid) {
        var rs = {};
        var isexist = false;
        var name = groupBy && v.configjson[groupBy] !== undefined ? v.configjson[groupBy] : "default";

        target.map(function (item) {
            item.name == name && (isexist = true, item.list.push(v));
        });
        !isexist && target.push({
            list: [v],
            name: name,
            visibleItem: [{key: "configname", ch: "配置名称"}, {key: "desp", ch: "配置描述"}, {key: "id", ch: ""}],
            field: groupBy ? (configfield[typeid][name] ? configfield[typeid][name] : "") : (configfield[typeid] ? configfield[typeid] : "")
        });

        return target;
    };

    initTypeName(initConfigField(function () {
        bubble._call("config.page", 1, 1000)
            .success(function (v) {
                v = v.data;
                if (v.length) {
                    for (var i = 0; i < v.length; i++) {
                        try {
                            var id = v[i].typeid;
                            var typename = typefield[id].name;
                            var groupBy = typefield[id].groupBy;
                            var isexist = false;
                            v[i].configjson && (v[i].configjson = JSON.parse(v[i].configjson));
                            $scope.type.map(function (item) {
                                item.id == id && (isexist = true, getGroup(v[i], item.list, groupBy, id));
                            });
                            !isexist && $scope.type.push({
                                list: getGroup(v[i], [], groupBy, id),
                                id: id,
                                name: typename,
                                groupBy: groupBy
                            });
                            if (i == 0 && $scope.type[i].list && $scope.type[i].list.length) {
                                $scope.type[0].select = true;
                                $scope.list = $scope.type[i].list;
                                $scope.configList = $scope.list[i];
                                $scope.visibleItem = $scope.list[i].visibleItem;
                            }
                            if ($scope.type[i]) {
                                $scope.type[i].list[current].select = true;
                            }
                        } catch (e) {
                            v.splice(i, 1);
                            i--;
                        }
                    }
                    initConfigField();
                }
            });
    }));
});

bubbleFrame.register('configCreateContorller', function ($scope, $modalInstance, items, bubble) {
    var rs = {
        newtype: []
    };
    $scope.configsJson = {};
    var fieldList = items.configfield;
    var getField = function (v) {
        // var rs = JSON.parse(JSON.stringify(v));
        return v;
    };

    var resetConfigs = function () {
        $scope.step3Enable = Object.getOwnPropertyNames($scope.field).length > 0;
        $scope.keylist = [];
        for (var tmp in $scope.field) {
            $scope.field[tmp].data.indexOf("hide") < 0 && $scope.keylist.push(tmp);
        }
        initConfigJson();
    };

    var getObjectConfig = function (v) {
        try {
            var rs = {};
            var o = v.data.split(":");
            o.splice(0, 1);
            var o = JSON.parse(o.join(":"));
            for (var tmp in o) {
                rs[tmp] = getNewConfig(o[tmp]);
            }

            return rs;
        } catch (e) {
            throw new Error("描述符错误");
        }
    };

    var getNewConfig = function (v) {
        var type = v.data.split(":")[0];
        if (type == "s" || type == "int" || type == "float") {
            return "";
        }
        if (type.indexOf("json") >= 0) {
            return getObjectConfig(v);
        }
        if (type.indexOf("array") >= 0) {
            return [];
        }
        if (type.indexOf("bool") >= 0) {
            return v.data.split(":")[1];
        }
        if (type.indexOf("select") >= 0) {
            return v.data.split(":")[1].split("|")[0];
        }
    };

    var initConfigJson = function () {
        if ($scope.field == "") {
            $scope.configsJson = {};
            return;
        }
        for (var tmp in $scope.field) {
            $scope.configsJson[tmp] = getNewConfig($scope.field[tmp]);
        }
    };

    //进度条及Tab控制
    $scope.steps = {percent: 30, step1: true, step2: false, step3: false};
    //预设项
    $scope.text = ["还差两步就可以完成了...", "还差一步就可以完成了...", "最后一步!就快完成了..."];
    $scope.vartype = [];
    //新建分类使用
    $scope.typemode = "select";
    $scope.fieldmode = "select";
    $scope.newtype = {name: "1", groupBy: "1"};
    $scope.newfield = {key: "", mark: "", data: ""};
    //数据存储
    $scope.typelist = JSON.parse(JSON.stringify(items.scope.type));
    $scope.typename = $scope.typelist[items.currentType];               //选中分类
    $scope.group = $scope.typename.list[items.current];          //选中描述符
    $scope.field = $scope.group.field;
    resetConfigs();

    for (var tmp in bubble.ParameType) {
        $scope.vartype.push({name: tmp, value: bubble.ParameType[tmp]});
    }

    $scope.typechange = function () {
        $scope.group = $scope.typename.list && $scope.typename.list.length ? $scope.typename.list[0] : {
            name: "",
            list: [],
            field: {}
        };
        $scope.field = $scope.group.field;
        $scope.fieldmode = Object.getOwnPropertyNames($scope.field).length ? "select" : "new";
        resetConfigs();
    };

    $scope.fieldModeChange = function (t) {
        $scope.fieldmode = t;
        $scope.field = t == "new" ? {name: "", list: [], field: {}} : $scope.group;
        $scope.newfield = {key: "", mark: "", data: ""};
    };

    //添加分类
    $scope.insertType = function (e) {
        // bubble._call("configTypeInsert", {name: $scope.newtype})
        //     .success(function(v){
        //         v
        //     });
        var d = $scope.newtype;
        d.list = [{name: !$scope.newtype.groupBy ? "default" : "", list: [], field: {}}];
        rs.newtype.push(d);
        $scope.typelist.push(d);
        $scope.typemode = "select";
        $scope.typename = $scope.typelist[$scope.typelist.length - 1];
        $scope.group = $scope.typename.list[0];       //选中描述符
        $scope.field = $scope.group.field;
        resetConfigs();
    };

    $scope.createField = function () {
        if ($scope.field.name == "") {
            swal("组名不可为空");
            return;
        }
        if (!Object.getOwnPropertyNames($scope.field).length) {
            swal("描述项不可为空");
            return;
        }
        $scope.field.select = true;
        $scope.fieldmode = "select";
        $scope.typelist[0].list.push($scope.field);
    };

    $scope.deleteField = function (k) {
        delete $scope.field[k];
    };

    $scope.insertField = function (e) {
        var d = $scope.newfield;
        if (d.key && $scope.field[d.key]) {
            swal("禁止添加相同字段或空字段");
            return;
        }
        if (!(d.data && d.mark)) {
            swal("必须存在描述和类型");
            return;
        }
        if (d.data.indexOf(":") < 0) {
            swal("必须类型格式错误,请仔细阅读相关文档");
            return;
        }
        if ($scope.field.name == "") {
            swal("先填写分组名后再添加描述字段");
            return;
        }
        $scope.field[d.key] = {mark: d.mark, data: d.data};
        $scope.newfield = {key: "", mark: "", data: ""};
    };

    var resetTypeMode = function () {
        $scope.typemode = "select";
        $scope.newtype = {name: "1", groupBy: "1", list: []};
    };

    $scope.tabclick = function (i) {
        if (i == 0) {
            resetTypeMode();
            $scope.steps.percent = 30;
            $scope.steps.step1 = true;
        }
        if (i == 1) {
            resetTypeMode();
            $scope.fieldmode = $scope.group.select != undefined ? "select" : "new";
            $scope.steps.percent = 60;
            $scope.steps.step2 = true;
        }
        if (i == 2) {
            resetTypeMode();
            $scope.steps.percent = 90;
            $scope.steps.step3 = true;
        }
    };

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});