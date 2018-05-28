/**
 * Copyright(c) 2004-2014,浙江托普云农科技股份有限公司
 * <BR>All rights reserved
 * <BR>版    本：V3.1.0
 * <BR>摘    要：封装传感器及其当前数据的展示
 * <BR>作    者：yhq
 * <BR>日    期：2016-04-06 17:10
 */
(function ($) {
    $.fn.topsensor = function (options) {
        var defaults = {
            listURL: "",//获取传感器列表的路径
            data: {},//ajax中的data参数(json对象)
            divContainer: "",//存放内容的容器
            hasCorrectTypeArr: [2],//有校准公式的设备类型数组（默认是传感器类型2）
            isNeedSet: true,//是否需要传感器设置按钮
            isBindLands: false,//是否需要展示绑定的地块
            isShowTime: true,//是否需要展示数据的时间
            selectedDeviceId: "",//自定义默认选中的设备id(不设置时默认选中列表中的第一个设备)
            sensorCheckCallback: $.noop,//点击传感器的回调函数
            btnCheckAll: "",//全选按钮
            checkAllCallback: $.noop,//点击全选按钮的回调函数
            carousel: {//轮播参数
                //btnPrev: "",//向左滚动按钮
                //btnNext: "",//向右滚动按钮
                //show: 6,//显示个数,如果实际数量等于或者少于这里定义的数量，则隐藏向左及向右按钮
                //start: 0,  //起始位置
                //display: 6,  //每次需要滚动的个数
                //resize: false,//是否需要重置元素的宽度，一般应用于宽度需要自适应头部的Banner
                //auto: false,  //是否自动播放
                //speed: 1000, //滚动的速度
                //btnGoto: ""//轮播跳转按钮
            },
            completeCallback: $.noop,//插件执行完后的回调函数
            windArr: [180],//, 181];//风速风向
            branchEnum: {"1": "气象", "2": "土壤", "3": "植物生理", "4": "水质", "5": "植保", "6": "作物图像", "7": "视频监控"},//设备分支枚举
            colorCssArr: ["shap1", "shap2", "shap3", "shap4", "shap5", "shap6", "shap7", "shap8", "shap9", "shap10",
                "shap11", "shap12", "shap13", "shap14", "shap15"]//传感器列表选中时勾的颜色
        };
        options = $.extend({}, defaults, options || {});

        var branchArr = [];//保存设备分支
        
        
        
        var methods = {
            /**
             * 获取传感器及数据列表
             */
            listSensors: function () {
                if (!options) {
                    return;
                }
                $.ajax({
                    type: "get",
                    url: options.listURL,
                    data: options.data,
                    dataType: "json",
                    //async: false,//是否同步
                    cache: false,
                    success: function (data) {
                        var obj = $(options.divContainer);
                        if (data.code != 200) {
                            obj.html('<center><h3 style="text-align: center;line-height: 243px;">' + data.msg + '</h3></center>');
                            obj.siblings().each(function () {//隐藏另外的容器
                                $(this).hide();
                            });
                            //return;
                        } else {
                            //解析传感器列表
                            var listHtml = methods.parseSensors(data.result);
                            
                            obj.html(listHtml);
                            //methods.selectCheckAll();//绑定传感器全选按钮点击事件

                            //计算传感器列表显示的宽度
                            methods.setWidth();
                            //绑定传感器复选的点击事件
                            methods.sensorCheckEvent();//去掉
                            methods.bindSetBox("a[name=correct]", 480, 270);
                            methods.bindSetBox("a[name=data]", 800, 500);
                            /*if (options.isNeedSet) {//绑定设置的弹出层，依赖fancybox
                                methods.bindSetBox("a[name=set]", 400, 270);
                            }
                            if (options.btnCheckAll) {//绑定传感器全选按钮点击事件
                                methods.checkAllEvent();
                            }*/
                        }
                        //执行完成后的回调函数
                        if (typeof (options.completeCallback) == "function") {
                            options.completeCallback(branchArr, options.branchEnum);
                        }
                        if (options.carousel) {//绑定传感器轮播事件
                            methods.sensorCarousel();
                        }
                    }
                });
            },
            /**
             * 解析传感器列表
             * @param list
             * @returns {*}
             */
            parseSensors: function (list) {
            	//console.log(list)
                var ul = $('<ul>');
                for (var i in list) {
                    var obj = list[i];
                    if ($.inArray(obj.branch, branchArr) < 0) {//判断分支是否已存在
                        branchArr.push(obj.branch);
                    }
                    //var li = $('<li>').addClass("enm-data").attr("branch", obj.branch).attr("idx", i);
                    //var div = $('<div>').addClass('back_y');
                    //传感器的图片
                    //$('<img>').attr('src', obj.picPath).addClass('web_sun').attr({width: 60, height: 60}).appendTo(div);
                    //传感器的当前值
                    //div.append(methods.parseSensorValue(obj));
                    //传感器的单位
                    /*var unit = obj.sensorUnit;//传感器单位
                    if ($.inArray(obj.sensorTypeId, options.windArr) > -1) {//风速风向
                        unit = "";
                    }
                    $('<div>').html(unit).addClass('sedu').appendTo(div);*/

                    //var div2 = $('<div>').addClass('link_fu');
                    //var ul2 = $('<ul>');
                    //校准
                    /*var li21 = $('<li>').appendTo(ul2);
                    if ($.inArray(obj.deviceTypeId, options.hasCorrectTypeArr) > -1) {//是否有校准公式
                        $('<a>').addClass('link1 perm_edit').attr('name', 'correct').attr('title', '校准')
                            .attr('href', "/things/sensor_expression?deviceId=" + obj.deviceId).appendTo(li21);
                    }*/
                    //数据
                    /*var li22 = $('<li>').appendTo(ul2);

                    $('<a>').addClass('link2').attr('name', 'data').attr('title', '数据')
                        .attr('href', "/things/sensor_data?deviceId=" + obj.deviceId+"&precision="+obj.precision).appendTo(li22);
                    if (options.isNeedSet) {
                        //设置
                        var li23 = $('<li>').appendTo(ul2);
                        $('<a>').addClass('link3 perm_edit').attr('name', 'set').attr('title', '设置')
                            .attr('href', "/things/sensor_setting?landId=" + landId + "&deviceId=" + obj.deviceId).appendTo(li23);
                    }*/
                    //链接状态
                  /* var li24 = $('<li>').addClass('link4').appendTo(ul2);
                    methods.parseLinkStatus(obj.value, obj.alarmType).appendTo(li24);
                    //电量
                    var li25 = $('<li>').addClass('link5').appendTo(ul2);
                    methods.parsePowerStatus(obj.power).appendTo(li25);*/
                    //ul2.appendTo(div2);
                    //div2.appendTo(div);
                    //数据是否报警
                    /*if (obj.alarmType == 1 || obj.alarmType == 2) {
                        var jtSrc = "/images/wlyun/jt.png";//超下限箭头
                        if (obj.alarmType == 2) {
                            jtSrc = "/images/wlyun/hjt.png";//超上限箭头
                        }
                        div.append('<div class="jt"><img src="' + jtSrc + '"></div>');
                    }*/
                    //li.append(div);
                    //是否选中及设置传感器名称
//                  var div3 = $("<div>").addClass('intrble ' + options.colorCssArr[i % options.colorCssArr.length]);
//                  var div4 = $("<div class='cl'>").attr('id', i).attr("deviceid", obj.deviceId);
//                  //是否选中
//                  if (options.selectedDeviceId) {
//                      if (obj.deviceId == options.selectedDeviceId) {//默认选中用户选择的
//                          div4.addClass("seleced");
//                          //console.log(1111)
//                      }
//                  } else {
//                      if (i == 0) {//默认选中第一个
//                          div4.addClass("seleced");
//                      }
//                  }
//                  div3.append(div4);
//                  div3.append('<span title="' + obj.deviceName + '">' + obj.deviceName + '</span>');
                    //$(li).append(div3)
                    //li.append($(".sj-cgq-left"))
                    //li.append($(".sj-cgq-right"));
                    /*if (options.isBindLands) {//需要显示绑定的地块
                        var bindLandIds = obj.bindLandIds ? obj.bindLandIds : "";
                        if (bindLandIds) {
                            bindLandIds = "," + bindLandIds + ",";
                        }
                        div4.attr("bindLandIds", bindLandIds);
                        var bindLandNames = obj.bindLandNames ? obj.bindLandNames : "";
                        //绑定的地块
                        var div5 = $("<div>").addClass('intrble dk').attr("title", bindLandNames).text(bindLandNames);
                        li.append(div5);
                    }*/
                    /*if (options.isShowTime) {//需要显示当前值的时间
                        var time = obj.collectTime ? "更新:" + formatDate(obj.collectTime, "yyyy-MM-dd hh:mm:ss") : "";
                        //绑定的地块
                        var div6 = $("<div>").addClass('intrble').attr("style", "font-size:12px;color:#999;margin-top:-3px;").attr("title", time).text(time);
                        li.append(div6);
                    }*/
                    //ul.append(li);
                }
                //return ul;
            },
            /**
             * 解析传感器当前值
             * @param obj
             * @returns {*}
             */
            parseSensorValue: function (obj) {
                var div = $('<div>').addClass('uifile');
                var value = obj.value;//传感器的值
                if (value == undefined) {
                    value = "--";
                } else {
                    if ($.inArray(obj.sensorTypeId, options.windArr) > -1) {//风速风向
                        value = obj.windName;
                    } else {
                        value = decimal2(value, obj.precision);
                    }
                }
                div.html(value);
                if (obj.alarmType == 1) {//超出下限(蓝色)
                    div.css({'color': '#0066cc'});
                } else if (obj.alarmType == 2) {//超出上限(红色)
                    div.css({'color': 'red'});
                }
                return div;
            },
            /**
             * 解析传感器连接状态
             * @param val
             * @param alarmType
             * @returns {*}
             */
//          parseLinkStatus: function (val, alarmType) {
//              var img = $('<img>').attr({width: 17, height: 11});
//              //当前值null，或者报警状态为-1，或者传感器从未上传过数据，或者终端断开链接
//              if (val == undefined || alarmType == -1 || alarmType == 1000/* || !terminalStatus*/) {
//                  img.attr('src', '/images/wlyun/data/unlink.png');
//                  img.attr('title', '断开');
//              } else {
//                  img.attr('src', '/images/wlyun/data/link.png');
//                  img.attr('title', '连接');
//              }
//              return img;
//          },
            /**
             * 解析传感器电池状态
             * @param power
             * @returns {*}
             */
            parsePowerStatus: function (power) {
                var img = $('<img>').attr({width: 17, height: 11});
                /*if (power >= 0 && power < 6) {
                    //img.attr('src', '/images/wlyun/battery' + power + '.png');
                    img.attr('src', '/images/wlyun/data/battery100.png');//测试用
                    img.attr('title', '电池电量' + power * 20 + '%');
                } else if (power == 6) {
                    img.attr('src', '/images/wlyun/data/battery_charging.gif');
                    img.attr('title', '正在充电');
                } else {//默认为满格
                    img.attr('src', '/images/wlyun/data/battery100.png');
                    img.attr('title', '电池电量100%');
                }
                return img;*/
            },
            /**
             * 是否选中全选
             */
            selectCheckAll: function () {
                if (options.btnCheckAll) {
                    //是否选中全选
                    var all_sec_number = $(options.divContainer + " li .intrble .cl").length;
                    var select_number = $(options.divContainer + " li .intrble .seleced").length;
                    if (all_sec_number == select_number) {
                        $(options.btnCheckAll + " .cl").addClass("seleced");
                    } else {
                        $(options.btnCheckAll + " .cl").removeClass("seleced");
                    }
                }
            },
            /**
             * 计算传感器列表显示的宽度
             */
            
            setWidth: function () {
                var lgs = $(options.divContainer + " .enm-data").size();
                var _hjwidth = lgs * 388 + "px";//修改的是一个li的长度
                if (lgs >= 3) {
                    $("#hj_carousel").css("width", "1172px");
                } else {
                    //$("#hj_carousel").css("width", _hjwidth);
                    $("#hj_carousel").css("width", "1172px");
                }
            },
            /**
             * 绑定传感器复选框的点击事件
             */
            sensorCheckEvent: function () {
                //$(options.divContainer).on("click", ".enm-data", function () {
                	//var obj = $(this).find('.intrble .cl').eq(0);
                $(options.divContainer).on("click", ".enm-data .sj-title", function () {                   
                    var obj = $(this).children('.intrble .cl').eq(0);//修改的地方不会影响点击详情时也会触发复选框
                    var isCheck;
                    if (obj.hasClass("seleced")) {//如果原来已选中，就改为不选中
                        //delete visibleIds[xiabiao];//从数组中删除
                        obj.removeClass("seleced");
                        isCheck = false;
                    } else {
                        //visibleIds[xiabiao] = did;
                        obj.addClass("seleced");
                        isCheck = true;
                    }
                    methods.selectCheckAll();
                    //回调函数
                    if (typeof (options.sensorCheckCallback) == "function") {
                        options.sensorCheckCallback(obj, isCheck);
                    }
                });
                /*$(options.divContainer + " .back_y .link_fu").click(function (e) {
                    e.stopPropagation();
                });*/
            },
            /**
             * 绑定传感器设置的弹出层
             */
            bindSetBox: function (container, width, height) {
                $(options.divContainer + " " + container).each(function () {
                    var that = $(this);
                    that.fancybox({
                        'titlePosition': 'outside',
                        'overlayColor': '#000',
                        'overlayOpacity': 0.3,
                        'transitionIn': 'elastic',
                        'transitionOut': 'elastic',
                        'autoDimensions': false,
                        'width': width,
                        'height': height,
                        'padding': 0,
                        'scrolling': 'no',
                        fitToView: false,//fancyBox是否自动根据内容调整大小
                        autoSize: false,
                        'type': 'iframe',
                        helpers: {
                            title: null//禁用弹出层下面的标题
                        }
                    });
                });
            },
            /**
             * 绑定全选按钮的点击事件
             */
            checkAllEvent: function () {
                //全选按钮事件
                $(options.btnCheckAll).unbind("click").bind("click", function () {
                    var obj = $(this).find(".cl");
                    if (obj.hasClass("seleced")) {
                        //全选不选中
                        obj.removeClass("seleced");
                        //所有传感器不选中
                        $(options.divContainer + " li .intrble .cl").removeClass("seleced");
                    } else {
                        obj.addClass("seleced");
                        $(options.divContainer + " li .intrble .cl").removeClass("seleced");
                        $(options.divContainer + " li .intrble .cl").addClass("seleced");
                    }
                    if (typeof(options.checkAllCallback) == "function") {
                        options.checkAllCallback();
                    }
                });
            },
            /**
             * 传感器轮播
             */
            sensorCarousel: function () {
                var carousel = {//轮播参数
                    btnPrev: "",//向左滚动按钮
                    btnNext: "",//向右滚动按钮
                    show: 3,//显示个数,如果实际数量等于或者少于这里定义的数量，则隐藏向左及向右按钮
                    start: 0,  //起始位置
                    display: 3,//每次需要滚动的个数
                    resize: false,//是否需要重置元素的宽度，一般应用于宽度需要自适应头部的Banner
                    auto: false,  //是否自动播放
                    speed: 1000, //滚动的速度
                    btnGoto: ""//轮播跳转按钮
                };
               
                carousel = $.extend({}, carousel, options.carousel || {});
                $(options.divContainer).hj_carousel({
                    btnPrev: carousel.btnPrev,  //定义向左滚动按钮
                    btnNext: carousel.btnNext,  //定义向右滚动按钮
                    show: carousel.show, // 显示几个,如果实际Li数量等于或者少于这里定义的数量，则隐藏按钮
                    start: carousel.start,  //起始位置
                    display: carousel.display,  //每次需要滚动的个数
                    resize: carousel.resize,//是否需要重置元素的宽度，一般应用于宽度需要自适应头部的Banner
                    auto: carousel.auto,  //是否自动播放
                    speed: carousel.speed, //滚动的速度
                    btnGoto: carousel.btnGoto,
                    gotoFun: function (obj) {
                        var obj = $(obj);
                        var branch = obj.attr("branch");
                        //console.log(branch)
                        var to = 0;
                        if ($.inArray(branch, branchArr) >= 0) {
                            var gotoIdx = $(options.divContainer + " li[branch='" + branch + "']").eq(0).attr("idx");
                            var firstIdx = $(options.divContainer + " li").eq(0).attr("idx");
                            to = firstIdx - gotoIdx;
                        }
                        return {to: to, display: Math.abs(to)};
                    }
                });
            }
        };

        methods.listSensors();//默认执行查询
        methods.sensorCarousel();//调用轮播
        methods.setWidth();//调用轮播展示的长度
        //methods.sensorCheckEvent();//选中的复选框
    };
})(jQuery);
