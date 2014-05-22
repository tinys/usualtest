/**
 * 浮层
 * 
 * @author dongyajie
 */
define("comp/baseLayer",function(require){
	var req = require;
	var $model = req("core/model"),
		$ = req.hug;
	var mask = (function(){
		var that = {};
		
		var getMaskLayer = function(){
			if(!that.div){
				that.div = document.createElement("div");
				that.div.style.cssText = "z-index:1;position:absolute;left:0px;top:0px;width:100%;height:100%;background-color:#000;opacity:.6;display:none;";
				document.body.appendChild(that.div);
			}
			return that.div;
		}
		
		that.setOpacity = function(opacity){
			getMaskLayer().style["opacity"] = opacity;
		};
		that.show = function(){
			var width = document.documentElement.clientWidth,
				height = document.documentElement.clientHeight;
			getMaskLayer().style.width = width+"px";
			getMaskLayer().style.height = height+"px";
			
			getMaskLayer().style.display = "";
		};
		that.hide = function(){
			getMaskLayer().style.display = "none";
		};
		that.getMask = function(){
			return getMaskLayer();
		}
		return that;
	})();
	
	var cssText = function(el){
		var style = {};
		var text = el.style.cssText;
		var styleArr = text.split(";");
		styleArr.forEach(function(a,i){
			if(a){
				var values = a.split(":");
				values[0].trim() && (style[values[0].trim()] = values[1]);
			}
		});
		
		var obj = {};
		obj.css = function(sty){
			if(sty){
				for(var i in sty){
					style[i] = sty[i];
				}
			}
		};
		obj.getText = function(){
			var result = [];
			for(var i in style){
				result.push(i+":"+style[i]);
			}
			return result.join(";")
		};
		return obj;
	};
	
	return function(option){
		var param = {
			mask:true,
			opacity:.8,
			zIndex:3,
			
			left:0,
			top:0,
			
			html:'',
			
			// 是否阻止浏览器默认行为
			preventDefault:false,
			style:{}
		};
		
		var that = $model(),
			_this = {
				_layer:false
			};
		if(option){
			param = $.extend(param,option);
		}
		var preventDefaultEventList =["touchstart","touchmove"];
		var init = function(){
			_this._layer = document.createElement("div");
			_this._layer.style.cssText = "position:absolute;left:0px;top:0px;display:none;";
			document.body.appendChild(_this._layer);
			if(param.html){
				_this._layer.innerHTML = param.html;
			}
			if(param.preventDefault){
				preventDefaultEventList.forEach(function(a){
					document.body.addEventListener(a,that,false);
				})
			}
			if(param.style){
				var style = cssText(_this._layer);
				style.css(param.style);
				_this._layer.style.cssText = style.getText();
			}
		};
		that.handleEvent  = function(e){
			e.preventDefault();
		};
		
		that.show = function(position){
			var style = cssText(_this._layer);
			style.css(position);
			style.css({"display":""});
			_this._layer.style.cssText = style.getText();
			
			if(param.mask){
				mask.show();
			}
			that.trigger("show");
		};
		that.hide = function(){
			_this._layer.style.display = "none";
			that.trigger("hide");
		};
		that.setHTML = function(html){
			_this._layer.innerHTML = html;
		};
		that.getOuter = function(){
			return _this._layer;
		}
		that.destroy = function(){
			mask.hide();
			if(param.preventDefault){
				preventDefaultEventList.forEach(function(a){
					document.body.removeEventListener(a,that,false);
				})
			}
			_this._layer.parentNode.removeChild(_this._layer);
			that.trigger("destroy");
		};
		
		init();
		
		return that;
	}
})
