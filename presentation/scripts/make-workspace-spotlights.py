from PIL import Image, ImageDraw, ImageFilter
import os

out = r'c:\Users\Lenovo\Desktop\Desktop\Freelance project\workNest\presentation\public\screenshots'
board = Image.open(os.path.join(out, 'client-kanban-board.png')).convert('RGBA')
ws = Image.open(os.path.join(out, 'user-workspace.png')).convert('RGBA')


def fit_cover(im, size=(1600, 1000), bias_top=False):
    tw, th = size
    scale = max(tw / im.width, th / im.height)
    nw, nh = int(im.width * scale), int(im.height * scale)
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - tw) // 2
    top = 0 if bias_top else (nh - th) // 2
    top = max(0, min(nh - th, top))
    return im.crop((left, top, left + tw, top + th))


def make_spotlight(full, box, color, zoom=2.35):
    """Dim + outline on full frame, then Ken-burns style zoom into the box."""
    im = full.convert('RGBA')
    # normalize width to 1600 for consistent coordinates when source differs
    if im.width != 1600:
        ratio = 1600 / im.width
        im = im.resize((1600, int(im.height * ratio)), Image.Resampling.LANCZOS)
        box = tuple(int(v * ratio) for v in box)

    # dim outside
    overlay = Image.new('RGBA', im.size, (8, 3, 14, 168))
    mask = Image.new('L', im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle(box, radius=14, fill=255)
    overlay = Image.composite(Image.new('RGBA', im.size, (0, 0, 0, 0)), overlay, mask)
    marked = Image.alpha_composite(im, overlay)
    draw = ImageDraw.Draw(marked)
    draw.rounded_rectangle(box, radius=14, outline=color, width=6)
    # inner dashed feel via thinner inset
    draw.rounded_rectangle(
        [box[0] + 6, box[1] + 6, box[2] - 6, box[3] - 6],
        radius=10,
        outline=(*color[:3], 160),
        width=2,
    )

    # zoom crop around box center
    cx = (box[0] + box[2]) / 2
    cy = (box[1] + box[3]) / 2
    bw = box[2] - box[0]
    bh = box[3] - box[1]
    # viewport size before scale so focus fills most of frame
    vw = min(im.width, int(bw * 1.35 + 80))
    vh = min(im.height, int(bh * 1.45 + 80))
    # ensure at least somewhat wide
    vw = max(vw, 700)
    vh = max(vh, 420)
    left = int(cx - vw / 2)
    top = int(cy - vh / 2)
    left = max(0, min(im.width - vw, left))
    top = max(0, min(im.height - vh, top))
    crop = marked.crop((left, top, left + vw, top + vh))
    return fit_cover(crop, (1600, 1000)).convert('RGB')


# Tuned on 1600x1000 client-kanban-board
# Filters sit just above the kanban columns
filters_box = (28, 392, 860, 468)
# Kanban columns only
tasks_box = (24, 470, 1090, 980)

# user-workspace attachments panel (original coords)
ws_w, ws_h = ws.size
attach_box = (int(ws_w * 0.695), int(ws_h * 0.455), int(ws_w * 0.985), int(ws_h * 0.78))

tasks = make_spotlight(board, tasks_box, (249, 115, 22, 255))
filters = make_spotlight(board, filters_box, (165, 106, 189, 255), zoom=2.8)
attach = make_spotlight(ws, attach_box, (74, 222, 128, 255), zoom=2.4)

tasks.save(os.path.join(out, 'workspace-spotlight-tasks.png'), quality=93)
filters.save(os.path.join(out, 'workspace-spotlight-filters.png'), quality=93)
attach.save(os.path.join(out, 'workspace-spotlight-attachments.png'), quality=93)
print('ok', tasks.size, filters.size, attach.size)
