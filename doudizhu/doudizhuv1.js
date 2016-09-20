/**
 * 何国锋
 * 2016.8.1
 */

var DDZ = {
	bIsOnline:false,
	iPlayerCount:2,
	iDeckCount:1,
	sPlayer1Name:"Player1",
	bSpeaker:true,
	deck:null,
	isPlaying:false,
	playersCards:null,//[player1Cards,player2Cards,...]
	playedCards:null,
	iOrientation:1,
	iScale:1,
	cards1:null

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
			
		
			deck.init=function(){		
				deck.aDeck=[];
				for (var d = 0; d < deck.iDecks; d++) {
					for (var s = 0; s < SUITS.length; s++) {
						for (var n = 0; n < NAMES.length-2; n++) {
							var point=POINTS[n];
							deck.aDeck.push(Card.createNew(SUITS[s],NAMES[n],point));
							
						}
					}
					//大小鬼
					deck.aDeck.push(Card.createNew("",NAMES[13],POINTS[13]));
					deck.aDeck.push(Card.createNew("",NAMES[14],POINTS[14]));
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
			card.sId="";
			card.sSuit=sSuit;
			card.sName=sName;
			card.iPoint=iPoint;
			
			card.compare=function(card2){
				return(card.iPoint-card2.iPoint);
			};
			
			return card;
		}
	};

var DdzHand = {
		createNew:function(){
			var hand= Cards.createNew([]);
			hand.type={0:0}
			
			
			
			hand.compare=function(card2){
				return(card.iPoint-card2.iPoint);
			};
			
			return hand;
		}
	};

var Cards1={
		createNew:function(aCards){
			var cards=new Array();
			cards.type={0:0};   //[Card,Card,...]
			cards.push("C")
			return cards;
		}
}
/*
 * Cards
 * 	
 */

var Cards = {
		isSquenceHands:function(hands){
			var temphand=Cards.createNew([])
			for(var i=0;i<hands.length;i++){
				temphand.addCard(hands[i].aCards[0])
			}
			return temphand.isSquence()
		},
		createNew:function(aCards){
			var cards={};
			cards.aCards=aCards;   //[Card,Card,...]
			if(aCards==null)cards.aCards=[];
			cards.type={"0":0}
			/*
			 * "1" 1S 2 2S 3 3S 31 31S  32 32S 、
			 * 4  4S  41S 42 42S  43 43S 
			 * JS 
			 * 100  100×S  200 200×S  300 300×S 400 400×S 500 500×S
			 * 1000 1000*S  1100 1100*S  1200 1200*S  1300 1300*S
			 * 2000 
			 */
			
			cards.len=function(){
				return cards.aCards.length;
			}
			
			cards.addCard=function(card){
				cards.aCards.push(card);
			}
			
			cards.addCards=function(addcards){
				for(var i=0;i<addcards.len();i++)
					cards.aCards.push(addcards.aCards[i]);
			}
			
			cards.addCardArray=function(cardarray){
				for(var i=0;i<cardarray.length;i++)
					cards.aCards.push(cardarray[i]);
			}
			
			cards.removeCard=function(card){
				for(var i=0;i<cards.aCards.length;i++){
					if((cards.aCards[i]).sId==card.sId){
						cards.aCards.splice(i,1);
						return i;
					}
				}
			}
			
			cards.removeCards=function(removecards){
				for(var i=0;i<removecards.len();i++){
					cards.removeCard(removecards.aCards[i]);
				}
			}
			
			cards.getCard=function(sId){
				for(var i=0;i<cards.aCards.length;i++){
					if(cards.aCards[i].sId==sId)
						return cards.aCards[i]
				}
			}
			
			cards.sort=function(sOrder='asc'){   //sOrder:asc or desc
				var order=(sOrder=='asc')?'asc':'desc';
				var refer=[],result=[],index;
			    for(var i=0; i<aCards.length; i++){ 
				        refer[i] = (aCards[i].iPoint+9)+':'+i; 
			    } ;
			    refer.sort(); 
			    if(order=='desc') refer.reverse(); 
			    for(i=0;i<refer.length;i++){ 
			        index = refer[i].split(':')[1]; 
			        result[i] = aCards[index]; 
			    } ;
			    cards.aCards=result;
			    return cards; 
			};
			
			/*
			 * 对子
			 */
			cards.isTwin=function(){
				if((cards.aCards.length==2)&&
						(cards.aCards[0].iPoint==cards.aCards[1].iPoint))
					return true;
				return false;
			};
			
			/*
			 * 三个
			 */
			cards.isTri=function(){
				if((cards.aCards.length==3)&&
						(cards.aCards[0].iPoint==cards.aCards[1].iPoint)&&
						(cards.aCards[2].iPoint==cards.aCards[1].iPoint))
					return true;
				return false;
			};
			
			/*
			 * 炸弹
			 */
			
			cards.isFour=function(){
				if((cards.aCards.length==4)&&
						(cards.aCards[0].iPoint==cards.aCards[1].iPoint)&&
						(cards.aCards[2].iPoint==cards.aCards[1].iPoint)&&
						(cards.aCards[3].iPoint==cards.aCards[1].iPoint))
					return true;
				return false;				
			};
			
			/*
			 * 顺子
			 */
			cards.isSequence=function(){
				cards.sort();
				for(var i=0;i<cards.aCards.length-1;i++){
					if(cards.aCards[i+1].iPoint!=cards.aCards[i].iPoint+1)return false;
				}
				return true
			};
			
			/*
			 * 把牌按点数分类，返回array of Cards of same point [Cards,Cards,...]
			 */
			cards.splitHand=function(){
				cards.sort();
				var hands=[];
				var tempHand=Cards.createNew([]);
				for(var i=0;i<cards.len();i++){
					tempHand.addCard(cards.aCards[i])
					if((i==cards.len()-1)
							||(cards.aCards[i+1].iPoint!=cards.aCards[i].iPoint)){
						hands.push(tempHand);
						tempHand=Cards.createNew([]);
					}
				}
				return hands;
			};
			
			function getHandByTypePoint(hands,htype,point){
				var tempcards=Cards.createNew([]);
				switch(htype){
				case(1):
					for(var i=0;i<hands.length;i++){
						if(hands[i].aCards[0].iPoint>point){
							tempcards.addCard(hands[i].aCards[0]);
							break;
						}
					}
					break;
				case(2):
					for(var i=0;i<hands.length;i++){
						if(hands[i].aCards.length>1){
							if(hands[i].aCards[0].iPoint>point){
								tempcards.addCard(hands[i].aCards[0]);
								tempcards.addCard(hands[i].aCards[1]);
								break;
							}
						}
					}
					break;		
				case(3):
					for(var i=0;i<hands.length;i++){
						if((hands[i].aCards.length>=3)
								&&(hands[i].aCards[0].iPoint>point)){
							tempcards.addCard(hands[i].aCards[0]);
							tempcards.addCard(hands[i].aCards[1]);
							tempcards.addCard(hands[i].aCards[2]);
							break;
						}
					}
					break;
				case(4):
					for(var i=0;i<hands.length;i++){
						if((hands[i].aCards.length>=4)
								&&(hands[i].aCards[0].iPoint>point)){
							tempcards.addCard(hands[i].aCards[0]);
							tempcards.addCard(hands[i].aCards[1]);
							tempcards.addCard(hands[i].aCards[2]);
							tempcards.addCard(hands[i].aCards[3]);
							break;
						}
					}
					break;
				case(5):
					for(var i=0;i<hands.length-1;i++){
						if((hands[i].aCards[0].iPoint==POINTS[13])
								&&(hands[i+1].aCards[0].iPoint==POINTS[14])){
							tempcards.addCard(hands[i].aCards[0]);
							tempcards.addCard(hands[i+1].aCards[0]);
							break;
						}
					}
					break;
				}
				return tempcards;
			}
			
			//取得序列中最小的一个
			cards.getHand=function(type){
				var hand=Cards.createNew([]);
				var hands=cards.splitHand();
				for( htype in type){
					var isSequence=Math.floor(htype/200)
					var maintype=Math.floor((htype%100)/10);
					var slavetype=htype%10;
					var point=type[htype]%100;
					var seqlen=1;
					var len=maintype+slavetype;
					if(maintype==5)len=2;
					if(isSequence==1){
						seqlen=type[htype]/SCORETABLE[htype];
						
					}
					var lastpoint=0;
					var slavepoint=0;
					for(i=0;i<seqlen;i++){
						var temphand=getHandByTypePoint(hands,maintype,point);
						if(temphand.len()==0)return null;
						point=temphand.aCards[0].iPoint;
						if((i!=0)&&(point!=lastpoint+1)){
							i=0;
							hand=Cards.createNew([]);
							slavepoint=0;
						}
						var lastpoint=point;
						hand.addCards(temphand);
						if(slavetype!=0){
							temphand=getHandByTypePoint(hands,maintype,slavepoint);
							if(temphand.len()==0)return null;
							slavepoint=temphand.aCards[0].iPoint;
							hand.addCards(temphand);
						}
					}
					hand.type={};
					hand.type[htype]=SCORETABLE[htype]*seqlen*len+hand.aCards[0].iPoint;
				}
				
				return hand;
			}
			
			
			
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
					141:600, //四带一
					142:650, //四带二
					143:700, //四带三
					210:200,  //顺子
					220:250,
					230:300,
					231:350,
					232:400,
					240:500,
					241:550,
					242:600,
					243:650,
					250:1500, //王炸
			}
		
			cards.getCardsType=function(){
				cards.sort();
				var cardsType={0:0}
				var len=cards.len();
				for(var htype in SCORETABLE){
					var type={};
					type[htype]=SCORETABLE[htype]*len;
					var temphand=cards.getHand(type);
					if((temphand!=null)&&(temphand.len()==len)){
						cardsType=temphand.type;
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
							if(needlen>len)cardsType={0:0}
						}
						return cardsType;
					}
						
				}
				
				/*
				switch(len){
				case(0):
					cardsType={0:0}
					break;
				case(1):
					cardsType={110:SCORETABLE[110]+cards.aCards[0].iPoint};
					break;
				case(2):
					if(cards.isTwin()){
						cardsType={120:SCORETABLE[120]*2+cards.aCards[0].iPoint};
					}
					break;
				case(3):
					if(cards.isTri()){
						cardsType={130:SCORETABLE[130]*3+cards.aCards[0].iPoint};
					}
					break;
				case(4):
					if(cards.isFour()){
						cardsType={140:SCORETABLE[140]*4+cards.aCards[0].iPoint};
					}else{
						var hands=cards.splitHand();
						if(hands[0].isTri())cardsType={131:SCORETABLE[131]*4+hands[0].aCards[0].iPoint};
						if(hands[1].isTri())cardsType={131:SCORETABLE[131]*4+hands[1].aCards[0].iPoint};
					}
					break;
				case(5):
					if(cards.isSequence()){  //500
						cardsType={210:SCORETABLE[210]*5+cards.aCards[0].iPoint};
					}else{
						var hands=cards.splitHand();
						if((hands[0].isTri())&&(hands[1].isTwin()))
							cardsType={132:SCORETABLE[132]*5+hands[0].aCards[0].iPoint};
						if((hands[1].isTri())&&(hands[0].isTwin()))
							cardsType={132:SCORETABLE[132]*5+hands[1].aCards[0].iPoint};
						if(hands[0].isFour())cardsType={141:SCORETABLE[141]*5+hands[0].aCards[0].iPoint};
						if(hands[1].isFour())cardsType={141:SCORETABLE[141]*5+hands[1].aCards[0].iPoint};
					}
					break;	
				case(6):
					if(cards.isSequence()){
						cardsType={210:SCORETABLE[210]*6+cards.aCards[0].iPoint};
					}else{
						var hands=cards.splitHand();
						if(hands.length==2){
							if((hands[0].isFour())&&(hands[1].isTwin()))
								iCardsType=hands[0].getCardsType();
							if((hands[1].isFour())&&(hands[0].isTwin()))
								iCardsType=hands[1].getCardsType();
							if((hands[0].isTri())&&(hands[1].isTri())){
								if(Cards.isSequenceHands(hands))
									iCardsType=700+hands[0].getCardsType();
							}
						}
						if(hands.length==3){
							if((hands[0].isTwin())&&(hands[1].isTwin())&&(hands[2].isTwin()))
								iCardsType=800+hands[0].getCardsType();
						}
					}
					break;	
				case(7):
					if(cards.isSequence()){
						iCardsType=900+cards.aCards[0].iPoint;
					}else{
						var hands=cards.splitHand();
						if(hands.length==2){
							if((hands[0].isFour())&&(hands[1].isTri()))
								iCardsType=hands[0].getCardsType();
							if((hands[1].isFour())&&(hands[0].isTri()))
								iCardsType=hands[1].getCardsType();
						}
					}
					break;	
				default: //>=8
					
					var temphand=cards.getHand({210:SCORETABLE[210]*len});
					if(temphand!=null)cardsType=temphand.type;
						cardsType={210:SCORETABLE[210]*len+cards.aCards[0].iPoint};
					}
					if(cards.getHand({210:SCORETABLE[210]*len})!=null){
						
					}
					/*if(cards.isSequence()){
						iCardsType=900+cards.aCards[0].iPoint;
					}else{
						var hands=cards.splitHand();
						if((cards.len()/2==hands.length)&&(cards.len()%2==0)){
							if(Cards.isSquenceHands(hands))
								iCardsType=hands[0].getCardsType()+1000;
							//todo (3+1)n
						}
						if((cards.len()/3==hands.length)&&(cards.len()%3==0)){
							if(Cards.isSquenceHands(hands))
								iCardsType=hands[0].getCardsType()+1000;
						}
						//todo (3+2)n
					}
					break;	
				}*/
				return cardsType;
			}
			
			return cards;
		},
	};



