'use strict';
bubbleFrame.register('contentController', function ($scope, bubble, $modal, $http, $rootScope, $timeout) {
    var author = $rootScope.logininfo && $rootScope.logininfo.name;
    var topcheckbox = $(".topbox input");
    var topnewscheckbox = $(".topbox-news input");
    var topsuffixcheckbox = $(".topbox-suffix input");
    var loadingbox = $(".contentbatchMask");
    var errorWord = null;      //错别字实例
    var animationBtn = null;      //机器人实例
    var pdfCacheContent = "";       //PDF上传前内容
    var upload = null;
    var editorNoUpdate = false;
    $scope.pager = null;           //分页实例
    var tmpNewsIdx = "";    //待发布区当前选择
    $scope.imgs = [];
    $scope.stateCh = ["待审核", "审核不通过", "审核通过"];

    $scope.hidepdf = function () {
        $scope.newItem.content = pdfCacheContent;
        $scope.newItem.type = 1;
        setPdf();
    };

    $scope.siteconfig = {
        title: "栏目关联",
        type: "onlyGovColumn",
        multiple: false,
        method: {},
        closeOnSelected: true,
        onConfirm: function (v) {
            $scope.newItem.GovId = v[0].id;
            $scope.save();
        }
    };

    bubble._call("site.find", {_id: window.localStorage.siteid}).success(function (v) {
        $scope.saveToGovBtn = v[0].GovUserName && v[0].GovCode;
    });

    $scope.$watch("newItem", function (n) {
        if (n) {
            $scope.thirdParty && $scope.thirdParty.hide(undefined, true);
        } else {
            $scope.thirdParty && $scope.thirdParty.show(true);
        }
    });

    $scope.setTop = function (v, type) {
        loadingbox.fadeIn(200);
        bubble._call(type ? "content.SetTop" : "content.cancelTop", v._id).success(function (v) {
            if (!v.errorcode) {
                swal(type ? "文章已置顶" : "文章已取消置顶");
            } else {
                swal(type ? "置顶失败" : "取消置顶失败");
            }
            $scope.pager.getData();
        });
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

    $scope.getMaxDate = function () {
        return new Date().Format("yyyy-MM-dd hh:mm:ss");
    };

    $scope.updateLocalStorage = function () {
        if ($scope.mode == "new" && $scope.newItem)
            window.localStorage.backContent = JSON.stringify($scope.newItem);
    };

    // KindEditor.plugin('hello', function (K) {
    //     var editor = this, name = 'hello';
    //     // 点击图标时执行
    //     editor.clickToolbar(name, function () {
    //         $scope.openFile(function (v) {
    //             if (v.filetype != 1) {
    //                 swal("请选择图片文件");
    //                 return;
    //             }
    //             v.filepathfull = bubble.getInterface("upload").visible + v.filepath.replace(/\\/g, "/");
    //             editor.appendHtml("<img src='" + v.filepathfull + "' />");
    //             $scope.fileControl.close();
    //         })
    //     });
    // });

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
            'table', 'hr', 'baidumap', 'link', 'unlink'
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
            // if (html.indexOf("<table") >= 0 && html.indexOf("ke-zeroborder") >= 0) {
            //     var $tmp = $(html);
            //     $tmp.find("table").removeClass("ke-zeroborder").attr("border", "1").html();
            //     $scope.newItem && ($scope.newItem.content = $tmp.html());
            //     this.html($scope.newItem.content);
            // }
            $scope.error = html !== "";
            var text = this.text();
            //var reg = /[\u4e00-\u9fa5]/g;
            //text = text.match(reg);
            //text = text ? text.join("") : "";
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

    topcheckbox.change(function (v) {
        $scope.newItem.attribute = this.checked ? "1" : "0";
        if (this.checked)
            topnewscheckbox[0].checked = false;
        bubble.updateScope($scope);
    });

    topnewscheckbox.change(function (v) {
        $scope.newItem.attribute = this.checked ? "2" : "0";
        if (this.checked)
            topcheckbox[0].checked = false;
        bubble.updateScope($scope);
    });

    topsuffixcheckbox.change(function (v) {
        $scope.newItem.isSuffix = this.checked ? "1" : "0";
        bubble.updateScope($scope);
    });

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
    $scope.fileControl = {
        onSelect: function (v) {
        }
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

    $scope.newMove = function (v) {
        bubble.customModal("columnMoveModal.html", "columnMoveController", "lg", {
            colmun: $scope.list,
            newItem: $scope.newItem
        }, function (v) {
            for (var i = 0; i < $scope.news.length; i++) {
                if ($scope.news[i]._id === $scope.newItem._id) {
                    $scope.news.splice(i, 1);
                    $scope.newItem = "";
                    return;
                }
            }
        });
    };

    $scope.columnPicker = function (v) {
        bubble.customModal("columnMoveModal.html", "columnMoveController", "lg", {
            colmun: $scope.list,
            mode: "picker"
        }, function (v) {
            columnChange(v, true);
        });
    };

    $scope.newsClick = function (v) {
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

    //置顶
    $scope.top = function (v, i, e) {
        bubble._call("content.update", v._id, bubble.replaceBase64(JSON.stringify({attribute: v.attribute == "1" ? "0" : "1"})).success(function (rs) {
            if (!rs.errorcode) {
                v.attribute = v.attribute == "1" ? "0" : "1";
                $scope.newItem && (topcheckbox[0].checked = $scope.newItem.attribute == "1");
                $scope.newItem && (topsuffixcheckbox[0].checked = $scope.newItem.isSuffix == "1");
                return;
            }
            swal("置顶失败");
        }));
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

    $scope.weixinPush = function (v) {
        var ids = [];
        if (v) {
            ids.push(v);
        } else {
            for (var i = 0; i < $scope.news.length; i++) {
                var t = $scope.news[i];
                if (t.deleteCheck) {
                    ids.push(t);
                }
            }
        }
        $scope.sdkconfig.method.show();
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
                    $(".contentbatchMask").fadeOut(200);
                    $scope.newItem = null;
                    $(".loading-spinner p").remove();
                    f && swal("发布成功");
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

    $scope.saveToGov = function () {
        $scope.siteconfig.method.show();
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
            $(".contentbatchMask").fadeIn(200);
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
                bubble._call("content.add", bubble.replaceBase64(JSON.stringify(p))).success(function (v) {
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
                        $scope.news.unshift(v);
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
                    continueAppend || $(".contentbatchMask").fadeOut(200);
                });
            } else {
                bubble._call("content.update", p._id, bubble.replaceBase64(JSON.stringify(p))).success(function (v) {
                    if (v.errorcode) {
                        swal("发布失败");
                    } else {
                        continueAppend || swal("发布成功");
                        continueAppend || ($scope.newItem = null);
                        continueAppend && continueAppend(p._id, p, true);
                        $scope.newItem = null;
                        bubble.updateScope($scope);
                    }
                    $(".btn-save").html("发布");
                    window.localStorage.backContent = "";
                    $(".contentbatchMask").fadeOut(200);
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
        $(".contentbatchMask").fadeIn(200);
        for (var i = 0; i < d.length; i++) {
            (function (p) {
                p.time = Date.parse(p.time);
                p.isvisble = 0;
                var continueAppend = getChunk(p);
                bubble._call("content.add", bubble.replaceBase64(JSON.stringify(p))).success(function (v) {
                    if (v.errorcode) {
                        count++;
                        return;
                    }
                    count++;
                    continueAppend && continueAppend(v._id, v, count == d.length);
                    $scope.news.unshift(v);
                    if (count == d.length) {
                        if (!continueAppend) {
                            $(".contentbatchMask").fadeOut(200);
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
    //文件选择中选择图片
    var imgSelect = function (v) {
        if (v.filetype != 1) {
            swal("请选择图片文件");
            return;
        }
        $scope.newItem.image = v.filepath.indexOf("http") < 0 ? bubble.getInterface("upload").visible + v.filepath.replace(/\\/g, "/") : v.filepath;
        $scope.fileControl.close();
        bubble.updateScope($scope);
    };
    //打开图片文件选择
    $scope.openFile = function (fn) {
        $scope.fileControl.open();
        $scope.fileControl.onSelect = fn ? fn : imgSelect;
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
            return v && doc.indexOf(v.toLowerCase()) >= 0;
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
            // modified by wuren at 20180706 支持视频文件
            uploader = WebUploader.create({
                dnd: '.content-info-box',
                swf: './js/modules/webuploader/Uploader.swf',
                server: bubble.getUploadServer(),
                disableGlobalDnd: true,
                auto: true,
                accept: {
                    title: 'File',
                    extensions: 'doc,docx,xlsx,xlsm,pdf,xls,gif,jpg,jpeg,bmp,png,3gp,mp4,rmvb,mov,avi,m4v',
                    mimeTypes: '.doc,.docx,.xlsx,.xlsm,.pdf,.xls,image/gif,image/jpg,image/jpeg,image/bmp,image/png,video/*,audio/*,application/*'
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
                $(".contentbatchMask").fadeIn(200);
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
                        $(".contentbatchMask").fadeOut(200);
                        return;
                    }
                    file.ele.removeClass("alert-info").addClass("alert-success");
                    file.ele.find(".process").width(0);
                    // file.ele.click(function () { _this.insertDoc.call(this, v) });
                    _this.insertDoc.call(file.ele[0], v);
                } else {
                    if (!v.errorcode && $scope.imgs.indexOf(bubble.getInterface("upload").visible + v.filepath.replace(/\\/g, "/")) < 0) {

                        $scope.imgs.push(bubble.getInterface("upload").visible + v.filepath.replace(/\\/g, "/"));

                        // modified by wuren at 20180706 支持视频文件
                        var html = "<img src='" + $scope.imgs[$scope.imgs.length - 1] + "' />";
                        var ext = file.ext.toLowerCase();
                        if (ext == "mp4" || ext == "3gp" || ext == "rmvb" || ext == "mov" || ext == "avi" || ext == "m4v") {
                            html = '&nbsp;<video src="' + $scope.imgs[$scope.imgs.length - 1] + '" controls>';
                            html += '你的浏览器不支持video标签';
                            html += '</video>&nbsp;';
                        }

                        editor.appendHtml(html);
                        $scope.newItem.content = editor.html();
                        bubble.updateScope($scope);
                    } else {
                        swal("上传失败");
                    }
                    $(".contentbatchMask").fadeOut(200);
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
                $(".contentbatchMask").fadeOut(200);
                bubble.updateScope($scope);
            } else {
                $(this).find("i").show();
                $(".contentbatchMask").fadeIn(200);
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
                        $(".contentbatchMask").fadeOut(200);
                    }
                    $(this).fadeOut(500, function () {
                        $(this).remove();
                    }.bind(this));
                    bubble.updateScope($scope);
                }.bind(this));
            }
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
        var searchAll = false;
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
            searchAll = false;
        };

        this.setParameter = function (v, o) {
            if (typeof v === 'object') {
                for (var tmp in v) {
                    _this.parameter.push({field: tmp, logic: "like", value: v[tmp]});
                }
            } else {
                _this.parameter = [];
            }
            searchAll = o == "all";
            _this.getData(searchAll);
        };

        this.getData = function (v) {
            loadingbox.fadeIn(200);
            // $scope.newItem = null;
            if (!currentId) {
                return;
            }
            if (!searchAll) {
                var par = [{field: "ogid", logic: "=", value: currentId}].concat(_this.parameter);
            } else {
                var par = _this.parameter;
            }
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
                        $scope.thirdParty.replace(v);
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

        this.searchAll = function () {
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
            $scope.pager.setParameter(p, "all");
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

    //预览
    var Preview = function () {
        var _this = this;
        var box = $(".preview-wrap");

        this.show = function (v) {
            box.fadeIn(200);
            this.initHtml(v);
        };

        this.hide = function () {
            box.fadeOut(200);
        };

        this.initHtml = function (v) {
            var d = v ? v : $scope.newItem;
            box.find("h3").html(d.mainName);
            box.find(".content-info").html("").append('<span> 来源: ' + d.souce + ' </span><span> 发布时间：' + new Date(isNaN(d.time) ? d.time : parseInt(d.time)).Format("yyyy-MM-dd hh:mm:ss") + ' </span><span> 作者：' + d.author + ' </span>');
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
        })
    };

    $scope.pushToWechat = function (v) {
        var pushItem = [];
        var p = "";

        if (pushItem.length > 8) {
            swal("一次最多只能推送8篇文章");

        }
    };

    //推送辅助窗口
    var PushConfig = function () {
        var _this = this;
        var box = $(".push-config-wrap");
        var type = "";
        var pushItem = [];
        var siteList = [];
        var data = {};
        var currentColumn = 0;

        this.show = function (t, v) {
            box.fadeIn(200);
            type = t;
            this.typename = type == "up" ? "上级" : "下级";
            if (v) {
                pushItem = [JSON.parse(JSON.stringify(v))];
            } else {
                for (var i = 0; i < $scope.news.length; i++) {
                    if ($scope.news[i].deleteCheck) {
                        pushItem.push(JSON.parse(JSON.stringify($scope.news[i])));
                    }
                }
            }

            initList();
        };

        this.init = function () {
            box.unbind("click").click(function (e) {
                if (e.target === e.currentTarget) {
                    _this.hide();
                }
            });
            return this;
        };

        this.hide = function () {
            box.fadeOut(200);
            box.find(".cur").removeClass("cur");
            siteList = [];
            pushItem = [];
            currentColumn = 0;
            type = "";
            switchStep(false);
        };

        var switchStep = function (v) {
            if (v) {
                box.find(".sitelist").fadeOut(200);
                box.find(".process-box").fadeIn(200);
                box.find(".push-column-btn").hide();
                box.find(".push-back-btn").show();
                box.find(".push-next-btn").show();
                box.find(".push-prev-btn").show();
                box.find(".push-config-box").addClass("min");
            } else {
                box.find(".sitelist").fadeIn(200);
                box.find(".columnlist").remove();
                box.find(".process-box").fadeOut(200).find(".step").html("");
                box.find(".push-column-btn").show();
                box.find(".push-next-btn").hide();
                box.find(".push-prev-btn").hide();
                box.find(".push-back-btn").hide();
                box.find(".push-config-box").removeClass("min");
            }
        };

        this.siteOk = function () {
            // bsStep(0);
            if (!siteList.length) {
                swal("请先选择推送单位");
                return;
            }
            var columnData = [];
            var count = 0;
            loadingbox.fadeIn(200);
            switchStep(true);
            for (var i = 0; i < siteList.length; i++) {
                box.find(".step").append('<li> <a>' + (siteList[i].name.length > 4 ? siteList[i].name.substring(0, 4) + "..." : siteList[i].name) + '</a> </li>');
                (function (n) {
                    bubble._call("column.getpush", siteList[i].id).success(function (v) {
                        columnData[n] = v;
                        if (++count == siteList.length) {
                            initColumn(columnData);
                            loadingbox.fadeOut(200);
                        }
                    });
                })(i)
            }
            box.find(".step").append('<li> <a>完成</a> </li>').find("li:first").addClass("active");
            box.find(".step li").unbind("click").click(function () {
                var idx = $(this).index();
                columnJump(idx);
                currentColumn = idx;
                initBtnDisabled();
            });
        };

        //返回站点选择,丢弃所有栏目选择信息
        this.backToSite = function () {
            switchStep(false);
        };

        //跳至某站点栏目选择
        var columnJump = function (idx) {
            var o = box.find(".step");
            o.find("li").removeClass("active");
            for (var i = 0; i <= idx; i++) {
                o.find("li:eq(" + i + ")").addClass("active");
            }
            box.find(".columnlist").hide().eq(idx).fadeIn(200);
        };

        var initBtnDisabled = function () {
            if (currentColumn == siteList.length) {
                box.find(".push-next-btn").attr("disabled", "disabled");
                box.find(".push-prev-btn").removeAttr("disabled");
                initInfoBox();
                return;
            }
            if (currentColumn == 0) {
                box.find(".push-prev-btn").attr("disabled", "disabled");
                box.find(".push-next-btn").removeAttr("disabled");
                return;
            }
            box.find(".push-prev-btn").removeAttr("disabled");
            box.find(".push-next-btn").removeAttr("disabled");
        };

        //下一个站点栏目选择
        this.next = function () {
            columnJump(++currentColumn);
            initBtnDisabled();
        };

        //上一个站点栏目选择
        this.prev = function () {
            columnJump(--currentColumn);
            initBtnDisabled();
        };

        var regColumnItemEvent = function (x) {
            //栏目选择
            box.find(".columnlist:last .item").unbind("click").click(function () {
                //直接发布取消所有已选项
                if (!this.id) {
                    box.find(".columnlist:eq(" + x + ") .item").removeClass("cur");
                    $(this).addClass("cur");
                    siteList[x].column = [{id: "-1", name: "直接推送"}];
                    return;
                }
                if (siteList[x].column[0] && siteList[x].column[0].id == "-1") {
                    siteList[x].column = [];
                    box.find(".columnlist:eq(" + x + ") .item:first").removeClass("cur");       //取消直接发布
                }
                if ($(this).hasClass("cur")) {
                    for (var i = 0; i < siteList[x].column.length; i++) {
                        if (this.id.split("_")[0] == siteList[x].column[i].id) {
                            $(this).removeClass("cur");
                            siteList[x].column.splice(i, 1);
                            return;
                        }
                    }
                } else {
                    siteList[x].column.push({id: this.id.split("_")[0], name: this.id.split("_")[1]});
                    $(this).addClass("cur");
                }
            });
        };

        var initInfoBox = function () {
            var html = '';
            var emptyNum = 0;
            for (var i = 0; i < siteList.length; i++) {
                var std = "<td rowspan='" + (siteList[i].column.length) + "'>" + siteList[i].name + "</td>";
                for (var n = 0; n < siteList[i].column.length; n++) {
                    var e = siteList[i].column[n];
                    if (std) {
                        html += "<tr>" + std + "<td class='" + (e.id == "-1" ? "text-info" : "") + "'>" + e.name + "</td></tr>";
                        std = "";
                    } else {
                        html += "<tr><td class='" + (e.id == "-1" ? "text-info" : "") + "'>" + e.name + "</td></tr>";
                    }
                }
                if (!siteList[i].column.length) {
                    html += "<tr>" + std + "<td class='text-danger'>尚未选择栏目</td></tr>";
                    emptyNum++;
                }
            }
            var btn = emptyNum == siteList.length ? '<button type="button" disabled class="btn btn-info">请至少选中一个站点的栏目</button>' : '<button type="button" class="btn btn-info">确认推送</button>';
            html += '<tr><td colspan="2" class="text-right">' + btn + '</td></tr>';
            box.find(".columnlist table").html("").append(html);
            box.find(".columnlist table button").unbind("click").click(send);
        };

        //初始化各站点栏目列表
        var initColumn = function (v) {
            var obj = "";
            for (var i = 0; i < v.length; i++) {
                obj = $('<div class="columnlist' + (i > 0 ? " none" : "") + '"></div>');
                box.find(".content-box").append(obj);
                obj.append('<div class="subtitle">' + siteList[i].name + '可推送栏目选择</div>');
                obj.append('<div class="item text-info">直接推送<b>(选择该项后会直接推送至目标单位,由该单位管理员选择文章所在栏目)</b></div>');
                for (var n = 0; n < v[i].length; n++) {
                    obj.append('<div class="item" id="' + v[i][n]._id + "_" + v[i][n].name + '">' + v[i][n].name + '</div>');
                }
                regColumnItemEvent(i);
            }

            var obj = $('<div class="columnlist none"><p class="text-danger">若站点未选择任何栏目,则推送时将会忽视该站点<p><table class="table table-bordered"></table></div>');
            box.find(".content-box").append(obj);

            currentColumn = 0;
            initBtnDisabled();
        };

        var initList = function () {
            box.find(".content-box").html('<div class="tipsbox">暂无可推送平台</div>');
            if (type == "up") {
                if (data.up) {
                    renderList(data.up);
                } else {
                    loadingbox.fadeIn(200);
                    bubble._call("site.getFather", 1, 1000, window.localStorage.siteid).success(function (v) {
                        data.up = bubble.getTreeDataByFatherid(v.data, "_id", window.localStorage.siteid);
                        renderList(data.up);
                        loadingbox.fadeOut(200);
                    });
                }
            } else {
                if (data.down) {
                    renderList(data.down);
                } else {
                    loadingbox.fadeIn(200);
                    bubble._call("site.getChild", window.localStorage.siteid).success(function (v) {
                        data.down = bubble.getTreeDataByFatherid(v, "_id", window.localStorage.siteid);
                        renderList(data.down);
                        loadingbox.fadeOut(200);
                    });
                }
            }
        };

        var initListHtml = function (v, name, key, fn) {
            var title = '<div class="subtitle">' + name + '</div>';
            var html = "";
            var cb = function (v, l) {
                l = l === undefined ? 0 : l;
                for (var i = 0; i < v.length; i++) {
                    html += '<div style="margin-left:' + 15 * l + 'px" class="item" id="' + v[i]._id + "_" + v[i].title + '">' + v[i][key] + '</div>';
                    if (v[i].children) {
                        cb(v[i].children, l + 1);
                    }
                }
            };
            cb(v);
            var t = $("<div class='sitelist'>" + title + html + "</div>");
            t.find(".item").click(fn);
            box.find(".content-box").html("").append(t);
            box.find(".tipsbox").hide();
        };

        var renderList = function (v) {
            box.find(".pushcolumnbox").remove();
            v && v.length ? (box.find(".push-column-btn").show(), initListHtml(v, type == "up" ? "父级单位" : "下级单位", "title", function (e) {
                if (!$(this).hasClass("cur")) {
                    $(this).addClass("cur");
                    siteList || (siteList = []);
                    siteList.push({id: this.id.split("_")[0], name: this.id.split("_")[1], column: []});
                } else {
                    for (var i = 0; i < siteList.length; i++) {
                        if (this.id.indexOf(siteList[i].id) >= 0) {
                            $(this).removeClass("cur");
                            siteList.splice(i, 1);
                            return;
                        }
                    }
                }
            })) : box.find(".push-column-btn").hide();
        };

        var send = function () {
            var tocolum = {};
            var tosite = [];
            var callcount = 0;
            var callnum = 0;
            var hasError = false;

            for (var i = 0; i < siteList.length; i++) {
                for (var n = 0; n < siteList[i].column.length; n++) {
                    var e = siteList[i].column[n];
                    if (e.id == "-1") {
                        tosite.push(siteList[i].id);
                    } else {
                        tocolum[siteList[i].id] || (tocolum[siteList[i].id] = []);
                        tocolum[siteList[i].id].push(e.id);
                    }
                }
                tocolum[siteList[i].id] && (tocolum[siteList[i].id] = tocolum[siteList[i].id].join(","));
            }

            loadingbox.fadeIn(200);

            var a = pushItem[0];

            a.time = typeof a.time === "string" ? Date.parse(a.time) : a.time;
            delete a.$$hashKey;
            delete a.deleteCheck;
            //类型处理
            a.attribute = parseInt(a.attribute);
            a.sort = parseInt(a.sort);
            a.isdelete = parseInt(a.isdelete);
            a.isvisble = parseInt(a.isvisble);
            a.state = parseInt(a.state);
            a.slevel = isNaN(parseInt(a.slevel)) ? 0 : parseInt(a.slevel);
            a.substate = parseInt(a.substate);
            a.readCount = a.readCount ? parseInt(a.readCount) : a.readCount;

            if (tosite.length) {
                callnum++;
                bubble._call("content.push", tosite.join(","), bubble.replaceBase64(JSON.stringify(a))).success(function (v) {
                    if (++callcount == callnum) {
                        loadingbox.fadeOut(200);
                        if (!v.errorcode) {
                            _this.hide();
                            swal("推送成功");
                        } else {
                            swal(v.message);
                        }
                    }
                });
            }

            if (Object.getOwnPropertyNames(tocolum).length) {
                callnum++;
                bubble._call("content.pushToColumn", JSON.stringify(tocolum), a).success(function (v) {
                    if (++callcount == callnum) {
                        loadingbox.fadeOut(200);
                        _this.hide();
                        swal("推送成功");
                    } else {
                        swal(v.message);
                    }
                });
            }
        }
    };
    //动画人物按钮
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

    var ThirdParty = function () {
        var _this = this;
        var current = "";       //当前平台信息
        var box = $(".content-wechat-tmp-box");
        var list = [];
        var s = false;      //是否界面切换隐藏

        this.init = function () {
            return this;
        };
        //隐藏
        this.hide = function (e, isSwitch) {
            if (isSwitch) {
                s = box.css("opacity") == 1;
            }
            box.css("opacity", 0);
            setTimeout(function () {
                box.hide();
            }, 200);
            e && e.stopPropagation();
        };
        //显示
        this.show = function (isSwitch) {
            if (isSwitch && !s) {
                return;
            }
            box.show();
            box.css("opacity", 1);
        };
        //最小化
        this.min = function (e) {
            box.addClass("min");
            box.find("small").fadeOut(100);
            box.find("i").fadeOut(100);
            e && e.stopPropagation();
        };
        //最大化
        this.max = function () {
            box.removeClass("min");
            box.find("small").fadeIn(100);
            box.find("i").fadeIn(100);
        };
        var registerEvent = function () {
            box.find(".itembtn .up").unbind("click").click(function () {
                var index = $(this).parent().parent().index();
                var tmp = list[index];
                list[index] = list[index - 1];
                list[index - 1] = tmp;
                renderList();
            });

            box.find(".itembtn .down").unbind("click").click(function () {
                var index = $(this).parent().parent().index();
                var tmp = list[index];
                list[index] = list[index + 1];
                list[index + 1] = tmp;
                renderList();
            });

            box.find(".itembtn .remove").unbind("click").click(function (e) {
                var id = $(this).parent().parent()[0].id.split("_").pop();
                box.find("#witem_" + id).remove();
                for (var i = 0; i < list.length; i++) {
                    if (id == list[i]._id) {
                        delete list[i].wechatCheck;
                        list.splice(i, 1);
                    }
                }
                bubble.updateScope($scope);
                if (list.length == 0) {
                    _this.hide(e);
                    current = "";
                    return;
                }
                renderList();
            });
        };

        var renderList = function () {
            box.find("#mCSB_1_container").html("");
            for (var i = 0; i < list.length; i++) {
                box.find("#mCSB_1_container").append(getItem(list[i], i + 1));
            }
            registerEvent();
        };

        var getItem = function (v, i) {
            i = i ? i : list.length;
            var id = v._id;
            var iclass = i == 1 ? 'hitem' : "item b-t" + (i == 8 ? " b-b" : "");
            var desc = v.mainName.length > 20 ? v.mainName.substring(0, 20) + "..." : v.mainName;
            var down = i == 8 || i == list.length ? "none" : "";
            var up = i == 1 ? "none" : "";

            return '<div id="witem_' + id + '" class="' + iclass + '"> <img src="' + v.image + '"> <div class="desc">' + desc + '</div><div class="itembtn"> <div class="up ' + up + '"> <i class="fa fa-arrow-up"></i> </div> <div class="down ' + down + '"> <i class="fa fa-arrow-down"></i> </div> <div class="remove"> <i class="glyphicon glyphicon-trash transition"></i> </div> </div></div>';
        };
        //对象内容地址变更后替换原指针,防止数据无法同步
        this.replace = function (v) {
            for (var i = 0; i < list.length; i++) {
                if (list[i]._id == v._id) {
                    if (list[i].wechatCheck) {
                        v.wechatCheck = true;
                    }
                    list[i] = v;
                    return;
                }
            }
        };
        //添加
        this.add = function (v) {
            if (!current) {
                _this.partyChose(v);
                return;
            }
            _this.show();
            var idx = list.indexOf(v);
            if (idx >= 0) {
                // swal("该文章已经在等待推送列表中");
                box.find("#witem_" + list[idx]._id).find(".remove").trigger("click");
                return;
            }
            if (list.length == 8) {
                swal("最多只能推送8篇文章");
                return;
            }
            list.push(v);
            v.wechatCheck = true;
            renderList();

            var img = box.find(".hitem").find("img")[0];
            if (img && img.complete) {
                $(img).css("top", (140 - img.height) / 2 + "px");
            } else {
                img.onload = function () {
                    $(img).css("top", (140 - img.height) / 2 + "px");
                }
            }
            box.find(".wechat-itembox").mCustomScrollbar("scrollTo", "bottom");
        };
        //平台选择
        this.partyChose = function (item) {
            bubble.customModal("pushToWechatModal.html", "pushToWechatController", "lg", {}, function (v) {
                current = v;
                item && _this.add(item);
            });
        };
        this.getSdkName = function () {
            return current.name;
        };
        var getSymbolData = function () {
            var pushItem = [];
            var p = "";
            for (var i = 0; i < list.length; i++) {
                pushItem.push(list[i]._id);
            }
            return pushItem.join(",");
        };
        //推送
        this.push = function () {
            if (!list.length) {
                return;
            }
            swal({
                title: "确定要推送吗?",
                text: "推送操作无法撤销",
                icon: "warning",
                buttons: {
                    cancel: "取消",
                    defeat: "推送",
                },
            }).then(
                function (s) {
                    if (s) {
                        loadingbox.fadeIn(200);
                        bubble._call("wechatUser.pushtowechat", current.id, getSymbolData()).success(function (v) {
                            loadingbox.fadeOut(200);
                            swal(v.message ? v.message : v.data);
                        });
                    }
                });
        };
        //保存至库
        this.save = function () {
            if (!list.length) {
                return;
            }
            loadingbox.fadeIn(200);
            bubble._call("wechatUser.savetowechat", current.id, getSymbolData()).success(function (v) {
                loadingbox.fadeOut(200);
                swal(v.message ? v.message : v.data);
            });
        }
    };

    //待渲染完成后初始化各个类
    $timeout(function () {
        // new BatchWord().init();
        $scope.attachment = new Attachment().init();
        $scope.thirdParty = new ThirdParty().init();
        errorWord = new ErrorWord().init();
        $scope.pager = new Pager();
        $scope.search = new Search();
        $scope.preview = new Preview();
        $scope.pushConfig = new PushConfig().init();
        animationBtn = new AnimationBtn().init().show();
    });
});
//文章移动栏目控制器
bubbleFrame.register("columnMoveController", function (bubble, items, $scope, $modalInstance, $timeout) {
    var current = "";
    //阻止展开收起触发select
    var stop = function () {
        $timeout(function () {
            $(".tree-icon").length ? $(".tree-icon").click(function (e) {
                e.stopPropagation();
            }) : stop();
        }, 20);
    };
    stop();
    $scope.data = bubble.getTreeData(items.colmun, "_id", false, function (v) {
        v.label = v.name;
    });
    $scope.data = [{label: "根栏目", _id: {$oid: 0}, children: $scope.data}];

    $scope.onSelect = function (v) {
        if (!v.expanded && items.mode && items.mode === "picker" && v.label != "根栏目") {
            $modalInstance.close(v);
            return;
        }
        v.label != "根栏目" && (current = v);
    };
    $scope.tree = {};

    $scope.ok = function (e) {
        if (current == "") {
            $modalInstance.dismiss('cancel');
            return;
        }
        if (current._id === items.newItem.ogid) {
            swal("当前选择单位与新闻所在栏目相同");
            return;
        }
        bubble.toggleModalBtnLoading(e, true);
        bubble._call("content.update", items.newItem._id, bubble.replaceBase64(JSON.stringify({ogid: current._id}))).success(function (v) {
            if (!v.errorcode) {
                $modalInstance.close();
            } else {
                bubble.toggleModalBtnLoading(e, false);
                swal("新闻移动失败");
            }
        });
    };

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});

bubbleFrame.register("pushToWechatController", function (bubble, items, $scope, $modalInstance, $timeout) {
    $scope.ptlist = [];
    $scope.ulist = [];
    $scope.colors = ["bg-primary lter", "bg-info", "bg-success dk", "bg-warning dk", "bg-danger lter", "bg-primary dk"];
    $scope.disabled = true;
    $scope.step1 = true;
    $scope.step2 = false;
    bubble._call("wechat.page", 1, 100).success(function (v) {
        if (!v.errorcode) {
            $scope.ptlist = v.data;
        } else {
            swal(v.message);
        }
    });

    $scope.stepChange = function () {
        $scope.disabled = true;
        $scope.step1 = true;
        $scope.step2 = false;
        $scope.ulist = [];
    };

    $scope.push = function (v) {
        $modalInstance.close(v);
    };

    $scope.getUser = function (v) {
        bubble._call("wechatUser.pageBy", 1, 100, [{field: 'platid', logic: '==', value: v.id}]).success(function (v) {
            if (!v.errorcode) {
                $scope.ulist = v.data;
                if (v.data.length) {
                    $scope.disabled = false;
                    $scope.step1 = false;
                    $scope.step2 = true;
                } else {
                    swal("该平台暂无帐号信息");
                }
            } else {
                swal(v.message);
            }
        });
    };

    $scope.ok = function (e) {
        bubble.toggleModalBtnLoading(e, true);
        var s = "";
        for (var i = 0; i < $scope.ulist.length; i++) {
            var e = $scope.ulist[i];
            if (e.select) {
                s = e;
                break;
            }
        }
        if (s) {
            bubble._call("wechatUser.pushtowechat|17", bubble.getAppId(), s._id, items).success(function (v) {
                swal(v.data ? v.data : v.message);
                $modalInstance.close('cancel');
            });
        } else {
            swal("请选中一个用户");
        }
    };

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});