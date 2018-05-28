/**
 * Copyright(c) 2004-2014,浙江托普仪器有限公司
 * All rights reserved
 * 版    本：V2.0.0
 * 摘    要：环境数据页面数据曲线的js
 * 作    者：yhq
 * 日    期：2015-07-14 13:51
 */
var chart;
var firstLoad = true;//是否是第一次加载曲线
var visibleSeries = [];//保存可见的曲线名称
var negativeArr = ["℃", "mm", "W/m²", "mV", "kPa"];//保存有负数的传感器的单位
var colorEnum = [
    "#6f7738",
    "#03d4dc",
    "#1f8e29",
    "#1e7256",
    "#ec7811",
    "#d10075",
    "#b0b200",
    "#7034cb",
    "#1979b2",
    "#822e04",
    "#686a6a",
    "#0075e9",
    "#62a6a9",
    "#021c8b",
    "#8a8000"
];
var dataOptions = {//highcharts初始设置
    chart: {
        defaultSeriesType: 'spline',
        //renderTo: 'dataLine',
        renderTo: 'pyxLine',
        zoomType: 'x',
        plotBorderWidth: 1,
        //plotBorderColor: "#666666",
        marginTop: 30,
        height: 363
        /* events: {
         load: function () {
         alert('Chart has loaded');
         }
         }*/
    },
    colors: colorEnum,
    credits: {
        enabled: false//去掉右下角highcharts.com的链接
    },
    exporting: {
        enabled: true,
        scale: 1,//导出的图片和屏幕显示的对比倍数或者放大因素，默认为2
        sourceWidth: 1313,//当导出时原始图的宽度，除非明确设置了图表的宽度。光栅图像被导出时的宽度是乘以scale(定义的倍数)。
        sourceHeight: 550
    },
    legend: {
        enabled: false//图例不显示
    },
    navigator: {
        enabled: true,
        height: 35,
        margin: 10//和最近的元素的距离，x轴或者是x轴刻度
    },
    scrollbar: {
        enabled: true
    },
    plotOptions: {
        series: {//各个类型曲线通用
            animation: true,//是否在显示图表的时候使用动画
            connectNulls: true //连接数据为null的前后点
        },
        spline: {
            allowPointSelect: true,
            cursor: 'pointer',
            marker: {
                enabled: false,//去掉曲线上面的点，当只有一个数据时曲线展示的效果是空的
                radius: 3,
                states: {
                    select: {
                        enabled: true,//控制鼠标选中点时候的状态
                        radius: 5
                    }
                }
            },
            events: {//点击数据点的事件
                click: function (event) {
                    $('#showImage .col-xs-6').html("");
                    $("#showImage").hide();
                    var imageDevIds = $("#imageDevIds").val();
                    if (imageDevIds) {//该地块有作物图像设备
                        var searchTime = formatDate(event.point.x);
                        //获取该数据点前后一天时间内各一张作物图片
                        $.ajax({
                            type: "get",
                            url: '/device/image/ajax/listImagesByTime',
                            data: {
                                deviceIds: imageDevIds,
                                searchTime: searchTime
                            },
                            dataType: "json",
                            cache: false,
                            success: function (data) {
                                if (data.code == 200) {
                                    var list = data.result;
                                    if (list && list.length > 0) {
                                        for (var i in list) {
                                            var imgSrc = list[i].imgUrl;
                                            if (imgSrc && imgSrc.indexOf("http") < 0) {
                                                imgSrc = imageHttpUrl + imgSrc + "?x-oss-process=style/mq-thumb";
                                                $('<img src="' + imgSrc + '" width="160px" height="120">').data("image", list[i]).appendTo($('#showImage .col-xs-6'));
                                            }
                                        }
                                        var pos = $('.highcharts-tooltip').attr('transform');
                                        var posstr1 = pos.replace('translate(', '').replace(')', '');
                                        var posstr2 = posstr1.split(',');
                                        var leftPos = posstr2[0];
                                        if (list.length > 1) {//多于一张图片的时候
                                            leftPos = posstr2[0] - 98;
                                        }
                                        leftPos = leftPos < -50 ? -50 : leftPos;
                                        $('#showImage').css({
                                            display: 'block',
                                            'left': leftPos + 'px',
                                            'top': (posstr2[1] - 110) + 'px'
                                        });
                                        $("#showImage #title").html(searchTime + "前后的作物图片");
                                    }
                                }
                            },
                            error: function () {
                            }
                        });
                    }
                }
            }
        }
    },
    rangeSelector: {//顶部按钮和时间
        enabled: false
    },
    title: {  //图表标题
        text: null
    },
    tooltip: {//鼠标上移时的提示信息
        shared: true,
        style: {
            fontSize: 12,
            padding: 3
        },
        formatter: function () {
            //根据不同的时间间隔设置x轴时间不同的格式化
            var formatStr = "%Y-%m-%d";
            if (period == 30) {
                formatStr += ' %H:%M';
            }
            if (period == 180) {
                formatStr += ' %H:00';
            }
            if (period == 1440) {
            }
            if (this.points && this.points.length > 0) {//鼠标移到曲线上的点
                var res = Highcharts.dateFormat(formatStr, this.x) + "<br/>";
                for (var i = 0; i < this.points.length; i++) {
                    res = res + "<span style=\"font-weight:bold; color:" + this.points[i].series.color + "\">" +
                    this.points[i].series.name + "</span>: " +
                    decimal2(this.points[i].y, this.points[i].series.options.precision) + "<br/>";
                }
                return res;
            } else {
                if (this.point && this.point.options && this.point.options.isAlert) {//鼠标移到报警标注上
                    var paramStr = "";
                    paramStr += "<br/>值: " + decimal2(this.point.options.val, this.series.options.precision);//setPrecision2(this.series.name, this.point.options.val);
                    paramStr += "<br/>限制值: " + decimal2(this.point.options.limit, this.series.options.precision);
                    paramStr += "<br/>描述: " + this.point.options.content;
                    var deviceId = this.point.options.alertId;
                    var color = colorEnum[$("#hj_carousel div[deviceid='" + deviceId + "']").attr("id")];//获取传感器对应的颜色
                    return Highcharts.dateFormat("%Y-%m-%d %H:%M:%S", this.x) + "<br/>" +
                        "<span style=\"font-weight:bold; color:" + color + "\">" + this.point.options.inTitle + "</span>" +
                        paramStr;
                }
                //鼠标移到覆盖物上，即有加减标识的
                return "<span style=\"font-weight:bold; color:" + this.series.color + "\">" + this.series.name + "</span>: " +
                    Highcharts.dateFormat("%Y-%m-%d %H:%M:%S", this.x) + (this.y !== undefined ? "<br/>" +
                    Highcharts.numberFormat(this.y, 2) : "");
            }
        },
        crosshairs: {//交叉点是否显示的一条纵线
            width: 1,
            color: 'gray',
            dashStyle: 'shortdot'
        }
    },
    xAxis: {
        //categories: [],//hightstock中没有的
        type: 'datetime',//hightstock中没有的
        //gridLineWidth:1,//网格线宽度
        labels: {
            x: 0,//调节x轴偏移
            rotation: 0, // 调节倾斜角度偏移
            style: {
                //"font-family":"新宋体"
            },
            formatter: function () {
                var formatStr = "";
                if (period == 30) {
                    formatStr = '%m-%d<br/>%H:%M';
                }
                if (period == 180) {
                    formatStr = '%m-%d<br/>%H:00';
                }
                if (period == 1440) {
                    formatStr = '%m-%d';
                }
                return Highcharts.dateFormat(formatStr, this.value);
            }
        },
        //tickmarkPlacement: "on",//标记(文字)显示的位置，on表示在正对位置上。//hightstock中没有的
        //lineColor: "#666666",//设置x轴的颜色
        //tickColor: "#666666",//设置刻度的颜色
        tickLength: 5,//x轴刻度高
        lineWidth: 1,//轴线本身宽度
        //ordinal:false,//把x轴无数据的部分隐藏起来
        startOnTick: true,//是否强制轴以刻度开始
        //endOnTick: true,
        minPadding: 0,
        showEmpty: false//是否显示轴线和标题，当轴不包含数据时
    },
    yAxis: [],
    series: []
};

