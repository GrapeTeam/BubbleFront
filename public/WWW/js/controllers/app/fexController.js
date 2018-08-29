'use strict';
bubbleFrame.register('fexController', function ($scope, bubble) {
    var s = {
        "root": {
            "data": {
                "id": "803e6a1de6d3",
                "created": 1476540448,
                "text": "前台请求数据"
            },
            "children": [
                {
                    "data": {
                        "id": "b7um4gzlswwg",
                        "created": 1476541064901,
                        "text": "后端查询数据并返回"
                    },
                    "children": [
                        {
                            "data": {
                                "id": "b7um4rnv788c",
                                "created": 1476541088136,
                                "text": "前台通讯层接受数据，格式转换"
                            },
                            "children": [
                                {
                                    "data": {
                                        "id": "b7um57r6hxk4",
                                        "created": 1476541123165,
                                        "text": "数据过滤模块识别数据并分发至相应组件数据解析模块"
                                    },
                                    "children": [
                                        {
                                            "data": {
                                                "id": "b7um612vc5c0",
                                                "created": 1476541186998,
                                                "text": "数据组件解析模块分析拆分数据"
                                            },
                                            "children": [
                                                {
                                                    "data": {
                                                        "id": "b7um6tao3qgo",
                                                        "created": 1476541248420,
                                                        "text": "数据填充模块根据解析后的数据通过KEY填充至页面"
                                                    },
                                                    "children": []
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        "template": "structure",
        "theme": "fresh-blue",
        "version": "1.4.37"
    };
    $scope.initEditor = function (editor, minder) {
        window.editor = editor;
        window.minder = minder;
        editor.minder.importJson(s);
        var aa = editor.minder.exportJson();
        aa = editor.minder.exportData("png", {}).then(function (v) {

        })
    };

    $scope.shower = bubble.isMobile();
});