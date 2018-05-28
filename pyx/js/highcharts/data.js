/**
 * Copyright(c) 2004-2014,浙江托普云农科技股份有限公司
 * <BR>All rights reserved
 * <BR>版    本：V3.1.0
 * <BR>摘    要：数据的js脚本
 * <BR>作    者：yhq
 * <BR>日    期：2016-04-05 14:30
 */
var period = 30;//保存获取传感器数据的时间间隔，默认为半小时
var $branchArr = [];//保存设备分支
var interval;//翻页时查询的时间间隔

/**
 * 单个传感器选择
 * @param obj
 * @param isCheck
 */
function sensorCheck(obj, isCheck, otherParams, otherHandler) {
    if (chart) {
        var visible = (isCheck) ? true : false;
        if (visible && isCenter) {//选中时并是数据中心页面，重新取数据
            getSensorData(null, null, otherParams, otherHandler);
            return;
        }
        var did = $(obj).attr("deviceid");
        toggleSeries(chart, ['series_' + did, 'Alerts_series_' + did], visible);//隐藏或显示[数据,告警]曲线
    }
}

/**
 * 隐藏或显示曲线
 * @param chart
 * @param seriesIds
 * @param isShow
 */
function toggleSeries(chart, seriesIds, visible) {
    if ($.type(seriesIds) === 'array') {
        for (var i = 0, j = seriesIds.length; i < j; i++) {
            toggle(chart, seriesIds[i], visible);
        }
    } else if ($.type(seriesIds) === 'string') {
        toggle(chart, seriesIds, visible);
    }
    function toggle(chart, seriesId, visible) {
        var series = chart.get(seriesId);
        if (series) {
            series.setVisible(visible);
        }
    }
}

/**
 * 显示曲线
 */
function checkShowLine() {
    showLoading();
    setTimeout(function () {
        if (chart) {
            //处理曲线
            $("#hj_carousel li .intrble .cl").each(function () {
                var did = $(this).attr("deviceid");
                toggleSeries(chart, ['series_' + did, 'Alerts_series_' + did], $(this).hasClass("seleced"));
            });
        }
        $("#loading").remove();
    }, 200);
}

/**
 * 加载设备分支
 * @param branchArr 当前已安装的设备涉及的分支列表
 * @param branchEmun 分支枚举
 */
function loadBranch(branchArr, branchEmun, flag) {
    if (branchArr && branchEmun) {
        $branchArr = branchArr;
        //加载设备分支，默认选中第一个分支
        if (branchArr.length > 1) {
            for (var i in branchArr) {
                if (branchEmun[branchArr[i]]) {
                    $("#branches").append('<div class="tab-day-con" branch="' + branchArr[i] + '">' + branchEmun[branchArr[i]] + '</div>');
                }
            }
            if (!flag) {
                $("#branches .tab-day-con:eq(1)").addClass("ons");//默认选中第一个分支
            }
        } else {
            if ($("#branches .tab-day-con").length <= 1) {
                $("#branches").hide();
            }
        }
    }
}

//显示正在加载
function showLoading() {
    $("<div id='loading' class='freeze'></div>").appendTo("body");
    $("#loading").css({
        "position": "absolute",
        "background": '#ddd',
        "filter": "alpha(opacity = 50)",
        "-moz-opacity": 0.5,
        "-khtml-opacity": 0.5,
        "opacity": 0.5,
        "z-index": 9999,
        "width": "1270px",
        "height": "363px",
        //"background-image": "url(/images/a/1.gif)",
        "background-repeat": "no-repeat",
        "background-position": "center",
        "over-flow": "hidden",
        /*left: ($("#dataLine").offset().left) + "px",
        top: ($("#dataLine").offset().top) + "px"*/
       left: ($("#pyxLine").offset().left) + "px",
        top: ($("#pyxLine").offset().top) + "px"
    });
}

/**
 * 获取地块关联传感器的数据
 * @param startTime
 * @param endTime
 */
