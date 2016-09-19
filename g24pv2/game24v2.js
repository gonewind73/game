/**
 * heguofeng
 * 
 * loadconfig
 * if online
 * login
 * selecttable
 * 
 * intable
 * 		gettableinfo  beat
 * 		deal,playerclick
 * racing 
 *      playerclick
 * playing
 *      cardclick,operatorclick,playerclick,
 * end
 * 
 * if offline
 * inittable deck players 
 * 			deal
 * racing
 * 			playerclick
 * playing
 * 
 * end
 * 
 */

var G24P = {
	table:null,
	Orientation:0,
	Scale:1,
}

var SUITS=['Spades','Diamonds','Hearts','Clubs']
var NAMES=['Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
       'Jack','Queen','King','LittleJoker','BigJoker']
var POINTS=[1,2,3,4,5,6,7,8,9,10,10,10,10,10,10]

var DEBUG = true

function log(s) {
	if (DEBUG) {
		if (typeof (console) != 'undefined') {
			if (console) {
				if (navigator.userAgent.toLowerCase()
						.indexOf("applewebkit") != -1) {
					console.log(s)
				} else {
					console.log.apply(this, arguments)
				}
			}
		}
	}
}

function isSame(){
	if($(".RegistUI #password").attr("value")!=$(".RegistUI #password2").attr("value")){
		$(".RegistUI .Info").text("password 不一致！")
		return false
	}
	$(".RegistUI .Info").text("OK")
	return true
}

function init() {
	loadConfig()
	g24pUIEvent();
}

function g24pPrepair(){
	var n=4;
	$('#Shoe').prepend(
		'<div id="Deck" style="margin-top:' + (-n) 	+ 'px; '
		 +'padding-top:' + (n) + 'px">'
		 +'<div class="Card"><div class="Flip"><div class="Front"><div></div></div></div>')
	var c = $('#Shoe .Card')
	if (Modernizr.csstransforms) {
		c.scale(0.515)
		c.css({
			width : c.width() * 2,
			height : c.height() * 2,
			marginLeft : -c.width() * 0.5,
			marginTop : -c.height() * 0.5
		})
		
	} 	
	$('#Shoe').rotate(15)
}

function showPlayer(player){
	$('.Players').append('<div id='+player.getHtmlId()
			+' class="Player"><span class="Nickname">'
			+player.name+'</span><span class="Score">'
			+player.score+'</span></div>')
}

function showOperators(){
	$("a.Operator").removeClass("selected")
	if(G24P.table.selectedOperator!=""){
		$("a.Operator#"+G24P.table.selectedOperator).addClass("selected")
	}
}

function showPlayers(){
	if(G24P.table.players!=null){
		var players=G24P.table.players;
		$(".Player").remove()
		
		for(var i=0;i<players.length;i++){
			showPlayer(players[i])
			if(players[i].id==G24P.table.selfid){
				$(".Player#"+players[i].getHtmlId()).addClass("P1")
			}else{
				$(".Player#"+players[i].getHtmlId()).addClass("P0")
			}
		}
		if(G24P.table.stage=="playing"){
			$("#table .Players #"+G24P.table.racer).addClass("selected")
		}
			
	}
	$('.Player').click(function(e) {
		if(G24P.table.stage=="racing"){
			G24P.table.players.getPlayer(G24P.table.selfid).action("race",$(this).attr("id"))
		}else{
			if(G24P.table.isOnline){
				$(".Chat #button").attr("name",$("#"+$(this).attr("id")+" .Nickname").text())
				$(".Chat").show();
			}
		}
		}).hover(function() {
				$(this).stop().animate({scale : 1}, 250);
			}, function() {
				$(this).stop().animate({scale : 1}, 125);
			})
}

