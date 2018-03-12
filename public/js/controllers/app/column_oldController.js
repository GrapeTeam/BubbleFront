bubbleFrame.register('columnController', function ($scope, bubble, $modal, $http, $stateParams, $timeout) {
    // $scope.gropuList = [{ name: "", id: 6, fatherid: 0, selected: false, ownid: 0, children: [{ name: "财政局C1", id: 7, fatherid: 6, selected: true, ownid: 0 },] }];
    $scope.gropuList = [];
    var currentColumn = null;

    //站点数据选择配置
    $scope.siteconfig = {
        title: "栏目关联",
        type: "column",
        multiple: true,
        items: [],
        //组件会注入其方法至该对象
        method: {},
        onConfirm: function (v) {
            v.forEach(function (x) {
                delete x.$$hashKey;
            });
            currentColumn.connColumn = JSON.stringify(v);
            currentColumn = JSON.parse(JSON.stringify(currentColumn));
            delete currentColumn.children;
            bubble._call("column.update", currentColumn._id, currentColumn).success(function (v) {

            });
        }
    }

    $scope.columnThumb = function () {
        var key = "thumbnail";
        var currentData = "";
        $scope.modalVisible = false;
        $scope.thumbList = null;
        var uploader = null;
        $scope.modalConfirm = function () {
            $scope.modalVisible = false;
        }

        this.init = function (v) {
            currentData = JSON.parse(JSON.stringify(v));
            if (!currentData[key]) {
                currentData[key] = [];
            } else {
                currentData[key] = currentData[key].split(",");
            }
            return this;
        }

        this.getCurrentData = function () {
            return currentData[key];
        }

        this.getList = function () {
            if ($scope.thumbList) {
                return;
            }
            bubble._call("file.pageBy", 1, 1000, { isThumbnail: 1 }).success(function (v) {
                $scope.thumbList = v.data;
                for (var i = 0; i < v.data.length; i++) {
                    v.data[i].ThumbnailImage = bubble.getInterface("upload.visible") + v.data[i].ThumbnailImage;
                }
                $timeout(function () {
                    this.initUpload();
                }.bind(this));
            }.bind(this));
        }

        this.onclick = function (v) {
            var t = true;
            for (var i = 0; i < currentData[key].length; i++) {
                if (currentData[key][i] == bubble.getInterface("upload.visible") + v.filepath) {
                    t = i;
                }
            }
            if (t === true) {
                currentData[key].push(bubble.getInterface("upload.visible") + v.filepath);
                v.select = true;
            } else {
                this.remove(v, t);
            }
        }

        this.deleteThumb = function (item) {
            swal({
                title: "确定要删除吗?",
                text: "推送操作无法撤销",
                icon: "warning",
                buttons: {
                    cancel: "取消",
                    defeat: "删除",
                },
            }).then(
                function (s) {
                    if (s) {
                        bubble._call("file.batchDelete", [{ _id: item._id, size: parseInt(item.size) }]).success(function (v) {
                            if (!v.errorcode) {
                                swal("删除成功");
                                $scope.thumbList.splice($scope.thumbList.indexOf(item), 1);
                            } else {
                                swal("删除失败");
                            }
                        });
                    }
                });
        }

        this.show = function () {
            $scope.modalVisible = true;
            this.getList();
        }

        this.initUpload = function () {
            if (uploader) {
                return;
            }
            uploader = new WebUploader.Uploader({
                auto: true,
                swf: './js/modules/webuploader/Uploader.swf',
                server: bubble.getUploadServer() + "&isThumbnail=1",
                pick: '.item-uploader',
            });
            uploader.on("error", function (v, file) {
                if (v === "F_DUPLICATE") {
                    swal("该文件已上传过", file.name);
                }
            });
            uploader.on("uploadProgress", function (file, percentage) {
                $(".column-thumb-upload-process").width((percentage.toFixed(2) * 100) + "%");
            });
            uploader.on("uploadSuccess", function (file, v) {
                $scope.thumbList.unshift(v);
                v.ThumbnailImage = bubble.getInterface("upload.visible") + v.ThumbnailImage;
                $(".column-thumb-upload-process").width(0);
                bubble.updateScope($scope);
            });
        }

        this.remove = function (v, i) {
            currentData[key].splice(i, 1);
            v && (v.select = false);
        }
    }

    $scope.columnThumb = new $scope.columnThumb();

    //树插件按钮配置
    // $scope.treebtn = [
    //     {
    //         tpl: '<a title="栏目关联"><i class="fa fa-link m-r-xs"></i></a>',
    //         onClick: function (v) {
    //             currentColumn = v[0];
    //             $scope.siteconfig.items = currentColumn.connColumn ? JSON.parse(currentColumn.connColumn) : [];
    //             showSiteChose();
    //         },
    //         onRender: function (tpl, v) {
    //             return v.connColumn ? '<a title="栏目关联"><i class="fa fa-link m-r-xs text-info"></i></a>' : tpl;
    //         }
    //     }
    // ]
    //树插件配置
    $scope.control = {
        create: function (o, fn) {
            bubble.customModal("columnCreate.html", "columnCreateController", "lg", { value: { fatherid: o[0]._id, sort: 1, type: "1", wbid: window.localStorage.siteid, contentType: "0", timediff: 86400000, isreview: "0", slevel: "0" }, thumb: $scope.columnThumb }, function (rs) {
                rs && fn(rs);
            });
        },
        createRoot: function (fn) {
            bubble.customModal("columnCreate.html", "columnCreateController", "lg", { value: { fatherid: 0, sort: 1, type: "1", wbid: window.localStorage.siteid, contentType: "0", timediff: 86400000, isreview: "0", slevel: "0" }, thumb: $scope.columnThumb }, function (rs) {
                rs && fn(rs);
            });
        },
        edit: function (o, fn) {
            o[0].isreview == undefined && (o[0].isreview = "0");
            o[0].slevel == undefined && (o[0].slevel = "0");
            o[0].slevel += "";
            o[0].Contant = false;
            bubble.customModal("columnCreate.html", "columnEditController", "lg", { value: o[0], thumb: $scope.columnThumb }, function (rs) {
                rs && fn(rs);
            });
        },
        delete: function (ids, fn) {
            window.swal({
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
                        bubble._call("column.batchDelete", ids).success(function (rs) {
                            fn(rs)
                        });
                    }
                });
        }
    }

    $scope.treebtn = [];

    $scope.treebtn.push({
        onClick: function (v) {
            bubble.customModal("columnBind.html", "columnBindController", "lg", { list: $scope.gropuList, curr: v }, function (rs) {
                v[0].linkOgid = rs.ids;
                v[0].MixMode = rs.mode;
            });
        },
        onRender: function (tpl, v) {
            return v.linkOgid && v.linkOgid != "" && v.linkOgid != "0" ? '<a class="text-info m-r" title="点击更改绑定栏目">点击更改绑定栏目</a>' : '<a class="m-r" title="绑定本站栏目">点击绑定本站栏目</a>';
        }
    })

    var showSiteChose = function () {
        $scope.siteconfig.method.show();
    }

    $scope.closeChose = function () {
        $scope.siteconfig.method.hide();
    }

    //初始化数据
    bubble._call("column.page", 1, 5000).success(function (v) {
        v = v.data;
        $scope.gropuList = v.length ? bubble.getTreeData(v, "_id", true, function (x) {
            x.editCount = x.editCount ? x.editCount : 1;
        }) : [];
        $timeout(function () {
            $scope.shower = true;
        });
    });
});

