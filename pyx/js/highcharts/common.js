/**
 * Copyright(c) 2004-2014,浙江托普仪器有限公司
 * All rights reserved
 * 摘    要：数据模块一些公共的js方法
 * 作    者：yhq
 * 日    期：2014-12-14 11:00
 */


/**
 * 位数不足左边补0
 * @param number 需要处理的数字
 * @param length 需要的长度
 * @param char 填补的字符
 * @returns {string}
 */
function padLeft(number, length, char) {
    return (Array(length).join(char || "0") + number ).slice(-length);
}

// 格式化时间
function dateFormat(oDate, fmt) {
    var o = {
        "M+": oDate.getMonth() + 1, //月份
        "d+": oDate.getDate(), //日
        "h+": oDate.getHours(), //小时
        "m+": oDate.getMinutes(), //分
        "s+": oDate.getSeconds(), //秒
        "q+": Math.floor((oDate.getMonth() + 3) / 3), //季度
        "S": oDate.getMilliseconds()//毫秒
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (oDate.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}

/**
 * 时间格式化
 * @param date 需要格式化的日期，date类型
 * @param parrent 格式
 * @returns {string} 返回yyyy-MM-dd hh:mm:ss格式的日期字符串
 */
function formatDate(date, parrent) {
    //为了兼容ie，对时间字符串进行处理
    //date = date.replace(/-/g,"/");

    if (!date) {//date为空
        return "";
    }
    date = new Date(date);
    var fullYear = date.getFullYear();
    var month = date.getMonth() + 1;
    if (month.toString().length == 1) {
        month = "0" + month;
    }
    var day = date.getDate();
    if (day.toString().length == 1) {
        day = "0" + day;
    }
    var hour = date.getHours();
    if (hour.toString().length == 1) {
        hour = "0" + hour;
    }
    var min = date.getMinutes();
    if (min.toString().length == 1) {
        min = "0" + min;
    }
    var sec = date.getSeconds();
    if (sec.toString().length == 1) {
        sec = "0" + sec;
    }
    var dateStr = "";
    parrent = $.trim(parrent);
    if (typeof(parrent) == "string" && null != parrent && "" != parrent) {
        if (parrent.indexOf("yyyy") > -1) {
            dateStr += fullYear;
        }
        if (parrent.indexOf("MM") > -1) {
            dateStr += "-" + month;
        }
        if (parrent.indexOf("dd") > -1) {
            dateStr += "-" + day;
        }
        if (parrent.indexOf("hh") > -1) {
            dateStr += " " + hour;
        }
        if (parrent.indexOf("mm") > -1) {
            dateStr += ":" + min;
        }
        if (parrent.indexOf("ss") > -1) {
            dateStr += ":" + sec;
        }
        if (dateStr.charAt(0) == "-" || dateStr.charAt(0) == " " || dateStr.charAt(0) == ":") {
            dateStr = dateStr.substr(1, dateStr.length - 1);
        }
    } else {
        dateStr = fullYear + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
    }
    return dateStr;
}

/**
 * 判断时间区间是否合法
 * @param beginTime 开始时间，string类型
 * @param endTime 结束时间，string类型
 * @param min 最小区间
 * @param max 最大区间
 * @returns {boolean}
 */
function checkTime(beginTime, endTime, min, max) {
    //为了兼容ie，对时间字符串进行处理
    beginTime = beginTime.replace(/-/g, "/");
    endTime = endTime.replace(/-/g, "/");

    var time = (new Date(endTime).getTime() - new Date(beginTime).getTime()) / 1000 / 60;//转化成分钟
    if (time <= 0) {//开始时间大于等于结束时间
        return false;
    }
    if (min != null) {
        if (time < min) {
            return false;
        }
    }
    if (max != null) {
        if (time > max) {
            return false;
        }
    }
    return true;
}

/**
 * 判断时间区间是否合法
 * @param beginTime 开始时间，string类型
 * @param endTime 结束时间，string类型
 * @param min 最小区间
 * @param max 最大区间
 * @returns {number}
 */
function checkTime2(beginTime, endTime, min, max) {
    //为了兼容ie，对时间字符串进行处理
    beginTime = beginTime.replace(/-/g, "/");
    endTime = endTime.replace(/-/g, "/");

    var time = (new Date(endTime).getTime() - new Date(beginTime).getTime()) / 1000 / 60;//转化成分钟
    if (time <= 0) {//开始时间大于等于结束时间
        return 1;
    }
    if (min != null) {
        if (time < min) {
            return 2;
        }
    }
    if (max != null) {
        if (time > max) {
            return 2;
        }
    }
    return 0;
}

/**
 * 设置默认时间，前提条件：页面中有全局变量beginTime,endTime
 * @param beginTime 开始时间，string类型
 * @param endTime 结束时间，string类型
 * @param hourLength 默认时间长度，以小时为单位
 * @param beginTimeContainer 开始时间显示的容器
 * @param endTimeContainer 结束时间显示的容器
 */
function setDefaultTime(begin_time, end_time, hourLength, beginTimeContainer, endTimeContainer) {
    //为了兼容ie，对时间字符串进行处理
    begin_time = begin_time.replace(/-/g, "/");
    end_time = end_time.replace(/-/g, "/");

    //开始和结束时间有空值时，设置默认时间
    if (begin_time == "" || end_time == "") {
        var now = new Date();
        var ago = new Date(now);//now.setDate(now.getDate() - 1);
        if (begin_time == "") {
            if (end_time == "") {//开始和结束时间都为空时，设置为当前最近的24小时
                ago.setHours(ago.getHours() - hourLength);
                beginTime = formatDate(ago);
                endTime = formatDate(now);
            } else {//只有开始时间为空时，设置为结束时间之前的24小时
                ago = new Date(end_time);
                ago.setHours(ago.getHours() - hourLength);
                beginTime = formatDate(ago);
            }
        } else {
            if (end_time == "") {//只有结束时间为空时，设置开始时间之后的24小时
                ago = new Date(begin_time);
                ago.setHours(ago.getHours() + hourLength);
                endTime = formatDate(ago);
                if (ago > now) {
                    endTime = formatDate(now);
                }
            }
        }
        $("#" + beginTimeContainer).val(beginTime);
        $("#" + endTimeContainer).val(endTime);
    }
}

/**
 * 根据开始时间和结束时间区间设置采集间隔
 * @param beginTime 开始时间，string类型
 * @param endTime 结束时间，string类型
 * @returns {number}
 */
function setPeriod(beginTime, endTime) {
    //为了兼容ie，对时间字符串进行处理
    beginTime = beginTime.replace(/-/g, "/");
    endTime = endTime.replace(/-/g, "/");

    var time = (new Date(endTime).getTime() - new Date(beginTime).getTime()) / 1000 / 60;//转化成分钟
    var interval = 30;//默认采集间隔为30分钟
    //时间区间大于半个小时小于一天，采集间隔为30分钟
    if (time >= 30 && time <= 24 * 60) {
        interval = 30;
    }
    //时间区间大于一天小于一星期，采集间隔为3小时
    if (time > 24 * 60 && time <= 7 * 24 * 60) {
        interval = 180;
    }
    //时间区间大于一星期小于1个月，采集间隔为一天
    if (time > 7 * 24 * 60 && time <= 1 * 30 * 24 * 60) {
        interval = 1440;
    }
    return interval;
}

/**
 * 保留n位小数
 * @param num 表示要四舍五入的数
 * @param n 表示要保留的小数位数
 * @returns {number}
 */
function decimal(num, n) {
    if (isNaN(num)) {//如果不是数字
        return num;
    }
    var vv = Math.pow(10, n);
    return Math.round(num * vv) / vv;
}

/**
 * 强制保留n位小数
 * @param num
 * @param n
 * @returns {string|*}
 */
function decimal2(num, n) {
    if (isNaN(num)) {//如果不是数字
        return num;
    }
    num = decimal(num, n);
    var str = num.toString();
    var rs = str.indexOf('.');
    if (n > 0) {
        if (rs < 0) {
            rs = str.length;
            str += '.';
        }
        while (str.length <= rs + n) {
            str += '0';
        }
    }
    return str;
}

/**
 * 根据传感器类型设置传感器数据精度
 * @param sensorType 传感器类型
 * @param num 数据
 * @returns {*}
 */
function setPrecision(sensorType, num) {
    if (isNaN(num)) {//如果不是数字
        return num;
    }
    var str = num;
    //大气压、二氧化碳、光照强度、光合有效辐射、紫外辐射、总辐射、一氧化碳、氨气、硫化氢、PM2.5、水位
    if (sensorType == 180 || sensorType == 184 || sensorType == 185 || sensorType == 186 || sensorType == 187
        || sensorType == 188 || sensorType == 189 || sensorType == 194 || sensorType == 196 || sensorType == 199
        || sensorType == 197 || sensorType == 215 || sensorType == 216 || sensorType == 217) {
        str = decimal(num, 0);
        //土壤盐分、甲醛、PM10、余氯、浊度、溶解氧、氨氮、树木生长
    } else if (sensorType == 163 || sensorType == 193 || sensorType == 198 ||
        sensorType == 209 || sensorType == 210 || sensorType == 213 || sensorType == 214 || sensorType == 171) {
        str = decimal2(num, 2);
    } else if (sensorType == 181 || sensorType == 166 || sensorType == 167) {//风速、茎秆增长、果实增长
        str = decimal2(num, 3);
    } else {
        str = decimal2(num, 1);
    }
    return str;
}

/**
 * 根据传感器名称设置传感器数据精度
 * @param sensorName 传感器名称
 * @param num
 * @returns {*}
 */
function setPrecision2(sensorName, num) {
    if (isNaN(num)) {//如果不是数字
        return num;
    }

    var str = num;
    if (sensorName.indexOf("大气压") >= 0 || sensorName.indexOf("二氧化碳") >= 0 ||
        sensorName.indexOf("光照强度") >= 0 || sensorName.indexOf("光合有效辐射") >= 0 ||
        sensorName.indexOf("紫外辐射") >= 0 || sensorName.indexOf("总辐射") >= 0 ||
        sensorName.indexOf("一氧化碳") >= 0 || sensorName.indexOf("氨气") >= 0 ||
        sensorName.indexOf("硫化氢") >= 0 || sensorName.indexOf("PM2.5") >= 0 ||
        sensorName.indexOf("氧化还原电位") >= 0 || sensorName.indexOf("电导") >= 0 ||
        sensorName.indexOf("水位") >= 0) {
        str = decimal(num, 0);
    } else if (sensorName.indexOf("土壤盐分") >= 0 || sensorName.indexOf("甲醛") >= 0
        || sensorName.indexOf("PM10") >= 0 || sensorName.indexOf("余氯") >= 0 || sensorName.indexOf("浊度") >= 0
        || sensorName.indexOf("溶解氧") >= 0 || sensorName.indexOf("氨氮") >= 0 || sensorName.indexOf("树木生长") >= 0) {
        str = decimal2(num, 2);
    } else if (sensorName.indexOf("茎秆增长") >= 0 || sensorName.indexOf("果实增长") >= 0
        || sensorName.indexOf("风速") >= 0) {
        str = decimal2(num, 3);
    } else {
        str = decimal2(num, 1);
    }
    return str;
}

/**
 * 当记录数为0时，设置分页控件中的跳转按钮等失去作用
 */
function paginationDisabled() {
    $("#goPage").attr("disabled", true);
    $(".btn-goto").attr("disabled", true);
}

/**
 * 根据时间间隔拼接x轴刻度
 * @param beginTime 开始时间
 * @param endTime 结束时间
 * @param interval 时间间隔
 * @returns {string}
 */
function jointX(beginTime, endTime, interval) {
    //为了兼容ie，对时间字符串进行处理
    beginTime = beginTime.replace(/-/g, "/");
    endTime = endTime.replace(/-/g, "/");

    //拼接x轴坐标
    var cate = "[";
    //var timeList = new Array();//保存各个时间点
    var datetime = new Date(beginTime);
    //alert("beginTime=" + beginTime);//--TEST
    //alert("datetime=" + datetime);//--TEST
    if (interval == 30) {
        if (!((datetime.getMinutes() == 0 || datetime.getMinutes() == 30) && datetime.getSeconds() == 0)) {
            datetime.setMinutes(30 * parseInt(datetime.getMinutes() / 30) + 30);
            datetime.setSeconds(0);
        }
        //alert("datetime=" + formatDate(datetime));//--TEST
        //每半小时拼接x坐标轴
        while (datetime <= new Date(endTime)) {
            cate += "'" + datetime.getTime() + "',";
            //timeList.push(datetime.getTime());
            datetime.setMinutes(datetime.getMinutes() + 30);
        }
    } else if (interval == 180) {
        if (!(datetime.getHours() % 3 == 0 && datetime.getMinutes() == 0 && datetime.getSeconds() == 0)) {
            datetime.setHours(3 * parseInt(datetime.getHours() / 3) + 3);
            datetime.setMinutes(0);
            datetime.setSeconds(0);
        }
        //alert("datetime=" + formatDate(datetime));//--TEST
        //每3小时拼接x坐标轴
        while (datetime <= new Date(endTime)) {
            cate += "'" + datetime.getTime() + "',";
            //timeList.push(datetime.getTime());
            datetime.setHours(datetime.getHours() + 3);
        }
    } else if (interval == 1440) {
        //if (datetime.getHours() != 0 || datetime.getMinutes() != 0 || datetime.getSeconds() != 0) {
        //    datetime.setDate(datetime.getDate() + 1);
        //    datetime.setHours(0);
        //    datetime.setMinutes(0);
        //    datetime.setSeconds(0);
        //}
        //时间间隔为天时，直接忽略时分秒
        datetime.setHours(0);
        datetime.setMinutes(0);
        datetime.setSeconds(0);
        //每一天拼接x坐标轴
        while (datetime <= new Date(endTime)) {
            cate += "'" + datetime.getTime() + "',";
            //timeList.push(datetime.getTime());
            datetime.setDate(datetime.getDate() + 1);
        }
    }
    if (cate.charAt(cate.length - 1) == ",") {
        cate = cate.substr(0, cate.length - 1);
    }
    cate += "]";
    return cate;
}

/**
 * 字符串截取固定长度
 * @param str 需要截取的字符串
 * @param start 开始截取的位置
 * @param length 需要的字符串长度（当原来的字符串长度大于需要的长度时。截取后加上“...”）
 * @returns {*}
 */
function cutStr(str, start, length) {
    if (str) {
        str = str.length > length ? str.substr(start, length - 1) + "..." : str;
    } else {
        str = "";
    }
    return str;
}

/**
 * 检查图片格式（限于bmp,png,gif,jpeg,jpg）
 * @param filePath 图片路径
 * @returns {string}
 */
function checkImageFormat(filePath) {
    var errorMsg;
    if (!filePath) {
        errorMsg = "请选择图片";
    } else {
        var extStart = filePath.lastIndexOf(".");
        var ext = filePath.substring(extStart, filePath.length).toUpperCase();
        //检测允许的上传文件类型
        if (ext != ".BMP" && ext != ".PNG" && ext != ".GIF" && ext != ".JPG" && ext != ".JPEG") {
            errorMsg = "图片限于bmp,png,gif,jpeg,jpg格式";
        }
    }
    return errorMsg;
}

function getMax(arr) {//传入arr数组参数
    var max = 0;//初始化角标
    for (var x = 1; x < arr.length; x++) {
        if (arr[x] > arr[max])// 1的角标>0的角标吗？
            max = x;//如果大于那么就把1的角标对应的参数赋值给max角标对应的参数。
    }
    return arr[max];
}