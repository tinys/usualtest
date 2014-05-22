/**
 * 提供命名空间统一管理组件
 *
 * @author dongyajie
 *
 *
 * 注册：
 * 	define
 * 获取
 * 	require
 * 异步获取
 * 	use
 */
(function(parent){
    var that = parent || {};
    
    var log = window.console ||
    {
        log: function(){},
        error: function(){}
    };
    /**
     * @param string mName
     * @param array dependence  依赖，完全是为了实现commonjs规范
     * @param function object body
     * 	function(require,module){}
     */
    var define = function(id, dependence, factory){
        // 判断参数个数，至少两个，id，三个的则是用最后一个
        var argsLength = arguments.length;
        if (argsLength < 2) {
            log.error(arguments + "参数不够啊");
            return;
        }
        var facBody = argsLength == 2 ? dependence : factory;
        var moduleArr = id.split("/");
        var obj = that;
        for (var i = 0; i < moduleArr.length; i++) {
            var m = moduleArr[i];
            if (i == moduleArr.length - 1) {
                // 已经注册
                if (obj[m]) {
                    return;
                }
                try {
					if(typeof facBody == "string" || typeof facBody == "number" || typeof facBody == "object"){
						obj[m] = facBody;
					}else{
	                    var exp = {};
	                    obj[m] = facBody.call(that, that.require, exp);
	                    for (var j in exp) {
	                        obj[m][j] || (obj[m][j] = exp[j]);
	                    };
					}
                } catch (e) {
                    setTimeout(function(){
                        log.error(e);
                    }, 10);
                }
                break;
            }
            if (!obj[m]) {
                obj[m] = {};
            }
            obj = obj[m];
        }
    };
    var require = function(id){
        if (!id) {
            return null;
        }
        var modules = id.split("/");
        var start = that;
        for (var i = 0; i < modules.length; i++) {
            if (start) {
                start = start[modules[i]];
            }
            else {
                return null;
            }
        }
        return start;
    };
    that.define = define;
    that.require = require;
	// 获得定义的模块，与require相同，不过require会去合并文件，如果已经加载的文件，就不要使用require了，免得重复打包.
	that.getDefine = require;
	// 空方法
	that.noop = that.noop || function(){};
	that.extend = function(source,target){
		for(var i in target){
			source[i] = target[i];
		}
		return source
	};
	
	require.hug = that;
	require.noop = that.noop;
	require.extend = that.extend;
	
    return that;
})(window);
