"""Contact sheet: python3 sheet.py <png dir> <out.png> [cols]"""
import sys, glob
from PIL import Image
files = sorted(glob.glob(sys.argv[1] + '/page-[0-9][0-9].png'))
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 4
w, h, g = 640, 360, 8
rows = -(-len(files) // cols)
sheet = Image.new('RGB', (cols * (w + g) + g, rows * (h + g) + g), (200, 200, 200))
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB'); im.thumbnail((w, h))
    sheet.paste(im, (g + (i % cols) * (w + g), g + (i // cols) * (h + g)))
sheet.save(sys.argv[2]); print(len(files), 'pages')
