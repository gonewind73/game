'''

 get(roomid,peerid,nickname)
 * return json{
 *   roomid:*,
 *   owner: peerid,
 *   roomsize: 2,
 *   peers{
 *       peerid:nickname,
 *       peerid:nickname,}
 *   }
'''

from threading import Timer
import time
import json
from poke import Deck,Card
from get24 import Point24
import sqlite3
import os

try:
    from config import dprint 
except:
    print("No dprint method defined,use default")
    def dprint(*args):
        print(*args)
        
'''
try:
    import redislite
    red = redislite.StrictRedis('redis.db')
except:
    dprint("no redislite,using redis!")
    import redis
    redishost='localhost'
    redisport=6379
    redispassword=''
    import os
    if 'OPENSHIFT_REDIS_HOST' in os.environ:
        dprint("on openshift redis!")
        redishost=os.environ['OPENSHIFT_REDIS_HOST']
        redisport=os.environ['OPENSHIFT_REDIS_PORT']
        redispassword=os.environ['REDIS_PASSWORD']
    red = redis.StrictRedis(host=redishost, port=redisport, password=redispassword,db=6)  
    #red = redis.StrictRedis(host='localhost', port=6379, db=6)  
'''
        
heartbeattime=60

'''
["playerid","nickname","wealth","password"]
{"playerid":"hgf","nickname":"baba","wealth":100,"password":1}
'''
'''
class DB(object):
    def __init__(self):
        pass
    
    def putUser2DB(self,userdict):

        if(red.exists(userdict["playerid"])):
            return -1,"User have existed!"
        if(not ("wealth" in userdict)):
            userdict["wealth"]=100
        red.hmset(userdict["playerid"],userdict)
        
        return 0,"Success!"
    
    def login(self,userdict):
        if(red.exists(userdict["playerid"])):
            dprint(red.hmget(userdict["playerid"], "password"),userdict["password"])
            if(red.hmget(userdict["playerid"], "password")[0].decode()==userdict["password"]):
                return 0
        return -1
    
    def getPlayerDict(self,playerid):
        fieldlist=["playerid","nickname","wealth"]
        resultlist=red.hmget(playerid, fieldlist)  #need decode to string
        resultdict={}
        for i in range(0,len(fieldlist)):
            if(resultlist[i]!=None):
                resultdict[fieldlist[i]]=resultlist[i].decode()
            else:
                resultdict[fieldlist[i]]=""
        return resultdict
    
    def update(self,userdict):
        red.hmset(userdict["playerid"],userdict)
        return 0,"Success!"
    
            
    def getPlayer(self,playerid):
        playerdict=self.getPlayerDict(playerid)
        return Player(playerid=playerdict["playerid"],nickname=playerdict["nickname"],
                      playertype=0,wealth=playerdict["wealth"])
'''
class DBSqlite(object):
    conn=None
    
    def __init__(self):
        #if(self.conn==None):
        #self.conn=sqlite3.connect('users.db')
        dbpath=os.getenv("DBPATH", "")
        self.conn=sqlite3.connect(dbpath+"users.db")
        
        if(not self.existTable("USERS")):
            self.conn.execute('''CREATE TABLE USERS
                           (ID  TEXT PRIMARY KEY     NOT NULL,
                           NAME           TEXT    NOT NULL,
                           WEALTH         INT     NOT NULL,
                           PASSWORD       TEXT
                           );''')
        return
    
    '''
    def close(self):
        self.conn.commit();
        self.conn.close();
    '''
    
    def existTable(self,tablename):
        cur=self.conn.execute("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='"+tablename+"'")
        for row in cur:
            if row[0]==0:
                return False
        return True
    
    def existUser(self,userid):
        cur=self.conn.execute("SELECT count(*) FROM USERS WHERE ID='"+userid+"'")
        for row in cur:
            if row[0]==0:
                return False
        return True
        
    def addUser(self,userdict):

        self.conn.execute("INSERT INTO USERS (ID,NAME,WEALTH,PASSWORD) VALUES ('"  \
            +userdict["playerid"]+"','"+userdict["nickname"]+"',"+str(userdict["wealth"]) +",'"+userdict["password"]\
            +"' )");
        self.conn.commit()
        return
        
    def getUser(self,userid):
        cur=self.conn.execute("SELECT ID,NAME,WEALTH,PASSWORD FROM USERS WHERE ID='"+userid+"'")
        for row in cur:
            userdict={"playerid":row[0],
                      "nickname":row[1],
                      "wealth":row[2],
                      "password":row[3]}
            return userdict
        return None
    
    def updateUser(self,userdict):
        last=" "
        if(self.existUser(userdict["playerid"])):
            sqlstring="UPDATE USERS SET "
            if "nickname" in userdict:
                sqlstring += "NAME = '"+userdict["nickname"]+"'"
                last=","
            if "wealth" in userdict:
                sqlstring += last+"WEALTH = "+str(userdict["wealth"])
                last=","
            if "password" in userdict:
                sqlstring +=last+ "PASSWORD = '"+userdict["password"]+"'"    
            sqlstring+=" where ID='"+userdict["playerid"]+"';"
            self.conn.execute(sqlstring);
            self.conn.commit()
        else:
            self.putUser2DB(userdict)
        return
        
    def putUser2DB(self,userdict):
        if(self.existUser(userdict["playerid"])):
            return -1,"User have existed!"

        if not "nickname" in userdict:
            userdict["nickname"]=userdict["playerid"]
        if(not ("wealth" in userdict)):
            userdict["wealth"]=100
        if not "password" in userdict:
            userdict["password"]=""           
        self.addUser(userdict)
        return 0,"Success!"
    
    def login(self,userdict):
        dbuser=self.getUser(userdict["playerid"])
        if dbuser!=None :
            if dbuser["password"]==userdict["password"]:
                return 0
        return -1
    
    def getPlayerDict(self,playerid):
        return self.getUser(playerid)
    
    def update(self,userdict):
        self.updateUser(userdict)
        return 0,"Success!"
    
            
    def getPlayer(self,playerid):
        playerdict=self.getPlayerDict(playerid)
        return Player(playerid=playerdict["playerid"],nickname=playerdict["nickname"],
                      playertype=0,wealth=playerdict["wealth"])
        