function chatmessage() {
	var message=$("#chatmessage").attr("value");
	$("#chatmessage").attr("value","");
	if(message==""){
		message=$("#presetmessage").attr("value");
	}
	G24P.table.broadcast({"message":$(".Chat #button").attr("name")+","+message,"sender":G24P.table.selfid})
	$(".Chat").hide();
}

function g24pDisplay(mode){
	$('.Help').hide()
	$('.setup').hide()
	$("#Game24Hall").hide()
	
	$("#Game24").hide()
	$(".Players").hide()
	$("#Operators").hide()
	$("#Actions").hide()
	$(".LoginUI").hide()
	$(".RegistUI").hide()
	$("#Shoe").hide()
	$("#TimeRemain").hide()
	$(".Chat").hide();
	
	switch(mode){
	case("login"):
		$("#Game24").show()
		$(".LoginUI").show()
		break;
	case("regist"):
		$("#Game24").show()
		$(".RegistUI").show()
		break;
	case("table"):
		$("#Game24Hall").show()
		break;
	case("intable"):
		$("#Game24").show()
		$(".Players").show()
		showPlayers();
		$("#Shoe").show()
		g24pPrepair()
		$("#Actions").show()
		break;
	case("racing"):
		$("#Game24").show()
		$(".Players").show()
		showPlayers();
		$("#Actions").show()
		$("#Shoe").show()
		
		break;
	case("playing"):
		$("#Game24").show()
		$("#Operators").show()
		$("#TimeRemain").show()
		showPlayers();
		$(".Players").show()
		$("#Actions").show()
		//showCards();
		
		break
	default:
		$("#Game24").show()
		$('#Shoe').rotate(385)

		break;
	}
}

function g24pUIEvent(){
	var ns = 0.85
	var os = 1
	$('#Shoe').click(function(e) {
		G24P.table.players.getPlayer(G24P.table.selfid).action("deal","")
	}).hover(function() {
		$(this).stop().animate({
			scale : os + 0.15
		}, 250);
	}, function() {
		$(this).stop().animate({
			scale : ns + 0.15
		}, 125);
	})
	$('a.Action')
	.animate({scale : ns}, 0).click(function(e) {
		uiAction($("#Player"),$(this).attr('id'))
		return false
		}).hover(function() {
		$(this).stop().animate({
			scale : os+0.15
		}, 250);
		}, function() {
			$(this).stop().animate({
				scale : ns+0.15
			}, 125);
		})
		
	$('#Actions a.Action')
	.animate({scale : ns}, 0).click(function(e) {
		G24P.table.players.getPlayer(G24P.table.selfid).action($(this).attr('id'),"")
		return false
		}).hover(function() {
		$(this).stop().animate({
			scale : os+0.15
		}, 250);
		}, function() {
			$(this).stop().animate({
				scale : ns+0.15
			}, 125);
		})
	$('a.Operator').click(function(e){
		G24P.table.players.getPlayer(G24P.table.selfid).action("operatorclick",$(this).attr('id'))
	})
	
	$('.Speaker').click(function(e){
		
		$('.SpeakerOff').toggle();
		if($('.SpeakerOff').is(':visible')){
			G24P.bSpeaker=false
		}else{
			G24P.bSpeaker=true
		}
	})
	
	$('.Online').click(function(e){
		$('.Offline').toggle();
		saveConfig()
		loadConfig()
	})
}

function showCard(card,whoid){
	var swhoid=""
	if(whoid!="")swhoid=' #'+whoid;
	
	$('#Cards'+swhoid).append('<div id='+card.sId 
		+ ' class="Card"><div class="Flip"><div class="Back '
		+ card.sSuit + ' '+ card.sName + '" value=' + card.iPoint
		+'></div>' +'<div class="Front"></div></div></div>')		
	var c = $($('#Cards '+swhoid+' .Card').last())

	if (Modernizr.csstransforms) {
		//c.scale(0.75)
		c.css({
			width : c.width() * 2,
			height : c.height() * 2,
		})
	}
	return c;
};

