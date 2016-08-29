'''
Created on 2016年7月12日

@author: heguofeng
'''
#!/usr/bin/env python    
import datetime    
import flask 
#import gevent
import os.path
import json
import hashlib
import requests
import xml.etree.ElementTree as ET

from rooms import room,rooms
from weixinmp import WeixinMp
#use redislite instead 2016.8.20
try:
    import redislite
    red = redislite.StrictRedis('redis.db')
except:
    import redis
    red = redis.StrictRedis(host='localhost', port=6379, db=6)  



app = flask.Flask(__name__,static_url_path="")    
app.secret_key = 'asdf'    
myRooms=rooms(100)
myIps={};
wxmp=WeixinMp({'token':"52128431",'appid':"wxd9d30601a109424b",'secret':"c8ed54032e0c7d8b8ba12c917e34af41"})



#@app.before_request
#def make_session_permanent():
#    flask.session.permanent = True
    
def redismeesge(roomid):    
    pubsub = red.pubsub()    
    pubsub.subscribe(roomid)    
    
    print(roomid);
    # TODO: handle client disconnection.    
    for msg in pubsub.listen():    
        print(msg)  
        if (msg["type"]=="message"):
            yield 'data: %s\n\n' % (msg['data'].decode()) 
        else:
            continue;

@app.route('/redispost', methods=['POST'])    
def redis_post():    
    message = flask.request.form['message']    
    froomid=flask.request.form['roomid']
    user = flask.session.get('user', 'anonymous')    
    flask.session['roomid']=froomid;
    print(message,froomid);
    red.publish(froomid,message);
    return flask.Response(status=204,headers={"Access-Control-Allow-Origin": "*"}) 

@app.route('/redisstream')    
def redis_stream():    
    print(flask.session)
    froom=flask.session.get('roomid','904')
    #froom=flask.request.form['room']
    return flask.Response(redismeesge(froom), headers={"Access-Control-Allow-Origin": "*"},   
                          mimetype="text/event-stream")    
 

def event_stream(roomid):    
    r=myRooms.getroom(roomid)
    while(True):
        message,index=r.getmessage()
        if(len(message)>0):
            print("event_stream #1")
            yield 'data: %s\n\n' % message  
            #gevent.sleep(0.5)
            print("event_stream #2 delete")
            r.delmessage(index)
            
            
@app.route('/enter',methods=['GET', 'POST'])    
def enterroom():    
    if flask.request.method == 'POST':    
        #print(flask.request)
        froomid=flask.request.form['roomid']
        fnickname=flask.request.form['nickname']
        fpeerid=flask.request.form['peerid']
        
        flask.session['user'] =  fnickname 
        flask.session['roomid'] =  froomid
        flask.session.permanent = True
      
        #print(fpeerid)
        
        r,message=myRooms.subscribe(roomid=froomid,user=fnickname,peerid=fpeerid)
        roominfo= myRooms.getroominfo(froomid) 
        data={"result":r,"message":message,"roominfo":roominfo}
        djson=json.dumps(data)
        #print(data)
        return flask.Response(djson,headers={"Access-Control-Allow-Origin": "*"})
    return '<form action="/enter" method="post">user: <input type=text name="nickname">room: <input type="text" name="roomid">peerid: <input type="text" name="peerid"><input type="submit" value="Submit"></form>'      
 
@app.route('/session')
def getsession():
    return flask.session.get('roomid','chat')


@app.route('/leave',methods=['GET', 'POST'])    
def leaveroom():    
    if flask.request.method == 'POST':    
        print(flask.request)
        froomid=flask.request.form['roomid']
        fnickname=flask.request.form['nickname']
        fpeerid=flask.request.form['peerid']
        print(fpeerid)
        
        result,message=myRooms.unsubscribe(roomid=froomid,user=fnickname,peerid=fpeerid)
        print(result,message)
        roominfo= myRooms.getroominfo(froomid) 
        data={"result":result,"message":message,"roominfo":roominfo}
        djson=json.dumps(data)
        print(data)
        return flask.Response(djson,headers={"Access-Control-Allow-Origin": "*"})
    return '<form action="/leave" method="post">user: <input type=text name="nickname">room: <input type="text" name="roomid">peerid: <input type="text" name="peerid"><input type="submit" value="Submit"></form>'      
   
 
@app.route('/postip', methods=['GET', 'POST'])    
def postip():    
    if flask.request.method == 'POST':    
        myIps["myLocalIp"]=flask.request.form['wlanip']
        myIps["myeth0Ip"]=flask.request.form['eth0ip']
        myIps["myIp138"]=flask.request.form['138ip']
        ip=""
        try:
            ip=flask.request.headers['X-Real-IP'];   #pythonanywhere
            print("X-Real-IP ",ip)
        except:
            try:
                ip=flask.request.headers['x-forwarded-for'];  #openshift
                ip=ip.split(",")[0]
                print("x-forwarded-for ",ip)
            except:
                ip=flask.request.remote_addr;
                print('remote_addr ',ip)
        myIps["myRemoteIp"]=ip
        print("WlanIp = ",myIps["myLocalIp"]," eth0Ip = ",myIps["myeth0Ip"]," 138Ip = ",myIps["myIp138"]," RemoteIp = ",myIps["myRemoteIp"])

        return flask.redirect('/getip')    
    return '<form action="/postip" method="post">localip: <input type=text name="wlanip">eth0ip: <input type=text name="eth0ip">138ip: <input type=text name="138ip"><input type="submit" value="Submit"></form>'    

