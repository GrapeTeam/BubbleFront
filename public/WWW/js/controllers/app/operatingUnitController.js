'use strict';
bubbleFrame.register('operatingUnitController', function ($scope, bubble) {

    var sortGropu = "";
    $scope.current = "";
    var Slide = function () {
        var box = $(".navbox.iconbox .offset-box");
        var current = 0;
        var size = 0;

        this.next = function () {
            this.slideTo(++current);
        };

        this.prev = function () {
            this.slideTo(--current);
        };

        this.slideTo = function (i) {
            var f = current > i;    //true <-  false ->
            current = i;
            current == 0 ? (box.find(".offset-navbox").hide(), box.find(".static-box:first").show())
                : (box.find(".offset-navbox,.static-box:first").hide(), box.find(".offset-navbox:eq(" + (f ? i - 1 : i + 1) + ")").show());
            box.css("transform", "translateX(-" + current + "00%)");
        }
    };

    var slide = new Slide();
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
        if ($scope.current && v._id == $scope.current._id) {
            return;
        }
        bubble._call("column.find", {_id: v._id}).success(function (v) {
            $scope.current = v[0];
        });
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
        };

        var initHtml = function (v, i) {
            var idx = i ? i : "";
            var html = "";
            var tpl = '<li class="dd-item dd3-item" data-id="@id"><div class="dd-handle dd3-handle">Drag</div><div class="dd3-content">@name@btn</div>@c</li>';
            var btn = '<span class="pull-right"><a><i class="fa fa-pencil fa-fw m-r-xs"></i></a><a><i class="fa fa-plus fa-fw m-r-xs"></i></a><a><i class="fa fa-times fa-fw"></i></a></span>';
            var data = v ? v : $scope.gropuList;

            for (var i = 0; i < data.length; i++) {
                html += tpl.replace("@id", idx ? idx + "-" + i : i).replace("@name", data[i].name)
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
            var r = $('.dd').nestable('serialize');
        };

        this.getCurrentInfo = function () {

        };

        this.delete = function (e) {
            var o = getEventObject(e);
            swal({
                title: "确定要删除该项吗?",
                text: "该项会被立即删除并无法撤销该操作",
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
                                if (!x) {
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
            bubble.openModal("create", "columnCreate.html", {
                value: {fatherid: 0, sort: 1},
                functionName: "config.update",
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

    $scope.createRoot = function () {
        bubble.openModal("create", "columnCreate.html", {
            value: {fatherid: 0, sort: 1},
            functionName: "config.update",
            key: "name"
        }, function (rs) {

        });
    };

    //初始化数据
    bubble._call("column.page", 1, 100).success(function (v) {
        v = v.data;
        $scope.gropuList = bubble.getTreeData(v, "ogid", true);
        sortGropu = new SortGropu().init();
        $scope.breadcrumb = [$scope.gropuList[0].name];
        $scope.collapseAll = sortGropu.collapseAll;

        $scope.expandAll = sortGropu.expandAll;
    });
});