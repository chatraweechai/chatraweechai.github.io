#!/usr/bin/env python3
"""สร้าง PWA แยกตามชื่อแอปจากโค้ดต้นฉบับใน ../drama (รันใหม่ทุกครั้งที่แก้ drama/)"""
import json, pathlib, shutil

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT.parent / 'drama'
ANDROID = ROOT.parent / 'drama-app' / 'android' / 'app' / 'src'
SHARED = ['app.js', 'style.css', 'library.json', 'icon.svg']
VARIANTS = {
    # slug: (ชื่อเต็ม, ชื่อสั้นใต้ไอคอน)
    'drama': ('Drama Shorts', 'Drama'),
    'shortreel': ('ShortReel', 'ShortReel'),
    'episwipe': ('EpiSwipe', 'EpiSwipe'),
    'miniseries': ('MiniSeries Player', 'MiniSeries'),
}

for slug, (name, short) in VARIANTS.items():
    out = ROOT / slug
    shutil.rmtree(out, ignore_errors=True)
    out.mkdir()
    for f in SHARED:
        shutil.copy(SRC / f, out / f)

    html = (SRC / 'index.html').read_text(encoding='utf-8')
    assert '<title>Drama Shorts</title>' in html
    (out / 'index.html').write_text(html.replace('<title>Drama Shorts</title>', f'<title>{name}</title>'), encoding='utf-8')

    m = json.loads((SRC / 'manifest.webmanifest').read_text(encoding='utf-8'))
    m['name'], m['short_name'] = name, short
    (out / 'manifest.webmanifest').write_text(json.dumps(m, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    sw = (SRC / 'sw.js').read_text(encoding='utf-8')
    assert "const CACHE = 'drama-v1';" in sw and "k.startsWith('drama-')" in sw
    sw = sw.replace("const CACHE = 'drama-v1';", f"const CACHE = '{slug}-v1';").replace("k.startsWith('drama-')", f"k.startsWith('{slug}-')")
    (out / 'sw.js').write_text(sw, encoding='utf-8')
    # แอป Android: ไฟล์เว็บของแต่ละ flavor ทับ assets/public ของ main ให้ชื่อใน PWA ตรงกับชื่อแอป
    if slug != 'drama':
        fl = ANDROID / slug / 'assets' / 'public'
        shutil.rmtree(fl.parent, ignore_errors=True)
        fl.mkdir(parents=True)
        for f in ('index.html', 'manifest.webmanifest', 'sw.js'):
            shutil.copy(out / f, fl / f)
    print('ok', slug, name)