/*
 * clickfunc(cardid,action)
 */

function showCards(whoid,cards,space,flip,clickfunc,start){

	if(cards==null)return;
	//onresize()
	for(var i=start;i<cards.length;i++){
		var card=cards[i];
		var c=showCard(card,whoid);
		
		var cleft=(i-start)*space
		var ctop=0
		
		c.animate({
			left:cleft,
			top:ctop,
			rotate:0,
			scale:0.75*G24P.Scale,
			},0,
			function(e){
				if(card.iPoint==0){c.find('.Front').show();c.find('.Back').hide()}
				else{
					if(flip)doflip($(this))}
			}).click(function(e){
				if(clickfunc){
					var cardid=$(this).attr("id")
					clickfunc(cardid,"cardclick");
				}
		})
		
	}
}

function showResultCard(card,whoid){
	var swhoid=""
	if(whoid!="")swhoid=' #'+whoid;
	
	$('#Cards'+swhoid).append('<div id='+card.sId 
		+ ' class="CardT">'+ card.iPoint.toString()
		+'</div>')		
	var c = $($('#Cards '+swhoid+' .CardT').last())

	if (Modernizr.csstransforms) {
		c.scale(0.75)
		c.css({
			width : c.width() * 2,
			height : c.height() * 2,
			"zIndex" : 15,
		})
	}
	return c;
};

function showResultCards(){
	var left=G24P.table.cards.length*200;
	for(var i=0;i<G24P.table.resultCards.length;i++){
		var c=showResultCard(G24P.table.resultCards[i],"");
		c.css("left",left)
		left=left+200
		c.stop().animate({scale : 0.75*G24P.Scale 	}, 250);
		c.click(function(){
				var cardid=$(this).attr("id")
				uiAction(cardid,"cardclick")  
				//cardclick(cardid);
			})
	}
}

function showSelectedCards(cards){
	for(var i=0;i<cards.length;i++)
		showSelectedCard(cards[i]);
}

function showSelectedCard(card){
	var c=$("#"+card.sId)
	c.addClass("selected");
	c.css("top","-30px")
}

function showAllCards(){
	$("#Cards .Card").remove();
	$("#Cards .CardT").remove();
	showCards("",G24P.table.cards,200,true,uiAction,0);
	showResultCards()
	showSelectedCards(G24P.table.selectedCards)
	showOperators()
}

function uiAction(entity, action) {
	switch (action) {
	case ('redo'):
	case ('auto'):
		G24P.table.players.getPlayer(G24P.table.selfid).action(action,"")
		break
	case ('cardclick'):
		G24P.table.players.getPlayer(G24P.table.selfid).action(action,entity)
		break
	case ('Start'):
		Start(entity)
		break;
	case ('help'):
		$('#Cards').toggle()
		$('.Help').toggle()
		break;
	case ('loginOk'):
		login($(".LoginUI #playerid").attr("value"),$(".LoginUI #password").attr("value"))
		break;
	case ('loginCancel'):
		$('.LoginUI').hide()
		break;
	case ('regist'):
		g24pDisplay("regist")
		break;
	case ('registOk'):
		regist($(".RegistUI #playerid").attr("value"),$(".RegistUI #password").attr("value"),
				$(".RegistUI #nickname").attr("value"))
		break;
	case ('registCancel'):
		$('.RegistUI').hide()
		g24pDisplay("login")
		break;
	default:
		break
	}
}

function login(playerid,password){
	var url="/game1?action=login"
	$.post(url,
		{"playerid":playerid,
		"password":password},
		function(json){
			//log(json)
			var djson=JSON.parse(json);
			log(djson)
			if(djson["returncode"]!=0){
				$(".LoginUI .Info").text(djson["errormessage"] )
				$('.LoginUI').show()
			}else{
				$('.LoginUI').hide()
				var player=g24pPlayer.load(djson["player"])
				selectTable(player)
			}
				
		})
}

