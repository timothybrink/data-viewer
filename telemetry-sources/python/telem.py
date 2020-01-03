from datetime import datetime
from urllib.request import urlopen
from urllib.parse import urlencode, quote
from urllib.error import URLError
import json

class Telem:
    def __init__(self, headers=[], server='http://localhost:3300'):
        self.headers = headers
        self.server = server
        self.finished = False
        self.server_id = None
        
        try:
            query = {'headers': json.dumps(self.headers), 'timeout': 1000}
            response = urlopen(self.server + '/init?' + urlencode(query, quote_via=quote))
            text = response.read().decode('utf-8')
            try:
                obj = json.loads(text)
                if obj['done']:
                    self.server_id = int(obj['id'])
                else:
                    print('Connection not initated. Error:', obj['error'])
            except json.decoder.JSONDecodeError:
                print('JSON error: Something\'s not right. Got response', text)
        except (ConnectionRefusedError, URLError):
            print('HTTP error: check that the server is running.')

    
    def update(self, *data):
        query = {'data': json.dumps(data), 'id': self.server_id, 'time': datetime.now().second}
        try:
            urlopen(self.server + '/update?' + urlencode(query, quote_via=quote))
            return True
        except (ConnectionRefusedError, URLError):
            print('HTTP error: check that server is running.')
            return False
    
    def close(self):
        query = {'id': self.server_id}
        response = urlopen(self.server + '/close?' + urlencode(query, quote_via=quote))
        text = response.read().decode('utf-8')
        try:
            obj = json.loads(text)
            if obj['done']:
                self.server_id = None
                return True
        except json.decoder.JSONDecodeError:
            print('JSON error: Something\'s not right. Got response', text)
            return False
        self.finished = True

if __name__ == '__main__':
    import time
    from random import random
    t = Telem(['test1', 'test2', 'test3', 'test4', 'test5'])

    for x in range(50):
        t.update(random(), random(), random(), random(), random())
        time.sleep(0.5)

    t.close()