/*
 * Cards is an Array of Card which is [Suit,Value,vp] Ace
 *
function isValidCards(Cards){
	var aSortedCards=sortCards(Cards)
	var iCardType=0
	var bIsValid=false
	switch(aSortedCards.length){
	case(0):
		iCardType=0;
		bIsValid=false;
		break
	case(1):
		iCardType=1;
		bIsValid=true;
		break
	case(2):
		if(isTwin(aSortedCards[0],aSortedCards[1]){
			iCardType=2;
			bIsValid=true;
		}else{
			if(isJokers(aSortedCards[0],aSortedCards[1])){
				iCardType=5;
				bIsValid=true;
			}else{
				iCardType=15;
				bIsValid=false;
			}			
		}
		break;
	case(3):
		if(isThree(aSortedCards[0],aSortedCards[1],aSortedCards[2])){
			iCardType=3;
			bIsValid=true;
		}else{
			iCardType=15;
			bIsValid=false;
		}
		break;
	case(4):
		if(isFour(aSortedCards[0],aSortedCards[1],aSortedCards[2],aSortedCards[3])){
			iCardType=4;
			bIsValid=true;
		}else{
			if(isThree(aSortedCards[0],aSortedCards[1],aSortedCards[2])
					||isThree(aSortedCards[3],aSortedCards[1],aSortedCards[2])){
				iCardType=9;
				bIsValid=false;
			}else{
				iCardType=15;
				bIsValid=false;
			}
		}
		break;
	case(5):
		if(isFour(aSortedCards[0],aSortedCards[1],aSortedCards[2],aSortedCards[3])
				||isFour(aSortedCards[4],aSortedCards[1],aSortedCards[2],aSortedCards[3])){
			iCardType=11;  //4-1
			bIsValid=true;
		}else{
			if((isThree(aSortedCards[0],aSortedCards[1],aSortedCards[2])&&isTwo(aSortedCards[3],aSortedCards[4]))
					||(isThree(aSortedCards[3],aSortedCards[4],aSortedCards[2])&&isTwo(aSortedCards[0],aSortedCards[1]))){
				iCardType=10;  //3-2
				bIsValid=true;
			}else{
				if(isSequence(aSortedCards)){
					iCardType=6;  //顺子
					bIsValid=true;
				}else{
					iCardType=15;
					bIsValid=false;
				}
			}
		}
		break;
	case(6):
		if(isDoubleSquence(aSortedCards)){
			iCardType=7;  //姐妹对
			bIsValid=true;
		}else{
			if(isTriSequence(aSortedCards)){
				iCardType=8;  //姐妹对
				bIsValid=true;))
			}else{
				if((isFour(aSortedCards[0],aSortedCards[1],aSortedCards[2],aSortedCards[3])
						&&isTwo(aSortedCards[4],aSortedCards[5]))
					||(isFour(aSortedCards[4],aSortedCards[5],aSortedCards[2],aSortedCards[3])
						&&isTwo(aSortedCards[0],aSortedCards[1]))){
					iCardType=12;  //4-2
					bIsValid=true;
				}else{
					if(isSquence(aSortedCards)){
						iCardType=6;  //顺子
						bIsValid=true;
					}else{
						iCardType=15;
						bIsValid=false;
					}
				}
					
			}
		}
		break;
	case(7):
		if(isSquence(aSortedCards)){
			iCardType=6;  //顺子
			bIsValid=true;
		}else{
			if((isFour(aSortedCards[0],aSortedCards[1],aSortedCards[2],aSortedCards[3])
					&&isThree(aSortedCards[4],aSortedCards[5],aSortedCards[6]))
				||(isFour(aSortedCards[4],aSortedCards[5],aSortedCards[6],aSortedCards[3])
					&&isThree(aSortedCards[0],aSortedCards[1],aSortedCards[2]))){
				iCardType=13;  //4-3
				bIsValid=true;
			}else{
				iCardType=15;
				bIsValid=false;				
			}
		}
		break;
	default:
		if(isDoubleSquence(aSortedCards)){
			iCardType=7;  //姐妹对
			bIsValid=true;
		}else{
			if(isTriSequence(aSortedCards)){
				iCardType=8;  //姐妹对
				bIsValid=true;))
			}else{
				if(isSquence(aSortedCards)){
					iCardType=6;  //顺子
					bIsValid=true;
				}else{
					iCardType=15;
					bIsValid=false;
				}	
			}
		}
		break;
		
	}
	return bIsValid,iCardType
	
}

function isTwo(Card0,Card1){
	if(Cards0[2]==Card1[2])return true;
	return false;
}

function isJokers(Card0,Card1){
	if(Cards0[2]+Card1[2]==35)return true;
	return false;
}

function isThree(Card0,Card1,Card2){
	if((Cards0[2]==Card1[2])&&(Cards2[2]==Card1[2]))return true;
	return false;
}

function isFour(Card0,Card1,Card2,Card3){
	if((Cards0[2]==Card1[2])&&(Cards2[2]==Card1[2])&&(Cards3[2]==Card1[2]))return true;
	return false;
}

/*
 * 顺子
 

function isSequence(Cards){
	var aSortedCards=sortCards(Cards)
	for(var i=0;i<aSortedCards.length-1;i++){
		if(aSortedCards[i+1][2]!=aSortedCards[i][2]+1)return false;
	}
		
	return true
}

/*
 * 姐妹对
 
function isDoubleSequence(Cards){
	if(Cards.length%2!=0)return false;
	var aSortedCards=sortCards(Cards)
	for(var i=0;i<aSortedCards.length;i=i+2){
		if(!isTwo(aSortedCards[i],aSortedCards[i+1]))return false;
	}
	for(var i=0;i<aSortedCards.length-2;i=i+2){
		if(aSortedCards[i+2][2]!=aSortedCards[i][2]+1)return false;
	}
	return true
}

/*
 * 三姐妹
 
function isTriSequence(Cards){
	if(Cards.length%3!=0)return false;
	var aSortedCards=sortCards(Cards)
	for(var i=0;i<aSortedCards.length;i=i+3){
		if(!isThree(aSortedCards[i],aSortedCards[i+1],aSortedCards[i+2]))return false;
	}
	for(var i=0;i<aSortedCards.length-3;i=i+3){
		if(aSortedCards[i+3][2]!=aSortedCards[i][2]+1)return false;
	}
	return true
}*/