function getSensorData(startTime, endTime, otherParams, otherHandler) {
    //$("#dataLine").html("<h3 style='line-height: 338px;'>正在加载中...</h3>");
    $("#pyxLine").html("<h3 style='line-height: 338px;'>正在加载中...</h3>");
    //showLoading();
    if (!startTime) {
        //startTime = $("#startTime").val();
    }
    if (!endTime) {
        //endTime = $("#endTime").val();
    }
    var params = {};
    if (isCenter) {
        var deviceIds = [];
        var colorArr1 = [];
        var colorArr2 = [];
        var deviceIdArr1 = [];
        var deviceIdArr2 = [];
        var tempIdx;
        $("#hj_carousel li .intrble .cl.seleced").each(function (index) {
            var devId = parseInt($(this).attr("deviceId"),10);
            if($.inArray(devId,deviceIds)==-1){
                deviceIds.push(devId);//.push(parseInt($(this).attr("deviceId"), 10));
            }
            var idx = parseInt($(this).parents("li").attr("idx"), 10);
            if (index == 0) {
                tempIdx = idx;
            }
            if (idx >= tempIdx) {
                colorArr1.push(colorEnum[idx % colorEnum.length]);
                deviceIdArr1.push(devId);
            } else {
                colorArr2.push(colorEnum[idx % colorEnum.length]);
                deviceIdArr2.push(devId);
            }
        });
        dataOptions.colors = colorArr2.concat(colorArr1);//两个数组合并
        var deviceIdArr = deviceIdArr2.concat(deviceIdArr1);
        for (var i in deviceIdArr) {//重新给选中的传感器编号
            $("#hj_carousel div[deviceid='" + deviceIdArr[i] + "']").attr("id", i);
        }
        params.stationId = stationId;
        params.deviceIds = deviceIds.toString();//.join(",").toString();
        params.isNeedAlarm = false;
    } else {
        params.landId = landId;
        params.moduleId = moduleId;
        params.isNeedAlarm = true;
    }
    params.startTime = startTime;
    params.endTime = endTime;
    params.period = period;

    if (typeof (otherParams) == "function") {
        otherParams(params);
    }

    $.ajax({
        type: "get",
        //url: "/ajax/station/sensor/getSensorDataStat",
        url:"js/jdhj.json",
        data: params,
        dataType: "json",
        //async: false,//是否同步
        cache: false,
        success: function (data) {
            chart && chart.destroy();
            if (data.code != 200) {
                //$('#loading').remove();
               //$('#dataLine').html('<center><h3 style="line-height: 338px;">' + data.msg + '</h3></center>');
                $('#pyxLine').html('<center><h3 style="line-height: 338px;">' + data.msg + '</h3></center>');
                $(".timeSel").hide();//时间区间选择按钮
                $("#legend").hide();//隐藏报警图例
                $(".data_prev").hide();
                $(".data_next").hide();
                return;
            }
            var devId = null;
            if (!isNaN(deviceId)) {//用户
                devId = parseInt(deviceId);
            }
            //新建曲线
            chart = new createNewChart(data, devId);
            if (typeof (otherHandler) == "function") {
                otherHandler(data['result']['cntList']);
            }
            firstLoad = false;
        }
    });
}

/**
 * 计算两个日期之间的时间间隔
 * @param date1 日期字符串
 * @param date2 日期字符串
 */
function countInterval(date1, date2) {
    var intv = 0;
    if (date1 && date2) {
        //为了兼容ie，对时间字符串进行处理
        date1 = date1.replace(/-/g, "/");
        date2 = date2.replace(/-/g, "/");
        intv = Math.abs(new Date(date2).getTime() - new Date(date1).getTime());
    }
    return intv;
}

/**
 * 曲线时间区间选择的点击事件
 * @param isHideFreeTime 是否隐藏自选时间区间
 * @param isNeedSetPeriod 是否需要设置查询时间间隔
 */
