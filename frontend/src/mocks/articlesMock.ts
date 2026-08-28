export type ArticleCategory = "Tips Pemilahan" | "Fakta Daur Ulang" | "Dampak Lingkungan";

export interface Article {
  id: string;
  title: string;
  summary: string;
  category: ArticleCategory;
  imageUrl: string;
  altText: string;
  date: string;
  content: string[];
}

export const articlesMock: Article[] = [
  {
    id: "a1",
    title: "Cara Memilah Sampah Rumah Tangga dengan Benar",
    summary: "Langkah sederhana memisahkan sampah organik, anorganik, dan B3 di rumahmu.",
    category: "Tips Pemilahan",
    imageUrl: "https://placehold.co/800x450?text=Pilah+Sampah",
    altText: "Ilustrasi memilah sampah rumah tangga",
    date: "2025-02-14",
    content: [
      "Memilah sampah tidak harus rumit. Mulailah dengan menyiapkan tiga wadah berbeda di rumah: satu untuk sampah organik, satu untuk sampah anorganik daur ulang, dan satu khusus untuk bahan berbahaya (B3) seperti baterai.",
      "Sampah organik seperti sisa makanan bisa diolah menjadi kompos, sedangkan sampah anorganik bersih seperti plastik, kertas, dan logam bisa disetor ke bank sampah terdekat untuk didaur ulang menjadi produk baru.",
      "Pastikan sampah anorganik dalam keadaan bersih dan kering sebelum disetor. Kemasan makanan sebaiknya dibilas terlebih dahulu agar tidak mengundang bau dan lebih mudah diproses.",
    ],
  },
  {
    id: "a2",
    title: "Berapa Lama Sampah Plastik Terurai?",
    summary: "Fakta mengejutkan tentang waktu dekomposisi plastik di alam.",
    category: "Fakta Daur Ulang",
    imageUrl: "https://placehold.co/800x450?text=Fakta+Plastik",
    altText: "Ilustrasi fakta waktu terurai plastik",
    date: "2025-02-08",
    content: [
      "Botol plastik PET dapat bertahan 400–450 tahun sebelum akhirnya terurai di alam. Kantong plastik biasa membutuhkan sekitar 20 tahun, sedangkan sedotan plastik sekitar 200 tahun.",
      "Itu artinya sampah plastik yang kita buang hari ini akan tetap ada jauh setelah generasi kita. Inilah mengapa mendaur ulang dan mengurangi penggunaan plastik sekali pakai sangat penting.",
      "Dengan menyetor plastik ke bank sampah, kamu membantu memperpanjang siklus hidup material ini dan mencegahnya berakhir di laut maupun TPA.",
    ],
  },
  {
    id: "a3",
    title: "Dampak Nyata Daur Ulang Terhadap Emisi Karbon",
    summary: "Bagaimana setiap kilogram sampah yang didaur ulang membantu mengurangi emisi CO₂.",
    category: "Dampak Lingkungan",
    imageUrl: "https://placehold.co/800x450?text=Dampak+CO2",
    altText: "Ilustrasi dampak daur ulang terhadap emisi karbon",
    date: "2025-01-28",
    content: [
      "Setiap kilogram sampah yang berhasil didaur ulang berarti emisi yang terhindar dari proses pembakaran atau penumpukan di tempat pembuangan akhir. Misalnya, mendaur ulang satu kilogram aluminium dapat menghemat energi yang sangat besar dibanding memproduksi aluminium baru dari bijihnya.",
      "Estimasi dampak karbon dihitung menggunakan pendekatan dari EPA Waste Reduction Model (WARM), dibulatkan untuk kebutuhan simulasi aplikasi — bukan angka sertifikasi karbon resmi.",
      "Fitur Carbon Tracker di BuangYuk membantumu melihat secara transparan berapa banyak CO₂ yang kamu selamatkan dari setiap setoran. Setitik aksi kecil, jika dilakukan bersama-sama, membawa perubahan besar.",
    ],
  },
];
