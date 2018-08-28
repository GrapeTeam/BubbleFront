'use strict';
bubbleFrame.register('fileController', function ($scope, bubble, $modal, $http, $timeout) {
    var scrollLoadPage = 1;
    var scrollLoadEnable = true;
    $scope.scrollControl = {
        onload: function () {
            scrollLoadPage++;
            scrollLoadEnable && ($scope.currentType == 0 ? initFileList(scrollLoadPage) : $scope.typeClick({type: $scope.currentType}));
        }
    };

    var uploadBox = $(".dialog-web-uploader");
    var filebox = $(".filelistbox .fileitembox");
    $scope.fileList = [];
    $scope.currentType = 0;
    $scope.openBtnVisible = true;
    $scope.btnEnable = {
        delete: false,
        add: false,
        downLoad: false,
        rename: false,
        move: false,
        addFolder: true,
        upLoad: true
    };

    $scope.pathmap = [];
    $scope.icons = {
        rar: 3,
        zip: 3,
        folder: 1
    };

    var initData = function (v, p) {
        var d = bubble.getTreeData(v.data, "_id", false, function (v) {
            v.label = v.fileoldname;
        });
        $scope.files = $scope.files.concat(d);
        bubble.sortBy($scope.files, "filetype", true);
        $scope.pathmap = ([[{fileoldname: "全部文件", _id: 0}, $scope.files]]);
        initFileBox();
    };

    var initFileBox = function () {
        var d = $scope.files;
        var tmpele = null;
        var tmphtml = null;
        var html = '<div class="file">' +
            '<div class="fileicon icon@icon"></div>' +
            '<a class="filename" href="javascript:void(0);" title="@fileoldname">@fileoldname</a>' +
            '<span class="filecheckbox"><i class="fa fa-check-circle"></i></span>' +
            '</div>';
        filebox.html("");
        for (var i = 0; i < d.length; i++) {
            (function (n) {
                tmphtml = html.replace("@icon", $scope.icons[d[n].fileextname] ? $scope.icons[d[n].fileextname] : 2);
                tmphtml = tmphtml.replace(/@fileoldname/g, d[n].fileoldname ? d[n].fileoldname : '无名称');
                filebox.append($(tmphtml));
                d[n].ele = filebox.find(".file:last").click(function (e) {
                    $scope.check(d[n], e);
                })[0];
                d[n].$ele = $(d[n].ele);
                if (d[n].ThumbnailImage) {
                    $(d[n].ele).find(".fileicon").append("<img src='" + bubble.getInterface("upload.visible") + d[n].ThumbnailImage + "' width='100%' />").removeClass("icon2");
                }
            })(i)
        }
        filebox.append("<div class='clear-b'></div>");
    };

    var disableBtn = function () {
        $scope.btnEnable.delete = false;
        $scope.btnEnable.rename = false;
        $scope.btnEnable.move = false;
        $scope.btnEnable.downLoad = false;
        $scope.btnEnable.preview = false;
    };

    var enableBtn = function (v, x) {
        $scope.btnEnable.delete = true;
        $scope.btnEnable.rename = x;
        $scope.btnEnable.move = true;
        $scope.btnEnable.downLoad = v;
    };

    var getSelectItem = function (type) {
        var count = 0;
        var rs = [];
        var o = [];
        for (var i = 0; i < $scope.files.length; i++) {
            if ($scope.files[i].selected) {
                count++;
                rs.push($scope.files[i]._id);
                o.push($scope.files[i]);
            }
        }
        return type === "count" ? count : type === "id" ? rs : o;
    };

    var Upload = function () {
        var uploader = "";
        var box = $(".dialog-web-uploader");
        var _this = this;

        this.init = function () {
            uploader = new WebUploader.Uploader({
                auto: true,
                swf: './js/modules/webuploader/Uploader.swf',
                server: "",
                pick: '#fileUploadPicker',
            });
            uploader.on("fileQueued", this.fileQueued);
            uploader.on("uploadProgress", this.uploadProgress);
            uploader.on("uploadSuccess", this.uploadSuccess);
            uploader.on("uploadError", this.uploadError);
            return this;
        };

        this.fileQueued = function (file) {
            uploader.options.server = $scope.pathmap.length ? bubble.getUploadServer($scope.pathmap[$scope.pathmap.length - 1][0]._id) : bubble.getUploadServer();
            $scope.openBtnVisible = false;
            $scope.fileList.push(file);
            file.formatSize = bubble.getSize(file.size);
            file.idx = $scope.fileList.length;
            file.prevsize = 0;
            file.stareTime = Date.now();
            file.prevTime = 0;
            file.folder = $scope.pathmap.length ? $scope.pathmap[$scope.pathmap.length - 1] : "";
            $timeout(function () {
                box.find("#uploaditem" + file.idx + " .file-status span").html("排队中").addClass("text-muted");
            });
            box.show();
        };

        this.uploadProgress = function (file, percentage) {
            // file.precent = percentage.toFixed(2) * 100 + "%";
            box.find("#uploaditem" + file.idx + " .file-status span").html("上传中").removeClass("text-muted").addClass("text-info");
            box.find("#uploaditem" + file.idx + " .process").width(percentage.toFixed(2) * 100 + "%");
            box.find(".header-progress").width(percentage.toFixed(2) * 100 + "%");
            var time = Date.now() - (file.prevTime ? file.prevTime : file.stareTime);
            //计算速度并且格式化填充
            if (time > 1000) {
                var uploadSize = file.size * percentage - file.prevsize;
                file.speed ? file.speed.push(uploadSize / time * 1000) : (file.speed = [], file.speed.push(uploadSize / time * 1000));
                var speed = bubble.getSize(parseInt(uploadSize / time * 1000));
                box.find("#uploaditem" + file.idx + " .file-operate").html(speed + "/s");
                file.prevTime = Date.now();
                file.prevsize = file.size * percentage;
            }
        };

        this.uploadSuccess = function (file, v) {
            var total = 0;
            if (file.speed) {
                for (var i = 0; i < file.speed.length; i++) {
                    total += file.speed[i];
                }
            }
            box.find("#uploaditem" + file.idx + " .process").width(0);
            box.find(".header-progress").hide();
            if (v) {
                box.find("#uploaditem" + file.idx + " .file-status span").html("上传成功").removeClass("text-info").addClass("text-success");
                box.find("#uploaditem" + file.idx + " .file-operate").html(total == 0 ? "光速" : "平均" + bubble.getSize(total / file.speed.length) + "/s").addClass("text-success");
                $scope.files.push(v);
                initFileBox();
            } else {
                box.find("#uploaditem" + file.idx + " .file-operate").html("");
                box.find("#uploaditem" + file.idx + " .file-status span").html(v.message).removeClass("text-info").addClass("text-success");
            }
            bubble.clearCache("file");
        };

        this.uploadError = function (file, msg) {

        }
    };

    var Darw = function () {
        var _this = this;
        var wrap = $(".filelistbox:first");
        var box = wrap.find(".wrapper-sm:first");
        var select_box = wrap.find(".select-box:first");
        var box_point = [];
        var s_point = [];
        var count = 0;
        this.ismove = false;

        this.check = function (p) {
            var tmpo = "";
            var list = $scope.files;
            var _l = select_box[0].offsetLeft, _t = select_box[0].offsetTop;
            var _w = select_box[0].offsetWidth, _h = select_box[0].offsetHeight;

            var initSelect = function () {
                var sl = list[i].ele.offsetWidth + list[i].ele.offsetLeft;
                var st = list[i].ele.offsetHeight + list[i].ele.offsetTop;

                list[i].selected = sl > _l && st > _t && list[i].ele.offsetLeft < _l + _w && list[i].ele.offsetTop < _t + _h;
                if (list[i].selected) {
                    if (!tmpo) {
                        tmpo = list[i].selected;
                    }
                    list[i].$ele.addClass("check");
                } else {
                    list[i].$ele.removeClass("check");
                }
                return list[i].selected;
            };

            for (var i = 0; i < list.length; i++) {
                initSelect(i) && count++;
            }

            $scope.btnEnable.delete = !!count;
            $scope.btnEnable.rename = count == 1;
            $scope.btnEnable.move = !!count;
            $scope.btnEnable.downLoad = count == 1 && tmpo.filetype !== 0;
            count = 0;
        };

        this.start = function (e) {
            if ((e.target === box[0] || e.target === $(".fileitembox")[0]) && $scope.files.length) {
                box_point = [box.offset().left, box.offset().top];
                s_point = [e.clientX - box.offset().left, e.clientY - box.offset().top];
                select_box.show();
                this.check([e.clientX - box_point[0], e.clientY - box_point[1]]);
                this.ismove = true;
            }
        };

        this.move = function (e) {
            if (this.ismove) {
                var p = [e.clientX - box_point[0], e.clientY - box_point[1]];
                var s = box.scrollTop();
                if (_this.get(p) == 1)
                    select_box.css({
                        top: p[1] + s + "px",
                        left: s_point[0] + "px",
                        width: Math.abs(p[0] - s_point[0]) + "px",
                        height: Math.abs(p[1] - s_point[1]) + "px"
                    });
                if (_this.get(p) == 2)
                    select_box.css({
                        top: s_point[1] + s + "px",
                        left: s_point[0] + "px",
                        width: Math.abs(p[0] - s_point[0]) + "px",
                        height: Math.abs(p[1] - s_point[1]) + "px"
                    });
                if (_this.get(p) == 3)
                    select_box.css({
                        top: s_point[1] + s + "px",
                        left: p[0] + "px",
                        width: Math.abs(p[0] - s_point[0]) + "px",
                        height: Math.abs(p[1] - s_point[1]) + "px"
                    });
                if (_this.get(p) == 4)
                    select_box.css({
                        top: p[1] + s + "px",
                        left: p[0] + "px",
                        width: Math.abs(p[0] - s_point[0]) + "px",
                        height: Math.abs(p[1] - s_point[1]) + "px"
                    });

                this.check(p);
            }
        };

        this.end = function (e) {
            _this.ismove = false;
            select_box.css({top: "0px", left: "0px", width: "0px", height: "0px"}).hide();
        };
        //获取目标点在直角坐标系中第几象限
        this.get = function (p) {
            var x = p[0] - s_point[0];
            var y = p[1] - s_point[1];

            if (x > 0 && y > 0)
                return 2;
            if (x > 0 && y < 0)
                return 1;
            if (x < 0 && y < 0)
                return 4;
            if (x < 0 && y > 0)
                return 3;
        };

        $("body").unbind("mouseup").bind("mouseup", this.end);
    };

    var initFileList = function (p) {
        $scope.currentType = 0;
        scrollLoadEnable = false;
        bubble._call("file.pageBy", scrollLoadPage, 60, {isdelete: 0}).success(function (v) {
            if (!v.errorcode) {
                scrollLoadEnable = !(v.data.length < 60);
                initData(v);
            }
        });
    };

    initFileList();

    $scope.types = [
        {name: "全部", selected: true, type: 0},
        {name: "图片", selected: false, type: 1},
        {name: "视频", selected: false, type: 2},
        {name: "文档", selected: false, type: 3},
        {name: "音频", selected: false, type: 4},
        {name: "其他", selected: false, type: 5},
        {name: "回收站", selected: false, type: 7},
    ];

    $scope.breadcrumbClick = function (idx) {
        $scope.pathmap.splice(idx + 1, $scope.pathmap.length);
        $scope.files = $scope.pathmap[$scope.pathmap.length - 1][1];
        disableBtn();
        initFileBox();
    };

    $scope.typeClick = function (v) {
        scrollLoadPage = 1;
        if (v.name !== undefined) {
            for (var i = 0; i < $scope.types.length; i++) {
                $scope.types[i].selected = false;
            }
            v.selected = true;
        }
        scrollLoadPage == 1 && ($scope.files = []);
        if (v.type === 0) {
            initFileList();
            return;
        }
        $scope.currentType = v.type;
        scrollLoadEnable = false;
        bubble._call("file.pageBy", scrollLoadPage, 100, v.type === 7 ? {isdelete: 1} : {filetype: v.type}).success(function (v) {
            if (!v.errorcode) {
                scrollLoadEnable = !(v.length < 100);
                initData(v);
            }
        });
    };

    $scope.darw = new Darw();
    var upload = new Upload().init();

    $scope.check = function (v, e) {
        var type = e.target.tagName === "I" || e.target.tagName === "SPAN";
        if (type || v.filetype !== 0) {
            v.selected = !v.selected;
            var c = getSelectItem("count");
            c == 0 ? disableBtn() : enableBtn(c == 1 && v.filetype !== 0, c == 1);
            $scope.btnEnable.preview = v.filetype == 1 && c == 1;
            v.selected ? v.$ele.addClass("check") : v.$ele.removeClass("check");
        } else {
            //打开文件夹操作
            $scope.pathmap[$scope.pathmap.length - 1][1].map(function (v) {
                v.selected = false;
            });
            $scope.pathmap.push([v, v.children ? v.children : []]);
            $scope.files = $scope.pathmap[$scope.pathmap.length - 1][1];
            disableBtn();
            initFileBox();
        }
    };

    $scope.previewFile = function () {
        var item = getSelectItem();
        if (item.length) {
            item = item[0];
            var deg = 0;
            var img = $('<img class="hover-rotate none" src="' + bubble.getInterface("upload.visible") + item.filepath + '" />');
            var box = $('<div class="popup-img-box animated fadeIn"><div class="imgpopup-closebtn"><i class="glyphicon glyphicon-remove"></i></div></div>');
            box.append(img);
            $("body").append(box);
            box.find(".hover-rotate").viewer({
                url: "src",
                navbar: false
            }).viewer("show");
            box.find(".imgpopup-closebtn").unbind("click").click(function () {

            });
            box.click(function (e) {
                if (e.target === e.currentTarget || $(e.target).hasClass("imgpopup-closebtn") || $(e.target).hasClass("glyphicon")) {
                    $(this).addClass("fadeOut");
                    setTimeout(function () {
                        $("body .popup-img-box").remove();
                    }, 200);
                }
            });
        }
    };

    $scope.uploadMin = function (e) {
        if ($(e.currentTarget).hasClass("dialog-min")) {
            $(e.currentTarget).removeClass("dialog-min").addClass("dialog-back");
            uploadBox.css("bottom", "-375px");
            uploadBox.find(".dialog-header").width() != uploadBox.find(".header-progress").width() && uploadBox.find(".header-progress").show();
        } else {
            $(e.currentTarget).removeClass("dialog-back").addClass("dialog-min");
            uploadBox.css("bottom", "5px");
            uploadBox.find(".header-progress").hide();
        }
    };

    $scope.closeUpload = function () {
        uploadBox.hide();
        $scope.openBtnVisible = true;
    };

    $scope.openUpload = function () {
        uploadBox.show();
        $scope.openBtnVisible = false;
    };

    $scope.deleteFile = function () {
        var list = getSelectItem("object");
        var p = [];
        while (list.length) {
            var tmp = list.pop();
            p.push({_id: tmp._id, size: parseInt(tmp.size)});
            if ($scope.currentType === 7) {
                p[p.length - 1].isdelete = "1";
            }
        }
        swal({
            title: "确定要删除该项吗?",
            text: "该项会被立即删除且文件夹下文件会被一并删除",
            icon: "warning",
            buttons: {
                cancel: "取消",
                defeat: "删除",
            },
        }).then(
            function (s) {
                if (s) {
                    bubble._call(list.length == 1 ? "file.delete" : "file.batchDelete", p)
                        .success(function (x) {
                            if (x.errorcode) {
                                swal("删除失败");
                                return;
                            }
                            var o = $scope.files;
                            for (var i = 0; i < o.length; i++) {
                                for (var tmp1 in p) {
                                    if (p[tmp1]._id === o[i]._id) {
                                        o.splice(i, 1);
                                        i--;
                                        break;
                                    }
                                }
                            }
                            initFileBox();
                        });
                }
            });
    };

    $scope.downloadFile = function (V) {
        var list = getSelectItem("id");
        // $http.get(bubble.getInterface("file.download") + list[0], function(v){

        // });
        window.open(bubble.getInterface("file.download") + list[0] + "&appid=19")
    };

    $scope.createFolder = function () {
        var fid = $scope.pathmap.length ? $scope.pathmap[$scope.pathmap.length - 1][0]._id : 0;
        bubble.customModal("fileFolderCreate.html", "fileFolderCreateController", "lg", {fid: fid}, function (v) {
            $scope.pathmap[$scope.pathmap.length - 1][1].unshift(v);
            initFileBox();
        });
    };

    $scope.moveFile = function () {
        bubble.customModal("fileMoveModal.html", "fileMoveController", "lg", {
            files: $scope.pathmap[0][1],
            list: $scope.pathmap[$scope.pathmap.length - 1][1]
        }, function (v) {
            initFileBox();
        });
    };

    $scope.renameFile = function (v) {
        var o = getSelectItem("object");
        bubble.openModal("edit", "", {
            value: o[0].fileoldname,
            id: o[0]._id,
            functionName: "file.update",
            key: "fileoldname"
        }, function (rs) {
            o[0].fileoldname = rs;
            o[0].$ele.find(".filename").html(rs);
        });
    };

    $scope.files = [
        // { name: "Photoshop CC 2015 绿色精简版", type: 1, selected: false },
        // { name: "ps", type: 1, selected: false },
    ];
});