function regist(playerid,password,nickname){
	var url="/game1?action=regist"
	$.post(url,
		{"playerid":playerid,
		"password":password,
		"nickname":nickname},
		function(json){
			//log(json)
			var djson=JSON.parse(json);
			if(djson["returncode"]=!0){
				$(".RegistUI .Info").text(djson["errormessage"])
				$('.RegistUI').show()
			}else
				$('.RegistUI').hide()
				g24pDisplay("login")
		})
}

function selectTable(player){
	var url="/game1?action=enterhall&hallid=g24p"
		$.post(url,
			{},
			function(json){
				log(json)
				var djson=JSON.parse(json);
				if(djson.returncode!=0){
					message("EnterHall Error:"+djson.errormessage)
					return
				}
				var left=100;
				var top=100;
				$(".Table").remove()
				var hallinfo=djson["hallinfo"]
				//log(hallinfo)
				for(var t in hallinfo["tables"]){
					var tableinfo=hallinfo["tables"][t];
					var tablehtml='<div id='+t+' class=Table title='+t+'>'
					var i=0;
					for(var p in tableinfo["players"]){
						var playerinfo=tableinfo["players"][p]
						tablehtml=tablehtml+'<div id='+playerinfo["playerid"]+' title='+ playerinfo["nickname"]+' class=player'+(i)+'></div>'
						i=i+1
					}
					for(i;i<tableinfo["tablesize"];i++){
						tablehtml=tablehtml+'<div class=chair'+i+'></div>'
					}
					tablehtml=tablehtml+'</div>'
					$("#Game24Hall").append(tablehtml)
					
					$("#Game24Hall .Table#"+t).css({"left":left,"top":top})
					//$("#Game24Hall .Table#"+t).css("top",top)
					left=left+300;
					if(left>800){
						top=top+300;
						left=100;
					}
				}
				$('#Game24Hall .Table').click(function(e){
						var tableid=$(this).attr("id");
						G24P.table=g24pTable.createNew("g24p",tableid,2)
						G24P.table.isOnline=true;
						G24P.table.enter(player)
						G24P.table.clientInit()
					})
			
			})	
	g24pDisplay("table");
}

function saveConfig(){
	var speaker=!($('.SpeakerOff').is(':visible'))
	var isonline=!($('.Offline').is(':visible'))
	var playerid=$(".LoginUI #playerid").attr("value")

	var data={"isonline":isonline,"speaker":speaker,"playerid":playerid}
	localStorage.setItem("G24P",JSON.stringify(data));
	return true;
}



function loadConfig(){
	var data={};
	if(localStorage.getItem("G24P")){
		var datajson=localStorage.getItem("G24P");
		data=JSON.parse(datajson);
	}else{
		data={"isonline":false,"speaker":true,"playerid":"hgf@189.cn"}
	}

	$(".LoginUI #playerid").attr("value",data["playerid"]);

	G24P.bSpeaker=data.speaker
	if(data.isonline){
		$(".Offline").hide();
	}else{
		$(".Offline").show();
	}
	if(data.speaker){
		$(".SpeakerOff").hide();
	}else{
		$(".SpeakerOff").show();
	}
	
	if(data.isonline){
		g24pDisplay("login");
	}else{
		if(!!G24P.table){
			if(G24P.table.intable)G24P.table.leave2()
			
		}
		
		var td={"tablesize": 2, 
				"tabletype": "g24p",
				"tableid": "3" }
		G24P.table=g24pTable.createNew(td.tabletype,td.tableid,td.tablesize);
		G24P.table.offline();		
	}
}

function Start(entity){
	log(entity)
	if(entity==G24P.table.players.getPlayer(G24P.table.selfid).getHtmlId()){
		$('#TimeRemain').css({"left":"88%","top":"70%"})
	}else{
		$('#TimeRemain').css({"left":"3%","top":"15%"})
	}
	$('#redo').removeClass("Locked");
	$('#auto').removeClass("Locked");
	G24P.table.startPlay(entity,function(t){$("#TimeRemain").text(t)})
}

