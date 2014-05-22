/**
 * @Author dongyajie@jd.com
 * @desc 拖动排序
 * 
 * 
 */
define(function(require){
	var req = require;

	var supportTouch = "ontouchstart" in window,
		hasPointer = navigator.msPointerEnabled,
		$ = require,
		model = req("core/model"),
		eventUtil = req("core/event"),
		cssText = req("core/cssText"),
		Math = window.Math;
		
	var rAF = window.requestAnimationFrame	||
		window.webkitRequestAnimationFrame	||
		window.mozRequestAnimationFrame		||
		window.oRequestAnimationFrame		||
		window.msRequestAnimationFrame		||
		function (callback) { window.setTimeout(callback, 1000 / 60); };
	
	function DragSort(layer,option){
		var _this = this;
		option = option ||{};
		
		// 可拖拽元素选择符
		_this.itemQuery = option.itemQuery || "[dragitem='1']";
		// 是否可用拖出父元素
		_this.dragOut = option.dragOut || false;
		
		
		_this.layer = layer;
		
		$.extend(_this,model());
		
		_this.init();
	}
	
	
	DragSort.prototype.init = function(){
		var _this = this;
		
		// 是否可用
		_this.disable = false;
		// 当前拖拽元素
		_this.currentElement = false;
		// 当前交换元素
		_this.currentDestElement = false;
		
		_this.initEvent(true);
		_this.refresh();
	};
	
	DragSort.prototype.initEvent = function(dis){
		var _this = this;
			
		var eventFn = dis?eventUtil.addEvent:eventUtil.removeEvent;
		var wrapper = _this.layer;
		
		if(supportTouch){
			eventFn(wrapper,"touchstart",_this);
			eventFn(window,"orientationchange",_this);
		}else if(hasPointer){
			eventFn(wrapper,"MSPointerDown",_this);
		}else{
			eventFn(wrapper,"mousedown",_this);
			eventFn(window,"resize",_this);
		}
	}
	DragSort.prototype.initWinEvent = function(isInit){
		var _this = this;
		var eventFn = isInit?eventUtil.addEvent:eventUtil.removeEvent;
		if(supportTouch){
			eventFn(window,"touchmove",_this);
			eventFn(window,"touchend",_this);
			eventFn(window,"touchcancel",_this);
		}else if(hasPointer){
			eventFn(window,"MsPointerMove",_this);
			eventFn(window,"MsPointerUp",_this);
			eventFn(window,"MsPointerCancel",_this);
		}else{
			eventFn(window,"mousemove",_this);
			eventFn(window,"mouseup",_this);
		}
	}
	
	DragSort.prototype.handleEvent = function(evt){
		var type = evt.type,
			_this = this;
		if(_this.disable){
			return;
		}
		switch(type){
			case "touchstart":
			case "MSPointerDown":
			case "mousedown":
				_this._start(evt);
				break;
			case "touchmove":
			case "MsPointerMove":
			case "mousemove":
				_this._move(evt);
				break;
			
			case "touchend":
			case "touchcancel":
			case "MsPointerUp":
			case "MsPointerCancel":
			case "mouseup":
				_this._end(evt);
				break;
			case "resize":
				_this._resize(evt);
				break;
		}
	}
	DragSort.prototype.getDragElement = function(evt){
		var target = evt.target,
			_this = this;
		function getTarget(target){
			if(target == _this.layer || target == document.body){
				return null;
			}
			if(target.getAttribute("dragitem") == '1'){
				return target
			}
			return getTarget(target.parentNode)
		}
		return getTarget(target);
	}
	
	DragSort.prototype._start = function(evt){
		var _this = this,
			curEvt = evt.targetTouches?evt.targetTouches[0]:evt,
			touch = _this.getDragElement(curEvt);
		
		if(!touch){
			return;
		}
		
		_this.currentElement = touch;
		_this.currentDestElement = touch;
		
		_this._pushToOuter(_this.currentElement);
		
		
		_this.touchStartX = curEvt.pageX;
		_this.touchStartY = curEvt.pageY;
		
		
		
		var startBound = JSON.parse(_this.currentElement.getAttribute("position"));
		startBound.display = "";
		
		_this.startX = _this.x = parseInt(startBound.left);
		_this.startY = _this.y = parseInt(startBound.top);
		_this.layerWidth = parseInt(parseInt(startBound.width));
		_this.layerHeight = parseInt(parseInt(startBound.height));
		
		setLayerCss(_this.moveLayer,_this.moveCssText.css(startBound));
		
		_this.initWinEvent(true);
		_this.trigger("drag",_this.currentElement);
		
		eventUtil.stopEvent(evt);
	}
	DragSort.prototype._move = function(evt){
		var _this = this;
		var	curEvt = evt.targetTouches?evt.targetTouches[0]:evt,
			deltaX = curEvt.pageX - _this.touchStartX,
			deltaY = curEvt.pageY - _this.touchStartY;
			
		_this.touchStartX = curEvt.pageX,
		_this.touchStartY = curEvt.pageY
			;
		
		_this.x += deltaX;
		_this.y += deltaY;
		
		setLayerCss(_this.moveLayer,_this.moveCssText.css({
			left:_this.x +"px",
			top:_this.y+"px"
		}));
		
		// 中心位置
		var originX = _this.x + _this.layerWidth/2,
			originY = _this.y + _this.layerHeight/2
			;
		
		// check can is over one item;
		var overElement = false,minOverDis = null;
		for(var i = _this.child.length ; i--;){
			var child = _this.child[i];
			
			var childBoud = JSON.parse(child.getAttribute("position")),
				cwidth = parseInt(childBoud.width)/2,
				cheight = parseInt(childBoud.height)/2,
				overOriginX = parseInt(childBoud.left) + cwidth,
				overOriginY = parseInt(childBoud.top) + cheight;
			var dis = Math.sqrt(Math.pow(overOriginX -originX,2) + Math.pow(overOriginY - originY,2)),
				maxDis = Math.sqrt(Math.pow(cwidth,2) + Math.pow(cheight,2));
			if(dis < maxDis && (dis < minOverDis || minOverDis === null)){
				minOverDis = dis;
				overElement = child;
			}
		}
		var old = _this.currentDestElement;
		_this.currentDestElement = overElement;
		
		_this.trigger("over",_this.currentDestElement,old);
		
		eventUtil.stopEvent(evt);
	}
	DragSort.prototype._end = function(evt){
		var _this = this;
		if(!_this.currentElement){
			return;
		}
		var cloneNode = _this._removeFormOuter();
		
		eventUtil.stopEvent(evt);
		var triFn = "exchange";
		// 合适的位置
		if(!_this.currentDestElement || _this.currentDestElement == _this.currentElement){
			_this.currentElement.parentNode.replaceChild(cloneNode,_this.currentElement);
			// 没动
			triFn = "nochange";
			
		}else{
			_this.currentDestElement.parentNode.replaceChild(cloneNode,_this.currentDestElement);
			_this.currentElement.parentNode.replaceChild(_this.currentDestElement,_this.currentElement);
			//
			_this.refresh();
		}
		_this.currentElement = false;
		_this.currentDestElement = false;
		_this.initWinEvent(false);
		_this.refresh();
		_this.trigger(triFn);
	}
	DragSort.prototype._resize = function(){
		this.refresh();
	};
	DragSort.prototype._pushToOuter = function(target){
		var _this = this;
		if(!_this.moveLayer){
			_this.moveLayer = document.createElement("div");
			_this.moveLayer.className = "drag-float";
			_this.moveCssText = cssText('display:none;position:absolute;top:0px;left:0px;');
			setLayerCss(_this.moveLayer,_this.moveCssText);
			
			document.body.appendChild(_this.moveLayer);
		}
		var cloneNode = target.cloneNode(true);
		_this.moveLayer.appendChild(cloneNode);
		
	};
	function setLayerCss(layer,text){
		layer.style.cssText=text.cssText();
	}
	
	DragSort.prototype._removeFormOuter = function(){
		var _this = this;
		var child = _this.moveLayer.children[0];
		if(child){
			_this.moveLayer.removeChild(child);
		}
		setLayerCss(_this.moveLayer,_this.moveCssText.css({
			"display":"none"
		}));
		return child;
	};
	
	/**
	 * 不可拖拽
	 */
	DragSort.prototype.suspen = function(){
		this.disable = true;
	};
	/**
	 * 更新dom 状态 
	 */
	DragSort.prototype.refresh = function(){
		var _this = this;
		rAF(function(){
			_this.child = _this.layer.querySelectorAll(_this.itemQuery);
			var length = _this.child.length;
			for(var i = 0 ; i < length;i++){
				var boud = _this.child[i].getBoundingClientRect();
				_this.child[i].setAttribute("position",JSON.stringify({
					width:boud.width+"px",
					height:boud.height+"px",
					left:boud.left+"px",
					top:boud.top+"px"
				}));
			}
		})
	};
	
	/**
	 * 可以拖拽
	 */
	DragSort.prototype.enable = function(){
		this.disable = false;
	}
	
	
	DragSort.prototype.destory = function(){
		var _this = this;
		_this.initEvent(false);
		_this.initWinEvent(false);
	};
	
	
	return DragSort;
})
