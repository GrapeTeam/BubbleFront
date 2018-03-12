import angular from "angular";
import app from "../../main";
import $ from "jquery";

var html = `<div class="col w-md w-auto-xs bg-light lter b-r navbox iconbox">
                <div class="subnav-top b-b">{{title}}<a class="pull-right btn btn-sm btn-info m-t-md m-r-sm" ng-click="modeChange()">{{mode ? '退出' : '编辑'}}</a></div>
                <div class="offset-box">
                    <div class="static-box">
                        <a class="subnav-item hover-color hover-anchor pos-rlt" ng-click="groupClick(item, $index)" ng-class="item.selected ? 'active' : ''"
                            ng-repeat="item in list">
                            {{item.name}}
                            <span ng-if="item.children" ng-click="groupNextClick($event, item, $index)" class="pull-right hover-action"><i class="fa fa-angle-double-right"></i></span>
                        </a>
                    </div>
                    <div class="offset-navbox" ng-repeat="levelitem in level" ng-style="{left: $index + 1 + '00%'}">
                        <a class="subnav-item hover-color hover-anchor pos-rlt" ng-click="groupClick(item, $index)" ng-class="item.selected ? 'active' : ''"
                            ng-repeat="item in levelitem">
                            {{item.name}}
                            <span ng-if="item.children" ng-click="groupNextClick($event, item, $index)" class="pull-right hover-action"><i class="fa fa-angle-double-right"></i></span>
                        </a>
                    </div>
                </div>
            </div>`
app.directive('treenav', [function () {
    return {
        restrict: 'AE',
        scope: {
            title: '@',
            breadcrumb: '=',
            list: '=',
            btn: '='
        },
        replace: true,
        template: html,
        controller: ["$scope", "bubble", "$compile", function ($scope, bubble, $compile) {
            if (!$scope.$parent.treeNav) {
                throw new Error("treeNav对象不存在，请在controller中定义treeNav对象");
            }
            var Slide = function () {
                var box = $(".navbox.iconbox .offset-box");
                var current = 0;
                var size = 0;

                this.next = function () {
                    this.slideTo(++current);
                }

                this.prev = function () {
                    this.slideTo(--current);
                }

                this.slideTo = function (i) {
                    var f = current > i;    //true <-  false ->
                    current = i;
                    current == 0 ? (box.find(".offset-navbox").hide(), box.find(".static-box:first").show())
                        : (box.find(".offset-navbox,.static-box:first").hide(), box.find(".offset-navbox:eq(" + (f ? i - 1 : i + 1) + ")").show());
                    box.css("transform", "translateX(-" + current + "00%)");
                }
            }

            var slide = new Slide();
            var currentLevel = 0;
            var currentLevelIdx = [0];
            var pobj = $scope.$parent.treeNav;
            $scope.level = [];
            $scope.mode = false;

            if($scope.btn){
                $(".navbox.iconbox .subnav-top").append($compile($scope.btn)($scope));
            }

            var getCurrentGroup = function () {
                return $scope.list[currentLevelIdx[currentLevel]];
            }

            var getCurrentLevel = function () {
                return $scope.level[$scope.level.length - 1][currentLevelIdx[currentLevel]];
            }

            //预留函数,任何站群改变都触发该方法
            var groupChange = function (v) {
                //根据ID获取数据填充表格
                // bubble._call("site.page", { wbgid: v.wbgid }).success(function (v) {

                // });
            }

            var updateBreadcrumb = function (idx) {
                var rs = [];
                rs.push($scope.list[currentLevelIdx[0]].name);
                if ($scope.level.length > 0) {
                    $scope.level.map(function (v, i) {
                        rs.push(v[currentLevelIdx[i + 1]].name);
                    })
                }
                $scope.breadcrumb = rs;
            }

            $scope.groupClick = function (v, idx, update) {
                var c = $scope.level.length == 0 ? $scope.list : $scope.level[$scope.level.length - 1];
                c.map(function (v) {
                    v.selected = false;
                })
                v.selected = true;
                currentLevelIdx[currentLevel] = idx;
                !update && pobj.onChange(v);
                !update && updateBreadcrumb();
            }

            $scope.groupNextClick = function (e, v, idx) {
                $scope.groupClick(v, idx, true);
                var newLevel = $scope.level.length == 0 ? getCurrentGroup().children : getCurrentLevel().children;
                $scope.level[currentLevel] = newLevel;
                newLevel.map(function (v, i) {
                    v.selected && currentLevelIdx.push(i);
                })
                currentLevel++;
                slide.next();
                e.stopPropagation();
                pobj.onChange(newLevel[currentLevelIdx[currentLevel]]);
                updateBreadcrumb();
                pobj.onLevelChange();
            }

            $scope.modeChange = function () {
                $scope.mode = !$scope.mode;
                pobj.onModeChange($scope.mode);
            }

            pobj.slideTo = function (n) {
                currentLevel = n;
                for (var i = $scope.breadcrumb.length - n - 1; i > 0; i--) {
                    $scope.breadcrumb.pop();
                    $scope.level.pop();
                    currentLevelIdx.pop();
                }
                slide.slideTo(n);
            }

            pobj.getLevel = function () {
                return currentLevel;
            }

            pobj.getIdx = function () {
                return {
                    idxs: currentLevelIdx,
                    idx: currentLevelIdx[currentLevel]
                }
            }
        }]
    }
}]);