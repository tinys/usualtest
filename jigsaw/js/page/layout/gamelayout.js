/**
 * 游戏画布
 * 
 */
define(function(require){
	var req = require,
		model = require("core/model");
	
	function createItem(row,column,width,height){
		var list = [];
		for(var i = 0 ; i < row ; i++){
			for(var j = 0;j < column;j++){
				list.push({
					sort:(i*column)+j+1,
					x: -j * width,
					y:- i * height
				})
			}
		}
		
		return list;
	}
	function randomArray(array){
		var temp = array.concat(),
			result = [];
		
		function randomGet(ar,obj){
			var len = ar.length;
			var one = obj,index = 0;
			if(len == 1 ){
				return ar[0];
			}
			while(!one || one == obj){
				index = Number((Math.random() * len % len).toFixed(0));
				one = ar[index];
			}
			ar.splice(index,1);
			return one;
		}
		var len = array.length;
		for(var i = 0 ; i < len;i++){
			result.push(randomGet(temp,array[i]))
		}
		return result;
	}
	
	return function(box,option){
		var that = model();
		option = option || {};
		
		var column = option.column || 3,
			row = option.row || 3,
			width = option.width || 100,
			height = option.height || 100,
			imgSrc = option.imgSrc,
			totalWidth =width *column,
			totalHeight = row * height ;
		if(!imgSrc){
			throw "no image src ";
		}
		var style = false,i = 0;
		
		function updateOrResetSheet(id,imgSrc,width,height){
			if(style){
				style.parentNode.removeChild(style)
			}
			style = document.createElement("style");
			style.appendChild(document.createTextNode(""));
			document.head.appendChild(style);
			style.innerHTML = '.drag-item-bg'+id+'{background:url('+imgSrc+');background-size:'+width+'px '+height+'px;}'
			
		}
		var preId = ""
		function createItems(array,noid){
			var result = [];
			var id = Date.now()+(i++);
			if(noid){
				id=preId;
			}else{
				preId = id;
			}
			array.forEach(function(a,i){
				result.push('<div class="item drag-item-bg'+preId+'" sort="'+a.sort+'" style="background-position:'+a.x+'px '+a.y+'px;" dragitem=1></div>')
			})
			if(!noid){
				updateOrResetSheet(id,imgSrc,totalWidth,totalHeight);
			}
			
			return result.join("")
		}
		var allItem = false;
		function init(){
			allItem = createItem(row,column,width,height);
		}
		
		// 正常排序
		that.toWright = function(){
			box.innerHTML = createItems(allItem,false);
			
			var list = that.getList();
			
		}
		
		// 随机排序
		that.random = function(){
			var r = randomArray(allItem);
			// 将array的顺序完全打乱
			r = r.sort(function(){
				return Math.random() * 10 -5;
			})
			var html =  createItems(r,true);
			box.innerHTML = html;
			
			that.trigger("randomLayout");
		}
		
		// 判断是否排序正确
		that.check = function(){
			var items = box.querySelectorAll("[sort]");
			var count = false;
			for(var len = items.length;len--;){
				var item = items[len],sort = parseInt(item.getAttribute("sort"));
				if(count !== false){
					if(count - parseInt(item.getAttribute("sort")) != 1){
						return false;
					}
				}
				count = sort;
			}
			return true;
		}
		that.getList = function(){
			return  box.querySelectorAll("[sort]");
		}
		that.reset = function(option){
			column = option.column || column,
			row = option.row || row,
			width = option.width || width,
			height = option.height || height,
			imgSrc = option.img || imgSrc,
			totalWidth = width *column,
			totalHeight = row * height ;
			
			init();
		}
		init();
		return that;
	}
	
	
})