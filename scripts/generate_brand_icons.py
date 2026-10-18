"""Generate PWA icon sizes from the official PNG, leaving the source unchanged.
Requires Pillow (build-time only; not application dependencies).
"""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
source = Image.open(ROOT / 'src/assets/miniaturas-horus/logo.png').convert('RGBA')
assert source.size == (1254,1254), 'Review the symbol bounds for a new source logo'
# Extract the complete symbol, including its detached upper crest. The only
# wordmark pixels in this region are below/left of the falcon's tapered tip.
# No recoloring, tracing or changes are applied to the original artwork.
symbol = source.crop((270,125,1000,920))
alpha = symbol.getchannel('A')
ImageDraw.Draw(alpha).rectangle((0,735,430,symbol.height),fill=0)
symbol.putalpha(alpha)
public = ROOT / 'public'
symbol.save(public / 'horus-symbol.png', optimize=True)
for name, size in [('horus-icon-192.png',192),('horus-icon-512.png',512),('apple-touch-icon.png',180),('apple-touch-icon-precomposed.png',180),('favicon-32.png',32),('favicon-16.png',16)]:
    # Padding keeps the complete symbol in the safe zone of rounded app icons.
    canvas = Image.new('RGBA',(size,size),'#061321')
    fit = symbol.copy()
    fit.thumbnail((round(size*.76),round(size*.76)),Image.Resampling.LANCZOS)
    canvas.alpha_composite(fit,((size-fit.width)//2,(size-fit.height)//2))
    canvas.convert('RGB').save(public/name,optimize=True)
print('Official symbol:',symbol.size)