//设置曲线的时间标准（不设置时，会与当前时间相差8小时）
$(document).ready(function () {
    Highcharts.setOptions({
        global: {
            useUTC: false//曲线使用的时间标准
        }
    });
});

//创建highstock曲线
function createNewChart(data, devId) {
    var seriesList = data.result.seriesList ? data.result.seriesList : [];
    dataOptions.series = seriesList;
    dataOptions.chart.events = {
        load: function () {//异步加入告警
            for (var i = 0; i < Highcharts.charts.length; i++) {
                if (Highcharts.charts[i] != undefined) {
                    addAlerts(Highcharts.charts[i], data.result.alertList, devId);
                }
            }
        }
    };
    var yAxisStr = data.result.yAxisList ? data.result.yAxisList : [];
    var yAxisList = [];
    $.each(yAxisStr, function (idx, yAxis) {//设置y轴
        var unit = yAxis.text ? yAxis.text.substring(yAxis.text.indexOf("(") + 1, yAxis.text.indexOf(")")) : null;//截取单位
        yAxisList.push({
            min: $.inArray(unit, negativeArr) < 0 ? 0 : null,
            showEmpty: false,
            opposite: false,//y轴显示的位置，默认为true在右边
            title: {
                text: yAxis.text,
                style: {
                    color: yAxis.color,
                    "fontWeight": "bold"
                }
            }
        });
    });
    dataOptions.yAxis = yAxisList;
    chart = new Highcharts.Chart(dataOptions);

    if (isCenter) {//数据中心页面
        for (var i in chart.series) {
            chart.series[i].show();//显示曲线
        }
    } else {
        //设置曲线是否显示
        $("#hj_carousel li .intrble").find(".seleced").each(function () {
            var did = $(this).attr("id");
            chart.series[did].show();//显示曲线
        });
    }

    //firstLoad = false;
    return chart;
}

