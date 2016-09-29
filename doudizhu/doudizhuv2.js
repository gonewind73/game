/**
 * 何国锋
 * 2016.8.1
 */

var DDZ = {
	bIsOnline:false,
	iPlayerCount:3,
	newplayers:[],
	players:{1:"小宝",2:"auto",3:"auto"},
	playersScore:[100,100,100],
	playersCards:null,//[player1Cards,player2Cards,...]
	playersPlayedCards:null,
	
	iDeckCount:1,

	deck:null,
	playStage:0, //0 未开始  1抢地主   2打牌 
	currentPlayer:0, // 1 player1  2 play2 。。。
	lastHand:null,  
	lastHander:0, //0 player0 1 player1
	playedCards:null,
	landownerCards:null,
	scoreX:0,
	landowner:0, // 1 player1  2 play2
	level:3,  // 1 easy  2  middle  3 difficult
	
	iOrientation:1,
	iScale:1,
	
	mypeerid:"",
	roomid:"",
	timeRemain:0,
	playtimer:null,
	bSpeaker:true,
	autowait:false,
	}

/*
 * Deck
 * 	new
 * 	init
 *  shuffle
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
POINTS[1]=16  //为了不能凑成 JQKA2的顺子
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

var Deck = {
		createNew:function(iDecks){
			var deck={};
			deck.iDecks=iDecks;
			deck.aDeck=[];
			
			deck.init=function(suits,names,points){		
				deck.aDeck=[];
				var id=0;
				for (var d = 0; d < deck.iDecks; d++) {
					for (var s = 0; s < suits.length; s++) {
						for (var n = 0; n < names.length-2; n++) {
							var point=points[n];
							deck.aDeck.push(Card.createNew(suits[s],names[n],point,(id++).toString()));			
						}
					}
					//大小鬼
					deck.aDeck.push(Card.createNew("",names[13],points[13],(id++).toString()));
					deck.aDeck.push(Card.createNew("",names[14],points[14],(id++).toString()));
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
				var suitmap={'Spades':'s','Diamonds':'d','Hearts':'h','Clubs':'c','':'j'};
				var namemap={'Ace':'1','Two':'2','Three':'3','Four':'4','Five':'5',
						'Six':'6', 'Seven':'7','Eight':'8', 'Nine':'9','Ten':'T',
						'Jack':'J','Queen':'Q','King':'K','LittleJoker':'L',
						'BigJoker':'B'	};
				return suitmap[card.sSuit]+namemap[card.sName];
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
			
			var card=Card.createNew(suitmap[ls[0]],namemap[ls[1]],pointmap[ls[1]],ls);
			return card;
		},

	
	};

/*
 * 牌型
 * 第一位 1 单个  2 顺子
 * 第二位  主类型
 * 第三位  从类型
 * 分值
 * 单牌值，实际计算×牌数
 * 最后两位为最小点数
 */
var SCORETABLE={
		110:100, //单牌
		120:150, //对子
		130:200, //三头
		131:250, //三带一
		132:300, //三带二
		140:500, //四炸
		141:300, //四带一
		142:350, //四带二
		143:400, //四带三
		210:200,  //顺子
		220:250,
		230:300,
		231:350,
		232:400,
		240:500,
		241:400,
		242:450,
		243:500,
		250:1500, //王炸
}
var MAXSCORE=10000;
var LANDOWNER=1;
var NONGMING=2;


/*
 * "1" 1S 2 2S 3 3S 31 31S  32 32S 、
 * 4  4S  41S 42 42S  43 43S 
 * JS 
 * 100  100×S  200 200×S  300 300×S 400 400×S 500 500×S
 * 1000 1000*S  1100 1100*S  1200 1200*S  1300 1300*S
 * 2000 
 */		

var TYPEMAP={
		1:110,	10:120, 100:130, 1000:140, 	101:131,
		110:132, 1001:141, 	1010:142, 	1100:143,  	2:250,
}

/*
 * MAP lens array to type
 */

var TYPELENS={
		110:1, //单牌
		120:2, //对子
		130:3, //三头
		131:4, //三带一
		132:5, //三带二
		140:4, //四炸
		141:5, //四带一
		142:6, //四带二
		143:7, //四带三
		210:1,  //顺子
		220:2,
		230:3,
		231:4,
		232:5,
		240:4,
		241:5,
		242:6,
		243:7,
		250:2 //王炸
}

/*
 * MAP of len of type
 */


/*
 * MAP of min of sequence count
 */
var MINSEQS={210:5,220:3,230:2,231:2,232:2,240:2,
		241:2,242:2,243:2}

var MAYTYPE={1:110,2:120,3:130,4:131,5:132}; //5: need add 210 

