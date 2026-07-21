"""
Seed materi awal Dayanusa untuk demo/produksi awal.

Tujuan:
- Menyediakan modul PKBM yang langsung tampil di dashboard siswa.
- Menyediakan kelas soft-skill yang cukup kaya untuk knowledge base RAG.
- Aman dijalankan berulang: update konten dengan kunci judul, bukan duplikasi terus-menerus.

Jalankan:
    PYTHONPATH=/app python scripts/seed_starter_content.py
"""

from __future__ import annotations

import asyncio
from collections.abc import Iterable

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.academic import Lesson, Module
from app.models.enums import ContentType, PaketLevel, SkillLevel, SoftSkillCategory
from app.models.softskill import SkillLesson, SoftSkillClass


ACADEMIC_MODULES = [
    {
        "paket": PaketLevel.PAKET_A,
        "subject": "Matematika",
        "title": "Fondasi Matematika: Pola, Pecahan, dan Cerita Sehari-hari",
        "description": (
            "Modul pengantar untuk membiasakan siswa Paket A membaca pola, memahami pecahan, "
            "dan menghubungkan matematika dengan aktivitas rumah serta usaha kecil keluarga."
        ),
        "order_index": 1,
        "lessons": [
            {
                "title": "Mengenal Pola dan Hubungan Angka",
                "order_index": 1,
                "duration_minutes": 25,
                "content_text": (
                    "Pola adalah susunan yang berulang atau bertambah dengan aturan tertentu. "
                    "Dalam kehidupan sehari-hari, pola dapat ditemukan pada jadwal belajar, urutan hari, "
                    "susunan ubin, sampai irama menabung harian. Ketika siswa memahami pola, mereka belajar "
                    "menebak langkah berikutnya dengan alasan yang logis, bukan sekadar menebak.\n\n"
                    "Contoh sederhana: 2, 4, 6, 8. Setiap angka bertambah 2. Dari sini siswa dapat memprediksi "
                    "bahwa angka berikutnya adalah 10. Latihan seperti ini melatih dasar berpikir aljabar karena "
                    "anak belajar melihat hubungan antarangka. Guru atau orang tua dapat mengajak siswa membuat pola "
                    "sendiri menggunakan benda di rumah, misalnya sendok, buku, atau gelas.\n\n"
                    "Pola juga penting untuk menyelesaikan masalah. Jika seorang anak menabung Rp2.000 per hari, "
                    "maka dalam 5 hari ia menabung Rp10.000. Siswa dapat melihat bahwa hasil akhir bergantung pada "
                    "aturan yang konsisten. Inilah dasar keterampilan numerasi yang dibutuhkan pada jenjang berikutnya."
                ),
            },
            {
                "title": "Pecahan dalam Aktivitas Rumah",
                "order_index": 2,
                "duration_minutes": 30,
                "content_text": (
                    "Pecahan membantu kita memahami bagian dari suatu keseluruhan. Ketika ibu membagi satu roti menjadi "
                    "empat bagian sama besar, setiap bagian bernilai seperempat. Konsep ini penting agar siswa tidak hanya "
                    "menghafal angka, tetapi memahami makna bagian dan keseluruhan.\n\n"
                    "Dalam kegiatan rumah tangga, pecahan muncul saat membagi makanan, mengukur bahan masakan, atau mengatur "
                    "waktu. Misalnya setengah jam berarti 30 menit, seperempat kilogram berarti 250 gram. Dengan contoh "
                    "konkret seperti ini, siswa lebih mudah menangkap fungsi pecahan.\n\n"
                    "Ajak siswa membandingkan mana yang lebih besar antara setengah dan seperempat. Gunakan gambar lingkaran "
                    "atau potongan kertas agar mereka melihat bahwa setengah mewakili bagian yang lebih besar. Latihan visual "
                    "membantu siswa membangun konsep sebelum masuk ke operasi hitung pecahan."
                ),
            },
        ],
    },
    {
        "paket": PaketLevel.PAKET_B,
        "subject": "IPA",
        "title": "Sains Dasar SMP: Fotosintesis dan Ekosistem",
        "description": (
            "Modul Paket B untuk memahami cara tumbuhan membuat makanan, hubungan makhluk hidup, "
            "dan pentingnya menjaga keseimbangan lingkungan di sekitar siswa."
        ),
        "order_index": 2,
        "lessons": [
            {
                "title": "Fotosintesis dengan Bahasa Sederhana",
                "order_index": 1,
                "duration_minutes": 35,
                "content_text": (
                    "Fotosintesis adalah proses tumbuhan membuat makanan sendiri. Tumbuhan memerlukan cahaya matahari, air, "
                    "dan karbon dioksida dari udara. Dengan bantuan klorofil yang terdapat pada daun, tumbuhan mengubah bahan "
                    "tersebut menjadi glukosa sebagai makanan dan oksigen yang dilepas ke udara.\n\n"
                    "Cara menjelaskannya ke siswa SMP adalah dengan analogi dapur. Matahari berperan seperti kompor atau sumber "
                    "energi, air dan karbon dioksida seperti bahan masakan, dan daun seperti dapur tempat proses berlangsung. "
                    "Hasil akhirnya adalah makanan untuk tumbuhan sekaligus oksigen yang bermanfaat bagi manusia dan hewan.\n\n"
                    "Siswa dapat mengamati bahwa tanaman yang sehat umumnya berada di tempat cukup cahaya dan air. Dari pengamatan "
                    "sederhana ini, mereka belajar bahwa sains selalu terkait dengan sebab dan akibat. Materi fotosintesis juga "
                    "membuka diskusi tentang pentingnya menanam pohon, menjaga ruang hijau, dan kualitas udara di lingkungan."
                ),
            },
            {
                "title": "Ekosistem dan Rantai Saling Bergantung",
                "order_index": 2,
                "duration_minutes": 35,
                "content_text": (
                    "Ekosistem adalah hubungan antara makhluk hidup dan lingkungannya. Di dalam satu ekosistem, tumbuhan, hewan, "
                    "manusia, air, tanah, dan udara saling memengaruhi. Jika satu bagian rusak, bagian lain ikut terdampak. "
                    "Karena itu, siswa perlu memahami bahwa alam bekerja sebagai sistem yang saling terhubung.\n\n"
                    "Contohnya pada kebun sekolah: tumbuhan membutuhkan tanah dan air, serangga membantu penyerbukan, burung memakan "
                    "serangga tertentu, dan manusia menjaga kebersihan kebun. Jika sampah menumpuk atau tanaman ditebang sembarangan, "
                    "keseimbangan dapat terganggu. Akibatnya, jumlah serangga atau kualitas tanah ikut berubah.\n\n"
                    "Pembahasan ekosistem melatih siswa berpikir sistematis. Mereka belajar bahwa keputusan kecil, seperti membuang sampah "
                    "pada tempatnya atau merawat tanaman, punya dampak yang nyata. Materi ini juga relevan untuk membangun karakter peduli lingkungan."
                ),
            },
        ],
    },
    {
        "paket": PaketLevel.PAKET_C,
        "subject": "Bahasa Indonesia",
        "title": "Komunikasi Akademik: Teks Eksposisi dan Argumen",
        "description": (
            "Modul Paket C untuk melatih kemampuan membaca gagasan, menyusun argumen, dan menulis teks eksposisi "
            "secara runtut, logis, dan meyakinkan."
        ),
        "order_index": 3,
        "lessons": [
            {
                "title": "Struktur Teks Eksposisi",
                "order_index": 1,
                "duration_minutes": 30,
                "content_text": (
                    "Teks eksposisi adalah teks yang bertujuan menjelaskan gagasan atau pendapat dengan alasan yang logis. "
                    "Struktur umumnya terdiri dari tesis, rangkaian argumen, dan penegasan ulang. Dengan memahami struktur ini, "
                    "siswa dapat menulis lebih terarah dan tidak melompat-lompat.\n\n"
                    "Bagian tesis berisi pandangan utama penulis, misalnya 'literasi digital penting bagi pelajar'. Setelah itu, "
                    "penulis menyajikan argumen berupa data, contoh, atau penalaran yang mendukung tesis. Di bagian akhir, penulis "
                    "menegaskan kembali inti pendapat dengan bahasa yang lebih mantap.\n\n"
                    "Latihan efektif adalah meminta siswa membaca artikel pendek lalu menandai mana tesis, mana alasan, dan mana penutupnya. "
                    "Kegiatan ini membantu mereka melihat pola tulisan argumentatif sebelum menyusun karya sendiri."
                ),
            },
            {
                "title": "Menyusun Argumen yang Meyakinkan",
                "order_index": 2,
                "duration_minutes": 35,
                "content_text": (
                    "Argumen yang baik tidak cukup hanya berisi pendapat. Argumen perlu didukung contoh, fakta, pengalaman, atau data yang relevan. "
                    "Siswa perlu membedakan antara pernyataan subjektif seperti 'menurut saya bagus' dengan argumen yang lebih kuat seperti "
                    "'program ini efektif karena meningkatkan disiplin belajar dan memberi akses materi yang fleksibel'.\n\n"
                    "Salah satu teknik sederhana adalah pola pernyataan-sebab-contoh. Misalnya: belajar mandiri perlu dilatih, karena dunia kerja "
                    "menuntut inisiatif, contohnya saat seseorang harus menyelesaikan tugas tanpa diawasi terus-menerus. Pola ini membuat tulisan "
                    "lebih jelas dan mudah diikuti pembaca.\n\n"
                    "Dalam konteks Dayanusa, siswa bisa berlatih menulis argumen tentang homeschooling, literasi digital, atau kewirausahaan. Topik "
                    "yang dekat dengan kehidupan mereka akan membuat proses menulis lebih hidup dan relevan."
                ),
            },
        ],
    },
]