class Player(object):
    HEART_BEAT=60
    def __init__(self,playerid,nickname="",playertype=0,wealth=100):
        self.playerId=playerid
        if(nickname==""):
            nickname=playerid
        self.nickname=nickname
        self.wealth=wealth
        self.hbtimer=None
        self.playerType=playertype  # 1 human  2 automan 3 online?  
        self.cards=None
        self.startBeat()
        self.messageBox=MessageBox()
        pass
    
    def create(self,gametype):
        if(gametype=="ddz"):
            return DDZPlayer()
        return None
        
    
    def startBeat(self):
        self.heartBeats=self.HEART_BEAT    # <0 no beat
        if(self.hbtimer==None):
            self.hbtimer=Timer(10,self.beat)
            self.hbtimer.start()
        
    def beat(self):
        self.heartBeats-=10;
        dprint(self.playerId+" second:",self.heartBeats)
        if(self.heartBeats>0):
            #self.hbtimer.cancel();
            self.hbtimer=Timer(10,self.beat)
            self.hbtimer.start()
        else:
            dprint(self.playerId+" timeout!")
            self.hbtimer=None
    
    def isAlive(self):
        return self.heartBeats>0
    
    def getPlayerInfo(self):
        return {"playerid":self.playerId,"nickname":self.nickname,"wealth":self.wealth}
    
    def pickCards(self,Deck,count):
        pass
    
    def equal(self,p):
        if((self.playerId==p.playerId) and (self.nickname == p.nickname)
           and (self.wealth==p.wealth)):
            return True
        return False
                       
    def update(self,playerdict):
        if(self.equal(Player(playerid=playerdict["playerid"],nickname=playerdict["nickname"],
                      playertype=0,wealth=playerdict["wealth"]))):
            return False
        self.playerId=playerdict["playerid"]
        self.nickname=playerdict["nickname"]
        self.wealth=playerdict["wealth"]
        return True
    
