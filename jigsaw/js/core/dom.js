
define(function(require){
	
	var that = {
		addClass:function(dom,c){
			 dom.nodeType === 1 && (that.hasClass(dom, c) || (dom.className = dom.className.trim() + " " + c))
		},
		removeClass:function(dom,c){
			dom.nodeType === 1 && that.hasClass(dom, c) && (dom.className = dom.className.replace(new RegExp("(^|\\s)" + c + "($|\\s)"), " "))
		},
		hasClass:function(dom,c){
			return (new RegExp("(^|\\s)" + c + "($|\\s)")).test(dom.className)
		}
	}
	return that;
})
