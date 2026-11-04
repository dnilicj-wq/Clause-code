# One-off: turns the crawled rhinocoating.co.uk HTML into data/legacy.json (blog posts + legal pages).
# Usage: python3 tools/extract-legacy.py <dir-with-raw-html>
import sys, re, json, os
from html.parser import HTMLParser
RAW=sys.argv[1]
def clean(t):
    t=re.sub(r'\s+',' ',t).strip()
    t=t.replace(' — ',', ').replace('—',', ').replace(' – ',' to ').replace('–','-')
    t=re.sub(r',\s*,',',',t)
    t=re.sub(r'\btire(s?)\b',r'tyre\1',t)  # UK spelling
    return t
class P(HTMLParser):
    def __init__(s):
        super().__init__(); s.blocks=[]; s.cur=None; s.buf=''; s.skip=0; s.started=False; s.title=''; s.intitle=False; s.meta=''
    def handle_starttag(s,t,a):
        a=dict(a)
        if t in ('script','style','svg','noscript','nav','footer','form','button'): s.skip+=1
        if t=='title': s.intitle=True
        if t=='meta' and a.get('name')=='description': s.meta=a.get('content','')
        if t in ('h1','h2','h3','h4','p','li'):
            s.cur=t; s.buf=''
    def handle_endtag(s,t):
        if t in ('script','style','svg','noscript','nav','footer','form','button'): s.skip-=1
        if t=='title': s.intitle=False
        if t==s.cur:
            x=clean(s.buf)
            if t=='h1': s.started=True
            if s.started and x: s.blocks.append({'t':'h3' if t=='h4' else t,'x':x})
            s.cur=None; s.buf=''
    def handle_data(s,d):
        if s.intitle: s.title+=d
        if s.skip: return
        if s.cur: s.buf+=d
STOP=re.compile(r'^(Ready to Transform|Request a Quote|Get Your Free|Start Your Project|Related|Want a floor|Explore|More about)',re.I)
out={}
files=[f for f in os.listdir(RAW) if f.startswith('blog__')]+['terms-and-conditions.html','complaints.html','warranty.html','floor-preparation.html']
for f in sorted(files):
    p=P(); p.feed(open(os.path.join(RAW,f),encoding='utf-8').read())
    b=p.blocks; res=[]
    for blk in b:
        if blk['t'] in ('h2',) and STOP.match(blk['x']): break
        res.append(blk)
    slug=f[:-5].replace('__','/')
    for blk in res: blk['x']=re.sub(r'Rhino Coating Ltd99 Long Street,? ?Office 1BMiddletonManchesterM24 6UN','Rhino Coating Ltd, 99 Long Street, Office 1B, Middleton, Manchester, M24 6UN',blk['x'])
    out[slug]={'title':clean(p.title),'meta':clean(p.meta),'blocks':res}
os.makedirs('data',exist_ok=True)
json.dump(out,open('data/legacy.json','w'),indent=1,ensure_ascii=False)
for k,v in out.items(): print(k, len(v['blocks']), v['blocks'][0]['x'][:60] if v['blocks'] else '-', '|', v['blocks'][-1]['x'][:50] if v['blocks'] else '')