bubbleFrame.register("columnBindController", function (bubble, items, $scope, $modalInstance, $timeout) {
    var current = items.curr[0].linkOgid ? items.curr[0].linkOgid.split(",") : [];                       //选中栏目ID集合
    var currentId = items.curr[0]._id;      //入口栏目ID
    $scope.isinlude = items.curr[0].MixMode && !isNaN(items.curr[0].MixMode) ? items.curr[0].MixMode + "" : "0";
    $timeout(function () {
        var box = $(".column-modal-tree-box");
        var initTree = function (v, l) {
            l = l ? l : 0;
            for (var i = 0; i < v.length; i++) {
                box.append('<div class="item' + (current.length && current.indexOf(v[i]._id) >= 0 ? " cur" : "") + '" style="margin-left:' + (20 * l) + 'px;" id="' + v[i]._id + '">' + v[i].name + '</div>');
                if (v[i]._id == currentId) {
                    box.find(".item:last").addClass("disabled");
                }
                if (v[i].children) {
                    initTree(v[i].children, l + 1);
                }
            }
            box.find(".item").unbind("click").click($scope.onSelect);
        }

        initTree(items.list);
    }, 20);

    $scope.onSelect = function (v) {
        if ($(this).hasClass("disabled")) {
            return;
        }
        var idx = current.indexOf(this.id);
        if (idx >= 0) {
            current.splice(idx, 1);
            $(this).removeClass("cur");
        } else {
            current.push(this.id);
            $(this).addClass("cur");
        }
    }
    $scope.tree = {};

    $scope.ok = function (e) {
        bubble.toggleModalBtnLoading(e, true);
        bubble._call("column.SetLinkOgid", currentId, current.join(","), parseInt($scope.isinlude)).success(function (v) {
            if (!v.errorcode) {
                $modalInstance.close({ ids: current.join(","), mode: parseInt($scope.isinlude) });
            } else {
                bubble.toggleModalBtnLoading(e, false);
                swal("新闻移动失败");
            }
        });
    }

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});

