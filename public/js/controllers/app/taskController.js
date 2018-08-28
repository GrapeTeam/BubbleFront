bubbleFrame.register('taskController', function ($scope, bubble, $timeout) {
    var taskList = [];
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    $scope.refresh = true;

    /* event source that contains custom events on the scope */
    $scope.events = [
        {
            title: '这是任务1',
            start: new Date(y, m, 1),
            className: ['b-l b-2x b-info'],
            location: 'New York',
            info: 'This a all day event that will start from 9:00 am to 9:00 pm, have fun!'
        },
        {
            title: '这是任务2',
            start: new Date(y, m, 3),
            end: new Date(y, m, 4, 9, 30),
            allDay: false,
            className: ['b-l b-2x b-danger'],
            location: 'London',
            info: 'Two days dance training class.'
        },
        {
            title: '这是任务3',
            start: new Date(y, m, 6, 16, 0),
            className: ['b-l b-2x b-info'],
            location: 'Hongkong',
            info: 'The most big racing of this year.'
        },
        {
            title: '这是任务4',
            start: new Date(y, m, 8, 15, 0),
            className: ['b-l b-2x b-info'],
            location: 'Rio',
            info: 'Do not forget to watch.'
        },
        {
            title: '这是任务5',
            start: new Date(y, m, 9, 19, 30),
            end: new Date(y, m, 9, 20, 30),
            className: ['b-l b-2x b-success'],
            info: 'Family party'
        },
        {
            title: '这是任务6',
            start: new Date(y, m, d - 5),
            end: new Date(y, m, d - 2),
            className: ['bg-success bg'],
            location: 'HD City',
            info: 'It is a long long event'
        },
        {
            title: '这是任务7',
            start: new Date(y, m, d - 1, 16, 0),
            className: ['b-l b-2x b-info'],
            location: 'Tokyo',
            info: 'Tokyo Game Racing'
        },
        {
            title: '这是任务8',
            start: new Date(y, m, d + 1, 19, 0),
            end: new Date(y, m, d + 1, 22, 30),
            allDay: false,
            className: ['b-l b-2x b-primary'],
            location: 'New York',
            info: 'Party all day'
        },
        {
            title: '这是任务9',
            start: new Date(y, m, d + 4, 16, 0),
            alDay: false,
            className: ['b-l b-2x b-warning'],
            location: 'Home Town',
            info: 'Repeat every day'
        },
        {
            title: '这是任务10',
            start: new Date(y, m, 28),
            end: new Date(y, m, 29),
            url: 'http://google.com/',
            className: ['b-l b-2x b-primary']
        },
        {title: '这是任务11', start: new Date(y, m + 1, 6, 18, 0), className: ['b-l b-2x b-info']}
    ];

    $scope.mode = "calendar";
    $scope.changMode = function () {
        $scope.mode = $scope.mode == "calendar" ? "table" : "calendar";
    };

    /**
     * 双击添加事件
     * precision双击间隔
     */
    $scope.precision = 400;
    $scope.lastClickTime = 0;
    $scope.alertOnEventClick = function (date, jsEvent, view) {
        // var time = new Date().getTime();
        // if (time - $scope.lastClickTime <= $scope.precision) {
        //     $scope.events.push({
        //         title: 'New Event',
        //         start: date,
        //         className: ['b-l b-2x b-info']
        //     });
        // }
        // $scope.lastClickTime = time;
    };
    /* alert on Drop */
    $scope.alertOnDrop = function (event, delta, revertFunc, jsEvent, ui, view) {
        $scope.alertMessage = ('Event Droped to make dayDelta ' + delta);
    };
    /* alert on Resize */
    $scope.alertOnResize = function (event, delta, revertFunc, jsEvent, ui, view) {
        $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
    };
    //鼠标滑过弹窗
    $scope.overlay = $('.fc-overlay');
    $scope.alertOnMouseOver = function (event, jsEvent, view) {
        $scope.event = event;
        $scope.overlay.removeClass('left right').find('.arrow').removeClass('left right top pull-up');
        var wrap = $(jsEvent.target).closest('.fc-event');
        var cal = wrap.closest('.calendar');
        var left = wrap.offset().left - cal.offset().left;
        var right = cal.width() - (wrap.offset().left - cal.offset().left + wrap.width());
        if (right > $scope.overlay.width()) {
            $scope.overlay.addClass('left').find('.arrow').addClass('left pull-up')
        } else if (left > $scope.overlay.width()) {
            $scope.overlay.addClass('right').find('.arrow').addClass('right pull-up');
        } else {
            $scope.overlay.find('.arrow').addClass('top');
        }
        (wrap.find('.fc-overlay').length == 0) && wrap.append($scope.overlay);
    };

    /* config object */
    $scope.uiConfig = {
        calendar: {
            height: 600,
            editable: true,
            header: {
                left: 'prev',
                center: 'title',
                right: 'next'
            },
            dayClick: $scope.alertOnEventClick,
            eventDrop: $scope.alertOnDrop,
            eventResize: $scope.alertOnResize,
            eventMouseover: $scope.alertOnMouseOver,
            monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
            monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
            dayNames: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
            dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
            timeFormat: 'H:mm',
            editable: false
        }
    };

    /* add custom event*/
    $scope.addEvent = function () {
        bubble.customModal("taskCreateModal.html", "taskCreateContorller", "lg", {
            scope: $scope,
            field: bubble.getFields("task")
        }, function (v) {
            if (v) {
                taskList.push(v);
                $scope.events = initData(taskList);
                $scope.eventSources = [$scope.events];
                $scope.refresh = false;
                $timeout(function () {
                    $scope.refresh = true;
                })
            }
        });
    };

    /* remove event */
    $scope.remove = function (index) {
        $scope.events.splice(index, 1);
    };

    /* Change View */
    $scope.changeView = function (view, calendar) {
        $('.calendar').fullCalendar('changeView', view);
    };

    $scope.today = function (calendar) {
        $('.calendar').fullCalendar('today');
    };

    var colors = ["b-info", "b-success", "b-primer", "b-danger"];

    var getCalendarItem = function (v) {
        var item = {};
        item.title = v.name;
        item.start = moment.unix(v.lasttime / 1000).toDate();
        item.show_start = moment(item.start).format("YYYY-MM-DD h:mm:ss");
        item.allDay = true;
        item.className = ['b-l b-2x ' + colors[v.type]];
        item.location = '暂无任务地点信息';
        item.info = v.name;
        return item;
    };

    var initData = function (v) {
        taskList = v;
        return v.map(getCalendarItem);
    };

    bubble._call("task.page", 1, 1000).success(function (v) {
        $scope.events = initData(v.data);
        $scope.eventSources = [$scope.events];
    });

    var mark = function (v) {
        bubble.customModal("taskChangeModal.html", "taskChangeController", "lg", v, function (rs) {
            if (rs)
                v.state = rs;
        })
    };

    $scope.tableControl = {
        title: [{name: "操作", key: "sl", width: 30}],
        html: ['<a class="btn btn-sm m-t-n-xs"><i class="fa fa-navicon"></i></a>'],
        onClick: function (key, v) {
            mark(v);
        },
        onEdit: function (v) {
            for (var i = 0; i < taskList.length; i++) {
                if (taskList[i]._id === v._id) {
                    taskList[i] = v;
                    $scope.events[i] = getCalendarItem(v);
                    break;
                }
            }
        }
    }
});

bubbleFrame.register("taskCreateContorller", function ($scope, items, bubble, $modalInstance) {
    $scope.error = {};
    $scope.value = {};
    $scope.field = items.field;

    for (var tmp in items.field) {
        if (!items.field[tmp].edit) {
            delete items.field[tmp];
        } else {
            $scope.value[tmp] = "";
            $scope.error[tmp] = false;
        }
    }

    $scope.ok = function (e) {
        bubble.toggleModalBtnLoading(e, true);
        $scope.value.lasttime = Date.parse(new Date($scope.value.lasttime)) + "";
        bubble._call("task.add", $scope.value).success(function (v) {
            if (v.errorcode) {
                swal("添加失败");
                $modalInstance.close();
                return;
            }
            $modalInstance.close(v);
        })
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

bubbleFrame.register("taskChangeController", function ($scope, items, bubble, $modalInstance) {
    $scope.value = "2";

    $scope.ok = function (e) {
        bubble.toggleModalBtnLoading(e, true);
        bubble._call("task.update", items._id, {state: $scope.value}).success(function (v) {
            if (!v.errorcode) {
                $modalInstance.close($scope.value);
                return;
            }
            swal("更新失败");
            $modalInstance.close();
        });
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});