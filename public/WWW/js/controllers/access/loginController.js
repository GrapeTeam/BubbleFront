bubbleFrame.register('loginController', function ($timeout, $scope, bubble, $state, $rootScope, $localStorage) {
    var isAjax = false;
    $scope.user = {};
    if ($localStorage.logininfo) {
        var tmp = JSON.parse($localStorage.logininfo);
    }
    $scope.login = function () {
        if (isAjax) {
            return;
        }
        isAjax = true;
        if (!$scope.user.username || !$scope.user.password) {
            swal("用户名密码不可为空");
        }
        var p = {password: $scope.user.password};
        if (bubble.isEmail($scope.user.username)) {
            p.email = $scope.user.username;
            p.loginmode = 0;
        }
        if (bubble.isMobile($scope.user.username)) {
            p.mobphone = $scope.user.username;
            p.loginmode = 2;
        }
        if (p.mode === undefined) {
            p.id = $scope.user.username;
            p.loginmode = 0;
        }
        $("button[type='submit']").html("登陆中...");
        bubble._call("user.login", p).success(function (v) {
            if (v && !v.errorcode) {
                v.expiretime = Date.parse(new Date());
                $localStorage.logininfo = JSON.stringify(v);
                window.logininfo = v;
                $rootScope.logininfo = v;
                $state.go("app.content");
                window.localStorage.sitename = v.webinfo[0].wbname;
                window.localStorage.siteid = v.webinfo[0].wbid;
                window.localStorage.sitewbgid = v.webinfo[0].wbgid;
                bubble._call("site.switch", v.webinfo[0].wbid).success(function (rs) {
                    if (rs.errorcode) {
                        $state.go("access.login");
                        swal("获取网站信息失败");

                    }
                });
            } else {
                isAjax = false;
                swal(v && v.message ? v.message : "登录失败");
                $("button[type='submit']").html("登 陆");
            }
        });
    };
    bubble.clearCache();
});