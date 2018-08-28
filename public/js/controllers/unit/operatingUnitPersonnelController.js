'use strict';
bubbleFrame.register('operatingUnitPersonnelController', function ($scope, bubble) {
    var advbox = $(".adv-item-box");
    $scope.advs = [];

    $scope.fileControl = {
        onSelect: function (v) {

        }
    };

    // $scope.tableControl = {
    //     title: [{ name: "详情", key: "sl", width: 30 }],
    //     html: ['<a class="btn btn-sm m-t-n-xs"><i class="fa fa-navicon"></i></a>'],
    //     onClick: function (key, v) {
    //         $scope.showAdv(v);
    //     }
    // }

    $scope.colors = ["bg-primary lter", "bg-info", "bg-success dk", "bg-warning dk", "bg-danger lter", "bg-primary dk"];

    $scope.closeAdv = function () {
        advbox.fadeOut(200);
        $scope.advs = [];
    };

    $scope.showAdv = function (v) {
        bubble._call("person.pageBy", 1, 100, {adsid: v._id}).success(function (v) {
            $scope.advs = v.errorcode ? [] : v.data;
            advbox.fadeIn(200);
        });
    };

    $scope.editAdv = function (v) {
        bubble.customModal("personCreate.html", "personEditController", "lg", {
            fileControl: $scope.fileControl,
            data: v
        }, function (rs) {
            v.adname = rs.adname;
            v.adtype = rs.adtype;
            v.imgURL = rs.imgURL;
        });
    };

    $scope.deleteAdv = function (v) {
        console.log(v);
    }

    // $scope.create = function () {
    //     bubble.customModal("personCreate.html", "personCreateController", "lg", { fileControl: $scope.fileControl }, function (v) {

    //     });
    // }
});

bubbleFrame.register('personCreateController', function ($scope, bubble, items, $modalInstance) {
    $scope.fileControl = items.fileControl;

    $scope.open = function () {
        $scope.fileControl.open();
    };

    $scope.fileControl.onSelect = function (v) {
        $scope.imgURL = v.filepath;
        $scope.fileControl.close();
    };

    $scope.value = {adtype: "0"};

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});

bubbleFrame.register('personEditController', function ($scope, bubble, items, $modalInstance) {
    $scope.title = "人事编辑";
    $scope.fileControl = items.fileControl;

    $scope.open = function () {
        $scope.fileControl.open();
    };

    $scope.fileControl.onSelect = function (v) {
        $scope.value.imgURL = v.filepath;
        $scope.fileControl.close();
    };

    $scope.value = JSON.parse(JSON.stringify(items.data));

    $scope.ok = function (e) {
        bubble.toggleModalBtnLoading(e, true);
        bubble._call("person.update", items.data._id, {
            adname: $scope.value.adname,
            adtype: $scope.value.adtype,
            imgURL: $scope.value.imgURL
        }).success(function (v) {
            if (!v.errorcode) {
                $modalInstance.close($scope.value);
            } else {
                bubble.toggleModalBtnLoading(e, false);
                swal("编辑失败");
            }
        });
    };

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});