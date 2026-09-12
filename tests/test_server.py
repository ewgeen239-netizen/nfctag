"""Integration tests run against an isolated temporary SQLite database."""
import http.cookiejar, json, os, socket, sqlite3, subprocess, sys, tempfile, time, unittest
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import build_opener, HTTPCookieProcessor, Request
ROOT=Path(__file__).resolve().parents[1]
class AccountsTest(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.db=Path(self.temp.name)/'test.sqlite3'
        with socket.socket() as sock:sock.bind(('127.0.0.1',0));self.port=sock.getsockname()[1]
        self.url=f'http://127.0.0.1:{self.port}';self.start()
    def start(self):
        self.proc=subprocess.Popen([sys.executable,str(ROOT/'server.py'),'--port',str(self.port)],env={**os.environ,'NFC_DB':str(self.db)},stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        for _ in range(60):
            try:
                with socket.create_connection(('127.0.0.1',self.port),timeout=.1):return
            except OSError:time.sleep(.05)
        self.fail('Server did not start')
    def tearDown(self):self.proc.terminate();self.proc.wait();self.temp.cleanup()
    def client(self):return build_opener(HTTPCookieProcessor(http.cookiejar.CookieJar()))
    def req(self,client,path,method='GET',body=None,origin=True):
        headers={'Content-Type':'application/json'}
        if origin:headers['Origin']=self.url
        request=Request(self.url+path,data=json.dumps(body).encode() if body is not None else None,headers=headers,method=method)
        try:response=client.open(request)
        except HTTPError as e:response=e
        raw=response.read()
        response.close()
        return response.code,json.loads(raw) if response.headers.get('Content-Type','').startswith('application/json') else raw,response.headers
    def test_accounts_immutable_links_and_restart(self):
        a,b,anon=self.client(),self.client(),self.client()
        credentials={'email':'a@example.test','password':'first-test-password'}
        status,data,headers=self.req(a,'/api/register','POST',credentials);self.assertEqual(status,200);aid=data['id']
        self.assertIn('HttpOnly',headers['Set-Cookie']);self.assertIn('SameSite=Strict',headers['Set-Cookie'])
        status,data,_=self.req(b,'/api/register','POST',{'email':'b@example.test','password':'second-test-password'});self.assertEqual(status,200);bid=data['id'];self.assertNotEqual(aid,bid)
        self.assertEqual(self.req(anon,'/api/me')[0],401)
        self.assertEqual(self.req(anon,'/api/profile','PUT',{'firstName':'Unauthorized'})[0],401)
        self.assertEqual(self.req(a,'/api/profile','PUT',{'firstName':'Alice','design':'Лайм','idea':'Private design brief'})[0],200)
        self.assertIn('<span data-account-label>Личный кабинет</span>'.encode(),self.req(a,'/')[1])
        self.assertIn('<span data-account-label>Войти</span>'.encode(),self.req(anon,'/')[1])
        contacts={'instagram':'https://www.instagram.com/test.profile','telegram':'https://t.me/test_profile','whatsapp':'+48 123 456 789','contactEmail':'contact@example.test','services':'Design consultation','accent':'lilac','bio':'A detailed description. '*50}
        self.assertEqual(self.req(a,'/api/profile','PUT',contacts)[0],200)
        for key,value in contacts.items():self.assertEqual(self.req(anon,'/api/public/'+aid)[1]['profile'][key],value.strip())
        self.assertEqual(self.req(a,'/api/profile','PUT',{'instagram':'https://evil.test/test'})[0],400)
        self.assertEqual(self.req(a,'/api/profile','PUT',{'telegram':'javascript:alert(1)'})[0],400)
        self.assertEqual(self.req(a,'/api/profile','PUT',{'whatsapp':'123'})[0],400)
        self.assertEqual(self.req(a,'/api/profile','PUT',{'accent':'arbitrary-css'})[0],400)
        self.assertEqual(self.req(anon,'/api/public/'+aid)[1]['profile']['instagram'],contacts['instagram'])
        url=self.req(a,'/api/me')[1]['publicUrl'];self.assertTrue(url.endswith('/p/'+aid))
        self.assertEqual(self.req(anon,'/api/public/'+aid)[1]['profile']['firstName'],'Alice')
        self.assertNotIn('idea',self.req(anon,'/api/public/'+aid)[1]['profile'])
        self.assertNotIn('email',self.req(anon,'/api/public/'+aid)[1])
        for key in ['id','user_id','public_id','publicUrl','email']:
            self.assertEqual(self.req(b,'/api/profile','PUT',{'firstName':'Hacked',key:aid})[0],403)
        self.assertIn(self.req(b,'/api/profile/'+aid,'PUT',{'firstName':'Hacked'})[0],(404,405))
        self.assertEqual(self.req(b,'/api/profile','PUT',{'firstName':'Bob'})[0],200)
        self.assertEqual(self.req(anon,'/api/public/'+aid)[1]['profile']['firstName'],'Alice')
        self.assertEqual(self.req(a,'/api/profile','PUT',{'firstName':'Alice updated','design':'Сирень'})[0],200)
        self.assertEqual(self.req(a,'/api/me')[1]['publicUrl'],url)
        self.assertEqual(self.req(anon,'/api/public/'+aid)[1]['profile']['telegram'],contacts['telegram'])
        self.assertEqual(self.req(a,'/api/profile','PUT',{'firstName':'CSRF'},origin=False)[0],403)
        self.assertEqual(self.req(anon,'/data/nfc.sqlite3')[0],404)
        self.assertEqual(self.req(anon,'/server.py')[0],404)
        self.assertEqual(self.req(anon,'/p/'+aid)[0],200)
        self.assertIn(b'href="/style.css"',self.req(anon,'/p/'+aid)[1])
        self.assertIn(b'src="/account.js"',self.req(anon,'/p/'+aid)[1])
        self.proc.terminate();self.proc.wait();self.start()
        self.assertEqual(self.req(a,'/api/me')[1]['publicUrl'],url)
        self.assertEqual(self.req(anon,'/api/public/'+aid)[1]['profile']['firstName'],'Alice updated')
        self.assertEqual(self.req(a,'/api/logout','POST',{})[0],200)
        self.assertEqual(self.req(a,'/api/me')[0],401)
        self.assertEqual(self.req(a,'/api/login','POST',{**credentials,'password':'wrong-password'})[0],401)
        self.assertEqual(self.req(a,'/api/login','POST',credentials)[0],200)
        self.assertEqual(self.req(a,'/api/me')[1]['id'],aid)
        link=subprocess.check_output([sys.executable,str(ROOT/'server.py'),'--port',str(self.port),'--local-login',credentials['email']],env={**os.environ,'NFC_DB':str(self.db)},text=True).strip()
        link_path=link.removeprefix(self.url)
        self.assertEqual(self.req(anon,link_path)[0],200)
        self.assertEqual(self.req(anon,'/api/me')[1]['id'],aid)
        self.assertEqual(self.req(self.client(),link_path)[0],404)
        with sqlite3.connect(self.db) as db:
            stored=db.execute('SELECT password FROM users WHERE id=?',(aid,)).fetchone()[0]
            self.assertNotEqual(stored,credentials['password']);self.assertIn(':',stored)
if __name__=='__main__':unittest.main()
