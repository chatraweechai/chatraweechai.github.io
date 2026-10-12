# PWA แยกตามชื่อแอป

สร้างจากโค้ดต้นฉบับใน `drama/` ด้วย `python3 drama-pwa/generate.py` (รันใหม่ทุกครั้งที่แก้ `drama/` แล้ว commit โฟลเดอร์ที่ได้)

| ชื่อ | ชื่อเต็ม / ชื่อใต้ไอคอน | URL |
|---|---|---|
| A | Drama Shorts / Drama | https://envburiram.github.io/drama-pwa/drama/ |
| B | ShortReel / ShortReel | https://envburiram.github.io/drama-pwa/shortreel/ |
| C | EpiSwipe / EpiSwipe | https://envburiram.github.io/drama-pwa/episwipe/ |
| D | MiniSeries Player / MiniSeries | https://envburiram.github.io/drama-pwa/miniseries/ |

- แต่ละชื่อมี scope, service worker และ cache ของตัวเอง (`<slug>-v1`) ติดตั้งแยกกันได้
- ทุกชื่ออยู่ origin เดียวกัน (`envburiram.github.io`) จึงใช้ localStorage ร่วมกัน ถ้าผู้ใช้ติดตั้งหลายชื่อ รายการซีรีส์ที่เพิ่มไว้จะเห็นเหมือนกัน
- `drama/` (เดิม) ยังเป็นต้นฉบับที่ถูกห่อเข้าแอป Android
- แอป Android แต่ละชื่อ (flavor) มีไฟล์เว็บ `index.html`, `manifest.webmanifest`, `sw.js` ของตัวเองใน `drama-app/android/app/src/<ชื่อ>/assets/public/` ทับไฟล์ใน `main` `generate.py` สร้างให้ด้วย ชื่อใน PWA ที่ห่อเข้าแอปจึงตรงกับชื่อแอป