class Players(object):    
    def __init__(self):
        self.players=[]
        
    def index(self,playerid):
        for i in range(0,len(self.players)):
            if(self.players[i].playerId==playerid):
                return i
        return -1
    
    def pack(self):
        for p in self.players:
            if(not p.isAlive()):
                self.broadcast({"leave":p.playerId}, "system")
                self.players.remove(p)
        return len(self.players)
    
    def getPlayer(self,playerid):
        for i in range(0,len(self.players)):
            if(self.players[i].playerId==playerid):
                return self.players[i]
        return None
    
    def addPlayer(self,player):
        p=self.getPlayer(player.playerId)
        if(p!=None):
            if(not p.equal(player)):
                p.update(player.getPlayerInfo())
        else:
            p=player
            self.players.append(p)
        p.startBeat()
        return
    
    def removePlayer(self,player):
        p=self.getPlayer(player.playerId)
        self.players.remove(p)
        return 
        
    def getPlayersDict(self):
        playersdict={}
        for p in self.players:
            if(p.isAlive()):
                playersdict[p.playerId]=p.getPlayerInfo()
        return playersdict
    
    def broadcast(self,content,sender):
        for p in self.players:
            if(p.isAlive()):
                p.messageBox.pushMessage(content,sender,time.time())
        pass

class MessageBox(object):
    def __init__(self):
        self.lastId=0
        self.messageBox=[]
    
    def pushMessage(self,content,sender,sendtime):
        dprint("message pushed! ",content,sender)
        self.messageBox.append(Message(self.lastId,content,sender,sendtime).dump())
        self.lastId+=1
        return
    
    def pushContent(self):
        pass
    
    def popMessage(self):
        return self.messageBox.pop(0)

class Message():
    '''
        /* content is the data which is dict
     * data={"data":data,"sender":c}
     * data.data is json {"name:value}
     * 
     * action:point0...point3  when auction
     * hand:{P1:...}       when play
     * cards:{P1:... ,P2:... P3:.. LO:...}  when deal 
     * message:"hello"  ; message 
     * sender:mynickname
     * senderid: just for repeat or lost
     * enter:  ; new arrive
     * msg: messagetext ;
     * table:    ;
     */

    '''
    def __init__(self,messageid,content,sender,sendtime):
        self.messageId=messageid
        self.content=content
        self.sender=sender
        self.sendtime=sendtime
        
    def dump(self):
        senddict=self.content
        senddict["sender"]=self.sender
        return json.dumps(senddict)
    

    
    
