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
                query = {
                    'init': True,
                    'headers': self.headers
                }
                response = urlopen(self.server + '?' + urlencode(query, quote_via=quote))
                text = response.read().decode('utf-8')
                try:
                    obj = json.loads(text)
                    self.server_open = obj['done']
                    print('Successfully initiated connection.')
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
            query = {'data': data}
            try:
                urlopen(self.server + '?' + urlencode(query, quote_via=quote))
            except (ConnectionRefusedError, URLError):
                print('HTTP error: check that server is running.')
    
    def close(self):
        if self.csv:
            self.file.close()
        if self.live:
            query = {'finished': True}
            response = urlopen(self.server + '?' + urlencode(query, quote_via=quote))
            text = response.read().decode('utf-8')
            try:
                obj = json.loads(text)
                self.server_open = not obj['done']
                print('Successfully closed connection.')
            except json.decoder.JSONDecodeError:
                print('JSON error: Something\'s not right. Got response', text)
        self.finished = True

if __name__ == '__main__':
    t = Telem(['test1', 'test2'], csv=False)

    t.update(1, 'a')

    t.update(2, 'b')

    t.close()