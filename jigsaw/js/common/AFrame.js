/**
 * 
 * 按照屏幕迭代
 * 
 */
define(function(){
	var win = window;
	var rAF = win.requestAnimationFrame	||
		win.webkitRequestAnimationFrame	||
		window.mozRequestAnimationFrame		||
		window.oRequestAnimationFrame		||
		win.msRequestAnimationFrame		||
		function (callback) { win.setTimeout(callback, 1000 / 60); };
	var q_ids = {},publicAPI = win;
	
    function qID(){
        var id;
        do {
            id = Math.floor(Math.random() * 1E9);
        }
        while (id in q_ids);
        return id;
    }
    
    function queue(cb){
        var qid = qID();
        
        q_ids[qid] = rAF(function(){
            delete q_ids[qid];
            cb.apply(publicAPI, arguments);
        });
        
        return qid;
    }
    
    function queueAfter(cb){
        var qid;
        
        qid = queue(function(){
            // do our own rAF call here because we want to re-use the same `qid` for both frames
            q_ids[qid] = rAF(function(){
                delete q_ids[qid];
                cb.apply(publicAPI, arguments);
            });
        });
        
        return qid;
    }
	
	return {
		queue:queue,
		queueAfter:queueAfter
	}
})
