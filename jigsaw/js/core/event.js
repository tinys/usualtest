define(function(){
	return {
		addEvent:function(dom,type,fn,capture){
			if(!dom){
				return;
			}
			dom.addEventListener(type,fn,capture)
		},
		removeEvent:function(dom,type,fn,capture){
			if(!dom){
				return;
			}
			dom.removeEventListener(type,fn,capture)
		},
		stopEvent:function(evt){
			evt.preventDefault();
			evt.stopPropagation();
		},
		preventDefault:function(evt){
			evt.preventDefault();
		},
		getEvent:function(){
			
		}
	}
})
