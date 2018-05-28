/**
 * Copyright © 2015 浙江托普仪器有限公司 - All Rights Reserved.
 * 摘    要：表格分页封装(新增,删除,修改,查看,搜索,批量删除,自定义类似删除功能)
 * 作    者：zhangyc
 * 版    本: 1.3.1
 * 日    期：2015-10-21 上午18:30
 *
 */
(function ($) {
    var opts;
    $.fn.toptab = function (options) {
        //var $selector=$(this).selector;
        var defaults = {
            reloadURL: '',
            listURL: '',//列表查询的URL
            data: {//Ajax中的data参数
                pageNo: 1,
                pageSize: 12
            },
            callback: $.noop,//列表查询的回调函数(该函数返回Ajax请求成功后所封装的数据;如将Ajax返回的数据封装成tr格式的数据)
            nodata: $.noop,//列表查询结果无数据时的回调函数
            resultsLlistName: 'list',//查询结果中数据集合的json属性名称
            checkBox: true,//是否显示复选框
            bodyElement: 'tbody',//存放内容的html元素
            winDialog: [],//预生成artDialog窗口[{element: '.edit_item',w: 520,h: 420,title:'',quickClose:false}]
            customBtn: false,//自定义底部批量操作按钮(如:批量删除)
            batchBtnSelector: '#delete_items',//批量操作按钮(默认为:批量删除#delete_items)
            delCallback: $.noop,//(全选删除,单个删除)成功时的回调
            delSuccessHandle: true,//(全选删除,单个删除)删除成功时的处理(true:刷新列表,false:js高亮后隐藏行,function(id){}:回调函数,参数为tr的id[如:#id1,#id2])
            delFailureHandle: false,//(全选删除,单个删除)删除失败时的处理(true/false:使用默认提示信息,function(data.code,data.msg){回调函数,参数为code和msg[code<>200的回调处理]}:)
            customSimilarDel: [//单个操作功能(如:停止功能 >> 需求 [提示信息,回调函数自定义])
                //{
                //    elementId: '.stop_item',
                //    confirmMsg: '确定要停止吗？',
                //    successMsg: '停止成功',
                //    failureMsg: '停止失败',
                //    callback: $.noop,
                //    successHandle:true,
                //    failureHandle:false
                //}
            ],
            batchHandle: [//批量操作功能(如:批量删除 >> 需求 [提示信息,回调函数自定义])
                //{
                //    elementId: '#handle_items',
                //    confirmMsg: '确定要操作吗？',
                //    successMsg: '操作成功',
                //    failureMsg: '操作失败',
                //    callback: $.noop,//回调函数()
                //    successHandle: true,//操作返回200时处理(true:刷新列表 , function: 执行回调, 其它: 高亮后隐藏)
                //    failureHandle: false//操作返回500(非200)时处理(function:执行回调,其它:alart提示信息)
                //}
            ],
            pageContainer: 'pagination',
            pageNum:10,//生成分页链接个数
            searchElement: '',//必须与searchCallback属性配合使用,查询按钮html元素(如果页面中有按条件查询功能,这里写成: 如按钮的id='search'就填searchElement: '#search')
            searchCallback: $.noop,//必须与searchElement属性配合使用,可代替data属性(该函数返回Ajax中的data参数)
            searchDefPageNo: 1,//搜索功能默认页
            searchValidate: function () {//搜索条件验证函数
                return true;
            },
            loading: true, //分页数据载入时是否显示正在加载的提示
            dataLoadAfterCallback: function () {//分页数据载入html元素和其它绑定结束后的回调
            },
            checkCallback: function () {//单个选和全选change后的回调
            }
        };
        opts = options = $.extend({}, defaults, options || {});
        if (options.searchElement) {
            //通过调用回调函数获得查询参数
            opts.data = options.data = $.extend({}, options.data, options.searchCallback() || {});
        }
        if (options.searchElement) {
            //绑定查询按钮的点击事件
            $(options.searchElement).on('click', function (e, autoClick) {
                e.stopPropagation();
                var $flag = options.searchValidate(autoClick);
                if ($flag) {
                    if (options.searchDefPageNo > 0) {
                        options.data.pageNo = options.searchDefPageNo;
                    }
                    $.fn.goTOPage(options.data.pageNo, options);
                }
            });
        }
        //默认执行列表查询
        $.fn.goTOPage(options.data.pageNo, options);
    };

    var methods = {
            /**
             * 分页列表查询
             * @param $pageNo 当前页数
             */
            tList: function ($pageNo, options) {
                if (!opts) {
                    //开发过程中,错误调用此函数时被执行
                    methods.tDefArtDialog("系统出错了！");
                    return;
                }
                if (!options) {
                    options = opts;
                }
                //处理当前页数
                var _pageNo;
                if (arguments.length > 0 && $pageNo != undefined) {//(传参数时)
                    _pageNo = $pageNo;
                } else {//(未传参数时)
                    _pageNo = options.data.pageNo;
                }
                if (options.searchElement) {
                    //通过调用回调函数获得查询参数
                    options.data = $.extend({}, options.data, options.searchCallback() || {});
                }
                //将当前页数赋值给options.data.pageNo
                options.data.pageNo = _pageNo;

                $.ajax({
                    beforeSend: function () {
                        if (options.loading) {
                            dialog({fixed: false, id: 'loading', className: 'ui-popup-noborder'}).show();
                        }
                    },
                    complete: function () {
                        var d = dialog.get('loading');
                        if (d) {
                            d.close().remove();
                        }
                    },
                    type: "POST",
                    url: options.listURL,
                    data: options.data,
                    dataType: "json",
                    cache: false,
                    success: function (respJsonData) {
                        if (respJsonData.code == 200) {
                            var page = respJsonData.result;
                            if (page) {
                                var $list = page[options.resultsLlistName];//接收返回的结果集
                                $(options.bodyElement).html("");//清空表格内容
                                var $tr = options.callback($list, page.currentPage, options.data.pageSize, page.totalCount);//根据[结果集]通过回调函数,生成表格内容
                                $(options.bodyElement).html($tr);//填充内容到表格中
                                var $len = (!$list) ? 0 : $list.length;
                                if ($len > 0 && page.totalCount > options.data.pageSize) {
                                    _pageNo = page.currentPage;
                                    methods.tPagination(_pageNo, page.totalCount, page.pageCount, $.fn.goTOPage, options.pageContainer, options);
                                    if (!options.customBtn) {//默认在底部添加[批量删除]按钮
                                        if ($('#more_del').length > 0) {
                                            $('#more_del').remove();
                                        }
                                        $("#" + options.pageContainer).after("<div class='pull-left' style='margin-top: 4px' id='more_del'><input type='button' class='btn btn-small btn-primary permission_delete' data-align='top left' id='delete_items' value='批量删除'/></div>");
                                    }
                                    $("#" + options.pageContainer).parents('tr').show();
                                } else {
                                    $("#" + options.pageContainer).html("");
                                    if ($('#more_del').length > 0) {
                                        $('#more_del').remove();
                                    }
                                    $("#" + options.pageContainer).parents('tr').hide();
                                }
                                $('#selectAll').prop("checked", false);
                                $('#delete_items').prop('disabled', true);
                                if (options.checkBox) {
                                    $(options.batchBtnSelector).prop('disabled', true);
                                    //单个选
                                    methods.tSelectOne($len, options.batchBtnSelector, options);
                                    //全选
                                    methods.tSelectAll(options.batchBtnSelector, options);
                                    //操作选定项
                                    methods.tBatchHandle(_pageNo, $len, options);
                                }
                                //操作单项
                                if (options.customSimilarDel instanceof  Array) {
                                    methods.tHandle(_pageNo, $len, options);
                                }
                                if (options.reloadURL) {
                                    //重新加载
                                    methods.tReLoad(_pageNo, $len, options);
                                }
                                //分页数据载入html元素和其它绑定结束后的回调
                                if (typeof (options.dataLoadAfterCallback) == "function") {
                                    options.dataLoadAfterCallback();
                                }
                            } else {
                                $(options.pageContainer).parents('tr').hide();
                            }
                        } else {
                            //code <> 200时，的回调处理
                            if (typeof(options.nodata) == "function") {
                                options.nodata(respJsonData.code, respJsonData.msg);
                            }
                        }
                        //预生成artDialog窗口
                        for (var i = 0, j = options.winDialog.length; i < j; i++) {
                            var $dialog_item = options.winDialog[i];
                            methods.tGenerateDialog($dialog_item);
                        }
                    },
                    error: function () {
                        methods.tError();
                    }
                });
            },
            tGenerateTR: function (args) {
                if (args) {
                    var $tr = $('<tr></tr>');
                    for (var i = 0, j = args.length; i < j; i++) {
                        if (args[i] === 'ignore') {
                            //忽略
                        } else {
                            $("<td></td>").html(args[i]).appendTo($tr);
                        }
                    }
                    return $tr;
                }
            },
            tGenerateDialog: function ($dialog_item) {
                $($dialog_item.element + "").unbind("click").bind('click', function (e) {
                    e.stopPropagation();
                    var $url = $(this).data('url');
                    if ($url) {
                        var $qc = ($dialog_item.quickClose) ? true : false;
                        var $w = $dialog_item.w ? $dialog_item.w : 500;
                        var $h = $dialog_item.h ? $dialog_item.h : 420;
                        var $t = $dialog_item.title ? $dialog_item.title : '';
                        var $cv = ($dialog_item.cancelValue) ? $dialog_item.cancelValue : '关闭';
                        var $showModal = ($dialog_item.showModal) ? true : false;
                        var $padding = ($dialog_item.padding) ? $dialog_item.padding : "2px";
                        var d = dialog({
                            fixed: false,
                            quickClose: $qc,
                            width: $w,
                            height: $h,
                            title: $t,
                            cancelValue: $cv,
                            padding: $padding,
                            url: $url
                        });
                        if ($showModal) {
                            d.showModal();
                        } else {
                            d.show();
                        }
                    }
                });
            },
            tDefArtDialog: //自定义ArtDialog的默认参数 (1000毫秒内自动关闭窗口)
                function (content, fn) {
                    var d = dialog({
                        fixed: false,
                        content: content
                    });
                    d.show();//  d.showModal();
                    setTimeout(function () {//定时关闭窗口
                        d.close().remove();
                        if (typeof(fn) == "function") {//执行回调函数
                            fn.call();
                        }
                    }, 1000);
                },
            tDefaultArtDialog: //自定义ArtDialog的默认参数(需手动关闭窗口)
                function (content, $this) {
                    dialog({
                        fixed: false,
                        quickClose: true,// 点击空白处快速关闭
                        follow: $($this)[0],
                        content: content,
                        onclose: function () {
                            $($this).focus();
                        }
                    }).show();//.showModal();
                },
            tTipArtDialog: //自定义ArtDialog的默认参数(需手动关闭窗口)
                function (content, $this) {
                    var d = dialog({
                        fixed: false,
                        //quickClose: true,
                        follow: $($this)[0],
                        content: content,
                        onclose: function () {
                            $($this).focus();
                        }
                    });
                    d.show();//.showModal();
                    //$($this).focus();
                    $($this).bind('blur', function () {
                        d.close().remove();
                    });
                },
            tReLoad: function ($pageNo, len, options) {
                //(重新载入)刷新
                $('.reload_item').unbind('click');
                $('.reload_item').bind('click', function (e) {
                    e.stopPropagation();
                    $.ajax({
                        beforeSend: function () {
                            if (options.loading) {
                                dialog({fixed: false, id: 'reloading', className: 'ui-popup-noborder'}).show();

                            }
                        },
                        complete: function () {
                            var d = dialog.get('reloading');
                            if (d) {
                                d.close().remove();
                            }
                        },
                        type: "POST",
                        url: options.reloadURL,
                        data: {},
                        dataType: "json",
                        cache: false,
                        success: function (data) {
                            if (data && "200" == data.code) {
                                $.fn.goTOPage(1);
                            }
                        },
                        error: function () {
                            methods.tError();
                        }
                    });
                });
            },
            tBatchHandle: function ($pageNo, len, options) {
                //下面配置为默认批量删除
                var props = {
                    elementId: '#delete_items',
                    confirmMsg: '确定要删除吗？',
                    successMsg: '删除成功',
                    failureMsg: '删除失败',
                    callback: $.noop,
                    successHandle: true,
                    failureHandle: false
                };

                var $props = [];
                //读取类似删除功能的配置并加入到$props
                for (var i = 0, j = options.batchHandle.length; i < j; i++) {
                    $props.push(options.batchHandle[i]);
                }
                props.callback = options.delCallback;//设置删除功能的回调函数
                props.successHandle = options.delSuccessHandle;
                props.failureHandle = options.delFailureHandle;
                $props.push(props);//把默认批量删除配置加入到$props末尾
                for (var i = 0, j = $props.length; i < j; i++) {
                    methods.tBatchHandling($pageNo, len, options, $props[i]);
                }
            },
            tBatchHandling: function ($pageNo, len, options, $props_item) {//批量操作
                var $checkedCount = 0;
                $($props_item.elementId).unbind('click').bind('click', function (e) {
                    e.stopPropagation();
                    var $url = $(this).data('url');
                    //获取被选中的checkbox项
                    var $id = "";
                    $('input[name="checkbox_item"]:checked').each(function () {
                        if ($id) {
                            $id += "," + $(this).val();
                        } else {
                            $id += $(this).val();
                        }
                        ++$checkedCount;
                    });
                    methods.tDelConfirm($props_item, this, $id, function () {
                        $.ajax({
                            beforeSend: function () {
                                if (options.loading) {
                                    dialog({fixed: false, id: 'delWaiting', className: 'ui-popup-noborder'}).show();
                                }
                            },
                            complete: function () {
                                var d = dialog.get('delWaiting');
                                if (d) {
                                    d.close().remove();
                                }
                            },
                            type: "POST",
                            url: $url,
                            data: {
                                "ids": $id
                            },
                            dataType: "json",
                            cache: false,
                            success: function (data) {
                                if (data && "200" == data.code) {//删除成功
                                    if (len == $checkedCount) {//当前页的数据条数与选中条数一样时
                                        if ($pageNo > 1) {//总页数 大于 1 时
                                            --$pageNo;//当前页 减 1
                                        }
                                    }
                                    methods.tDefArtDialog($props_item.successMsg, function () {//提示,并重新加载当前页
                                        var $del_item_id = $id.replace(/,/g, ',#');
                                        if (typeof($props_item.successHandle) == "function") {//执行处理函数
                                            $props_item.successHandle('#' + $del_item_id, $pageNo, data.result);
                                        } else if ($props_item.successHandle) {//刷新列表
                                            $.fn.goTOPage($pageNo);
                                        } else {//高亮后隐藏
                                            $('#' + $del_item_id).css({"background-color": "#DF8AC5"}).fadeOut().remove();
                                            $('#selectAll').prop('checked', false);
                                            $(options.batchBtnSelector).prop('disabled', true);
                                        }
                                        if (typeof($props_item.callback) == "function") {//执行回调函数
                                            $props_item.callback.call();
                                        }
                                    });
                                } else {
                                    if (typeof($props_item.failureHandle) == "function") {
                                        $props_item.failureHandle(data.code, data.msg);
                                    } else {
                                        methods.tDefArtDialog($props_item.failureMsg);
                                    }
                                }
                            },
                            error: function () {
                                methods.tError();
                            }
                        });
                    });
                });
            },
            tHandle: function ($pageNo, len, options) {
                //下面配置为默认删除
                var props = {
                    elementId: '.delete_item',
                    confirmMsg: '确定要删除吗？',
                    successMsg: '删除成功',
                    failureMsg: '删除失败',
                    callback: $.noop,
                    successHandle: true,
                    failureHandle: false
                };
                var $props = [];
                //读取类似删除功能的配置并加入到$props
                for (var i = 0, j = options.customSimilarDel.length; i < j; i++) {
                    $props.push(options.customSimilarDel[i]);
                }
                props.callback = options.delCallback;//设置删除功能的回调函数
                props.successHandle = options.delSuccessHandle;
                props.failureHandle = options.delFailureHandle;
                $props.push(props);//把默认删除配置加入到$props末尾
                for (var i = 0, j = $props.length; i < j; i++) {
                    methods.tHandling($pageNo, len, options, $props[i]);
                }
            }
            ,
            tHandling: function ($pageNo, len, options, $props_item) {
                $($props_item.elementId).unbind('click').bind('click', function (e) {
                    e.stopPropagation();
                    var $id;
                    if ($(this).data('id')) {
                        $id = $(this).data('id');//获取tr的id(行数据ID)
                    } else {
                        $id = $(this).parents('tr').prop('id');//获取tr的id(行数据ID)
                    }
                    var $url = $(this).data('url');
                    methods.tDelConfirm($props_item, this, $id, function () {
                        $.ajax({
                            beforeSend: function () {
                                if (options.loading) {
                                    dialog({fixed: false, id: 'delWaiting', className: 'ui-popup-noborder'}).show();
                                }
                            },
                            complete: function () {
                                var d = dialog.get('delWaiting');
                                if (d) {
                                    d.close().remove();
                                }
                            },
                            type: "POST",
                            url: $url,
                            data: {
                                "ids": $id
                            },
                            dataType: "json",
                            cache: false,
                            success: function (data) {
                                if (data && "200" == data.code) {//删除成功
                                    if (len == 1) {//当前页的数据只有一行时
                                        if ($pageNo > 1) {//总页数 大于 1 时
                                            --$pageNo;//当前页 减 1
                                        }
                                    }
                                    methods.tDefArtDialog($props_item.successMsg, function () {//提示,并重新加载当前页
                                        //执行处理(a.处理函数 b.刷新列表 c.高亮后隐藏)
                                        if (typeof($props_item.successHandle) == "function") {//执行处理函数
                                            $props_item.successHandle("#" + $id, $pageNo, data.result);
                                        } else if ($props_item.successHandle) {//刷新列表
                                            $.fn.goTOPage($pageNo);
                                        } else {//高亮后隐藏
                                            $('#' + $id).css({"background-color": "#DF8AC5"}).fadeOut(500);
                                        }
                                        //执行回调(执行[处理函数]之外的操作)
                                        if (typeof($props_item.callback) == "function") {//执行回调函数
                                            $props_item.callback.call();
                                        }
                                    });
                                } else {
                                    if (typeof($props_item.failureHandle) == "function") {
                                        $props_item.failureHandle(data.code, data.msg);
                                    } else {
                                        methods.tDefArtDialog($props_item.failureMsg);
                                    }
                                }
                            },
                            error: function (e) {
                                alert(e);
                                methods.tError();
                            }
                        });
                    });
                });
            }
            ,
            tSelectOne: //单个选--改变事件
                function (len, batchBtnSelector, options) {
                    var $batchBtnSelector = (batchBtnSelector != undefined && typeof (batchBtnSelector) == "string") ? (batchBtnSelector) : '#delete_items';
                    $('input[name="checkbox_item"]').unbind('change');
                    $('input[name="checkbox_item"]').bind('change', function (e) {
                        e.stopPropagation();
                        //没有全部选中,全选框设为不选中
                        if ($('input[name="checkbox_item"]:checked').length < len) {
                            $('#selectAll').prop("checked", false);
                        }
                        //一个也没有选中,禁用按钮和全选框设为不选中
                        if ($('input[name="checkbox_item"]:checked:enabled').length == 0) {
                            $('#selectAll').prop("checked", false);
                            $($batchBtnSelector).prop('disabled', true);
                        } else {
                            //启用按钮
                            $($batchBtnSelector).prop('disabled', false);
                            //全部选中,全选框设为选中
                            if ($('input[name="checkbox_item"]:checked').length == len) {
                                $('#selectAll').prop("checked", true);
                            }
                        }
                        methods.checkBoxSelectedCallBack(options, "");
                    });
                }
            ,
            tSelectAll: //全选--改变事件
                function (batchBtnSelector, options) {
                    var $batchBtnSelector = (batchBtnSelector != undefined && typeof (batchBtnSelector) == "string") ? (batchBtnSelector) : '#delete_items';
                    $('#selectAll').unbind("change");
                    $('#selectAll').bind("change", function () {
                        //全选或全取消
                        $('input[name="checkbox_item"]:enabled').prop("checked", $(this).prop("checked"));
                        $($batchBtnSelector).prop('disabled', !$(this).prop("checked"));
                        //change后的回调
                        methods.checkBoxSelectedCallBack(options, "");
                    });
                }
            ,
            checkBoxSelectedCallBack: function (options, id) { //单个选和全选change后的回调
                if (typeof(options.checkCallback) == "function") {
                    options.checkCallback(id);
                }
            },
            tErrorDialog: //自定义ArtDialog的默认参数
                function (content) {
                    methods.tDefaultArtDialog(content);
                }
            ,
            tSuccess: //修改,添加成功的回调函数
                function ($id, callback, flag) {
                    if (flag) {
                        methods.tDefArtDialog(($id) ? "修改成功" : "添加成功", callback);
                    } else {
                        methods.tDefArtDialog(($id) ? "修改成功" : "添加成功", function () {
                            methods.tList();
                            if (typeof(callback) == "function") {
                                callback.call();
                            }
                        });
                    }
                    //$.fancybox.close();
                }
            ,
            tFailure: //修改,添加失败的回调函数
                function ($id) {
                    methods.tDefArtDialog(($id) ? "修改失败" : "添加失败");
                }
            ,
            tError: //Ajax请求失败的回调函数
                function () {
                    //methods.tDefaultArtDialog("抱歉!服务器繁忙，请稍后再试!");
                }
            ,
            tTimeout: //session超时的回调函数
                function () {
                    dialog({
                        fixed: false,
                        title: '',
                        content: '登录状态已超时,请重新登录!',
                        okValue: '确 定',
                        cancelValue: '取消',
                        close: function () {
                            top.location.href = "/login";
                        }
                        , quickClose: true// 点击空白处快速关闭
                    }).show();
                }
            ,
            tDelFailure: //删除失败的回调函数
                function () {
                    methods.tDefArtDialog("删除失败");
                }
            ,
            tDelSuccess: //删除成功的回调函数
                function (fn) {
                    methods.tDefArtDialog("删除成功", fn);
                }
            ,
            tDelConfirm: //确认删除
                function ($props_item, $this, $id, callback) {
                    if (!$id) {
                        if ($($this).attr('id') == 'delete_items') {
                            methods.tDefArtDialog("至少选择一项");
                        } else {
                            methods.tDefArtDialog($props_item.failureMsg);
                        }
                    } else {
                        dialog({
                            id: $id,
                            title: '',
                            content: $props_item.confirmMsg,
                            okValue: '确 定',
                            align: 'left',// $($this).data('align'),
                            ok: function () {
                                if (typeof(callback) == "function") {//执行回调函数
                                    callback.call();
                                }
                            },
                            cancelValue: '取消',
                            cancel: function () {
                            }
                            , quickClose: true// 点击空白处快速关闭
                        }).show($this);
                    }
                }
            ,
            tPagination: //设置分页组件,加上分页方法名
                function (currentPage, totalCount, totalPage, functionName, pageContainer, options) {
                    if (!pageContainer) {
                        pageContainer = "";
                    }
                    currentPage = parseInt(currentPage);
                    $("#" + pageContainer).html("");
                    var $page = $("#" + pageContainer);
                    $page.append("<a class='noclick font-black'>共 " + totalPage + " 页</a>");
                    if (currentPage <= 1) {
                        $page.append("<a class='noclick'>&laquo;首页</a>");
                        $page.append("<a class='noclick'>&laquo;上页</a>");
                    } else {
                        $page.append("<a href='javascript:void(0);' id='" + pageContainer + "_page_home' " + pageContainer + "_pageIndex='1' >&laquo;首页</a>");
                        $page.append("<a href='javascript:void(0);' id='" + pageContainer + "_page_prev'  " + pageContainer + "_pageIndex='" + (currentPage - 1) + "'>&laquo;上页</a>");
                    }
                    //if(options.pageNum==10){
                    //    var temp1 = (currentPage - 4) <= 1 ? 1 : currentPage - 4;//分页组件中间显示的起始页
                    //    var temp2 = (temp1 + 9) > totalPage ? totalPage : temp1 + 9;//页数下标个数
                    //    if ((temp2 - temp1 + 1) < 10) {//当下标个数小于规定的个数时
                    //        temp1 = (temp2 - 9) <= 0 ? 1 : temp2 - 9;
                    //    }
                    //}else{
                        var temp1 = (currentPage - (parseInt(options.pageNum/2,10) -1)) <= 1 ? 1 : currentPage - (parseInt(options.pageNum/2,10)-1);//分页组件中间显示的起始页
                        var temp2 = (temp1 + options.pageNum-1) > totalPage ? totalPage : temp1 + options.pageNum-1;//页数下标个数
                        if ((temp2 - temp1 + 1) < options.pageNum) {//当下标个数小于规定的个数时
                            temp1 = (temp2 - (options.pageNum-1)) <= 0 ? 1 : temp2 - (options.pageNum-1);
                        }
                    //}
                    for (var i = temp1; i <= temp2; i++) {
                        if (i == currentPage) {
                            $page.append("<a href='javascript:void(0);' id='" + pageContainer + "_page_num" + i + "' " + pageContainer + "_pageIndex='" + i + "' class='number current'>" + i + "</a> ");
                        } else {
                            $page.append("<a href='javascript:void(0);'id='" + pageContainer + "_page_num" + i + "'  " + pageContainer + "_pageIndex='" + i + "' class='number'>" + i + "</a> ");
                        }
                    }
                    if (currentPage >= totalPage) {
                        $page.append("<a class='noclick'>下页&raquo;</a>");
                        $page.append("<a class='noclick'>末页&raquo;</a>");
                    } else {

                        $page.append("<a href='javascript:void(0);' id='" + pageContainer + "_page_next' " + pageContainer + "_pageIndex='" + (currentPage + 1) + "'>下页&raquo;</a>");
                        $page.append("<a href='javascript:void(0);' id='" + pageContainer + "_page_last'  " + pageContainer + "_pageIndex='" + totalPage + "'>末页&raquo;</a>");
                    }

                    $page.append("<span class='input-append'><input id='" + pageContainer + "goPage' class='span1' type='text' value='" + currentPage + "' onkeypress='return  $.fn.tKeypress();' onkeyup='$.fn.tKeyup(" + totalPage + "," + currentPage + ",\"" + pageContainer + "\")' onpaste='return false;'><button class='btn btn-goto' id='" + pageContainer + "gotoBtn' disabled type='button'>跳转</button></span><a class='noclick font-black record-num'>记录数：" + totalCount + "</a>");
                    if (totalCount == 0) {
                        $("#" + pageContainer + "goPage").val(0);
                        $("#" + pageContainer + "goPage").attr("readonly", "readonly");
                        $("#" + pageContainer + "gotoBtn").attr("disabled", "disabled");
                    }
                    $('a[id^="' + pageContainer + '_page_"]').each(function () {
                        $(this).unbind('click').bind('click', function () {
                            functionName($(this).attr(pageContainer + "_pageIndex"), options);
                        });
                    });
                    $('#' + pageContainer + "gotoBtn").unbind('click').bind("click", function () {
                        var $c_page = $('#' + pageContainer + "goPage").val();
                        functionName(($c_page) ? $c_page : 1, options);
                    });
                }
            ,
            tKeypress: function () {
                var flag = event.keyCode >= 48 && event.keyCode <= 57 || event.keyCode == 37 || event.keyCode == 39;
                return flag;
            }
            ,
            tKeyup: function (totalPage, currentPage, pageContainer) {

                var val = $("#" + pageContainer + "goPage").val();
                val = val.replace(/[^0-9]/g, "");
                $("#" + pageContainer + "goPage").val(val);
                val = parseInt(val);
                if (0 >= val || val > totalPage) {
                    val = currentPage;
                    $("#" + pageContainer + "goPage").val(val);
                }
                if (val == currentPage) {
                    $("#" + pageContainer + "gotoBtn").attr("disabled", "disabled");
                } else {
                    $("#" + pageContainer + "gotoBtn").removeAttr("disabled");
                }
            }
        }
        ;

    $.fn.goTOPage = function ($pageNo, $options) {
        methods.tList($pageNo, $options);
    };

    $.fn.tGenerateTR = function () {
        return methods.tGenerateTR(arguments);
    };

    $.fn.tDefArtDialog = function ($content, fn) {
        methods.tDefArtDialog($content, fn);
    }

    $.fn.tDefaultArtDialog = function ($content, $this) {
        methods.tDefaultArtDialog($content, $this);
    }

    $.fn.tTipArtDialog = function ($content, $this) {
        methods.tTipArtDialog($content, $this);
    }

    $.fn.tDelConfirm = function ($this, $id, $content, callback) {
        methods.tDelConfirm($this, $id, $content, callback);
    }

    $.fn.tErrorDialog = function ($content) {
        methods.tErrorDialog($content);
    }

    $.fn.tSuccess = function ($id, callback, flag) {
        methods.tSuccess($id, callback, flag);
    };

    $.fn.tFailure = function ($id) {
        methods.tFailure($id);
    };

    $.fn.tError = function () {
        methods.tError();
    };

    $.fn.tTimeout = function () {
        methods.tTimeout();
    };

    $.fn.tKeypress = function () {
        methods.tKeypress();
    }
    $.fn.tKeyup = function (totalPage, currentPage, pageContainer) {
        methods.tKeyup(totalPage, currentPage, pageContainer);
    }
})
(jQuery);