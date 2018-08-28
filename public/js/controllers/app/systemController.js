bubbleFrame.register('systemController', function ($scope, bubble, $modal, $http, $stateParams, $timeout) {
    var editor = KindEditor.create('#editor_id', {
        items: [
            'source', '|', 'undo', 'redo', '|', 'justifyleft', 'justifycenter', 'justifyright',
            'justifyfull', 'insertorderedlist', 'insertunorderedlist', 'indent', 'outdent', 'subscript',
            'superscript', 'clearhtml', 'quickformat', 'selectall', '|',
            'formatblock', 'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold',
            'italic', 'underline', 'strikethrough', 'fullscreen'
        ],
        height: 400
    });

    (function () {
        var uploaderdnd = new WebUploader.Uploader({
            auto: true,
            swf: './js/modules/webuploader/Uploader.swf',
            server: bubble.getUploadServer(),
            dnd: editor.edit.doc.body,
            disableGlobalDnd: true,
            accept: {
                title: 'Images',
                extensions: 'gif,jpg,jpeg,bmp,png',
                mimeTypes: 'image/gif,image/jpg,image/jpeg,image/bmp,image/png'
            },
        });

        uploaderdnd.on("error", function (v, file) {
            if (v === "Q_TYPE_DENIED") {
                swal("上传的文件中包含了不支持的文件格式", file.name);
            }
            if (v === "F_DUPLICATE") {
                swal("该文件已上传过", file.name);
            }
        });
        uploaderdnd.on("uploadProgress", function (file, percentage) {
            $(".uploaderdnd .bg-success").width((percentage.toFixed(2) * 100) + "%");
        });
        uploaderdnd.on("uploadSuccess", function (file, v) {
            editor.appendHtml("<img src='" + bubble.getInterface("upload").visible + v.filepath.replace(/\\/g, "/") + "' />");
            $(".uploaderdnd .bg-success").width(0);
        });
    })();

    var id = window.localStorage.siteid;
    var tmpInfo = {};
    $scope.siteInfo = {};
    $scope.isActive = false;
    $scope.value = 0;
    bubble._call("site.find", {_id: id}).success(function (v) {
        v[0].thumbnail = v[0].thumbnail ? v[0].thumbnail.replace(/\\/g, "/") : "";
        $scope.siteInfo = JSON.parse(JSON.stringify(v[0]));
        tmpInfo = JSON.parse(JSON.stringify(v[0]));
        editor.html($scope.siteInfo.suffix);
    });

    $scope.confirm = function (e) {
        $scope.siteInfo.suffix = editor.html();
        var p = JSON.stringify($scope.siteInfo);
        if (p === JSON.stringify(tmpInfo) || $(e.currentTarget).hasClass("data-loading")) {
            return;
        }
        $(e.currentTarget).addClass("data-loading");
        p = JSON.parse(p);
        p.thumbnail = bubble.replaceSymbol(p.thumbnail);
        p.suffix = bubble.replaceBase64(p.suffix);
        bubble._call("site.update", id, p).success(function (v) {
            v.errorcode ? swal(v.message) : swal("修改成功");
            $(e.currentTarget).removeClass("data-loading");
        });
    };

    $scope.review = function () {
        if (tmpInfo)
            $scope.siteInfo = JSON.parse(JSON.stringify(tmpInfo));
    };

    //文档上传
    var Upload = function () {
        var uploader = "";
        var box = $(".dialog-web-uploader");
        var _this = this;

        this.init = function () {
            uploader = new WebUploader.Uploader({
                auto: true,
                swf: './webuploader/Uploader.swf',
                server: bubble.getUploadServer(),
                pick: '#uploadPicker',
            });
            uploader.addButton('#wordUploadPicker');
            uploader.on("uploadProgress", this.uploadProgress);
            uploader.on("uploadSuccess", this.uploadSuccess);
            return this;
        };

        this.uploadProgress = function (file, percentage) {
            $scope.value = percentage;
            $scope.isActive = true;
            bubble.updateScope($scope);
        };

        this.uploadSuccess = function (file, v) {
            $scope.siteInfo.thumbnail = bubble.getInterface("upload").visible + v.filepath;
            $scope.value = 0;
            $scope.isActive = false;
            bubble.updateScope($scope);
        }
    };

    var upload = new Upload().init();
});