class Table(Players):
    def __init__(self,tableId,name="",tabletype="g24p",tablesize=2):
        self.tableId=tableId
        if(name==""):
            name=tableId
        self.name=name
        self.tableType=tabletype
        self.tableSize=tablesize
        self.owner=None   #id
        Players.__init__(self)
        self.deck=None
        self.stage=0  # 0 waiting  >0  playing 1 bidding  2 playing maybe 3
        self.lastcards=None
        #self.db=DBSqlite()
        
        
    def enter(self,player):
        count=self.pack()

        p=self.getPlayer(player.playerId)
        if(p!=None):
            p.startBeat()
        else:
            if(count>=self.tableSize):
                return False,{"returncode":40002,"errormessage":"The table is full."};            # over max    
            self.addPlayer(player)
            self.broadcast({"enter":player.nickname}, "system")
        self.getOwner()
        return True,self.getTableInfo()
    
    def leave(self,player):
        index=self.index(player.playerId)
        if(index>=0):
            self.broadcast({"leave":player.nickname}, "system")
            del self.players[index]
        self.getOwner()
        return True,{}
        
    
    def getOwner(self):
        for p in self.players:
            if(p.isAlive()):
                self.owner=p
                return p.playerId
    

    
    def getTableInfo(self):
        self.pack()
        playersdict=self.getPlayersDict()
        
        if(self.owner==None):
            owner=""
        else:
            owner=self.owner.playerId
                             
        tableinfo={"tableid":self.tableId,
                   "tabletype":self.tableType,
              "owner":owner,
              "tablesize":self.tableSize,
              "players":playersdict,
            }
        
        return tableinfo
    
    def getPlayInfo(self):
        if(self.stage==0):
            return self.getTableInfo()
        elif(self.stage>0):
            return {"todo":"todo"}
        pass
    
    def processMessage(self,msgdict,sender):
        for action in msgdict:
            if(action=="deal"):
                if(self.deck==None):
                    self.deck=Deck(1,points=[1,2,3,4,5,6,7,8,9,10,10,10,10,10,10])
                if(self.deck.getLen()<4):
                    self.deck.deal()
                cards=self.deck.pickCards(4)
                self.lastcards=cards
                self.broadcast({"cards":cards.dump()},"system")
            elif(action=="unselected"):
                self.broadcast({action:msgdict[action]}, sender.playerId)
            elif(action=="selected"):
                self.broadcast({action:msgdict[action]}, sender.playerId)
            elif(action=="playerraced"):
                self.broadcast({action:msgdict[action]}, sender.playerId)
            elif(action=="operator"):
                self.broadcast({action:msgdict[action]}, sender.playerId)
            elif(action=="redo"):
                if(self.lastcards!=None):
                    self.broadcast({"cards":self.lastcards.dump()}, sender.playerId)
                else:
                    self.broadcast({"message":"not card to redo!"},sender.playerId)
            elif(action=="auto"):
                if(self.lastcards!=None):
                    p24=Point24(self.lastcards.getPoints())
                    self.broadcast({"answer":p24.run()}, sender.playerId)
                else:
                    self.broadcast({"message":"not card to answer!"},sender.playerId)
                #self.broadcast({"message":"not support now!"}, "system")
                #self.broadcast({"answer":autoexpr}, "system")
            elif(action=="answer"):
                self.broadcast({action:msgdict[action]}, sender.playerId)
            elif(action=="wealth"):
                sender.wealth=msgdict[action];
                self.broadcast({"tableinfo":self.getTableInfo()}, "system")
                db=DBSqlite()
                db.update(sender.getPlayerInfo())
            elif(action=="message"):
                self.broadcast({"message":msgdict[action]},sender.playerId)
            elif(action=="sender"):
                pass  #todo
            else:
                self.broadcast({"message":"not support now!"},sender.playerId)
                pass
            
                
        return msgdict
        
    
        
class Hall(Players):
    '''
    hallid = ddz g24p
    '''
    def __init__(self,hallId,name="",hallsize=6):
        self.hallId=hallId
        if(name==""):
            name=hallId
        self.name=name
        self.hallSize=hallsize
        self.tables=[]
        Players.__init__(self)
        #self.players=Players();
        for i in range(0,hallsize):
            self.tables.append(Table(str(i),tabletype=hallId))
        
    
    def index(self,tableid):
        for i in range(0,len(self.tables)):
            if(self.tables[i].tableId==tableid):
                return i
        return -1
    
    def getTable(self,tableid):
        index=self.index(tableid)
        if(index>=0):
            return self.tables[index]
        else:
            return None
    
    def addTable(self,table):
        index=self.index(table.tableId)
        if(index<0):
            self.tables.append(table)
            index=self.length()-1
        return 
    
    def pack(self):
        for t in self.tables:
            if(t.pack()==0):
                self.tables.remove(t)
        return len(self.tables)
    
    def broadcast(self,content,sender):
        for t in self.tables:
            t.broadcast(content,sender)
    
    def getHallInfo(self):
        tables={}
        for t in self.tables:
            tables[t.tableId]=t.getTableInfo()
        
        hallinfo={"hallid":self.hallId,
              "hallsize":self.hallSize,
              "tables":tables,
            }
        return hallinfo     

'''
Game
 post action=registe with form { username=,password=,email=}
 return playerid
 
 post action=login with form{ username= password=}
 return data={playerid,nickname}
 session + playerid
 
 post action=enterhall&hallid=ddz  
 return hallinfo
 session + hallid
 
 post action=intable&tableid=1 with data={playerid:test,nickname:name}
 return tableinfo
 session + tableid
 
 post action=sendmessage with data {"to":  "from": "content": }
 return messageid
 
 get action=getmessage&lastmessageid=1
 return messageid>lasterid
 
 get action=synchronize
 return tableinfo with cards info & lasterHander 
 
 v2:
 action:
     login
     register
     intable
     data
     
 
 response:
     returncode:
     codehint:
     data:
     
 
 
'''       
        