bubbleFrame.register("columnEditController", function (bubble, items, $scope, $modalInstance, $timeout) {
    $scope.value = JSON.parse(JSON.stringify(items.value));
    delete $scope.value.children;
    $scope.value.timediff = $scope.value.timediff ? $scope.value.timediff / 24 / 60 / 60 / 1000 : 0;
    $scope.value.ColumnProperty = !isNaN($scope.value.ColumnProperty) ? $scope.value.ColumnProperty + "" : "3";
    $scope.value.isCheck = !isNaN($scope.value.isCheck) ? $scope.value.isCheck + "" : "0";
    $scope.value.isvisble = !isNaN($scope.value.isvisble) ? $scope.value.isvisble + "" : "0";
    $scope.thumb = items.thumb.init($scope.value);

    $scope.ok = function (e) {
        bubble.toggleModalBtnLoading(e, true);
        $scope.value.timediff = $scope.value.timediff * 24 * 60 * 60 * 1000;
        if ($scope.value.Contant) {
            $scope.value.Contant = 1;
        } else {
            delete $scope.value.Contant;
        }
        $scope.value.ColumnProperty = parseInt($scope.value.ColumnProperty);
        $scope.value.isCheck = parseInt($scope.value.isCheck);
        $scope.value.isvisble = parseInt($scope.value.isvisble);
        $scope.value.thumbnail = $scope.thumb.getCurrentData().join(",");
        bubble._call("column.update", $scope.value._id, $scope.value).success(function (v) {
            if (!v.errorcode) {
                $modalInstance.close($scope.value);
            } else {
                bubble.toggleModalBtnLoading(e, false);
                swal("修改失败");
            }
        });
    }

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});

bubbleFrame.register("columnCreateController", function (bubble, items, $scope, $modalInstance, $timeout) {
    items.value.timediff = 0;
    items.value.editCount = 1;
    items.value.ColumnProperty = "3";
    items.value.isCheck = "0";
    items.value.isvisble = "0";
    $scope.value = items.value;
    $scope.thumb = items.thumb.init($scope.value);

    $scope.ok = function (e) {
        bubble.toggleModalBtnLoading(e, true);
        $scope.value.timediff = 0;
        $scope.value.ColumnProperty = parseInt($scope.value.ColumnProperty);
        $scope.value.isCheck = parseInt($scope.value.isCheck);
        $scope.value.isvisble = parseInt($scope.value.isvisble);
        $scope.value.Contant = !!$scope.value.Contant ? 1 : 0;
        $scope.value.thumbnail = $scope.thumb.getCurrentData().join(",");
        bubble._call("column.add", $scope.value).success(function (v) {
            if (!v.errorcode) {
                $modalInstance.close(v);
            } else {
                bubble.toggleModalBtnLoading(e, false);
                swal("修改失败");
            }
        });
    }

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});