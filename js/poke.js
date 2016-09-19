/**
 * 何国锋
 * 2016.9.1
 * 
 * game {
 *    table{
 *    	 deck
 *       player1{
 *          cards{card ... cardn}
 *          wealth
 *          }
 *       ...
 *       playern
 *     }
 * }
 */

var SUITS=['Spades','Diamonds','Hearts','Clubs']
var NAMES=['Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
       'Jack','Queen','King','LittleJoker','BigJoker']
var POINTS=[1,2,3,4,5,6,7,8,9,10,10,10,10,10,10]

function dictlen(tdict){
	var i=0;
	for(var x in tdict){
		i++
	}
	return i
}

function normalid(id){
	return id.replace("@","_").replace(".","_");
}

var Deck = {
		createNew:function(iDecks,suits,names,points){
			var deck={};
			deck.iDecks=iDecks;
			deck.aDeck=[];
			deck.suits=suits;
			deck.names=names;
			deck.points=points;
			
			deck.init=function(){		
				var suitmap="sdhcj";
				var namemap="123456789TJQKLB";
				deck.aDeck=[];
				var id=0;
				for (var d = 0; d < deck.iDecks; d++) {
					for (var s = 0; s < suits.length; s++) {
						for (var n = 0; n < names.length-2; n++) {
							var point=deck.points[n];
							deck.aDeck.push(Card.createNew(deck.suits[s],deck.names[n],point,""+d+suitmap[s]+namemap[n]));			
						}
					}
					// 大小鬼
					deck.aDeck.push(Card.createNew("",deck.names[13],deck.points[13],""+d+"jL"));
					deck.aDeck.push(Card.createNew("",deck.names[14],deck.points[14],""+d+"jB"));
				}	
			}
			
			deck.getLen=function(){
				return deck.aDeck.length;
			}
		
			deck.shuffle=function() {
				var card1,card2,temp;
				for (var i = 0; i < 7*deck.aDeck.length; i++) {
					card1 = Math.floor(deck.aDeck.length * Math.random())
					card2 = Math.floor(deck.aDeck.length * Math.random())
					temp = deck.aDeck[card2]
					deck.aDeck[card2] = deck.aDeck[card1]
					deck.aDeck[card1] = temp
				}
			}
			
			deck.deal=function(){
				deck.init();
				deck.shuffle();
			}
		
			deck.pickCards=function(iCards){
				var aCards=[]
				for(var i=0;i<iCards;i++){
					var c = deck.aDeck.pop();
					if(c==null)
						return null
					aCards[i]=c;
				}
				return Cards.createNew(aCards)
			}
			
			return deck;
		}
	};

/*
 * Card = one card
 * 
 * method:
 * 
 */

var Card = {
		createNew:function(sSuit,sName,iPoint,sId){
			var card={};
			card.sId=sId;
			card.sSuit=sSuit;
			card.sName=sName;
			card.iPoint=iPoint;
			
			card.compare=function(card2){
				return(card.iPoint-card2.iPoint);
			};
			
			card.toString=function(){
				return ""+card.sId+" "+card.sSuit+" "+card.sName+" "+card.iPoint;
			};
			
			card.dump=function(){
				return sId;
			};
			return card;
		},
		load:function(ls){
			var suitmap={'s':'Spades','d':'Diamonds','h':'Hearts','c':'Clubs','j':'Joker'};
			var indexmap={'1':1,'2':2,'3':3,'4':4,'5':5,'6':6, '7':7,'8':8, 
					'9':9,'T':10,'J':11,'Q':12,'K':13,'L':14,'B':15};
			var i=indexmap[ls[2]]-1
			var card=Card.createNew(suitmap[ls[1]],NAMES[i],POINTS[i],ls);
			return card;
		},

	
	};


/*
 * Cards
 * 	Array of Card
 */

