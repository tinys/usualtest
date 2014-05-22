
/**
 * 
 * 
newGame //创建新游戏
countDown // 游戏倒计时
gameStart // 游戏开始
gameOver // 游戏结束
 */
define(function(require){
	var req = require;
	var DragSort = require("../uicomp/DragSort"),
		Counter = require("../uicomp/Counter"),
		ready = req("core/ready"),
		model = req("core/model"),
		layout = require("./layout/gamelayout"),
		events = req("core/event"),
		$dom = getDefine("core/dom")
		;
	var E = function(query,p){
		p =  p||document;
		return p.querySelector(query)
	}
	var that = model();
	
	function getFormatTime(mins){
		if(mins < 1000 * 60){
			return (mins/1000).toFixed(3)+"''"
		}
		var min = parseInt(mins/60000);
		return min+"'"+ (mins % 60000/1000).toFixed(3) +"''"
	}
	
	function loadImg(src,cb){
		var img = new Image();
		function callback(){
			cb &&(cb(img));
			events.removeEvent(img,"load",callback);
		}
		img.src = src;
		if(img.readyState == "complete"){
			callback();
		}else{
			events.addEvent(img,"load",callback);
			events.addEvent(img,"error",callback);
		}
	}
	var Game = {
		gameLayout:false,
		counter:false,
		dragSort:false,
		wrapper:false,
		img:false,
		// 0 未启动  1.倒计时 2.进行 3.完成  4.非正常结束
		gameState:0,
		buttons:{},
		initGame:function(cfg,wrapper){
			var _this = this;
			
			_this.wrapper = wrapper;
			
			// 画布
			var _this = this;
			var gameLayout = layout(E(".drag-box",wrapper),{
				width:cfg.width || 100,
				height:cfg.height || 100,
				row:cfg.row,
				column:cfg.column,
				imgSrc:cfg.img
			})
			_this.gameLayout = gameLayout;
			
			
			// 事件
			var dragSort = new DragSort(wrapper);
			
			_this.dragSort = dragSort;
			_this.initOpera();
			
			// 计时器
			var count = _this.buttons.counter;
			
			var counter = new Counter(null,function(time){
				count.innerHTML = getFormatTime(time)
			});
			
			_this.counter = counter;
			
		},
		// 游戏逻辑
		initOpera:function(){
			var _this = this;
			var dragSort = _this.dragSort,
				wrapper = _this.wrapper;
			
			function sendGameOver(){
				if(_this.gameLayout.check()){
					_this.gameOver();
				}
				singleClassInCon(wrapper,null,"dragstart");
				singleClassInCon(wrapper,null,"dragover");
			}
			
			function singleClassInCon(wrapper,dom,className){
				var select = E("."+className,wrapper);
				if(select && select == dom){
					return;
				}
				select && $dom.removeClass(select,className);
				if(dom){
					$dom.addClass(dom,className);
				}
			}
			// 拖拽开始
			dragSort.on("drag",function(ele){
				singleClassInCon(wrapper,ele,"dragstart");
			});
			// 
			dragSort.on("over",function(ele){
				singleClassInCon(wrapper,ele,"dragover");
			});
			
			
			dragSort.on("exchange",function(){
				sendGameOver();
			});
			dragSort.on("nochange",function(){
				sendGameOver();
			});
			
			events.addEvent(window,"blur",function(){
				if(_this.gameState == 2){
					_this.counter.pause();
				}
			})
			events.addEvent(window,"focus",function(){
				if(_this.gameState == 2){
					_this.counter.resume();
				}
			})
			_this.initButton();
		},
		initButton:function(){
			var _this = this;
			
			var wrapper = _this.wrapper;
			var buttons = _this.buttons;
			
			buttons.start = E(".playbtn",wrapper);
			buttons.countDown = E(".countdowncount",wrapper)
			buttons.counter =  E(".counter",wrapper)
			
			// 开始界面
			events.addEvent(buttons.start,"click",function(){
				_this.startGame();
			})
		},
		// 新的游戏
		newGame:function(cfg){
			var _this = this;
			if(cfg){
				_this.gameLayout.reset(cfg);
			}
			// 画布
			_this.gameLayout.toWright();
			_this.dragSort.enable();
			_this.dragSort.refresh();
			
			_this.gameState = 0;
			
			that.trigger("newGame");
			_this.buttons.counter.innerHTML = "00.000''";
		},
		startGame:function(){
			var _this = this;
			_this.gameState = 1;
			
			that.trigger("gameBegin");
			
			// 倒计时
			_this.countDown(function(){
				_this.gameState = 2;
				_this.gameLayout.random();
				_this.counter.reset();
				_this.dragSort.refresh();
				_this.counter.start();
				that.trigger("gameStart");
			})
		},
		// 倒计时
		countDown:function(cb){
			var count = 3;
			var countdowncount = this.buttons.countDown;
			var _this = this;
			that.trigger("countDown");
			
			function cout(count){
				if(_this.gameState != 1){
					return;
				}
				if(count == 0){
					cb();
					countdowncount.innerHTML = 3;
					return;
				}
				countdowncount.innerHTML = count;
				setTimeout(function(){
					cout( --count);
				},800)
			}
			
			cout(count)
		},
		// 结束游戏
		endGame:function(){
			var _this = this;
			if(_this.gameState == 4){
				return 
			}
			_this.dragSort.suspen();
			_this.counter.pause();
			_this.gameState = 4;
		},
		// 游戏完成
		gameOver:function(){
			var _this = this;
			
			_this.dragSort.suspen();
			_this.counter.pause();
			_this.gameState = 3;
			
			that.trigger("gameOver",_this.counter.getRunTime());
			
		},
		loadResource:function(cb){
			// 游戏加载
			loadImg(this.img,function(){
				cb();
			})
		},
		// 游戏配置
		config:function(cfg){
			this.img = cfg.img;
		},
		replay:function(){
			var _this = this;
			_this.endGame();
			_this.newGame();
		}
	}
	that.game = Game;
	
	that.init = function(cfg,wrapper){
		if(!cfg.img){
			alert("游戏启动失败");
			return false;
		}
		Game.config(cfg);
		
		ready(function(){
			Game.loadResource(function(){
				Game.initGame(cfg,wrapper);
				Game.newGame();
			});
		});
	}
	that.reset = function(cfg){
		Game.endGame();
		Game.config(cfg);
		Game.loadResource(function(){
			Game.newGame(cfg);
		});
		that.trigger("reset");
	}
	
	that.replay = function(){
		that.trigger("reset");
		Game.replay();
	}
	
	return that;
})