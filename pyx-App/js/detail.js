$(function(){
	var line;
	function lines(id,legend,ydata,data){
		line=echarts.init(document.getElementById(id))
		var optionline={
			tooltip : {
		        trigger: 'axis',	        
		   	},
		   	legend: {
	            data:legend,
	            /*x:'18%',
	            y:'10%',*/	           
	        },
			xAxis:[
				{
					type:'category',
					data:ydata,		
					boundaryGap : false,//去除两端空白
					axisTick : {    // 轴标记
		                show:false		               
		            },
		            axisLine : {    // 轴线
		                show: true,
		                lineStyle: {//水平州的颜色
		                    color: '#f1f1f1',
		                    type: 'dashed',
		                    width: 1
		                }
		            },
					axisLabel : {
		                show:true,
		                textStyle: {//水平轴字体颜色
		                    color: '#808080',
		                    fontSize: 12,
		                }
		           	},
		            splitLine : {//去掉背景曲线
		                show:false,		               
		            }
				}	
			],
			yAxis:[
				{
					type:'value',
					name : "气温(℃)",
					nameTextStyle:{
						color: '#a7a7a7',
					},
					position: 'left',
					axisTick : {    // 轴标记
		                show:false,
		            },
		            axisLine : {    // 轴线
		                show: true,
		                lineStyle: {//水平州的颜色
		                    color: '#fff',
		                    type: 'solid',
		                    width: 1
		                }
		            },
		            splitLine : {//去掉背景曲线
		                show: true,
		                lineStyle: {//水平州的颜色
		                    color: '#f1f1f1',
		                    type: 'dashed',
		                    width: 1,
		                }
		            },
		            axisLabel : {
		                show:true,
		                textStyle: {//垂直轴字体颜色
		                    color: '#808080',
		                    fontSize: 12,
		                }
		           	},
		            /*axisLabel : {//数值带有单位
	                    formatter: '{value} %'
	                }*/
				}
			],
			series : [
		        {
		            name: '气温',
		            type: 'line',
		            smooth:true,//折线图趋于平缓
		            symbol:'none',//线上的圆点
		            itemStyle:{//修改折线图的颜色
		            	normal:{
		            		color:'#fff',////修改折线图点的颜色
		            		lineStyle:{
		            			color:'#108ee8',
		            			width:3,//线条变粗
		            		},
		            	}
		            },
		            data: data,
		        },
		    ]          
		}
		line.setOption(optionline);	
	}
	lines("line1",["气温"],["04-03","04-04","04-05"],["12","14","10"]);	
	//切换天数
	function change(ele,css1,css2){
		$(ele).click(function(){
			$index=$(this).index();
			$(this).css({"color":"#0087fd","border":"1px solid #0087fd","border-radius":"5px"});			
			if($index==0){
				$(css2).css({"border":"1px solid #808080","color":"#333","border-top-left-radius":"0","border-bottom-left-radius":"0","border-left":"none"});
				$("#line1").show();$("#line2").hide();
			}else if($index==1){
				$(css1).css({"border":"1px solid #808080","color":"#333","border-top-right-radius":"0","border-bottom-right-radius":"0","border-right":"none"});
				$("#line2").show();$("#line1").hide();
				
				//切换第七天时的数据
				lines("line2",["气温"],["04-06","04-07","04-08"],["12","13","10"]);
			}
		})
	}
	change(".day-nav li",'.seven','.three');
	change(".day-nav li",'.three','.seven');
	
	//进入告警信息
	$(".gjxx").click(function(){
		window.location.href="gjxx.html";
	})
})
