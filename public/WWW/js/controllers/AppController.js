var initAjaxState = {
    menu: false,
    count: false,
};

var swithMainLoading = function (v) {
    initAjaxState[v] = true;
    for (var tmp in initAjaxState) {
        if (!initAjaxState[tmp]) {
            return;
        }
    }
    $(".main-loading-box").fadeOut(200);
};
//左侧菜单控制器
bubbleFrame.register('navController', function ($scope, bubble, $rootScope, $timeout, $state) {
    bubble._call("menu.show").success(function (v) {
        swithMainLoading("menu");
        var list = {};
        for (var i = 0; i < v.length; i++) {
            var t = v[i];
            list[t.sname] = t;
        }
        $scope.menuList = list;
        $scope.include = function (v) {
            return $state.includes(v);
        };
        $timeout(function () {
            $("ul.nav.pos-rlt>li").mouseenter(function (e) {
                var t = $(e.currentTarget);
                if (!$scope.app.settings.asideFolded || t.find("ul").length > 0) {
                    return;
                }
                var text = t.find("span").html();
                $("ul.nav").find(".poptext").html(text).css("top", t.offset().top).show();
            });
            $("ul.nav.pos-rlt>li").mouseleave(function (e) {
                $("ul.nav.pos-rlt").find(".poptext").hide();
            });
        });
    });
});
//右上角齿轮任务控制器
bubbleFrame.register('taskPopUpController', function ($scope, bubble) {
    $scope.tasks = [];
    $scope.colors = ["alert-danger", "alert-info", "alert-success"];
    bubble._call("task.page", 1, 100).success(function (v) {
        $scope.tasks = v.data;
    });
});
//头部工具栏控制器
bubbleFrame.register('headerController', function ($scope, bubble, $rootScope, $state, $localStorage, $timeout, $filter) {
    $scope.name = $rootScope.logininfo ? $rootScope.logininfo.name : "用户";
    window.logininfo = $rootScope.logininfo;
    $scope.changesite = window.logininfo.webinfo.length > 1;
    var sites = $scope.sites = window.logininfo.webinfo;
    $scope.logout = function () {
        bubble._call("user.logout", $rootScope.logininfo._id).success(function (v) {
            delete $localStorage.logininfo;
            $state.go("access.login");
        })
    };

    $scope.changepwd = function () {
        bubble.customModal("changePWDModal.html", "changePWDController", "lg", {}, function (v) {
            v == "密码修改成功！" && $scope.logout();
        });
    };

    $scope.changeUserInfo = function () {
        bubble.customModal("changeUserInfoModal.html", "changeUserInfoController", "lg", {}, function (v) {
            if (v === true) {
                $scope.name = $rootScope.logininfo.name;
            }
        });
    };

    $scope.sitename = window.localStorage.sitename;

    var Site = function () {
        this.colors = ["bg-danger", "bg-info", "bg-success"];
        var _this = this;
        var box = $(".site-change-wrap");
        var site = bubble.getTreeData($scope.sites, "wbid", undefined, undefined, true);
        this.nav = site.length > 1 ? [{list: site, name: site[0].wbname}] : [];
        this.nav = site.length == 1 && site[0].children ? [{
            list: site[0].children,
            name: site[0].wbname
        }] : [{list: site, name: "首页"}];
        this.searchKey = "";
        this.icon = site.length > 1 || (site[0] && site[0].children);

        this.searchChange = function () {
            _this.searchList = $filter("filter")(_this.tmpsearchList, _this.searchKey, undefined, "wbname");
        };

        var initChildren = function (v) {
            _this.currentList = [];
            _this.searchList = [];
            for (var i = 0; i < v.length; i++) {
                var e = v[i];
                if (e.children) {
                    _this.currentList.push(e);
                }
                _this.searchList.push(e);
            }
            !_this.currentList.length && _this.currentList.push({wbname: "返回上一级"});
            _this.tmpsearchList = _this.searchList;
        };

        this.levelChange = function (v) {
            if (v.wbid) {
                _this.nav.push({list: v.children, name: v.wbname});
                v.children && initChildren(v.children);
            } else {
                _this.navClick(_this.nav.length - 2);
            }
        };

        this.navClick = function (i) {
            _this.nav.splice(i + 1, _this.nav.length);
            initChildren(_this.nav[_this.nav.length - 1].list);
        };

        this.changeSite = function (t) {
            if (t.wbid == window.localStorage.siteid) {
                swal("请选择非当前站点");
                return;
            }
            bubble._call("site.switch", t.wbid).success(function (rs) {
                window.localStorage.sitename = t.wbname;
                window.localStorage.siteid = t.wbid;
                window.localStorage.sitewbgid = t.wbgid;
                window.location.reload();
            });
        };

        this.show = function () {
            if (_this.icon) {
                box.fadeIn(200);
            }
        };

        this.hide = function () {
            box.fadeOut(200);
        };

        box.click(function (e) {
            if (e.target === e.currentTarget) {
                _this.hide();
            }
        });

        $scope.changesite && initChildren(site);
    };

    var initSite = function () {
        $timeout(function () {
            if ($(".site-change-wrap").length) {
                $scope.Site = new Site();
            } else {
                setTimeout(initSite, 500);
            }
        })
    };
    initSite();
});

