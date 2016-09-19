'''
Created on 2016年8月27日

@author: heguofeng
'''

import hashlib
import xml.etree.ElementTree as ET
import requests
import re

#add CDDATA to ET
def CDATA(text=None):
    element = ET.Element('![CDATA[')
    element.text = text
    return element

ET._original_serialize_xml = ET._serialize_xml

def _serialize_xml(write, elem, qnames, namespaces,short_empty_elements, **kwargs):

    if elem.tag == '![CDATA[':
        #write("\n<{}{}]]>\n".format(elem.tag, elem.text))
        write("<%s%s]]>" % (elem.tag, elem.text))
        if elem.tail:
            write(ET._escape_cdata(elem.tail))
    else:
        return ET._original_serialize_xml(write, elem, qnames, namespaces,short_empty_elements, **kwargs)

ET._serialize_xml = ET._serialize['xml'] = _serialize_xml

class WeixinMp(object):
    '''
    weixin mp
    '''
    def __init__(self, params):
        '''
        Constructor
        '''
        self.TOKEN = params["token"]
        self.appid = params["appid"]
        self.secret = params["secret"]
        self.access_token=""
        
    def processMessage(self,request):
        print(request.data)  
        reqdict=self.wxxmltodict(request.data)
        print(reqdict)
        if(reqdict['MsgType']=='event'):
            if(reqdict['Event']=="scancode_waitmsg"):
                respdict=self.checkurl(reqdict)
                return self.wxmessage({"xml":respdict})  
            else:
                respdict=self.textMessage(reqdict, "不支持的事件类型！")
                return self.wxmessage({"xml":respdict})  
        if(reqdict['MsgType']=='text'):
            respdict=self.textMessage(reqdict, "您的消息收到，会尽快回复您！")
            return self.wxmessage({"xml":respdict})  
        return
    
    
    def verifymp(self, request):
        '''
        request is a flask request
        '''
        signature = request.args['signature']    
        timestamp = request.args['timestamp']    
        nonce = request.args['nonce']   
        echostr = request.args['echostr']  
        
        print(signature, " ", timestamp, " ", nonce, " ", echostr)
        wexinarr = [];
        wexinarr.append(self.TOKEN)
        wexinarr.append(timestamp)
        wexinarr.append(nonce)
        wexinarr.sort()
        tempstr = wexinarr[0] + wexinarr[1] + wexinarr[2]
    
        sha1 = hashlib.sha1()
        sha1.update(tempstr.encode())
        wxsha1 = sha1.hexdigest()
        
        if(wxsha1 == signature):
            print("wexin signaure valid");
        return echostr;
    
    def textMessage(self,reqdict,text):
        respdict = {}
        respdict["ToUserName"] = reqdict["FromUserName"]
        respdict["FromUserName"] = reqdict["ToUserName"]
        respdict["CreateTime"] = reqdict["CreateTime"]
        respdict["MsgType"] = "text"
        respdict["Content"] = text
        respdict["MsgId"] = reqdict["CreateTime"]
        return respdict;
 
    def linkMessage(self,reqdict,text):
        respdict = {}
        respdict["ToUserName"] = reqdict["FromUserName"]
        respdict["FromUserName"] = reqdict["ToUserName"]
        respdict["CreateTime"] = reqdict["CreateTime"]
        respdict["MsgType"] = "link"
        respdict["Title"]="斗地主"
        respdict["Description"]="斗地主，老少皆宜"
        respdict["Url"]="http://heguofeng.pythonanywhere.com/doudizhu"
        respdict["MsgId"] = reqdict["CreateTime"]
        
        return respdict;
                                                                     
    
    def checkurl(self, reqdict):
        #to do check the url status 
        url=reqdict["ScanCodeInfo"]["ScanResult"];
        status=0;
        match=re.findall(r'189.cn/',url)
        if(len(match)>0):
            status=0;
        else:
            status=2;
        
        #todo 
       
        text=  url + " 状态未知，请谨慎访问！"
        if(status==0):
            text= url+"is verified!,请放心访问！"
        elif(status==1):
            text= url.replace("."," .")+" 含有恶意代码，请勿点击链接！"
        elif(status==2):
            text= url.replace("."," .") + " 状态未知，请谨慎访问！如要继续访问，请去除 。前空格"
            
        #return self.textMessage(reqdict, text)
        return self.linkMessage(reqdict, text)

    def xmltodict(self, tree):
        tempdict = {}
        for item in tree.getchildren():
            tempdict[item.tag] = item.text;
            if(item.text == None):
                tempdict[item.tag] = self.xmltodict(item);
        return tempdict
    
    def wxxmltodict(self, data):
        tree = ET.fromstring(data)
        return self.xmltodict(tree)
    
    def wxmessage(self, datadict):
        xml = self.dicttoxml(datadict)
        s = ET.tostring(xml, encoding="unicode")
        s = s.replace("&lt;", "<").replace("&gt;", ">")
        print(s)
        return(s)

    def dicttoxml(self, datadict):
        for item in datadict:
            print(item)
            t = ET.Element(item)
            if(type(datadict[item]) == type({})):
                for i in datadict[item]:
                    print(i)
                    t.append(self.dicttoxml({i:datadict[item][i]}))
                return t
            else:
                print(datadict[item])
                if(type(datadict[item]) == type("abc")):
                    t.text = "<![CDATA[" + datadict[item] + "]]>"
                else:
                    t.text = datadict[item]
                return t
        return    
            
    def getAccessToken(self):
        '''
        http请求方式: GET
        https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
        
        .参数说明
        .参数    是否必须    说明
        grant_type    是    获取access_token填写client_credential
        appid    是    第三方用户唯一凭证
        secret    是    第三方用户唯一凭证密钥，即appsecret
        .返回说明
        .正常情况下，微信会返回下述JSON数据包给公众号：
        {"access_token":"ACCESS_TOKEN","expires_in":7200}
        .参数    说明
        access_token    获取到的凭证
        expires_in    凭证有效时间，单位：秒
        
        .错误时微信会返回错误码等信息，JSON数据包示例如下（该示例为AppID无效错误）:
        {"errcode":40013,"errmsg":"invalid appid"}
        '''
        url="https://api.weixin.qq.com/cgi-bin/token";
        r=requests.get(url,params={"grant_type":"client_credential","appid":self.appid,"secret":self.secret});
        if(r.status_code==200):
            try:
                self.access_token=r.json()["access_token"]
                return True,self.access_token
            except:
                return False,r.json()["errmsg"]
        return False,"Network error!"
    
    def delMenu(self):
        '''
        http请求方式：GET
        https://api.weixin.qq.com/cgi-bin/menu/delete?access_token=ACCESS_TOKEN
        .返回说明
        .对应创建接口，正确的Json返回结果:
        {"errcode":0,"errmsg":"ok"}
        '''
        if(self.access_token==""):
            ok,m = self.getAccessToken()
            if(not ok):
                return False
        url="https://api.weixin.qq.com/cgi-bin/menu/delete";
        r=requests.get(url,params = {"access_token":self.access_token});
        if((r.status_code==200) and (r.json()["errcode"]==0)):
            return True
        return False

    def addMenu(self,menudata):
        '''
        .接口调用请求说明
        http请求方式：POST（请使用https协议） https://api.weixin.qq.com/cgi-bin/menu/create?access_token=ACCESS_TOKEN
        
        .返回结果
        .正确时的返回JSON数据包如下：
        {"errcode":0,"errmsg":"ok"}
        .错误时的返回JSON数据包如下（示例为无效菜单名长度）：
        {"errcode":40018,"errmsg":"invalid button name size"}
        
        menudata 格式详见  https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141013&token=&lang=zh_CN
        '''
        
        defaultmenu='''{
    "button": [
        {
            "name": "照妖镜",
            "sub_button": [
                {
                    "type": "scancode_waitmsg",
                    "name": "火眼金睛",
                    "key": "rselfmenu_0_0",
                    "sub_button": []
                }
            ]
        },
        {
            "name": "产品中心",
            "sub_button": [
                {
                    "type": "view",
                    "name": "网络安全服务",
                    "url": "http://101.95.49.145:8080/weixin_net/wxNetProduct/proType.do?productType=8&openId=BWK2trl4FzPVTFiDQIWUQiG3fZpHFGCeI/5Zjsufs7Y="
                },
                {
                    "type": "click",
                    "name": "网站安全服务",
                    "key": "rselfmenu_1_0",
                    "sub_button": []
                },
                {
                    "type": "pic_weixin",
                    "name": "终端安全服务",
                    "key": "rselfmenu_1_0",
                    "sub_button": []
                },
                {
                    "type": "pic_sysphoto",
                    "name": "安全管理服务",
                    "key": "rselfmenu_1_0",
                    "sub_button": []
                },
                {
                    "type": "pic_photo_or_album",
                    "name": "更多产品",
                    "key": "rselfmenu_1_1",
                    "sub_button": []
                }
            ]
        },
        {
            "name": "自助导航",
            "type": "location_select",
            "key": "rselfmenu_2_0"
        }
    ]
}
        '''
        
        if(self.access_token==""):
            ok, m = self.getAccessToken()
            if(not ok):
                return False
        url="https://api.weixin.qq.com/cgi-bin/menu/create";
        if(menudata==""):
            menudata=defaultmenu
        r=requests.post(url,params = {"access_token":self.access_token},data=menudata);
        print(r.text)
        if((r.status_code==200) and (r.json()["errcode"]==0)):
            return True
        return False