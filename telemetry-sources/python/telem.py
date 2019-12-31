from datetime import datetime
from urllib.request import urlopen
from urllib.parse import urlencode, quote
from urllib.error import URLError
import json

class Telem:
    def __init__(self, headers=[], csv=True, filename='data/data', \
                 live=True, server='http://localhost:3300'):
        self.headers = headers
        self.csv = csv
        self.live = live
        self.server = server
        self.finished = False
        self.server_id = None
        
        # Initiate csv
        if self.csv:
            now = datetime.now()
            timestamp = str(now.hour).zfill(2) + str(now.minute).zfill(2) \
                + str(now.second).zfill(2) + '-' + str(now.date())
            self.filename = filename + '-' + timestamp + '.csv'
            self.file = open(self.filename, 'a')

            line = ''
            for head in headers:
                line += str(head) + ','
            self.file.write(line[:-1] + '\n')
        else:
            self.filename = None
            self.file = None
        
        # Initiate server connection
        if self.live:
            try:
                query = {'headers': json.dumps(self.headers)}
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
        # Update CSV
        if self.csv:
            line = ''

            for item in data:
                line += str(item) + ','
            
            self.file.write(line[:-1] + '\n')
        
        # Update live telemetry server
        if self.live:
            query = {'data': json.dumps(data), 'id': self.server_id, 'time': datetime.now().second}
            try:
                urlopen(self.server + '/update?' + urlencode(query, quote_via=quote))
                return True
            except (ConnectionRefusedError, URLError):
                print('HTTP error: check that server is running.')
                return False
    
    def close(self):
        if self.csv:
            self.file.close()
        if self.live:
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
    t = Telem(['test1', 'test2', 'test3', 'test4'], csv=False)

    for x in range(50):
        t.update(random(), random(), random(), random())
        time.sleep(0.5)

    t.close()