//更改用户信息
bubbleFrame.register('changeUserInfoController', function ($scope, bubble, $modalInstance, $localStorage, $rootScope) {
    var info = $rootScope.logininfo;
    $scope.value = {
        name: info.name,
        mobphone: info.mobphone,
    };
    $scope.ok = function (e) {
        if ($scope.value.name == info.name && $scope.value.mobphone == info.mobphone) {
            $modalInstance.dismiss('cancel');
            return;
        }
        $(e.currentTarget).addClass("data-loading");
        bubble._call("user.update", info._id, $scope.value).success(function (v) {
            $(e.currentTarget).removeClass("data-loading");
            if (!v.errorcode) {
                swal("修改成功");
                info.name = $scope.value.name;
                info.mobphone = $scope.value.mobphone;
                $localStorage.logininfo = JSON.stringify(info);
                $modalInstance.close(true);

            } else {
                swal(v.message);

            }
        });
    };

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});

//更改密码控制器
bubbleFrame.register('changePWDController', function ($scope, bubble, $modalInstance, $localStorage, $rootScope) {
    $scope.name = $rootScope.logininfo.id;
    $scope.ok = function (e) {
        if (!($scope.pwd && $scope.pwd1 && $scope.pwd2)) {
            swal("密码不可为空");
            return;
        }
        if ($scope.pwd1 != $scope.pwd2) {
            swal("两次密码输入不一致");
            return;
        }
        $(e.currentTarget).addClass("data-loading");
        bubble._call("user.changePW", $scope.name, $scope.pwd, $scope.pwd1).success(function (v) {
            $(e.currentTarget).removeClass("data-loading");
            if (!v.errorcode) {
                swal("修改成功");
                $modalInstance.close(v);

            } else {
                swal(v.message);

            }
        })
    };

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});

//更改密码控制器
bubbleFrame.register('siteChangeController', function ($scope, bubble, $modalInstance, $localStorage, $rootScope) {
    $scope.ok = function (e) {

    };

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});

//App全局控制器
bubbleFrame.register('AppCtrl', function ($scope, $localStorage, $window, $rootScope, $state, bubble, $timeout) {
    // add 'ie' classes to html
    $rootScope.reportCount = "";
    var hasCanvasInit = false;
    var isIE = !!navigator.userAgent.match(/MSIE/i);
    isIE && angular.element($window.document.body).addClass('ie');
    isSmartDevice($window) && angular.element($window.document.body).addClass('smart');
    var anitimer = 0;

    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState) {
        $scope.app.settings.full = false;
        $scope.app.settings.asideFolded = false;
        $scope.app.settings.popupReportSlideBox = true;
        if ($localStorage.logininfo) {
            var tmp = JSON.parse($localStorage.logininfo);
            $rootScope.logininfo = tmp;
            window.logininfo = $rootScope.logininfo;
            !$rootScope.reportCount && window.logininfo && bubble._call("report.count").success(function (v) {
                swithMainLoading("count");
                $rootScope.reportCount = !v || v.errorcode ? "0" : v.message;
            });
        } else {
            toState.name.indexOf("access") >= 0 || $state.go("access.login");
        }
    });
    // config
    $scope.app = {
        name: '葡萄云',
        version: '1.3.3',
        // for chart colors
        color: {
            primary: '#7266ba',
            info: '#23b7e5',
            success: '#27c24c',
            warning: '#fad733',
            danger: '#f05050',
            light: '#e8eff0',
            dark: '#3a3f51',
            black: '#1c2b36'
        },
        settings: {
            themeID: 1,
            navbarHeaderColor: 'bg-black',
            navbarCollapseColor: 'bg-white-only',
            asideColor: 'bg-black',
            headerFixed: true,
            asideFixed: true,
            asideFolded: false,
            asideDock: false,
            container: false,
            full: false,
            popupReportSlideBox: true
        }
    };

    // save settings to local storage
    // if (angular.isDefined($localStorage.settings)) {
    //     $scope.app.settings = $localStorage.settings;
    // } else {
    //     $localStorage.settings = $scope.app.settings;
    // }
    $scope.$watch('app.settings', function () {
        if ($scope.app.settings.asideDock && $scope.app.settings.asideFixed) {
            // aside dock and fixed must set the header fixed.
            $scope.app.settings.headerFixed = true;
        }
        // save to local storage
        $localStorage.settings = $scope.app.settings;
    }, true);


    function isSmartDevice($window) {
        // Adapted from http://www.detectmobilebrowsers.com
        var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
        // Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
        return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
    }
});

