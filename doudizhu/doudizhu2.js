/**
 * 何国锋 2016.8.1
 */

var DDZ = {
	isOnline:false,
	bSpeaker:true,
	
	playerCount:3,
	players:[],
	
	iDeckCount:1,
	deck:null,
	playStage:0, // 0 未开始 1抢地主 2打牌  -1 退出
	currentPlayer:0, // 0 player1 2 play2 。。。
	lastHand:null,  
	lastHander:0, // 0 player0 1 player1
	playedCards:null,
	landownerCards:null,
	roundPlayedCards:null,
	scoreX:0,
	landowner:0, // 1 player1 2 play2
	lastWinner:0,
	level:3,  // 1 easy 2 middle 3 difficult
	
	iOrientation:1,
	iScale:1,
	
	myplayerid:1, // 1 player1  2 player2
	room:null,
	
	timeRemain:0,
	playtimer:null,

	autowait:false,
	}

/*
 * Deck new init shuffle
 * 
 * Card
 * 
 * Cards
 * 
 * Hand
 * 
 * Hands
 * 
 * DDZ
 * 
 * 
 */

var DEBUG=true;
var TIMELIMIT=60.0;

var SUITS = []
SUITS[0] = 'Spades'
SUITS[1] = 'Diamonds'
SUITS[2] = 'Hearts'
SUITS[3] = 'Clubs'
var NAMES = []
NAMES[0] = 'Ace'
NAMES[1] = 'Two'
NAMES[2] = 'Three'
NAMES[3] = 'Four'
NAMES[4] = 'Five'
NAMES[5] = 'Six'
NAMES[6] = 'Seven'
NAMES[7] = 'Eight'
NAMES[8] = 'Nine'
NAMES[9] = 'Ten'
NAMES[10] = 'Jack'
NAMES[11] = 'Queen'
NAMES[12] = 'King'
NAMES[13] = 'LittleJoker'
NAMES[14] = 'BigJoker'	
var POINTS=[];
POINTS[0]=14
POINTS[1]=16  // 为了不能凑成 JQKA2的顺子
POINTS[2]=3
POINTS[3]=4
POINTS[4]=5
POINTS[5]=6
POINTS[6]=7
POINTS[7]=8
POINTS[8]=9
POINTS[9]=10
POINTS[10]=11
POINTS[11]=12
POINTS[12]=13
POINTS[13]=80
POINTS[14]=90

var pl=[],pt=[],cl=[],ct=[],cpl=[],cpt=[];

var Deck = {
		createNew:function(iDecks){
			var deck={};
			deck.iDecks=iDecks;
			deck.aDeck=[];
			
			deck.init=function(suits,names,points){		

				var suitmap="sdhcj";
				var namemap="123456789TJQKLB";
				deck.aDeck=[];
				var id=0;
				for (var d = 0; d < deck.iDecks; d++) {
					for (var s = 0; s < suits.length; s++) {
						for (var n = 0; n < names.length-2; n++) {
							var point=points[n];
							deck.aDeck.push(Card.createNew(suits[s],names[n],point,""+d+suitmap[s]+namemap[n]));			
						}
					}
					// 大小鬼
					deck.aDeck.push(Card.createNew("",names[13],points[13],""+d+"jL"));
					deck.aDeck.push(Card.createNew("",names[14],points[14],""+d+"jB"));
				}	
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
				deck.init(SUITS,NAMES,POINTS);
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
			/*	var suitmap={'Spades':'s','Diamonds':'d','Hearts':'h','Clubs':'c','':'j'};
				var namemap={'Ace':'1','Two':'2','Three':'3','Four':'4','Five':'5',
						'Six':'6', 'Seven':'7','Eight':'8', 'Nine':'9','Ten':'T',
						'Jack':'J','Queen':'Q','King':'K','LittleJoker':'L',
						'BigJoker':'B'	};
				return suitmap[card.sSuit]+namemap[card.sName];*/
				return sId;
			};
			return card;
		},
		load:function(ls){
			var suitmap={'s':'Spades','d':'Diamonds','h':'Hearts','c':'Clubs','j':''};
			var namemap={'1':'Ace','2':'Two','3':'Three','4':'Four','5':'Five',
					'6':'Six', '7':'Seven','8':'Eight', '9':'Nine','T':'Ten',
					'J':'Jack','Q':'Queen','K':'King','L':'LittleJoker',
					'B':'BigJoker'};
			var pointmap={'1':14,'2':16,'3':3,'4':4,'5':5,'6':6, '7':7,'8':8, 
					'9':9,'T':10,'J':11,'Q':12,'K':13,'L':80,'B':90};
			
			var card=Card.createNew(suitmap[ls[1]],namemap[ls[2]],pointmap[ls[2]],ls);
			return card;
		},

	
	};

/*
 * 牌型 第一位 1 单个 2 顺子 第二位 主类型 第三位 从类型 分值 单牌值，实际计算×牌数 最后两位为最小点数
 */
var SCORETABLE={
		110:100, // 单牌
		120:150, // 对子
		130:200, // 三头
		131:250, // 三带一
		132:300, // 三带二
		140:500, // 四炸
		141:300, // 四带一
		142:350, // 四带二
		143:400, // 四带三
		210:200,  // 顺子
		220:250,
		230:300,
		231:350,
		232:400,
		240:500,
		241:400,
		242:450,
		243:500,
		250:1500, // 王炸
}
var MAXSCORE=10000;
var LANDOWNER=1;
var NONGMING=2;


/*
 * "1" 1S 2 2S 3 3S 31 31S 32 32S 、 4 4S 41S 42 42S 43 43S JS 100 100×S 200
 * 200×S 300 300×S 400 400×S 500 500×S 1000 1000*S 1100 1100*S 1200 1200*S 1300
 * 1300*S 2000
 */		

var TYPEMAP={
		1:110,	10:120, 100:130, 1000:140, 	101:131,
		110:132, 1001:141, 	1010:142, 	1100:143,  	2:250,
}

/*
 * MAP lens array to type
 */

var TYPELENS={
		110:1, // 单牌
		120:2, // 对子
		130:3, // 三头
		131:4, // 三带一
		132:5, // 三带二
		140:4, // 四炸
		141:5, // 四带一
		142:6, // 四带二
		143:7, // 四带三
		210:1,  // 顺子
		220:2,
		230:3,
		231:4,
		232:5,
		240:4,
		241:5,
		242:6,
		243:7,
		250:2 // 王炸
}

/*
 * MAP of len of type
 */


/*
 * MAP of min of sequence count
 */
var MINSEQS={210:5,220:3,230:2,231:2,232:2,240:2,
		241:2,242:2,243:2}

var MAYTYPE={1:110,2:120,3:130,4:131,5:132}; // 5: need add 210

