bubbleFrame.register('questionController', function ($scope, bubble, $timeout, $compile) {
    $scope.current = "";
    $scope.currentOption = "";
    $scope.answer = "";

    $scope.tableControl = {
        editFn: function (id, v, fn) {
            bubble._call("question.update", id, bubble.replaceBase64(JSON.stringify(v))).success(function (v) {
                fn(v.type);
            });
        },
        addFn: function (v, fn) {
            v.type = parseInt(v.type);
            bubble._call("question.add", bubble.replaceBase64(JSON.stringify(v))).success(function (v) {
                fn(v);
            });
        },
        onColumnClick: function (k, v, o, i, f) {
            if (k == "options") {
                $scope.current = v;
                $scope.currentOption = v.options ? JSON.parse(v.options) : [];
                $scope.answer = v.answer.split(",");
                for (var n = 0; n < $scope.currentOption.length; n++) {
                    $scope.currentOption[n].select = $scope.answer.indexOf($scope.currentOption[n].id) >= 0;
                }
                $scope.modalVisible = true;
                return false;
            }
            if (k == "answer" && (v.type == 0 || v.type == 1)) {
                return false;
            }
        }
    };

    $scope.modalConfirm = function () {
        var answers = [];
        var o = "";
        if ($scope.current.type == 0) {
            o = $("input[name='iteminput']:checked");
            o.length && answers.push(o.val());
        }
        if ($scope.current.type == 1) {
            o = $("input[type='checkbox']:checked");
            o.each(function () {
                answers.push($(this).val());
            });
        }
        if (!answers.length) {
            swal("请至少选择一个答案");
            return;
        }
        bubble.loading(true);
        bubble._call("question.update", $scope.current._id, bubble.replaceBase64(JSON.stringify({
            options: JSON.stringify($scope.currentOption),
            answer: answers.join(",")
        }))).success(function (v) {
            if (!v.errorcode) {
                $scope.current.options = JSON.stringify($scope.currentOption);
                $scope.current.answer = answers.join(",");
                $scope.modalVisible = false;
                swal("修改成功");
            } else {
                swal("修改失败");
            }
            bubble.loading(false);
        });
    };

    $scope.moveup = function (v, i) {
        if (i == 0) {
            return;
        }
        var tmp = $scope.currentOption[i];
        $scope.currentOption[i] = $scope.currentOption[i - 1];
        $scope.currentOption[i - 1] = tmp;
    };

    $scope.movedown = function (v, i) {
        if (i == $scope.currentOption - 1) {
            return;
        }
        var tmp = $scope.currentOption[i];
        $scope.currentOption[i] = $scope.currentOption[i + 1];
        $scope.currentOption[i + 1] = tmp;
    };

    $scope.remove = function (v) {
        for (var i = 0; i < $scope.currentOption.length; i++) {
            var element = $scope.currentOption[i];
            if (element === v) {
                $scope.currentOption.splice(i, 1);
            }
        }
    };

    $scope.add = function () {
        $scope.currentOption.push({id: $scope.currentOption.length, name: "选项" + $scope.currentOption.length});
    };

    $scope.modalVisible = false;
});