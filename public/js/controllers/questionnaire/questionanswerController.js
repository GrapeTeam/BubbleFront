bubbleFrame.register('questionanswerController', function ($scope, bubble, $timeout, $compile, $state) {
    $scope.par = $state.params.qid ? [{field: "qid", logic: "=", value: $state.params.qid}] : "";
    $scope.tableControl = {
        onPage: function (v) {
            for (var i = 0; i < v.length; i++) {
                var tmp = v[i].result ? JSON.parse(v[i].result) : {};
                v[i].wrongCount = isNaN(tmp.wrongCount) ? "暂无" : tmp.wrongCount;
                v[i].anserCount = isNaN(tmp.anserCount) ? "暂无" : tmp.anserCount;
                v[i].pendCount = isNaN(tmp.pendCount) ? "暂无" : tmp.pendCount;
                v[i].rightCount = isNaN(tmp.rightCount) ? "暂无" : tmp.rightCount;
            }
        }
    }
});