SOFT_SKILL_CLASSES = [
    {
        "title": "Fundamental Digital Marketing untuk Pemula",
        "category": SoftSkillCategory.DIGITAL_MARKETING,
        "description": (
            "Kelas pengantar untuk memahami perilaku audiens, kanal pemasaran digital, "
            "dan cara menyusun pesan yang tepat untuk produk atau layanan sederhana."
        ),
        "skkni_code": "DM-START-01",
        "level": SkillLevel.BEGINNER,
        "is_bnsp_certified": True,
        "lessons": [
            {
                "title": "Mengenal Audiens dan Masalah yang Mereka Hadapi",
                "order_index": 1,
                "duration_minutes": 30,
                "content_text": (
                    "Digital marketing selalu dimulai dari pemahaman audiens. Sebelum membuat poster, caption, atau iklan, "
                    "siswa perlu tahu siapa calon pembeli, masalah apa yang mereka alami, dan bahasa seperti apa yang paling dekat "
                    "dengan kehidupan mereka. Produk yang bagus bisa gagal terjual jika pesan yang disampaikan tidak cocok dengan audiens.\n\n"
                    "Cara sederhana memetakan audiens adalah dengan menjawab tiga pertanyaan: siapa mereka, apa kebutuhan mereka, dan mengapa "
                    "mereka harus peduli dengan produk kita. Misalnya untuk produk camilan sehat pelajar, audiensnya bisa siswa dan orang tua, "
                    "kebutuhannya camilan praktis, dan alasan membeli adalah lebih hemat serta lebih sehat.\n\n"
                    "Dengan memahami audiens, siswa belajar bahwa pemasaran bukan sekadar menjual, tetapi membantu orang menemukan solusi yang tepat. "
                    "Keterampilan ini penting untuk usaha kecil, personal branding, maupun kampanye sosial."
                ),
            },
            {
                "title": "Menyusun Pesan Promosi yang Jelas",
                "order_index": 2,
                "duration_minutes": 35,
                "content_text": (
                    "Pesan promosi yang baik harus singkat, jelas, dan menjawab manfaat utama produk. Hindari kalimat terlalu ramai yang justru membuat "
                    "audiens bingung. Fokus pada satu manfaat utama, misalnya hemat waktu, lebih praktis, atau membantu menyelesaikan masalah tertentu.\n\n"
                    "Struktur sederhana yang bisa dipakai adalah: masalah, solusi, ajakan. Contohnya: 'Sering bingung cari ide konten? Paket template kami "
                    "membantu kamu posting lebih cepat. Coba sekarang.' Struktur seperti ini memudahkan siswa membuat caption, headline, atau deskripsi "
                    "produk yang lebih meyakinkan.\n\n"
                    "Latihan terbaik adalah membandingkan dua versi promosi: yang terlalu umum dan yang fokus pada manfaat. Dari sana siswa belajar bahwa "
                    "copywriting yang efektif selalu berorientasi pada kebutuhan orang lain."
                ),
            },
        ],
    },
    {
        "title": "Content Creator: Menulis Skrip dan Membangun Hook",
        "category": SoftSkillCategory.CONTENT_CREATOR,
        "description": (
            "Kelas dasar content creator untuk melatih kemampuan membuat hook, kerangka skrip, "
            "dan alur penyampaian konten yang ringkas tapi menarik."
        ),
        "skkni_code": "CC-START-02",
        "level": SkillLevel.BEGINNER,
        "is_bnsp_certified": True,
        "lessons": [
            {
                "title": "Hook 3 Detik Pertama",
                "order_index": 1,
                "duration_minutes": 25,
                "content_text": (
                    "Hook adalah bagian pembuka yang membuat audiens mau berhenti dan memperhatikan konten. Dalam video pendek, tiga detik pertama sering "
                    "menentukan apakah penonton lanjut menonton atau langsung melewati. Karena itu, siswa perlu belajar membuat pembuka yang relevan, jelas, "
                    "dan memancing rasa ingin tahu.\n\n"
                    "Hook yang efektif biasanya memakai salah satu dari tiga pendekatan: pertanyaan tajam, janji hasil, atau fakta yang mengejutkan. Misalnya: "
                    "'Kenapa kontenmu sepi padahal sudah rajin posting?', atau 'Cuma 3 langkah untuk bikin caption yang lebih laku'. Bentuk seperti ini langsung "
                    "membantu audiens memahami alasan mereka harus menyimak konten.\n\n"
                    "Hook bukan clickbait kosong. Isi konten tetap harus menepati janji pembukanya. Jika tidak, audiens kehilangan kepercayaan. Inilah dasar etika "
                    "content creation yang penting ditanamkan sejak awal."
                ),
            },
            {
                "title": "Kerangka Skrip: Buka, Jelaskan, Ajak",
                "order_index": 2,
                "duration_minutes": 30,
                "content_text": (
                    "Banyak pemula merasa buntu saat membuat konten karena tidak punya kerangka. Padahal, skrip sederhana cukup dibangun dari tiga bagian: pembuka, "
                    "isi, dan penutup. Pembuka menarik perhatian, isi menyampaikan nilai utama, dan penutup mengajak audiens melakukan langkah berikutnya.\n\n"
                    "Dalam praktiknya, siswa bisa menulis tiga sampai lima poin inti sebelum merekam. Cara ini membuat isi video lebih fokus dan mengurangi kebiasaan "
                    "berbicara berputar-putar. Untuk konten edukasi, pola ini sangat efektif karena membantu audiens menangkap ide utama lebih cepat.\n\n"
                    "Ajakan di akhir tidak selalu harus menjual. Bisa juga berupa ajakan berdiskusi, mencoba tips, atau menyimpan konten untuk dipelajari lagi. Dengan "
                    "demikian, siswa belajar bahwa konten yang baik tidak hanya ditonton, tetapi juga mendorong tindakan."
                ),
            },
        ],
    },
    {
        "title": "Product Creator: Validasi Ide dan Nilai Produk",
        "category": SoftSkillCategory.PRODUCT_CREATOR,
        "description": (
            "Kelas dasar untuk menilai apakah ide produk layak dikembangkan, siapa penggunanya, "
            "dan bagaimana merumuskan nilai utama sebelum masuk ke tahap produksi."
        ),
        "skkni_code": "PC-START-03",
        "level": SkillLevel.BEGINNER,
        "is_bnsp_certified": True,
        "lessons": [
            {
                "title": "Dari Masalah ke Ide Produk",
                "order_index": 1,
                "duration_minutes": 30,
                "content_text": (
                    "Ide produk yang kuat biasanya lahir dari masalah yang nyata, bukan sekadar ikut tren. Karena itu, langkah pertama product creator adalah "
                    "mengamati hambatan yang sering dialami orang. Misalnya pelajar kesulitan mengatur waktu belajar, atau UMKM bingung membuat promosi yang konsisten.\n\n"
                    "Setelah masalah ditemukan, siswa dapat menuliskan siapa yang mengalami masalah tersebut, kapan masalah muncul, dan apa dampaknya jika tidak "
                    "terselesaikan. Dari situ, ide produk menjadi lebih spesifik dan lebih mudah diuji. Produk tidak harus langsung canggih; bisa berupa template, "
                    "panduan, layanan sederhana, atau alat bantu kecil.\n\n"
                    "Latihan ini penting karena membiasakan siswa berpikir berbasis kebutuhan pasar. Mereka belajar bahwa produk yang baik bukan hanya kreatif, tetapi "
                    "relevan dan berguna."
                ),
            },
            {
                "title": "Validasi Sederhana Sebelum Produksi",
                "order_index": 2,
                "duration_minutes": 35,
                "content_text": (
                    "Validasi adalah proses mengecek apakah ide produk benar-benar dibutuhkan orang. Banyak ide gagal bukan karena jelek, tetapi karena dibuat terlalu "
                    "cepat tanpa diuji. Pada tahap awal, validasi bisa dilakukan dengan wawancara singkat, formulir sederhana, atau menunjukkan contoh konsep kepada calon pengguna.\n\n"
                    "Pertanyaan validasi sebaiknya fokus pada perilaku nyata, bukan sekadar opini umum. Misalnya: 'Masalah ini sering kamu alami kapan?', 'Solusi apa yang "
                    "sudah pernah kamu coba?', dan 'Jika ada solusi yang lebih praktis, apa yang paling kamu harapkan?'. Jawaban seperti ini memberi masukan yang lebih berguna "
                    "dibanding pertanyaan 'menurutmu bagus tidak?'.\n\n"
                    "Dengan validasi sederhana, siswa belajar membuat keputusan berbasis bukti. Ini adalah fondasi penting untuk kewirausahaan, inovasi produk, dan pengembangan "
                    "layanan digital."
                ),
            },
        ],
    },
]


