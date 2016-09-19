'''
Created on 2016年8月31日

@author: heguofeng
'''
import random


SUITS=['Spades','Diamonds','Hearts','Clubs']
NAMES=['Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
       'Jack','Queen','King','LittleJoker','BigJoker']
POINTS=[14,16,3,4,5,6,7,8,9,10,11,12,13,80,90]

class Deck(object):
    '''
    classdocs
    '''

    def __init__(self,count,suits=SUITS,names=NAMES,points=POINTS):
        '''
        Constructor
        count is the quantity of decks
        
        '''
        self.count=count
        self.suits=suits
        self.names=names
        self.points=points
        self.reload()
        self.shuffle()
    
    def reload(self):
        suitmap="sdhcj";
        namemap="123456789TJQKLB";
        self.deck=[]
        for d in range(0,self.count):
            for s in range(0,len(suitmap)-1):
                for n in range(0,len(namemap)-2):
                    self.deck.append(Card(self.suits[s],self.names[n],self.points[n],""+str(d)+suitmap[s]+namemap[n]));
            self.deck.append(Card("",self.names[13],self.points[13],""+str(d)+"jL"));
            self.deck.append(Card("",self.names[14],self.points[14],""+str(d)+"jB"));
        return
            
        
    def getLen(self):
        return len(self.deck)
    
    def shuffle(self):
        decklen=len(self.deck)
        #print("shuffle:",decklen)
        for i in range(0,7*decklen):
            ci1=int(decklen*random.random())
            ci2=int(decklen*random.random())
            #print("shuffle:",ci1,ci2)
            temp=self.deck[ci1]
            self.deck[ci1]=self.deck[ci2]
            self.deck[ci2]=temp
        return
    
    def deal(self):
        self.reload()
        self.shuffle()
        return
    
    def pickCards(self,length):
        cards=Cards()
        for i in range(0,length):
            c=self.deck.pop()
            if(c==None):
                return None
            cards.addCard(c)
        return cards
     
    
        
class Card(object):
    '''
    Card
    '''
    
    
    def __init__(self,suit,name,point,cardid):
        '''
        init, 
        '''
        self.suit=suit
        self.name=name
        self.point=point
        self.cardid=cardid
        
    def compare(self,card):
        '''
        compare to given card,if less than given card return <0 
        '''
        return(self.point-card.point)
    
    def __cmp__(self, other):
        return(self.compare(other))
    
    def toString(self):
        return "todo"
        
    def dump(self):
        '''
        suitmap={'Spades':'s','Diamonds':'d','Hearts':'h','Clubs':'c','':'j'};
        namemap={'Ace':'1','Two':'2','Three':'3','Four':'4','Five':'5',
                        'Six':'6', 'Seven':'7','Eight':'8', 'Nine':'9','Ten':'T',
                        'Jack':'J','Queen':'Q','King':'K','LittleJoker':'L',
                        'BigJoker':'B'    };
        return suitmap[card.sSuit]+namemap[card.sName];
        '''
        return self.cardid
    
    def load(self,ls):
        suitmap={'s':'Spades','d':'Diamonds','h':'Hearts','c':'Clubs','j':''};
        namemap={'1':'Ace','2':'Two','3':'Three','4':'Four','5':'Five',
                    '6':'Six', '7':'Seven','8':'Eight', '9':'Nine','T':'Ten',
                    'J':'Jack','Q':'Queen','K':'King','L':'LittleJoker',
                    'B':'BigJoker'};
        pointmap={'1':14,'2':16,'3':3,'4':4,'5':5,'6':6, '7':7,'8':8, 
                    '9':9,'T':10,'J':11,'Q':12,'K':13,'L':80,'B':90};
        self.cardid=ls
        self.suit=suitmap[ls[1]]
        self.name=namemap[ls[2]]
        self.point=pointmap[ls[2]]

class Cards(list):
    def __init__(self):
        list.__init__([]);
        return
    
    def addCard(self,card):
        self.append(card)
        return
    
    def addCards(self,beaddedcards):
        for c in beaddedcards:
            self.append(c)
            
    def removeCard(self,card):
        for c in self:
            if(c.cardid==card.cardid):
                self.remove(c)
        return
    
    def removeCards(self,cards):
        for c in cards:
            self.removeCard(c)
        return
    
    def empty(self):
        for c in self:
            self.remove(c)
        return
    
    def getCard(self,cardid):
        for c in self:
            if(c.cardid==cardid):
                return c;
        return None
    
    def getPoints(self):
        points=[]
        for i in range(0,len(self)):
            points.append(self[i].point)
        return points

    '''对子'''
    def isTwin(self):
        if((len(self)==2) and (self[0].point==self[1].point)):
            return True
        return False

    def isTri(self):
        if((len(self)==3) and (self[0].point==self[1].point)
           and (self[1].point==self[2].point)):
            return True
        return False
    
    def isFour(self):
        if((len(self)==4) and (self[0].point==self[1].point)
           and (self[1].point==self[2].point) and (self[2].point==self[3].point)):
            return True
        return False
    
    def isJokers(self):
        if(len(self)==2) and ((self[0].point+self[1].point)==(POINTS[13]+POINTS[14])):
            return True
        return False

    def isSequence(self):
        self.sort();
        for i in range(0,len(self)):
            if(self[i+1].point!=self[i].point+1):
                return False
        return True
            
    def splitHand(self):
        '''
        .把牌按点数分类，返回array of Cards of same point [Cards,Cards,...]
        '''
        self.sort()
        hands=[]
        tempHand=Cards()
        for i in range(0,len(self)):
            tempHand.addCard(self[i])
            if(i==len(self)-1):
                hands.push(tempHand)
            elif(self[i+1].point!=self[i].point):
                hands.push(tempHand)
                tempHand=Cards()
        return hands
    
    def dump(self):
        message=""
        for c in self:
            message=message+c.dump()+" "
        return message
    
    def load(self,dumpstring):
        self.empty()
        s=dumpstring.split(" ");
        for cs in s:
            self.push(Card.load(cs))
        return
    
    def getHandByTypePoint(self,handtype,point,level):
        '''
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
        '''
        pass
    
    def getHandByTypeMaxPoint(self,handtype,point,level):
        '''
                var hand;
                for(var i=POINTS.length-1;i>=0;i--){
                    if(POINTS[i]<point)break;
                    var hand=cards.getHandByTypePoint2(type,POINTS[i],0);
                    if(hand.length!=0)break;
                }
                return hand;
            };
        '''
        return None
    
class Hand(object):
    def __init__(self):
        pass
    
    