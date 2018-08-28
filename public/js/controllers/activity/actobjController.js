(function () {
    var eid = "";
    bubbleFrame.register('actobjController', function ($scope, bubble, $modal, $http, $stateParams, $timeout) {
        eid = $stateParams.eid;
        var tid = $stateParams.tid;
        $scope.tableControl = {
            pageFn: function (p, s, cb) {
                var fn = function (v) {
                    var tmp = "";
                    for (var i = 0; i < v.data.length; i++) {
                        v.data[i].type = v.data[i].tid.name;
                        v.data[i].tid = v.data[i].tid.attr;
                    }
                    cb(v);
                };
                if (tid) {
                    bubble._call("actobj.pages", eid, tid, p, s).success(fn);
                } else {
                    bubble._call("actobj.page", eid, p, s).success(fn);
                }
            },
            deleteFn: function (ids, cb) {
                bubble._call("actobj.delete", eid, ids).success(function (v) {
                    cb(v);
                });
            },
            editFn: function (id, value, cb) {
                value = typeof value === "string" ? JSON.parse(value) : value;
                value.number = parseInt(value.number);
                value.state = parseInt(value.state);
                value.voteCnt = parseInt(value.voteCnt);
                value.vCnt = parseInt(value.vCnt);
                bubble._call("actobj.update", eid, id, bubble.replaceBase64(JSON.stringify(value))).success(function (v) {
                    cb(v);
                });
            },
            title: [{name: "对象详情", key: "sl", width: 90}],
            html: ['<a class="btn btn-sm m-t-n-xs"><i class="fa fa-navicon"></i></a>'],
            onClick: function (key, v) {
                bubble.customModal("voteinfo.html", "voteController", "lg", v, function (rs) {
                    v.state = 0;
                });
            }
        }
    });

    bubbleFrame.register('voteController', function ($scope, $modalInstance, items, bubble, $timeout) {
        items.attr = typeof items.attr === "string" ? JSON.parse(items.attr) : items.attr;
        $scope.type = items.type;
        $scope.state = items.state;
        $scope.name = items.name;
        $scope.url = bubble.getInterface("upload").visible + (items.attr.path || items.attr.content);
        $scope.flg = $scope.url.split(".").pop();
        $scope.content = items.attr.content;

        $scope.download = function () {
            window.open($scope.url);
        };

        $scope.ok = function (e) {
            $(e.currentTarget).addClass("data-loading");
            bubble._call("actobj.update", eid, items._id, bubble.replaceBase64(JSON.stringify({state: 0}))).success(function (v) {
                $modalInstance.close(v);
            });
        };

        $scope.cancel = function (e) {
            $modalInstance.dismiss('cancel');
        }
    });

    bubbleFrame.register('actobjCreate', function ($scope, $modalInstance, items, bubble, $timeout) {
        $scope.value = {eid: eid, time: 0, voteCnt: 0, vCnt: 0, state: 0, eid: eid, tid: "", attr: {}, number: 0};
        $scope.type = "";
        var typeLit = {
            content: "59c7566f9c93690f5a9a6233",
            video: "59c74a4ac6c2040ec4c08f9c"
        };

        $timeout(function () {
            var fileCount = 0;
            var uploader = new WebUploader.Uploader({
                auto: true,
                swf: './js/modules/webuploader/Uploader.swf',
                server: bubble.getUploadServer(),
                pick: '#actobjcreateupload',
                accept: {
                    title: 'video',
                    extensions: 'mp4,mov,ogg,avi',
                    mimeTypes: 'video/mp4,video/mov,video/ogg,video/avi'
                },
            });

            uploader.on("error", function (v, file) {
                if (v === "Q_TYPE_DENIED") {
                    swal("上传的文件中包含了不支持的文件格式", file.name);
                }
                if (v === "F_DUPLICATE") {
                    swal("该文件已选择过", file.name);
                }
            });

            uploader.on("uploadProgress", function (file, percentage) {
                $(".actobj-create-upload-process").width(percentage * 100 + "%");
            });

            uploader.on("uploadSuccess", function (file, v) {
                $(".actobj-create-upload").html("").append("<img width='100%' height='100%' src='" + (bubble.getInterface("upload").visible + v.ThumbnailImage).replace("\\", "/") + "'/>");
                $(".actobj-create-upload-process").width(0);
                $scope.value.attr.path = v.filepath;
                $scope.value.attr.thumb = v.ThumbnailImage;
            });
        });

        for (var tmp in items.scope.selectPar) {
            $scope.value[tmp] = items.scope.selectPar[tmp];
        }

        var cb = function (v) {
            if (v.errorcode) {
                swal(v.message);
                $modalInstance.dismiss('cancel');
            } else {
                $modalInstance.close(v.message ? v.message : v);
            }
        };

        $scope.ok = function (e) {
            $(e.currentTarget).addClass("data-loading");
            if ($scope.type == "content") {
                delete $scope.value.attr.path;
                delete $scope.value.attr.thumb;
            } else {
                delete $scope.value.attr.content;
            }
            $scope.value.owner = window.logininfo._id;
            $scope.value.tid = typeLit[$scope.type];
            $scope.value.attr = JSON.stringify($scope.value.attr);
            bubble._call("actobj.add", eid, bubble.replaceBase64(JSON.stringify($scope.value))).success(function (v) {
                cb(v);
            });
        };

        $scope.cancel = function (e) {
            $modalInstance.dismiss('cancel');
        }
    });
})();