var DdzHand = {
		createNew:function(cards){
			var hand= Cards.createNew(cards);
			hand.type=0;
			hand.score=0;
			
			/*
			 * -100 类型不对 100 炸弹 result=hand-hand2
			 */
			hand.compare=function(hand2){
				hand.getHandType();
				hand2.getHandType();
				// bomb
				if(hand.type==140){
					if(hand2.type==140)return hand.score-hand2.score;
					if(hand2.type==250)return -1;
					return 100;
				}
				// Jokers
				if(hand.type==250){
					if(hand2.type==250)return hand.score-hand2.score;
					return 100;
				}
				if(hand.type!=hand2.type){
					return -100;   
				}else{
					if((Math.floor(hand.score/100))!=(Math.floor(hand2.score/100))){
						return -100;   
					}
					return(hand.score-hand2.score);
				}
			}
			
			/*
			 * count type and score
			 */
			hand.getHandType=function(){
				hand=hand.sort('asc');
				var handType=0;
				var handScore=0;
				var len=hand.length;
				var hands=hand.splitHand();
				var handlens=[];
				var maxlenindex=0,maxlen=0;
				for(var i=0;i<hands.length;i++){
					handlens[i]=hands[i].length;
					if(handlens[i]>maxlen){
						maxlen=handlens[i];
						maxlenindex=i;
					}
				}
				point=hands[maxlenindex][0].iPoint;
				
				var temphand=DdzHand.createNew();
				// check is sequence
				for(var i=0;i<hands.length;i++){
					if(hands[i].length==maxlen)
						temphand.push(hands[i][0]);
				}
				
				handlens.sort('asc');
				var shl=[0,0,0,0];
				var shl2=[],seqcount=1;  
				for(var i=0;i<handlens.length;i++){
					shl[handlens[i]-1]+=1;
				}
				var map=shl[3]*1000+shl[2]*100+shl[1]*10+shl[0]
				// basetype
				if((shl[3]<2)&&(shl[2]<2)&&(shl[1]<2)&&(shl[0]<2)){
					handType=TYPEMAP[map];
					handType=(handType==undefined)?0:handType;
				}else{
					if(map==2){
						handType=(hand.isJokers())?250:0;
					}else{
						// sequence
						for(var i=0;i<4;i++){
							if((shl[i]!=0)&&(seqcount==1))seqcount=shl[i];
							shl2[i]=shl[i]/seqcount;
						}
						map=shl2[3]*1000+shl2[2]*100+shl2[1]*10+shl2[0]
						handType=TYPEMAP[map]
						handType=(handType==undefined)?0:handType+100;
						
						if(seqcount<MINSEQS[handType])handType=0;
						if(!temphand.isSequence())handType=0;		
					}
				}
				if(handType!=0){
					hand.score=SCORETABLE[handType]*TYPELENS[handType]*seqcount+point;
				}	
				hand.type=handType;
				return handType;
			};
			
			return hand;
		},
		
		// smart it get most near
		getHand2:function(cards,type,score,level){
			if(type==0){
				return DdzHand.getHandS(cards,type,score,level);
			}
			var myhand=DdzHand.createNew([]);
			var isSequence=Math.floor(type/200)
			var maintype=Math.floor((type%100)/10);
			var slavetype=type%10;
			var point=score%100;
			var seqlen=Math.floor(score/SCORETABLE[type]);
			var len=TYPELENS[type]

			var loop=1;
			if(isSequence==1){
				loop=seqlen/len;
			}
			var lastpoint=0;
			var slavepoint=0;
			var found=false;
			var temphand;
			var mylevel=(loop>1)?0:level;  // if sequence not strict
			for(var i=0;i<loop;i++){
				temphand=cards.getHandByTypePoint2(maintype,point,mylevel);
				if(temphand.length==0){
					found=false
					break; // return null;
				}
				point=temphand[0].iPoint;
				if((i!=0)&&(point!=lastpoint+1)){
					i=0;
					myhand=DdzHand.createNew();
					slavepoint=0;
				}
				var lastpoint=point;
				myhand.addCards(temphand);
				if(slavetype!=0){
					temphand=cards.getHandByTypePoint2(slavetype,slavepoint,level);
					if(temphand.length==0){
						// not strict found slave if master is given.
						temphand=cards.getHandByTypePoint2(slavetype,slavepoint,0);
						if(temphand.length==0){
							found=false;
							break;  // return null;
						}
					}
					if(temphand[0].iPoint==point){  // can't be itself
						found=false;
						break;
					}
					slavepoint=temphand[0].iPoint;
					myhand.addCards(temphand);
				}
				found=true;
			}
			if(!found){  // try to find bomb
				temphand=cards.getHandByTypePoint2(4,0,level);
				if(temphand.length!=0){
					type=140;
					myhand=DdzHand.createNew(temphand);
					myhand.getHandType();
					found=true;
				}
			}
			if(!found){  // try to find jokers
				temphand=cards.getHandByTypePoint2(5,0,level);
				if(temphand.length!=0){
					type=250;
					myhand=DdzHand.createNew(temphand);
					myhand.getHandType();
					found=true;
				}
			}
			if(found){
				myhand.getHandType();
				return myhand;
			}else{
				myhand.empty();
				return myhand;
			}
		},
		
		// smart it get most near
		getHandMax:function(cards,type,score,level){
			if(type==0){
				return DdzHand.getHandS(cards,type,score,level);
			}
			var myhand=DdzHand.createNew([]);
			var isSequence=Math.floor(type/200)
			var maintype=Math.floor((type%100)/10);
			var slavetype=type%10;
			var point=score%100;
			var seqlen=Math.floor(score/SCORETABLE[type]);
			var len=TYPELENS[type]

			var loop=1;
			if(isSequence==1){
				loop=seqlen/len;
			}
			var lastpoint=0;
			var slavepoint=0;
			var found=false;
			var temphand;
			var mylevel=(loop>1)?0:level;  // if sequence not strict
			for(var i=0;i<loop;i++){
				temphand=cards.getHandByTypeMaxPoint(maintype,point,mylevel);
				if(temphand.length==0){
					found=false
					break; // return null;
				}
				point=temphand[0].iPoint;
				if((i!=0)&&(point!=lastpoint-1)){
					i=0;
					myhand=DdzHand.createNew();
					slavepoint=0;
				}
				var lastpoint=point;
				myhand.addCards(temphand);
				if(slavetype!=0){
					temphand=cards.getHandByTypePoint2(slavetype,slavepoint,level);
					if(temphand.length==0){
						// not strict found slave if master is given.
						temphand=cards.getHandByTypePoint2(slavetype,slavepoint,0);
						if(temphand.length==0){
							found=false;
							break;  // return null;
						}
					}
					if(temphand[0].iPoint==point){  // can't be itself
						found=false;
						break;
					}
					slavepoint=temphand[0].iPoint;
					myhand.addCards(temphand);
				}
				found=true;
			}
			if(!found){  // try to find bomb
				temphand=cards.getHandByTypePoint2(4,0,level);
				if(temphand.length!=0){
					type=140;
					myhand=DdzHand.createNew(temphand);
					myhand.getHandType();
					found=true;
				}
			}
			if(!found){  // try to find jokers
				temphand=cards.getHandByTypePoint2(5,0,level);
				if(temphand.length!=0){
					type=250;
					myhand=DdzHand.createNew(temphand);
					myhand.getHandType();
					found=true;
				}
			}
			if(found){
				myhand.getHandType();
				return myhand;
			}else{
				myhand.empty();
				return myhand;
			}
		},
		
		// 获得排列组合中，点数最小的 .没有type要求
		getHandS:function(cards,type,score,level){
			var myhands=DdzHand.getHandsS(cards,type,score,level);
			if(myhands.length==0)return null;
			
			var minscore=MAXSCORE;
			var minindex=0;
			for(var i=0;i<myhands.length;i++){
				if(((myhands[i].score%100)<minscore)&&(myhands[i].type!=140)){
					minscore=myhands[i].score%100;
					minindex=i;
				}	
			}
			return myhands[minindex];
		},
		
		// getHandsS 得到整幅牌的排列组合
		getHandsS:function(cards,type,score,level){
			var SEQTYPE=[231,232,230,220,210];
			var BASETYPE=[131,132,130,120,110];
			var MAXSEQLEN=12;
			var mycards=Cards.createNew(cards.slice(0));
			var myhands=[];
			var temphand;
			var found=true;
			while(found){
				found=false;
				temphand=DdzHand.getHand2(mycards,140,0,1);
				if(temphand.length>0){
					myhands.push(temphand)
					mycards.removeCards(temphand);
					found=true;  // continue find
				}
			}
			var thands=DdzHand.getSeqTypeHands(mycards,SEQTYPE);
			for(var i=0;i<thands.length;i++)myhands.push(thands[i]);

			thands=DdzHand.getBaseTypeHands(mycards,BASETYPE);
			for(var i=0;i<thands.length;i++)myhands.push(thands[i]);
			
			return myhands;
		},
		
		// will change cards content
		getBaseTypeHands:function(cards,types){
			var mycards=cards;
			var myhands=[];
			var temphand;
			var found=true;
			var myscore=0;
			for(var i=0;i<types.length;i++){
				var mytype=types[i];
				found=true;
				while(found){
					found=false;
					if(mycards.length<(TYPELENS[mytype]))continue;
					myscore=SCORETABLE[mytype]*TYPELENS[mytype];
					temphand=DdzHand.getHand2(mycards,mytype,myscore,1);
					if(temphand.length>0){
						myhands.push(temphand)
						mycards.removeCards(temphand);
						found=true;
					}
				}
			}
			return myhands;
		},
		
		// will change cards content move cards to hands
		getSeqTypeHands:function(cards,types){
			var mycards=cards;
			var myhands=[];
			var temphand;
			var found=true;
			var myscore=0;
			var mytype=0;
			var MAXSEQLEN=12;

			for(var i=0;i<types.length;i++){
				mytype=types[i];
				if(mytype<200)continue;
				for(var seqlen=MAXSEQLEN;seqlen>1;seqlen--){
					if(mycards.length<(TYPELENS[mytype]*seqlen))continue;
					myscore=SCORETABLE[mytype]*TYPELENS[mytype]*seqlen;
					temphand=DdzHand.getHand2(mycards,mytype,myscore,1);
					if(temphand.length>=(MINSEQS[mytype]*TYPELENS[mytype])){
						myhands.push(temphand)
						mycards.removeCards(temphand);
						seqlen+=1;  // continue find
					}
				}
			}
			return myhands;
		},
		
		getMaxScore:function(cards,type,score,level){
			var myhands=DdzHand.getHandsS(cards,type,score,level);
			if(myhands.length==0)return 0;
			
			var score=0;
			for(var i=0;i<myhands.length;i++){
				score+=myhands[i].score;	
			}
			return score;
		},
			
		getHandByTypes:function(cards,types){
			var mycards=Cards.createNew(cards.slice(0));
			if(mycards.length==0)return;
			var myhand=DdzHand.createNew(mycards);
			if(myhand.getHandType()!=0)return myhand;
			
			var myhands=[];
			var btypes=[],stypes=[];
			for(var i=0;i<types.length;i++){
				if(types[i]>200){
					stypes.push(types[i]);
				}else{
					btypes.push(types[i]);
				}
			}
			
			var thands=DdzHand.getSeqTypeHands(mycards,stypes);
			for(var i=0;i<thands.length;i++)myhands.push(thands[i]);
			
			thands=DdzHand.getBaseTypeHands(mycards,btypes);
			for(var i=0;i<thands.length;i++)myhands.push(thands[i]);
			
			if(myhands.length==0)return myhands;
			
			var minscore=MAXSCORE;
			var minindex=0;
			for(var i=0;i<myhands.length;i++){
				if(((myhands[i].score%100)<minscore)&&(myhands[i].type!=140)){
					minscore=myhands[i].score%100;
					minindex=i;
				}	
			}
			return myhands[minindex];
		},
	
}

