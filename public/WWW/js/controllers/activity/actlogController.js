bubbleFrame.register('actlogController', function ($scope, bubble, $modal, $http, $stateParams, $timeout) {
    $scope.tableControl = {
        pageFn: function (p, s, cb) {
            bubble._call("actlog.page", $stateParams.eid, p, s).success(function (v) {
                cb(v);
            });
        }
    }
});