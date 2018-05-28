/**
 * <pre>
 * Author: 章永传
 * Company: 浙江托普云农科技股份有限公司
 * Update: 2017-01-05 15:03
 * Version: 1.0
 * Description:
 * </pre>
 */
(function ($) {
    $.fn.topcharts = function (options) {
        var negativeArr = ["℃", "mm", "W/m²", "mV", "kPa"];//保存有负数的传感器的单位
        var chart = null;
        var defaults = {
            simple: {
                flag: false,//flag=true时,使用简单(无告警处理)的曲线
                dataAllNotShow: 0,
                msg: '',//有曲线并有数据，但都不显示的提示文字
                series: []
            },
            data: [],
            backgroundColor: '#fff',
            height: 250,
            //marginTop: 30,
            renderTo: 'pyxLine',
            multiYAxis: false,
            currCheckbox: function (deviceId) {
                return $('input[value="' + deviceId + '"][type="checkbox"]');
            },
            /**
             * 实例化
             * @param series
             * @param renderTo
             */
            mChart: function (series, renderTo, yAxisArrs) {
                return Highcharts.stockChart(renderTo, {
                    chart: {
                        backgroundColor: options.backgroundColor || '#e5eef6',
                        height: options.height || 250,
                        //marginTop: options.marginTop || 30
                    },
                    legend: {
                        enabled: false
                    },
                    rangeSelector: {
                        buttons: [{//定义一组buttons,下标从0开始
                            type: 'week',
                            count: 1,
                            text: '1周'
                        }, {
                            type: 'month',
                            count: 1,
                            text: '1月'
                        }, {
                            type: 'month',
                            count: 3,
                            text: '3月'
                        }, {
                            type: 'month',
                            count: 6,
                            text: '6月'
                        }, {
                            type: 'ytd',
                            text: '1季度'
                        }, {
                            type: 'year',
                            count: 1,
                            text: '1年'
                        }, {
                            type: 'all',
                            text: '全部'
                        }],
                        //inputDateFormat: '%Y-%m-%d',
                        //inputEditDateFormat: '%Y-%m-%d',
                        buttonTheme: {
                            display: 'none', // 不显示按钮
                            width: 36,
                            height: 16,
                            padding: 1,
                            r: 0,
                            stroke: '#68A',
                            zIndex: 7
                        },
                        selected: 1,
                        inputEnabled: false// 不显示日期输入框
                    },
                    title: {
                        text: ''
                    },
                    exporting: {
                        enabled: false //是否能导出趋势图图片
                    },
                    yAxis: options.yAxisHandle(yAxisArrs),
                    series: series
                });
            },
            yAxisHandle: function (yAxisArrs) {
                if (options.multiYAxis) {
                    var yAxisList = [];
                    $.each(yAxisArrs, function (idx, yAxis) {//设置y轴
                        //var unit = yAxis.text.substring(yAxis.text.indexOf("(") + 1, yAxis.text.indexOf(")"));//截取单位
                        yAxisList.push({
                            //min: $.inArray(unit, negativeArr) < 0 ? 0 : null,
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
                    return yAxisList;
                } else {
                    return {
                        opposite: false,//y轴显示的位置，默认为true在右边
                        showEmpty: true,
                        labels: {
                            style: {
                                color: '#6e6e70'
                            }
                        }
                    }
                }
            },
            /**
             * 设置曲线的visible属性(根据复选框是否选中来判断)
             * @param seriesList
             */
            seriesVisible: function (seriesList) {
                var deviceId = "";
                for (var i = 0, j = seriesList.length; i < j; i++) {
                    deviceId = seriesList[i].id.replace('series_', '');
                    seriesList[i]['visible'] = options.currCheckbox(deviceId).prop('checked');
                }
            },
            /**
             * 数据曲线
             * @param tempSeries
             * @returns {Array}
             */
            dataSeries: function (tempSeries) {
                var series = [];
                var seriesData;
                var $series;
                var $seriesData;
                for (var i = 0, j = tempSeries.length; i < j; i++) {
                    $series = tempSeries[i];
                    $seriesData = $series['scaling'] == undefined ? $series['data'] : $series['scalingData'];
                    seriesData = {
                        "id": $series['id'],
                        "data": [],
                        "scaling": $series['scaling'],
                        "name": $series['name'],
                        "visible": $series['visible'],
                        "precision": $series['precision'],
                        tooltip: {
                            valueSuffix: '',
                            pointFormatter: function () {
                                var $scaling = this.series.options.scaling;
                                var $scalingText = '';
                                var $val = '';
                                if ($scaling != undefined) {
                                    if ($scaling < 1) {
                                        $scaling = Math.round(1 / $scaling);
                                        $scalingText = '[' + $scaling + ':1]';
                                    } else {
                                        $scalingText = '[1:' + $scaling + ']';
                                    }
                                    $val = parseFloat(this.y * $scaling).toFixed(this.series.options.precision);
                                } else {
                                    $val = parseFloat(this.y).toFixed(this.series.options.precision);
                                }
                                return '<span style="color:' + this.series.color + '">' + this.series.name + $scalingText + ': <b>' + $val + '</b>' + this.series.options.tooltip.valueSuffix + '</span><br> ';
                            }
                        }
                    };
                    //多条y轴时
                    if (options.multiYAxis) {
                        seriesData.yAxis = $series.yAxis;
                    }
                    for (var n = 0, m = $seriesData.length; n < m; n++) {
                        seriesData['data'].push({"x": $seriesData[n][0], "y": $seriesData[n][1]});
                        innerClass.noData = false;
                    }
                    series.push(seriesData);
                }
                return series;
            },
            /**
             * 添加报警曲线
             * @param series
             * @param alertList
             */
            /*alertSeries: function (series, alertList) {
                if (null != alertList) {
                    for (var i = 0; i < alertList.length; i++) {
                        var alert = alertList[i];
                        var visible = options.currCheckbox(alert.id).prop('checked');
                        var flagSeries = {
                            id: "Alerts_" + alert.id,
                            type: "flags",
                            name: "Alert_" + alert.id,
                            precision: alert.precision,
                            data: [],
                            tooltip: {
                                pointFormatter: function () {
                                    if (this.options.isAlert) {//鼠标移到报警标注上
                                        var color = chart.get(this.series.options.onSeries).color;
                                        var $html = $('<div></div>');
                                        var child_1 = $('<div></div>').css({
                                            'font-weight': 'bold',
                                            'color': color
                                        }).html(this.options.inTitle);
                                        //var child_2 = $('<div></div>').append('<br/>').append('值:').append(decimal2(this.options.val, this.series.options.precision));
                                        //var child_3 = $('<div></div>').append('<br/>').append('限制值:').append(decimal2(this.options.limit, this.series.options.precision));
                                        //var child_4 = $('<div></div>').append('<br/>').append('描述:').append(this.options.content);
                                        $html.append(child_1).append(child_2).append(child_3).append(child_4);
                                        return $html.html();
                                    }
                                    //鼠标移到覆盖物上，即有加减标识的
                                    return "<span style=\"font-weight:bold; color:" + this.series.color + "\">" + this.series.name + "</span>: " +
                                        //Highcharts.dateFormat("%Y-%m-%d %H:%M:%S", this.x) + (this.y !== undefined ? "<br/>" +
                                        //Highcharts.numberFormat(this.y, 2) : "");
                                }
                            },
                            onSeries: 'series_' + alert.id,
                            shape: "squarepin",
                            width: 16,
                            showInLegend: false,
                            height: 18,
                            events: {
                                click: function (event) {
                                }
                            },
                            zIndex: 1000,	// Always on top
                            visible: visible//alertSeriesShown
                        };
                        var infoList = alert.infos;
                        var $color = "#abcdef";// chart.get('series_' + alert.id).color;
                        for (var j = 0; j < infoList.length; j++) {
                            var info = infoList[j];
                            if (info.alertTime > 0) {
                                var data = {};
                                data.x = info.alertTime;// * 1000;//后台处理数据时已除以1000
                                data.isAlert = true;
                                data.alertId = alert.id;
                                data.inTitle = alert.deviceName;
                                data.content = info.content;
                                data.color = $color;
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
                        series.push(flagSeries);
                    }
                }
            },*/
            /**
             * 回调函数
             * @param chart
             */
            callback: function (chart) {

            }
        };
        options = $.extend({}, defaults, options || {});
        var innerClass = {
            noData: true,
            init: function () {
                if (options.simple.flag) {
                    chart = options.mChart(options.simple.series, options.renderTo);
                    return chart;
                } else {
                    var result = options.data.result || {};
                    var tempSeries = result.seriesList || [];
                    //var alertList = result.alertList || [];
                    options.seriesVisible(tempSeries);
                    var series = options.dataSeries(tempSeries);
                    //options.alertSeries(series, alertList);
                    chart = options.mChart(series, options.renderTo, result.yAxisList || []);
                    options.callback(chart);
                    return chart;
                }
            },
            noDataHandle: function () {
                //有数据,但没有曲线显示时,重置提示信息
                if (options.simple.flag && options.simple.dataAllNotShow) {
                    $('#' + options.renderTo).find('.highcharts-no-data text:first').html(options.simple.msg);
                } else {
                    if (!innerClass.noData) {
                        $('#' + options.renderTo).find('.highcharts-no-data text:first').html('请选择传感器显示曲线');
                    }
                }
            }
        };
        innerClass.init();
        innerClass.noDataHandle();
        return chart;
    };
})(jQuery);