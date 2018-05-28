/**
 * <pre>
 * Author: 章永传
 * Company: 浙江托普云农科技股份有限公司
 * Update: 2016-12-02 18:00
 * Version: 1.0
 * Description:
 * </pre>
 */
(function ($) {
    $.fn.topdapengctrl = function (options) {
        var defaults = {
            defTime: function () {

            },
            init: $.noop,
            stationId: function () {
                return $('#stationId').val();
            },
            landId: function () {
                return $('#landId').val();
            },
            deviceId: function () {
                return $('#deviceId').val();
            }
            , serialNum: function () {
                return $('#serialNum').val();
            },
            sensorIds: function (checked) {
                var $sensorIds = "";
                var $element = checked ? $('input[name="sensor_latest"]:checked') : $('input[name="sensor_latest"]');
                $element.each(function () {
                    if ($sensorIds) {
                        $sensorIds += ','
                    }
                    $sensorIds += $(this).closest('li').attr('id');
                });
                return $sensorIds;
            },
            searchEvent: function () {//时间控件及切换
            	
                $('#mSearch').off('click').on('click', function () {
                    $('#dataShow span.current').trigger('click');
                });
                $('#dataShow .tab-hd span').off('click').on('click', function () {
                    var $id = $(this).attr('id');
                    $(this).addClass('current').siblings("span").removeClass("current");
                    $('#dataShow .tab-bd-con:eq(' + $(this).index() + ')').show().siblings(".tab-bd-con").hide().addClass("current");

                    if ($id == 'btn_data_line') {
                        methods.sensorDataCurve();//数据曲线
                    } else if ($id == 'btn_data_list') {
                        //var deviceIds = options.sensorIds().split(',');
                        //var $title = $('<tr><th>时间</th></tr>');
                        //if (deviceIds) {
                        //    for (var i = 0, j = deviceIds.length; i < j; i++) {
                        //        $title.append('<th>' + $('#' + deviceIds[i]).find('.name:first').text() + '</th>');
                        //    }
                        //}
                        //$('#sensorDatas thead').html($title);
                    }
                });
            }
        };
        options = $.extend({}, defaults, options || {});

        /*var conf = {
            startDate: function () {
                return $('#startDate').val();
            },
            endDate: function () {
                return $('#endDate').val();
            },
            period: function () {
                if (null != this.startDate() && null != this.endDate()) {
                    var startTime = new Date(Date.parse(this.startDate().replace(/-/g, "/"))).getTime();
                    var endTime = new Date(Date.parse(this.endDate().replace(/-/g, "/"))).getTime();
                    var handleResult = parseInt(endTime / 1000 / 60 / 60 / 24 - startTime / 1000 / 60 / 60 / 24, 10);
                    if (handleResult <= 7) { //小于等于一周
                        return 30;
                    } else if (handleResult <= 31) { //小于等于1个月
                        return 180;
                    } else {//大于1个月
                        return 1440;
                    }
                }
            }
        };*/

        var methods = {
            init: function () {
                options.init();
                options.searchEvent();//
                methods.sensorDataCurve();//数据曲线
                /*methods.sensorLatestData(
                    function () {
                        methods.sensorDataCurve();//数据曲线
                        
                    }
                );//传感器24小时内最近一条数据*/
               // methods.sensorDataExport();//数据导出
               // methods.ctrlBlock.init(0);
            },

            /*sensorLatestData: function (callback) {
                methods._ajax('js/data/json', {
                    deviceId: options.deviceId()
                }, null, null, function (data) {
                    var $liSort = {
                        sensorCount: 0,
                        sensor: {
                            '177': '',
                            '178': '',
                            '161': '',
                            '162': '',
                            '186': '',
                            '185': ''
                        },
                        each: function (list, ele) {
                            var len = list ? list.length : 0;
                            if (len > 0) {
                                this.sensorCount = len;
                                for (var i = 0; i < len; i++) {
                                    this.li(list[i]);
                                }
                                $(ele).html(this.lis());

                                if (this.sensorCount > 6) {
                                    //$('.sensors li').css({'margin': '0px 1px 0px 0px'});
                                    //$('.sensors .box').css({'width': '98px'});
                                }
                            } else {
                                $(ele).html('<li style="text-align: center;width: 580px;padding-top: 70px;"><b>无传感器<b></li>');
                            }
                            $(ele + ' li:first').find('input:checkbox').trigger('click');
                        },
                        li: function (sensor) {
                            var $li = $('<li></li>').attr('id', sensor['id']).attr('lowVal', sensor['lowVal']).attr('upVal', sensor['upVal']);
                            var $label = $('<label></label>');
                            $li.append($label);
                            var $span1 = $('<img src="../../images/111_03.png" class="jd-li-top box"/>');
                            var $span2 = $('<div class="jd-li-bottom name"></div>')
                                .append('<input type="checkbox" name="sensor_latest" value="' + sensor['id'] + '">')
                                .append('<span title="' + sensor['name'] + '">' + sensor['name'] + '</span>')
                            $label.append($span1);
                            $label.append($span2);
                            this['sensor'][sensor['type']] = $li;
                            //传感器订阅nodejs
                            nodejs_dev.subscribe(sensor['id'], ["sensor_"]);
                        },
                    };
                    $liSort.each(data.result, '.sensors');
                    callback.call();
                }, true);
            },*/

            //曲线数据
           
            sensorDataCurve: function () {
                $("#pyxLine").html("<h3 style='line-height: 338px;'>正在加载中...</h3>");
                $.ajax({
                    type: "get",
                    url: "js/jdhj.json",
                    dataType: "json",
                    async: false,//是否同步
                    cache: false,
                    success: function (data) {
                        if (data.code != 200) {
                            $('#pyxLine').html('<center><h3 style="line-height: 338px;">' + data.msg + '</h3></center>');
                             
                              $("#legend").hide();//隐藏报警图例
                       
                            return;
                        }
                        $.fn.topcharts({
                            data: data,
                            renderTo: 'pyxLine',//折线容器
                            callback: function (chart) {
                                $('.sensors').children("li").children("div.sj-cgq-right").find('input[name="sensor_latest"]').each(function (i) {
                                   $(this).off('change').on('change', function () {
                                        var $checked = $(this).prop('checked');
                                        //var dataType = $('#dataShow .current').attr('id');
                                          //if (dataType == 'btn_data_line') {//曲线
                                            var seriesId = 'series_' + $(this).val();//value中和id相同
                                            var series = chart.get(seriesId);
                                            if ($checked) {
                                                if (series) {
                                                    series.show();
                                                }
                                                
                                            } else {
                                                if (series) {
                                                    series.hide();
                                                }
                                               
                                            }
                                       // }
                                    
                                    });
                                });
                            }
                        });
                    }
                });
            },
            _ajax: function (url, data, promptText, prompCallback, successCallback, isLoadData) {
                $.ajax({
                    beforeSend: function () {
                        if (promptText) {
                            methods._prompt(promptText);
                        }
                    },
                    complete: function () {
                        if (promptText) {
                            prompCallback.call();
                        }
                    },
                    url: url,
                    type: 'post',
                    dataType: 'json',
                    data: data,
                    success: function (data) {
                        if (successCallback) {
                            successCallback(data);
                        }
                    },
                    error: function () {
                        if (!isLoadData) {
                            mDialog("<font color='red'>操作失败!</font>");
                        }
                    }
                });
            }
        };
        methods.init();
    };
})(jQuery);




    
//}