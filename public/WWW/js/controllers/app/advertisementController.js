'use strict';
bubbleFrame.register('advertisementController', function ($scope, bubble, $timeout) {
    $scope.shower = false;
    var adv = null;
    $scope.currentItem = null;

    $scope.swiperConfig = {
        type: 0,
        data: []
    };

    $scope.siteconfig = {
        title: "栏目选择",
        type: "onlyColumn",
        multiple: false,
        closeOnSelected: true,
        items: [],
        //组件会注入其方法至该对象
        method: {},
        onConfirm: function (v) {
            // $scope.currentItem.data.push(v[0]);
            // adv.initNews($scope.currentItem.data);
            // $scope.shower = true;
            adv.currentColumnItem.url = "栏目链接加载中,请稍等...";
            bubble._call("site.find", {_id: window.localStorage.siteid}).success(function (rs) {
                adv.currentColumnItem.url = rs[0].host + "/" + (v[0].value.TemplateList ? v[0].value.TemplateList : "list") + ".html.pt@wid=" + window.localStorage.siteid + "=p=1=cid=" + v[0].id;
            });
        }
    };

    $scope.tableControl = {
        title: [{name: "详情", key: "sl", width: 30}],
        html: ['<a class="btn btn-sm m-t-n-xs"><i class="fa fa-navicon"></i></a>'],
        onClick: function (key, v) {
            $scope.currentItem = v = JSON.parse(JSON.stringify(v));
            v.data = v.data ? typeof v.data === 'string' ? JSON.parse(v.data) : v.data : [];
            adv.show(v);
        },
        editFn: function (id, v, fn) {
            bubble._call("advertisement.update", id, bubble.replaceBase64(JSON.stringify(v))).success(function (v) {
                fn();
            });
        },
    };

    $scope.ok = function () {
        for (var i = 0; i < $scope.currentItem.data.length; i++) {
            delete $scope.currentItem.data[i].select;
            delete $scope.currentItem.data[i].$$hashKey;
            delete $scope.currentItem.data[i].active;
        }
        $scope.currentItem.data = JSON.stringify($scope.currentItem.data);
        bubble._call("advertisement.update", $scope.currentItem._id, bubble.replaceSymbol(bubble.replaceBase64(JSON.stringify($scope.currentItem)))).success(function (v) {
            if (!v.errorcode) {
                adv.hide();
                $scope.tableControl.reload();
                return;
            }
            swal("更新失败");
        });
    };

    $scope.colors = ["bg-primary lter", "bg-info", "bg-success dk", "bg-warning dk", "bg-danger lter", "bg-primary dk"];

    $scope.closeAdv = function () {
        adv.hide();
    };

    var AdvPopup = function () {
        var _this = this;
        var box = $(".adv-item-box");

        this.init = function (v) {
            this.initUpload();
            this.initEvent();
            return this;
        };

        this.show = function (v) {
            box.fadeIn(200);
            $scope.shower = true;
            _this.initData(v);
        };

        this.hide = function () {
            box.fadeOut(200);
            $scope.shower = false;
            $scope.swiperConfig.data = [];
        };

        var initNewsData = function (v, d) {
            var data = [];
            for (var i = 0; i < v.length; i++) {
                data.push({
                    text: v[i].mainName,
                    url: "",
                    img: v[i].image ? v[i].image : v[i].thumbnail,
                    path: d[i].path
                });
            }
            $scope.shower = true;
            data[0].select = true;
            $scope.swiperConfig.data = data;
        };

        this.initNews = function (v) {
            var data = [];
            var count = 0;
            $scope.currentItem.data = v;
            for (var i = 0; i < v.length; i++) {
                (function (n) {
                    bubble._call("content.pageBy", 1, 1, [{
                        "field": "_id",
                        "logic": "==",
                        "value": v[n].id
                    }]).success(function (rs) {
                        data[n] = rs.data;
                        if (++count == v.length) {
                            initNewsData(data, v);
                        }
                    });
                })(i)
            }
        };

        this.initData = function (v) {
            $scope.swiperConfig.type = v.adtype;
            if (v.data === undefined || v.adtype == 1) {
                $scope.shower = false;
                $scope.swiperConfig.data = [];
                v.adtype == 1 && v.data && v.data.length && _this.initNews(v.data);
                return;
            }
            v = v.data;
            if (!v.length) {
                $scope.shower = false;
            } else {
                for (var i = 0; i < v.length; i++) {
                    if (i == 0) {
                        v[i].select = true;
                    } else {
                        v[i].select = false;
                    }
                }
                $scope.swiperConfig.data = v;
            }
        };

        this.initEvent = function () {
            $(".piclist .addbtn").unbind("click").click(function () {
                $scope.siteconfig.method.show();
            });
            box.unbind("click").click(function (e) {
                if (e.target === e.currentTarget) {
                    box.fadeOut(200);
                }
            });
        };

        $scope.openColumn = function (v) {
            _this.currentColumnItem = v;
            $scope.siteconfig.method.show();
        };

        $scope.itemClick = function (v) {
            $scope.swiperConfig.data.forEach(function (e) {
                e.select = false;
            });
            v.select = true;
        };

        $scope.removeItem = function (v) {
            for (var i = 0; i < $scope.swiperConfig.data.length; i++) {
                var e = $scope.swiperConfig.data[i];
                if (e == v) {
                    $scope.swiperConfig.data.splice(i, 1);
                }
            }
        };
        $scope.up = function (v, i) {
            if (i == 0) {
                return;
            }
            var tmp = $scope.swiperConfig.data[i];
            $scope.swiperConfig.data[i] = $scope.swiperConfig.data[i - 1];
            $scope.swiperConfig.data[i - 1] = tmp;
        };
        $scope.down = function (v, i) {
            if (i == $scope.swiperConfig.data.length - 1) {
                return;
            }
            var tmp = $scope.swiperConfig.data[i];
            $scope.swiperConfig.data[i] = $scope.swiperConfig.data[i + 1];
            $scope.swiperConfig.data[i + 1] = tmp;
        };

        this.initUpload = function () {
            var uploader = "";
            var process = box.find(".process-bar");
            var uploadProgress = function (file, percentage) {
                process.width((percentage.toFixed(2) * 100) + "%");
            };

            var uploadSuccess = function (file, v) {
                process.width("0%");
                var src = "";
                !v.errorcode ? src = bubble.getInterface("upload").visible + v.filepath.replace(/\\/g, "/") : swal("上传失败");
                $scope.swiperConfig.data.push({
                    img: src,
                    text: '',
                    url: '',
                    select: $scope.swiperConfig.data.length == 0
                });
                $scope.currentItem.data = $scope.swiperConfig.data;
                $scope.shower = true;
                bubble.updateScope($scope);
            };

            uploader = new WebUploader.Uploader({
                auto: true,
                swf: './js/modules/webuploader/Uploader.swf',
                server: bubble.getUploadServer(),
                pick: '#fileUploadPickerImge',
            });
            uploader.on("uploadProgress", uploadProgress);
            uploader.on("uploadSuccess", uploadSuccess);
        }
    };

    $timeout(function () {
        adv = new AdvPopup().init();
    })
});