//设置可见的曲线名称
function setVisibleSeries() {
    visibleSeries = [];
    if (chart != undefined) {
        for (var i = 0; i < chart.series.length; i++) {
            var series = chart.series[i];
            if (series != undefined && series.visible) {
                visibleSeries.push(series.name);
            }
        }
    }
}

//添加报警标示
function addAlerts(chart, alertList, devId) {
    var visibleIds = [];
    //查询已经选中的传感器
    $("#hj_carousel li .intrble").find(".seleced").each(function () {
        var did = $(this).attr("deviceid");
        visibleIds.push(did);
    });
    if (null != alertList) {
        for (var i = 0; i < alertList.length; i++) {
            var alert = alertList[i];
            var visible = $.inArray(alert.id + "", visibleIds) > -1;
            var flagSeries = {
                id: "Alerts_series_"+alert.id,
                type: "flags",
                name: "Alert_" + alert.id,
                precision: alert.precision,
                data: [],
                onSeries: 'series_' + alert.id,
                shape: "squarepin",
                showInLegend: false,
                height: 18,
                events: {
                    click: function (event) {
                    }
                },
                zIndex: 1000,	// Always on top
                visible: visible,//alertSeriesShown
                yAxis:alert.yAxis
            };
            var infoList = alert.infos;
            for (var j = 0; j < infoList.length; j++) {
                var info = infoList[j];
                if (info.alertTime > 0) {
                    var data = {};
                    data.x = info.alertTime;// * 1000;//后台处理数据时已除以1000
                    data.isAlert = true;
                    data.alertId = alert.id;
                    data.inTitle = alert.deviceName;
                    data.content = info.content;
                    switch (info.cause) {
                        case -2:
                            data.val = info.val;
                            data.limit = decimal(alert.lowVal, 2);
                            //data.content = "已低于下限值20%";
                            data.title = "A";
                            data.fillColor = 'red';
                            break;
                        case -1:
                            data.val = info.val;
                            data.limit = decimal(alert.lowVal, 2);
                            //data.content = "已低于下限值";
                            data.title = "W";
                            data.fillColor = 'yellow';
                            break;
                        case 1:
                            data.val = info.val;
                            data.limit = decimal(alert.upVal, 2);
                            //data.content = "已超出上限值";
                            data.title = "W";
                            data.fillColor = 'yellow';
                            break;
                        case 2:
                            data.val = info.val;
                            data.limit = decimal(alert.upVal, 2);
                            //data.content = "已超出上限值20%";
                            data.title = "A";
                            data.fillColor = 'red';
                            break;
                    }
                    flagSeries.data.push(data);
                } else {
                }
            }
            chart.addSeries(flagSeries);
        }
    }
}