var DdzHand = {
		createNew:function(cards){
			var hand= Cards.createNew(cards);
			hand.type=0;
			hand.score=0;
			
			/*
			 * -100 类型不对
			 * 100 炸弹
			 * result=hand-hand2
			 */
			hand.compare=function(hand2){
				hand.getHandType();
				hand2.getHandType();
				//bomb
				if(hand.type==140){
					if(hand2.type==140)return hand.score-hand2.score;
					if(hand2.type==250)return -1;
					return 100;
				}
				//Jokers
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
				//check is sequence
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
				//basetype
				if((shl[3]<2)&&(shl[2]<2)&&(shl[1]<2)&&(shl[0]<2)){
					handType=TYPEMAP[map];
					handType=(handType==undefined)?0:handType;
				}else{
					if(map==2){
						handType=(hand.isJokers())?250:0;
					}else{
						//sequence
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
		
		//smart it get most near
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
			var mylevel=(loop>1)?0:level;  //if sequence not strict 
			for(var i=0;i<loop;i++){
				temphand=cards.getHandByTypePoint2(maintype,point,mylevel);
				if(temphand.length==0){
					found=false
					break; //return null;
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
							break;  //return null;
						}
					}
					if(temphand[0].iPoint==point){  //can't be itself
						found=false;
						break;
					}
					slavepoint=temphand[0].iPoint;
					myhand.addCards(temphand);
				}
				found=true;
			}
			if(!found){  //try to find bomb
				temphand=cards.getHandByTypePoint2(4,0,level);
				if(temphand.length!=0){
					type=140;
					myhand=DdzHand.createNew(temphand);
					myhand.getHandType();
					found=true;
				}
			}
			if(!found){  //try to find jokers
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
		
		//smart it get most near
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
			var mylevel=(loop>1)?0:level;  //if sequence not strict 
			for(var i=0;i<loop;i++){
				temphand=cards.getHandByTypeMaxPoint(maintype,point,mylevel);
				if(temphand.length==0){
					found=false
					break; //return null;
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
							break;  //return null;
						}
					}
					if(temphand[0].iPoint==point){  //can't be itself
						found=false;
						break;
					}
					slavepoint=temphand[0].iPoint;
					myhand.addCards(temphand);
				}
				found=true;
			}
			if(!found){  //try to find bomb
				temphand=cards.getHandByTypePoint2(4,0,level);
				if(temphand.length!=0){
					type=140;
					myhand=DdzHand.createNew(temphand);
					myhand.getHandType();
					found=true;
				}
			}
			if(!found){  //try to find jokers
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
		
		//获得排列组合中，点数最小的 .没有type要求 
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
		
		//getHandsS 得到整幅牌的排列组合
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
					found=true;  //continue find
				}
			}
			var thands=DdzHand.getSeqTypeHands(mycards,SEQTYPE);
			for(var i=0;i<thands.length;i++)myhands.push(thands[i]);

			thands=DdzHand.getBaseTypeHands(mycards,BASETYPE);
			for(var i=0;i<thands.length;i++)myhands.push(thands[i]);
			
			return myhands;
		},
		
		//will change cards content
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
		
		//will change cards content move cards to hands
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
						seqlen+=1;  //continue find
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
	createNew:function(id,name,score,role){
		var player={};
		player.id=id;
		player.name=name;
		player.score=score;
		player.role=0;  //1 landowner  2 nongming
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
}

function ddzPrepair(){
	DDZ.deck.init(SUITS,NAMES,POINTS);
	setTimeout(function() {
		DDZ.deck.shuffle();
		}, 250);

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
	
	ddzDisplay();
}

function init() {
	//$('#Shoe').rotate(385);
	hud()
	DDZ.deck=Deck.createNew(1);
	ddzPrepair();
	loadconfig();

	DDZ.playedCards=Cards.createNew([]);
	DDZ.playersPlayedCards=[];
	DDZ.playersPlayedCards.push(Cards.createNew([]));
	DDZ.playersPlayedCards.push(Cards.createNew([]));
	DDZ.playersPlayedCards.push(Cards.createNew([]));
	
	DDZ.nplayers.push(Player.createNew(1,"宝宝",100,0));
	DDZ.nplayers.push(Player.createNew(2,"林志玲",100,0));
	DDZ.nplayers.push(Player.createNew(3,"胡歌",100,0));
	
	//sound("bg");
}

