bubbleFrame.register('powerController', function ($scope, bubble, $modal, $http, $rootScope, $timeout) {
    var author = $rootScope.logininfo && $rootScope.logininfo.name;
    var topcheckbox = $(".topbox input");
    var topnewscheckbox = $(".topbox-news input");
    var topsuffixcheckbox = $(".topbox-suffix input");
    var loadingbox = $(".contentbatchMask:not(.powerloading)");
    var errorWord = null;      //错别字实例
    var animationBtn = null;      //机器人实例
    var pdfCacheContent = "";       //PDF上传前内容
    var upload = null;
    var editorNoUpdate = false;
    $scope.pager = null;           //分页实例
    var tmpNewsIdx = "";    //待发布区当前选择
    $scope.imgs = [];
    $scope.stateCh = ["待审核", "审核不通过", "审核通过"];

    $scope.getMaxDate = function () {
        return new Date().Format("yyyy-MM-dd hh:mm:ss");
    };

    $scope.updateLocalStorage = function () {
        if ($scope.mode == "new" && $scope.newItem)
            window.localStorage.backContent = JSON.stringify($scope.newItem);
    };

    KindEditor.lang({
        hello: '添加图片'
    });

    $scope.$watch("newItem.content", function (n) {
        editorNoUpdate || editor.html(n);
        editorNoUpdate = false;
    });

    var editor = KindEditor.create('#editor_id', {
        items: [
            'source', '|', 'undo', 'redo', '|', 'preview', 'print', 'cut', 'copy', 'paste',
            'plainpaste', 'wordpaste', '|', 'justifyleft', 'justifycenter', 'justifyright',
            'justifyfull', 'insertorderedlist', 'insertunorderedlist', 'indent', 'outdent', 'subscript',
            'superscript', 'clearhtml', 'quickformat', 'selectall', '|', 'fullscreen', '/',
            'formatblock', 'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold',
            'italic', 'underline', 'strikethrough', 'lineheight', 'removeformat', '|',
            'insertfile', 'table', 'hr', 'baidumap', 'link', 'unlink'
        ],
        afterChange: function () {
            var html = this.html();
            var reg = /<img [^>]*src=['"]([^'"]+)[^>]*>/g;
            var l = html.match(reg);
            if (l) {
                l = l.map(function (v) {
                    return v.substring(v.indexOf("http"), v.indexOf("\"", v.indexOf("http")));
                });
                $scope.imgs.length != l.length && bubble.updateScope($scope);
                $scope.imgs = l;
            } else {
                $scope.imgs = [];
            }
            $scope.error = html !== "";
            var text = this.text();
            var reg = /[\u4e00-\u9fa5]/g;
            text = text.match(reg);
            text = text ? text.join("") : "";
            if ($scope.newItem) {
                $scope.newItem.desp = text.substring(0, 100);
                $scope.newItem.content = html;
                editorNoUpdate = true;
            }
            $scope.updateLocalStorage();
            bubble.updateScope($scope);
        },
        height: 580
    });

    $scope.setImage = function (v) {
        $scope.newItem.image = v;
    };

    $scope.column_tree_data = [];   //栏目树数据
    var initTree = function (v) {
        $scope.column_tree_data = bubble.getTreeData(v, "_id", false, function (v) {
            v.label = v.name;
        });
        $scope.treeSelect = function (v) {
            columnChange(v);
        };
        $(".content-column-box .open-btn").click(function () {
            $scope.newItem = "";
            $scope.imgList = [];
            bubble.updateScope($scope);
        });
    };

    var optionList = [];
    var getOptions = function (v, f) {
        var data = v;
        var rs = "";
        for (var i = 0; i < data.length; i++) {
            rs += `<option value="${data[i]._id}">${data[i].name}</option>`;
            data[i].children && optionList.push(getOptions(data[i].children, data[i]));
        }
        return f ? '<optgroup label="' + f.name + '">' + rs + '</optgroup>' : '<optgroup label="根栏目">' + rs + '</optgroup>' + optionList.join("");
    };
    var select = "";
    var selectData = "";
    var newItemTpl = {
        "image": "1,2,3",
        "isvisble": 0,
        "ogid": "1",
        "sort": 0,
        "oid": "",
        "readCount": 0,
        "content": "",
        "slevel": 0,
        "desp": null,
        "wbid": "1",
        "ownid": 0,
        "attrid": 0,
        "souce": null,
        "substate": 0,
        "subName": null,
        "mainName": "",
        "manageid": 0,
        "fatherid": 0,
        "isdelete": 0,
        "state": "草稿"
    };
    $scope.toggleshow = false;
    $scope.mode = "wait";
    $scope.shower = bubble.isMobile();
    $scope.error = false;
    $scope.current = "";
    $scope.news = "";
    $scope.newItem = "";
    $scope.imgList = [];    //纯图片文章图片列表
    $scope.videoList = [];    //纯视频文章视频列表
    $scope.colors = ["b-l-warning", "b-l-success", "b-l-primary"];
    $scope.dateOptions = {
        formatYear: 'yyyy',
        startingDay: 1,
        class: 'datepicker'
    };
    $scope.openState = {time: false};
    $scope.openDate = function (i, e) {
        $scope.openState.time = true;
        e.preventDefault();
        e.stopPropagation();
    };
    $scope.tmpNews = [];
    (function () {
        loadingbox.fadeIn(200);
        bubble._call("column.page", 1, 5000).success(function (v) {
            $scope.list = v.data;
            initTree(v.data);
        }).finally(function () {
            loadingbox.fadeOut(200);
            selectData = getOptions(bubble.getTreeData($scope.list, "_id"));
            select = $(".column-select").html(selectData).val("");
            select.chosen().change(columnChange);
        });
    })();

    var getColumn = function (id) {
        var d = $scope.list;
        for (var i = 0; i < d.length; i++) {
            if (d[i]._id === id) {
                return d[i];
            }
        }
    };

    var initChosenSelect = function (id) {
        select.val(id);
        select.trigger("chosen:updated.chosen");
    };

    $scope.column_tree_current = "";
    var columnChange = function (v, istree) {
        $(".content-list-box table input:first")[0].checked = false;
        $(".deleteBtn").hide();
        $scope.current = v._id ? v : getColumn(select.val());
        v._id && initChosenSelect(v._id);
        $scope.newItem = "";
        $scope.imgList = [];
        editor.html("");
        $(".list-group-item").each(function () {
            $(this).find("span:first").addClass("hover-action").find("i").removeClass("text-success");
        });
        $scope.search.reset(true);
        $scope.pager.init($scope.current._id);
        istree && ($scope.column_tree_current = $scope.current.name);
    };

    $scope.newsClick = function (v) {
        if ($scope.mindtype == "use") {
            $scope.Mind.addCallBack(v);
            return;
        }
        setPdf(v.type == 10 ? v.content : undefined);
        for (var i = 0; i < $scope.news.length; i++) {
            $scope.news[i].selected = false;
        }
        for (var i = 0; i < $scope.tmpNews.length; i++) {
            $scope.tmpNews[i].selected = false;
        }
        v.selected = true;
        $scope.tmpNewsIdx = "";
        upload && upload.getUpload().destroy();
        upload = new BatchWord().init();
        new UploadOfficeWord().init();
        new UploadImageList().init();
        var video = new UploadImageList().init(function (file, v) {
            !v.errorcode ? $scope.videoList[0] = bubble.getInterface("upload").visible + v.filepath.replace(/\\/g, "/") : swal("上传失败");
            $scope.newItem.content = $scope.videoList.join(",");
            $(".contentVideoTypeBox .webuploader-pick").html("上传");
            $scope.validVideoNews = false;
            $(".contentVideoTypeBox .process").html("");
            bubble.updateScope($scope);
            $timeout(function () {
                $scope.validVideoNews = true;
            })
        }, function (file, v) {
            $(".contentVideoTypeBox .webuploader-pick").html("上传中...");
            $(".contentVideoTypeBox .process").html((v * 100).toFixed(2) + "%");
        }, "#fileUploadPickerVideo");
        $scope.mode = v.tmpnew ? "new" : "edit";
        $scope.newItem = v;
        $scope.current.contentType == '1' && ($scope.imgList = $scope.newItem.content.split(","));
        $scope.current.contentType == '2' && ($scope.videoList = $scope.newItem.content.split(","));
        editor.html(v.content);
        topcheckbox[0].checked = $scope.newItem.attribute == "1";
        topnewscheckbox[0].checked = $scope.newItem.attribute == "2";
        topsuffixcheckbox[0].checked = $scope.newItem.isSuffix == "1";
        $scope.validVideoNews = false;
        $timeout(function () {
            $scope.validVideoNews = true;
            editor.edit.setHeight($(".content-console-box .row-row:first").height() - 270);
            $("#pdfbox").height($(".content-console-box .row-row:first").height() - 210);
        });
    };

    $scope.create = function (v, i, e) {
        setPdf();
        if (v) {
            $scope.tmpNewsIdx = i;
        } else {
            $scope.tmpNewsIdx = "";
        }
        upload && upload.getUpload().destroy();
        upload = new BatchWord().init();
        new UploadOfficeWord().init();
        new UploadImageList().init();
        var video = new UploadImageList().init(function (file, v) {
            !v.errorcode ? $scope.videoList[0] = bubble.getInterface("upload").visible + v.filepath.replace(/\\/g, "/") : swal("上传失败");
            $scope.newItem.content = $scope.videoList.join(",");
            $(".contentVideoTypeBox .webuploader-pick").html("上传");
            $scope.validVideoNews = false;
            $(".contentVideoTypeBox .process").html("");
            bubble.updateScope($scope);
            $timeout(function () {
                $scope.validVideoNews = true;
            })
        }, function (file, v) {
            $(".contentVideoTypeBox .webuploader-pick").html("上传中...");
            $(".contentVideoTypeBox .process").html((v * 100).toFixed(2) + "%");
        }, "#fileUploadPickerVideo");
        $scope.mode = "new";
        if (!v && window.localStorage.backContent && false && window.localStorage.backContent.length > 15) {
            $scope.newItem = JSON.parse(window.localStorage.backContent);
        } else {
            $scope.newItem = newItemTpl;
            $scope.newItem.content = v && v.content ? v.content : "";
            $scope.newItem.mainName = v && v.mainName ? v.mainName : "";
            $scope.newItem.author = author;
            $scope.newItem.souce = window.localStorage.sitename;
            $scope.newItem.image = "";
            $scope.imgList = [];
            $scope.videoList = [];
            $scope.validVideoNews = true;
            $scope.newItem.ogid = $scope.current._id;
            $scope.newItem.time = new Date().Format("yyyy-MM-dd hh:mm");
            $scope.newItem.attribute = "0";
        }
        $timeout(function () {
            $scope.validVideoNews = true;
            editor.edit.setHeight($(".content-console-box .row-row:first").height() - 270);
            $("#pdfbox").height($(".content-console-box .row-row:first").height() - 210);
        });
        topcheckbox[0].checked = false;
        topnewscheckbox[0].checked = false;
        topsuffixcheckbox[0].checked = false;
        $scope.newItem.isSuffix == "0";
        editor.html($scope.newItem.content ? $scope.newItem.content : "");
    };

    $scope.delete = function (item) {
        swal({
            title: item ? "确定要删除该新闻吗?" : "确定要删除这些新闻吗?",
            text: "新闻会被立即删除并无法撤销该操作",
            icon: "warning",
            buttons: {
                cancel: "取消",
                defeat: "删除",
            },
        }).then(
            function (s) {
                if (s) {
                    var ids = [];
                    if (!item) {
                        for (var i = 0; i < $scope.news.length; i++) {
                            var t = $scope.news[i];
                            if (t.deleteCheck) {
                                ids.push(t._id);
                            }
                        }
                    } else {
                        ids.push(item._id);
                    }
                    bubble._call("content.batchDelete", ids.join(",")).success(function (v) {
                        if (!v.errorcode) {
                            for (var i = 0; i < $scope.news.length; i++) {
                                var t = $scope.news[i];
                                if (t.deleteCheck || (item && t === item)) {
                                    $scope.news.splice(i, 1);
                                    i--;
                                }
                            }
                            $scope.newItem = "";
                            $(".deleteBtn").hide();
                            $(".createBtn").fadeIn(200);
                        } else
                            swal("删除失败");
                        $(".news-list .delete-flag i").removeClass("text-success");
                        $(".news-list .delete-flag").addClass("hover-action");
                    });
                }
            });
    };

    $scope.deleteCheckAll = function (e) {
        var f = e.currentTarget.checked;
        for (var i = 0; i < $scope.news.length; i++) {
            $scope.news[i].deleteCheck = f;
        }
        if (f) {
            $(".deleteBtn").fadeIn(200);
        } else {
            $(".deleteBtn").hide();
        }
    };

    $scope.deleteCheck = function (v, e) {
        if (v) {
            v.deleteCheck = !v.deleteCheck;
            v.deleteCheck ? $(e.currentTarget).addClass("text-success") : $(e.currentTarget).removeClass("text-success");
            !v.deleteCheck ? $(e.currentTarget).parent().addClass("hover-action") : $(e.currentTarget).parent().removeClass("hover-action");
        }
        var flag = false;
        for (var i = 0; i < $scope.news.length; i++) {
            var t = $scope.news[i];
            if (t.deleteCheck) {
                flag = true;
                break;
            }
        }
        if (flag) {
            $(".deleteBtn").fadeIn(200);
        } else {
            $(".deleteBtn").hide();
        }
    };
    //分片发布
    var getChunk = function (v) {
        var num = 18000;
        var subnum = 0;
        var list = [];
        var count = 1;
        var chunks = 0;
        var c = v.content;
        var rs = function (id, o, f) {
            count++;
            $(".loading-spinner p").length || $(".loading-spinner").append("<p></p>");
            var content = list.shift();
            bubble._call("content.append", id, {content: bubble.replaceBase64(content)}).success(function (v) {
                o.content += content;
                if (count == chunks) {
                    $(".contentbatchMask:not(.powerloading)").fadeOut(200);
                    $scope.newItem = null;
                    $(".loading-spinner p").remove();
                    f && swal("发布成功") && $scope.Mind.addCallBack(v);
                } else {
                    rs(id, o);
                }
                f || $(".loading-spinner p").html("<p>已完成" + (((count / chunks) * 100).toFixed(2)) + "%</p>");
            });
        };
        if (c.length > num) {
            while (subnum < c.length) {
                list.push(c.substring(subnum, subnum + num));
                subnum += num;
            }
            chunks = list.length;
            v.content = list.shift();
            return rs;
        }

        return false;
    };

    var checkPrivacy = function () {
        var html = $scope.newItem.content;
        var tmphtml = "";
        var phone = /1[3,5,8]\d{9}/g;
        var idcard = /[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]/g;
        var card = /([1-9]{1})(\d{18}|\d{14})/g;
        var getList = function (v) {
            var rs = [];
            var tmp = "";
            while (true) {
                tmp = v.exec(html);
                if (tmp) {
                    rs.push(tmp);
                    setColor(tmp);
                } else {
                    break;
                }
            }
            rs.pop();
            return rs;
        };
        var setColor = function (v) {
            if (v) {
                var left = "<span style='color:#E53333'>";
                var right = "</span>";
                tmphtml = html.substring(0, v.index) + left + html.substring(v.index, v.index + v[0].length) + right + html.substring(v.index + v[0].length, html.length);
            }
        };
        // var cl = getList(card);
        var pl = getList(phone);
        var idl = getList(idcard);
        // setColor(cl.concat(pl.concat(idl)));
        $scope.newItem.content = html;
        return false;
    };

    $scope.allPraviteCheck = function () {
        bubble._call("content.checkAllArticle", "mainName").success(function (v) {
            var p = loadingbox.fadeIn(200).find(".loading-spinner");
            p.width(200);
            p.find("p").remove();
            p.append("<p></p>");
            p.find("p").html("正在检测中");
        });
    };

    $scope.save = function (check, p) {
        if ($(".btn-save").html() == "发布中..") {
            return;
        }
        $scope.newItem.content = editor.html();
        var cb = function () {
            // if (!checkPrivacy()) {
            //     swal("存在涉及隐私的内容,请检查内容中以红色标注的部分");
            //     return;
            // }
            if (!$scope.newItem.mainName) {
                swal("标题不可为空");
                return;
            }
            if (!isNaN($scope.newItem.mainName)) {
                swal("不允许纯数字标题");
                return;
            }
            // if (isNaN(Date.parse($scope.newItem.time))) {
            //     swal("发布时间格式错误,正确格式示例:2010-10-10 16:16:16");
            //     return;
            // }
            $(".contentbatchMask:not(.powerloading)").fadeIn(200);
            var time = Date.parse(new Date($scope.newItem.time));
            var p = JSON.parse(JSON.stringify($scope.newItem));
            delete p.$$hashKey;
            delete p.deletecheck;
            delete p.tmpnew;
            delete p.selected;
            delete p.wechatCheck;
            if (p.attrid instanceof Array) {
                var tmpAttrid = [];
                for (var i = 0; i < p.attrid.length; i++) {
                    tmpAttrid.push(p.attrid[i]._id);
                }
                p.attrid = tmpAttrid.join(",");
            }
            var continueAppend = getChunk(p);
            $scope.mode == "new" && (p.ogid = $scope.current._id);
            p.time = time;
            p.isvisble = 0;
            p.isSuffix = parseInt(p.isSuffix);
            p.slevel = isNaN(parseInt(p.slevel)) ? 0 : parseInt(p.slevel);
            p.state = parseInt(p.state);
            if (isNaN(p.isSuffix)) {
                p.isSuffix = 0;
            }
            $(".btn-save").html("发布中..");
            if ($scope.mode == "new") {
                bubble._call("powerContent.insert", bubble.replaceBase64(JSON.stringify(p))).success(function (v) {
                    $scope.Mind.addCallBack(v, p.mainName);
                    if (!v.errorcode) {
                        v.time = new Date(parseInt(v.time) > 10000 ? parseInt(v.time) : v.time).Format("yyyy-MM-dd hh:mm");
                        if ($scope.newItem.tmpnew) {
                            for (var i = 0; i < $scope.tmpNews.length; i++) {
                                if ($scope.tmpNews[i].selected) {
                                    $scope.tmpNews.splice(i, 1);
                                    break;
                                }
                            }
                        }
                        if ($scope.tmpNews.length) {
                            $scope.tmpNews[0].selected = true;
                        } else {
                            $scope.news.length && ($scope.news[0].selected = true);
                        }
                        $scope.news && $scope.news.unshift(v);
                        continueAppend || swal("发布成功");
                        continueAppend || ($scope.newItem = null);
                        continueAppend && continueAppend(v._id, v, true);
                        bubble.updateScope($scope);
                    } else {
                        swal("发布失败");
                    }
                    if ($scope.tmpNewsIdx != "") {
                        $scope.tmpNews.splice($scope.tmpNewsIdx, 1);
                    }
                    $(".btn-save").html("发布");
                    window.localStorage.backContent = "";
                    continueAppend || $(".contentbatchMask:not(.powerloading)").fadeOut(200);
                });
            }
        };
        check ? errorWord.check($scope.newItem, p ? p : {type: "private", content: editor.html()}, cb) : cb();
    };
    //全部发布
    $scope.publishAll = function () {
        var count = 0;
        var d = JSON.parse(JSON.stringify($scope.tmpNews));
        $(".loading-spinner p").length || $(".loading-spinner").append("<p></p>");
        $(".contentbatchMask:not(.powerloading)").fadeIn(200);
        for (var i = 0; i < d.length; i++) {
            (function (p) {
                p.time = Date.parse(p.time);
                p.isvisble = 0;
                var continueAppend = getChunk(p);
                bubble._call("powerContent.append", bubble.replaceBase64(JSON.stringify(p))).success(function (v) {
                    if (v.errorcode) {
                        count++;
                        return;
                    }
                    count++;
                    continueAppend && continueAppend(v._id, v, count == d.length);
                    $scope.news.unshift(v);
                    if (count == d.length) {
                        if (!continueAppend) {
                            $(".contentbatchMask:not(.powerloading)").fadeOut(200);
                            swal("发布成功");
                        }
                        for (var i = 0; i < $scope.news.length; i++) {
                            $scope.news[i].selected = false
                        }
                        v.selected = true;
                        $scope.newItem = $scope.news[0];
                    }
                    $(".loading-spinner p").html("<p>已完成" + (((count / d.length) * 100).toFixed(0)) + "%</p>");
                    for (var i = 0; i < $scope.tmpNews.length; i++) {
                        if ($scope.tmpNews[i].mainName == p.mainName) {
                            $scope.tmpNews.splice(i, 1);
                            break;
                        }
                    }
                });
            })(d[i]);
        }
    };

    $scope.getTimeText = function (v) {
        return !isNaN(v) ? new Date(v).Format("yyyy-MM-dd hh:mm") : v;
    };

    $scope.getOldTime = function (v) {
        isNaN(v) && (v = Date.parse(new Date(v)));
        var time = Math.floor((new Date().getTime() - new Date(v * 1).getTime()) / (24 * 3600 * 1000)) + "天前";
        time[0] == 0 && (time = Math.floor((new Date().getTime() - new Date(v * 1).getTime()) / (3600 * 1000)) + "小时前");
        time[0] == 0 && (time = Math.floor((new Date().getTime() - new Date(v * 1).getTime()) / (60 * 1000)) + "分钟前");
        time[0] == 0 && (time = "刚刚");
        return time;
    };

    $scope.transmit = function (e) {
        var o = $(e.currentTarget);
        o.html("处理中");
        bubble._call("content.transmit", "11", $scope.newItem.image, bubble.replaceBase64($scope.newItem.content)).success(function (v) {
            o.html("转发");
        });
    };
    //纯图片新闻删除图片
    $scope.deleteImgList = function (v) {
        for (var i = 0; i < $scope.imgList.length; i++) {
            var t = $scope.imgList[i];
            if (t == v) {
                $scope.imgList.splice(i, 1);
                $scope.newItem.content = $scope.imgList.join(",");
                return;
            }
        }
    };
    //文章内容图片上传
    var UploadImageList = function () {
        var uploader = "";
        var box = $(".dialog-web-uploader");
        var _this = this;

        this.init = function (s, p, k) {
            uploader = new WebUploader.Uploader({
                auto: true,
                swf: './js/modules/webuploader/Uploader.swf',
                server: bubble.getInterface("upload.file") + "&folderid=0&wbid=",
                pick: k ? k : '#fileUploadPickerImge',
            });
            uploader.addButton('#fileUploadPicker2');
            uploader.on("fileQueued", this.fileQueued);
            uploader.on("uploadSuccess", s || this.uploadSuccess);
            return this;
        };

        this.fileQueued = function (file) {
            $scope.imgList.push("./img/loading.gif");
            file.ListIndex = $scope.imgList.length - 1;
            bubble.updateScope($scope);
        };

        this.uploadSuccess = function (file, v) {
            !v.errorcode ? $scope.imgList[file.ListIndex] = bubble.getInterface("upload").visible + v.filepath.replace(/\\/g, "/") : swal("上传失败");
            $scope.newItem.content = $scope.imgList.join(",");
            bubble.updateScope($scope);
        };

        this.uploadError = function (file, msg) {
            swal("上传失败");
        }
    };
    //文档上传
    var UploadOfficeWord = function () {
        var uploader = "";
        var box = $(".dialog-web-uploader");
        var _this = this;

        this.init = function (s, p, k) {
            uploader = new WebUploader.Uploader({
                auto: true,
                swf: './js/modules/webuploader/Uploader.swf',
                server: bubble.getUploadServer(),
                pick: '#fileUploadPickerImge',
                accept: {
                    title: 'Doc',
                    extensions: 'doc,docx,xlsx,xlsm,pptx,pptm,xls',
                    mimeTypes: '.doc,.docx,.xlsx,.xlsm,.pptx,.pptm,.xls'
                },
            });
            uploader.on("error", function (v, file) {
                if (v === "Q_TYPE_DENIED") {
                    swal("上传的文件中包含了不支持的文件格式", file.name);
                }
                if (v === "F_DUPLICATE") {
                    swal("该文件已上传过", file.name);
                }
                loadingbox.fadeOut(200);
            });
            uploader.addButton('#wordUploadPicker');
            uploader.on("uploadProgress", p || this.uploadProgress);
            uploader.on("uploadSuccess", s || this.uploadSuccess);
            return this;
        };

        this.uploadProgress = function (file, percentage) {
            $("#wordUploadPicker .webuploader-pick").html("处理中");
            $(".worduploadprocess").width((percentage.toFixed(2) * 100) + "%");
        };

        this.uploadSuccess = function (file, v) {
            bubble._call("file.getWord", v._id).success(function (v) {
                editor.html(v);
                $(".worduploadprocess").width(0);
                $("#wordUploadPicker .webuploader-pick").html("选择文档");
            })
        };

        this.uploadError = function (file, msg) {
            $("#wordUploadPicker .webuploader-pick").html("选择文档");
            $(".worduploadprocess").width(0);
            swal("上传失败");
        }
    };
    //批量文档上传
    var BatchWord = function () {
        var box = $(".wordBatchUploaderBox");
        var _this = this;
        var uploader = null;
        var fileCount = 0;
        var successCount = 0;
        var conventCount = 0;
        var fileSize = 0;
        var ulist = [];
        var noswich = false;
        var doc = "doc,docx,xlsx,xlsm,pptx,pptm,xls,pdf";
        var img = "gif,jpg,jpeg,bmp,png";

        this.init = function () {
            this.initUploader();
            return this;
        };

        this.getUpload = function () {
            return uploader;
        };

        var getType = function (v) {
            return doc.indexOf(v) >= 0;
        };

        var setSwitch = function () {
            if (!ulist.length) {
                return;
            }
            var tmp = doc.indexOf(ulist[0]) >= 0 ? "doc" : "img";
            for (var i = 1; i < ulist.length; i++) {
                if (tmp == "doc" && doc.indexOf(ulist[i]) < 0) {
                    ulist = [];
                    noswich = true;
                    return;
                }
                if (tmp == "img" && doc.indexOf(ulist[i]) >= 0) {
                    ulist = [];
                    noswich = true;
                    return;
                }
            }
            ulist = [];
            noswich = false;
        };

        this.initUploader = function () {
            uploader = WebUploader.create({
                dnd: '.content-info-box',
                swf: './js/modules/webuploader/Uploader.swf',
                server: bubble.getUploadServer(),
                disableGlobalDnd: true,
                auto: true,
                accept: {
                    title: 'File',
                    extensions: 'doc,docx,xlsx,xlsm,pdf,xls,gif,jpg,jpeg,bmp,png',
                    mimeTypes: '.doc,.docx,.xlsx,.xlsm,.pdf,.xls,image/gif,image/jpg,image/jpeg,image/bmp,image/png'
                },
            });
            uploader.on("error", function (v, file) {
                if (v === "Q_TYPE_DENIED") {
                    swal("上传的文件中包含了不支持的文件格式", file.name);
                }
                if (v === "F_DUPLICATE") {
                    swal("该文件已上传过", file.name);
                }
                loadingbox.fadeOut(200);
            });
            uploader.onFileQueued = function (file) {
                $(".updateInfo").remove();
                box.find(".tipsbox").fadeOut(200);
                $(".contentbatchMask:not(.powerloading)").fadeIn(200);
                ulist.push(file.ext);
                if (getType(file.ext)) {
                    fileCount++;
                    fileSize += file.size;
                    $(".content-info-box .listbox").append('<div class="alert ng-isolate-scope alert-info pos-rlt"><div class="process"></div><i class="fa fa-spin fa-spinner pull-right" style="display:none;"></i><div><span class="ng-binding ng-scope">' + file.name + '</span></div></div>');
                    file.ele = $(".content-info-box .listbox .alert:last");
                }
            };
            uploader.on("uploadProgress", function (file, v) {
                setSwitch();
                getType() && file.ele.find(".process").width((v.toFixed(2) * 100) + "%");
            });
            uploader.on("uploadSuccess", function (file, v) {
                if (getType(file.ext)) {
                    if (!v._id) {
                        successCount++;
                        file.ele.removeClass("alert-info").addClass("alert-danger");
                        swal("上传失败");
                        $(".contentbatchMask:not(.powerloading)").fadeOut(200);
                        return;
                    }
                    file.ele.removeClass("alert-info").addClass("alert-success");
                    file.ele.find(".process").width(0);
                    // file.ele.click(function () { _this.insertDoc.call(this, v) });
                    _this.insertDoc.call(file.ele[0], v);
                } else {
                    if (!v.errorcode && $scope.imgs.indexOf(bubble.getInterface("upload").visible + v.filepath.replace(/\\/g, "/")) < 0) {
                        $scope.imgs.push(bubble.getInterface("upload").visible + v.filepath.replace(/\\/g, "/"));
                        editor.appendHtml("<img src='" + $scope.imgs[$scope.imgs.length - 1] + "' />");
                        $scope.newItem.content = editor.html();
                        bubble.updateScope($scope);
                    } else {
                        swal("上传失败");
                    }
                    $(".contentbatchMask:not(.powerloading)").fadeOut(200);
                }
            });
        };
        /**
         * 批量上传文档转码插入
         */
        this.insertDoc = function (v) {
            if (v.fileextname == "pdf") {
                pdfCacheContent = $scope.newItem.content;
                $scope.newItem.content = bubble.getInterface("upload").visible + v.filepath.replace(/\\/g, "/");
                $scope.newItem.type = 10;
                setPdf($scope.newItem.content);
                $(this).addClass("alert-warning");
                $(this).fadeOut(500, function () {
                    $(this).remove();
                }.bind(this));
                $(".editor").fadeOut(200);
                $(".contentbatchMask:not(.powerloading)").fadeOut(200);
                bubble.updateScope($scope);
            } else {
                $(this).find("i").show();
                $(".contentbatchMask:not(.powerloading)").fadeIn(200);
                bubble._call("file.getWord", v._id).success(function (rs) {
                    $(this).addClass("alert-warning");
                    $(this).find("i").hide();
                    var name = v.fileoldname.split(".");
                    name.pop();
                    $scope.tmpNews.push({
                        content: rs,
                        mainName: name.join("."),
                        souce: window.localStorage.sitename,
                        image: "",
                        ogid: $scope.current._id,
                        time: new Date().Format("yyyy-MM-dd hh:mm"),
                        attribute: "0",
                        tmpnew: true
                    });
                    if (!noswich) {
                        $scope.newItem = $scope.tmpNews[0];
                        $scope.tmpNews[0].selected = true;
                        for (var i = 0; i < $scope.news.length; i++) {
                            $scope.news[i].selected = false;
                        }
                    }
                    if (++successCount == fileCount) {
                        !noswich && ($scope.mode = "new");
                        $(".contentbatchMask:not(.powerloading)").fadeOut(200);
                    }
                    $(this).fadeOut(500, function () {
                        $(this).remove();
                    }.bind(this));
                    bubble.updateScope($scope);
                }.bind(this));
            }
        }
    };

    var setPdf = function (v, o) {
        if (!v) {
            $(".hide-paf").fadeOut(200);
            $(".editor").fadeIn(200);
            $("#pdfbox").html("").fadeOut(200);
        } else {
            $scope.newItem && ($scope.newItem.content = v);
            $(".hide-paf").fadeIn(200);
            $(".editor").fadeOut(200);
            // PDFObject.embed(v, o ? o : $("#pdfbox").fadeIn(200));
            PDFJS.workerSrc = "./js/libs/pdf.worker.js";
            PDFJS.getDocument(v).then(function getPdfHelloWorld(pdf) {
                var cb = function (i) {
                    pdf.getPage(i).then(function getPageHelloWorld(page) {
                        if (i == pdf.numPages) {
                            return;
                        }
                        var box = o ? o : $("#pdfbox").fadeIn(200);
                        var scale = 1.5;
                        var viewport = page.getViewport(scale);
                        var obj = box.append($("<canvas></canvas>"));
                        var canvas = box.find("canvas:last")[0];
                        var context = canvas.getContext('2d');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        var renderContext = {
                            canvasContext: context,
                            viewport: viewport
                        };
                        page.render(renderContext);
                        cb(i + 1);
                    });
                };
                cb(1);
            });
            $("#pdfbox").fadeIn(200);
        }
    };

    //错别字处理类
    var ErrorWord = function () {
        var _this = this;
        var box = $(".content-errorword-wrap");
        var listbox = box.find(".list-box");
        var currentCallback = null;
        var editorerror = KindEditor.create('#editor_error');
        var current = null;
        var currentIdx = 0;
        var rhtml = "";
        var lhtml = "";

        this.init = function () {
            return this;
        };

        this.check = function (v, p, fn) {
            box.fadeIn(200);
            $timeout(function () {
                editorerror.edit.setHeight(box.find(".content-box").height() - 110);
            }, 100);
            editorerror.html(v.content);
            $(".error-box .count").html("");
            if (p.type == "error" || p.type == "all") {
                if (p.error.CONTENT.indexOf("已过期") >= 0) {
                    p.error.CONTENT = "该服务体验期已到期,如需继续使用请续费";
                }
                p.error.CONTENT = p.error.CONTENT ? p.error.CONTENT : p.error.content;
                $(".error-box .count").html($(".error-box .count").html() + "错误总数: " + (p.error.ErrorCount ? p.error.ErrorCount : 0) + "个").fadeIn(200);
                $(".error-box .content").html(p.error.CONTENT).fadeIn(200);
            }

            if (p.type == "all" || p.type == "private") {
                var html = bubble.PrivateProtect.scanText(p.content);
                $(".error-box .content").html(html);
                var tmp = html.match(/color:#e5a420/g);
                var count = tmp ? tmp.length : 0;
                tmp = html.match(/color:#e5a4f0/g);
                count += tmp ? tmp.length : 0;
                tmp = html.match(/color:#a30b85/g);
                count += tmp ? tmp.length : 0;
                tmp = html.match(/color:#0b35a3/g);
                count += tmp ? tmp.length : 0;
                $(".error-box .count").html($(".error-box .count").html() + "          隐私信息总数: " + (count ? count : 0) + "个").fadeIn(200);
            }

            $(".error-box .loading").hide();
            $(".error-box .content").show();
            $(".error-box .count").show();
            currentCallback = fn;
            current = v;
            $(box.find("iframe")[0].contentWindow).unbind("scroll").scroll(function () {
                box.find(".error-box").scrollTop($(this).scrollTop());
            });
            box.find(".error-box").unbind("scroll").scroll(function () {
                $(box.find("iframe")[0].contentWindow).scrollTop($(this).scrollTop());
            });
        };

        var resetBtn = function () {
            box.find(".btn-danger").hide();
            box.find(".btn-success").show();
        };

        box.find(".close-btn").click(function (e) {
            current.CONTENT = editorerror.html();
            box.fadeOut(200);
            animationBtn.unlock();
            e.stopPropagation();
            editorNoUpdate = false;
            bubble.updateScope($scope);
            resetBtn();
        });
        box.find(".confirm-btn").click(function (e) {
            current.content = editorerror.html();
            typeof currentCallback === 'function' && currentCallback();
            box.fadeOut(200);
            animationBtn.unlock();
            editorNoUpdate = false;
            bubble.updateScope($scope);
            resetBtn();
        });
        box.find(".hide-private").click(function (e) {
            var html = bubble.PrivateProtect.hideMode().scanText(editorerror.html());
            editorerror.html(html);
        });
        box.click(function (e) {
            e.currentTarget === e.target && $(this).fadeOut(200);
        });
    };

    //分页处理类
    var Pager = function () {
        var _this = this;
        var currentId = null;
        var pageCache = {};
        this.parameter = [];
        var pagebox = $(".new-pager-box");
        this.pagesize = "10";
        this.current = {page: 0, total: 0};

        this.init = function (id) {
            _this.parameter = [];
            currentId = id ? id : currentId;
            if (!pageCache[id]) {
                pageCache[id] = {page: 1}
            }
            _this.current = pageCache[id];
            this.initEvent();
            this.getData();
            return this;
        };

        this.pagesizeChange = function (v) {
            _this.current.page = 1;
            _this.getData();
        };

        this.getCurrent = function () {
            return _this.current;
        };

        this.initHtml = function () {
            pagebox.find(".c").html(_this.current.page);
            pagebox.find(".t").html(_this.current.total);
        };

        this.initEvent = function () {
            pagebox.find(".prev").unbind("click").click(this.prev);
            pagebox.find(".next").unbind("click").click(this.next);
            pagebox.find("input").unbind("keydown").keydown(this.go);
        };

        this.clearParameter = function () {
            _this.parameter = [];
        };

        this.setParameter = function (v) {
            if (typeof v === 'object') {
                for (var tmp in v) {
                    _this.parameter.push({field: tmp, logic: "like", value: v[tmp]});
                }
            } else {
                _this.parameter = [];
            }
            _this.getData();
        };

        this.getData = function (v) {
            loadingbox.fadeIn(200);
            // $scope.newItem = null;
            if (!currentId) {
                return;
            }
            var par = [{field: "ogid", logic: "=", value: currentId}].concat(_this.parameter);
            bubble._call("content.pageBy", _this.current.page, _this.pagesize, par).success(function (v) {
                if (!v.errorcode) {
                    $scope.news = v.data;
                    $scope.news.map(function (v) {
                        v.image ? v.image.replace(/\\/g, "/") : (v.image = v.thumbnail.replace(/\\/g, "/"));
                        delete v.selected;
                        v.attrid = typeof v.attrid === 'string' ? JSON.parse(v.attrid) : v.attrid;
                        if (v.attrid.length && v.attrid instanceof Array) {
                            for (var i = 0; i < v.attrid.length; i++) {
                                v.attrid[i].size = bubble.getSize(v.attrid[i].size);
                            }
                        }
                    });
                    _this.current.total = Math.ceil(v.totalSize / v.pageSize);
                    _this.current.totalItem = v.totalSize;
                    _this.initHtml();
                }
                loadingbox.fadeOut(200);
            })
        };

        this.export = function () {
            var par = [{field: "ogid", logic: "=", value: currentId}].concat(_this.parameter);
            window.open(bubble.getHost() + "/" + bubble.getAppId() + "/GrapeContent/Content/ExportContent/s:" + JSON.stringify(par) + "/文章列表.xls");
        };

        this.prev = function () {
            if (_this.current.page <= 1) {
                return;
            }
            _this.current.page--;
            _this.getData();
        };

        this.next = function () {
            if (_this.current.page >= _this.current.total) {
                return;
            }
            _this.current.page++;
            _this.getData();
        };

        this.go = function (e) {
            if (e.keyCode == 13) {
                var v = $(e.currentTarget).val();
                if (v >= 1 && v <= _this.current.total) {
                    _this.current.page = v;
                }
                $(e.currentTarget).val("");
                _this.getData();
            }
        }
    };

    //搜索类
    var Search = function () {
        var _this = this;
        this.par = {content: false, mainName: true, souce: false, author: false};
        this.keyword = "";

        this.checkChange = function (v) {
            var f = false;
            for (var tmp in _this.par) {
                if (_this.par[tmp]) {
                    f = true;
                    break;
                }
            }
            if (!f) {
                _this.par[v] = true;
            }
        };

        this.do = function () {
            if (!_this.keyword) {
                return;
            }
            var p = {};
            for (var tmp in _this.par) {
                if (_this.par[tmp]) {
                    p[tmp] = _this.keyword;
                }
            }
            $scope.pager.clearParameter();
            $scope.pager.setParameter(p);
        };

        this.reset = function (s) {
            _this.par = {content: false, mainName: true, souce: false, author: false};
            _this.keyword = "";
            s || $scope.pager.setParameter();
        }
    };

    /**
     * 文章预览控制类
     */
    var Preview = function () {
        var _this = this;
        var box = $('<div class="preview-wrap"> <div class="preview-box"> <div class="title"> 新闻预览 <button type="button" class="btn btn-default pull-right m-l-sm m-t-sm preview-close">关闭</button> </div> <div class="content-box"> <h3></h3> <div class="content-info"></div> <div class="content b-t wrapper-md m-t"></div> </div> </div> </div>');

        this.show = function (v) {
            $("body").append(box.fadeIn(200));
            $(".preview-close").click(this.hide);
            this.initHtml(v);
        };

        this.showById = function (id, fn) {
            loadingbox.fadeIn(200);
            bubble._call("content.find", id).success(function (v) {
                $("body").append(box.fadeIn(200));
                $(".preview-close").click(_this.hide);
                box.click(function (e) {
                    if (e.target === e.currentTarget) {
                        _this.hide();
                    }
                });
                loadingbox.fadeOut(200);
                _this.initHtml(v);
                fn && fn();
            })
        };

        this.showByMeetingId = function (id, fn) {
            loadingbox.fadeIn(200);
            bubble._call("powerContent.get", id).success(function (v) {
                $("body").append(box.fadeIn(200));
                $(".preview-close").click(_this.hide);
                box.click(function (e) {
                    if (e.target === e.currentTarget) {
                        _this.hide();
                    }
                });
                loadingbox.fadeOut(200);
                v.mainName = v.name;
                _this.initHtml(v);
                fn && fn();
            });
        };

        this.hide = function () {
            box.fadeOut(200, function () {
                box.remove();
            });
        };

        this.initHtml = function (v) {
            var d = v ? v : $scope.newItem;
            box.find("h3").html(d.mainName);
            box.find(".content-info").html("").append('<span> 来源: ' + d.souce + ' </span><span> 发布时间：' + new Date(parseInt(d.time)).Format("yyyy-MM-dd hh:mm:ss") + ' </span><span> 作者：' + d.author + ' </span>');
            if (d.type == 10) {
                var tmp = $("<div></div>");
                tmp.height(box.height() - 200);
                box.find(".content").html(tmp);
                setPdf(d.content, tmp);
            } else {
                box.find(".content").html(d.content ? d.content : editor.html());
            }
            box.find("table").css("margin", "0 auto");
        };

        box.unbind("click").click(function (e) {
            if (e.target === e.currentTarget) {
                _this.hide();
            }
        });
    };
    /**
     * 机器人控制类
     */
    var AnimationBtn = function () {
        var _this = this;
        var ready = false;
        var current = 0;
        var timer = 0;
        var messageTimer = 0;
        var messageLock = true;
        var box = $(".robotBtn");

        this.init = function () {
            // initImgLoad();
            initEvent();
            return this;
        };

        this.show = function () {
            box.show();
            current = 0;
            timer = setInterval(ani, 2000);
            return this;
        };

        this.unlock = function () {
            messageLock = false;
        };

        this.hide = function () {
            clearInterval(timer);
            box.addClass("out");
            box.find("img").hide();
            box.find("img:eq(0)").show(0);
            setTimeout(function () {
                box.remove("out").hide();
            }, 500);
            box.find(".p2").fadeOut(200);
            box.find(".p1").fadeIn(200);
            hidePop();
        };

        var ani = function () {
            var prev = 0;
            var next = 0;
            if (current >= 5) {
                prev = current;
                next = current = 0;
            } else {
                prev = current;
                next = ++current;
            }
            box.find("img:eq(" + (prev) + ")").fadeOut(800);
            box.find("img:eq(" + (next) + ")").fadeIn(800);
        };

        var initImgLoad = function () {
            var name = "content-ani";
            var fex = "png";
            var tmp = null;
            var count = 0;

            for (var i = 1; i <= 6; i++) {
                tmp = document.createElement("img");
                tmp.src = "./img/" + name + i + "." + fex;
                tmp.onload = function () {
                    if (++count == 6) {
                        ready = true;
                    }
                }
            }
        };

        var hidePop = function () {
            box.find(".messagebox").addClass("out");
            messageTimer = setTimeout(function () {
                box.find(".messagebox").hide();
                box.find(".messagebox").removeClass("out");
                messageTimer = 0;
            }, 200);
        };

        var getError = function (p, content) {
            bubble._call("content.check", bubble.replaceBase64(content)).success(function (v) {
                box.find(".p2").fadeOut(200);
                box.find(".p1").fadeIn(200);
                messageLock = false;
                hidePop();
                p.error = v;
                $scope.save(true, p);
            });
        };

        var initEvent = function () {
            box.unbind("click").click(function (e) {
                if (!messageLock) {
                    hidePop();
                    messageLock = true;
                } else {
                    if (messageTimer != 0) {
                        box.find(".messagebox").removeClass("out");
                        clearTimeout(messageTimer);
                    }
                    box.find(".messagebox").show();
                    messageLock = false;
                }

                e.stopPropagation();
            });

            $(".contentBox").unbind("click").click(hidePop);

            box.find("a").unbind("click").click(function (e) {
                e.stopPropagation();
                messageLock = true;
                var idx = $(this).index();
                var html = editor.html();
                if (!html) {
                    swal("内容为空");
                    messageLock = false;
                    return;
                }
                if (idx == 1) {
                    $scope.save(true, {type: "private", content: editor.html()});
                    return;
                }
                box.find(".p1").fadeOut(200);
                box.find(".p2").fadeIn(200);
                if (idx == 0) {
                    getError({type: "error"}, editor.html());
                    return;
                }
                if (idx == 2) {
                    getError({type: "all"}, editor.html());

                }
            });
        }
    };

    /**
     * 附件操作类
     */
    var Attachment = function () {
        var _this = this;
        var box = $(".content-attachment");
        var uploader = null;

        this.init = function () {
            initUploader();
            return this;
        };

        var initUploader = function () {
            uploader = WebUploader.create({
                dnd: '.content-attachment',
                pick: '.attachmentUpload',
                swf: './js/modules/webuploader/Uploader.swf',
                server: bubble.getUploadServer(),
                disableGlobalDnd: true,
                auto: true,
            });
            uploader.on("error", function (v, file) {
                if (v === "Q_TYPE_DENIED") {
                    swal("上传的文件中包含了不支持的文件格式", file.name);
                }
                if (v === "F_DUPLICATE") {
                    swal("该文件已上传过", file.name);
                }
                loadingbox.fadeOut(200);
            });
            uploader.onFileQueued = function (file) {
                if (!($scope.newItem.attrid instanceof Array)) {
                    $scope.newItem.attrid = [];
                }
                $scope.newItem.attrid.push({
                    fileoldname: file.name,
                    size: bubble.getSize(file.size),
                    state: "上传中",
                    _id: {$oid: ""}
                });
                file.ele = $scope.newItem.attrid[$scope.newItem.attrid.length - 1];
                bubble.updateScope($scope);
            };
            uploader.on("uploadProgress", function (file, v) {
                box.find(".process").width((v.toFixed(2) * 100) + "%");
            });
            uploader.on("uploadSuccess", function (file, v) {
                delete file.ele.state;
                file.ele.filepath = (bubble.getInterface("upload").visible + v.filepath).replace(/\\/g, "/");
                file.ele._id = v._id;
                box.find(".process").width(0);
                bubble.updateScope($scope);
            });
        };

        this.download = function (v) {
            window.open(v.filepath);
        };

        this.remove = function (v) {
            for (var i = 0; i < $scope.newItem.attrid.length; i++) {
                var element = $scope.newItem.attrid[i];
                if (element.id == v || element == v) {
                    $scope.newItem.attrid.splice(i, 1);
                    return;
                }
            }
        }
    };

    /**
     * 脑图操作类
     */
    var Mind = function () {
        var minder = null;                              //minder对象
        var _this = this;
        var demoCid = "59cf6313d7222ab59a94f3c8";
        var target = "#minder-view";                    //minder容器
        this.tableCond = [];
        this.powerTypeList = null;                    //权利分类
        this.currentMeeting = "";                        //当前会议,用以快速重命名时对比
        this.currentSite = "";
        this.powerListShower = null;                    //执行结果列表显隐字段
        this.powerEditorShower = null;                  //决策会议弹窗显隐字段
        this.powerTypeShower = null;                    //权利分类弹窗显隐字段
        this.currentNode = null;                        //当前选中节点
        this.currentType = null;                        //当前选中分类
        this.updateModal = null;                        //决策会议编辑操作类
        this.powerListModal = null;                     //执行结果操作类
        this.tableControl = {                         //执行结果列表
            title: [{name: "查看文章", key: "gk", width: 80}],
            html: ['<a class="btn btn-sm m-t-n-xs"><i class="fa fa-search"><i></a>'],
            onClick: function (key, v, i, e, p, s, t) {
                $scope.preview.showByMeetingId(v._id);
            },
            onColumnClick: function (key, v, i, e, p, s, t) {
                $scope.preview.showByMeetingId(v._id);
            },
        };
        this.meetingList = null;
        //type:1  决议 | type:10  更多决议按钮 | type:9  更多执行结果按钮 | type:0   会议 | type:2   执行结果
        var templateObj = {
            "root": {
                data: {
                    text: "请选择权利"
                }
            },
            "template": "right",
            "theme": "fresh-blue",
            "version": "1.4.43"
        };

        var initsite = function () {
            $(".powerloading").fadeIn(200);
            bubble._call("site.getall", 1, 1000, window.logininfo.currentWeb).success(function (v) {
                $(".powerloading").fadeOut(200);
                _this.site_tree_data = initSiteName(bubble.getTreeData(v.data, "_id"));
            });
        };

        var initSiteName = function (v) {
            for (var i = 0; i < v.length; i++) {
                v[i].label = v[i].title;
                if (v[i].children) {
                    initSiteName(v[i].children);
                }
            }
            return v;
        };

        var getJson = function (v, fn) {
            var count = 0;
            var tmp = JSON.parse(JSON.stringify(templateObj));
            tmp.root.data = {
                "type": 0,
                "_id": v._id,
                "text": v.name,
            };
            tmp.root.children = [
                {
                    "data": {
                        "text": "......",
                        "type": 10,
                    }
                }
            ];
            if (v.itemChildrenData) {
                for (var i = 0; i < v.itemChildrenData.length; i++) {
                    (function (n) {
                        var o = {
                            data: {
                                "type": 1,
                                "_id": v.itemChildrenData[n]._id,
                                "text": v.itemChildrenData[n].name,
                                "runCycle": v.itemChildrenData[n].runCycle,
                                "effectiveTime": v.itemChildrenData[n].effectiveTime,
                            },
                            children: [
                                {
                                    "data": {
                                        "text": "......",
                                        "type": 9,
                                    }
                                }
                            ]
                        };
                        tmp.root.children.unshift(o);
                        bubble._call("powerContent.pageBy", 1, 10, [{
                            field: "fatherid",
                            logic: "=",
                            value: o.data._id
                        }]).success(function (rs) {
                            for (var i = rs.data.length - 1; i >= 0; i--) {
                                o.children.unshift({data: {"type": 2, "_id": rs.data[i]._id, "text": rs.data[i].name}})
                            }
                            if (++count == v.itemChildrenData.length) {
                                fn && fn(tmp);
                            }
                        });
                    })(i)
                }
            }
        };

        this.scal = function (v) {
            if (v) {
                minder.execCommand('ZoomIn');
            } else {
                minder.execCommand('ZoomOut');
            }
        };

        this.init = function () {
            minder = new kityminder.Minder();
            $(target).html(JSON.stringify(templateObj));     //填充JSON至DOM对象
            //minder初始化
            minder.setup(target);
            minder.disable();
            $(".km-receiver").remove();
            this.initView();
            //初始化操作类
            this.updateModal = new UpdateModal();
            this.addModal = new AddModal();
            this.powerListModal = new PowerListModal();
            this.powerTypeModal = new PowerTypeModal();
            initEvent();
            initsite();
            return this;
        };

        this.siteTreeSelect = function (v) {
            $(".powerloading").fadeIn(200);
            _this.currentSite = v;
            _this.powerTypeList = null;
            _this.meetingList = [];
            _this.currentType = null;
            bubble._call("powerType.pageBy", 1, 1000, [{
                field: "wbid",
                logic: "=",
                value: v._id
            }]).success(function (rs) {
                _this.powerTypeList = rs.data;
                if (rs.data.length) {
                    _this.powerTypeList[0].active = true;
                    _this.currentType = _this.powerTypeList[0];
                    getPowerList(_this.powerTypeList[0]._id)
                }
                $(".powerloading").fadeOut(200);
            });
        };

        var getPowerList = function (id) {
            $(".powerloading").fadeIn(200);
            bubble._call("power.pageBy", 1, 1000, [{
                field: "wbid",
                logic: "=",
                value: _this.currentSite._id
            }, {field: "type", logic: "=", value: id}]).success(function (rs) {
                if (!rs.errrocode && rs.data && rs.data.length) {
                    _this.meetingList = rs.data;
                } else {
                    _this.meetingList = [];
                    _this.currentMeeting = "";
                }
                $(".powerloading").fadeOut(200);
            });
        };

        this.typeChange = function (v) {
            for (var i = 0; i < _this.powerTypeList.length; i++) {
                _this.powerTypeList[i].active = false;
            }
            _this.meetingList = [];
            v.active = true;
            getPowerList(v._id);
            _this.currentType = v;
            _this.currentMeeting = "";
        };

        //初始化minder视角缩放等级并移至中心点
        this.initView = function () {
            var p = minder.getPaper();
            var view = p.getViewPort();
            // view.zoom = 1.2;
            view.center.x = $(target).width() / 1.2;
            p.setViewPort(view);
        };
        //文章选择事件回调,可覆写,由打开文章选择器的对象处理选择事件
        this.addCallBack = function (v) {
        };

        /**
         * 显示文章选择窗口
         * @param {*} type 添加方式
         * new: 新增
         * use: 引用
         */
        this.showContentList = function (type) {
            switch (type) {
                case "new":
                    _this.contentShow = true;
                    $scope.create();
                    $scope.current = {_id: demoCid};
                    $scope.mindtype = "create";
                    break;

                case "use":
                    _this.contentShow = true;
                    $scope.newItem = null;
                    $scope.mindtype = "use";
                    break;

                default:
            }
        };

        this.export = function () {
            swal(JSON.stringify(minder.exportJson()));
        };

        //删除节点
        this.delete = function () {
            swal({
                title: "确定要删除该节点吗?",
                text: "节点会被立即删除并无法撤销该操作",
                icon: "warning",
                buttons: {
                    cancel: "取消",
                    defeat: "删除",
                },
            }).then(
                function (s) {
                    if (s) {
                        $(".powerloading").fadeIn(200);
                        bubble._call("powerContent.delete", _this.currentNode.data._id).success(function (v) {
                            if (!v.errorcode) {
                                _this.onMeetingSelect(_this.currentMeeting, true);
                                _this.currentNode = null;
                            } else {
                                swal("删除失败");
                                $(".powerloading").fadeOut(200);
                            }
                        });
                    }
                });
        };

        //添加会议
        this.addMeeting = function () {
            if (_this.powerTypeList.length)
                _this.addModal.show();
            else {
                swal("在添加权力之前请先至少添加一个分类");
                _this.powerTypeModal.show();
            }
        };

        //会议切换
        this.onMeetingSelect = function (v, e) {
            if (v.active && !e) {
                return;
            }
            for (var i = 0; i < this.meetingList.length; i++) {
                this.meetingList[i].active = false;
            }
            v.active = true;
            _this.currentMeeting = v;
            $(".powerloading").fadeIn(200);
            bubble._call("powerContent.getInfo", v._id).success(function (v) {
                getJson(v, function (v) {
                    minder.importJson(v);
                    minder.refresh();
                    $(".powerloading").fadeOut(200);
                })
            });
        };

        //删除会议
        this.deleteMeeting = function (v, i, e) {
            e.stopPropagation();
            swal({
                title: "确定要删除该权利吗?",
                text: "该权利会被立即删除并无法撤销该操作",
                icon: "warning",
                buttons: {
                    cancel: "取消",
                    defeat: "删除",
                },
            }).then(
                function (s) {
                    if (s) {
                        $(".powerloading").fadeIn(200);
                        bubble._call("power.delete", v._id).success(function (v) {
                            $(".powerloading").fadeOut(200);
                            _this.meetingList.splice(i, 1);
                            if (_this.meetingList.length) {
                                _this.meetingList[0].active = true;
                                minder.importJson(templateObj);
                            } else {
                                $(target).hide();
                            }
                        });
                    }
                });
        };

        //会议快速重命名
        this.onMeetingBlur = function (v) {
            if (v.name != _this.currentMeeting.name)
                swal("修改成功");
        };

        var initEvent = function () {
            $(".content-wraper-box").unbind("click").click(function (e) {
                if (e.target === e.currentTarget) {
                    _this.contentShow = false;
                    bubble.updateScope($scope);
                }
            });
            minder.off('mousedown', md);
            minder.off('dblclick', dclick);
            minder.on('mousedown', md);
            minder.on('dblclick', dclick);
        };

        //minder双击事件
        var dclick = function () {
            var node = minder.getSelectedNode();
            if (node && node.data.type < 2) {
                _this.updateModal.update();
            }
            if (node && node.data.type == 2) {
                $scope.preview.showByMeetingId(node.data._id);
            }
            bubble.updateScope($scope);
        };

        //minder单击事件,因click和原事件有冲突,故用mousedown代替
        var md = function () {
            var node = minder.getSelectedNodes();
            if (node && node.length == 1) {
                _this.currentNode = node[0];
                if (node[0].data.type == 9) {
                    if (node[0].parent.children.length == 11)
                        _this.powerListModal.show();
                    else
                        _this.powerListModal.addResult();
                }
                if (node[0].data.type == 10) {
                    _this.updateModal.add();
                }
            } else {
                _this.currentNode = "";
            }
            bubble.updateScope($scope);
        };

        //执行结果操作类
        var PowerListModal = function () {
            this.show = function () {
                _this.tableCond = [{"field": "fatherid", "logic": "=", "value": _this.currentNode.parent.data._id}];
                _this.powerListShower = true;
                $timeout(function () {
                    $(".power-result-wrapper").unbind("click").click(function (e) {
                        if (e.target === e.currentTarget) {
                            _this.powerListShower = false;
                            bubble.updateScope($scope);
                        }
                    });
                });
            };

            this.hide = function () {
                _this.tableCond = [];
                _this.powerListShower = false;
            };

            //添加操作结果
            this.addResult = function () {
                swal("您想选择哪种方式添加执行结果", {
                    buttons: {
                        cancel: "取消",
                        catch: {
                            text: "引用",
                            value: "catch",
                        },
                        defeat: "新增",
                    },
                })
                    .then((value) => {
                        if (!value) {
                            return;
                        }
                        _this.showContentList(value == "catch" ? "use" : "new");
                        bubble.updateScope($scope);
                    });
                //新增执行结果回调函数
                _this.addCallBack = function (v, name) {
                    _this.contentShow = false;
                    var p = {
                        fatherid: _this.currentNode.parent.data._id,
                        wbid: _this.currentSite._id,
                        type: 2
                    };
                    if (name) {
                        p.existid = v._id;
                    } else {
                        p.linkId = v._id;
                    }
                    $(".powerloading").fadeIn(200);
                    bubble._call("powerContent.insert", bubble.replaceBase64(JSON.stringify(p))).success(function (v) {
                        !_this.tableCond.length && _this.powerListModal.hide();
                        _this.tableCond.length && _this.tableControl.reload();
                        _this.onMeetingSelect(_this.currentMeeting, true);
                    }.bind(this));
                }
            }
        };

        //决策会议操作类
        var UpdateModal = function () {
            var mode = "";
            this.btntext = "查看已关联文章";
            //预览文章
            this.view = function () {
                this.btntext = "文章加载中...";
                $(".powerloading").fadeIn(200);
                $scope.preview.showByMeetingId(_this.currentNode.data._id, function () {
                    this.btntext = "查看已关联文章";
                    $(".powerloading").fadeOut(200);
                }.bind(this));
            };

            //新增决议会议回调函数
            this.addCallBack = function (v, name) {
                _this.contentShow = false;
                var node = _this.updateModal.node;
                if (name) {
                    node.text = v.mainName;
                    node.existid = v._id;
                } else {
                    node.text = v.mainName;
                    node.linkId = v._id;
                }
            };

            //确认添加,并插入节点
            this.confirm = function () {
                var p = {};
                if (!this.new) {
                    update.call(this);
                } else {
                    addNode.call(this);
                }
            };

            var update = function () {
                var node = this.node;
                var p = {};
                if (node.linkId) {
                    p.linkId = node.linkId;
                }
                if (node.existid) {
                    p.existid = node.existid;
                }
                if (node.type == 1 && node.runCycle != _this.currentNode.data.runCycle) {
                    p.runCycle = isNaN(parseInt(node.runCycle)) ? 0 : parseInt(node.runCycle);
                }
                if (node.type == 1 && node.effectiveTime != _this.currentNode.data.effectiveTime) {
                    p.effectiveTime = isNaN(parseInt(node.effectiveTime)) ? 0 : parseInt(node.effectiveTime);
                }
                if (Object.getOwnPropertyNames(p).length) {
                    bubble._call("powerContent.update", node._id, bubble.replaceBase64(JSON.stringify(p))).success(function (v) {
                        this.hide();
                        _this.onMeetingSelect(_this.currentMeeting, true);
                    }.bind(this));
                } else {
                    minder.refresh();
                    this.hide();
                    initEvent();
                }
            };

            var addNode = function () {
                var node = this.node;
                var p = {
                    fatherid: _this.currentNode.parent.data._id,
                    wbid: _this.currentSite._id
                };
                if (_this.currentNode.data.type == 10) {
                    p.runCycle = isNaN(parseInt(node.runCycle)) ? 0 : parseInt(node.runCycle);
                    p.effectiveTime = isNaN(parseInt(node.effectiveTime)) ? 0 : parseInt(node.effectiveTime);
                    p.type = 1;
                } else {
                    p.type = 0;
                }
                if (node.linkId) {
                    p.linkId = node.linkId;
                }
                if (node.existid) {
                    p.existid = node.existid;
                }
                $(".powerloading").fadeIn(200);
                bubble._call("powerContent.insert", bubble.replaceBase64(JSON.stringify(p))).success(function (v) {
                    this.hide();
                    _this.onMeetingSelect(_this.currentMeeting, true);
                }.bind(this));
            };

            //引用添加文章
            this.use = function () {
                mode = "use";
                _this.showContentList(mode);
                _this.addCallBack = this.addCallBack;
            };

            //新增添加文章
            this.create = function () {
                mode = "new";
                _this.showContentList(mode);
                _this.addCallBack = this.addCallBack;
            };

            this.show = function () {
                _this.powerEditorShower = true;
                $timeout(function () {
                    $(".power-editor-wrapper").unbind("click").click(function (e) {
                        if (e.target === e.currentTarget) {
                            _this.powerEditorShower = false;
                            bubble.updateScope($scope);
                        }
                    });
                });
            };

            //新增入口
            this.add = function () {
                this.node = {};
                this.new = true;
                this.show();
            };

            //编辑入口
            this.update = function () {
                try {
                    this.node = JSON.parse(JSON.stringify(_this.currentNode.data));
                    this.new = false;
                    this.show();
                } catch (e) {

                }
            };

            this.hide = function () {
                _this.powerEditorShower = false;
            }
        };

        var AddModal = function () {
            var mode = "";
            this.btntext = "查看已关联文章";
            this.data = [{name: ""}, {name: "", time: ""}, {name: ""}];

            this.addCallBack = function (v, name, i) {
                _this.contentShow = false;
                if (name) {
                    _this.addModal.data[i].name = name;
                    _this.addModal.data[i].eid = v;
                } else {
                    _this.addModal.data[i].name = v.mainName;
                    _this.addModal.data[i].aid = v._id;
                }
            };

            this.view = function (i) {
                this.btntext = "文章加载中...";
                $(".powerloading").fadeIn(200);
                $scope.preview.showByMeetingId(this.data[i].aid, function () {
                    this.btntext = "查看已关联文章";
                    $(".powerloading").fadeOut(200);
                }.bind(this));
            };

            this.use = function (i) {
                mode = "use";
                _this.showContentList(mode);
                _this.addCallBack = function (v, name) {
                    this.addCallBack(v, name, i);
                }.bind(this);
            };

            this.create = function (i) {
                mode = "new";
                _this.showContentList(mode);
                _this.addCallBack = function (v, name) {
                    this.addCallBack(v, name, i);
                }.bind(this);
            };

            this.hide = function () {
                _this.powerAddShower = false;
            };

            this.show = function () {
                _this.powerAddShower = true;
                $timeout(function () {
                    $(".power-add-wrapper").unbind("click").click(function (e) {
                        if (e.target === e.currentTarget) {
                            _this.powerAddShower = false;
                            bubble.updateScope($scope);
                        }
                    });
                });
            };

            this.confirm = function () {
                if (!this.data[2].name) {
                    swal("请输入权利名称");
                    return;
                }

                if (!this.data[0].name && this.data[1].name) {
                    swal("请填写会议相关信息");
                    return;
                }

                var p = {
                    name: this.data[2].name,
                    wbid: _this.currentSite._id,
                    type: this.data[2].type,
                };

                if (this.data[0].name) {
                    if (this.data[0].aid) {
                        p.children = {linkId: this.data[0].aid, type: 0};
                    } else {
                        p.children = {existid: this.data[0].aid, type: 0};
                    }

                    if (this.data[1].name) {
                        if (this.data[1].aid) {
                            p.children.children = {
                                linkId: this.data[1].aid,
                                type: 1,
                                runCycle: parseInt(this.data[1].runCycle),
                                effectiveTime: parseInt(this.data[1].runCycle)
                            };
                        } else {
                            p.children.children = {
                                existid: this.data[1].aid,
                                type: 1,
                                runCycle: parseInt(this.data[1].runCycle),
                                effectiveTime: parseInt(this.data[1].runCycle)
                            };
                        }
                    }
                }
                $(".powerloading").fadeIn(200);
                bubble._call("power.add", bubble.replaceBase64(JSON.stringify(p))).success(function (v) {
                    $(".powerloading").fadeOut(200);
                    if (!v.errorcode) {
                        this.hide();
                        _this.siteTreeSelect(_this.currentSite);
                    } else {
                        swal("添加失败");
                    }
                }.bind(this));
            }
        };

        var PowerTypeModal = function () {
            var queue = [];             //更新队列
            var queueDone = 0;          //更新计数
            this.colors = ["text-success", "text-info", "text-warning", "text-primary"];
            this.json = "";             //临时变量,用于存储未同步的数据,并用于对比
            this.show = function () {
                _this.powerTypeShower = true;
                this.json = JSON.parse(JSON.stringify(_this.powerTypeList));
                $timeout(function () {
                    $(".power-type-wrapper").unbind("click").click(function (e) {
                        if (e.target === e.currentTarget) {
                            _this.powerTypeShower = false;
                            bubble.updateScope($scope);
                        }
                    });
                });
            };

            this.hide = function () {
                this.json = "";
                queueDone = 0;
                queue = [];
                _this.powerTypeShower = false;
            };

            this.confirm = function () {
                $(".powerloading").fadeIn(200);
                //执行队列
                for (var i = 0; i < queue.length; i++) {
                    if (queue[i].do == "delete") {
                        doDelete.call(this, queue[i].id);
                        queueDone++;
                    }
                    if (queue[i].do == "add") {
                        doAdd.call(this, queue[i].name);
                        queueDone++;
                    }
                }
                //对比修改
                for (var i = 0; i < _this.powerTypeList.length; i++) {
                    for (var n = 0; n < this.json.length; n++) {
                        if (this.json[n]._id == _this.powerTypeList[i]._id && this.json[n].name != _this.powerTypeList[i].name) {
                            doUpdate.call(this, this.json[n]);
                            queueDone++;
                        }
                    }
                }
            };
            //执行删除
            var doDelete = function (id) {
                bubble._call("powerType.delete", id).success(function (v) {
                    if (--queueDone == 0) {
                        this.hide();
                        _this.siteTreeSelect(_this.currentSite);
                    }
                    if (!v.errorcode) {
                        _this.powerTypeList.splice(i, 1);
                        this.json = JSON.parse(JSON.stringify(_this.powerTypeList));
                    } else {
                        swal("删除失败");
                    }
                }.bind(this));
            };
            //执行添加
            var doAdd = function (name) {
                bubble._call("powerType.add", bubble.replaceBase64(JSON.stringify({
                    name: name,
                    wbid: _this.currentSite._id
                }))).success(function (v) {
                    if (--queueDone == 0) {
                        this.hide();
                        _this.siteTreeSelect(_this.currentSite);
                    }
                    if (v.errorcode) {
                        swal("添加失败");
                    }
                }.bind(this));
            };
            //执行更改
            var doUpdate = function (v) {
                bubble._call("powerType.update", v._id, bubble.replaceBase64(JSON.stringify({name: v.name}))).success(function (v) {
                    if (--queueDone == 0) {
                        this.hide();
                        _this.siteTreeSelect(_this.currentSite);
                    }
                    if (v.errorcode) {
                        swal("添加失败");
                    }
                }.bind(this));
            };

            this.deleteType = function (v, i, e) {
                var o = $(e.target);
                this.json.splice(i, 1);
                queue.push({do: "delete", id: v._id});
            };

            this.insertType = function (e) {
                var o = $(e.target);
                var name = o.parents(".input-group:first").find("input").val();
                if (!name) {
                    return;
                }
                for (var i = 0; i < _this.powerTypeList.length; i++) {
                    if (name == _this.powerTypeList[i].name) {
                        swal("已存在该名称的分类");
                        return;
                    }
                }
                queue.push({do: "add", name: name});
                this.json.push({name: name});
                o.parents(".input-group:first").find("input").val("");
            }
        }
    };

    //待渲染完成后初始化各个类
    $timeout(function () {
        // new BatchWord().init();
        $scope.attachment = new Attachment().init();
        errorWord = new ErrorWord().init();
        $scope.pager = new Pager();
        $scope.search = new Search();
        $scope.preview = new Preview();
        animationBtn = new AnimationBtn().init().show();
        $scope.Mind = new Mind().init();
    });
});