/**
 * 计时器
 */
define(function(require){
	var AFrame = require("../common/AFrame")
	
	function Counter(date,cb){
		this.date = (date && date.now()) || Date.now();
		// 状态  未初始化:0  运行: 1 暂停:2. 销毁3
		this.state = 0;
		this.cb = cb;
		// 运行了多长时间
		this.runTime = 0;
		this.pauseDate = 0;
	}
	
	Counter.prototype._resetState = function(){
		var _this = this;
		AFrame.queue(function(){
			if(_this.state == 1){
				var now = Date.now();
				_this.runTime = now - _this.date;
				_this._resetState();
				_this.cb && _this.cb.call(_this,_this.runTime);
			}
		})
	}
	
	Counter.prototype.getRunTime = function(){
		return this.runTime;
	}
	
	Counter.prototype.start = function(){
		this.state = 1;
		this._resetState();
	}
	
	Counter.prototype.pause = function(){
		var _this = this;
		if(_this.state && _this != 3){
			this.state = 2;
			this.pauseDate = Date.now();
		}
	}
	
	Counter.prototype.resume = function(){
		var _this = this;
		if(_this.state && _this != 3){
			_this.state = 1;
			if(_this.pauseDate){
				_this.date = _this.date + Date.now() - _this.pauseDate;
			}
			_this._resetState();
		}
	}
	Counter.prototype.isDied = function(){
		return this.state == 3;
	}
	
	Counter.prototype.reset = function(date){
		this.state = 0;
		this.date = (date && date.now()) || Date.now();
		this.runTime = 0;
	}
	Counter.prototype.destory = function(){
		this.state = 3;
		this.cb = null;
	}
	return Counter;
})
