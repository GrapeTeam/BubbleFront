bubbleFrame.register('consultController', function ($scope, bubble, $modal, $http, $state, $sce) {
    // 
    $scope.gkList = [];
    $scope.title = $state.params.type == "3" ? "全部咨询" : $state.params.type == "0" ? "已提交咨询" : $state.params.type == "1" ? "待处理咨询" : "已回复咨询";
    $scope.par = $state.params.type == "3" ? undefined : [{
        field: "state",
        logic: "==",
        value: parseInt($state.params.type)
    }];
    //
    $scope.tableControl = {
        // title: [{ name: "公开", key: "gk", width: 60 }],
        // html: [$sce.trustAsHtml('<a class="btn btn-sm m-t-n-xs"><label class="i-checks"><input type="checkbox" value=""><i></i></label></a>')],
        // onClick: function (key, v, i, e) {
        //     var o = $(e.currentTarget).find("input")[0];
        //     o.checked = !o.checked;
        //     if (o.checked) {
        //         $scope.gkList.indexOf(v._id) < 0 && $scope.gkList.push(v._id);
        //     } else {
        //         for (var i = 0; i < $scope.gkList.length; i++) {
        //             var t = $scope.gkList[i];
        //             t == v._id && $scope.gkList.splice(i, 1) && i--;
        //         }
        //     }
        // },
        onColumnClick: function (key, v, i, p, s, t) {
            if (key == "slevel") {
                $scope.tableControl.loading(true);
                var slevel = v.slevel == 0 ? 1 : 0;
                bubble._call("suggest.slevel", v._id, {state: slevel}).success(function (rs) {
                    $scope.tableControl.loading(false);
                    if (rs.errorcode) {
                        swal("更新失败");
                        return;
                    }
                    v.slevel = slevel;
                });
            } else {
                openMessage(i);
            }
        },
        onPage: function (v) {
            $scope.list = v;
            $scope.gkList = [];
        }
    };
    var openMessage = function (i) {
        bubble.customModal("consultInfoModal.html", "consultInfoController", "lg", {
            data: $scope.list,
            index: i
        }, function (v) {

        });
    }

});

bubbleFrame.register("consultInfoController", function (bubble, items, $scope, $modalInstance, $timeout) {
    //
    $scope.stateText = ["已提交", "待处理", "已回复"];
    //
    var idx = items.index;
    $scope.data = items.data[idx];
    $scope.data.image && typeof $scope.data.image === 'string' && ($scope.data.image = $scope.data.image.split(","));
    $scope.data.video && typeof $scope.data.video === 'string' && ($scope.data.video = $scope.data.video.split(","));
    // console.log($scope.data);
    $scope.videoCurrent = 0;
    $scope.refresh = true;
    $scope.refreshVideo = true;
    $scope.video = "";
    $scope.image = "";

    var getFiles = function () {
        var list = items.data[idx].file ? items.data[idx].file.split(",") : [];
        for (var i = 0; i < list.length; i++) {
            var n = 0;
            while (items.data[idx]["attrFile" + n]) {
                if (list[i] == items.data[idx]["attrFile" + n].filepath) {
                    list[i] = {
                        name: items.data[idx]["attrFile" + n].fileoldname,
                        path: items.data[idx]["attrFile" + n].filepath
                    };
                    break;
                }
                n++;
            }
        }

        return list;
    };
    $scope.files = getFiles();
    //
    $scope.data.sreplyTime = $scope.data.sreplyTime && $scope.data.sreplyTime.indexOf("1970") < 0 ? new Date(parseInt($scope.data.replyTime)).Format("yyyy-MM-dd hh:mm:ss") : "";
    $scope.data.stime = new Date(parseInt($scope.data.time)).Format("yyyy-MM-dd hh:mm:ss");
    //
    var refreshVideo = function () {
        $scope.refreshVideo = false;
        $timeout(function () {
            $scope.refreshVideo = true;
        })
    };

    $scope.download = function () {
        window.open($scope.data.video[$scope.videoCurrent]);
    };

    $scope.videoleft = function () {
        $scope.videoCurrent > 0 && ($scope.videoCurrent-- , refreshVideo());
    };

    $scope.videoright = function () {
        $scope.videoCurrent < $scope.data.video.length - 1 && ($scope.videoCurrent++ , refreshVideo());
    };

    $scope.prev = function () {
        if (idx > 0) {
            $scope.data = items.data[--idx];
            $scope.data.image && typeof $scope.data.image === 'string' && ($scope.data.image = $scope.data.image.split(","));
            $scope.data.video && typeof $scope.data.video === 'string' && ($scope.data.video = $scope.data.video.split(","));
            $scope.videoCurrent = 0;
            refreshVideo();
        } else {
            swal("这是最后一条咨询记录了");
        }
    };

    $scope.next = function () {
        if (idx < items.data.length - 1) {
            $scope.data = items.data[++idx];
            $scope.data.image && typeof $scope.data.image === 'string' && ($scope.data.image = $scope.data.image.split(","));
            $scope.data.video && typeof $scope.data.video === 'string' && ($scope.data.video = $scope.data.video.split(","));
            $scope.videoCurrent = 0;
            refreshVideo();
        } else {
            swal("这是最后一条咨询记录了");
        }
    };

    $scope.ok = function () {
        bubble.customModal("replyConsultInfoModal.html", "replyConsultInfoController", "lg", {_id: $scope.data._id}, function (v) {
            $scope.data.state = "已反馈";
            $scope.data.reason = v[0];
            $scope.data.reasonTime = new Date().Format("yyyy-MM-dd hh:mm:ss");
            // console.log($scope.data.reason);
            // $scope.data.star = v[1];
            swal("反馈成功");
            idx < items.data.length - 1 ? $scope.next() : $modalInstance.close("123");
        });
    };

    $scope.cancel = function () {
        $modalInstance.dismiss("");
    }
});

bubbleFrame.register('replyConsultInfoController', function ($scope, $modalInstance, items, bubble, $compile, $timeout) {
    $scope.rate = 7;
    $scope.max = 10;
    $scope.isReadonly = false;

    $scope.hoveringOver = function (value) {
        $scope.overStar = value;
        $scope.percent = 100 * (value / $scope.max);
    };
    $scope.content = "";
    $scope.value = "1";
    $scope.kick = items.kick;

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
        var html = editor.html();
        if (!html) {
            swal("反馈内容不可为空");
            return;
        }

        bubble.toggleModalBtnLoading(e, true);
        //
        html = bubble.replaceBase64(html);
        bubble._call("suggest.reply", items._id, {replyContent: html}).success(function (v) {
            if (!v.errorcode) {
                $modalInstance.close([html, $scope.rate]);

            } else {
                bubble.toggleModalBtnLoading(e, false);
                swal("回复失败");
            }
        })
        // $modalInstance.close([html, $scope.rate]);
    };

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});