"""Dean's own photos/clips (sent on WhatsApp 23-24 Nov 2026, copied to ~/dev/dean-media/src; originals in
~/Desktop/Dean are never touched) -> public/client/dean. Also the Higgsfield example images and the swatch cut-outs.
Run: python3 tools/dean-media.py   (needs ffmpeg + cwebp-capable Pillow)"""
import os, subprocess
from PIL import Image, ImageOps

SRC = os.path.expanduser('~/dev/dean-media')
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public/client/dean')

# slug: source photo (contact-sheet id in the comment)
PHOTOS = {
    'blue-games': 'PHOTO-2026-11-23-23-13-56.jpg',     # P04
    'blue-cinema': 'PHOTO-2026-11-23-23-13-57 3.jpg',  # P06
    'blue-bar': 'PHOTO-2026-11-23-23-13-58.jpg',       # P08
    'blue-bathroom': 'PHOTO-2026-11-23-23-13-59.jpg',  # P09
    'pearl-kitchen': 'PHOTO-2026-11-23-23-13-49.jpg',  # P01
    'pearl-kitchen-2': 'PHOTO-2026-11-23-23-13-50.jpg',  # P03
    'dark-bronze': 'PHOTO-2026-11-23-23-13-50 2.jpg',  # P02
    'vein-dining': 'PHOTO-2026-11-23-23-14-00 2.jpg',  # P10
    'vein-hall': 'PHOTO-2026-11-23-23-14-00.jpg',      # P11
    'silver-room': 'PHOTO-2026-11-23-23-16-15.jpg',    # P17
    'silver-toilet': 'PHOTO-2026-11-23-23-16-16 2.jpg',  # P18
    'silver-hall': 'PHOTO-2026-11-23-23-16-16.jpg',    # P19
    'silver-room-2': 'PHOTO-2026-11-23-23-16-17 2.jpg',  # P20
    'grey-large': 'PHOTO-2026-11-23-23-16-18 2.jpg',   # P22
    'grey-large-2': 'PHOTO-2026-11-23-23-16-18.jpg',   # P23
    'red-close': 'PHOTO-2026-11-23-23-16-26.jpg',      # P24
    'speckled-room': 'PHOTO-2026-11-23-23-17-52.jpg',  # P25
    'speckled-room-2': 'PHOTO-2026-11-23-23-14-47 2.jpg',  # P13
    'marble-kitchen': 'PHOTO-2026-11-24-19-32-40 2.jpg',  # P33
    'marble-kitchen-2': 'PHOTO-2026-11-24-19-32-40 3.jpg',  # P34
}
# slug: (source clip, start s, length s). Finished floors only; cut before any end card.
CLIPS = {
    'blue-led': ('VIDEO-2026-11-24-19-32-51.mp4', 0, 14),      # V58
    'flake-garage': ('VIDEO-2026-11-23-23-19-32.mp4', 0, 12),  # V46
    'white-metallic': ('VIDEO-2026-11-23-23-13-27.mp4', 0, 10),  # V01
}
GEN = ['warehouse', 'factory', 'workshop', 'unit']  # Higgsfield gpt_image_2_6, labelled "Example finish" on the page


def webp(im, path, w, q=80):
    im = im.copy()
    if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(path, quality=q, method=6)


def main():
    os.makedirs(OUT, exist_ok=True)
    for slug, f in PHOTOS.items():
        im = ImageOps.exif_transpose(Image.open(f'{SRC}/src/{f}')).convert('RGB')
        webp(im, f'{OUT}/{slug}-1600.webp', 1600); webp(im, f'{OUT}/{slug}-1280.webp', 1280); webp(im, f'{OUT}/{slug}-640.webp', 640, 78)  # 640 = tile/thumb
    for slug, (f, ss, t) in CLIPS.items():
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', str(ss), '-t', str(t), '-i', f'{SRC}/src/{f}', '-an',
                        '-vf', "scale='if(gt(iw,ih),960,-2)':'if(gt(iw,ih),-2,960)'", '-c:v', 'libx264', '-crf', '27',
                        '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', f'{OUT}/{slug}.mp4'], check=True)
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', str(ss + .3), '-i', f'{SRC}/src/{f}', '-frames:v', '1', f'{OUT}/_p.png'], check=True)
        webp(Image.open(f'{OUT}/_p.png').convert('RGB'), f'{OUT}/{slug}.webp', 960)
    os.remove(f'{OUT}/_p.png')
    for g in GEN:
        im = Image.open(f'{SRC}/gen/{g}.png').convert('RGB')
        webp(im, f'{OUT}/ex-{g}-1600.webp', 1600); webp(im, f'{OUT}/ex-{g}-1280.webp', 1280); webp(im, f'{OUT}/ex-{g}-640.webp', 640, 78)
    for n in ('flake', 'quartz'):  # Dean's sample fans, background removed on his request
        im = Image.open(f'{SRC}/cut/{n}-fan.png').convert('RGBA'); im = im.crop(im.getbbox())
        webp(im, f'{OUT}/swatch-{n}.webp', 900, 86)
    print(len(PHOTOS), 'photos,', len(CLIPS), 'clips,', len(GEN), 'examples')


if __name__ == '__main__':
    main()
