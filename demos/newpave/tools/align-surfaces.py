# Lines up Dan's finished-drive photos with the original photo and writes one full-frame image per
# surface, all in the same frame, so the hero and the designer can swap the real drive in.
#
#   stock/dan-drive.jpg        the original (old block paving): the "before"
#   stock/surfaces/resin.jpg   same frame as the original, sharper: used as the base outside the drive
#   stock/surfaces/{block,tarmac,porcelain}.jpg
#                              re-framed slightly (zoomed, turned), so their drive is mapped onto the
#                              original drive with a ground-plane homography from hand-picked points
#                              (fence corner, bins, house corner, tyre contacts, path and kerb corners)
#
# Inside the drive (scene mask R, which already leaves the parked car out) each photo's own drive is
# used; outside it, the resin photo. Output: public/img/surf-<name>-d.webp (2576 x 1438).
# Run after scripts/prep-scenes.mjs (it makes the drive mask): python3 tools/align-surfaces.py
# (needs opencv-python-headless).
import cv2, numpy as np, os, subprocess, tempfile
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S, O = R + '/stock/', R + '/public/img/'
W, H = 2576, 1438
SUF = 'd'

# ground points: original frame (2576 wide) <- porcelain frame
PO = [(215, 486), (433, 518), (553, 548), (807, 572), (1067, 659), (1667, 607), (1518, 586), (2289, 711)]
PP = [(249, 400), (455, 423), (594, 456), (845, 488), (1110, 591), (1715, 539), (1566, 510), (2428, 701)]
Hg, _ = cv2.findHomography(np.float32(PP), np.float32(PO), 0)

sift = cv2.SIFT_create(10000)
def to_porcelain(img, ref):
    """block and tarmac are near-identical framings of the porcelain photo: match them to it"""
    ga, gb = [cv2.cvtColor(x, cv2.COLOR_BGR2GRAY) for x in (img, ref)]
    ka, da = sift.detectAndCompute(ga, None); kb, db = sift.detectAndCompute(gb, None)
    m = cv2.BFMatcher().knnMatch(da, db, k=2); good = [a for a, b in m if a.distance < .7 * b.distance]
    h, inl = cv2.findHomography(np.float32([ka[a.queryIdx].pt for a in good]), np.float32([kb[a.trainIdx].pt for a in good]), cv2.RANSAC, 3.0)
    print('  matched to porcelain:', int(inl.sum()), 'points')
    return h

# drive mask (R), same frame, 1500 px + 60 px pad
mk = cv2.imread(O + 'scene-drive-mask-c.png')[:, :, 2].astype(np.float32) / 255
pad, mw = 60, 1500; mh = round(837 * mw / 1500)
m = cv2.resize(mk[pad:pad + mh, pad:pad + mw], (W, H), interpolation=cv2.INTER_CUBIC)
m = np.clip(m, 0, 1)[..., None]

CUT = '/tmp/np-scenes/cutout'  # tools/cutout.swift (Apple Vision), built by scripts/prep-scenes.mjs
if not os.path.exists(CUT): subprocess.run(['swiftc', '-O', R + '/tools/cutout.swift', '-o', CUT], check=True)
def car_alpha(img, box=(420, 160, 1560, 700)):
    """the re-framed photos have their own car (Apple Vision cut-out). It is not on the ground plane, so
    after the ground warp it no longer matches the real car: where it sticks out, it is painted over
    from the drive around it. Its shadow is on the ground, so the warp puts that in the right place."""
    x0, y0, x1, y1 = box; t = tempfile.mkdtemp()
    cv2.imwrite(t + '/c.png', img[y0:y1, x0:x1]); subprocess.run([CUT, t + '/c.png', t + '/f.png'], check=True, capture_output=True)
    a = np.zeros(img.shape[:2], np.float32); a[y0:y1, x0:x1] = cv2.imread(t + '/f.png', cv2.IMREAD_UNCHANGED)[:, :, 3] / 255
    return a

base = cv2.imread(S + 'surfaces/resin.jpg')
orig = cv2.resize(cv2.imread(S + 'dan-drive.jpg'), (W, H), interpolation=cv2.INTER_LANCZOS4)
porc = cv2.imread(S + 'surfaces/porcelain.jpg')

def comp(inside):
    return np.clip(base * (1 - m) + inside * m, 0, 255).astype(np.uint8)

# the drive's average colour (well inside it): the designer's swatch for each photo's own colour
core = (m[..., 0] > .99)
def stats(img):
    return '#' + ''.join(f'{int(v):02x}' for v in np.median(img[core][:, ::-1], 0))

out = {}
def save(name, img):
    cv2.imwrite(O + f'surf-{name}-{SUF}.webp', img, [cv2.IMWRITE_WEBP_QUALITY, 82])
    out[name] = stats(img); print(name, out[name], os.path.getsize(O + f'surf-{name}-{SUF}.webp') // 1024, 'KB')

save('before', comp(orig))
save('resin', base)
for name in ('porcelain', 'block', 'tarmac'):
    img = cv2.imread(S + f'surfaces/{name}.jpg')
    h = Hg if name == 'porcelain' else Hg @ to_porcelain(img, porc)
    w = cv2.warpPerspective(img, h, (W, H), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REFLECT)
    ca = cv2.warpPerspective(car_alpha(img), h, (W, H))
    stray = ((ca > .2) & (m[..., 0] > .02)).astype(np.uint8) * 255
    stray = cv2.dilate(stray, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)))
    w = cv2.inpaint(w, stray, 7, cv2.INPAINT_TELEA)
    save(name, comp(w))