@app.route('/getip')    
def getip():    
    print(myIps["myLocalIp"])
    print(myIps["myRemoteIp"])
    return 'Wlan0lIp =' +myIps["myLocalIp"]+'Eth0lIp =' +myIps["myeth0Ip"]+"  138Ip = "+myIps["myIp138"]+"  RemoteIp = "+myIps["myRemoteIp"];

@app.route('/doudizhu')    
def doudizhuurl():        
    print(myIps["myLocalIp"])
    print(myIps["myRemoteIp"])
    redirecturl="http://"+myIps["myRemoteIp"]+":5000/mygame/doudizhu/index.html"
    #return flask.redirect(redirecturl, code=302)
    return "<html><head><title>斗地主</title><meta charset='UTF-8'></head>" \
            +"<body leftmargin='0' topmargin='0'><iframe src='"+redirecturl+"' width='100%' height='100%' frameborder='0'></iframe></body></html>"

@app.route('/doudizhu1')    
def doudizhuurl1():        
    print(os.getcwd())
    return flask.render_template('doudizhu.html', hostip=myIps["myRemoteIp"])


@app.route('/getselfip')    
def getselfip():    
    try:
        ip=flask.request.headers['X-Real-IP'];
    except:
        ip=flask.request.remote_addr;
    return ip;

 

@app.route('/weixin',methods=['GET', 'POST'])
def weixin():
    if flask.request.method == 'GET':    
        return wxmp.verifymp(flask.request)
    if flask.request.method == 'POST':
        return wxmp.processMessage(flask.request)

   
@app.route('/weixin1',methods=['GET'])
def weixin1():
    fullpath=flask.request.fullpath;
    print("fullpath: ",fullpath)
    r=requests.get("http://"+myIps["myRemoteIp"]+":5000/weixin2"+fullpath)
    print("return: ",r.text)
    return r.text;

 
@app.route('/login', methods=['GET', 'POST'])    
def login():    
    if flask.request.method == 'POST':    
        froomid=flask.request.form['roomid']
        fuser=flask.request.form['nickname']
        flask.session['user'] =  fuser 
        flask.session['roomid'] =  froomid
        #print(flask.session)
        myRooms.subscribe(roomid=froomid,user=fuser,peerid="1")
        return flask.redirect('/')    
    return '<form action="/login" method="post">user: <input type=text name="nickname">room: <input type="text" name="roomid"><input type="submit" value="Submit"></form>'    
 
@app.route('/post', methods=['POST'])    
def post():    
    fmessage = flask.request.form['message']    
    fuser = flask.session.get('user', 'anonymous')    
    froom= flask.session.get('roomid', 'chat') 

    now =  datetime.datetime.now().strftime("%Y %m %d %H:%M:%S")    
    r=myRooms.getroom(froom)
    message=""
    message=message.join((now," ",fuser,":",fmessage))
    
    r.publish(message)
    print(r.getmessage()) 
    return flask.Response(status=204)    
 
@app.route('/stream')    
def stream():    
    print(flask.session)
    froom=flask.session.get('roomid','chat')

    return flask.Response(event_stream(froom),    
                          mimetype="text/event-stream")    

@app.route('/opendoor')    
def opendoor():    
    fdoor = flask.request.form['door']  
    command="tightvncserver&"
    #commamd="echo '731018'|sudo -S service ssh start"
    if(fdoor=="ssh"):
        os.system(command)
        return "open"
    else:
        return "not support!"
 
@app.route('/')    
def home():    
    if 'user' not in flask.session:    
        return flask.redirect('/login')    
    return u"""    
            <!doctype html>    
            <title>chat</title>
            <meta charset="UTF-8">
            
            <script src="http://cdn.staticfile.org/jquery/2.1.1/jquery.min.js"></script>    
     
            <style>body { max-width: 500px; margin: auto; padding: 
    1em; background: black; color: #fff; font: 16px/1.6 menlo, monospace; 
    }</style>    
            <p><b>hi, %s!</b></p>    
            <p>Message: <input id="in" /></p>    
            <pre id="out"></pre>    
            <script>    
                function sse() {    
                    var source = new EventSource('/stream');    
                    var out = document.getElementById('out');    
                    source.onmessage = function(e) {    
                        // XSS in chat is fun    
                        out.innerHTML =  e.data + '\\n' + out.innerHTML;    
                    };    
                }    
                $('#in').keyup(function(e){    
                    if (e.keyCode == 13) {    
                        $.post('/post', {'message': $(this).val()});    
                        $(this).val('');    
                    }    
                });    
                sse();    
            </script>    
        
     """ % flask.session['user']    
   

#@app.route('/mygame/<path:path>')
#def send_js(path):
#    return flask.send_from_directory('', path)

@app.route('/mygame/<path:path>')
def serve_static(path):
    #root_dir = os.getcwd()
    #p=os.path.join(root_dir)
    #print(p)
    return flask.send_from_directory(os.getcwd(), path)


     
if __name__ == '__main__':    
    app.debug = True    
    app.run(host='0.0.0.0', port=5000, threaded=True)