function addCardToHtml(card){
	$('#Cards').append('<div id='+card.sId 
		+ ' class="Card"><div class="Flip"><div class="Back '
		+ card.sSuit + ' '+ card.sName + '" value=' + card.iPoint
		+'></div>' +'<div class="Front"></div></div></div>')		
	var c = $($('#Cards .Card').last())
	c.css({
		left : $('#Shoe').offset().left,
		top : $('#Shoe').offset().top,
		zIndex : 15
	})
	if (Modernizr.csstransforms) {
		c.rotate(parseInt($('#Shoe').rotate()))
		c.scale(0.75)
		c.css({
			width : c.width() * 2,
			height : c.height() * 2,
			marginLeft : -c.width() * 0.5,
			marginTop : -c.height() * 0.5
		})
	}
	return c;
}

function getSelectedCardsFromHtml(){
	var cards=$("#Cards .Card.selected");
	var selectedCards=Cards.createNew([]);
	for(var i=0;i<cards.length;i++){
		var c=cards[i]
		var sId=$(c).attr("id");
		selectedCards.addCard(DDZ.playersCards[0].getCard(sId))
	}
	return selectedCards;
}


function init(){
	$('#Shoe').rotate(385);
	hud()
	DDZ.deck=Deck.createNew(1);
	DDZ.deck.init();
	setTimeout(function() {
		DDZ.deck.shuffle();
		}, 250);

	$('.help').hide()
	$('.setup').hide()
	$(".offline").hide()
	if(localStorage.getItem("DouDiZhu")){
		var datajson=localStorage.getItem("DouDiZhu");
		var data=JSON.parse(datajson);
		loadconfig(data)
	}
	DDZ.playedCards=Cards.createNew([]);
	DDZ.cards1=Cards1.createNew([]);
}