var Cards = {
		createNew:function(aCards){
				var cards;
				
				if(aCards!=null){
					cards=aCards; // [Card,Card,...]
				}else{
					cards=new Array();  
				}
				
				cards.addCard=function(card){
					cards.push(card);
				}
				
				cards.addCards=function(addcards){
					for(var i=0;i<addcards.length;i++)
						cards.push(addcards[i]);
					return cards;
				}
				
				cards.removeCard=function(card){
					for(var i=0;i<cards.length;i++){
						if((cards[i]).sId==card.sId){
							cards.splice(i,1);
						}
					}
					return cards;
				}
				
				cards.removeCards=function(removecards){
					for(var i=0;i<removecards.length;i++){
						cards.removeCard(removecards[i]);
					}
					return cards;
				}
				
				cards.empty=function(){
					cards.splice(0,cards.length);
					return cards;
				}
				
				cards.getCard=function(sId){
					for(var i=0;i<cards.length;i++){
						if(cards[i].sId==sId)
							return cards[i];
					}
				}
				
				cards.sort=function(sOrder){   // sOrder:asc or desc
					if(sOrder==null)sOrder='asc';
					var order=(sOrder=='asc')?'asc':'desc';
					var refer=[],result=[],index;
				    for(var i=0; i<cards.length; i++){ 
					        refer[i] = (cards[i].iPoint+9)+':'+i; 
				    } ;
				    refer.sort(); 
				    if(order=='desc') refer.reverse(); 
				    for(i=0;i<refer.length;i++){ 
				        index = refer[i].split(':')[1]; 
				        result[i] = cards[index]; 
				    } ;
				    cards.empty();
				    cards.addCards(result);
				    return cards; 
				};
				
				/*
				 * 对子
				 */
				cards.isTwin=function(){
					if((cards.length==2)&&
							(cards[0].iPoint==cards[1].iPoint))
						return true;
					return false;
				};
				
				/*
				 * 三个
				 */
				cards.isTri=function(){
					if((cards.length==3)&&
							(cards[0].iPoint==cards[1].iPoint)&&
							(cards[2].iPoint==cards[1].iPoint))
						return true;
					return false;
				};
				
				/*
				 * 炸弹
				 */
				
				cards.isFour=function(){
					if((cards.length==4)&&
							(cards[0].iPoint==cards[1].iPoint)&&
							(cards[2].iPoint==cards[1].iPoint)&&
							(cards[3].iPoint==cards[1].iPoint))
						return true;
					return false;				
				};
				
				cards.isJokers=function(){
					if((cards[0].iPoint+cards[1].iPoint)==(POINTS[13]+POINTS[14]))return true;
					return false;
				}
				
				/*
				 * 顺子
				 */
				cards.isSequence=function(){
					// cards=
					cards.sort('asc');
					for(var i=0;i<cards.length-1;i++){
						if(cards[i+1].iPoint!=cards[i].iPoint+1)return false;
					}
					return true
				};
				
				/*
				 * 把牌按点数分类，返回array of Cards of same point [Cards,Cards,...]
				 */
				cards.splitHand=function(){
					cards.sort('asc');
					var hands=[];
					var tempHand=Cards.createNew();
					for(var i=0;i<cards.length;i++){
						tempHand.addCard(cards[i])
						if(i==(cards.length-1)){
							hands.push(tempHand);
						}else{
							if(cards[i+1].iPoint!=cards[i].iPoint){
								hands.push(tempHand);
								tempHand=Cards.createNew([]);
							}
						}
					}
					return hands;
				};
				
				// get 1..4 >point
				cards.getHandByTypePoint2=function(type,point,level){
					var hands=cards.splitHand();
					var tempcards=Cards.createNew();
					switch(level){
						case(0):
							for(var i=0;i<hands.length;i++){
								if(hands[i].length>=type){
									if(hands[i][0].iPoint>point){
										tempcards.addCards(hands[i].slice(0,type))
										break;
									}
								}
							}
							break;
						case(1):
							for(var i=0;i<hands.length;i++){
								if(hands[i].length==type){
									if(hands[i][0].iPoint>point){
										tempcards.addCards(hands[i].slice(0))
										break;
									}
								}
							}
							break;
						default:
							break;
					}
					
					if(type==5){
						for(var i=0;i<hands.length-1;i++){
							if((hands[i][0].iPoint==POINTS[13])
									&&(hands[i+1][0].iPoint==POINTS[14])){
								tempcards.addCard(hands[i][0]);
								tempcards.addCard(hands[i+1][0]);
								break;
							}
						}
					}
					return tempcards;
				};
				
				cards.getHandByTypeMaxPoint=function(type,point,level){
					var hand;
					for(var i=POINTS.length-1;i>=0;i--){
						if(POINTS[i]<point)break;
						var hand=cards.getHandByTypePoint2(type,POINTS[i],0);
						if(hand.length!=0)break;
					}
					return hand;
				};
				
				cards.toString=function(){
					var message="";
					for(var i=0;i<cards.length;i++){
						message=message+cards[i].toString()+"\n";
					}
					return message;
				}
				
				cards.dump=function(){
					var message="";
					for(var i=0;i<cards.length;i++){
						message=message+cards[i].dump()+" ";
					}
					return message;
				}
				
				cards.load=function(dumpstring){
					cards.empty();
					var s=dumpstring.split(" ");
					for(var i=0;i<s.length-1;i++){
						cards.addCard(Card.load(s[i]));
					}
				}
							
				return cards;
			},
		load:function(dumpstring){
			var cards=Cards.createNew([])
			var s=dumpstring.split(" ");
			for(var i=0;i<s.length-1;i++){
				cards.addCard(Card.load(s[i]));
			}
			return cards;
		}
	}

