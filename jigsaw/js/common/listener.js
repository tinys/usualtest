/**
 * 全局事件
 */
define(function(req){
	var mod = req("core/model");
	window.listener = mod;
	return mod;
})