bubbleFrame.register('advCreateController', function ($scope, bubble, items, $modalInstance) {
    $scope.fileControl = items.fileControl;

    $scope.open = function () {
        $scope.fileControl.open();
    };

    $scope.fileControl.onSelect = function (v) {
        $scope.imgURL = v.filepath;
        $scope.fileControl.close();
    };

    $scope.value = {adtype: "0"};

    $scope.ok = function (e) {
        bubble.toggleModalBtnLoading(e, true);
        bubble._call("advertisement.add", {
            adname: $scope.value.adname,
            adtype: $scope.value.adtype,
            imgURL: $scope.value.imgURL
        }).success(function (v) {
            if (!v.errorcode) {
                $modalInstance.close();
            } else {
                bubble.toggleModalBtnLoading(e, false);
                swal("添加失败");
            }
        });
    };

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});

bubbleFrame.register('advPicController', function ($scope, items, $modalInstance) {
    $scope.pics = items.pics;

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});

bubbleFrame.register('advEditController', function ($scope, bubble, items, $modalInstance) {
    $scope.title = "广告编辑";
    $scope.fileControl = items.fileControl;

    $scope.open = function () {
        $scope.fileControl.open();
    };

    $scope.fileControl.onSelect = function (v) {
        $scope.value.imgURL = v.filepath;
        $scope.fileControl.close();
    };

    $scope.value = JSON.parse(JSON.stringify(items.data));

    $scope.ok = function (e) {
        bubble.toggleModalBtnLoading(e, true);
        bubble._call("advertisement.update", items.data._id, bubble.replaceBase64(JSON.stringify({
            adname: $scope.value.adname,
            adtype: $scope.value.adtype,
            imgURL: $scope.value.imgURL
        }))).success(function (v) {
            if (!v.errorcode) {
                $modalInstance.close($scope.value);
            } else {
                bubble.toggleModalBtnLoading(e, false);
                swal("编辑失败");
            }
        });
    };

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});