/*
 * player:
 *   id,name,score,inturn
 *   cards, 
 *   table,action,onevent
 */

var Player={
		createNew:function(id,name,score,role,type){
			var player={};
			player.id=id;
			player.name=name;
			if(typeof(score)==typeof(" "))score=parseInt(score)
			player.score=score;
			player.cards=Cards.createNew([]);
			player.hands=[];
			player.table=null;
			player.inTurn=true;
			
			player.intable=function(table){
				player.table=table;
			}
			
			//submit action to table
			player.action=function(action,data){
				log("player.action with inTurn="+player.inTurn)
				if(player.inTurn)
					player.table.action(action,data)
			}
			
			//receive event from table
			player.onevent=function(event,data){
				log("player.onevent need overload")
			}
			
			player.addScore=function(add){
				player.score+=add;
			}

			player.addCards=function(cards){
				player.cards.addCards(cards);
			}
			
			player.removeCards=function(cards){
				player.cards.removeCards(cards);
			}
			
			player.toDict=function(){
				return {"playerid":player.id,"nickname":player.name,"wealth":player.score}
			}
			
			player.equal=function(p){
				if((player.id==p.id)
						&&(player.name==p.name)
						&&(player.score==p.score))
					return true;
				return false;
			}
			
			player.equalDict=function(playerdict){
				if((player.id==playerdict["playerid"])
						&&(player.name==playerdict["nickname"])
						&&(player.score==playerdict["wealth"]))
					return true;
				return false;
			}
			
			player.copy=function(p){
				if(player.equal(p))return false;
				player.id=p.id;
				player.name=p.name;
				player.score=p.score;
				return true;
			}
			
			
			// action(action,data)  onevent(event,data)
			player.setActionEvent=function(actionhandle,eventhandle){
				player.action=actionhandle;
				player.onevent=eventhandle;
				return
			}
			
			/*
			 * for html id can't be include @ . 
			 */
			player.getHtmlId=function(){
				return normalid(player.id)
			}
			
			return player;
		},
		
		load:function(pd){
			var player=Player.createNew(pd.playerid,pd.nickname,pd.wealth,0,0)
			return player
		},
		
		//following is depreated, just for compatable
		
		getPlayerIndex:function(players,id){
			return Players.createNew(players).getPlayerIndex(id);
		},
		getPlayer:function(players,id){
			return Players.createNew(players).getPlayer(id);
		},

		players2Dict:function(players){
			return Players.createNew(players).toDict();
		},
		
		playersLoad:function(playersdict){
			return Players.load(playersdict);
		},
		
		playersEqual:function(players1,players2){
			return  Players.createNew(players1).equal(Players.createNew(players2))
		},
		
		
		playersDictEqual:function(players,players2dict){
			return Players.createNew(players).equalDict(players2dict)
		},
		
	}

/*
 * Players
 * 	Array of Player
 */

