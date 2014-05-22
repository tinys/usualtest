/**
 * 自定义事件
 * 
 * 
 */
define("core/model",function(jdk){
	return function(parent){
		var that = parent || {};
		
		var _evtList = {};
		that.on = function(type,fun){
			var list = _evtList[type];
			if(!list){
				list = _evtList[type] = [];
			}
			list.push(fun);
		};
		
		that.trigger = function(type){
			var list = _evtList[type];
			var args = Array.prototype.slice.call(arguments,1);
			if(list){
				list.forEach(function(a,i){
					try{
						a.apply(that,args);
					}catch(e){}
				})
			}
		};
		
		that.off = function(type,fun){
			var list = _evtList[type];
			if(list){
				for(var i = 0 ; i < list.length;i++){
					if(list[i] == fun){
						return list.splice(i,1);
					}
				}
			}
		};
		
		that.destroy = function(){
			_evtList = null;
		};
		
		return that;		
	}
})
