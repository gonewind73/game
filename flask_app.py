'''
Created on 2016年7月12日

@author: heguofeng
'''
#!/usr/bin/env python
import datetime
import flask
import json
import requests
import os


from rooms import rooms,Game
from weixinmp import WeixinMp
import config

try:
    from config import dprint
except:
    print("No dprint method defined,use default")
    def dprint(*args):
        print(*args)

#use redislite instead 2016.8.20
if config.dbtype=="redislite":
    import redislite
    red = redislite.StrictRedis('redis.db')
if config.dbtype=="redis":
    import redis
    red = redis.StrictRedis(host='localhost', port=6379, db=6)


app = flask.Flask(__name__,static_url_path="")
app.secret_key = 'asdf'
myRooms=rooms(100)
p2p_net_nodes = {}
myIps={};
token_189 = {}
wxmp=WeixinMp({'token':"52128431",'appid':"wxd9d30601a109424b",'secret':"c8ed54032e0c7d8b8ba12c917e34af41"})

mygame=Game()
mygame.addHall("g24p", "g24p")

#@app.before_request
#def make_session_permanent():
#    flask.session.permanent = True

def redismeesge(roomid):
    pubsub = red.pubsub()
    pubsub.subscribe(roomid)

    dprint(roomid);
    # TODO: handle client disconnection.
    for msg in pubsub.listen():
        dprint(msg)
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
    dprint(message,froomid);
    red.publish(froomid,message);
    return flask.Response(status=204,headers={"Access-Control-Allow-Origin": "*"})

@app.route('/redisstream')
def redis_stream():
    dprint(flask.session)
    froom=flask.session.get('roomid','904')
    #froom=flask.request.form['room']
    return flask.Response(redismeesge(froom), headers={"Access-Control-Allow-Origin": "*"},
                          mimetype="text/event-stream")


def event_stream(roomid):
    r=myRooms.getroom(roomid)
    while(True):
        message,index=r.getmessage()
        if(len(message)>0):
            dprint("event_stream #1")
            yield 'data: %s\n\n' % message
            #gevent.sleep(0.5)
            dprint("event_stream #2 delete")
            r.delmessage(index)


@app.route('/enter',methods=['GET', 'POST'])
def enterroom():
    if flask.request.method == 'POST':
        froomid=flask.request.form['roomid']
        fnickname=flask.request.form['nickname']
        fpeerid=flask.request.form['peerid']

        flask.session['user'] =  fnickname
        flask.session['roomid'] =  froomid
        flask.session.permanent = True


        r,message=myRooms.subscribe(roomid=froomid,user=fnickname,peerid=fpeerid)
        roominfo= myRooms.getroominfo(froomid)
        data={"result":r,"message":message,"roominfo":roominfo}
        djson=json.dumps(data)
        dprint(data)
        return flask.Response(djson,headers={"Access-Control-Allow-Origin": "*"})
    return '<form action="/enter" method="post">user: <input type=text name="nickname">room: <input type="text" name="roomid">peerid: <input type="text" name="peerid"><input type="submit" value="Submit"></form>'

@app.route('/session')
def getsession():
    return flask.session.get('roomid','chat')


@app.route('/leave',methods=['GET', 'POST'])
def leaveroom():
    if flask.request.method == 'POST':
        dprint(flask.request)
        froomid=flask.request.form['roomid']
        fnickname=flask.request.form['nickname']
        fpeerid=flask.request.form['peerid']
        dprint(fpeerid)

        result,message=myRooms.unsubscribe(roomid=froomid,user=fnickname,peerid=fpeerid)
        dprint(result,message)
        roominfo= myRooms.getroominfo(froomid)
        data={"result":result,"message":message,"roominfo":roominfo}
        djson=json.dumps(data)
        dprint(data)
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
            dprint("X-Real-IP ",ip)
        except:
            try:
                ip=flask.request.headers['x-forwarded-for'];  #openshift
                ip=ip.split(",")[0]
                dprint("x-forwarded-for ",ip)
            except:
                ip=flask.request.remote_addr;
                dprint('remote_addr ',ip)
        myIps["myRemoteIp"]=ip
        dprint("WlanIp = ",myIps["myLocalIp"]," eth0Ip = ",myIps["myeth0Ip"]," 138Ip = ",myIps["myIp138"]," RemoteIp = ",myIps["myRemoteIp"])

        return flask.redirect('/getip')
    return '<form action="/postip" method="post">localip: <input type=text name="wlanip">eth0ip: <input type=text name="eth0ip">138ip: <input type=text name="138ip"><input type="submit" value="Submit"></form>'

