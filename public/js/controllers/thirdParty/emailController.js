'use strict';
bubbleFrame.register('emailController', function ($scope, bubble) {
    $scope.tableControl = {
        title: [{name: "发送消息", key: "ss", width: 30}],
        html: ['<a class="btn btn-sm m-t-n-xs"><i class="fa  fa-send"></i></a>'],
        onClick: function (key, v) {
            sendMessage(v);
        }
    };

    var sendMessage = function () {
        bubble.customModal("EmailSendModal.html", "EmailSendController", "lg", {}, function (v) {

        });
    };

    var active = function () {
        bubble.customModal("EmailActiveModal.html", "EmailActiveController", "lg", {}, function (v) {

        });
    }
});

bubbleFrame.register('EmailSendController', function ($scope, bubble, items, $modalInstance, $timeout, $localStorage) {
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.ok = function (e) {
        if (!($scope.value.content && $scope.value.subject && $scope.value.to)) {
            swal("内容不可为空");
            return;
        }
        bubble.toggleModalBtnLoading(e, true);
        bubble._call("email.send", JSON.parse($localStorage.logininfo).ownid, $scope.value).success(function (v) {
            if (!v.errorcode) {
                $modalInstance.close();
                swal("发送成功");
            } else {
                bubble.toggleModalBtnLoading(e, false);
                swal("发送失败");
            }
        });
    }
});