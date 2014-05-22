/**
 * 对话框浮层
 * 
 */
define("comp/popLayer",function(require){
	var $baseLayer = require("../comp/baseLayer");
	
	
	return function(options){
		var that = $baseLayer(options);

		var init = function(){
			var outer = that.getOuter();
			outer.className = "pop-layer";
			bindEvent();
			
			that.on("destroy",function(){
				unBindEvent();
			})
		},bindEvent,unBindEvent;
		
		bindEvent = function(){
			window.addEventListener('orientationchange',evtHandler,false);
			window.addEventListener('resize',evtHandler,false)
		},unBindEvent = function(){
			window.removeEventListener('orientationchange',evtHandler,false);
			window.removeEventListener('resize',evtHandler,false)
		};
		
		var evtHandler = {
			handleEvent:function(e){
				that.show();
			}
		};
		
		var deleShow = that.show;
		that.show = function(){
			deleShow({
				"visibility":"hidden"
			});
			
			var outer = that.getOuter();
			
			var width = outer.offsetWidth,
				height = outer.offsetHeight;
			var screenHeight = document.documentElement.clientHeight;
				screenWidth =  document.documentElement.clientWidth;
			var left = (screenWidth - width)/2;
			left = left <0 ? 0:left;
			
			var top = screenHeight - height + document.body.scrollTop;
			
			deleShow({
				"left":left+"px",
				"top":top+"px",
				"visibility":"visible",
				"z-index":"100"
			});
			
		}
		init();
		
		return that;
	}
})