class Game(object):
    
    def __init__(self):
        self.halls={}
        #self.db=DBSqlite()
        #self.deck=Deck(1)
        
    def addHall(self,hallid,hallname):
        hall=Hall(hallid,hallname,6)
        self.halls[hallid]=hall
        return hall
    
    def getitemFromDict(self,fromdict,field,defvalue=None):
        if field in fromdict:
            return(fromdict[field])
        else:
            return(defvalue)
        
    def getDictFromDict(self,fromdict,fields):
        tempdict={}
        for f in fields:
            tempdict[f]=self.getitemFromDict(fromdict, f)
        return tempdict
        
    def process(self,request,session):  
        action = request.args['action']  
        if(action=="regist"):
            userdict=self.getDictFromDict(request.form, ["playerid","nickname","password","email"])
            rtc,rtm=DBSqlite().putUser2DB(userdict)
            return {"returncode":rtc,"errormessage":rtm,"playerid":userdict["playerid"]},session
        elif(action=="login"):
            userdict=self.getDictFromDict(request.form, ["playerid","password"])
            dprint(userdict)
            db=DBSqlite()
            if(db.login(userdict)==0):
                session["playerid"]=userdict["playerid"]
                return {"returncode":0,"errormessage":"success!",
                        "player":db.getPlayerDict(userdict["playerid"])},session
            else:
                return {"returncode":-1,"errormessage":"something error!"},session
        elif(action=="enterhall"):
            hallid=request.args["hallid"]
            playerid=session["playerid"]
            if(hallid in self.halls):
                hall=self.halls[hallid]
            else:
                hall=self.addHall(hallid, hallid)
            player=hall.getPlayer(playerid);
            if(player==None):
                player=DBSqlite().getPlayer(playerid)
                hall.addPlayer(player)
            session["hallid"]=hallid
            #session["playerid"]=playerid
            return {"returncode":0,"errormessage":"success!","hallinfo":hall.getHallInfo()},session
        elif(action=="intable"):
            #hallid=request.form["hallid"]
            tableid=request.form["tableid"]
            #playerid=session["playerid"]
            hallid=session["hallid"]
            dprint(hallid,tableid,request.form)
            hall=self.halls[hallid]
            table=hall.getTable(tableid)
            if(table==None):
                return {"returncode":40001,"errormessage":"table not found!"},session
            playerdict=request.form
            #player=table.getPlayer(playerdict["playerid"]);
            #if(player==None):
            player=hall.getPlayer(playerdict["playerid"])
            ok,rinfo=table.enter(player)
            
            dprint("process intable ",ok,rinfo)
            if(ok):
                session["tableid"]=tableid
                return {"returncode":0,"errormessage":"success!","tableinfo":rinfo},session;
            else:
                return rinfo,session;
        elif(action=="tableinfo"):
            hallid=session["hallid"]
            tableid=session["tableid"]
            playerid=session["playerid"]
            dprint(hallid,tableid,playerid)
            hall=self.halls[hallid]
            table=hall.getTable(tableid)
            if(table==None):
                return {"returncode":40001,"errormessage":"table not found!"},session
            rinfo=table.getTableInfo()
            dprint("tableinfo ",rinfo)
            return {"returncode":0,"errormessage":"success!","tableinfo":rinfo},session;
        elif(action=="leavetable"):
            hallid=session["hallid"]
            tableid=session["tableid"]
            playerid=session["playerid"]
            dprint("leavetable:",hallid,tableid,playerid)
            hall=self.halls[hallid]
            table=hall.getTable(tableid)
            if(table==None):
                return {"returncode":40001,"errormessage":"table not found!"},session
            playerdict=request.form
            player=table.getPlayer(playerid);
            if(player==None):
                return {"returncode":50001,"errormessage":"player not found!"},session
            
            ok,rinfo=table.leave(player)
            return {"returncode":0,"errormessage":"success!"},session;
        elif(action=="sendmessage"):
            '''
            * msgdict = { action:actiondata}
            '''
            msgdict=request.form
            hallid=session["hallid"]
            tableid=session["tableid"]
            playerid=session["playerid"]
            dprint("sendmessage:",hallid,tableid,playerid)
            hall=self.halls[hallid]
            table=hall.getTable(tableid)
            player=table.getPlayer(playerid);
            if(player==None):
                return {"returncode":50001,"errormessage":"player not found!"},session
            rtmdict=table.processMessage(msgdict,player)
            return {"returncode":0,"errormessage":"success!"},session
        elif(action=="getmessage"):
           
            hallid=session["hallid"]
            tableid=session["tableid"]
            playerid=session["playerid"]
            hall=self.halls[hallid]
            table=hall.getTable(tableid)
            if(table==None):
                return {"returncode":40001,"errormessage":"table not found!"},session
            player=hall.getPlayer(playerid)
            ok,rinfo=table.enter(player)
            msgdict=request.form
            rtmdict=table.processMessage(msgdict,player)
            #return {"returncode":0,"errormessage":"success!",
            #        "tableinfo":rinfo,"data":self.getMessage3(hallid, tableid, playerid)},session
            return {"data":self.getMessage3(hallid, tableid, playerid)},session
            
        elif(action=="synchronize"):
            hallid=session["hallid"]
            hall=self.halls[hallid]
            tableid=session["tableid"]
            table=hall.getTable(tableid)
            playerid=session["playerid"]
            playinfo=table.getPlayInfo()
            return playinfo,session
                
        return {"returncode":60001,"errormessage":"unknown action."},session
    
    def getMessage(self,hallid,tableid,playerid):
       
        hall=self.halls[hallid]
        player=hall.getPlayer(playerid)
        if(player == None):
            #player=hall.getPlayer(playerid)
            #time.sleep(1)
            return "data:{message:player not ready!}\n\n"
        
        msgbox=player.messageBox
        while(True):
            if(len(msgbox.messageBox)>0):
                msg=msgbox.popMessage()
                yield 'data: %s\n\n' % msg 
            else:
                time.sleep(0.1)
        return
    
    def getMessage2(self,hallid,tableid,playerid):
       
        hall=self.halls[hallid]
        player=hall.getPlayer(playerid)
        if(player == None):
            #player=hall.getPlayer(playerid)
            #time.sleep(1)
            return "data:{message:player not ready!}\n\n"
        
        msgbox=player.messageBox
        while(True):
            if(len(msgbox.messageBox)>0):
                msg=msgbox.popMessage()
                dprint("poll msg: ",msg)
                return '%s' % msg 
            else:
                time.sleep(0.1)
        return
    
    #return message immediate
    def getMessage3(self,hallid,tableid,playerid):
        hall=self.halls[hallid]
        player=hall.getPlayer(playerid)
        if(player == None):
            #player=hall.getPlayer(playerid)
            #time.sleep(1)
            return "{message:player not ready!}"
        
        msgbox=player.messageBox
        if(len(msgbox.messageBox)>0):
            msg=msgbox.popMessage()
            return '%s' % msg 
        return ""
    