//右上角齿轮举报控制器
bubbleFrame.register('reportPopUpController', function ($scope, bubble) {
    var initMode = true;
    $scope.reports = [];
    $scope.colors = ["alert-danger", "alert-info", "alert-success"];

    $scope.refreshData = function () {
        $scope.loading = true;
        bubble._call("report.select", {state: "0,1"}, 100).success(function (v) {
            $scope.loading = false;
            $scope.reports = v;
            if ($scope.reports.length && initMode) {
                initMode = false;
            }
            if (initMode && !$scope.reports.length) {
                $scope.empty = true;

                return;
            }
            if (!initMode && !$scope.reports.length) {
                $scope.empty = false;
                $scope.refresh = true;
                return;
            }
            $scope.empty = false;
            $scope.refresh = false;
        }, false);
    };

    $scope.refreshData();

    $scope.showReport = function (v, i) {
        bubble.customModal("replyReportPopUpModal.html", "replyReportPopUpController", "lg", {
            list: $scope.reports,
            data: v,
            scope: $scope,
            idx: i
        }, function () {

        });
    }
});


bubbleFrame.register('replyReportPopUpController', function ($scope, $modalInstance, items, bubble, $timeout) {
    $scope.stateText = ["未受理", "处理中", "已处理", "被拒绝"];
    var dateList = items.list;
    var idx = items.idx;

    $scope.next = function (e) {
        if (idx != dateList.length - 1) {
            doneNext = false;
            idx++;
            $scope.data = dateList[idx];
            $scope.data.time = new Date(parseInt($scope.data.time)).Format("yyyy-MM-dd hh:mm");
        } else {
            !dateList.length && doneNext && swal("真棒,最近的举报都处理了,再换一批吧");
            !dateList.length && (items.scope.refresh = true);
            !e && idx++;
            !dateList.length ? $modalInstance.close() : (e ? swal("这是最后一条举报了") : $scope.prev());
        }
        refresh();
    };

    $scope.prev = function () {
        if (idx != 0) {
            idx--;
            $scope.data = dateList[idx];
            $scope.data.time = new Date(parseInt($scope.data.time)).Format("yyyy-MM-dd hh:mm");
        } else {
            swal("这已经是第一条举报了")
        }
        refresh();
    };

    var refresh = function () {
        $scope.refresh = false;
        $scope.imgs = [];
        $timeout(function () {
            $scope.videoCurrent = 0;
            $scope.videoList = $scope.data.video ? $scope.data.video.split(",") : [];
            $scope.imgs = $scope.data.image.split(",");
            $scope.refresh = true;
        })
    };

    $scope.refresh = true;
    $scope.refreshVideo = true;
    $scope.data = items.data;
    $scope.data.time = new Date(parseInt($scope.data.time)).Format("yyyy-MM-dd hh:mm");
    $scope.imgs = $scope.data.image.split(",");
    $scope.value = {state: "0"};
    $scope.mode = true;
    $scope.videoCurrent = 0;
    $scope.videoList = $scope.data.video ? $scope.data.video.split(",") : [];
    $scope.deg = 0;
    $scope.modeChange = function (e) {
        if (!$scope.mode) {
            if (!!$scope.value.newContent) {
                bubble._call("reportReply.add", {"Rcontent": $scope.value.newContent}).success(function (v) {
                    $scope.mode = !$scope.mode;
                    swal(!v.errorcode ? "添加成功" : "添加失败");
                    $(e.currentTarget).parent().parent().find("select").show();
                    $(e.currentTarget).parent().parent().find("input").hide();
                });
            } else {
                $scope.mode = !$scope.mode;
                $(e.currentTarget).parent().parent().find("select").show();
                $(e.currentTarget).parent().parent().find("input").hide();
            }
        } else {
            $scope.mode = !$scope.mode;
            $(e.currentTarget).parent().parent().find("select").hide();
            $(e.currentTarget).parent().parent().find("input").show();
        }
    };
    $scope.ok = function (e, type) {
        if ($scope.data.time === undefined) {
            return
        }
        bubble.customModal("replyReportContentModal.html", "replyReportContentController", "lg", {}, function (rs) {
            if (!rs) {
                swal("反馈内容不可为空");
                return;
            }
            $(e.currentTarget).addClass("data-loading");
            bubble._call(type == "0" ? "report.complete" : "report.refuse", dateList[idx]._id, {reason: rs})
                .success(function (v) {
                    $(e.currentTarget).removeClass("data-loading");
                    if (v.errorcode) {
                        swal(v.data);
                        return;
                    }
                    dateList[idx].state = type == "0" ? "2" : "3";
                    dateList[idx].reason = rs;
                    swal("操作成功");
                    doneNext = true;
                    $scope.next();
                });
        });
    };

    $scope.proces = function (e) {
        if ($scope.data.time === undefined) {
            return
        }
        $(e.currentTarget).addClass("data-loading");
        bubble._call("report.update", dateList[idx]._id, {state: 1})
            .success(function (v) {
                $(e.currentTarget).removeClass("data-loading");
                if (v.errorcode) {
                    swal(v.data);
                    return;
                }
                dateList[idx].state = 1;
                swal("操作成功");
                doneNext = true;
                $scope.next();
            });
    };

    $scope.kill = function (e) {
        bubble.customModal("replyReportContentModal.html", "replyReportContentController", "lg", {kick: true}, function (rs, t) {
            $(e.currentTarget).addClass("data-loading");
            bubble._call("report.kick", dateList[idx].userid, {"kickTime": t, _id: dateList[idx]._id, reason: rs})
                .success(function (v) {
                    $(e.currentTarget).removeClass("data-loading");
                    if (v.errorcode) {
                        swal(v.data);
                        return;
                    }
                    dateList[idx].state = "3";
                    dateList[idx].reason = "";
                    swal("操作成功");
                    doneNext = true;
                    $scope.next();
                });
        });
    };

    var refreshVideo = function () {
        $scope.refreshVideo = false;
        $timeout(function () {
            $scope.refreshVideo = true;
        })
    };

    $scope.download = function () {
        window.open($scope.videoList[$scope.videoCurrent]);
    };

    $scope.videoleft = function () {
        $scope.videoCurrent > 0 && ($scope.videoCurrent-- , refreshVideo());
    };

    $scope.videoright = function () {
        $scope.videoCurrent < $scope.videoList.length - 1 && ($scope.videoCurrent++ , refreshVideo());
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

bubbleFrame.register('replyReportContentController', function ($scope, $modalInstance, items, bubble, $compile, $timeout) {
    $scope.content = "";
    $scope.value = "1";
    $scope.kick = items.kick;

    $scope.$watch("content", function (v) {
        editor && editor.appendHtml(v.text);
    });

    var editor = null;
    $timeout(function () {
        var Upload = function () {
            var uploader = "";
            var box = $(".dialog-web-uploader");
            var _this = this;

            this.init = function () {
                uploader = new WebUploader.Uploader({
                    auto: true,
                    swf: './js/modules/webuploader/Uploader.swf',
                    server: bubble.getUploadServer(),
                    pick: '#fileUploadPicker1',
                });
                uploader.on("fileQueued", this.fileQueued);
                uploader.on("uploadProgress", this.uploadProgress);
                uploader.on("uploadSuccess", this.uploadSuccess);
                return this;
            };

            this.fileQueued = function (file) {

            };

            this.uploadProgress = function (file, percentage) {
                $(".reportImgUploadBox .h-full").width(percentage.toFixed(2) * 100 + "%");
            };

            this.uploadSuccess = function (file, v) {
                $(".reportImgUploadBox .h-full").width(0);
                !v.errorcode ? editor.appendHtml("<img src='" + bubble.getInterface("upload").visible + v.filepath.replace(/\\/g, "/") + "' />") : swal("上传失败");
                bubble.updateScope($scope);
            };

            this.uploadError = function (file, msg) {
                $(".reportImgUploadBox .h-full").width(0);
                swal("上传失败");
            }
        };

        editor = KindEditor.create('#editor_id', {
            uploadJson: bubble.getUploadServer(),
            items: [
                'source', '|', 'undo', 'redo', '|', 'preview', 'print', 'cut', 'copy', 'paste',
                'plainpaste', 'wordpaste', '|', 'justifyleft', 'justifycenter', 'justifyright',
                'justifyfull', 'insertorderedlist', 'insertunorderedlist', 'indent', 'outdent', 'subscript',
                'superscript', 'clearhtml', 'quickformat', 'selectall', '|', 'fullscreen', '/',
                'formatblock', 'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold',
                'italic', 'underline', 'strikethrough', 'lineheight', 'removeformat', '|',
                'insertfile', 'table', 'hr', 'baidumap', 'link', 'unlink'
            ],
        });

        $timeout(function () {
            var upload = new Upload().init();
        })
    });
    $scope.ok = function (e) {
        var html = bubble.replaceBase64(editor.html());
        if (!html) {
            swal("反馈内容不可为空");
            return;
        }
        bubble.toggleModalBtnLoading(e, true);
        $modalInstance.close(html, $scope.value);
    };

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});