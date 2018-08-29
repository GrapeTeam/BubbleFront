bubbleFrame.register('verifyController', function ($scope, bubble, $timeout, $sce, $state) {
    $scope.state = $state.params.state;
    $scope.pnew = null;
    $scope.tableControl = {
        title: [{name: "操作", key: "gk", width: 190}],
        html: [$sce.trustAsHtml('<button class="btn btn-sm m-r-sm btn-default okbtn">审核通过</button><button class="btn btn-sm btn-default">审核拒绝</button>')],
        onClick: function (key, v, i, e, p, s, t) {
            $scope.tableControl.loading(true);
            if ($(e.target).hasClass("okbtn")) {
                $scope.confirm(v);
            } else {
                $scope.refuse(v);
            }
        },
        onColumnClick: function (key, v, i, e, p, s, t) {
            $scope.preview(v);
        },
    };

    $scope.tableControl1 = {
        onColumnClick: function (key, v, i, e, p, s, t) {
            $scope.preview(v);
        },
    };

    var loading = function (v) {
        v ? $(".contentbatchMask").fadeIn(200) : $(".contentbatchMask").fadeOut(200);
    };

    $scope.confirm = function (v, e) {
        bubble._call("content.review", v._id).success(function (v) {
            if (!v.errorcode) {
                swal("操作成功");
            } else {
                swal(v.message);
            }
            $scope.tableControl.reload();
        });
    };

    $scope.refuse = function (v, e) {
        bubble._call("content.refuse", v._id).success(function (v) {
            if (!v.errorcode) {
                swal("操作成功");
            } else {
                swal(v.message);
            }
            $scope.tableControl.reload();
        });
    };

    $scope.preview = function (v) {
        var box = $(".push-preview");
        var d = v ? v : $scope.newItem;
        box.find("h3").html(d.mainName);
        box.find(".content-info").html("").append('<span> 来源: ' + d.souce + ' </span><span> 发布时间：' + d.time + ' </span><span> 作者：' + d.author + ' </span>');
        box.find(".content").html(d.content);
        box.find(".tipsbox").hide();
        box.find(".preview-box").show();
    }
});