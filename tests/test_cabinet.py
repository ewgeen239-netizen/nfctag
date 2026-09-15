"""Personal account page and automatic translations against a fake DeepL endpoint."""
import http.cookiejar, json, os, socket, sqlite3, subprocess, sys, tempfile, threading, time, unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import build_opener, HTTPCookieProcessor, HTTPRedirectHandler, Request
ROOT=Path(__file__).resolve().parents[1]
class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self,*args,**kwargs):return None
class FakeDeepL(BaseHTTPRequestHandler):
    calls=[]
    def do_POST(self):
        body=json.loads(self.rfile.read(int(self.headers['Content-Length'])))
        FakeDeepL.calls.append((self.headers['Authorization'],body))
        data=json.dumps({'translations':[{'detected_source_language':'RU','text':f"[{body['target_lang']}] {text}"} for text in body['text']]}).encode()
        self.send_response(200);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data)
    def log_message(self,*args):pass
class CabinetTest(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.db=Path(self.temp.name)/'test.sqlite3'
        FakeDeepL.calls.clear()
        self.deepl=ThreadingHTTPServer(('127.0.0.1',0),FakeDeepL);threading.Thread(target=self.deepl.serve_forever,daemon=True).start()
        with socket.socket() as sock:sock.bind(('127.0.0.1',0));self.port=sock.getsockname()[1]
        self.url=f'http://127.0.0.1:{self.port}'
        env={**os.environ,'NFC_DB':str(self.db),'DEEPL_API_KEY':'test-key:fx','DEEPL_API_URL':f'http://127.0.0.1:{self.deepl.server_port}/v2/translate'}
        self.proc=subprocess.Popen([sys.executable,str(ROOT/'server.py'),'--port',str(self.port)],env=env,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        for _ in range(60):
            try:
                with socket.create_connection(('127.0.0.1',self.port),timeout=.1):return
            except OSError:time.sleep(.05)
        self.fail('Server did not start')
    def tearDown(self):self.proc.terminate();self.proc.wait();self.deepl.shutdown();self.deepl.server_close();self.temp.cleanup()
    def client(self):return build_opener(HTTPCookieProcessor(http.cookiejar.CookieJar()),NoRedirect)
    def req(self,client,path,method='GET',body=None):
        request=Request(self.url+path,data=json.dumps(body).encode() if body is not None else None,headers={'Content-Type':'application/json','Origin':self.url},method=method)
        try:response=client.open(request)
        except HTTPError as e:response=e
        raw=response.read();response.close()
        return response.code,json.loads(raw) if response.headers.get('Content-Type','').startswith('application/json') else raw,response.headers
    def test_account_page_layout_and_translations(self):
        owner,anon=self.client(),self.client()
        status,data,_=self.req(owner,'/api/register','POST',{'email':'owner@example.test','password':'owner-test-password'});self.assertEqual(status,200);uid=data['id']
        status,_,headers=self.req(anon,'/account');self.assertEqual(status,303);self.assertTrue(headers['Location'].endswith('/?account=1'))
        self.assertEqual(self.req(owner,'/account')[0],303)  # no card yet: first creation stays in the editor dialog
        profile={'firstName':'Анна','job':'Дизайнер','bio':'Люблю смелые идеи.','titleAbout':'Кто я','sections':'contacts,about,!skills,services,opportunities','vcard':'off'}
        status,data,_=self.req(owner,'/api/profile','PUT',profile);self.assertEqual(status,200);self.assertTrue(data['translated'])
        self.assertEqual(len(FakeDeepL.calls),4);self.assertEqual(FakeDeepL.calls[0][0],'DeepL-Auth-Key test-key:fx')
        status,page,_=self.req(owner,'/account');self.assertEqual(status,200);self.assertIn(b'src="/cabinet.js"',page)
        self.assertEqual(self.req(anon,'/cabinet.js')[0],200);self.assertEqual(self.req(anon,'/profile-card.js')[0],200)
        public=self.req(anon,'/api/public/'+uid)[1]
        self.assertEqual(public['profile']['sections'],profile['sections']);self.assertEqual(public['profile']['vcard'],'off')
        translations=public['translations']
        self.assertEqual(translations['ru']['bio'],profile['bio'])
        self.assertEqual(translations['en']['bio'],'[EN-GB] '+profile['bio'])
        self.assertEqual(translations['de']['titleAbout'],'[DE] Кто я')
        self.assertNotIn('firstName',translations['pl'])
        for bad in ({'sections':'about,about,skills,services,contacts'},{'sections':'about,skills'},{'vcard':'maybe'}):
            self.assertEqual(self.req(owner,'/api/profile','PUT',bad)[0],400)
        self.assertEqual(self.req(owner,'/api/profile','PUT',profile)[0],200);self.assertEqual(len(FakeDeepL.calls),4)  # unchanged text is cached
        self.assertEqual(self.req(anon,'/api/translations','PUT',{'de':{'bio':'x'}})[0],401)
        self.assertEqual(self.req(owner,'/api/translations','PUT',{'fr':{'bio':'x'}})[0],400)
        self.assertEqual(self.req(owner,'/api/translations','PUT',{'de':{'firstName':'x'}})[0],400)
        self.assertEqual(self.req(owner,'/api/translations','PUT',{'de':{'bio':'Ich liebe mutige Ideen.'}})[0],200)
        self.assertEqual(self.req(anon,'/api/public/'+uid)[1]['translations']['de']['bio'],'Ich liebe mutige Ideen.')
        editable=self.req(owner,'/api/translations')[1]
        self.assertTrue(editable['enabled']);self.assertEqual(editable['languages']['de']['bio']['manual'],'Ich liebe mutige Ideen.')
        self.assertEqual(self.req(owner,'/api/profile','PUT',{**profile,'bio':'Новый текст.'})[0],200)
        self.assertEqual(self.req(anon,'/api/public/'+uid)[1]['translations']['de']['bio'],'[DE] Новый текст.')  # correction belonged to the old text
    def test_existing_profiles_are_translated_without_rewriting_them(self):
        self.assertEqual(self.req(self.client(),'/healthz')[0],200)
        stored=json.dumps({'firstName':'Old','job':'Инженер','design':'Лайм'},ensure_ascii=False)
        with sqlite3.connect(self.db) as db:db.execute('INSERT INTO users VALUES(?,?,?,?)',('legacy-id','legacy@example.test','salt:hash',stored))
        translations=self.req(self.client(),'/api/public/legacy-id')[1]['translations']
        self.assertEqual(translations['pl']['job'],'[PL] Инженер')
        with sqlite3.connect(self.db) as db:self.assertEqual(db.execute('SELECT profile FROM users WHERE id=?',('legacy-id',)).fetchone()[0],stored)
if __name__=='__main__':unittest.main()