function doflip(c){
	c.find('.Back').show()
	c.find('.Front').hide()
}

//data [value][expression]
function auto24(data, num){
	var n=num
	if(n==1){
		if((Math.abs(data[0][0]-24))<0.01){
			//G24P.autoexpr=data[0][1]
			return true
		}
	}
	else{
		for(var i=0;i<n;i++)
			for(var j=i+1;j<n;j++){
				var a=data[i][0];
				var b=data[j][0];
				var expra=data[i][1];
				var exprb=data[j][1];
				data[j][0]=data[n-1][0];
				data[j][1]=data[n-1][1];
				
				data[i][0]=0.0+a+b;
				data[i][1]="("+expra+"+"+exprb+")"
				if(auto24(data,n-1))return true;
				data[i][0]=0.0+a-b;
				data[i][1]="("+expra+"-"+exprb+")"
				if(auto24(data,n-1))return true;
				data[i][0]=0.0+b-a;
				data[i][1]="("+exprb+"-"+expra+")"
				if(auto24(data,n-1))return true;
				data[i][0]=1.0*a*b;
				data[i][1]="("+expra+"*"+exprb+")"
				if(auto24(data,n-1))return true;
				if(b!=0){
					data[i][0]=1.0*a/b;
					data[i][1]="("+expra+"/"+exprb+")"
					if(auto24(data,n-1))return true;
				}
				if(a!=0){
					data[i][0]=1.0*b/a;
					data[i][1]="("+exprb+"/"+expra+")"
					if(auto24(data,n-1))return true;
				}
				data[i][0]=a;
				data[j][0]=b;
				data[i][1]=expra;
				data[j][1]=exprb;
			}	
			return false;
		}
	return false;
}

function message(str) {
	$('#Message').html(str).fadeIn(250, function() {
		setTimeout(function() {
			$('#Message').fadeOut(250)
		}, 1500)
	})
}

$(document)
		.ready(
				function() {
					init()
				})

window.onunload = window.onbeforeunload = function(e) {
	if(G24P.table.isOnline){
		G24P.table.gamequit=true;
		G24P.table.leave2();
	}
	saveConfig();	
};

function g24pCal(cards,operator){
	if((cards.length==2) && (operator!="")){
		var a=cards[0].iPoint
		var b=cards[1].iPoint
		var c=0;
		switch(operator){
			case "Plus":
				c= a+b;
				break;
			case "Minus":
				c= a-b;
				break;
			case "Multiple":
				c= a*b;
				break;
			case "Divid":
				c= a/b
				break;
		}
		//log(c)
		return c
	}
	return null
}

//g24p 
var g24pPlayer={
	createNew:function(id,name,score,role,type){
		var player=Player.createNew(id,name,score,role,type);
		player.inTurn=false;	
		//Action:deal,race,cardclick,operatorclick
		
		player.cal=function(){
			
		}
		
		
		return player;
	},
	
	load:function(pd){
		var player=g24pPlayer.createNew(pd.playerid,pd.nickname,pd.wealth,0,0)
		if(!!G24P.table)player.intable(G24P.table)
		return player
	}
}

/*
 * need function:
 * uiDisplay(stage)    init
 * showAllCards() 
 * timeRemainShow(time)  when startPlay
 * 
 */