var Players = {
		createNew:function(aPlayers){
				var players;
				
				players=aPlayers||new Array();
				
				
				players.addPlayer=function(p){
					if(players.getPlayerIndex(p.id)<0){
						players.push(p);
					}
				}
				
				players.addPlayers=function(ps){
					for(var i=0;i<ps.length;i++)
						players.push(ps[i]);
					return players;
				}
				
				players.removePlayer=function(p){
					for(var i=players.length-1;i>-1;i--){
						if((players[i]).id==p.id){
							players.splice(i,1);
						}
					}
					return players;
				}
				
				players.removePlayers=function(ps){
					for(var i=0;i<ps.length;i++){
						players.removeCard(ps[i]);
					}
					return players;
				}
				
				players.empty=function(){
					players.splice(0,players.length);
					return players;
				}
				
				players.getPlayer=function(sId){
					for(var i=0;i<players.length;i++){
						if(players[i].id==sId)
							return players[i];
					}
					return null;
				}
				
				players.getPlayerIndex=function(sId){
					for(var i=0;i<players.length;i++){
						if(players[i].id==sId)
							return i;
					}
					return -1;
				}
				
				players.toDict=function(){
					var resultdict={}
					for(var i=0;i<players.length;i++){
						resultdict[players[i].id]=players[i].toDict()
					}
					return resultdict;
				},
				
				
				players.equal=function(ps){
					if(players.length!=ps.length)return false;
					for(var i=0;i<players.length;i++){
						var playerid=players[i].id
						var player2=ps.getPlayer(playerid)
						if((!!players2) && (players[i].equal(player2))){
							continue
						}else{
							return false
						}		
					}
					return true;
				},
				
				players.equalDict=function(psdict){
					if(players.length!=dictlen(psdict))
						return false;
					for(var i=0;i<players.length;i++){
						if(!players[i].equalDict(psdict[players[i].id]))
							return false
					}
					return true;
				}
				
				players.load=function(playersdict){
					players.empty();
					for(var p in playersdict){
						var player=Player.load(playersdict[p])
						players.push(player)
					}
					return players;
				}
				
				players.getPlayerByHtmlId=function(htmlid){
					for(var i=0;i<players.length;i++){
						if(players[i].getHtmlId()==htmlid)return players[i];
					}
					return null;
				}
							
				return players;
			},
			
		load:function(playersdict){
			var players=Players.createNew();
			return players.load(playersdict)
		}
	}

	/*
	 * table has players 
	 * table=Room.createNew(type,name,size)
	 * table.clientInit() 
	 * 
	 * need entercallback  leaveCallback
	 * need onevent(event,data)
	 * 
	 * status: isinited,intable,isonline
	 */


var Table={
	createNew:function(type,name,size){

			var enterUrl="/game1?action=intable"
			var leaveUrl="/game1?action=leavetable"
			var infoUrl="/game1?action=tableinfo"
			
			var table={};
			table.type=type; // ddz or g24
			table.isOnline=false;
			table.name=name;
			table.size=size;

			table.selfid="";   //self id of this termial user
			table.intable=false;
			table.master=""; //  master id
			
			table.heartbeat=null;			
			table.heartbeatTimer=null;
			
			table.deck=null;
			table.players=Players.createNew();
			
			table.clientInit=function(){
				log("table.clientInit need overload")
			};
			
			table.onconnect = function(c){
				log("table.onconnect need overload")
			};

			table.ondisconnect = function (){
				log("table.ondisconnect need overload")
			};
			
			table.broadcast=function(data){
				log("table.broadcast need overload")
			};
			
			/*
			 * entertable
			 * 
			 * get(tableid,myselfid,mynickname)
			 * return json{
			 *   tableid:*,
			 *   owner: selfid,
			 *   tablesize: 2,
			 *   peers{
			 *   	selfid:nickname,
			 *   	selfid:nickname,}
			 *   }
			 *   
			 * 
			 */
			table.enter=function(player){
				player.intable(table)
				table.players.addPlayer(player)
				table.selfid=player.id;
				
				table.heartbeat=table.info;
				
				table.info();
												
				if(table.heartbeatTimer==null){
					if(table.heartbeat!=null)
						table.heartbeatTimer=setInterval(table.heartbeat,30000);  //10s refresh
					}	
				
				return;
			}
			
			table.enterCallback=function(data,status){
				log("table.enterCallback need overload")
			}

			table.info=function(){
				if(table.selfid=="")return;   //没有获得selfid 不能进入房间
				
				var p=table.players.getPlayer(table.selfid)
				postdata=p.toDict();
				postdata["tableid"]=table.name;
				postdata["hallid"]=table.type;
				$.ajax({
					  type: 'POST',
					  url: enterUrl,
					  data: postdata,
					  success: table.enterCallback,
					  dataType: 'text',
					  //error:function() { alert("error")},
					  //complete:function() { alert("complete")},
					});
				
				return;
			}
			
			//other player quit the game 
			table.quit=function(player){
				log("table.quit need overload")
			}
			
			/*
			 * update table info
			 * return 0 nochange
			 * 1 changed
			 */
			table.update=function(tableinfo){
				log("table.update need overload")
				
			}
			
			table.leave=function(){
			
				if(table.heartbeatTimer!=null){
					clearTimeout(table.heartbeatTimer)
					table.heartbeatTimer=null;
					//table.heartbeat=null;
				}
				
				var p=Player.getPlayer(table.players,table.selfid)
				postdata=p.toDict();
				postdata["tableid"]=table.name;
				
				if(table.intable){
					$.post(leaveUrl,postdata,
						function(json){
							log("I leave the table! "+json)
							table.leaveCallback(json)
						})
					table.intable=false;
				}
			};
			
			table.leaveCallback=function(data){
				log("table.leaveCallback need overload")
			}
			
			table.onlineAction=function(action,data){
				log("table.onlineAction need overload")
			}
			
			table.action=function(action,data){
				log("table.action need overload")
			}
			
			table.onevent=function(event,data){
				log("table.onevent need overload")
			}
			
			table.loadPlayersDict=function(playersDict){
				var players=[]
				for( p in playersDict){
					var player=Player.load(playersDict[p])
					players.push(player)
				}
				table.players=players;
			}
			
			return table;
		},
		/*
		 * load a table from dictionary
		 */
	load:function(td){
			var table=Table.createNew(td.tabletype,td.tableid,td.tablesize);
			table.loadPlayersDict(td.players)
			table.master=td.owner;
			return table;
		},
	};

