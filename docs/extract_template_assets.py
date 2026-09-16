"""Extract the SIH logo + brain-bulb graphic from the official template PDF with real transparency:
render the page over a transparent background at high DPI and crop the graphic's bounding box."""
import os
import pypdfium2 as p
from PIL import Image

src = r'C:\Users\Rahul S Kandagal\Downloads\SIH2026-IDEA-Presentation-Format.pptx - Google Slides.pdf'
out = r'C:\Users\Rahul S Kandagal\Projects\thermal-sentinel\docs\template_assets'
os.makedirs(out, exist_ok=True)
doc = p.PdfDocument(src)
SCALE = 4  # 288 dpi


def crop_transparent(page_index, bbox_pt, name, drop_grey=False):
    page = doc[page_index]
    W, H = page.get_width(), page.get_height()
    im = page.render(scale=SCALE, fill_color=(0, 0, 0, 0)).to_pil().convert('RGBA')
    l, b, r, t = bbox_pt                       # PDF coords, origin bottom-left
    box = (int(l * SCALE), int((H - t) * SCALE), int(r * SCALE), int((H - b) * SCALE))
    im = im.crop(box)
    if drop_grey:                              # remove the light-grey hexagon fill behind the brain
        px = im.load()
        for y in range(im.height):
            for x in range(im.width):
                R, G, B, A = px[x, y]
                if A and abs(R - G) < 8 and abs(G - B) < 8 and 215 <= R <= 250:
                    px[x, y] = (0, 0, 0, 0)
    im.save(f'{out}\\{name}.png')
    print(name, im.size)


# small logo top-right (same on every page): x 770Ã¢â‚¬â€œ947, y 456Ã¢â‚¬â€œ540 (from bottom)
crop_transparent(1, (768, 454, 949, 540), 'sih_logo')
# brain-bulb on the title page: bbox reported x 540Ã¢â‚¬â€œ1169, y 135Ã¢â‚¬â€œ405; the visible part ends at the page edge (960)
crop_transparent(0, (545, 62, 960, 450), 'brain_bulb')