class DDZPlayer(Player):
    def __init__(self,playerid,nickname,wealth):
        self=Player()
        self.role=""
         
        pass
 
    def __str__(self):  
        return "DDZ"  
    
    def setRole(self,role):
        self.role=role
        return
    
    def autoPlay(self):
        pass
    
    def playHand(self,lasthand):
        pass
    
    def autoPoint(self):
        pass
    
    
class room(object):
    roomid=""
    owner=""
    roomsize=2
    users=[]  #be(peerid,nickname)'s array
    usertimes=[]  #every 5s will check times,if 10s no beat,will remove user
    roomtimer=None;
    def __init__(self,roomid="",users=[],messages=[],roomsize=2):
        self.roomid=roomid[:]
        self.roomsize=roomsize
        self.users=users[:]   #be(peerid,nickname)'s array
        self.usertimes=[]  #every 5s will check times,if 10s no beat,will remove user
        self.roomtimer=None;
        
        if(len(self.users)>0):
            dprint(self.users[0][1],".. 创建房间",self.roomid);
            
        for i in range(0,len(self.users)):
            self.usertimes.append(heartbeattime)
        
        self.messages=messages[:]
        self.messageids=[]
        self.currentid=0
        self.setowner()
        if(self.roomtimer==None):
            self.roomtimer=Timer(5,self.timercheck)
            self.roomtimer.start()
            dprint("starttimer")       
            
    def setowner(self):
        if(len(self.users)>0):
            self.owner=self.users[0][0]
        
    def getroomid(self):
        return self.roomid
    
    def getroominfo(self):
        peers={}
        for u in self.users:
            peers[u[0]]=u[1]
        
        roominfo={"roomid":self.roomid,
              "owner":self.owner,
              "roomsize":self.roomsize,
              "peers":peers,
            }
        return roominfo
    
    def subscribe(self,user):
        try:
            index=self.users.index(user)
            self.usertimes[index]=heartbeattime
        except:
            self.users.append(user)
            self.usertimes.append(heartbeattime)
            dprint(user[1],"enter room! ",self.getroominfo())
        self.setowner()

        return True,"Success!"
        
    def timercheck(self):
        #self.roomtimer.cancel()
        dprint("5s timer")
        for i in range(0,len(self.usertimes)):
            dprint(i,self.usertimes[i])
            self.usertimes[i]-=5
        for i in range(len(self.usertimes)-1,-1,-1):
            if(self.usertimes[i]<0):
                username=self.users[i][1]
                del self.users[i]
                del self.usertimes[i]
                dprint(username,"timeout! ",self.getroominfo())
                
        
        self.roomtimer=Timer(5,self.timercheck)       
        self.roomtimer.start()        
            
        
    def unsubscribe(self,user):
        try:
            index=self.users.index(user)
            del self.usertimes[index]
            del self.users[index]
            self.setowner()
            dprint(user[1],"leave room! ",self.getroominfo())
            return True,"Success!"
        except:
            return False,"Failue:User not exist!"
        
        #self.users.remove(user)
        
        
        
    def publish(self,message):
        self.messages.append(message)
        self.messageids.append(str(self.currentid))
        self.currentid+=1
        
        
    def getmessage(self,index=0):        
        if((len(self.messages))>0):
            message=(self.messages[0])[:]
            messageid=(self.messageids[0])[:]
            dprint("getmessage 1")
            dprint(message)
            return(message,messageid)
        return("","0")
    
    def delmessage(self,messageid):
        try:
            index=self.messageids.index(messageid)
            del self.messages[index]
            del self.messageids[index]
            return True
        except:
            return False
        
        