@app.route('/getip')
def getip():
    dprint(myIps["myLocalIp"])
    dprint(myIps["myRemoteIp"])
    return 'Wlan0lIp =' +myIps["myLocalIp"]+'Eth0lIp =' +myIps["myeth0Ip"]+"  138Ip = "+myIps["myIp138"]+"  RemoteIp = "+myIps["myRemoteIp"];

@app.route('/doudizhu')
def doudizhuurl():
    dprint(myIps["myLocalIp"])
    dprint(myIps["myRemoteIp"])
    redirecturl="http://"+myIps["myRemoteIp"]+":5000/mygame/doudizhu/index.html"
    #return flask.redirect(redirecturl, code=302)
    return "<html><head><title>斗地主</title><meta charset='UTF-8'></head>" \
            +"<body leftmargin='0' topmargin='0'><iframe src='"+redirecturl+"' width='100%' height='100%' frameborder='0'></iframe></body></html>"

@app.route('/doudizhu1')
def doudizhuurl1():
    dprint(os.getcwd())
    return flask.render_template('doudizhu.html', hostip=myIps["myRemoteIp"])


@app.route('/game24')
def game24url():
    print(myIps["myLocalIp"])
    print(myIps["myRemoteIp"])
    if(myIps["myRemoteIp"]==None):
        return "error in register server ip!"
    redirecturl="http://"+myIps["myRemoteIp"]+":5000/mygame/g24pv2/index.html"
    #return flask.redirect(redirecturl code=302)
    script='''
    <script src="/game/js/jquery-1.4.2.min.js"></script>
    <script language='javascript'>
    function onresize1(){
            var bw=screen.width;
            var bh=screen.height;
            if(bw<bh){
                $('iframe').width('1000px');
                $('iframe').height('1500px');
            }else{
                $('iframe').width('1000px');
                $('iframe').height('500px');
            }
    }</script>
    '''

    return "<html><head><title>算24</title><meta charset='UTF-8'></head>"\
            +script \
            +"<body leftmargin='0' topmargin='0' onresize='onresize1()'><iframe src='"+redirecturl+"' width='100%' height='100%' frameborder='0'></iframe></body></html>"


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
    dprint("fullpath: ",fullpath)
    r=requests.get("http://"+myIps["myRemoteIp"]+":5000/weixin2"+fullpath)
    dprint("return: ",r.text)
    return r.text;

#2018.2.12 189Disk get Token
@app.route('/get189token', methods=['GET', 'POST'])
def get189token():
    if flask.request.method == 'POST':
        fuser=flask.request.form['userid']
        fuser_token=flask.request.form['access_token']
        if fuser and fuser_token:
            token_189[fuser] = fuser_token
        return '请返回程序界面继续！'
    if flask.request.method == 'GET':
        if len(flask.request.args):
            fuser=flask.request.args.get('userid','')
            fuser_token=flask.request.args.get('access_token','')
            if fuser and fuser_token:
                token_189[fuser] = fuser_token
                return '请返回程序界面继续！'
            data = {fuser:token_189[fuser]}
            djson=json.dumps(data)
            return flask.Response(djson)
        else:
            return '<form action="/get189token" method="post">userid: <input type=text name="userid">token: <input type="text" name="access_token"><input type="submit" value="Submit"></form>'

#2018.2.20 upload
@app.route('/safebook/upload', methods=['POST', 'GET'])
def upload():
    if flask.request.method == 'POST':
        fuser = flask.request.args.get('userid','')
        datafile = flask.request.files['datafile']
        filepath = os.path.join(r'/home/joygame2/',fuser+"_"+datafile.filename)
        datafile.save(filepath)
        return 'filename is %s ' % datafile.filename
    else:
        return '<html><head lang="en"><meta charset="UTF-8"><title>uploadfile</title></head>  \
                <body><form action="" method="post" enctype="multipart/form-data"> upload: <input type="file" name="datafile"><input type="submit" name="upload"> </form> </body> </html>    '



