bubbleFrame.register('linkController', function ($scope, bubble) {
    /**
     * 站群编辑层级部分
     */
    var getSingleItemHtml = function (v, idx) {
        var tpl = '<li class="dd-item dd3-item" data-id="@id"><div class="dd-handle dd3-handle">Drag</div><div class="dd3-content"><span class="itemContent">@name</span>@btn</div>@c</li>';
        var btn = '<span class="pull-right"><a><i class="fa fa-pencil fa-fw m-r-xs"></i></a><a><i class="fa fa-plus fa-fw m-r-xs"></i></a><a class="column-delete-btn"><input type="checkbox"></a></span>';
        return tpl.replace("@id", idx).replace("@name", v.name)
            .replace("@c", "").replace("@btn", btn);
    };
    var SortGropu = function () {
        var _this = this;
        var box = null;
        var deleteList = [];

        var initHtml = function (v, i) {
            var idx = i || i === 0 ? i : "";
            var html = "";
            var tpl = '<li class="dd-item dd3-item" data-id="@id"><div class="dd-handle dd3-handle">Drag</div><div class="dd3-content"><span class="itemContent">@name</span>@btn</div>@c</li>';
            var btn = '<span class="pull-right"><a><i class="fa fa-pencil fa-fw m-r-xs"></i></a><a><i class="fa fa-plus fa-fw m-r-xs"></i></a><a class="column-delete-btn"><input type="checkbox"></a></span>';
            var data = v ? v : $scope.siteList;

            for (var i = 0; i < data.length; i++) {
                html += tpl.replace("@id", idx || idx === 0 ? idx + "-" + i : i).replace("@name", data[i].name)
                    .replace("@c", data[i].children ? initHtml(data[i].children, idx || idx === 0 ? idx + "-" + i : i) : "").replace("@btn", btn);
            }
            return '<ol class="dd-list">' + html + '</ol>';
        };

        this.initBtnEvent = function () {
            // box.find(".fa.fa-times").click(_this.delete);
            box.find(".fa.fa-plus").unbind("click").click(_this.create);
            box.find(".fa.fa-pencil").unbind("click").click(_this.edit);
            box.find("input[type='checkbox']").unbind("change").change(_this.deleteListChange);
        };

        var initLinster = function () {
            try {
                box.unbind("change").bind("change", _this.change);
                box.nestable("init");
                _this.collapseAll();
                _this.initCollapse();
            } catch (e) {

            }
        };

        this.getDeleteList = function () {
            return deleteList;
        };

        this.deleteListChange = function (e) {
            var o = getEventObject(e);
            var id = o[0];
            id.checked = e.currentTarget.checked;
            e.currentTarget.checked ? deleteList.push([id, $(e.currentTarget).parents("li:first"), o[3]]) : deleteList.splice(getCheckedItem(id), 1);
            $scope.deleteShower = !!deleteList.length;
            bubble.updateScope($scope);
        };

        var getCheckedItem = function (v) {
            for (var i = 0; i < deleteList.length; i++) {
                if (deleteList[i][0] === v) {
                    return i;
                }
            }
        };

        var getEventObject = function (e) {
            var t = $(e.target);
            var d = $scope.siteList;
            var p = "";
            var n = "";
            var maps = t.parents("li:first").attr("data-id");
            var idx = maps.split("-");

            while (idx.length) {
                if (idx.length === 1) {
                    p = d.children ? d.children : d;
                }
                n = idx.shift();
                d = d.children ? d.children[n] : d[n];
            }

            return [d, p, n, maps];
        };

        this.init = function () {
            deleteList = [];
            var o = null;
            if (box) {
                o = box.clone();
                box.after(o);
                box.remove();
                box.data("nestable", null);
            }
            box = o ? o : $(".sortbox:first");
            box.html(initHtml());
            this.initBtnEvent();
            initLinster();
            return this;
        };

        this.expandItem = function (v) {
            box.nestable("expandItem", v);
        };

        this.expandAll = function () {
            box.nestable("expandAll");
        };

        this.collapseAll = function () {
            box.nestable("collapseAll");
        };

        this.change = function (e) {
            var r = $('.dd').nestable('serialize');
        };

        this.getCurrentInfo = function () {

        };

        this.delete = function (e) {
            var o = getEventObject(e);
        };

        this.create = function (e) {
            var o = getEventObject(e);
            bubble.customModal("linkCreate.html", "linkCreateModalController", "lg", {
                fatherid: o[0]._id,
                wbid: window.localStorage.siteid
            }, function (rs) {
                o[1][o[2]].children ? o[1][o[2]].children.push(rs) : (o[1][o[2]].children = [], o[1][o[2]].children.push(rs));
                o[3] = o[3].split("-");
                o[3].push(o[1][o[2]].children.length - 1);
                o[1][o[2]].children.length > 1 ? $(e.target).parents("li:first").find("ol").append(getSingleItemHtml(rs, o[3].join("-"))) : sort.init();
                sort.initBtnEvent();
            });
        };

        this.edit = function (e) {
            var o = getEventObject(e);
            bubble.customModal("linkCreate.html", "linkEditModalController", "lg", o[0], function (v) {
                $(e.target).parents("li:first").find("span:first").html(o[0].name);
            });
        }
    };

    var deleteCheckItem = function (v) {
        var d = v ? v : $scope.siteList;
        for (var i = 0; i < d.length; i++) {
            d[i].checked ? (d.splice(i, 1), i--) : d[i].children && deleteCheckItem(d[i].children);
        }
    };

    var sort = null;
    bubble._call("link.pageBy", 1, 100, {"wbid": window.localStorage.siteid}).success(function (v) {
        v = v.data;
        $scope.siteList = bubble.getTreeData(v, "_id");
        sort = new SortGropu().init();
        $scope.collapseAll = sort.collapseAll;
        $scope.expandAll = sort.expandAll;
    });

    $scope.delete = function () {
        swal({
            title: "确定要删除该项吗?",
            text: "该项会被立即删除且无法撤销该操作",
            icon: "warning",
            buttons: {
                cancel: "取消",
                defeat: "删除",
            },
        }).then(
            function (s) {
                if (s) {
                    var list = sort.getDeleteList();
                    bubble._call("link.batchDelete", list.map(function (v) {
                        return v[0]._id;
                    }).join(","))
                        .success(function (x) {
                            if (x.errorcode) {
                                swal("删除失败");
                                return;
                            }
                            swal("删除成功");
                            deleteCheckItem();
                            sort.init();
                        });
                }
            });
    };

    $scope.createRoot = function () {
        bubble.customModal("linkCreate.html", "linkCreateModalController", "lg", {
            fatherid: 0,
            wbid: window.localStorage.siteid
        }, function (v) {
            $scope.siteList.push(v);
            $(".sortbox:first>ol").append(getSingleItemHtml(v, $scope.siteList.length - 1));
            sort.initBtnEvent();
        });
    }
});

bubbleFrame.register("linkEditModalController", function ($scope, $modalInstance, items, bubble) {
    $scope.value = items;
    $scope.ok = function (e) {
        $(e.currentTarget).addClass("data-loading");
        var s = JSON.parse(JSON.stringify($scope.value));
        s.url = bubble.replaceSymbol(s.url);
        bubble._call("link.update", $scope.value._id, {
            name: $scope.value.name,
            url: s.url,
            desp: $scope.value.desp
        }).success(function (v) {
            if (!v.errorcode) {
                $modalInstance.close(v);
            } else {
                swal("添加失败");
            }
            $(e.currentTarget).removeClass("data-loading");
        });
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

bubbleFrame.register("linkCreateModalController", function ($scope, $modalInstance, items, bubble) {
    $scope.value = items;
    $scope.ok = function (e) {
        $(e.currentTarget).addClass("data-loading");
        var s = JSON.parse(JSON.stringify($scope.value));
        s.url = bubble.replaceSymbol(s.url);
        bubble._call("link.add", s).success(function (v) {
            if (!v.errorcode) {
                $modalInstance.close(v);
            } else {
                swal("添加失败");
            }
            $(e.currentTarget).removeClass("data-loading");
        });
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});