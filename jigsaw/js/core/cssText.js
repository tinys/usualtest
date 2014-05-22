

define(function(require){
	return function (cssText){
		var that = {},obj = {};
		var arr = cssText.split(";");
		arr.forEach(function(a,i){
			var vals = a.split(":");
			obj[vals[0]] = vals[1];
		})
		
		that.css = function(opt){
			for(var i in opt){
				obj[i] = opt[i];
			}
			return that;
		}
		
		that.cssText = function(){
			var array = [];
			for(var i in obj){
				array.push(i+":"+obj[i]);
			}
			return array.join(";");
		}
		return that;
	}
})