function bindTimeClick(isHideFreeTime, isNeedSetPeriod, otherParams, otherHandler) {
    $('#times .tab-day-con').unbind("click").bind("click", function () {
        /*$(this).addClass("ons").siblings().removeClass("ons");
        if (isHideFreeTime) {
            $(this).hasClass("zx") ? $(".right-button").css("display", "block") : $(".right-button").css("display", "none");
        }*/
        var periodStr = $(this).attr("id");//设置查询区间
        var $period = 30;
        if (periodStr) {
            var endTime = new Date();
            var ago = new Date(endTime);
            var startTime = endTime;
            if (periodStr == "week") {//按周查询，时间范围是一个月内3小时时间间隔的数据
                $period = 180;
                ago.setDate(ago.getDate() - 30);
                startTime = ago.getTime();
            } else if (periodStr == "month") {//按月查询，时间范围是一生长季内一天时间间隔的数据
                $period = 1440;
                ago.setDate(ago.getDate() - 90);
                startTime = ago.getTime();
            } else if (periodStr == "season") {//按一生长季查询，时间范围是一年内一天时间间隔的数据
                $period = 1440;
                ago.setFullYear(ago.getFullYear() - 1);
                startTime = ago.getTime();
            } else if (periodStr == "year") {//按年查询，时间范围是一年内一天时间间隔的数据
                $period = 1440;
                ago.setFullYear(ago.getFullYear() - 1);
                startTime = ago.getTime();
            } else {//默认按天查询，时间范围为一周内半小时时间隔的数据
                $period = 30;
                ago.setDate(ago.getDate() - 7);
                startTime = ago.getTime();
            }
            if (isNeedSetPeriod) {//需要设置查询时间间隔
                period = $period;
            }
            startTime = dateFormat(new Date(startTime), "yyyy-MM-dd hh:mm:ss");
            endTime = dateFormat(endTime, "yyyy-MM-dd hh:mm:ss");
            $("#startTime").val(startTime);
            $("#endTime").val(endTime);
            //setVisibleSeries();//保存已选择显示的曲线
            getSensorData(startTime, endTime, otherParams, otherHandler);//重新获取数据
            //interval = countInterval(startTime, endTime);//记住翻页的时间间隔
        }
    });
}

/**
 * 搜索按钮
 * @param isHideFreeTime 是否隐藏自选时间区间
 */
function bindSearchClick(isHideFreeTime, otherParams, otherHandler) {
    $("#mSearch").unbind("click").bind("click", function () {
        var startTime = $("#startTime").val();
        var endTime = $("#endTime").val();
        if (startTime == "" || endTime == "" || startTime > endTime) {
            alert("请选择正确的起止时间!");
            return;
        }
        if (isHideFreeTime) {
            $(".right-button").css("display", "none");
        }
        //setVisibleSeries();//保存已选择显示的曲线
        getSensorData(startTime, endTime, otherParams, otherHandler);//重新获取数据
        interval = countInterval(startTime, endTime);//记住翻页的时间间隔
    });
}

/**
 * 绑定查询数据时间间隔的点击事件
 */
function bindPeriodClick(otherParams, otherHandler) {
    $("#period .tab-day-con").unbind("click").bind("click", function () {
        $(this).siblings().each(function () {
            $(this).removeClass("ons");
        });
        $(this).addClass("ons");
        var $period = $(this).attr("period");//查询时间间隔
        if (!isNaN($period)) {
            period = $period;
            getSensorData(null, null, otherParams, otherHandler);//重新获取数据
        }
    });
}

/**
 * 绑定设备分支的点击事件
 */
function bindBranchClick(otherParams, otherHandler) {
    $("#branches").on("click", ".tab-day-con", function () {
        $(this).addClass("ons").siblings().removeClass("ons");
        selectSensor(otherParams, otherHandler);
    });
}

/**
 * 绑定曲线左右翻页的点击事件
 */
