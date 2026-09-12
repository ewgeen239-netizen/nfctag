"""Copy only public assets into Vercel's CDN directory."""
from pathlib import Path
import shutil

root = Path(__file__).resolve().parents[1]
public = root / 'public'
public.mkdir(exist_ok=True)
for name in ('style.css', 'app.js', 'account.js', 'i18n.js', 'hero-loader.js', 'hero-scene.js'):
    shutil.copy2(root / name, public / name)
shutil.copytree(root / 'assets', public / 'assets', dirs_exist_ok=True)
