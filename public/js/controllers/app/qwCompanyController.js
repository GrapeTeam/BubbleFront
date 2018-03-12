bubbleFrame.register('qwCompanyController', function ($scope, bubble, $timeout) {
    /**
     * 站群编辑层级部分
     */
    // $scope.control = {
    //     create: function (o, fn) {
    //         bubble.customModal("qwCreate.html", "qwCreateController", "lg", { wbgid: window.localStorage.sitewbgid, fatherid: o[0]._id }, function (rs) {
    //             rs && fn(rs);
    //         });
    //     },
    //     createRoot: function (fn) {
    //         bubble.customModal("qwCreate.html", "qwCreateController", "lg", { wbgid: window.localStorage.sitewbgid }, function (rs) {
    //             rs && fn(rs);
    //         });
    //     },
    //     edit: function (o, fn) {
    //         bubble.customModal("companyCreate.html", "qwEditModalController", "lg", o[0], function (rs) {
    //             rs && fn(rs);
    //         });
    //     },
    //     move: function (list, fn) {
            // $(".contentbatchMask").fadeIn(200);
            // bubble._call("site.update", list[0][0]._id, { fatherid: list[0][1] }).success(function (rs) {
            //     $(".contentbatchMask").fadeOut(200);
            //     if (!rs.errorcode)
            //         initData();
            //     else
            //         swal("修改失败");
            // });
        // },
        // delete: function (ids, fn) {
        //     window.swal({
        //         title: "确定要删除该项吗?",
        //         text: "该项会被立即删除且无法撤销该操作",
        //         icon: "warning",
        //         buttons: {
        //             cancel: "取消",
        //             defeat: "删除",
        //         },
        //     }).then(
        //         function (s) {
        //             console.log(s)
        //             if (s) {
        //                 bubble._call("site.batchDelete", ids).success(function (rs) {
        //                     fn(rs)
        //                 });
        //             }
        //         });
        // },
    // }
    var currentColumn = null;
    $scope.callback = {};
    // $scope.siteconfig = {
    //     // title: "栏目关联",
    //     type: "column",
    //     multiple: true,
    //     items: [],
    //     //组件会注入其方法至该对象
    //     method: {},
    //     onConfirm: function (v) {
    //         v.forEach(function (x) {
    //             delete x.$$hashKey;
    //         });
    //         currentColumn.connColumn = JSON.stringify(v);
    //         currentColumn = JSON.parse(JSON.stringify(currentColumn));
    //         delete currentColumn.children;
    //         bubble._call("webInfo.page", currentColumn._id, currentColumn).success(function (v) {

    //         });
    //     }
    // }

    // $scope.treebtn = [
    //     {
    //         onClick: function (v) {

    //         },
    //         onRender: function (tpl, v) {
    //             return v.vwState && v.vwState == 1 ? '<a title="虚站点"><i class="fa fa-link m-r-xs text-info"></i></a>' : '<a></a>';
    //         }
    //     }
    // ]
    $scope.btn = [
        {
            name: "新建根栏目",
            onClick: function (v) {
                bubble.customModal("qwCreate.html", "qwCreateController", "lg", { fatherid: 0, sort: 1, type: "0", wbid: window.localStorage.siteid, contentType: "0", timediff: 86400000, isreview: "0", slevel: "0" }, function (rs) {
                    rs && $scope.callback.addRoot(rs);
                });
            }
        }
    ];
    $scope.itembtn = [
        {
            name: "编辑",
            onClick: function (v) {
                bubble.customModal("companyCreate.html", "qwEditModalController", "lg",  v, function (rs) {
                    rs && $scope.callback.update(rs,v);
                });
            }
        },
        {
            name: "新建子栏目",
            onClick: function (v) {
                bubble.customModal("qwCreate.html", "qwCreateController", "lg", { fatherid: v._id, sort: 1, type: v.type, wbid: window.localStorage.siteid, contentType: "0", timediff: 86400000, isreview: "0", slevel: "0" }, function (rs) {
                    rs && $scope.callback.addItem(rs, v);
                });
            }
        }]

    var initData = function () {
        $scope.shower = false;
        bubble._call("webInfo.page", 1, 10000).success(function (v) {
            v = v.data;
            $scope.gropuList = v.length ? bubble.getTreeData(v, "_id", true, null, true) : [];
            $timeout(function () {
                $scope.shower = true;
            });
        });
    }
    initData();
});

bubbleFrame.register("qwEditModalController", function ($scope, $modalInstance, items, bubble) {
    $scope.value = items;
    $scope.ok = function (e) {
        $(e.currentTarget).addClass("data-loading");
        bubble._call("site.update", $scope.value._id, { title: $scope.value.title, desp: $scope.value.desp }).success(function (v) {
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
})

bubbleFrame.register("qwCreateController", function (bubble, items, $scope, $modalInstance, $timeout) {
    $scope.value = items;
    var box = "";

    $scope.tree = {};

    var initSite = function () {
        bubble._call("site.getall", 1, 1000, window.localStorage.siteid).success(function (v) {
            $scope.column_tree_data = bubble.getTreeData(v.data, "_id", false, function (v) {
                v.label = v.title;
            });
        });
    }

    $scope.treeSelect = function (v) {
        $scope.value.linkId = v._id;
        $scope.value.title = "";
        $scope.value.desp = "";
        // $(".qwCompany-loading").fadeIn(200);
        // bubble._call("site.add", $scope.value).success(function (v) {
        //     if (!v.errorcode) {
        //         $modalInstance.close(v);
        //     } else {
        //         swal("添加失败");
        //         $scope.value.type = "1";
        //         $(".qwCompany-loading").fadeOut(200);
        //     }
        // });
    }

    $scope.typeChange = function () {
        if ($scope.value.type == 1) {
            box = $(".qwCompany-sitebox")
            $(".qwCompany-infobox").hide();
            box.fadeIn(200);
            initSite();
        } else {
            $(".qwCompany-infobox").fadeIn(200);
            box.hide();
        }
    }

    $scope.ok = function (e) {
        console.log($scope.value)
        if ($scope.value.type == 1) {
            return;
        }
        bubble.toggleModalBtnLoading(e, true);
        $scope.value.linkId = "0";
        bubble._call("site.add", $scope.value).success(function (v) {
            if (!v.errorcode) {
                $modalInstance.close($scope.value);
            } else {
                bubble.toggleModalBtnLoading(e, false);
                swal("添加失败");
            }
        });
    }

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});