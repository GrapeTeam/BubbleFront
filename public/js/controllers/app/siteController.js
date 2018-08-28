bubbleFrame.register('siteController', function ($scope, bubble, $modal, $http, $stateParams) {
    var sortGropu = "";
    $scope.id = "";

    $scope.gropuList = [{
        name: "",
        id: 6,
        fatherid: 0,
        selected: false,
        ownid: 0,
        children: [{name: "财政局C1", id: 7, fatherid: 6, selected: true, ownid: 0},]
    }];

    $scope.mode = false;

    $scope.breadcrumb = [];

    var groupChange = function (v) {
        $scope.id = {wbgid: v.wbgid};
    };

    $scope.tableControl = {
        title: [{name: "打开", key: "sl", width: 30}],
        html: ['<a class="btn btn-sm m-t-n-xs"><i class="fa fa-navicon"></i></a>'],
        onClick: function (key, v) {
            $.ajax({
                beforeSend: function (r) {
                    r.setRequestHeader("GrapeSID", window.logininfo ? window.logininfo.sid : "");
                },
                type: "get",
                url: "http://123.57.214.226:801/13/17/WebInfo/SwitchWeb/" + v._id,
                success: function () {
                    window.localStorage.sitename = v.title;
                    window.open("http://localhost:3000/#!/app/content");
                }
            })

        }
    };
    /**
     * 站群切换部分
     */
    $scope.breadcrumbClick = function (idx) {
        $scope.treeNav.slideTo(idx);
        sortGropu.initCollapse();
    };

    $scope.treeNav = {
        onModeChange: function () {
            $scope.mode = !$scope.mode;
            sortGropu.initCollapse();
        },
        onLevelChange: function () {
            sortGropu.initCollapse();
        },
        onChange: groupChange
    };

    /*--------------------------------------------------------------------------------------*/

    /**
     * 站群编辑层级部分
     */
    var SortGropu = function () {
        var _this = this;
        var tmpState = {};
        var currentState = {};
        var box = $(".sortbox:first");

        this.initCollapse = function () {
            var level = $scope.treeNav.getLevel();
            var idxs = $scope.treeNav.getIdx().idxs;
            _this.collapseAll();
            var wrap = box;
            for (var i = 0; i < level; i++) {
                wrap = wrap.children("ol").children("li:eq(" + idxs[i] + ")");
                _this.expandItem(wrap);
            }
            currentState = tmpState = box.nestable('serialize');
        };

        var initHtml = function (v, i) {
            var idx = i !== undefined ? i : "";
            var html = "";
            var tpl = '<li class="dd-item dd3-item" data-id="@id"><div class="dd-handle dd3-handle">Drag</div><div class="dd3-content">@name@btn</div>@c</li>';
            var btn = '<span class="pull-right"><a><i class="fa fa-pencil fa-fw m-r-xs"></i></a><a><i class="fa fa-plus fa-fw m-r-xs"></i></a><a><i class="fa fa-times fa-fw"></i></a></span>';
            var data = v ? v : $scope.gropuList;

            for (var i = 0; i < data.length; i++) {
                html += tpl.replace("@id", idx !== "" ? idx + "-" + i : i).replace("@name", data[i].name)
                    .replace("@c", data[i].children ? initHtml(data[i].children, idx ? idx + "-" + i : i) : "").replace("@btn", btn);
            }
            return '<ol class="dd-list">' + html + '</ol>';
        };

        var initBtnEvent = function () {
            box.find(".fa.fa-times").click(_this.delete);
            box.find(".fa.fa-plus").click(_this.create);
            box.find(".fa.fa-pencil").click(_this.edit);
        };

        var initLinster = function () {
            try {
                box.on("change", _this.change);
                box.nestable("init");
                _this.collapseAll();
                _this.initCollapse();
            } catch (e) {

            }
        };

        var getEventObject = function (e) {
            var t = $(e.target);
            var d = $scope.gropuList;
            var p = "";
            var n = "";
            var idx = t.parents("li:first").attr("data-id").split("-");
            for (var i = 0; i < idx.length; i++) {
                if (idx.length == 1 || i == idx.length - 1) {
                    p = d;
                    n = idx[i];
                }
                d = i == idx.length - 1 ? d[idx[i]] : d[idx[i]].children;
            }

            return [d, p, n];
        };

        this.init = function () {
            // box.html('<div ui-jq="nestable" ui-options="{maxDepth: 10}" class="dd max-w-full"></div>' + initHtml() + '</div>');
            box.html(initHtml());
            initBtnEvent();
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
            currentState = $('.dd').nestable('serialize');
        };

        this.updateSite = function (e) {
            $(e.currentTarget).addClass("data-loading").attr("disabled", "disabled");
            if (JSON.stringify(tmpState) === JSON.stringify(currentState)) {
                return;
            }
            $(e.currentTarget).removeClass("data-loading").removeAttr("disabled", "disabled");
        };

        this.getCurrentInfo = function () {

        };

        this.delete = function (e) {
            var o = getEventObject(e);
            swal({
                title: "确定要删除该项吗?",
                text: "该项会被立即删除且子站群会被一并删除",
                icon: "warning",
                buttons: {
                    cancel: "取消",
                    defeat: "删除",
                },
            }).then(
                function (s) {
                    if (s) {
                        bubble._call("siteGroup.delete", o[0].wbgid)
                            .success(function (x) {
                                if (x.errorcode) {
                                    swal("删除失败");
                                    return;
                                }
                                o[1].splice(o[2], 1);
                                $(e.target).parents("li:first").remove();
                            });
                    }
                });
        };

        this.create = function (e) {
            var o = getEventObject(e);
            bubble.openModal("create", "siteGroupCreate.html", {
                value: {fatherid: o[0].wbgid},
                functionName: "siteGroup.add",
                key: "name"
            }, function (rs) {

            });
        };

        this.edit = function (e) {
            var o = getEventObject(e);
            bubble.openModal("edit", "", {
                value: o[0].name,
                id: o[0].wbgid,
                functionName: "siteGroup.update",
                key: "name"
            }, function (rs) {

            });
        }
    };

    $scope.indexSave = function (e) {
        sortGropu.updateSite(e);
    };

    $scope.createRoot = function () {
        bubble.openModal("create", "siteGroupCreate.html", {
            value: {fatherid: 0, sort: 1},
            functionName: "site.add",
            key: "name"
        }, function (rs) {

        });
    };

    //初始化数据
    bubble._call("siteGroup.page", 1, 1000).success(function (v) {
        v = v.data;
        $scope.gropuList = bubble.getTreeData(v, "wbgid", true);
        sortGropu = new SortGropu().init();
        $scope.breadcrumb = [$scope.gropuList[0].name];
        $scope.collapseAll = sortGropu.collapseAll;

        $scope.expandAll = sortGropu.expandAll;
    });
});