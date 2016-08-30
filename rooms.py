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

heartbeattime=30

class Player(object):
    HEART_BEAT=30
    def __init__(self,playerid,nickname="",playertype=0,wealth=100):
        self.playerId=playerid
        if(nickname==""):
            nickname=playerid
        self.nickname=nickname
        self.wealth=wealth
        self.playerType=playertype  # 1 human  2 automan 3 online?  
        self.startBeat()
        self.messageBox=MessageBox()
        pass
    
    def startBeat(self):
        self.heartBeats=self.HEART_BEAT    # <0 no beat
        if(self.hbtimer==None):
            self.hbtimer=Timer(5,self.beat)
            self.hbtimer.start()
        
    def beat(self):
        self.heartBeats-=5;
        if(self.heartBeats>0):
            self.hbtimer=Timer(5,self.beat)
        else:
            self.hbtimer=None
    
    def isAlive(self):
        return self.heartBeats>0
    

class MessageBox():
    def __init__(self):
        self.lastId=0
        self.messageBox=[]
    
    def pushMessage(self,content,sender,sendtime):
        self.messageBox.append(Message(self.lastId,content,sender,sendtime))
        self.lastId+=1
        return
    
    def pushContent(self):
        pass
    
    def popMessage(self):
        return self.messageBox.pop()

class Message():
    def __init__(self,messageid,content,sender,sendtime):
        self.messageId=messageid
        self.content=content
        self.sender=sender
        self.sendtime=sendtime
        pass

    
    
class Table(object):
    def __init__(self,tableId,name,tablesize=3):
        self.tableId=tableId
        self.name=name
        self.tableSize=tablesize
        self.owner=None
        self.players=[]
        
        
    def enter(self,player):
        count=self.pack()

        
        if(player.isAlive()):
            index=self.index(player.playerId)
            if(index>=0):
                self.players[index].startBeat()
            else:
                if(count>=self.tableSize):
                    return False,{"returncode":40002,"errormessage":"The table is full."};            # over max    
                self.players.append(player)
                self.broadcast(player.nickname+" is in table!", "system")
        self.getOwner()
        return True,self.getTableInfo()
    
    def leave(self,player):
        index=self.index(player.playerId)
        if(index>=0):
            self.broadcast(player.nickname+" leave the table!", "system")
            del self.players[index]
        self.getOwner()
        pass
    
    def getPlayer(self,playerid):
        index=self.index(playerid)
        if(index>=0):
            return self.players[index]
        return None
        
    def index(self,playerid):
        self.pack()
        for i in range(0,len(self.players)):
            if(self.players[i].playerId==playerid):
                return i
        return -1
    
    def pack(self):
        for p in self.players:
            if(not p.isAlive()):
                self.broadcast(p.nickname+" leave the table!", "system")
                self.players.remove(p)
        return len(self.players)
    
    def getOwner(self):
        for p in self.players:
            if(p.isAlive()):
                self.owner=p
                return p
    
    def broadcast(self,content,sender):
        self.pack()
        for p in self.players:
            if(p.isAlive()):
                p.messageBox.pushMessage(content,sender,time.time())
        pass
    
    def getTableInfo(self):
        self.pack()
        players={}
        for p in self.players:
            if(p.isAlive()):
                players[p.playerId]=p.name
        
        tableinfo={"tableid":self.tableId,
              "owner":self.owner.playerId,
              "tablesize":self.tableSize,
              "players":players,
            }
        
        return tableinfo
        
class Hall(object):
    def __init__(self,hallId,name="",hallsize=6):
        self.hallId=hallId
        if(name==""):
            name=hallId
        self.name=name
        self.hallSize=hallsize
        for i in range(0,hallsize):
            self.tables.append(Table(i.tostring()))
        
    
    def index(self,tableid):
        for i in range(0,self.length()):
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
              "hallsize":self.len(),
              "tables":tables,
            }
        return hallinfo     
    
'''
Game
 post action=login with form{ username= password=}
 return data={playerid,nickname}
 
 post action=enterhall&hallid=ddz  
 return hallinfo
 
 post action=intable&tableid=1&hallid=ddz with data={playerid:test,nickname:name}
 return tableinfo
 
 
'''       
        
class Game(object):
    
    def __init__(self):
        self.halls={}
        
        
    def addHall(self,hallid,hallname):
        hall=Hall(hallid,hallname,6)
        self.halls.append({hallid:hall})
        return hall
        
    def process(self,request):
        action = request.args['action']   
        if(action=="enterhall"):
            hallid=request.args["hallid"]
            hall=self.halls[hallid]
            if(hall==None):
                hall=self.addHall(hallid, hallid)
            return hall.getHallInfo()
        elif(action=="intable"):
            hallid=request.args["hallid"]
            hall=self.halls[hallid]
            tableid=request.args["tableid"]
            table=hall.getTable(tableid)
            if(table==None):
                return {"returncode":40001,"errormessage":"table not found!"}
            data=request.data
            player=json.loads(data)
            ok,rinfo=table.enter(player["playerid"],player["nickname"])
            print(rinfo)
            if(ok):
                return rinfo;
                
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
            print(self.users[0][1],".. 创建房间",self.roomid);
            
        for i in range(0,len(self.users)):
            self.usertimes.append(heartbeattime)
        
        self.messages=messages[:]
        self.messageids=[]
        self.currentid=0
        self.setowner()
        if(self.roomtimer==None):
            self.roomtimer=Timer(5,self.timercheck)
            self.roomtimer.start()
            print("starttimer")       
            
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
            print(user[1],"enter room! ",self.getroominfo())
        self.setowner()

        return True,"Success!"
        
    def timercheck(self):
        #self.roomtimer.cancel()
        #print("5s timer")
        for i in range(0,len(self.usertimes)):
            #print(i,self.usertimes[i])
            self.usertimes[i]-=5
        for i in range(len(self.usertimes)-1,-1,-1):
            if(self.usertimes[i]<0):
                username=self.users[i][1]
                del self.users[i]
                del self.usertimes[i]
                print(username,"timeout! ",self.getroominfo())
                
        
        self.roomtimer=Timer(5,self.timercheck)       
        self.roomtimer.start()        
            
        
    def unsubscribe(self,user):
        try:
            index=self.users.index(user)
            del self.usertimes[index]
            del self.users[index]
            self.setowner()
            print(user[1],"leave room! ",self.getroominfo())
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
            #print("getmessage 1")
            #print(message)
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
        #print(len(self.rooms))
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