var g24pTable={
	createNew:function(type,name,size){
		//var table=SSETable.createNew(type,name,size);
		var table=LP2Table.createNew(type,name,size);
		table.isComplete=false;
		//table.isOnline=G24P.isOnline;
		table.stage="";
		table.display=g24pDisplay
		
		var g24pTimer=null
		var timeRemain=20.0
		
		table.reinit=function(){
			table.selectedCards=Cards.createNew([])
			table.selectedOperator=""
			table.cards=Cards.createNew([])
			//table.playedCards=Cards.createNew([])
			table.resultCards=Cards.createNew([])
			table.backupCards=Cards.createNew([])
		}
		
		table.reinit();
		
		table.offline=function(){
			var td={"tablesize": 2, 
					"tabletype": "g24p",
					"tableid": "3", 
					"owner": "heguofeng@189.cn",
					"players": {"baba": {"nickname": "爸爸", 
													"playerid": "baba",
													"wealth": "100"},
								"baobao": {"nickname": "宝宝", 
													"playerid": "baobao",
													"wealth": "100"}
								}
				}
			table.loadPlayers(td);
			table.isOnline=false;
			table.selfid=table.players[0].id;
			
			table.setStage("intable")
			return table;			
		}
		
		table.onlineAction=function(action,data){
			switch(action){
			case "deal":	
				table.broadcast({"deal":""})
				break;
			case "cardclick":
				if(table.selectedCards.getCard(data)!=null){
					table.broadcast({"unselected":data})
				}else{
					table.broadcast({"selected":data})
				}				
				break;
			case "race":
				table.broadcast({"playerraced":data})
				break;
			case "operatorclick":
				if(table.selectedOperator==data){
					table.broadcast({"operator":""})
				}else{
					table.broadcast({"operator":data})
				}
				break;
			case "redo":
				table.broadcast({"redo":data})
				break;	
			case "auto":
				table.broadcast({"auto":data})
				//table.broadcast({"answer":table.autoPlay()})
				break;	
			case "sender":
				break;
			default:
				messgae("Not support Now!")
				break
			}
		}
		
		//action:deal,race,cardclick,operatorclick,auto,redo
		table.action=function(action,data){
			if(table.isOnline){
				table.onlineAction(action,data)
				return
			}
			//local action
			switch(action){
			case "deal":	
				if(table.deck==null){
					table.deck=Deck.createNew(1,SUITS,NAMES,POINTS)
				}
				if(table.deck.getLen()<4)table.deck.deal()
				var cards=table.deck.pickCards(4)
				table.onevent("cards",cards.dump())
				break;
			case "cardclick":
				if(table.selectedCards.getCard(data)!=null){
					table.onevent("unselected",data)
				}else{
					table.onevent("selected",data)
				}
				break;
			case "race":
				table.onevent("playerraced",data)
				break;
			case "operatorclick":
				if(table.selectedOperator==data){
					table.onevent("operator","")
				}else{
					table.onevent("operator",data)
				}
				break;
			case "redo":
				table.onevent("cards",table.backupCards.dump())
				break;	
			case "auto":
				table.onevent("answer",table.autoPlay())
				break;	
			default:
				break
			}
		}
		
		//Event: cards,playerraced,selected,unselected,operator,answer
		/*
		 * data={"data":data,"c":c}
		 * data.data is json {"name":value}
		 * 
		 * action:point0...point3  when auction
		 * hand:{P1:...}       when play
		 * cards:{P1:... ,P2:... P3:.. LO:...}  when deal
		 * message:"hello"
		 * sender:mynickname
		 * senderid: just for repeat or lost
		 */
		table.onevent=function(event,data){
			log("table.onevent: "+ event +" with data:"+data)
			switch(event){
			case "onchatdata":
				var r=JSON.parse(data.data)
				$(".log").text(r);
				log("onchatdata "+r)
				for( d in r){
					switch(d) {
					case("enter"):
						table.info();
						message(r[d]+"进入房间");
						break;
					case("cards"):
					case("unselected"):
					case("selected"):
					case("playerraced"):
					case("operator"):
					case("answer"):
						table.onevent(d,r[d])
						break;
					case("tableinfo"):
						//log("receive tableinfo" + r[d])
						//log(r[d])
						table.update(r[d],message)
						table.display(table.stage)
						break;
					case("msg"):
					case("message"):
						message(r[d])
						break;
					case("leave"):
						message(r[d]+"离开房间");
						table.info();
						break;
					default:
						log("chatdata: "+d+" didn't processed!")
						break
					}
				}
				break;
			case "onopen":
				$(".log").text(G24P.table.selfid);
				table.enter(table.players.getPlayer(table.selfid))
				break;
			case "cards":
				table.reinit();
				table.cards=Cards.load(data)
				table.backupCards=Cards.load(data)
				if(table.stage=="intable")table.setStage("racing")
				break;
			case "selected":
				if(data[0]!="T")
					table.selectedCards.addCard(table.cards.getCard(data))
				else
					table.selectedCards.addCard(table.resultCards.getCard(data))
				break;
			case "unselected":
				if(data[0]!="T")
					card=table.cards.getCard(data)
				else
					card=table.resultCards.getCard(data)
				if(!!card)table.selectedCards.removeCard(card)
				break;
			case "operator":
				table.selectedOperator=data
				break;
			case "playerraced":
				table.racer=data
				table.setStage("playing")
				break;
			case "answer":
				if(data=="")
					message("无解!")
				else
					message(data)
				break;
			case "showcards":
				//just for showcards
				break;
			default:
				log(event +" didn't processed! data:"+data)
				break;
			}
			showAllCards()
		}
		
		table.setStage=function(stage){
			table.stage=stage
			switch(table.stage){
			case "intable":
				table.reinit();
				for(var i=0;i<table.players.length;i++){
					table.players[i].inTurn=true;
				}
				break;
			case "racing":
				table.isComplete=false;
				break;
			case "playing":
				for(var i=0;i<table.players.length;i++){
					if(table.players[i].getHtmlId()==table.racer)
						table.players[i].inTurn=true;
					else{
						if(table.isOnline)table.players[i].inTurn=false;
						else
							table.players[i].inTurn=true;
					}
				}
				table.isComplete=false;
				Start(table.racer)
				
				break;
			default:
				break;
			}
			table.display(table.stage)
		}
		
		table.loadPlayers=function(td){
			//table.players.empty();  need remain states
			var changed=false
			for( p in td.players){
				index=Player.getPlayerIndex(table.players,p);
				if(index<0){
					var player=g24pPlayer.load(td.players[p])
					table.players.push(player)
					player.intable(table)
					changed=true
				}else{
					if(table.players[index].copy(g24pPlayer.load(td.players[p])))changed=true   //point to same one
				}	
			}
			table.master=td.owner;
			//删除没有的player
			for( var i=table.players.length-1;i>-1;i--){
				if(td.players[table.players[i].id]==undefined){
					table.players.splice(i,1)
					changed=true
				}	
			}
			return changed
		}
		/*
		 * infocallback how to show info
		 * 和loadPlayers相比，增加对状态的判断，在游戏阶段智能离开，并提供显示回调
		 */
		table.update=function(tidict,infocallback){
			table.master=tidict.owner
			table.intable=true;
			var changed=false;
			if(table.players.equalDict(tidict.players))
				return false;
			if(table.stage=="playing"){//in game 
				for(var i=0;i<table.players.length;i++){
					if(tidict.players[table.players[i].id]==undefined){
						if(!!infocallback)infocallback(table.players[i].name+"离开")
						table.players.splice(i,1)
						changed=true
					}
				}
			}else{
				if(table.loadPlayers(tidict))changed=true
			}
			return changed
		}
		
		table.enterCallback=function(data,status){
			if(data=="")return;
			//log("table.enterCallback:"+data)
			var djson=JSON.parse(data);
			if(djson.returncode!=0){
				message("table.enterCallback Error!"+djson.errormessage)
				return
			}
			if(!(!!table.stage))table.setStage("intable")
			var tableinfo=djson.tableinfo;
			if(table.update(tableinfo,message)){
				log("something changed!")
				table.display(table.stage)
			}
		}
		
		
		table.leaveCallback=function(data){
			clearTimeout(g24pTimer);
			if(G24P.table.gamequit)return;
			message("离线！改为单机游戏。")
			table.offline();
		}
		
		table.setDisplay=function(displayfunc){
			table.display=displayfunc
		}

		table.autoPlay=function(){
			if(table.backupCards.length==0)return;

			var data=[]
			for(var i=0;i<G24P.table.backupCards.length;i++){
				data.push([table.backupCards[i].iPoint,table.backupCards[i].iPoint.toString()])
			}
			log(data)
			
			//data=[[3,"3"],[9,"9"],[10,"10"],[4,"4"]];
			if(auto24(data,4)==true){
				return data[0][1]
			}
			else{
				return "无解!"
			}
		}
		
		table.startPlay=function(playerid,timeRemainShow){
			clearTimeout(g24pTimer)
			timeRemain=20.0
			table.timeRemainShow=timeRemainShow
			g24pTimer=setInterval(table.playCheck,100);
		}
		
		table.playCheck=function(){
			var c=g24pCal(table.selectedCards,table.selectedOperator)
			if(c!=null){
				table.resultCards.addCard(Card.createNew("Result","",c,
						"T_"+table.selectedCards[0].sId))
				//log("resultcardid: T_"+table.selectedCards[0].sId)
				for(var i=0;i<table.selectedCards.length;i++){
					if(table.selectedCards[i].sSuit=="Result"){
						table.resultCards.removeCard(table.selectedCards[i])
					}else{
						//table.playedCards.addCard(table.selectedCards[i]);
						table.cards.removeCard(table.selectedCards[i])
					}
				}
				if((table.resultCards.length+table.cards.length==1)
						&&(Math.abs(table.resultCards[0].iPoint-24)<0.01)){
					//24 complete
					table.isComplete=true;
					table.stopPlay()
				}
				table.selectedCards.empty();
				table.selectedOperator="";
				table.onevent("showcards","")
			}
				
			if(timeRemain<=0){
				if(!table.isComplete)table.stopPlay();
				return;
			}
			
			timeRemain=timeRemain-0.1
			table.timeRemainShow(timeRemain.toFixed(1))
		}
		
		table.stopPlay=function(){
			var player=G24P.table.players.getPlayer(G24P.table.selfid)
			if(!table.isOnline){
				player=table.players.getPlayerByHtmlId(table.racer)
			}
				
			if(player.getHtmlId()==table.racer){
				if(table.isComplete){
					message("smart! +10分")
					player.score+=10;
				}else{
					message("时间到!-10分")
					player.score-=10;
				}
				if(table.isOnline){
					table.broadcast({"wealth":player.score})
				}
			}

			clearTimeout(g24pTimer);
			timeRemain=0;
			table.timeRemainShow(timeRemain.toFixed(1))
			table.setStage("intable")
		}

		return table;
	},

/*	load:function(td){
		var table=g24pTable.createNew(td.tabletype,td.tableid,td.tablesize);
		table.loadPlayers(td)
		table.selfid=table.players[0].id
		return table;
	},*/
	
}

function onresize(){
	/*var bw=$("body").width();
	var bh=$("body").height();*/
	var bw=screen.width
	var bh=screen.height
	if(bw<bh){ //竖排
		G24P.Orientation=0
		G24P.Scale=1.5
		$("#Game24").css({"width":"1000px","height":"1500px"})
	}else{
		G24P.Orientation=1
		G24P.Scale=1
		$("#Game24").css({"width":"1000px","height":"500px"})
	}
	log(G24P.Scale+" "+$("body").width()+" "+$("body").height())
	$(".log").text(screen.width+" "+screen.height+" "+devicePixelRatio)
	//alert(G24P.Scale+" "+bw+" "+bh)
}

