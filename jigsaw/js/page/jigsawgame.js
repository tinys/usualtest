/**
 * 拼图游戏
 */
$Import("../common");
$Import("./game");
$Import("../common/listener");
$Import("../libs/fastclick");
;(function(){
	new FastClick(document.body)
})();
define(function(require){
	var game = getDefine("page/game"),
		dom = getDefine("core/dom"),
		events = getDefine("core/event"),
		AFrame = require("../common/AFrame");
		
 	function E(query,p){
		p =   p||document;
		return p.querySelector(query)
	}
	
	var displayValue = "inline-block";
	var masker = E(".masker"),
		load = E(".load",masker),
		playbtn = E(".playbtn",masker),
		countdowncount = E(".countdowncount",masker);
	
	game.on("reset",function(){
		masker.style.display= displayValue;
		load.className = "load";
		AFrame.queue(function(){
			load.className = "load loading";
		})
	})
	// 新游戏
	game.on("newGame",function(){
		masker.style.display= displayValue;
		AFrame.queue(function(){
			dom.removeClass(load,"loading");
			dom.addClass(load,"loaded");
		})
	})
	game.on("countDown",function(){
		dom.addClass(load,"countdown");
	})
	game.on("gameStart",function(){
		masker.style.display= "none";
//		setTimeout(function(){
//			game.game.gameLayout.toWright();
//			game.game.dragSort.refresh();
//		},1000)
	})
	
	game.initia = function(cfg){
		game.cfg = cfg;
		game.init(cfg,E("#playContainer"))
	}
	var picList = [];
	game.setPicList = function(list){
		picList = list;
	}
	
	var changepic = E(".changepic"),replay = E(".replay");
	var curIndex = 0;
	events.addEvent(changepic,"click",function(){
		curIndex ++;
		if(curIndex >= picList.length){
			curIndex = 0;
		}
		game.cfg.img = picList[curIndex];
		game.reset(game.cfg);
	})
	events.addEvent(replay,"click",function(){
		game.replay();
	})
	
	var fButton = E(".uploadpic")
	if(fButton){
		var urlObject = window.URL || window.webkitURL;
		if(urlObject){
			events.addEvent(fButton,"change",function(e){
				var file = fButton.files[0],type = file.type;
				if(type.indexOf("image") >=0){
					changeFile(file);
				}else{
					alert("hey,请选择图片格式文件")
					events.stopEvent(e);
				}
			})
		}else{
			fButton.style.display="none"
		}
		var curFile = false;
		function releaseFile(){
			if(curFile){
				urlObject.revokeObjectURL(curFile);
			}
			curFile = false;
		}
		function changeFile(file){
			releaseFile();
			curFile = urlObject.createObjectURL(file);
			game.cfg.img = curFile;
			game.reset(game.cfg);
		}
		game.on("gameStart",function(){
			releaseFile();
		})
	}
	var closegames = E(".closegames");
	closegames && events.addEvent(closegames,"click",function(){
		setTimeout(function(){
			window.close();
		},200)
		history.back();
	})
	
	function getFormatTime(mins){
		if(mins < 1000 * 60){
			return (mins/1000).toFixed(3)+"''"
		}
		var min = parseInt(mins/60000);
		return min+"'"+ (mins % 60000/1000).toFixed(3) +"''"
	}
	
	// 游戏完成后交互
	var playContainer = E("#playContainer"),
		overGame = E("#overGame")
	
	function showGameOver(show){
		if(show){
			setTimeout(function(){
				playContainer.style.display = show? "none":"";
			},1200)
			setTimeout(function(){
				playContainer.style.height = "0px";
				overGame.style.display = show? "":"none";
			},700)
		}else{
			playContainer.style.display = "";
			AFrame.queue(function(){
				playContainer.style.height = "480px";
			})
			overGame.style.display = show? "":"none";
		}
		
	}
	
	game.on("gameOver",function(time){
		E(".succ-second",overGame).innerHTML = getFormatTime(time);
		
		showGameOver(true);
	})
	try{
		var replayBtn = E(".replay-btn",overGame),
			shareBtn = E(".share-btn",overGame),
			closeBtn = E(".close-btn",overGame),
			layerMasker = E(".layer-masker",overGame),
			shareLayer = E(".share-layer",overGame)
			shareCancel = E(".share-cancel",overGame),
			shareDestList = E(".share-dest-list",overGame)
			;
		var showShare = function(isShow){
			layerMasker.style.display = isShow?"":"none";
			shareLayer.style.display = isShow?"":"none";
			if(isShow){
				AFrame.queue(function(){
					dom.addClass(shareLayer,"share-layer-show");
				})
			}else{
				dom.removeClass(shareLayer,"share-layer-show");
			}
		}
		// 重新玩
		events.addEvent(replayBtn,"click",function(){
			showGameOver(false);
			game.replay();
		});
		// 关闭
		events.addEvent(closeBtn,"click",function(){
			showGameOver(false);
		});
		
		// 分享
		events.addEvent(shareBtn,"click",function(){
			showShare(true);
		});
		events.addEvent(shareCancel,"click",function(){
			showShare(false);
		});
		
		function getShareObj(){
			var pList = [];
			picList.forEach(function(a){
				if(a.indexOf("http")>=0){
					pList.push(a);
					return;
				}
				var t = location.protocol+"//"+location.host+location.port+location.pathname.substring(0,location.pathname.lastIndexOf("/"))+a;
				pList.push(t);
			})
			return {
				title:"京东618，玩拼图，得攻略",
				url:location.href,
				desc:"京东618，玩拼图，得攻略",
				pic:pList
			}
		}
		
		var handleShare = function(e){
			var target = e.target || e.srcElement;
			var getLiTag = function(t){
				if(t == shareDestList){
					return false;
				}
				if(t.nodeType ===1 && t.getAttribute && t.getAttribute("n")){
					return t.getAttribute("n");
				}
				return getLiTag(t.parentNode);
			}
			var shareWhich = getLiTag(target);
			if(shareWhich){
				var sobj = getShareObj();
				switch(shareWhich){
					// http://service.weibo.com/share/share.php?appkey=&title=title&url=url&source=bshare&retcode=0&pic=pic
					case "sinaweibo":
					window.open('http://service.weibo.com/share/share.php?appkey=2445336821&title='+encodeURIComponent(sobj.title)+'&url='+sobj.url+'&source=bshare&retcode=0&pic='+encodeURIComponent(sobj.pic[0]));
					break;
					case "qqzone":
					window.open('http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url='+sobj.url+'&title='+encodeURIComponent(sobj.title)+'&pics='+encodeURIComponent(sobj.pic.join(","))+'&summary='+encodeURIComponent(sobj.desc));
					// http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=url&title=title&pics=&summary=summary
					break;
					// http://widget.renren.com/dialog/share?resourceUrl=url&title=%title&images=|| &description=desc
					case "renren":
					window.open('http://widget.renren.com/dialog/share?resourceUrl='+sobj.url+'&title='+encodeURIComponent(sobj.title)+'&images='+encodeURIComponent(sobj.pic.join("|"))+'&description='+encodeURIComponent(sobj.desc));
					break;
				}
			}
		}
		events.addEvent(shareDestList,"click",function(e){
			handleShare(e);
		});
		
		
	}catch(e){}
	
	
	
	return game;
})
