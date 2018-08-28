bubbleFrame.register('userController', function ($scope, $timeout, bubble, $http, $modal) {
    $scope.users = [];
    $scope.visible = ["name", "mobphone"];
    $scope.data = [];
    $scope.isajax = false;

    $scope.tableControl = {
        // title: [{ name: "访问统计", key: "sl", width: 90 }],
        // html: ['<a class="btn btn-sm m-t-n-xs"><i class="fa fa-navicon"></i></a>'],
        // onClick: function (key, v) {
        //     info.show(v._id);
        // }
    };

    $scope.closeInfo = function () {
        info.hide();
    };

    var Info = function () {
        var _this = this;
        var box = $(".user-record-wrap");
        var listbox = box.find(".item-wrap");

        this.init = function () {
            this.initEvent();
            return this;
        };

        this.initEvent = function () {
            box.unbind("click").click(function (e) {
                if (e.target === e.currentTarget) {
                    box.fadeOut(200);
                }
            });
        };

        this.show = function (v) {
            this.getData(v);
            box.fadeIn(200);
        };

        this.hide = function () {
            box.fadeOut(200);
        };

        this.getData = function (v) {
            $scope.isajax = true;
            var count = 0;
            bubble._call("count.group", "undefined", "VisitRecord_13", [{
                "field": "uid",
                "logic": "==",
                "value": v
            }], "uid", "count", "oid", "0").success(function (v) {
                $scope.data = v.record.data;
                $scope.data.forEach(function (x, i) {
                    bubble._call("content.pageBy", 1, 10, [{
                        "field": "_id",
                        "logic": "==",
                        "value": x._id
                    }]).success(function (rs) {
                        $scope.data[i].content = rs.data[0] ? rs.data[0] : "";
                        if (++count == $scope.data.length) {
                            $scope.isajax = false;
                        }
                    })
                });
            });
        }
    };
    var info = new Info().init();
});