async def _get_module(db, paket: PaketLevel, title: str) -> Module | None:
    stmt = select(Module).where(Module.paket == paket, Module.title == title)
    return (await db.execute(stmt)).scalar_one_or_none()


async def _get_lesson(db, module_id, title: str) -> Lesson | None:
    stmt = select(Lesson).where(Lesson.module_id == module_id, Lesson.title == title)
    return (await db.execute(stmt)).scalar_one_or_none()


async def _get_skill_class(db, title: str) -> SoftSkillClass | None:
    stmt = select(SoftSkillClass).where(SoftSkillClass.title == title)
    return (await db.execute(stmt)).scalar_one_or_none()


async def _get_skill_lesson(db, class_id, title: str) -> SkillLesson | None:
    stmt = select(SkillLesson).where(SkillLesson.class_id == class_id, SkillLesson.title == title)
    return (await db.execute(stmt)).scalar_one_or_none()


def _apply(obj, data: dict, keys: Iterable[str]) -> None:
    for key in keys:
        setattr(obj, key, data[key])


async def seed_academic(db) -> tuple[int, int]:
    modules_created = 0
    lessons_created = 0

    for item in ACADEMIC_MODULES:
        module = await _get_module(db, item["paket"], item["title"])
        fields = ("paket", "subject", "title", "description", "order_index")
        if module is None:
            module = Module(is_published=True)
            _apply(module, item, fields)
            db.add(module)
            modules_created += 1
            await db.flush()
        else:
            _apply(module, item, fields)
            module.is_published = True
            await db.flush()

        for lesson_data in item["lessons"]:
            lesson = await _get_lesson(db, module.id, lesson_data["title"])
            lesson_fields = ("title", "order_index", "duration_minutes", "content_text")
            if lesson is None:
                lesson = Lesson(module_id=module.id, content_type=ContentType.TEXT, is_downloadable=True)
                _apply(lesson, lesson_data, lesson_fields)
                db.add(lesson)
                lessons_created += 1
            else:
                _apply(lesson, lesson_data, lesson_fields)
                lesson.content_type = ContentType.TEXT
                lesson.is_downloadable = True

    return modules_created, lessons_created


