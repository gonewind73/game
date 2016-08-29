'''
 * get(roomid,peerid,nickname)
 * return json{
 *   roomid:*,
 *   owner: peerid,
 *   roomsize: 2,
 *   peers{
 *       peerid:nickname,
 *       peerid:nickname,}
 *   }
'''

import json
from threading import Timer
heartbeattime=30

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