class rooms(object):
    
    def __init__(self,roomlimit=100):
        self.roomlimit=roomlimit
        self.rooms=[]
        
    def addroom(self,roomid,roomsize):
        r=room(roomid,[],roomsize)
        self.rooms.append(r)
        return
        
    def getroom(self,roomid):
        dprint(len(self.rooms))
        for i in range(0,len(self.rooms)):
            r=self.rooms[i]
            
            if(r.roomid==roomid):
                return(r)
        return(0)
        
    def getroominfo(self,roomid):
        r=self.getroom(roomid)
        if(r!=0):
            return self.getroom(roomid).getroominfo()
        else:
            return {}
            
        
    def subscribe(self,roomid,user,peerid):
        for r in self.rooms:
            if(r.roomid==roomid):
                return(r.subscribe((peerid,user)))
        if(len(self.rooms)<self.roomlimit-1):
            r=room(roomid,[(peerid,user)])
            self.rooms.append(r)
            return True,"Success!"
        return False,"no more room for u!"
    
    def unsubscribe(self,roomid,user,peerid):
        for r in self.rooms:
            if(r.getroomid()==roomid):
                r.unsubscribe((peerid,user))
                if(len(r.users)==0):
                    self.rooms.remove(r)
                return True,"Success!"
        return False,"Failue:Room not exist! "
        
    def getmessage(self,roomid):
        for r in self.rooms:
            if(r.roomid==roomid):
                return r.getmessage()
        return ""