function ddzDisplay(){
	var LANDOWNERPOSTION={
			0:{left:"55%",top:"10%"},
			1:{left:"40%",top:"50%"},
			2:{left:"80%",top:"-5%"},
			3:{left:"0%",top:"-5%"},
	};
	$('.help').hide();
	$('.setup').hide();
	$(".offline").hide();
	
	$("#Points").text(DDZ.scoreX.toString());
	for(var i=1;i<4;i++){
		$("#player"+i+" .Score").text(DDZ.playersScore[i-1].toString());
		//$("#player"+i+" .Score").text((DDZ.nplayers[i-1].score).toString());
		
	}
	
	var j=1;
	if(DDZ.landowner!=0){
		$("#landowner").css(LANDOWNERPOSTION[DDZ.landowner]);
		for(var i=1;i<4;i++){
			if(i==DDZ.landowner)continue;
			$("#nongming"+j).css(LANDOWNERPOSTION[i]);
			j++;
		}
	}
	
	$('.Player').removeClass("selected");
	if(DDZ.currentPlayer!=0) $('#player'+DDZ.currentPlayer).addClass("selected");
	switch(DDZ.playStage){
		case(0):
			$('#PlayedCards').hide()
			$("#PlayAction").hide();
			$("#ScoreAction").hide();
			$("#Shoe").show();
			
			break;
		case(1):
			$('#PlayedCards').hide()
			$("#PlayAction").hide();
			$("#ScoreAction").show();
			$("#Shoe").hide();
			//$("#landowner").css({left:"50%",top:"10%"})
			break;	
		case(2):
			$('#PlayedCards').show();
			$("#PlayAction").show();
			$("#ScoreAction").hide();
			$("#Shoe").hide();
			//$("#landowner").css({left:"60%",top:"40%"})
			break;	
		default:
			break;
	}
}

function hud() {
	var ns = 0.85
	var os = 1
	$('#Shoe').click(function(e) {
		if (DDZ.playStage==0) {
			deal()
		}
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
		action($("#Player"),$(this).attr('id'))
		return false
		}).hover(function() {
		$(this).stop().animate({
			scale : (os+0.15)*GAME.Scale
		}, 250);
		}, function() {
			$(this).stop().animate({
				scale : (ns+0.15)*GAME.Scale
			}, 125);
		})
		
	
	$("#Cards #PlayedCards").click(function (event) {
	     playCards();
	});
	
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
	var cards=$("#Cards #Player1Cards .Card.selected");
	if(cards.length==0){
		message("没有牌被选中");
		return null;
	}
	var selectedCards=Cards.createNew([]);
	for(var i=0;i<cards.length;i++){
		var c=cards[i]
		var sId=$(c).attr("id");
		selectedCards.addCard(DDZ.playersCards[0].getCard(sId));
		//selectedCards.addCard(DDZ.nplayers[0].cards.getCard(sId));
	}
	return selectedCards;
}


function playCards(){
	//重新下一轮
	if((DDZ.playStage!=2)||(DDZ.currentPlayer!=1))return;
		
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
		if(result<0){
			message("你的牌小于上手！");
			return;
		}
		if(result==100){
			message("炸弹！！！")
			DDZ.scoreX+=1;
			$("#Points").text(DDZ.scoreX.toString());
		}
	}
	
    speakHand(hand);
	DDZ.playersCards[0].removeCards(hand);
	//DDZ.nplayers[0].removeCards(hand);
	
	DDZ.playersPlayedCards[DDZ.currentPlayer-1]=hand;
	//DDZ.nplayers[0].addHand(hand);
	
	DDZ.playedCards.addCards(hand);
	

	DDZ.lastHand=hand;
	DDZ.lastHander=DDZ.currentPlayer;
	layoutall();
	
	if(DDZ.playersCards[0].length==0){
	//if(DDZ.nplayers[0].cards.length==0){
		message("赢了！");
		sound("win");
		setScore(DDZ.currentPlayer);
		ddzDisplay();
		stopPlay();
		return
	}
	nextPlayer();
	return
};