/*
 * table with sse support
 */

var SSETable = {
		createNew:function(type,name,size){
			var table=Table.createNew(type,name,size);
			
			var enterUrl="/game1?action=intable"
			var leaveUrl="/game1?action=leavetable"
			var infoUrl="/game1?action=tableinfo"
			var ssePostUrl="/game1?action=sendmessage";
			var sseStreamUrl="/gamestream";
						
			table.isInited=false;
			table.source=null;
			
			table.clientInit=function(){
				if(table.isInited)return;
				var errorcount=0;
				if(typeof(EventSource)!=="undefined"){
					table.source=new EventSource(sseStreamUrl);
					table.source.onmessage=function(event){
							errorcount=0;
					    	table.onevent("onchatdata",{"data":event.data});
						};
					table.source.onerror=function(err){
							errorcount++;
							if(errorcount>3){
								$('.log').text("sse error count>3!")
								table.isOnline=false;
								table.leave2()
								
							}
						};
					table.source.onopen=function(event){
						table.intable=true;
					}
				}else{
					message("你的浏览器不支持联网模式，建议使用chrome!");
					return;
				}				
				table.onevent("onopen",{});  //调用open
				table.isInited=true;
			};

			//data is a dict
			table.broadcast=function(data){
				if(!table.intable) return
				$.post(ssePostUrl,data);						
				return;
			};
			
			table.leave2=function(){
				if(!!table.source)table.source.close();
				table.leave()
			};
			
			return table;
		},
		
		/*
		 * load a table from dictionary
		 */
		load:function(td){
			var table=SSETable.createNew(td.tabletype,td.tableid,td.tablesize);
			var players=[]
			for( p in td.players){
				var player=Player.load(td.players[p])
				players.push(player)
			}
			table.players=players;
			table.master=td.owner;
			return table;
		},
	};

/*
 * table with longpull support
 */

var LPTable = {
		createNew:function(type,name,size){
			var table=Table.createNew(type,name,size);
			
			var enterUrl="/game1?action=intable"
			var leaveUrl="/game1?action=leavetable"
			var infoUrl="/game1?action=tableinfo"
			var ssePostUrl="/game1?action=sendmessage";
			var longPollUrl="/gamelongpoll";
						
			table.isInited=false;
			var errorcount=0;
			//table.source=null;
			
			function poll(){
		       $.ajax({ type: 'GET',
		    	   		url: longPollUrl,
		    	   		success: function(data) {
		    	   			table.onevent("onchatdata",{"data":data});
		    	   			//if(table.intable)poll()
		    	   		}, 
		    	   		error:function(ml,err){
		    	   			log(err)
							errorcount++;
							if(errorcount>3){
								$('.log').text("longpoll error count>3!")
								table.isOnline=false;
								table.leave();
								errorcount=0;
							}
							//if(table.intable)poll()
						},
		    	   		dataType: "text", 
		       			complete: function(){
		       				if(table.isOnline)poll() },
		       			}
		       		);
			}
			
			table.clientInit=function(){
				if(table.isInited)return;
				errorcount=0;
				poll()
				//table.onevent("onopen",{});  //调用open
				table.isInited=true;
			};

			//data is a dict
			table.broadcast=function(data){
				if(!table.intable) return
				$.post(ssePostUrl,data);						
				return;
			};	
			
			table.leave2=function(){
				table.leave()
			};
			
			return table;
		},
		
		/*
		 * load a table from dictionary
		 */
		load:function(td){
			var table=LPTable.createNew(td.tabletype,td.tableid,td.tablesize);
			var players=[]
			for( p in td.players){
				var player=Player.load(td.players[p])
				players.push(player)
			}
			table.players=players;
			table.master=td.owner;
			return table;
		},
	}