function bindPageClick(otherParams, otherHandler) {
    //向左翻页，向右翻页
    $(".data_prev, .data_next").on("click", function () {
        var startTime = $("#startTime").val();
        var endTime = $("#endTime").val();
        //为了兼容ie，对时间字符串进行处理
        startTime = startTime.replace(/-/g, "/");
        endTime = endTime.replace(/-/g, "/");
        //var period = new Date(endTime).getTime() - new Date(startTime).getTime();
        var $startTime;
        var $endTime;
        if ($(this).hasClass("data_prev")) {//向左
            $startTime = formatDate(new Date(startTime).getTime() - interval, "yyyy-MM-dd hh:mm:ss");
            $endTime = startTime.replace(/\//g, "-");
        } else if ($(this).hasClass("data_next")) {//向右
            $startTime = endTime.replace(/\//g, "-");
            $endTime = formatDate((new Date(endTime).getTime() + interval) > new Date().getTime() ? new Date() : new Date(endTime).getTime() + interval, "yyyy-MM-dd hh:mm:ss");
        }
        $("#startTime").val($startTime);
        $("#endTime").val($endTime);
        getSensorData($startTime, $endTime, otherParams, otherHandler);
    });
}

/**
 * 是否选中传感器
 */
function selectSensor(otherParams, otherHandler) {
    var s = {
        landId: $("#land").attr("data-value"),
        branch: $("#branches .ons").attr("branch"),
        selectedBox: function () {
            var branch = this.branch;
            var selectCon = "#hj_carousel li .intrble .cl";
            $(selectCon).removeClass("seleced");
            if ($.inArray(this.branch, $branchArr) >= 0) {
                selectCon = "#hj_carousel li[branch='" + this.branch + "'] .intrble .cl";
            }
            return selectCon;
        },
        partSelected: function () {
            var selectedBoxs = this.selectedBox();
            var $selectLandId = this.landId;
            $(selectedBoxs).each(function () {
                if($(this).hasClass("seleced")){
                    $(this).removeClass("seleced");
                }
                if ($selectLandId && $selectLandId > 0) {//有选中地块
                    if ($(this).attr("bindLandIds").indexOf("," + $selectLandId + ",") >= 0) {
                        $(this).addClass("seleced");
                    }
                } else {
                    $(this).addClass("seleced");
                }
            });
        },
        allSelected: function () {
            var all_sec_number = $("#hj_carousel li .intrble .cl").length;
            var select_number = $("#hj_carousel li .intrble .cl.seleced").length;
            if (all_sec_number == select_number) {
                $("#checkAll .cl").addClass("seleced");
            } else {
                $("#checkAll .cl").removeClass("seleced");
            }
        },
        exec: function () {
            if (isCenter) {//如果是数据中心页面，重新获取数据
                getSensorData(null, null, otherParams, otherHandler);
            } else {
                checkShowLine();//展示曲线
            }
        },
        init: function () {
            this.partSelected();
            this.allSelected();
            this.exec();
        }
    };
    s.init();
}

/**
 * 绑定作物图片的点击事件
 */
function bindImageClick() {
    //点击苗情图片以外的地方，图片关闭
    $("body:not('#showImage img')").on("click", function () {
        $("#showImage").css({display: 'none'});
    });

    $("#showImage").on("click", ".col-xs-6 img", function () {
        var img = $(this).data("image");
        //点击后跳转苗情大图页面
        window.open("/things/image_detail?deviceId=" + img.deviceId + "&startTime=&endTime=&sort=desc&imgId=" + img.id + "&imgDate=" + formatDate(img.createDate));
    });
}


/**
 * 不同地块对比
 */
$(function () {
    $(".diffent-spare").click(function (event) {
        //显示地块列表
        $('#leown').show();
        $(".but-spar-c,.but-spar-s").one("click", function () {
            $('#leown').hide();
        });
        event.stopPropagation();
    });
    $('#leown').click(function (event) {
        event.stopPropagation();
    });


    //默认隐藏曲线下面的地块列表
    $('#leown').hide();
    $("#landCheckAll").click(function () {
        if ($(this).attr("checked") == "checked") {
            $(".cl").attr("class", "cl seleced");
        } else {
            $(".cl").attr("class", "cl sel");
        }
    });
});

/**
 * 地块对比前的复选框change事件
 * @param obj
 */
function bigChange(obj) {
    if (obj.checked == false) {
        var smObj = document.getElementsByName("smal");
        for (var i = 0; i < smObj.length; i++) {
            smObj[i].checked = false;
        }
    }
}

/**
 * 地块列表地块前的复选框点击事件
 * @param obj
 */
function smallChange(obj) {
    var smObj = document.getElementsByName("smal");
    var bigObj = document.getElementById("difs");
    if (obj.checked == true) {
        bigObj.checked = true;
    } else {
        b = true;
        for (var i = 0; i < smObj.length; i++) {
            if (smObj[i].checked == true) {
                b = false;
            }
        }
        if (b == true) {
            bigObj.checked = false;
        }
    }
}