var Player={
	createNew:function(id,name,score,role,type){
		var player={};
		player.id=id;
		player.name=name;
		player.score=score;
		player.role=role;  // 1 landowner 2 nongming
		player.type=type;  // 0 1 robot
		player.cards=Cards.createNew([]);
		player.hands=[];
		
		player.nextPlayer=function(){
			return (player.id%3+1);
		};
		
		player.addScore=function(add){
			player.score+=add;
		}
		
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
		
		player.addCards=function(cards){
			player.cards.addCards(cards);
		}
		
		player.removeCards=function(cards){
			player.cards.removeCards(cards);
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
	getPlayerIndex:function(players,id){
		for(var i=0;i<players.length;i++){
			if(players[i].id==id)return i;
		}
		return -1;
	},
}

/*
 * room=Room.createNew(type,name,size)
 * room.clientInit() 
 * 
 * need entercallback  leavecallback
 * need onevent(event,data)
 */
var Room={
	createNew:function(type,name,size){
			//var enterUrl="http://gonewind.pythonanywhere.com/enter";
			//var leaveUrl="http://gonewind.pythonanywhere.com/leave";
			var enterUrl="/enter";
			var leaveUrl="/leave";
			/*var enterUrl="http://10.5.6.53/enter";
			var leaveUrl="http://10.5.6.53/leave";*/
			
			var room={};
			room.type=type; // ddz or g24
			room.name=name;
			room.size=size;
			room.peers={};
			room.lmidofpeers={};  //{peerid:lastmessageid}
			room.peerid="";   //self id
			room.inroom=false;
			room.master=""; //  master id
			
			room.enterName="";
			room.enterCallback=null;  //enterCallback(data)
			room.onEvent=null;        //onevent(event,data)
			room.leaveCallback=null;  //leaveCallback(data)
			room.heartbeat=null;			
			
			room.heatbeatTimer=null;
			room.peer=null;
			

			room.clientInit=function(){
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
				    room.peer=peer;
		
				    peer.on('open', function(id){
				    	room.peerid=id;
				    	//$(".log").text(room.peerid);
				    	onevent("onopen",id)
				    	});
				    // Await connections from others
				    peer.on('connection', room.onconnect);
				    peer.on('disconnected',room.ondisconnect);
				    peer.on('error', function(err) {
				    		console.log(err);
				    	})
			};
			
			room.onconnect=function (c){
				if(c.label === 'chat'){
				    onevent("onchatconnect",c)
				   
				    c.on('data', function(data) {
				        onevent("onchatdata",{"data":data,"c":c});
				        });
				    c.on('close', function() {
				        onevent("onchatclose",c)
				        });
				}
			};

			room.ondisconnect=function (){
				
				if(room.peer.destroyed)return;
				//$(".offline").show();
				room.peer.reconnect();
			};

			room.peerchatconnect=function(requestedPeer){ 
				if(room.peer==null)return;
				var conn;
			    if (!room.peer.connections[requestedPeer]) {
			    	conn = room.peer.connect(requestedPeer, {
				        label: 'chat',
				        serialization: 'none',
				        metadata: {"msg": 'hi i want to chat with you!'}
			    	});
			    }
			    else{
			    	conn=room.peer.connections[requestedPeer][0];
			    }
			    conn.on('open', function() {
			  	  	room.onconnect(conn);
			    });
			    conn.on('error', function(err) { alert(err); });
			    return conn;
			};

			room.sendMsgToPeer=function (peerId,msg){
				var conns = room.peer.connections[peerId];
				var conn=conns[0];
				if(!conn.open)conn=room.peerchatconnect(peerId);
				conn.send(msg)
			};
			
			room.broadcast=function(data){
				if(!room.inroom) return
				
				jsonstring=JSON.stringify(data)
				for( peer in room.peers){
					if(peer!=room.peerid)
						room.sendMsgToPeer(peer,jsonstring)
				}
			};
			
			/*
			 * enterroom
			 * 
			 * get(roomid,mypeerid,mynickname)
			 * return json{
			 *   roomid:*,
			 *   owner: peerid,
			 *   roomsize: 2,
			 *   peers{
			 *   	peerid:nickname,
			 *   	peerid:nickname,}
			 *   }
			 *   
			 * 
			 */
			room.enter=function(playername,entercallback,heartbeat){
				room.enterName=playername;
				room.enterCallback=entercallback;
				room.heartbeat=heartbeat;
				
				room.info();
												
				if(room.heatbeatTimer==null){
					if(room.heartbeat!=null)
						room.heatbeatTimer=setInterval(room.heartbeat,10000);  //10s refresh
					}	
				
				return;
			}
			
			room.info=function(){
				if(room.peerid=="")return;   //没有获得peerid 不能进入房间
				
				$.post(enterUrl,
						{"roomid":room.name,
						"peerid":room.peerid,
						"nickname":room.enterName},
						 room.enterCallback);			
				for( peer in room.peers){
					if(peer==room.peerid){
					}else{
						room.peerchatconnect(peer)
					}
				}
				return;
			}
			
			//other player quit the game 
			room.quit=function(peerid){
				
			}
			
			/*
			 * update room info
			 * return 0 nochange
			 * 1 changed
			 */
			room.update=function(roominfo){
				
			}
			
			room.leave=function(playername,leavecallback){
				//room.enterName=playername;
				room.leaveCallback=leavecallback;
				if(room.inroom){
					$.post(leaveUrl,
							{"roomid":room.name,
							"peerid":room.peerid,
							"nickname":room.enterName},
							function(json){
									log("I leave the room! "+json)
							})
					room.broadcast({"leave":room.peerid,"sender":room.peerid});
					room.inroom=false;
				}

				room.peerid="";
				room.roompeers={};
				room.master="";
				if(room.heartbeatTimer!=null){
					clearTimeout(room.heartbeatTimer)
					room.heartbeatTimer=null;
					room.heartbeat=null;
				}
				if(room.peer!=null){
					room.peer.destroy();
					//room.peer=null;
				}
				leavecallback("");
			};
			
			return room;
		},
};

var Room2 = {
	createNew:function(type,name,size){
		var room=Room.createNew(type,name,size);
		var ssePostUrl="/redispost";
		var sseStreamUrl="/redisstream";
		//var sseloginUrl="http://127.0.0.1/login"
		
		room.clientInit=function(){
			if(typeof(EventSource)!=="undefined"){
				if(room.peerid=="")
					room.peerid=Math.floor(100000000*Math.random()).toString();
				onevent("onopen",{});
				
				/*$.post(sseloginUrl,
					{"roomid":room.name,
					"nickname":room.enterName},
					function(){
						onevent("onopen",{});
						} 
					);	*/
				
				var source=new EventSource(sseStreamUrl);
				source.onmessage=function(event){
				    	onevent("onchatdata",{"data":event.data});
					};
				source.onerror=function(err){
					 //alert("网络错误");
					room.inroom=false;
				};
				source.onopen=function(event){
					//alert(event);
				}
			}else{
				message("你的浏览器不支持联网模式，建议使用chrome!");
				return;
			}
			room.broadcast({"enter":room.peerid,"sender":room.peerid});
		};

		room.broadcast=function(data){
			if(!room.inroom) return
			jsonstring=JSON.stringify(data);
			$.post(ssePostUrl,
					{"roomid":room.name,
					"message":jsonstring,
					"nickname":room.enterName}
					 );						
			return;
		};
		
		return room;
	},
}

function leaveRoomCallback(){
	$(".offline").hide();
	//if(DDZ.playStage!=-1)
		//loadconfig();
	//$("#player2 .playername").text(room.mynickname)
	//$("#player1 .playername").text($("#player1name").attr("value"))
}

function enterRoomCallback(data){
	if(data=="")return;
	
	var djson=JSON.parse(data);
	var roominfo=djson.roominfo;
	log(roominfo);
	DDZ.room.master=roominfo.owner;
	log(DDZ.room.master)
	if(djson.result!=true){
		message(djson.message)
		return;
	}
	$(".offline").hide();
	//log(JSON.stringify(DDZ.room.peers))
	//log(JSON.stringify(roominfo.peers))
	if(JSON.stringify(DDZ.room.peers)==JSON.stringify(roominfo.peers))return;
	
	if(DDZ.playStage>0){//in game 
		for(var i=0;i<3;i++){
			if(roominfo.peers[DDZ.players[i].peerid]==undefined){
				if(DDZ.players[i].type!=1){
					message(DDZ.players[i].name+"离线，改为电脑");
					DDZ.players[i].name="电脑";
					DDZ.players[i].type=1;
				}
			}	
		}
		//return;  
	}else{
		for(var i=0;i<3;i++){
			DDZ.players[i].type=1;
			DDZ.players[i].name="电脑";
		}
		DDZ.room.peers=roominfo.peers;
		i=0;
		for(var peerid in roominfo.peers){
			DDZ.players[i].name=roominfo.peers[peerid];
			DDZ.players[i].type=0;
			DDZ.players[i].peerid=peerid;
			if(peerid==DDZ.room.peerid){
				DDZ.myplayerid=i+1;
			}
			i++;
			if(i==3)break;
		}
	}
	ddzDisplay();
	DDZ.room.inroom=true;
}

function onevent(event,data){
	switch (event) {
	case ('onopen'):
		$(".log").text(DDZ.room.peerid);
		DDZ.room.enter(DDZ.players[DDZ.myplayerid-1].name,enterRoomCallback,DDZ.room.info)
		break
	case("onchatconnect"):
		chatconnect(data);
		//should invoke get peers 
		break;
	case("onchatdata"):
		chatdata(data);
		break;
	case("onchatclose"):
		chatclose(data);
		break;
	case("onfileconnect"):
		//fileconnect(data);
		break;

	default:
		log(event+" didnt processed!")
		break
	}
	
}

function chatconnect(c) {	
	//enterroom()
	$(".offline").hide()
	if(c.peer in DDZ.room.peers){
		DDZ.room.sendMsgToPeer(c.peer,JSON.stringify({"msg":"welcome to room!"}))
	}else{
		DDZ.room.info();
	}
}

function chatclose(c){
	//try to reconnect to peer
	if(DDZ.room.peer.destroyed)return
	$(".offline").show()
	if(c.peer in DDZ.room.peers){
		DDZ.room.peerchatconnect(c.peer)
	}
	//delete GAME.roompeers[c.peer]
}

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

function chatdata(data) {
	$(".log").text(data.data);
	var r=JSON.parse(data.data)
	log(r.sender)
	if(r.sender==DDZ.room.peerid)return;  //self message,then quit 
	//$("#TimeRemain").text(r.player)
	//DDZ.room.sendMsgToPeer(data.c.peer,"welcome to my room!")
	for( d in r){
		switch(d) {
		case ('action'):
			switch(r[d]){
			case("Redo"):
				Redo(GAME.currentPlayer)
				break;
			case("Auto"):
				Auto(GAME.currentPlayer)
				break;
			}
			
			break
		case("hand"):
			if((r.sender==DDZ.players[DDZ.currentPlayer-1].peerid)){
					//||(r.sender==DDZ.room.master)){
				onlinehand(r[d]);
			}
			break;
		case("point"):
			if(r.sender==DDZ.players[DDZ.currentPlayer-1].peerid){
				onlinePoint(r[d]);
			}
			break;
		case("enter"):
			
			DDZ.room.info();
			message(DDZ.room.peers[r.sender]+"进入房间");
			break;
		case("cards"):
			onlinedeal(r[d])
			break;
		case("msg"):
			//$(".log").text(r[d])
			message(r[d])
			break;
		case("table"):
			if(DDZ.playStage==0)ddzPrepair();
			break;
		case("leave"):
			message(DDZ.room.peers[r.sender]+"离开房间");
			DDZ.room.info();
			/*
			if(DDZ.room.inroom){
				message(DDZ.room.peers[r.sender]+"离开游戏了！")
				var index=Player.getPlayerIndex(DDZ.players,r.sender);
				if(index>=0){
					DDZ.players[index].type=1;
					DDZ.players[index].name="电脑";
					ddzDisplay();
				}
					
					
			}else{
				DDZ.room.info();
			}*/
			break;
		default:
			log(event+" didnt processed!")
			break
		}
	}
}



function init() {

	DDZ.players.push(Player.createNew(1,"",100,0,0));
	DDZ.players.push(Player.createNew(2,"",100,0,1));
	DDZ.players.push(Player.createNew(3,"",100,0,1));
	
	saveposition();
	initClick();
	DDZ.deck=Deck.createNew(1);
	ddzPrepair();
	
	loadconfig();

	$('.help').hide();
	$('.setup').hide();
	$(".offline").hide();
	$(".Chat").hide();
	
	// sound("bg");
}

function ddzPrepair(){
	//DDZ.deck.init(SUITS,NAMES,POINTS);
	//DDZ.deck.shuffle();
	DDZ.landowner=0;
	DDZ.autowait=false;
	DDZ.currentPlayer=0;
	DDZ.lastHand={};
	DDZ.lastHander=0;
	DDZ.playStage=0;
	DDZ.playtimer=null;
	DDZ.scoreX=0;
	DDZ.timeRemain=0;


	
	DDZ.roundPlayedCards=[null,null,null];
	DDZ.landownerCards=null;
	DDZ.players[0].cards.empty();
	DDZ.players[1].cards.empty();
	DDZ.players[2].cards.empty();
	layoutall();
	$('#Shoe').show();
	$('#Deck').remove();
	$('#Shoe').append(
			'<div id="Deck" style="margin-top: -4px; padding-top:-4px">'
			 +'<div class="Card">'
			 +'<div class="Flip"><div class="Front"></div></div></div></div>')
	var c = $('#Shoe .Card')
	if (Modernizr.csstransforms) {
		c.scale(0.6)
		c.css({
			width : c.width() * 2,
			height : c.height() * 2,
			marginLeft : -c.width() * 0.5,
			marginTop : -c.height() * 0.5
		})
	} 

	ddzDisplay();
}

function saveposition(){
	
	for(var i=1;i<4;i++){
		pl[i]=$(".Player#player"+i).css("left");
		pt[i]=$(".Player#player"+i).css("top");
		cl[i]=$("#Cards #Player"+i+"Cards").css("left");
		ct[i]=$("#Cards #Player"+i+"Cards").css("top");
		cpl[i]=$("#Cards #Player"+i+"PlayedCards").css("left");
		cpt[i]=$("#Cards #Player"+i+"PlayedCards").css("top");
	}
	iconleft=["55%","40%","80%","0%"];
	icontop=["10%","50%","-5%","-5%"];

}

function place(p){
	var j=1;
	for(var i=1;i<4;i++){
		$(".Player#player"+p[i]).css("left",pl[i]);
		$(".Player#player"+p[i]).css("top",pt[i]);
		$("#Cards #Player"+p[i]+"Cards").css("left",cl[i]);
		$("#Cards #Player"+p[i]+"Cards").css("top",ct[i]);
		$("#Cards #Player"+p[i]+"PlayedCards").css("left",cpl[i]);
		$("#Cards #Player"+p[i]+"PlayedCards").css("top",cpt[i]);
		if(DDZ.landowner!=0){
			if(p[i]==DDZ.landowner){
				$("#landowner").css("left",iconleft[i]);
				$("#landowner").css("top",icontop[i]);
			}else{
				$("#nongming"+j).css("left",iconleft[i]);
				$("#nongming"+j).css("top",icontop[i]);
				j++;
			}
			
		}else{
			$("#landowner").css("left","53%")
			$("#landowner").css("top","10%");
			$("#nongming1").css("left","50%");
			$("#nongming1").css("top","18%");
			$("#nongming2").css("left","60%");
			$("#nongming2").css("top","18%");	
		}
	}
}

/*
 * refresh ui 
 * when layoutall is show cards
 */
function ddzDisplay(){
	
	switch(DDZ.myplayerid){
	case(1):
		place([0,1,2,3])
		break;
	case(2):
		place([0,2,3,1])
		break;
	case(3):
		place([0,3,1,2])
		break;
	default:
		break;
	}


	$("#Points").text(DDZ.scoreX.toString());
	for(var i=1;i<4;i++){
		$("#player"+i+" .Score").text((DDZ.players[i-1].score).toString());
		$("#player"+i+" .playername").text(DDZ.players[i-1].name);
	}
	$('.Player').removeClass("selected");
	if(DDZ.currentPlayer!=0) $('#player'+DDZ.currentPlayer).addClass("selected");
	
/*	
	var j=1;
	var LANDOWNERPOSTION={
			0:{left:"55%",top:"10%"},
			1:{left:"40%",top:"50%"},
			2:{left:"80%",top:"-5%"},
			3:{left:"0%",top:"-5%"},
	};
	if(DDZ.landowner!=0){
		$("#landowner").css(LANDOWNERPOSTION[(DDZ.landowner+DDZ.myplayerid)%3+1]);
		for(var i=1;i<4;i++){
			if(i==DDZ.landowner)continue;
			$("#nongming"+j).css(LANDOWNERPOSTION[i]);
			j++;
		}
	} */
	
	//$('.help').hide();
	//$('.setup').hide();
	//$(".offline").hide();
	
	
	switch(DDZ.playStage){
		case(0):
			//$('#PlayedCards').hide()
			$("#PlayAction").hide();
			$("#ScoreAction").hide();
			//$("#Shoe").show();
			
			break;
		case(1):
			//$('#PlayedCards').hide()
			$("#PlayAction").hide();
			$("#ScoreAction").show();
			$("#Shoe").hide();
			// $("#landowner").css({left:"50%",top:"10%"})
			break;	
		case(2):
			//$('#PlayedCards').show();
			$("#PlayAction").show();
			$("#ScoreAction").hide();
			$("#Shoe").hide();
			// $("#landowner").css({left:"60%",top:"40%"})
			break;	
		default:
			break;
	}
}

function initClick() {
	var ns = 0.85
	var os = 1
	$('#Shoe').click(function(e) {
		if (DDZ.playStage==0) {
			deal()
		}
	}).hover(function() {
		$(this).stop().animate({
			scale : os
		}, 250);
	}, function() {
		$(this).stop().animate({
			scale : ns
		}, 125);
	})
	$('a.Action')
	.animate({scale : ns}, 0).click(function(e) {
		action($("#Player"),$(this).attr('id'))
		return false
		}).hover(function() {
		$(this).stop().animate({
			scale : (os)
		}, 250);
		}, function() {
			$(this).stop().animate({
				scale : (ns)
			}, 125);
		})
		
	
	$("#Cards #PlayedCards").click(function (event) {
	     action("",'table')
	});
	
	$('.Player').click(function(e) {
		var playerid=parseInt($(this).attr("id").substr(-1))
		if(playerid==DDZ.myplayerid){
			action("","Hint")
		}else{
			$(".Chat #button").attr("name",DDZ.players[playerid-1].name)
			$(".Chat").show();
		}
		
		}).hover(function() {
		$(this).stop().animate({
			scale : (os)
		}, 250);
		}, function() {
			$(this).stop().animate({
				scale : (ns)
			}, 125);
		})
	
}

function addCardToHtml(card,whoid){
	$('#Cards #'+whoid).append('<div id='+card.sId 
		+ ' class="Card"><div class="Flip"><div class="Back '
		+ card.sSuit + ' '+ card.sName + '" value=' + card.iPoint
		+'></div>' +'<div class="Front"></div></div></div>')		
	var c = $($('#Cards #'+whoid+' .Card').last())

	if (Modernizr.csstransforms) {
		c.scale(0.75)
		c.css({
			width : c.width() * 2,
			height : c.height() * 2,
		})
	}
	return c;
};


function getSelectedCardsFromHtml(){
	var cards=$("#Cards #Player"+DDZ.myplayerid+"Cards .Card.selected");
	if(cards.length==0){
		message("没有牌被选中");
		return null;
	}
	var selectedCards=Cards.createNew([]);
	for(var i=0;i<cards.length;i++){
		var c=cards[i]
		var sId=$(c).attr("id");
		selectedCards.addCard(DDZ.players[DDZ.currentPlayer-1].cards.getCard(sId));
	}
	return selectedCards;
}


function playCards(){
	// 重新下一轮
	if((DDZ.playStage!=2)||(DDZ.currentPlayer!=DDZ.myplayerid))return;
		
	var hand=DdzHand.createNew(getSelectedCardsFromHtml());
	if(hand.length==0)return;
	if(hand.getHandType()==0){
		message("你选的牌不合规！请重新选择")
		return
	}
	log(hand.type)

	if(DDZ.lastHand!=null){
		var result=hand.compare(DDZ.lastHand)
		if(result==-100){
			message("你和上家牌型不一致！");
			return;
		}
		if(result<=0){
			message("你的牌必须大于上手！");
			return;
		}
		if(result==100){
			message("炸弹！！！")
			DDZ.scoreX+=1;
			$("#Points").text(DDZ.scoreX.toString());
		}
	}
	
	handToOnline(hand);
	
    speakHand(hand);
	DDZ.players[DDZ.currentPlayer-1].removeCards(hand);
	DDZ.roundPlayedCards[DDZ.currentPlayer-1]=hand;
	DDZ.players[DDZ.currentPlayer-1].addHand(hand);
	DDZ.playedCards.addCards(hand);

	DDZ.lastHand=hand;
	DDZ.lastHander=DDZ.currentPlayer;
	layoutall();
	
	if(DDZ.players[DDZ.currentPlayer-1].cards.length==0){
		message(DDZ.players[DDZ.currentPlayer-1].name+"赢了！");
		sound("win");
		DDZ.lastWinner=DDZ.currentPlayer;
		setScore(DDZ.currentPlayer);
		ddzDisplay();
		stopPlay();
		return
	}
	nextPlayer();
	return
};

function handToOnline(hand){
	DDZ.room.broadcast({"hand":hand.dump(),"sender":DDZ.room.peerid});
	//DDZ.room.broadcast({"hand":hand.dump(),"sender":DDZ.players[DDZ.currentPlayer-1].peerid});
	
	return
}

function onlinehand(handstring){
	// 重新下一轮
	if((DDZ.playStage!=2)||(DDZ.currentPlayer==DDZ.myplayerid))return;
	if(DDZ.players[DDZ.currentPlayer-1].type==1)return;  //电脑不接受联机出牌。
		
	var hand=DdzHand.createNew();
	hand.load(handstring);
	
	if(hand.length==0){
		sound("pass");
		message(DDZ.players[DDZ.currentPlayer-1].name+":不要! ");
		DDZ.roundPlayedCards[DDZ.currentPlayer-1]=null;
		nextPlayer();
		return;
	}
	
	if(hand.getHandType()==0){
		message("你选的牌不合规！请重新选择")
		return
	}
	log(hand.type)

	if(DDZ.lastHand!=null){
		var result=hand.compare(DDZ.lastHand)
		if(result==-100){
			message("你和上家牌型不一致！");
			return;
		}
		if(result<=0){
			message("你的牌必须大于上手！");
			return;
		}
		if(result==100){
			message("炸弹！！！")
			DDZ.scoreX+=1;
			$("#Points").text(DDZ.scoreX.toString());
		}
	}
	
    speakHand(hand);
	DDZ.players[DDZ.currentPlayer-1].removeCards(hand);
	
	DDZ.roundPlayedCards[DDZ.currentPlayer-1]=hand;
	DDZ.players[DDZ.currentPlayer-1].addHand(hand);
	
	DDZ.playedCards.addCards(hand);
	
	DDZ.lastHand=hand;
	DDZ.lastHander=DDZ.currentPlayer;
	layoutall();
	
	if(DDZ.players[DDZ.currentPlayer-1].cards.length==0){
		message(DDZ.players[DDZ.currentPlayer-1].name+"赢了！");
		if((DDZ.currentPlayer!=DDZ.landowner)&&(DDZ.landowner!=DDZ.myplayerid)){
			sound("win");
		}
		DDZ.lastWinner=DDZ.currentPlayer;
		setScore(DDZ.currentPlayer);
		stopPlay();
		return
	}
	nextPlayer();
	return
}

function setScore(playerid){
	if(DDZ.landowner==playerid){
		for(var i=1;i<4;i++){
			if(i!=playerid){
				DDZ.players[i-1].addScore(0-DDZ.scoreX);
			}else{
				DDZ.players[i-1].addScore(DDZ.scoreX*2);
				// DDZ.playersScore[i-1]+=DDZ.scoreX*2;
			}
		}
	}else{
		for(var i=1;i<4;i++){
			if(i==DDZ.landowner){
				DDZ.players[i-1].addScore(0-DDZ.scoreX*2);
				// DDZ.playersScore[i-1]-=DDZ.scoreX*2;
			}else{
				DDZ.players[i-1].addScore(DDZ.scoreX);
				// DDZ.playersScore[i-1]+=DDZ.scoreX;
			}
		}		
	}
}

function isOpposite(playerid){
	if(DDZ.currentPlayer==DDZ.landowner){
		if(playerid!=DDZ.currentPlayer){
			return true
		}else{
			return false;
		}
	}else{
		if(playerid!=DDZ.landowner){
			return false;
		}else{
			return true;
		}
	}
}

function Hint(){
	var type=0,score=0;
	if(DDZ.lastHand!=null){
		if(DDZ.lastHander==DDZ.currentPlayer){
			//new round
			DDZ.lastHand=null;
			DDZ.lastHander=0;
			DDZ.roundPlayedCards=[null,null,null];
			type=0;
			score=0;
			
		}else{
			type=DDZ.lastHand.getHandType();
			score=DDZ.lastHand.score;
		}
	}
		
	var hand;
	var smart=1;
	
	hand=DdzHand.getHand2(DDZ.players[DDZ.currentPlayer-1].cards,type,score,smart);

	if((hand==null)||(hand.length==0)){
		message("要不起!");
		return
	}

	log(hand.type)
	for(var i=0;i<hand.length;i++){
		cardclick(hand[i].sId)
	}
	
	return
	
}

function autoPlay(){
	// 重新下一轮
	//if(DDZ.isOnline && DDZ.room.master!=DDZ.room.peerid)return false;
	var type=0,score=0;
	DDZ.autowait=true;
	if(DDZ.lastHand!=null){
		if(DDZ.lastHander==DDZ.currentPlayer){
			DDZ.lastHand=null;
			DDZ.lastHander=0;
			DDZ.roundPlayedCards=[null,null,null];
			
		}else{
			type=DDZ.lastHand.getHandType();
			score=DDZ.lastHand.score;
		}
	}
	
	if((DDZ.level==3)&&(DDZ.lastHander!=0)){
		if(!isOpposite(DDZ.lastHander)){  // >10 不要，<5张也不要
			if(((DDZ.lastHand.score%100>10)&&(DDZ.players[DDZ.currentPlayer-1].cards.length>5))
					||((DDZ.players[DDZ.lastHander-1].cards.length<5)
							&&(DDZ.players[DDZ.lastHander-1].cards.length<DDZ.players[DDZ.currentPlayer-1].cards.length))){
				sound("pass");
				handToOnline(DdzHand.createNew());
				message(DDZ.players[DDZ.currentPlayer-1].name+":不要! ");
				DDZ.roundPlayedCards[DDZ.currentPlayer-1]=null;
				return true;
			}
		}
	}
		
	var hand;
	var smart=1;
	
	if(DDZ.level<3){
		hand=DdzHand.getHand2(DDZ.players[DDZ.currentPlayer-1].cards,type,score,smart);
	}else{
		hand=level3getHand(type,score);
	}

	
	if((hand==null)||(hand.length==0)){
		sound("pass");
		handToOnline(DdzHand.createNew());
		message(DDZ.players[DDZ.currentPlayer-1].name+":不要!");
		DDZ.roundPlayedCards[DDZ.currentPlayer-1]=null;
		return true
	}
	
/*	if(hand.getHandType()==0){
		message("你选的牌不合规！请重新选择")
		log(hand.toString())
		// layoutall();
		return true
	}*/
	log(hand.type)

	if(DDZ.lastHand!=null){
		var result=hand.compare(DDZ.lastHand)
	/*	if(result==-100){
			message("你和上家牌型不一致！");
			return true;
		}
		if(result<=0){
			message("你的牌小于上手！");
			return true;
		}*/
		if(result==100){
			if((DDZ.level==3)&&(DDZ.lastHander!=0)){
				if(!isOpposite(DDZ.lastHander)){
					sound("pass");
					handToOnline(DdzHand.createNew());;
					message(DDZ.players[DDZ.currentPlayer-1].name+":不要!");
					DDZ.roundPlayedCards[DDZ.currentPlayer-1]=null;
					return true
				}
			}
			message("炸弹！！！")
			DDZ.scoreX+=1;
			$("#Points").text(DDZ.scoreX.toString())
		}
	}

	if(DDZ.currentPlayer==DDZ.myplayerid)handToOnline(hand);
	
	speakHand(hand);
	DDZ.players[DDZ.currentPlayer-1].removeCards(hand);
	DDZ.players[DDZ.currentPlayer-1].addHand(hand);
	DDZ.roundPlayedCards[DDZ.currentPlayer-1]=hand;
	
	DDZ.playedCards.addCards(hand);

	DDZ.lastHand=hand;
	DDZ.lastHander=DDZ.currentPlayer;
	layoutall();
	if(DDZ.players[DDZ.currentPlayer-1].cards.length==0){
		message(DDZ.players[DDZ.currentPlayer-1].name+"赢了！");
		if((DDZ.currentPlayer!=DDZ.landowner)&&(DDZ.landowner!=DDZ.myplayerid)){
			sound("win");
		}
		DDZ.lastWinner=DDZ.currentPlayer;
		setScore(DDZ.currentPlayer);
		stopPlay();
		return true;
	}
	DDZ.timeRemain=2
	// nextPlayer();
	return true;
};

function level3getHand(type,score){
	var hand;
	var smart=1;
	var getMax=false;
	
	if(type!=0){
		if(DDZ.level==3){
			if(isOpposite(DDZ.lastHander)){
				if(DDZ.players[DDZ.lastHander-1].cards.length<5){
					smart=0;
				}
			}
			var nextid=DDZ.currentPlayer%3+1;
			if((isOpposite(nextid))&&(DDZ.players[nextid-1].cards.length<3)){
				getMax=true;
			}
		}
		if(getMax){
			hand=DdzHand.getHandMax(DDZ.players[DDZ.currentPlayer-1].cards,type,score,smart);
		}else{
			hand=DdzHand.getHand2(DDZ.players[DDZ.currentPlayer-1].cards,type,score,smart);
		}
	}else{
		// todo howto deal last cards
		if(DDZ.level==3){
			// var SEQTYPE=[231,232,230,220,210];
			// var BASETYPE=[131,132,130,120,110];
			// var MAXSEQLEN=12;
			var maytypes=[];
			var MAYTYPE={1:110,2:120,3:130,4:131,5:132,}
			for(var i=2;i>0;i--){
				var tpid=(DDZ.currentPlayer+i-1)%3+1;
				if(isOpposite(tpid)){
					if(DDZ.players[tpid-1].cards.length<6){
						// remove
						if(maytypes.length==0)
								maytypes=[132,210,131,130,120,110,220,230,231,232];
						var ttypes=[];
						ttypes.push(MAYTYPE[DDZ.players[tpid-1].cards.length]);
						if(DDZ.players[tpid-1].cards.length==5)ttypes.push(210);
						for(var x=0;x<ttypes.length;x++){
							for(var j=0;j<maytypes.length;j++){
								if(maytypes[j]==ttypes[x]){
									maytypes.splice(j,1);
									j--;
								}
							}
						}
					}else{
						maytypes=[132,210,131,130,120,110,220,230,231,232];
					}
				}else{
					// insert
					if(DDZ.players[tpid-1].cards.length<6){
						var ttypes=[];
						ttypes.push(MAYTYPE[DDZ.players[tpid-1].cards.length]);
						if(DDZ.players[tpid-1].cards.length==5)ttypes.push(210);
						if(maytypes.length!=0)maytypes=ttypes;
						/*
						 * for(var x=0;x<ttypes.length;x++){ var found=false;
						 * for(var j=0;i<maytypes.length;j++){
						 * if(maytypes[j]==ttypes[x]){ found=true; break; } }
						 * if(!found)maytypes.unshift(ttypes[x]); }
						 */
					}else{
						if(maytypes.length==0)
							maytypes=[132,210,131,130,120,110,220,230,231,232];
					}
				}
			}
			if(maytypes.length==0)maytypes=[132,210,131,130,120,110,220,230,231,232];
			hand=DdzHand.getHandByTypes(DDZ.players[DDZ.currentPlayer-1].cards,maytypes);
			if(hand.length==0){
				hand=DdzHand.getHand2(DDZ.players[DDZ.currentPlayer-1].cards,type,score,1);
			}
		}
	}
	return hand;
}

function autoScoreX(){
	var type=0,score=0;
	DDZ.autowait=true;
    
	var score=DdzHand.getMaxScore(DDZ.players[DDZ.currentPlayer-1].cards);
	var mayScoreX=0;
	log(score)
	if(score>2000)mayScoreX=1;
	if(score>3000)mayScoreX=2;
	if(score>4000)mayScoreX=3;
	if(DDZ.scoreX<mayScoreX){
		DDZ.scoreX=mayScoreX;
		DDZ.lastHander=DDZ.currentPlayer;
		$("#Points").text(DDZ.scoreX.toString())
		sound("point"+mayScoreX);
		// message(DDZ.scoreX+"分，Player"+DDZ.currentPlayer);
		ddzDisplay();
	}else{
		message("不叫！");
		sound("point0")
	}
		
	return;
};

function ScoreX(scorex){
	if(DDZ.playStage==2)playCards();  // for same positon seems infect
										// eachother
	if(DDZ.currentPlayer!=DDZ.myplayerid)return;
	var type=0,score=0;
	if(scorex==0){
		pointToOnline(0);
		sound("point0"); 
		nextPlayer();
		return;
	}
	if(DDZ.scoreX>=scorex){
		message("你必须大于"+DDZ.scoreX+"分！")
		return;
	}
	pointToOnline(scorex);
	DDZ.scoreX=scorex;
	$("#Points").text(DDZ.scoreX.toString())
	DDZ.lastHander=DDZ.currentPlayer;
	sound("point"+scorex);
	// beLandowner(entity);
	// broadcast({"action":"Auto","sender":DDZ.mypeerid})
 	nextPlayer();
	return;
};

function pointToOnline(point){
	DDZ.room.broadcast({"point":point,"sender":DDZ.room.peerid});
	return
}

function onlinePoint(scorex){
	if(DDZ.playStage!=1)return;  
	var type=0,score=0;
	if(scorex==0){
		sound("point0");
		nextPlayer();
		return;
	}
	if(DDZ.scoreX>=scorex){
		message("你必须大于"+DDZ.scoreX+"分！")
		return;
	}
	DDZ.scoreX=scorex;
	$("#Points").text(DDZ.scoreX.toString())
	DDZ.lastHander=DDZ.currentPlayer;
	sound("point"+scorex);
	nextPlayer();
	return;
}

function action(entity, a) {
	switch (a) {
	case ('Pass'):
		if(DDZ.currentPlayer==DDZ.myplayerid){
			if(DDZ.lastHander==0)return;  //不能pass
			DDZ.roundPlayedCards[DDZ.currentPlayer-1]=null;
			handToOnline(DdzHand.createNew());
			sound("pass");
			nextPlayer();
		}
		// broadcast({"action":"Redo","sender":GAME.mypeerid})
		break;
	case ('Put'):
		if(DDZ.currentPlayer==DDZ.myplayerid) playCards();
		// broadcast({"action":"Redo","sender":GAME.mypeerid})
		break;		
	case('Hint'):
		if(DDZ.currentPlayer==DDZ.myplayerid){
			Hint();
		}
		break;
	case('table'):
		if(DDZ.playStage==2){
			playCards();
			break;
		}
		if(DDZ.playStage==0){
			ddzPrepair();
			DDZ.room.broadcast({"table":"clear","sender":DDZ.room.peerid})
			break;
		}
		break;
	case ('Point0'):
		ScoreX(0);
		break
	case ('Point1'):
		ScoreX(1);
		break
	case ('Point2'):
		ScoreX(2);
		break
	case ('Point3'):
		ScoreX(3);
		break
	case ('Help'):
		$('.help').toggle()
		
		break;
	case ('Setup'):
		$('.setup').toggle()
		
	
		/*
		 * if(GAME.mypeerid==""){ roominit() }else{ leaveroom() }
		 */
			
		break;
	case("OK"):
		if(saveConfig()){   //no save needn't load
			loadconfig();
			ddzDisplay();
		}
		$('.setup').hide()
		$('#Cards').show()
		break;
	case("Cancel"):
		ddzDisplay();
		$('.setup').hide()
		$('#Cards').show()
		break;
	default:
		break
	}
}

function saveConfig(){
	var level=$("#level").attr("value");
	if(level!=""){
		var l=parseInt(level)
		if(l>4){
			TIMELIMIT=l;
		}else{
			DDZ.level=l;
		}
	}
	log(DDZ.level);	
	var speaker=$("#speaker").attr("checked")
	DDZ.bSpeaker=speaker;
	
	
	if(DDZ.playStage>0)return false;  //can't change value in game

	var player1name=$("#player1name").attr("value")
	var player2name=$("#player2name").attr("value")
	var player3name=$("#player3name").attr("value")
	var roomid=$("#roomid").attr("value")

	var isonline=$("#online").attr("checked")
	if(isonline && ((roomid=="")||(player1name==""))){
		message("联机必须设置房间号和你的名字，请和对方约定共同的房间号")
		return false;
	}
	var speaker=$("#speaker").attr("checked")
	//if(isonline)return;
	var data={"isonline":isonline,"speaker":speaker,"player1name":player1name,
			"player2name":player2name,"player3name":player3name,
			"roomid":roomid,"score":DDZ.players[DDZ.myplayerid-1].score}
	localStorage.setItem("DouDiZhu",JSON.stringify(data));
	return true;
}

/*
 * need to see what's changed set something  TODO
 */

function loadconfig(){
	var data={};
	if(localStorage.getItem("DouDiZhu")){
		var datajson=localStorage.getItem("DouDiZhu");
		data=JSON.parse(datajson);
	}else{
		data={"isonline":false,"speaker":true,"player1name":"宝宝",
				"player2name":"胡歌","player3name":"胡夏",
				"roomid":"","score":100}
		
	}
	DDZ.roomid=data.roomid;
	// DDZ.mynickname=data.player1name;
	
	$("#player1 .playername").text(data.player1name);
	$("#player2 .playername").text(data.player2name);
	$("#player3 .playername").text(data.player3name);
	$("#player1name").attr("value",data.player1name);
	$("#player2name").attr("value",data.player2name);
	$("#player3name").attr("value",data.player3name);
	
	DDZ.players[0].name=data.player1name;
	DDZ.players[1].name=data.player2name;
	DDZ.players[2].name=data.player3name;
	$("#roomid").attr("value",data.roomid)
	if(data.score==undefined)data.score=90;
	DDZ.players[0].score=data.score;
	if(data.isonline){
		$("#online").attr("checked","checked")
		$(".offline").show()
		DDZ.isOnline=true;
		if(DDZ.room==null){
			DDZ.room=Room2.createNew("ddz",DDZ.roomid,3);
		}else{
			DDZ.room.name=DDZ.roomid;
		}
		
		DDZ.room.clientInit();
	}else{
		$("#online").attr("checked","")
		$(".offline").hide()
		DDZ.isOnline=false;
		if(DDZ.room==null){
			DDZ.room=Room2.createNew("ddz",DDZ.roomid,3);
		}else{
			DDZ.room.name=DDZ.roomid;
		}
		if(DDZ.room.inroom)
			DDZ.room.leave(DDZ.players[DDZ.myplayerid-1].name,leaveRoomCallback);
		DDZ.myplayerid=1;
		DDZ.currentPlayer=0;
	}
	if(data.speaker){
		$("#speaker").attr("checked","checked")
		DDZ.bSpeaker=true;
	}else{
		$("#speaker").attr("checked","")
		DDZ.bSpeaker=false;
	}
	ddzDisplay();
}


function deal(){
	if(DDZ.playStage>0)	return;
	$(".Card").remove();

	DDZ.deck.deal();
	DDZ.roundPlayedCards=[null,null,null];
	
	for(var i=0;i<3;i++){
		DDZ.players[i].cards=DDZ.deck.pickCards(17);
		DDZ.players[i].cards.sort('asc');
		log(DDZ.players[i].cards.dump());
	}
	
	log(DdzHand.getMaxScore(DDZ.players[0].cards));
	
	DDZ.playedCards=Cards.createNew([]);
	DDZ.landownerCards=DDZ.deck.pickCards(3);
	if(DDZ.isOnline)dealToOnline();
	
	
	DDZ.scoreX=0;
	DDZ.playStage=1;
	DDZ.autowait=false;
	ddzDisplay();
	layoutall();
	startPlay();
}

function dealToOnline(){
	var cards={};
	for(var i=0;i<3;i++){
		cards["P"+(i+1)]=DDZ.players[i].cards.dump();
	}
	cards["LO"]=DDZ.landownerCards.dump();
	DDZ.room.broadcast({"cards":cards,"sender":DDZ.room.peerid});
	return
}

function onlinedeal(cards){
	if(DDZ.playStage>0)	return;
	$(".Card").remove();

	DDZ.roundPlayedCards=[null,null,null];
	
	for(var i=0;i<3;i++){
		DDZ.players[i].cards.load(cards["P"+(i+1)]);
		DDZ.players[i].cards.sort('asc');
		log(DDZ.players[i].cards.dump());
	}
	
	log(DdzHand.getMaxScore(DDZ.players[DDZ.myplayerid-1].cards));
	
	DDZ.playedCards=Cards.createNew([]);
	DDZ.landownerCards=Cards.createNew([]);
	DDZ.landownerCards.load(cards["LO"]);
	
	DDZ.scoreX=0;
	DDZ.playStage=1;
	ddzDisplay();
	layoutall();
	startPlay();
}

/*
 * refresh all cards 
 */

function layoutall(){
	$(".Card").remove();
	for(var i=1;i<4;i++){
		if(i==DDZ.myplayerid){
			layout("Player"+i+"Cards",DDZ.players[i-1].cards,48,true,true,0);
			$("#Cards #Player"+i+"Cards").scale(1)
			$("#Cards #Player"+i+"Cards").rotate(0)
		}else{
			layout("Player"+i+"Cards",DDZ.players[i-1].cards,15,false,false,0);
			$("#Cards #Player"+i+"Cards").rotate(270);
			$("#Cards #Player"+i+"Cards").scale(0.8);
		}
	}
	/*layout("Player1Cards",DDZ.players[0].cards,48,true,true,0);
	layout("Player2Cards",DDZ.players[1].cards,15,false,false,0);
	$("#Cards #Player2Cards").rotate(270);
	layout("Player3Cards",DDZ.players[2].cards,15,false,false,0);
	$("#Cards #Player3Cards").rotate(270);*/
	// layout("PlayedCards",DDZ.playedCards,30,true,false,(DDZ.playedCards.length>18)?DDZ.playedCards.length-15:0);
	layout("LandownerCards",DDZ.landownerCards,50,(DDZ.playStage==2),false,0);
	layout("Player1PlayedCards",DDZ.roundPlayedCards[0],30,true,false,0);
	layout("Player2PlayedCards",DDZ.roundPlayedCards[1],30,true,false,0);
	layout("Player3PlayedCards",DDZ.roundPlayedCards[2],30,true,false,0);
}

function beLandowner(who){
	DDZ.players[DDZ.currentPlayer-1].addCards(DDZ.landownerCards);
	DDZ.players[DDZ.currentPlayer-1].cards.sort('asc');
	DDZ.landowner=DDZ.currentPlayer;

	DDZ.playStage=2;
	ddzDisplay();
	layoutall();
	return;
}

function startPlay(){
	
	// DDZ.currentPlayer=1;
	DDZ.currentPlayer=DDZ.lastWinner;
	
	if(DDZ.currentPlayer==0)DDZ.currentPlayer=1;
	$(".Player").removeClass("selected");
	$('#player'+DDZ.currentPlayer).addClass("selected")
	clearTimeout(DDZ.playtimer)
	DDZ.timeRemain=TIMELIMIT;
	/*
	 * $('#Redo').removeClass("Locked"); $('#Auto').removeClass("Locked");
	 * $('#Next').addClass("Locked");
	 */
	DDZ.playtimer=setInterval(playTimer,100);
	DDZ.lastHand=null;
	DDZ.lastHander=0;
	DDZ.scoreX=0;
	$("#Points").text(DDZ.scoreX.toString())
	DDZ.playStage=1;

}

function stopPlay(){
	//$(".Card").remove();
	for(var i=1;i<4;i++){
		if(i==DDZ.myplayerid){
			layout("Player"+i+"Cards",DDZ.players[i-1].cards,48,true,true,0);
			$("#Cards #Player"+i+"Cards").scale(1)
			$("#Cards #Player"+i+"Cards").rotate(0);
		}else{
			layout("Player"+i+"Cards",DDZ.players[i-1].cards,15,true,false,0);
			$("#Cards #Player"+i+"Cards").rotate(270);
			$("#Cards #Player"+i+"Cards").scale(0.8);
		}
	}

	// DDZ.currentPlayer=0;
	$('.Player').removeClass("selected");
	// $('#PlayedCards').hide();
	
	clearTimeout(DDZ.playtimer)
	DDZ.timeRemain=0.0;
	ddzDisplay();
	DDZ.playStage=0;

	//ddzPrepair();
}

function playTimer()
{
	if(DDZ.playStage==1){
		DDZ.timeRemain=DDZ.timeRemain-0.1
		if(DDZ.timeRemain<=0){
			if(DDZ.currentPlayer==DDZ.myplayerid) ScoreX(0);
			nextPlayer();
		}
		$("#TimeRemain").text(DDZ.timeRemain.toFixed(1))
		if((!DDZ.autowait)&&(DDZ.players[DDZ.currentPlayer-1].type==1)){
			if(DDZ.timeRemain<(TIMELIMIT-2)){
				autoScoreX();
				DDZ.timeRemain=1;
			}
		}
	}
	if(DDZ.playStage==2){
		DDZ.timeRemain=DDZ.timeRemain-0.1
		$("#TimeRemain").text(DDZ.timeRemain.toFixed(1))
		
		if((DDZ.players[DDZ.currentPlayer-1].type==1)){
			if((!DDZ.autowait)&&(DDZ.timeRemain<(TIMELIMIT-2))){
				autoPlay()
				DDZ.timeRemain=1;
			}
			if(DDZ.timeRemain<=0){
				nextPlayer();
			}
		}else{
			if(DDZ.timeRemain<=0){
				if(DDZ.currentPlayer==DDZ.myplayerid){	
					autoPlay();
					nextPlayer();
				}
			}
		}
			/*if(DDZ.currentPlayer!=DDZ.myplayerid&&!DDZ.autowait){
				if(autoPlay())nextPlayer();
			}*/

	}
}




function nextPlayer(){

	$('#player'+DDZ.currentPlayer).removeClass("selected")
	DDZ.currentPlayer=(DDZ.currentPlayer)%3+1
	DDZ.timeRemain=TIMELIMIT;
	DDZ.autowait=false;
	$('#player'+DDZ.currentPlayer).addClass("selected")

	if(DDZ.playStage==1){
		if(DDZ.scoreX==3){
			DDZ.currentPlayer=DDZ.lastHander;
			beLandowner(DDZ.currentPlayer);
			DDZ.lastHander=0;
			return;
		}
		if(DDZ.lastHander==DDZ.currentPlayer){
			DDZ.playStage=2;
			DDZ.lastHander=0;
			beLandowner(DDZ.currentPlayer);
			return;
		}	
	}
	if(DDZ.playStage==2){
		if(DDZ.lastHand!=null){
			if(DDZ.lastHander==DDZ.currentPlayer){
				DDZ.lastHand=null;
				DDZ.lastHander=0;
				DDZ.roundPlayedCards=[null,null,null];
				message($("#player"+DDZ.currentPlayer+" .playername").text()+",请出牌！",2000);
			}
		}
	}
	layoutall();
}

function doflip(c){
	c.find('.Back').show()
	c.find('.Front').hide()
}


function cardclick(cardid){
	var c=$("#"+cardid)

	if((DDZ.playStage==2)&&(DDZ.currentPlayer==DDZ.myplayerid)){
		if(c.hasClass("selected"))
		{
			c.stop().animate({
				top : 0,
			}, 250);
			c.removeClass("selected")
			// removeSelectedCard(c)
		}else{
			c.stop().animate({
				top : -30,
			}, 250);
			c.attr("class",c.attr("class")+" selected")
			// addSelectedCard(c)
			
		}
	}
}

function layout(whoid,cards,space,flip,clickfunc,start){
	// b = typeof b !== 'undefined' ? b : 1;

	if(cards==null)return;
	for(var i=start;i<cards.length;i++){
		
		// cards[i].sId="Card"+i.toString();
		var card=cards[i];
		var c=addCardToHtml(card,whoid);
		
		var cleft=(i-start)*space
		var ctop=0
		
		if(DDZ.iOrientation==0){  // 树直
			cleft=(i%2)*300+120
			ctop = Math.floor(i/2)*300-150
		}
		c.animate({
			left:cleft,
			top:ctop,
			rotate:0,
			scale:DDZ.iScale*0.75
			},0,
			function(e){
				if(card.iPoint==0){c.find('.Front').show();c.find('.Back').hide()}
				else{
					if(flip)doflip($(this))}
			}).click(function(e){
				if(clickfunc){
					var cardid=$(this).attr("id")
					/*
					 * if((DDZ.inroom)&&(DDZ.currentPlayer==GAME.myplayerid)){
					 * broadcast({"Card":cardid,"sender":GAME.mypeerid})
					 * cardclick(cardid) } if((!GAME.inroom)&&(GAME.playing)){
					 * cardclick(cardid) }
					 */
					cardclick(cardid);
				}
		})
		
	}
}

function sound(id){
	if(!DDZ.bSpeaker)return;
/*
 * $('#sound').append('<audio id='+id + ' src="../sound/'+id+'.mp3></audio>')
 */
	var x = document.getElementById("sound"+id);
	// var x=$("#sound #"+id);
	x.play();
}

function speakHand(hand){
	var type=hand.getHandType();
	var SOUNDTABLE={
			250:"80_90",
			210:"order1",
			220:"order2",
			230:"order3",
			140:"bomb",
			130:"comb3_1",
			131:"comb3_1",
			132:"comb3_2",
			142:"comb4_2",
			231:"comb6_2",
			232:"comb6_2",
	}
	switch(type){
	case(110):
		sound((hand[0].iPoint).toString());
		break;
	case(120):
		sound(hand[0].iPoint+"_"+hand[0].iPoint);
		break;
	case(141):
		break;
	default:
		sound(SOUNDTABLE[type]);
	}
}

function message(str,time) {
	if(time==undefined)time=1500;
	$('#Message').html(str).fadeIn(250, function() {
		setTimeout(function() {
			$('#Message').fadeOut(300)
		}, time)
	})
}

function chatmessage() {
	var message=$("#chatmessage").attr("value");
	$("#chatmessage").attr("value","");
	if(message==""){
		message=$("#presetmessage").attr("value");
	}
	DDZ.room.broadcast({"msg":$(".Chat #button").attr("name")+","+message,"sender":DDZ.room.peerid})
	$(".Chat").hide();
}

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



$(document).ready(
	function() {
		init()
	});
	
window.onunload = window.onbeforeunload = function(e) {
	DDZ.playStage=-1;
	DDZ.room.leave(DDZ.players[DDZ.myplayerid-1].name,leaveRoomCallback);
	saveConfig();	
};


/*
 * Cards
 * 
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
						return i;
					}
				}
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
						return cards[i]
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
}