bubbleFrame.register("fileFolderCreateController", function (bubble, items, $scope, $modalInstance) {
    $scope.name = "";

    $scope.ok = function (e) {
        if (!$scope.name) {
            $scope.error = true;
            return;
        }
        $(e.currentTarget).addClass("data-loading");
        bubble._call("file.add", {
            fatherid: items.fid || items.fid == 0 ? items.fid : items.fid,
            fileoldname: $scope.name,
            fileextname: "folder"
        }).success(function (v) {
            if (v.errorcode) {
                swal(v.message);
                $modalInstance.dismiss('cancel');
            } else {
                $modalInstance.close(v);
            }
        })
    };

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});

bubbleFrame.register("fileMoveController", function (bubble, items, $scope, $modalInstance) {
    var current = "";
    var select_folder = [];
    $scope.name = "";
    var getFolder = function (v) {
        for (var i = 0; i < v.length; i++) {
            v[i].selected = false;
            if (v[i].filetype !== 0) {
                v.splice(i, 1);
                i--;
                continue;
            }
            if (select_folder.indexOf(v[i]._id) >= 0) {
                v.splice(i, 1);
                i--;
                continue;
            }
            v[i].children && getFolder(v[i].children);
        }
        return v;
    };

    var getSelectItem = function (v) {
        var rs = [];
        for (var i = 0; i < v.length; i++) {
            v[i].selected && rs.push(v[i]._id);
            v[i].selected && v[i].filetype == 0 && select_folder.push(v[i]._id);
        }
        return rs;
    };

    var s = getSelectItem(items.list);
    $scope.data = getFolder(JSON.parse(JSON.stringify(items.files)));
    $scope.data = [{label: "全部文件", _id: 0, children: $scope.data}];
    $scope.onSelect = function (v) {
        current = v;
        var target = "";
        bubble.getTreeById(items.files, "_id", current._id, function (n) {
            target = v;
        });
    };
    $scope.tree = {};

    $scope.ok = function (e) {
        $(e.currentTarget).addClass("data-loading");
        current;
        bubble._call("file.updateBatch", s.join(","), current._id).success(function (v) {
            if (!v.errorcode) {
                var target = "";
                current._id == 0 ? target = items.files : bubble.getTreeById(items.files, "_id", current._id, function (n) {
                    target = n;
                });
                for (var i = 0; i < items.list.length; i++) {
                    if (items.list[i].selected) {
                        if (current._id == 0) {
                            target.push(items.list.splice(i, 1)[0]);
                            target[target.length - 1].selected = false
                        } else {
                            target.children || (target.children = []);
                            target.children.push(items.list.splice(i, 1)[0]);
                            target.children[target.children.length - 1].selected = false
                        }
                        i--;
                    }
                }
                $modalInstance.close();
            } else {
                $(e.currentTarget).removeClass("data-loading");
            }
        });
    };

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});