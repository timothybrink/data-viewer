from datetime import datetime, timedelta
from urllib.request import urlopen
from urllib.parse import urlencode, quote
from urllib.error import URLError
import json
import _thread

class Telem:
    def __init__(self, headers=[], server='localhost:3300', timeout=1000):
        self.headers = headers
        self.server = 'http://' + server
        self.timeout = timeout
        self.finished = False
        self.server_id = None
        self.start_time = datetime.now()
        
        try:
            query = {'headers': json.dumps(self.headers), 'timeout': self.timeout}
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

    def update_server(self, url):
        urlopen(url)
    
    def update(self, *data):
        ms_since_start = round((datetime.now() - self.start_time) / timedelta(milliseconds=1))
        query = {'data': json.dumps(data), 'id': self.server_id, 'time': ms_since_start}
        url = self.server + '/update?' + urlencode(query, quote_via=quote)
        
        thread = _thread.start_new_thread(self.update_server, (url,))
    
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