/*
 * table with longpull support same as heartbeat
 */

var LP2Table = {
		createNew:function(type,name,size){
			var table=Table.createNew(type,name,size);
			
			var enterUrl="/game1?action=intable"
			var leaveUrl="/game1?action=leavetable"
			var infoUrl="/game1?action=tableinfo"
			var ssePostUrl="/game1?action=sendmessage";
			var longPollUrl="/game1?action=getmessage";
						
			table.isInited=false;
			var errorcount=0;
			var timeout=1000;
			var broadcastdatas=[];
			var beatcount=0;
			var spacecount=0;
			
			//check if need beat then poll
			table.heartbeat=function(){     
				if(beatcount<=0){
					poll()
					beatcount=10*(spacecount+1)   //2s 
				}
				beatcount--;
			}
			
			function poll(){
				var broadcastdata=""
				if(broadcastdatas.length>0){
					broadcastdata=broadcastdatas.shift()
				}
				$.ajax({ type: 'POST',
		    	   		url: longPollUrl,
		    	   	
		    	   	 /*
		    	   	    beforeSend: function(jqXHR, settings) {
		    	             jqXHR.setRequestHeader('Accept', 'text/plain; charset=utf-8');
		    	             jqXHR.setRequestHeader('Content-Type', 'text/plain; charset=utf-8');
		    	             jqXHR.setRequestHeader('User-Agent','mybrower');
		    	             jqXHR.setRequestHeader("custom-header", "custom-info") ;
		    	         },*/
		    	   		data: broadcastdata,
		    	   		success: function(data) {
		    	   			errorcount=0;
		    	   			if(data==""){
		    	   				return;
		    	   			}
		    	   			var r=JSON.parse(data)
		    	   			if(r.data!=""){
		    	   				spacecount=0;
		    	   				table.onevent("onchatdata",{"data":r.data});
		    	   				setTimeout(poll ,100)    //if have data then poll inmediate
		    	   			}else{
		    	   				spacecount++;
		    	   				if(spacecount>4)spacecount=4;
		    	   			}
		    	   			
		    	   		}, 
		    	   		error:function(ml,err){
		    	   			log(err)
		    	   			if(err=="timeout")return;
							errorcount++;
							if(errorcount>3){
								$('.log').text("longpoll error count>3!")
								table.isOnline=false;
								table.leave();
								errorcount=0;
							}
							//if(table.intable)poll()
						},
		    	   		dataType: "text", 
		       			complete: function(){
		       			/*	if(table.isOnline){
		       					setTimeout(poll ,timeout)
		       				}*/
		       			},
		       			timeout:10000,
					});
			}
			
			table.clientInit=function(){
				if(table.isInited)return;
				errorcount=0;
				//table.onevent("onopen",{});  //调用open
				
				table.isInited=true;
			};
			
			table.enter=function(player){
				player.intable(table)
				table.players.addPlayer(player)
				table.selfid=player.id;
				
				table.info();

				if(table.heartbeatTimer==null){
					table.heartbeatTimer=setInterval(table.heartbeat,100);  //10s refresh
				}	

				return;
			}

			//data is a dict
			table.broadcast=function(data){
				if(!table.intable) return
				broadcastdatas.push(data);
				beatcount=0;
				//$.post(ssePostUrl,data);						
				return;
			};	
			
			table.leave2=function(){
				table.leave()
				table.isOnline=false;
			};
			
			return table;
		},
		
		/*
		 * load a table from dictionary
		 */
		load:function(td){
			var table=LPTable.createNew(td.tabletype,td.tableid,td.tablesize);
			var players=[]
			for( p in td.players){
				var player=Player.load(td.players[p])
				players.push(player)
			}
			table.players=players;
			table.master=td.owner;
			return table;
		},
	}

