//轮播器
$.fn.extend({
    //左右轮播切换
    hj_carousel: function (o) {
        o = $.extend({
            btnNext: "",
            btnPrev: "",
            auto: false,
            display: 3,
            resize: false,
            speed: 2000,
            start: 0,
            show: 4,
            btnGoto: "",//add by yhq 2016-01-27
            gotoFun: function () {//add by yhq 2016-01-27
                return {to: -3, display: 3};
            }
        }, o || {});
        //DOM对象定义
        var div = $(this),
            ul = $("ul:first", div),
            li = ul.children('li'),
            liN = li.size(),
            liW = li.outerWidth(true);

        //判断Li的数量是否大于显示的数量，如果大于显示数量按钮显示
        if (liN > o.show) {
            $(o.btnNext).show();
            $(o.btnPrev).show();
        }else{//少于时不能自动播放
            o.auto = false;
        }

        //判断是否需要自适应UL的宽度
        if (o.resize) {
            $(window).resize(function () {
                liW = $(window).width();
                div.css({
                    width: liW
                });
                ul.css({
                    width: liW * liN
                });
                li.css({
                    width: liW
                });
            }).resize();
        } else {
            var liW = li.outerWidth(true);
        }

        //判断是否需要自动播放
        if (o.auto) {
            $(this).parent().hover(function () {
                clearInterval(o.timer);
            }, function () {
                o.timer = setInterval(function () {
                    return go(o.start - o.display);
                }, o.speed);
            }).trigger("mouseleave");

            function autoPlay() {
                return go(o.start - o.display);
                o.timer = setTimeout(autoPlay, o.speed);
            }
        }

        //向右点击
        $(o.btnNext).click(function () {
            return go(o.start - o.display);
            //console.log(222);
        });
        //向左点击
        $(o.btnPrev).click(function () {
            return go(o.start + o.display);
        });

        //执行
        function go(to) {
            o._s = to <= o.start ? o.start : liN - o.display;
            o._e = to <= o.start ? o.display : liN;
            if (!ul.is(":animated")) {
                if (to <= o.start) {
                    ul.stop(true, false).animate({
                        left: "+=" + liW * to
                    }, 100, function () {
                        $(ul).children("li").slice(o._s, o._e).detach().appendTo(ul);
                        ul.css("left", 0);
                    });
                } else {
                    ul.stop(true, false).animate({
                        left: "-=" + liW * to
                    }, 0, function () {
                        $(ul).children("li").slice(o._s, o._e).detach().prependTo(ul);
                        ul.stop(true, false).animate({
                            left: 0
                        }, 100);
                    });
                }
            }
        }

        //add by yhq 2016-01-27
        //判断是否有跳转按钮
        if (o.btnGoto) {
            $(o.btnGoto).unbind("click").bind("click", function () {
                var params = o.gotoFun(this);
                go2(params.to, params.display);
            });
        }

        //add by yhq 2016-01-27
        //跳到某一个
        function go2(to, display) {
            o._s = to <= o.start ? o.start : liN - display;
            o._e = to <= o.start ? display : liN;
            if (!ul.is(":animated")) {
                if (to <= o.start) {
                    ul.stop(true, false).animate({
                        left: "+=" + liW * to
                    }, 100, function () {
                        $(ul).children("li").slice(o._s, o._e).detach().appendTo(ul);
                        ul.css("left", 0);
                    });
                } else {
                    ul.stop(true, false).animate({
                        left: "-=" + liW * to
                    }, 0, function () {
                        $(ul).children("li").slice(o._s, o._e).detach().prependTo(ul);
                        ul.stop(true, false).animate({
                            left: 0
                        }, 100);
                    })
                }
            }
        }
    }
});