@app.route('/safebook/download', methods=['GET'])
def download():
    fuser = flask.request.args.get('userid','')
    response = flask.make_response(flask.send_file(os.path.join(r'/home/joygame2/',fuser+'_safebook.sbr')))
    response.headers["Content-Disposition"] = "attachment; filename=safebook.sbr;"

    return response

@app.route('/p2pnet/public',methods=['GET','POST'])
def public():
    if flask.request.method == 'POST':
        net_id = flask.request.args.get('net_id','')
        node_id = flask.request.args.get('node_id','')
        ip = flask.request.args.get('ip','')
        port = flask.request.args.get('port','')
        nat_type = flask.request.args.get('nat_type','')
        nodes = p2p_net_nodes.get(net_id,{})
        nodes[node_id] = (ip,port,nat_type,time.time())
        p2p_net_nodes[net_id] = nodes

        return 'total %d node in net %s ' % (len(nodes),net_id)
    else: #get
        net_id = flask.request.args.get('net_id','')
        nodes = p2p_net_nodes.get(net_id,{})
        now = time.time()
        alive_node = {}
        for node in nodes:
            if now - nodes[node][3] < 600 :
                alive_node[node] = nodes[node]
        djson=json.dumps(alive_node)
        return flask.Response(djson)



@app.route('/login', methods=['GET', 'POST'])
def login():
    if flask.request.method == 'POST':
        froomid=flask.request.form['roomid']
        fuser=flask.request.form['nickname']
        flask.session['user'] =  fuser
        flask.session['roomid'] =  froomid
        dprint(flask.session)
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
    dprint(r.getmessage())
    return flask.Response(status=204)

@app.route('/stream')
def stream():
    dprint(flask.session)
    froom=flask.session.get('roomid','chat')

    return flask.Response(event_stream(froom),
                          mimetype="text/event-stream")

@app.route('/opendoor')
def opendoor():
    fdoor = flask.request.args['door']
    #commamd="echo '731018'|sudo -S service ssh start"
    if(fdoor=="ssh"):
        command="echo '731018'|sudo -S service ssh start"
        os.system(command)
        return "openssh"
    elif fdoor=="vnc":
        command="tightvncserver&"
        os.system(command)
        return "openvnc"
    return "not support!"

@app.route('/game1',methods=['GET', 'POST'])
def game():
    dprint("game sessions befor process:",flask.session)
    rtn,session=mygame.process(flask.request,flask.session)
    flask.session=session
    dprint("game sessions after process:",flask.session)
    djson=json.dumps(rtn)
    dprint(djson)
    return flask.Response(djson,headers={"Access-Control-Allow-Origin": "*"})

@app.route('/gamelongpoll',methods=['GET', 'POST'])
def gamelongpoll():
    dprint("gamespoll sessions:",flask.session)
    hallid=flask.session["hallid"]
    #tableid=flask.session["tableid"]
    playerid=flask.session["playerid"]
    return flask.Response(mygame.getMessage2(hallid,"",playerid), headers={"Access-Control-Allow-Origin": "*"},
                          )

@app.route('/gamestream')
def gamestream():
    dprint("gamestream sessions:",flask.session)
    hallid=flask.session["hallid"]
    #tableid=flask.session["tableid"]
    playerid=flask.session["playerid"]
    return flask.Response(mygame.getMessage(hallid,"",playerid), headers={"Access-Control-Allow-Origin": "*"},
                          mimetype="text/event-stream")
'''    r.call_on_close(on_close)
    return r

def on_close():
    dprint("sse response is closed!")

'''

@app.route('/')
def home():
    return flask.render_template('index.html')
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

@app.route('/mygame/<path:path>')
def serve_static(path):
    if 'OPENSHIFT_REPO_DIR' in os.environ:
        return flask.send_from_directory(os.environ['OPENSHIFT_REPO_DIR'], path)
    return flask.send_from_directory(os.getcwd(), path)


if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0', port=5000, threaded=True)
