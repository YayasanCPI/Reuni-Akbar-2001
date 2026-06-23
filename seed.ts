import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'data', 'database.sqlite'));

const tasks = [
  { title: "Bentuk struktur panitia pusat dan regional", milestone: "Juni 2026: Tata Kelola" },
  { title: "Bayar uang muka lokasi utama untuk tanggal 26 Oktober", milestone: "Juni 2026: Tata Kelola" },
  { title: "Hubungi Ucup untuk menyepakati tenggat desain draf seragam pertama", milestone: "Juni 2026: Tata Kelola" },
  
  { title: "Mulai kelas Yoga publik dan acara olahraga", milestone: "Juli 2026: Pra Reuni" },
  { title: "Sebarkan formulir registrasi digital terpusat", milestone: "Juli 2026: Pra Reuni" },
  { title: "Pastikan opsi pembayaran (QRIS/Transfer) berfungsi", milestone: "Juli 2026: Pra Reuni" },
  { title: "Evaluasi tiga proposal EO dan tunjuk pemenang", milestone: "Juli 2026: Pra Reuni" },
  { title: "Kirim proposal penawaran sponsor", milestone: "Juli 2026: Pra Reuni" },

  { title: "Instruksikan Ucup produksi massal seragam reuni", milestone: "Agustus 2026: Publikasi" },
  { title: "Unggah konten video nostalgia", milestone: "Agustus 2026: Publikasi" },
  { title: "Tagih uang muka dari peserta via koordinator", milestone: "Agustus 2026: Publikasi" },
  { title: "Kumpulkan foto masa sekolah per kelas", milestone: "Agustus 2026: Publikasi" },

  { title: "Kunci jadwal acara Gala Dinner", milestone: "September 2026: Detail Acara" },
  { title: "Hubungi 3 alumni sebagai pembicara", milestone: "September 2026: Detail Acara" },
  { title: "Siapkan daftar nominasi penghargaan lucu", milestone: "September 2026: Detail Acara" },
  { title: "Pantau rekapitulasi harian laporan keuangan", milestone: "September 2026: Detail Acara" },

  { title: "Gladi kotor minggu kedua", milestone: "Oktober 2026: Eksekusi" },
  { title: "Selesaikan penyuntingan video visual gedung", milestone: "Oktober 2026: Eksekusi" },
  { title: "Distribusikan seragam reuni", milestone: "Oktober 2026: Eksekusi" },
  { title: "Siapkan drone untuk sesi foto udara", milestone: "Oktober 2026: Eksekusi" },
  { title: "Gladi bersih di lokasi H-1", milestone: "Oktober 2026: Eksekusi" },
];

const insert = db.prepare(`
  INSERT INTO tasks (id, title, description, status, picId, milestone)
  VALUES (@id, @title, @description, @status, @picId, @milestone)
`);

tasks.forEach((t, i) => {
  insert.run({
    id: 'ts_' + Date.now() + '_' + i,
    title: t.title,
    description: t.title,
    status: 'not yet',
    picId: 'u' + ((i % 4) + 1), // u1, u2, u3, u4 based on seed
    milestone: t.milestone
  });
});
console.log("Seeding complete!");