function hud() {
	var ns = 0.85
	var os = 1
	$('#Shoe').click(function(e) {
		if (!GAME.playing) {
			$('#Next').trigger('click')
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
		
	
	$('.Player').click(function(e) {
			var playerid=$(this).attr("id")
			if(!GAME.playing){
				broadcast({"Player":playerid,"sender":GAME.mypeerid})
			}
			playerclick(playerid)
			
	}).hover(function() {
		$(this).stop().animate({
			scale : os + 0.15
		}, 250);
	}, function() {
		$(this).stop().animate({
			scale : ns + 0.15
		}, 125);
	})
	
	$("#Table").click(function (event) {
	     message("body click")
	     playCards()
	});
	
}

function playCards(){
	var cards=getSelectedCardsFromHtml();
	if(cards.aCards.length==0)return;
	if(cards.getCardsType()[0]==0){
		message("你选的牌不合规！请重新选择")
		return
	}
	placeCardsToTable(cards);
	DDZ.playersCards[0].removeCards(cards);
	DDZ.playedCards.addCards(cards);

	return
}

function placeCardsToTable(cards){
	for(var i=0;i<cards.aCards.length;i++){
		var card=cards.aCards[i];
		
		var c=$("#"+card.sId);
		c.removeClass("selected")
		var cleft=i*30
		var ctop=-250
		
		if(DDZ.iOrientation==0){  //树直
			cleft=(i%2)*300+120
			ctop = Math.floor(i/2)*300-150
		}
		c.animate({
			left:cleft,
			top:ctop,
			rotate:0,
			scale:DDZ.iScale*0.75
			},300,
			function(e){
				doflip($(this))
			}).unbind('click');
	}
}

function action(entity, a) {
	switch (a) {
	case ('Redo'):
		Redo(entity)
		broadcast({"action":"Redo","sender":GAME.mypeerid})
		break
	case ('Next'):
		deal();
		break
	case ('Auto'):
		Auto(entity)
		broadcast({"action":"Auto","sender":GAME.mypeerid})
		break
	case ('Start'):
		Start(entity)
		break;
	case ('Help'):
		$('.help').toggle()
		$('#Cards').toggle()
		$('#Operators').toggle()
		break;
	case ('Setup'):
		$('.setup').toggle()
		$('#Cards').toggle()
		$('#Operators').toggle()
		/*if(GAME.mypeerid==""){
			roominit()
		}else{
			leaveroom()
		}*/
			
		break;
	case("OK"):
		var player1name=$("#player1name").attr("value")
		var player2name=$("#player2name").attr("value")
		var roomid=$("#roomid").attr("value")
		var isonline=$("#online").attr("checked")
		data={"isonline":isonline,"player1name":player1name,
				"player2name":player2name,"roomid":roomid}
		localStorage.setItem("Game24",JSON.stringify(data));
		loadconfig(data)
		
		$('.setup').hide()
		$('#Cards').show()
		$('#Operators').show()
		break;
	case("Cancel"):
		$('.setup').hide()
		$('#Cards').show()
		$('#Operators').show()
		break;
	default:
		break
	}
}

function loadconfig(data){
	GAME.roomid=data.roomid;
	GAME.mynickname=data.player2name;
	$("#player1 .playername").text(data.player1name);
	$("#player2 .playername").text(data.player2name);
	$("#player1name").attr("value",data.player1name);
	$("#player2name").attr("value",data.player2name);
	$("#roomid").attr("value",data.roomid)
	if(data.isonline){
		$("#online").attr("checked","checked")
		$(".offline").show()
	}else{
		$("#online").attr("checked","")
		$(".offline").hide()
	}
		
	if(data.isonline){
		roominit()
	}else{
		leaveroom()
	}
}


function deal(){

	if(DDZ.isPlaying==true)
		return
	$("#Cards .Card").remove();
	DDZ.playersCards=[];
	DDZ.playersCards[0]=DDZ.deck.pickCards(18);
	DDZ.playersCards[0].sort();
	layout();
}

function doflip(c){
	c.find('.Back').show()
	c.find('.Front').hide()
}

function cardclick(cardid){
	var c=$("#"+cardid)
	DDZ.isPlaying=true;
	if(DDZ.isPlaying){
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

function layout(){
	
	for(var i=0;i<DDZ.playersCards[0].aCards.length;i++){
		var card=DDZ.playersCards[0].aCards[i];
		card.sId="Card"+i.toString();
		var c=addCardToHtml(card);
		
		var cleft=i*30
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
			},300,
			function(e){
				doflip($(this))
			}).click(function(e){
				var cardid=$(this).attr("id")
				/*if((DDZ.playing)&&(DDZ.inroom)&&(DDZ.currentPlayer==GAME.myplayerid)){
					broadcast({"Card":cardid,"sender":GAME.mypeerid})
					cardclick(cardid)
				}
				if((!GAME.inroom)&&(GAME.playing)){
					cardclick(cardid)
				}*/
				cardclick(cardid);
		})
		
	}
}

function message(str) {
	$('#Message').html(str).fadeIn(250, function() {
		setTimeout(function() {
			$('#Message').fadeOut(250)
		}, 1500)
	})
}

$(document).ready(
	function() {
		init()
		
	})