function setScore(playerid){
	if(DDZ.landowner==playerid){
		for(var i=1;i<4;i++){
			if(i!=playerid){
				DDZ.playersScore[i-1]-=DDZ.scoreX;
			}else{
				DDZ.playersScore[i-1]+=DDZ.scoreX*2;
			}
		}
	}else{
		for(var i=1;i<4;i++){
			if(i==DDZ.landowner){
				DDZ.playersScore[i-1]-=DDZ.scoreX*2;
			}else{
				DDZ.playersScore[i-1]+=DDZ.scoreX;
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

function autoPlay(){
	//重新下一轮
	var type=0,score=0;
	DDZ.autowait=true;
	if(DDZ.lastHand!=null){
		if(DDZ.lastHander==DDZ.currentPlayer){
			DDZ.lastHand=null;
			DDZ.lastHander=0;
			DDZ.playersPlayedCards=[null,null,null];
			
		}else{
			type=DDZ.lastHand.getHandType();
			score=DDZ.lastHand.score;
		}
	}
	
	if((DDZ.level==3)&&(DDZ.lastHander!=0)){
		if(!isOpposite(DDZ.lastHander)){  //>10 不要，<5张也不要
			if((DDZ.lastHand.score%100>10)||(DDZ.playersCards[DDZ.lastHander-1].length<5)){
				sound("pass");
				message("不要! Player"+DDZ.currentPlayer);
				DDZ.playersPlayedCards[DDZ.currentPlayer-1]=null;
				return
			}
		}
	}
		
	var hand;
	var smart=1;
	
	if(DDZ.level<3){
		hand=DdzHand.getHand2(DDZ.playersCards[DDZ.currentPlayer-1],type,score,smart);
	}else{
		hand=level3getHand(type,score);
	}

	
	if((hand==null)||(hand.length==0)){
		sound("pass");
		message("不要! Player"+DDZ.currentPlayer);
		DDZ.playersPlayedCards[DDZ.currentPlayer-1]=null;
		return
	}
	
	if(hand.getHandType()==0){
		message("你选的牌不合规！请重新选择")
		log(hand.toString())
		//layoutall();
		return
	}
	log(hand.type)

	if(DDZ.lastHand!=null){
		var result=hand.compare(DDZ.lastHand)
		if(result==-100){
			message("你和上家牌型不一致！");
			return;
		}
		if(result<0){
			message("你的牌小于上手！");
			return;
		}
		if(result==100){
			if((DDZ.level==3)&&(DDZ.lastHander!=0)){
				if(!isOpposite(DDZ.lastHander)){
					sound("pass");
					message("不要! Player"+DDZ.currentPlayer);
					DDZ.playersPlayedCards[DDZ.currentPlayer-1]=null;
					return
				}
			}
			message("炸弹！！！")
			DDZ.scoreX+=1;
			$("#Points").text(DDZ.scoreX.toString())
		}
	}

	//DDZ.playersCards[DDZ.currentPlayer-1]=
	speakHand(hand);
	DDZ.playersCards[DDZ.currentPlayer-1].removeCards(hand);
	//$("#player"+DDZ.currentPlayer+" .Score").text(DDZ.playersCards[DDZ.currentPlayer-1].length)

	DDZ.playedCards.addCards(hand);
	DDZ.playersPlayedCards[DDZ.currentPlayer-1]=hand;

	DDZ.lastHand=hand;
	DDZ.lastHander=DDZ.currentPlayer;
	layoutall();
	if(DDZ.playersCards[DDZ.currentPlayer-1].length==0){
		message("赢了！Player"+DDZ.currentPlayer);
		if((DDZ.currentPlayer!=DDZ.landowner)&&(DDZ.landowner!=1)){
			sound("win");
		}
		setScore(DDZ.currentPlayer);
		stopPlay();
		return
	}
	DDZ.timeRemain=2
	//nextPlayer();
	return;
};

function level3getHand(type,score){
	var hand;
	var smart=1;
	var getMax=false;
	
	if(type!=0){
		if(DDZ.level==3){
			if(isOpposite(DDZ.lastHander)){
				if(DDZ.playersCards[DDZ.lastHander-1].length<5){
					smart=0;
				}
			}
			var nextid=DDZ.currentPlayer%3+1;
			if((isOpposite(nextid))&&(DDZ.playersCards[nextid-1].length<3)){
				getMax=true;
			}
		}
		if(getMax){
			hand=DdzHand.getHandMax(DDZ.playersCards[DDZ.currentPlayer-1],type,score,smart);
		}else{
			hand=DdzHand.getHand2(DDZ.playersCards[DDZ.currentPlayer-1],type,score,smart);
		}
	}else{
		//todo howto deal last cards
		if(DDZ.level==3){
			//var SEQTYPE=[231,232,230,220,210];
			//var BASETYPE=[131,132,130,120,110];
			//var MAXSEQLEN=12;
			var maytypes=[];
			var MAYTYPE={1:110,2:120,3:130,4:131,5:132,}
			for(var i=2;i>0;i--){
				var tpid=(DDZ.currentPlayer+i-1)%3+1;
				if(isOpposite(tpid)){
					if(DDZ.playersCards[tpid-1].length<6){
						//remove
						if(maytypes.length==0)
								maytypes=[132,210,131,130,120,110,220,230,231,232];
						var ttypes=[];
						ttypes.push(MAYTYPE[DDZ.playersCards[tpid-1].length]);
						if(DDZ.playersCards[tpid-1].length==5)ttypes.push(210);
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
					//insert
					if(DDZ.playersCards[tpid-1].length<6){
						var ttypes=[];
						ttypes.push(MAYTYPE[DDZ.playersCards[tpid-1].length]);
						if(DDZ.playersCards[tpid-1].length==5)ttypes.push(210);
						if(maytypes.length!=0)maytypes=ttypes;
						/*for(var x=0;x<ttypes.length;x++){
							var found=false;
							for(var j=0;i<maytypes.length;j++){
								if(maytypes[j]==ttypes[x]){
									found=true;
									break;
								}
							}
							if(!found)maytypes.unshift(ttypes[x]);
						}*/
					}else{
						if(maytypes.length==0)
							maytypes=[132,210,131,130,120,110,220,230,231,232];
					}
				}
			}
			if(maytypes.length==0)maytypes=[132,210,131,130,120,110,220,230,231,232];
			hand=DdzHand.getHandByTypes(DDZ.playersCards[DDZ.currentPlayer-1],maytypes);
			if(hand.length==0){
				hand=DdzHand.getHand2(DDZ.playersCards[DDZ.currentPlayer-1],type,score,1);
			}
		}
	}
	return hand;
}

function autoScoreX(){
	var type=0,score=0;
	DDZ.autowait=true;
    
	var score=DdzHand.getMaxScore(DDZ.playersCards[DDZ.currentPlayer-1]);
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
		//message(DDZ.scoreX+"分，Player"+DDZ.currentPlayer);
		ddzDisplay();
	}else{
		message("不叫！");
		sound("point0")
	}
		
	return;
};

function ScoreX(scorex){
	if(DDZ.playStage==2)playCards();  //for same positon seems infect eachother
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
	//beLandowner(entity);
	//broadcast({"action":"Auto","sender":DDZ.mypeerid})
 	nextPlayer();
	return;
};


function action(entity, a) {
	switch (a) {
	case ('Pass'):
		if(DDZ.currentPlayer==1){
			DDZ.playersPlayedCards[DDZ.currentPlayer-1]=null;
			sound("pass");
			nextPlayer();
		}
		//broadcast({"action":"Redo","sender":GAME.mypeerid})
		break;
	case ('Put'):
		if(DDZ.currentPlayer==1) playCards();
		//broadcast({"action":"Redo","sender":GAME.mypeerid})
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
		
	
		/*if(GAME.mypeerid==""){
			roominit()
		}else{
			leaveroom()
		}*/
			
		break;
	case("OK"):
		saveConfig();
		
		loadconfig();
		
		ddzDisplay();
		$('.setup').hide()
		$('#Cards').show()
		$('#Operators').show()
		break;
	case("Cancel"):
		ddzDisplay();
		$('.setup').hide()
		$('#Cards').show()
		$('#Operators').show()
		break;
	default:
		break
	}
}

function saveConfig(){
	var player1name=$("#player1name").attr("value")
	var player2name=$("#player2name").attr("value")
	var player3name=$("#player3name").attr("value")
	var roomid=$("#roomid").attr("value")
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
	var isonline=$("#online").attr("checked")
	var speaker=$("#speaker").attr("checked")
	
	var data={"isonline":isonline,"speaker":speaker,"player1name":player1name,
			"player2name":player2name,"player3name":player3name,
			"roomid":roomid,"score":DDZ.playersScore[0]}
	localStorage.setItem("DouDiZhu",JSON.stringify(data));
}


function loadconfig(){
	if(localStorage.getItem("DouDiZhu")){
		var datajson=localStorage.getItem("DouDiZhu");
		var data=JSON.parse(datajson);
	}else{
		return;
	}
	DDZ.roomid=data.roomid;
	DDZ.mynickname=data.player1name;
	$("#player1 .playername").text(data.player1name);
	$("#player2 .playername").text(data.player2name);
	$("#player3 .playername").text(data.player3name);
	$("#player1name").attr("value",data.player1name);
	$("#player2name").attr("value",data.player2name);
	$("#player3name").attr("value",data.player3name);
	$("#roomid").attr("value",data.roomid)
	if(data.score==undefined)data.score=90;
	DDZ.playersScore[0]=data.score;
	if(data.isonline){
		$("#online").attr("checked","checked")
		$(".offline").show()
	}else{
		$("#online").attr("checked","")
		$(".offline").hide()
	}
	if(data.speaker){
		$("#speaker").attr("checked","checked")
		DDZ.bSpeaker=true;
	}else{
		$("#speaker").attr("checked","")
		DDZ.bSpeaker=false;
	}
	
		
		
	if(data.isonline){
		roominit()
	}else{
		leaveroom()
	}
}


function deal(){

	if(DDZ.playStage>0)	return;
	$(".Card").remove();
	//$("#Cards #PlayedCards .Card").remove();
	DDZ.deck.deal();
	DDZ.playersPlayedCards=[null,null,null];
	DDZ.playersCards=[];
	
	for(var i=0;i<3;i++){
		DDZ.playersCards[i]=DDZ.deck.pickCards(17);
		DDZ.playersCards[i].sort('asc');
		log(DDZ.playersCards[i].dump());
	}
	
	log(DdzHand.getMaxScore(DDZ.playersCards[0]));
	
	/*DDZ.playersCards[1]=DDZ.deck.pickCards(17);
	DDZ.playersCards[2]=DDZ.deck.pickCards(17);*/
	
	DDZ.playedCards=Cards.createNew([]);
	DDZ.landownerCards=DDZ.deck.pickCards(3);
	
	//DDZ.playersCards[0]=DDZ.playersCards[0].sort('asc');
	//layout("LandownerCards",DDZ.landownerCards,50,false,false);
	layoutall();
	DDZ.scoreX=0;
	DDZ.playStage=1;
	ddzDisplay();
	startPlay();
}

function layoutall(){
	$(".Card").remove();
	layout("Player1Cards",DDZ.playersCards[0],48,true,true,0);
	layout("Player2Cards",DDZ.playersCards[1],15,false,false,0);
	$("#Cards #Player2Cards").rotate(270);
	layout("Player3Cards",DDZ.playersCards[2],15,false,false,0);
	$("#Cards #Player3Cards").rotate(270);
	//layout("PlayedCards",DDZ.playedCards,30,true,false,(DDZ.playedCards.length>18)?DDZ.playedCards.length-15:0);
	layout("LandownerCards",DDZ.landownerCards,50,(DDZ.playStage==2),false,0);
	layout("Player1PlayedCards",DDZ.playersPlayedCards[0],30,true,false,0);
	layout("Player2PlayedCards",DDZ.playersPlayedCards[1],30,true,false,0);
	layout("Player3PlayedCards",DDZ.playersPlayedCards[2],30,true,false,0);
}

function beLandowner(who){
	DDZ.playersCards[DDZ.currentPlayer-1].addCards(DDZ.landownerCards);
	DDZ.playersCards[DDZ.currentPlayer-1].sort('asc');
	DDZ.landowner=DDZ.currentPlayer;
	/*switch(DDZ.currentPlayer){
	case(1):
		DDZ.playersCards[0]=DDZ.playersCards[0].addCards(DDZ.landownerCards)
		DDZ.playersCards[0]=DDZ.playersCards[0].sort('asc');
		break;
	default:

		
		break;
	}*/
	DDZ.playStage=2;
	ddzDisplay();
	//startPlay();
	layoutall();
	return;
}

function startPlay(){
	
	//DDZ.currentPlayer=1;
	if(DDZ.currentPlayer==0)DDZ.currentPlayer=1;
	$(".Player").removeClass("selected");
	$('#player'+DDZ.currentPlayer).addClass("selected")
	clearTimeout(DDZ.playtimer)
	DDZ.timeRemain=TIMELIMIT;
	/*
	$('#Redo').removeClass("Locked");
	$('#Auto').removeClass("Locked");
	$('#Next').addClass("Locked");*/
	DDZ.playtimer=setInterval(playTimer,100);
	DDZ.lastHand=null;
	DDZ.lastHander=0;
	DDZ.scoreX=0;
	$("#Points").text(DDZ.scoreX.toString())
	DDZ.playStage=1;

}

function stopPlay(){

	layout("Player2Cards",DDZ.playersCards[1],15,true,false,0);
	layout("Player3Cards",DDZ.playersCards[2],15,true,false,0);
	DDZ.currentPlayer=0;
	$('.Player').removeClass("selected");
	$('#PlayedCards').hide();
	clearTimeout(DDZ.playtimer)
	DDZ.timeRemain=0.0;

	DDZ.playStage=0;
	$('#Redo').removeClass("Locked");
	$('#Auto').removeClass("Locked");
	$('#Next').addClass("Locked");
	//DDZ.playtimer=setInterval(playTimer,100);
	$('#Shoe').show();
	ddzPrepair();
}

function playTimer()
{
	if(DDZ.playStage==1){
		DDZ.timeRemain=DDZ.timeRemain-0.1
		if(DDZ.timeRemain<=0){
			nextPlayer();
		}
		$("#TimeRemain").text(DDZ.timeRemain.toFixed(1))
		if((!DDZ.autowait)&&(DDZ.players[DDZ.currentPlayer]=="auto")){
			if(DDZ.timeRemain<(TIMELIMIT-2)){
				autoScoreX();
				DDZ.timeRemain=1;
			}
		}
	}
	if(DDZ.playStage==2){
		if(DDZ.playing==false)return;
		DDZ.timeRemain=DDZ.timeRemain-0.1
		if(DDZ.timeRemain<=0){
			if(DDZ.currentPlayer==1){
				//clearTimeout(DDZ.playtimer)
				autoPlay();
				//DDZ.playtimer=setInterval(playTimer,100);
			}
			nextPlayer();
		}
		$("#TimeRemain").text(DDZ.timeRemain.toFixed(1))
		
		if((!DDZ.autowait)&&(DDZ.players[DDZ.currentPlayer]=="auto")){
			if(DDZ.timeRemain<(TIMELIMIT-2)){
				//clearTimeout(DDZ.playtimer)
				autoPlay();
				DDZ.timeRemain=1;
				//DDZ.playtimer=setInterval(playTimer,100);
			}
		}
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
				DDZ.playersPlayedCards=[null,null,null];
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

	if((DDZ.playStage==2)&&(DDZ.currentPlayer==1)){
		if(c.hasClass("selected"))
		{
			c.stop().animate({
				top : 0,
			}, 250);
			c.removeClass("selected")
			//removeSelectedCard(c)
		}else{
			c.stop().animate({
				top : -30,
			}, 250);
			c.attr("class",c.attr("class")+" selected")
			//addSelectedCard(c)
			
		}
	}
}

function layout(whoid,cards,space,flip,clickfunc,start){
	//b = typeof b !== 'undefined' ?  b : 1;

	if(cards==null)return;
	for(var i=start;i<cards.length;i++){
		
		//cards[i].sId="Card"+i.toString();
		var card=cards[i];
		var c=addCardToHtml(card,whoid);
		
		var cleft=(i-start)*space
		var ctop=0
		
		if(DDZ.iOrientation==0){  //树直
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
					/*if((DDZ.playing)&&(DDZ.inroom)&&(DDZ.currentPlayer==GAME.myplayerid)){
						broadcast({"Card":cardid,"sender":GAME.mypeerid})
						cardclick(cardid)
					}
					if((!GAME.inroom)&&(GAME.playing)){
						cardclick(cardid)
					}*/
					cardclick(cardid);
				}
		})
		
	}
}

function sound(id){
	if(!DDZ.bSpeaker)return;
/*	$('#sound').append('<audio id='+id
			+ ' src="../sound/'+id+'.mp3></audio>') */
	var x = document.getElementById("sound"+id);
	//var x=$("#sound #"+id);
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
	saveConfig();
	leaveroom();
};

function broadcast(data){
	/*if(GAME.roomid=="") return
	
	jsonstring=JSON.stringify(data)
	for( peer in GAME.roompeers){
		if(peer!=GAME.mypeerid)
			SendMsgToPeer(peer,jsonstring)
	}*/
}

function leaveroom(){
	/*if(GAME.inroom){
		var url="http://gonewind.pythonanywhere.com/leave";	
		$.post(url,
				{"roomid":GAME.roomid,
				"peerid":GAME.mypeerid,
				"nickname":GAME.mynickname},
				function(json){
						log(json)
				})
		broadcast({"leave":GAME.mypeerid,"sender":GAME.mypeerid});
		GAME.inroom=false;
	}
	GAME.myplayerid="";
	GAME.mypeerid="";
	GAME.roompeers={};
	GAME.isroomowner=false;
	if(GAME.peerbeattimer!=null){
		clearTimeout(GAME.peerbeattimer)
		GAME.peerbeattimer=null
	}
	if(GAME.peer!=null){
		GAME.peer.destroy();
		GAME.peer=null;
	}
	$(".offline").hide()
	$("#player2 .playername").text(GAME.mynickname)
	$("#player1 .playername").text($("#player1name").attr("value"))*/
}


/*
 * Cards
 * 	
 */

var Cards = {
	createNew:function(aCards){
			var cards;
			
			if(aCards!=null){
				cards=aCards; //[Card,Card,...]
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
			
			cards.sort=function(sOrder){   //sOrder:asc or desc
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
				//cards=
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
			
			//get 1..4 >point
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
				var s=dumpstring.split(" ");
				for(var i=0;i<s.length;i++){
					cards.addCard(Card.load(s));
				}
			}
						
			return cards;
		},
}

/*
isSquenceHands:function(hands){
var temphand=Cards.createNew([])
for(var i=0;i<hands.length;i++){
	temphand.addCard(hands[i][0])
}
return temphand.isSquence()
},




*/

/*

cards.getHandByTypePoint=function(type,point,level){
	var hands=cards.splitHand();
	var tempcards=Cards.createNew([]);
	switch(type){
	case(1):
		for(var i=0;i<hands.length;i++){
			if(hands[i][0].iPoint>point){
				tempcards.addCard(hands[i][0]);
				break;
			}
		}
		break;
	case(2):
		for(var i=0;i<hands.length;i++){
			if(hands[i].length>1){
				if(hands[i][0].iPoint>point){
					tempcards.addCard(hands[i][0]);
					tempcards.addCard(hands[i][1]);
					break;
				}
			}
		}
		break;		
	case(3):
		for(var i=0;i<hands.length;i++){
			if((hands[i].length>=3)
					&&(hands[i][0].iPoint>point)){
				tempcards.addCard(hands[i][0]);
				tempcards.addCard(hands[i][1]);
				tempcards.addCard(hands[i][2]);
				break;
			}
		}
		break;
	case(4):
		for(var i=0;i<hands.length;i++){
			if((hands[i].length>=4)
					&&(hands[i][0].iPoint>point)){
				tempcards.addCard(hands[i][0]);
				tempcards.addCard(hands[i][1]);
				tempcards.addCard(hands[i][2]);
				tempcards.addCard(hands[i][3]);
				break;
			}
		}
		break;
	case(5):
		for(var i=0;i<hands.length-1;i++){
			if((hands[i][0].iPoint==POINTS[13])
					&&(hands[i+1][0].iPoint==POINTS[14])){
				tempcards.addCard(hands[i][0]);
				tempcards.addCard(hands[i+1][0]);
				break;
			}
		}
		break;
	}
	return tempcards;
}  */

/*
cards.addCardArray=function(cardarray){
	for(var i=0;i<cardarray.length;i++)
		cards.push(cardarray[i]);
}
*/


/*
	hand.getHandType=function(){
		hand.sort('asc');
		var handType=0;
		var handScore=0;
		var len=hand.length;
		for(var htype in SCORETABLE){
			var type=htype;
			var score=SCORETABLE[htype]*len;
			var temphand=hand.getHand(hand,type,score);
			if((temphand!=null)&&(temphand.length==len)){
				handType=temphand.type;
				var isSequence=Math.floor(htype/200)
				var maintype=Math.floor((htype%100)/10);
				var slavetype=htype%10;
				if(isSequence==1){
					var needlen=0
					switch(maintype){
					case(1):
						needlen=5;
						break;
					case(2):
						needlen=6;
						break;
					case(3):
						needlen=2*(3+slavetype)
						break;
					default:
						break;
					}
					if(needlen>len)handType=0;
				}
				return handType;
			}	
		}
		return handType;
	}*/

//取得序列中最小的一个
/*	getHand:function(cards,type,score){
		var myhand=DdzHand.createNew([]);
		//var hands=cards.splitHand();
		var isSequence=Math.floor(type/200)
		var maintype=Math.floor((type%100)/10);
		var slavetype=type%10;
		var point=score%100;
		var seqlen=Math.floor(score/SCORETABLE[type]);
		var len=maintype+slavetype;
		var loop=1;
		if(maintype==5)len=2;
		if(isSequence==1){
			loop=seqlen/len;
		}
		var lastpoint=0;
		var slavepoint=0;
		for(var i=0;i<loop;i++){
			var temphand=cards.getHandByTypePoint(maintype,point);
			if(temphand.length==0)return null;
			point=temphand[0].iPoint;
			if((i!=0)&&(point!=lastpoint+1)){
				i=0;
				myhand=DdzHand.createNew([]);
				slavepoint=0;
			}
			var lastpoint=point;
			myhand.addCards(temphand);
			if(slavetype!=0){
				temphand=cards.getHandByTypePoint(slavetype,slavepoint);
				if(temphand.length==0)return null;
				slavepoint=temphand[0].iPoint;
				myhand.addCards(temphand);
			}
		}
		myhand.type=type;
		myhand.score=SCORETABLE[type]*seqlen*len+myhand[0].iPoint;
		return myhand;
	},  */


/*
for(var i=0;i<SEQTYPE.length;i++){
	mytype=SEQTYPE[i];
		for(var seqlen=MAXSEQLEN;seqlen>1;seqlen--){
			if(mycards.length<(TYPELENS[mytype]*seqlen))continue;
			myscore=SCORETABLE[mytype]*TYPELENS[mytype]*seqlen;
			temphand=DdzHand.getHand2(mycards,mytype,myscore,1);
			if(temphand.length>=(MINSEQS[mytype]*TYPELENS[mytype])){
				myhands.push(temphand)
				mycards.removeCards(temphand);
				seqlen+=1;  //continue find
			}
		}
}*/
/*
for(var i=0;i<BASETYPE.length;i++){
	mytype=BASETYPE[i];
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
} */
	