'''
Created on 2016年4月5日

@author: heguofeng
24点算法
'''
#import random
from math import fabs


class Point24(object):
    '''
    sudoku game
    '''

    __author="heguofeng"
    data=[0,0,0,0]
    expression=["","","",""]
    

    def __init__(self,s,mode=0):
        '''
        Constructor
        mode: 0  only need 1 result
        mode: 1  all results
        '''
        self.results=[];
        self.mode=mode;
        self.data=s
        for i in range(0,len(s)):
            self.expression[i]=str(self.data[i])
        return
     

    def search(self,n):
        if n==1:
            if fabs(self.data[0]-24)<0.0001:
                self.results.append(self.expression[0])
                #print( self.expression[0])
                if(self.mode==0):
                    return True
                else:
                    return False
            else:
                return False
        else:
            for i in range(0,n):
                for j in range(i+1,n):
                    a=self.data[i]
                    b=self.data[j]
                    expra=self.expression[i]
                    exprb=self.expression[j]
                    self.data[j]=self.data[n-1]
                    self.expression[j]=self.expression[n-1]
                    self.expression[i]="("+expra+"+"+exprb+")"
                    self.data[i]=a+b
                    if(self.search(n-1)):
                        return True
                    self.expression[i]="("+expra+"-"+exprb+")"
                    self.data[i]=a-b
                    if(self.search(n-1)):
                        return True
                    self.expression[i]="("+exprb+"-"+expra+")"
                    self.data[i]=b-a
                    if(self.search(n-1)):
                        return True
                    self.expression[i]="("+expra+"*"+exprb+")"
                    self.data[i]=a*b
                    if(self.search(n-1)):
                        return True
                    if(b!=0):
                        self.expression[i]="("+expra+"/"+exprb+")"
                        self.data[i]=a/b
                        if(self.search(n-1)):
                            return True
                    if(a!=0):
                        self.expression[i]="("+exprb+"/"+expra+")"
                        self.data[i]=b/a
                        if(self.search(n-1)):
                            return True    
                    self.data[i]=a
                    self.data[j]=b
                    self.expression[i]=expra
                    self.expression[j]=exprb
            return False          
        return
        
    def run(self):
        print("Point24 data: ",self.data)
        self.search(4);
        if(len(self.results)==0):
            return "no answer!"
        print("Point24 answer: ",self.results[0])
        return self.results[0]
    
    def autorun(self):
        self.search(4);
        if(len(self.results)==0):
            return False
        for i in self.results:
            print(i)
        return True
        
 
            
        

if __name__ == '__main__':
    start=[10,4,4,3]
    p24=Point24(start,1)
    #sudo.set(start)

    if(p24.autorun()==False):
        print("Can't find method!")
        