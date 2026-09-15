"""Render the geometric NFC brand mark at favicon and touch-icon sizes."""
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1]
out = root / 'assets' / 'brand'
out.mkdir(parents=True, exist_ok=True)
scale = 16
image = Image.new('RGBA', (64 * scale, 64 * scale))
draw = ImageDraw.Draw(image)
lime = '#d8fa86'
draw.rounded_rectangle((scale, scale, 63 * scale, 63 * scale), radius=18 * scale, fill='#161616')
def stroke(points, width):
    pts = [(round(x * scale), round(y * scale)) for x, y in points]
    draw.line(pts, fill=lime, width=round(width * scale), joint='curve')
    r = width * scale / 2
    for x, y in (pts[0], pts[-1]):
        draw.ellipse((x-r, y-r, x+r, y+r), fill=lime)
stroke([(15,43),(15,21),(30,43),(30,21)],5.5)
for start, control, end in [((39,25),(46,32),(39,39)),((46,19),(58,32),(46,45))]:
    points=[]
    for n in range(101):
        t=n/100
        points.append(tuple((1-t)**2*start[i]+2*(1-t)*t*control[i]+t*t*end[i] for i in (0,1)))
    stroke(points,3.5)
for size, name in [(96,'favicon-96.png'),(192,'favicon-192.png'),(180,'apple-touch-icon.png')]:
    image.resize((size,size), Image.Resampling.LANCZOS).save(out/name)
image.save(root/'favicon.ico',sizes=[(16,16),(32,32),(48,48),(64,64)])