async def seed_soft_skill(db) -> tuple[int, int]:
    classes_created = 0
    lessons_created = 0

    for item in SOFT_SKILL_CLASSES:
        skill_class = await _get_skill_class(db, item["title"])
        class_fields = (
            "title",
            "category",
            "description",
            "skkni_code",
            "level",
            "is_bnsp_certified",
        )
        if skill_class is None:
            skill_class = SoftSkillClass(is_published=True)
            _apply(skill_class, item, class_fields)
            db.add(skill_class)
            classes_created += 1
            await db.flush()
        else:
            _apply(skill_class, item, class_fields)
            skill_class.is_published = True
            await db.flush()

        for lesson_data in item["lessons"]:
            lesson = await _get_skill_lesson(db, skill_class.id, lesson_data["title"])
            lesson_fields = ("title", "order_index", "duration_minutes", "content_text")
            if lesson is None:
                lesson = SkillLesson(
                    class_id=skill_class.id,
                    content_type=ContentType.TEXT,
                    is_downloadable=True,
                )
                _apply(lesson, lesson_data, lesson_fields)
                db.add(lesson)
                lessons_created += 1
            else:
                _apply(lesson, lesson_data, lesson_fields)
                lesson.content_type = ContentType.TEXT
                lesson.is_downloadable = True

    return classes_created, lessons_created


async def main() -> None:
    async with AsyncSessionLocal() as db:
        modules_created, academic_lessons_created = await seed_academic(db)
        classes_created, soft_skill_lessons_created = await seed_soft_skill(db)
        await db.commit()
        print(
            "Seed starter content selesai: "
            f"{modules_created} modul baru, {academic_lessons_created} lesson akademik baru, "
            f"{classes_created} kelas soft-skill baru, {soft_skill_lessons_created} lesson soft-skill baru."
        )


if __name__ == "__main__":
    asyncio.run(main())
