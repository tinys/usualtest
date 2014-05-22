define(function(require){
	var event = require("./event")
		;
	var isLoaded = false,
		loadedFuns =[];
	
	function loaded(){
		if(isLoaded){
			return;
		}
		isLoaded = true;
		loadedFuns.forEach(function(a,i){
			a();
		})
		loadedFuns.length = 0;
	};
	
	event.addEvent(window,"load",loaded)
	event.addEvent(window,"DOMContentLoad",loaded)
	if(document.readyState == "complete"){
		loaded();
	}
	return function (fun){
		if(isLoaded){
			fun();
		}else{
			loadedFuns.push(fun);
		}
	}
})
