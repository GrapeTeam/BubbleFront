bubbleFrame.register('questionIndexController', function ($scope, bubble, $timeout, $compile, $state) {
    $scope.currentQs = [];
    $scope.quesitionList = [];
    $scope.modalVisible = false;
    $scope.tableControl = {
        editFn: function (id, v, fn) {
            bubble._call("questionnaire.update", id, bubble.replaceBase64(JSON.stringify(v))).success(function (v) {
                fn(v);
            });
        },
        title: [{name: "题目列表", key: "sl", width: 110}, {name: "查看结果", key: "result", width: 110}],
        html: ['<a class="btn btn-sm m-t-n-xs"><i class="fa fa-navicon"></i></a>', '<a class="btn btn-sm m-t-n-xs"><i class="fa fa-search"></i></a>'],
        onClick: function (key, v) {
            if (key == "result") {
                $state.go("app.questionnaire.questionanswer", {qid: v._id});
                return;
            }
            $scope.modalVisible = true;
            $scope.current = v;
            $scope.currentQs = v.questionIds;
            for (var i = 0; i < $scope.currentQs.length; i++) {
                if ($scope.currentQs[i].options && typeof $scope.currentQs[i].options === 'string')
                    $scope.currentQs[i].options = JSON.parse($scope.currentQs[i].options);
            }
            bubble._call("question.getall").success(function (v) {
                $scope.quesitionList = v;
            });
        }
    };

    $scope.modalConfirm = function () {
        if (!$scope.currentQs.length) {
            swal("请至少选择一道题");
            return;
        }
        var ids = $scope.currentQs.map(function (v) {
            return v._id;
        });
        bubble.loading(true);
        bubble._call("questionnaire.update", $scope.current._id, bubble.replaceBase64(JSON.stringify({
            questionIds: ids.join(","),
            questionNum: ids.length
        }))).success(function (v) {
            if (!v.errorcode) {
                $scope.current.questionIds = $scope.currentQs;
                $scope.current.questionNum = ids.length;
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
        var tmp = $scope.currentQs[i];
        $scope.currentQs[i] = $scope.currentQs[i - 1];
        $scope.currentQs[i - 1] = tmp;
    };

    $scope.movedown = function (v, i) {
        if (i == $scope.currentQs - 1) {
            return;
        }
        var tmp = $scope.currentQs[i];
        $scope.currentQs[i] = $scope.currentQs[i + 1];
        $scope.currentQs[i + 1] = tmp;
    };

    $scope.remove = function (v) {
        for (var i = 0; i < $scope.currentQs.length; i++) {
            var element = $scope.currentQs[i];
            if (element === v) {
                $scope.currentQs.splice(i, 1);
            }
        }
    };

    $scope.add = function (v) {
        for (var i = 0; i < $scope.currentQs.length; i++) {
            if ($scope.currentQs[i]._id == v._id) {
                swal("该题目已添加");
                return;
            }
        }
        if (v.options && typeof v.options === 'string')
            v.options = JSON.parse(v.options);
        $scope.currentQs.push(v);
    }
});

bubbleFrame.register('questionIndexCreateController', function (bubble, items, $scope, $modalInstance, $timeout) {
    $scope.value = {
        startTime: new Date().Format("yyyy-MM-dd hh:mm:ss"),
        endTime: new Date().Format("yyyy-MM-dd hh:mm:ss"),
        questionNum: 0
    };

    $scope.ok = function (e) {
        if (!$scope.value.name) {
            swal("请输入问卷名称");
            return;
        }
        bubble.toggleModalBtnLoading(e, true);

        var p = JSON.parse(JSON.stringify($scope.value));
        p.startTime = Date.parse(new Date(p.startTime));
        p.endTime = Date.parse(new Date(p.endTime));

        bubble._call("questionnaire.add", bubble.replaceBase64(JSON.stringify(p))).success(function (v) {
            if (!v.errorcode) {
                p.createTime = Date.parse(new Date());
                $modalInstance.close(p);
            } else {
                bubble.toggleModalBtnLoading(e, false);
                swal(v.message);
            }
        });
    };

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});