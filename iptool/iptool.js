/**
 * heguofeng
 */

function m2sclick(){
	ipmask=$("#ipmask").attr("value")
	ipsegment=mask2segment(ipmask)
	$("#ipsegment").text(ipsegment)
	return
}

function mask2segment(ipmask){
	s=ipmask.split("/")
	ipaddress=ip2int(s[0])
	mask=parseInt(s[1])
	sipaddr=ipaddress&(Math.pow(2,32)-Math.pow(2,32-mask))
	eipaddr=sipaddr+Math.pow(2,32-mask)-1
	
	return int2ip(sipaddr)+" - "+int2ip(eipaddr)
}

//IP转成整型  
function ip2int(ip){  
    var num = 0;  
    ip = ip.split(".");  
    num = Number(ip[0]) * 256 * 256 * 256 + Number(ip[1]) * 256 * 256 + Number(ip[2]) * 256 + Number(ip[3]);  
    num = num >>> 0;  
    return num;  
}  
//整型解析为IP地址  
function int2ip(num){  
    var str;  
    var tt = new Array();  
    tt[0] = (num >>> 24) >>> 0;  
    tt[1] = ((num << 8) >>> 24) >>> 0;  
    tt[2] = (num << 16) >>> 24;  
    tt[3] = (num << 24) >>> 24;  
    str = String(tt[0]) + "." + String(tt[1]) + "." + String(tt[2]) + "." + String(tt[3]);  
    return str;  
}  
