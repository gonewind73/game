'''
Created on 2016年8月24日

@author: heguofeng
'''


#ddz configuration

redistype = 0  # 0　no redis  1 redis  2 redistype
dbtype="redislite"
webport = 5000 
debug=True

import sys

def dprint(*args):
    if debug:
        '''print(sys._getframe().f_code.co_filename,
              sys._getframe().f_code.co_name,
              sys._getframe().f_lineno)'''
        print(*args)
    return
    