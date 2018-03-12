import angular from "angular";
import app from "../../main";
import $ from "jquery";
var swal = window.swal;

app.directive('fileChosen', ['bubble', '$timeout', function (bubble, $timeout) {
    return {
        scope: {
            control: "=",
            type: "@"
        },
        restrict: 'E',
        templateUrl: './tpl/fileChosen.html',
        replace: true,
        controller: ["$scope", "bubble", "$modal", "$http", "$timeout", function ($scope, bubble, $modal, $http, $timeout) {
            var wrapbox = $(".file-chosen-wrap");
            var filebox = $(".fileitembox");
            var uploadBox = $(".dialog-web-uploader");
            wrapbox.unbind("click").bind("click", function (e) {
                if (e.target === e.currentTarget) {
                    wrapbox.hide();
                }
            });
            var scrollLoadPage = 1;
            var scrollLoadEnable = true;
            $scope.scrollControl = {
                onload: function () {
                    scrollLoadPage++;
                    scrollLoadEnable && ($scope.currentType == 0 ? initFileList(scrollLoadPage) : $scope.typeClick({ type: $scope.currentType }));
                }
            }
            $scope.control && ($scope.control.open = function () {
                wrapbox.show();
            })
            $scope.control && ($scope.control.close = function () {
                wrapbox.hide();
            })
            $scope.fileList = [];
            $scope.currentType = 0;
            $scope.openBtnVisible = true;
            $scope.btnEnable = { delete: false, add: false, downLoad: false, rename: false, move: false, addFolder: true, upLoad: true };

            $scope.pathmap = [];
            $scope.icons = {
                rar: 3,
                zip: 3,
                folder: 1
            }

            var initData = function (v) {
                var d = bubble.getTreeData(v.data, "_id", false, function (v) {
                    v.label = v.fileoldname;
                });
                $scope.files = $scope.files.concat(d);
                bubble.sortBy($scope.files, "filetype", true);
                $scope.pathmap = ([[{ fileoldname: "全部文件", _id: { $oid: 0 } }, d]]);
                initFileBox();
            }

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
                        if (d[n].filetype == 1 || d[n].filetype == 2) {
                            $(d[n].ele).find(".fileicon").append("<img src='" + bubble.getInterface("upload.visible") + d[n].ThumbnailImage + "' width='100%' />").removeClass("icon2");
                        }
                    })(i)
                }
                filebox.append("<div class='clear-b'></div>");
            }

            var initFileList = function (p) {
                $scope.currentType = 0;
                scrollLoadEnable = false;
                bubble._call("file.pageBy", scrollLoadPage, 60, { isdelete: 0 }).success(function (v) {
                    if (!v.errorcode) {
                        scrollLoadEnable = !(v.data.length < 60);
                        initData(v);
                    }
                });
            }

            $scope.breadcrumbClick = function (idx) {
                $scope.pathmap.splice(idx + 1, $scope.pathmap.length);
                $scope.files = $scope.pathmap[$scope.pathmap.length - 1][1];
                initFileBox();
            }

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
            }

            $scope.check = function (v, e) {
                var type = e.target.tagName === "I" || e.target.tagName === "SPAN";
                if (type || v.filetype !== 0) {
                    //选择文件夹
                    $scope.$parent.fileControl.onSelect && $scope.$parent.fileControl.onSelect(v);
                } else {
                    //打开文件夹操作
                    $scope.pathmap[$scope.pathmap.length - 1][1].map(function (v) {
                        v.selected = false;
                    });
                    $scope.pathmap.push([v, v.children ? v.children : []]);
                    $scope.files = $scope.pathmap[$scope.pathmap.length - 1][1];
                    initFileBox();
                }
            }

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
                bubble._call("file.pageBy", scrollLoadPage, 100, v.type === 7 ? { isdelete: 1 } : { filetype: v.type }).success(function (v) {
                    if (!v.errorcode) {
                        scrollLoadEnable = !(v.length < 100);
                        initData(v);
                    }
                });
            }

            $scope.files = [
                // { name: "Photoshop CC 2015 绿色精简版", type: 1, selected: false },
                // { name: "ps", type: 1, selected: false },
            ];
            switch ($scope.type) {
                case undefined:
                    $scope.types = [
                        { name: "全部", selected: true, type: 0 },
                        { name: "图片", selected: false, type: 1 },
                        { name: "视频", selected: false, type: 2 },
                        { name: "文档", selected: false, type: 3 },
                        { name: "音频", selected: false, type: 4 },
                        { name: "其他", selected: false, type: 5 },
                        { name: "回收站", selected: false, type: 6 },
                    ];
                    break;
                case "image":
                    $scope.types = [
                        { name: "图片", selected: true, type: 1 },
                    ];
                    break;
                case "video":
                    $scope.types = [
                        { name: "视频", selected: true, type: 2 },
                    ];
                    break;
                case "doc":
                    $scope.types = [
                        { name: "文档", selected: true, type: 3 },
                    ];
                    break;
                case "audio":
                    $scope.types = [
                        { name: "音频", selected: true, type: 4 },
                    ];
                    break;
                case "other":
                    $scope.types = [
                        { name: "其他", selected: true, type: 5 },
                    ];
                    break;
                default:
                    $scope.types = [
                        { name: "全部", selected: true, type: 0 },
                        { name: "图片", selected: false, type: 1 },
                        { name: "视频", selected: false, type: 2 },
                        { name: "文档", selected: false, type: 3 },
                        { name: "音频", selected: false, type: 4 },
                        { name: "其他", selected: false, type: 5 },
                        { name: "回收站", selected: false, type: 6 },
                    ];
            }

            initFileList();

            $scope.closeUpload = function () {
                uploadBox.hide();
                $scope.openBtnVisible = true;
            }

            $scope.openUpload = function () {
                uploadBox.show();
                $scope.openBtnVisible = false;
            }

            var Upload = function () {
                var uploader = "";
                var box = $(".dialog-web-uploader");
                var _this = this;

                this.init = function () {
                    uploader = new window.WebUploader.Uploader({
                        auto: true,
                        swf: './js/modules/webuploader/Uploader.swf',
                        server: "",
                        pick: '#fileUploadPickerChose',
                    });
                    $("#fileUploadPicker>div[id^='rt_']").width($("#fileUploadPicker").width()).height($("#fileUploadPicker").height());
                    uploader.on("fileQueued", this.fileQueued);
                    uploader.on("uploadProgress", this.uploadProgress);
                    uploader.on("uploadSuccess", this.uploadSuccess);
                    uploader.on("uploadError", this.uploadError);
                    return this;
                }

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
                }

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
                }

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
                }

                this.uploadError = function (file, msg) {

                }
            }

            $timeout(function () {
                var upload = new Upload().init();
            });
        }]
    };
}]);