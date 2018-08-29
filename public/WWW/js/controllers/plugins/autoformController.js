bubbleFrame.register('autoformController', function ($scope, bubble, $timeout) {
    /** TempData
     * {
            "name": "123",
            "text": "123",
            "array": ["123", "123"],
            "json": {
                "new": "123",
                "sss": "123",
                "fds": ["14243", "346534"]
            }
        }
     */
    var watchFn = function (n, o) {
        if (Object.getOwnPropertyNames(n).length)
            $scope.text = JSON.stringify(n, null, 4);
    };

    $scope.visible = false;
    $scope.value = {};
    $scope.text = "";
    $scope.textChange = function () {
        try {
            $scope.value = JSON.parse($scope.text);
            $scope.visible = true;
            $scope.$watch("value", watchFn, true);
        } catch (e) {
            $scope.visible = false;
        }
    };

    $scope.field = {
        name: {
            data: "s:",
            mark: "名称",
            edit: true,
            visible: false
        },
        text: {
            data: "select:123|UTF-8|GBK",
            mark: "文字",
            edit: true,
            visible: false
        },
        array: {
            data: "array-s:",
            mark: "列表",
            edit: true,
            visible: false
        },
        json: {
            data: "json:",
            mark: "对象",
            edit: true,
            visible: false,
            field: {
                new: {
                    data: "s:",
                    mark: "文字2",
                    edit: true,
                    visible: false
                },
                sss: {
                    data: "s:",
                    mark: "文字3",
                    edit: true,
                    visible: false
                },
                fds: {
                    data: "array-s:",
                    mark: "文字4",
                    edit: true,
                    visible: false
                },
            }
        },
    }
});