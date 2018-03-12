angular.module('app')
    .directive('getData', ['$http', 'bubble', function ($http, bubble) {
        return {
            restrict: 'A',
            compile: function (tel, attrs) {
                bubble
                return function (scope, el, attr) {
                    var form = $(".btn-addon").parent();
                    var btn = $(".btn-addon");
                    var p1 = { data: JSON.stringify({ controller: "zhcs", action: "getkey", guid: "12312313131", parameter: { key: attr.getData } }) };
                    $http({
                        method: 'post',
                        url: 'http://59.203.206.28:8001/api/index',
                        data: p1
                    }).success(function (v) {
                        try {
                            v = JSON.parse(v.data);
                            if(v.length){
                                v[0].VALUE = JSON.parse(v[0].VALUE);
                                for (var tmp in v[0].VALUE) {
                                    form.find("input[name='" + tmp + "']").val(v[0].VALUE[tmp])
                                }
                            }
                            btn.find("i").addClass("none");
                        } catch (e) {
                            btn.find("i").addClass("none");
                            // alert("数据加载失败");
                        }
                    }).error(function (v) {
                        btn.find("i").addClass("none");
                    });


                    btn.unbind("click").click(function () {
                        var _this = this;
                        $(this).find("i").removeClass("none");
                        var check = true;
                        var tmp = {};
                        $(this).parent().find("input").each(function () {
                            if (!this.name) {
                                check = false;
                                return false;
                            }
                            tmp[this.name] = $(this).val();
                        })

                        if (!check) {
                            alert("缺少name");
                            return;
                        }

                        var p = { data: JSON.stringify({ controller: "zhcs", action: "setkey", guid: "12312313131", parameter: { key: $(this).attr("get-data"), value: JSON.stringify(tmp) } }) };
                        // $http.post("http://59.203.206.28:8001/api/index", p).success(function (v) {
                        //     alert("添加成功");
                        //     $(_this).find("i").addClass("none");
                        // }).error(function (v) {
                        //     alert("添加失败");
                        //     $(_this).find("i").addClass("none");
                        // });
                        $http({
                            method: 'post',
                            url: 'http://59.203.206.28:8001/api/index',
                            data: p
                        }).success(function (v) {
                            alert("添加成功");
                            $(_this).find("i").addClass("none");
                        }).error(function (v) {
                            alert("添加失败");
                            $(_this).find("i").addClass("none");
                        });
                    })
                }
            }
        };
    }]);