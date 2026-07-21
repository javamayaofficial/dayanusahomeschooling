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
                "content_type": ContentType.VIDEO,
                "content_url": "https://www.youtube.com/watch?v=TSzvwF4gNDY",
                "is_downloadable": False,
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
    {
        "paket": PaketLevel.PAKET_A,
        "subject": "Bahasa Indonesia",
        "title": "Literasi Dasar: Membaca Paham dan Menulis Ringkas",
        "description": (
            "Modul Paket A untuk melatih siswa memahami isi bacaan sederhana, "
            "menemukan gagasan utama, dan menulis ringkasan dengan bahasa sendiri."
        ),
        "order_index": 4,
        "lessons": [
            {
                "title": "Menemukan Gagasan Utama Bacaan",
                "order_index": 1,
                "duration_minutes": 25,
                "content_text": (
                    "Setiap bacaan memiliki ide pokok yang menjadi inti pembahasan. Saat siswa bisa menemukan "
                    "gagasan utama, mereka tidak hanya membaca kata demi kata, tetapi memahami pesan yang ingin "
                    "disampaikan penulis. Keterampilan ini sangat penting karena menjadi dasar memahami soal, cerita, "
                    "atau petunjuk dalam kehidupan sehari-hari.\n\n"
                    "Cara sederhana melatihnya adalah dengan mengajak siswa membaca paragraf pendek, lalu menjawab pertanyaan: "
                    "paragraf ini sedang membicarakan apa? Kalimat yang paling mewakili isi biasanya berhubungan dengan topik "
                    "yang diulang atau dijelaskan oleh kalimat lainnya. Jika siswa masih bingung, guru dapat membantu dengan "
                    "menandai kata-kata kunci.\n\n"
                    "Setelah menemukan gagasan utama, siswa bisa membedakan mana informasi penting dan mana informasi pendukung. "
                    "Kemampuan ini membantu mereka belajar lebih efektif dan tidak mudah tenggelam dalam detail yang belum perlu."
                ),
            },
            {
                "title": "Menulis Ringkasan dengan Bahasa Sendiri",
                "order_index": 2,
                "duration_minutes": 30,
                "content_text": (
                    "Ringkasan adalah versi singkat dari bacaan yang tetap memuat isi utama. Menulis ringkasan melatih siswa "
                    "untuk berpikir terstruktur, memilih informasi penting, dan menyusun kalimat yang lebih padat. Ini berbeda "
                    "dengan menyalin ulang bacaan karena siswa perlu mengolah isi dengan pemahaman mereka sendiri.\n\n"
                    "Langkah mudahnya adalah membaca teks, menandai tiga sampai lima poin penting, lalu menyusunnya menjadi paragraf "
                    "pendek. Gunakan kalimat sederhana yang jelas. Hindari memasukkan semua detail kecil agar ringkasan tetap fokus.\n\n"
                    "Latihan ringkasan membantu siswa saat belajar materi pelajaran lain, termasuk IPA, IPS, atau video pembelajaran. "
                    "Mereka jadi lebih terbiasa menangkap inti informasi dan menjelaskannya kembali dengan runtut."
                ),
            },
        ],
    },
    {
        "paket": PaketLevel.PAKET_B,
        "subject": "IPS",
        "title": "Kehidupan Sosial dan Ekonomi: Dari Rumah ke Masyarakat",
        "description": (
            "Modul Paket B untuk memahami kegiatan ekonomi, peran masyarakat, "
            "dan hubungan antara kebutuhan, pekerjaan, dan lingkungan sekitar."
        ),
        "order_index": 5,
        "lessons": [
            {
                "title": "Kebutuhan, Keinginan, dan Pilihan",
                "order_index": 1,
                "duration_minutes": 30,
                "content_text": (
                    "Dalam kehidupan sehari-hari, setiap orang memiliki kebutuhan dan keinginan. Kebutuhan adalah hal yang benar-benar "
                    "diperlukan untuk hidup, seperti makanan, pakaian, tempat tinggal, dan pendidikan. Keinginan adalah hal yang ingin "
                    "dimiliki, tetapi tidak selalu harus ada saat itu juga.\n\n"
                    "Siswa perlu memahami perbedaan ini agar bisa belajar mengambil keputusan dengan bijak. Misalnya, membeli buku pelajaran "
                    "lebih penting daripada membeli barang yang hanya bersifat hiburan sesaat. Dengan membedakan kebutuhan dan keinginan, siswa "
                    "belajar mengelola pilihan secara lebih bertanggung jawab.\n\n"
                    "Materi ini juga berkaitan dengan kehidupan keluarga. Saat penghasilan terbatas, keluarga perlu menentukan prioritas. Dari sini, "
                    "siswa belajar bahwa kegiatan ekonomi selalu melibatkan pertimbangan dan pilihan."
                ),
            },
            {
                "title": "Peran Produsen, Konsumen, dan Distribusi",
                "order_index": 2,
                "duration_minutes": 35,
                "content_text": (
                    "Dalam kegiatan ekonomi, ada pihak yang menghasilkan barang atau jasa, ada yang menggunakan, dan ada yang menyalurkan. "
                    "Produsen membuat atau menyediakan barang, konsumen memakai atau membeli, dan distributor membantu barang sampai ke tangan "
                    "pembeli. Ketiganya saling terhubung dalam rantai ekonomi.\n\n"
                    "Contohnya pada usaha makanan rumahan: pemilik usaha memasak produk sebagai produsen, pelanggan menjadi konsumen, dan kurir "
                    "atau toko online dapat berperan sebagai distributor. Jika satu bagian terganggu, proses penjualan ikut terhambat.\n\n"
                    "Memahami peran ini membantu siswa melihat bahwa ekonomi bukan hanya soal uang, tetapi juga soal kerja sama, alur distribusi, "
                    "dan kemampuan memenuhi kebutuhan masyarakat."
                ),
            },
        ],
    },
    {
        "paket": PaketLevel.PAKET_C,
        "subject": "Matematika",
        "title": "Matematika Terapan: Persamaan Linear dan Literasi Data",
        "description": (
            "Modul Paket C untuk menghubungkan persamaan linear, tabel, dan grafik "
            "dengan persoalan nyata seperti penjualan, biaya, dan kebiasaan belajar."
        ),
        "order_index": 6,
        "lessons": [
            {
                "title": "Persamaan Linear dalam Masalah Sehari-hari",
                "order_index": 1,
                "duration_minutes": 35,
                "content_text": (
                    "Persamaan linear membantu kita menulis hubungan antarbesaran secara singkat dan logis. Dalam kehidupan sehari-hari, "
                    "persamaan linear bisa dipakai untuk menghitung total biaya, target tabungan, atau hubungan antara jumlah barang dan harga.\n\n"
                    "Contoh sederhana: jika satu buku seharga Rp8.000 dan kamu membeli beberapa buku, total biayanya bisa ditulis sebagai "
                    "8.000 dikali jumlah buku. Bentuk seperti ini memudahkan siswa memahami bahwa matematika bukan sekadar angka, melainkan "
                    "alat untuk menggambarkan situasi nyata.\n\n"
                    "Dengan belajar persamaan linear, siswa juga lebih siap membaca tabel dan grafik pada pelajaran lain. Mereka belajar bahwa "
                    "setiap rumus sebenarnya mewakili hubungan yang dapat diamati dalam kehidupan."
                ),
            },
            {
                "title": "Membaca Tabel dan Grafik Sederhana",
                "order_index": 2,
                "duration_minutes": 30,
                "content_text": (
                    "Literasi data adalah kemampuan membaca dan memahami informasi yang disajikan dalam bentuk tabel atau grafik. Di era digital, "
                    "kemampuan ini penting karena banyak keputusan dibuat berdasarkan data, mulai dari laporan penjualan sampai hasil survei sederhana.\n\n"
                    "Siswa dapat memulai dari pertanyaan dasar: data apa yang paling tinggi, paling rendah, dan bagaimana perubahannya dari waktu ke waktu? "
                    "Misalnya grafik jam belajar mingguan dapat membantu siswa melihat pola kapan mereka paling produktif atau kapan perlu memperbaiki kebiasaan.\n\n"
                    "Saat siswa mampu membaca data, mereka tidak mudah tertipu oleh angka atau visual yang menyesatkan. Ini adalah bekal penting untuk pendidikan "
                    "lanjutan, pekerjaan, dan kewargaan digital yang kritis."
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
    {
        "title": "Digital Marketing: Kalender Konten dan Evaluasi Sederhana",
        "category": SoftSkillCategory.DIGITAL_MARKETING,
        "description": (
            "Kelas lanjutan pemula untuk menyusun kalender konten yang konsisten, "
            "mengukur hasil dasar, dan memperbaiki komunikasi promosi dari minggu ke minggu."
        ),
        "skkni_code": "DM-GROW-04",
        "level": SkillLevel.INTERMEDIATE,
        "is_bnsp_certified": True,
        "lessons": [
            {
                "title": "Menyusun Kalender Konten Mingguan",
                "order_index": 1,
                "duration_minutes": 30,
                "content_text": (
                    "Kalender konten membantu tim atau individu menjaga konsistensi komunikasi. Tanpa perencanaan, promosi sering berhenti di tengah jalan "
                    "atau terasa acak. Dengan kalender mingguan, siswa bisa menentukan topik, format, tujuan, dan kanal yang dipakai.\n\n"
                    "Langkah paling praktis adalah membagi konten menjadi beberapa kategori, misalnya edukasi, promosi, testimoni, dan interaksi. Dari sana, "
                    "siswa dapat menyusun urutan posting yang lebih seimbang. Kalender tidak harus rumit; spreadsheet sederhana pun sudah cukup untuk memulai.\n\n"
                    "Konsistensi lebih penting daripada terlalu banyak ide yang tidak sempat dieksekusi. Melalui latihan ini, siswa belajar membangun ritme kerja "
                    "yang lebih profesional."
                ),
            },
            {
                "title": "Membaca Hasil Dasar Konten",
                "order_index": 2,
                "duration_minutes": 30,
                "content_text": (
                    "Setelah konten dipublikasikan, langkah berikutnya adalah membaca hasil dasarnya. Tidak semua metrik harus rumit; siswa dapat mulai dari "
                    "jangkauan, simpanan, komentar, klik tautan, atau pesan yang masuk. Angka-angka ini membantu melihat apakah konten benar-benar menghasilkan respons.\n\n"
                    "Yang penting bukan hanya angka besar, tetapi hubungan antara tujuan dan hasil. Jika tujuannya edukasi, simpanan dan durasi tonton bisa lebih "
                    "bermakna. Jika tujuannya penjualan, klik dan pertanyaan dari calon pembeli mungkin lebih penting.\n\n"
                    "Latihan evaluasi sederhana ini membiasakan siswa membuat perbaikan berbasis data, bukan hanya perasaan."
                ),
            },
        ],
    },
    {
        "title": "Content Creator: Produksi Video Pendek dengan Ponsel",
        "category": SoftSkillCategory.CONTENT_CREATOR,
        "description": (
            "Kelas lanjutan pemula untuk merekam video pendek yang rapi, jelas, "
            "dan tetap efektif meski hanya menggunakan ponsel serta alat sederhana."
        ),
        "skkni_code": "CC-GROW-05",
        "level": SkillLevel.INTERMEDIATE,
        "is_bnsp_certified": True,
        "lessons": [
            {
                "title": "Framing dan Komposisi yang Nyaman Dilihat",
                "order_index": 1,
                "duration_minutes": 30,
                "content_type": ContentType.VIDEO,
                "content_url": "https://www.youtube.com/watch?v=HgEiag5zZc0",
                "is_downloadable": False,
                "content_text": (
                    "Video yang enak ditonton tidak selalu memerlukan kamera mahal. Dengan ponsel, hasil tetap bisa terlihat rapi jika siswa memahami framing "
                    "dan komposisi. Hal dasar yang perlu diperhatikan antara lain posisi kamera stabil, pencahayaan cukup, dan subjek tidak terpotong secara aneh.\n\n"
                    "Salah satu teknik sederhana adalah rule of thirds, yaitu menempatkan objek utama di area yang nyaman dilihat, bukan selalu tepat di tengah. "
                    "Selain itu, latar belakang perlu dijaga agar tidak terlalu ramai sehingga perhatian audiens tetap fokus pada isi pesan.\n\n"
                    "Pemahaman visual seperti ini penting karena kualitas penyampaian bukan hanya dari kata-kata, tetapi juga dari cara pesan dipresentasikan."
                ),
            },
            {
                "title": "Alur Produksi Cepat: Rekam, Pilih, Edit",
                "order_index": 2,
                "duration_minutes": 35,
                "content_text": (
                    "Banyak pemula menunda membuat konten karena merasa proses produksi terlalu berat. Padahal, alur sederhana sudah cukup: rekam beberapa take, "
                    "pilih yang paling jelas, lalu edit seperlunya. Fokus utama tetap pada pesan, bukan efek yang berlebihan.\n\n"
                    "Siswa sebaiknya menyiapkan poin bicara singkat sebelum merekam. Setelah itu, rekam dua sampai tiga versi pembuka agar ada pilihan. Pada tahap edit, "
                    "cukup rapikan bagian yang terlalu panjang, tambahkan teks penting, dan pastikan audio bisa dipahami.\n\n"
                    "Kebiasaan produksi cepat membuat siswa lebih konsisten dan tidak mudah terjebak perfeksionisme. Ini sangat penting untuk pertumbuhan akun dan portofolio."
                ),
            },
        ],
    },
    {
        "title": "Product Creator: Packaging Penawaran dan Launch Awal",
        "category": SoftSkillCategory.PRODUCT_CREATOR,
        "description": (
            "Kelas lanjutan pemula untuk mengemas penawaran, merumuskan manfaat, "
            "dan menyiapkan peluncuran sederhana yang tetap meyakinkan."
        ),
        "skkni_code": "PC-GROW-06",
        "level": SkillLevel.INTERMEDIATE,
        "is_bnsp_certified": True,
        "lessons": [
            {
                "title": "Mengemas Penawaran yang Mudah Dipahami",
                "order_index": 1,
                "duration_minutes": 30,
                "content_text": (
                    "Produk yang bagus bisa sulit terjual jika penawarannya membingungkan. Karena itu, siswa perlu belajar mengemas penawaran secara sederhana: "
                    "apa produknya, untuk siapa, manfaat utamanya apa, dan bagaimana cara membelinya. Bahasa yang terlalu rumit justru membuat calon pengguna ragu.\n\n"
                    "Penawaran yang baik menjawab pertanyaan dasar calon pembeli dengan cepat. Misalnya: siapa yang paling cocok memakai produk ini, masalah apa yang "
                    "diselesaikan, dan hasil seperti apa yang bisa diharapkan. Dengan struktur ini, halaman penjualan atau caption menjadi lebih jelas.\n\n"
                    "Kemampuan mengemas penawaran sangat penting karena produk bukan hanya soal isi, tetapi juga soal bagaimana nilainya dipahami orang lain."
                ),
            },
            {
                "title": "Peluncuran Awal yang Sederhana tapi Siap",
                "order_index": 2,
                "duration_minutes": 35,
                "content_text": (
                    "Launch awal tidak harus besar. Yang penting adalah kesiapan minimum: pesan utama jelas, alur pembelian mudah, dan komunikasi dilakukan secara konsisten. "
                    "Siswa dapat memulai dari target kecil, misalnya menguji minat pada lingkaran terdekat atau komunitas yang relevan.\n\n"
                    "Sebelum launch, siapkan daftar hal penting: deskripsi produk, harga atau mekanisme akses, contoh penggunaan, dan cara menerima pertanyaan dari calon pengguna. "
                    "Jika semua sudah siap, proses peluncuran menjadi lebih tenang dan terukur.\n\n"
                    "Materi ini membantu siswa memahami bahwa keberhasilan produk tidak hanya ditentukan saat produksi, tetapi juga saat momen perkenalannya ke pasar."
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
            lesson_fields = ("title", "order_index", "duration_minutes", "content_text", "content_url")
            if lesson is None:
                lesson = Lesson(
                    module_id=module.id,
                    content_type=lesson_data.get("content_type", ContentType.TEXT),
                    is_downloadable=lesson_data.get("is_downloadable", True),
                )
                _apply(lesson, lesson_data, lesson_fields)
                db.add(lesson)
                lessons_created += 1
            else:
                _apply(lesson, lesson_data, lesson_fields)
                lesson.content_type = lesson_data.get("content_type", ContentType.TEXT)
                lesson.is_downloadable = lesson_data.get("is_downloadable", True)

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
            lesson_fields = ("title", "order_index", "duration_minutes", "content_text", "content_url")
            if lesson is None:
                lesson = SkillLesson(
                    class_id=skill_class.id,
                    content_type=lesson_data.get("content_type", ContentType.TEXT),
                    is_downloadable=lesson_data.get("is_downloadable", True),
                )
                _apply(lesson, lesson_data, lesson_fields)
                db.add(lesson)
                lessons_created += 1
            else:
                _apply(lesson, lesson_data, lesson_fields)
                lesson.content_type = lesson_data.get("content_type", ContentType.TEXT)
                lesson.is_downloadable = lesson_data.get("is_downloadable", True)

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