/*
 * table with websocket
 */
var WSTable = {
	createNew:function(type,name,size){
		var table=Table.createNew(type,name,size);
		table.peer=null;
		
		table.clientInit=function(){
			if (!util.supports.data){
				message("你的浏览器不支持联网模式，建议使用chrome!");
				return;
			};
			
			var peer = new Peer({
		    	key:'ucv6okp8aivk7qfr',  // key: 'x7fwx2kavpy6tj4i',
		    	debug: 3,
		    	logFunction: function() {
				    var copy = Array.prototype.slice.call(arguments).join(' ');
				    $('.log').append(copy + '<br>');
		    		}
		    	});
		    table.peer=peer;

		    peer.on('open', function(id){
		    	table.selfid=id;
		    	//$(".log").text(table.selfid);
		    	table.onevent("onopen",id)
		    	});
		    // Await connections from others
		    peer.on('connection', table.onconnect);
		    peer.on('disconnected',table.ondisconnect);
		    peer.on('error', function(err) {
		    		console.log(err);
		    	})
	};
	
	table.onconnect=function (c){
		if(c.label === 'chat'){
		    table.onevent("onchatconnect",c)
		   
		    c.on('data', function(data) {
		        table.onevent("onchatdata",{"data":data,"c":c});
		        });
		    c.on('close', function() {
		        table.onevent("onchatclose",c)
		        });
		}
	};

	table.ondisconnect=function (){
		
		if(table.peer.destroyed)return;
		//$(".offline").show();
		table.peer.reconnect();
	};

	table.peerchatconnect=function(requestedPeer){ 
		if(table.peer==null)return;
		var conn;
	    if (!table.peer.connections[requestedPeer]) {
	    	conn = table.peer.connect(requestedPeer, {
		        label: 'chat',
		        serialization: 'none',
		        metadata: {"msg": 'hi i want to chat with you!'}
	    	});
	    }
	    else{
	    	conn=table.peer.connections[requestedPeer][0];
	    }
	    conn.on('open', function() {
	  	  	table.onconnect(conn);
	    });
	    conn.on('error', function(err) { alert(err); });
	    return conn;
	};

	table.sendMsgToPeer=function (peerId,msg){
		var conns = table.peer.connections[peerId];
		var conn=conns[0];
		if(!conn.open)conn=table.peerchatconnect(peerId);
		conn.send(msg)
	};
	
	table.broadcast=function(data){
		if(!table.intable) return
		
		jsonstring=JSON.stringify(data)
		for( peer in table.players){
			if(peer!=table.selfid)
				table.sendMsgToPeer(peer,jsonstring)
		}
	};
	
		return table;
	},
	
	/*
	 * load a table from dictionary
	 */
	load:function(td){
		var table=SSETable.createNew(td.tabletype,td.tableid,td.tablesize);
		var players=[]
		for( p in td.players){
			var player=Player.load(td.players[p])
			players.push(player)
		}
		table.players=players;
		table.master=td.owner;
		return table;
	},
}

var DDZPlayer={
	createNew:function(){
		var player=Player.createNew()
		
		player.role="nongmin"; // 1 landowner 2 nongming
		player.type="auto"  // 0 1 robot

		player.setRole=function(role){
			player.role=role;
		}
		
		player.isPartner=function(otherplayer){
			if(otherplayer.role==player.role)return true;
			return false;
		}
		
		player.isOpposite=function(otherplayer){
			if(otherplayer.role+player.role==3)return true;
			return false;
		}
		
		player.addHand=function(hand){
			player.hands.push(hand);
		}
		
		player.dumpHands=function(){
			var message='';
			for(var i=0;i<player.hands.length;i++){
				message=message+player.hands[i].dump()+"\n";
			}
			return messsage;
		}
		
		return player;
	},
		
}

var DDZTable = {
	createNew:function(tabletype,tableid,tablesize){
		switch(tabletype){
		case "SSETable":
			var table=SSETable.createNew("ddz",tableid,tablesize)
			break;
		default:
			break
		}
		
		table.currentPlayer=0;
		
		table.nextPlayer=function(){
			return (player.id%3+1);
		}
		
		return table;
	},
		
}
