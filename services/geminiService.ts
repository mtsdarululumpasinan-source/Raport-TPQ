
import { GoogleGenAI } from "@google/genai";
import { Assessment, Santri } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTeacherComment = async (santri: Santri, assessment: Partial<Assessment>): Promise<string> => {
  try {
    let prompt = "";
    const isPBP = assessment.fhScore !== undefined;

    if (isPBP) {
      // PBP PROMPT
      // Logic Update: MH now represents MH+SH (Max 30)
      const totalBacaan = (assessment.fhScore || 0) + (assessment.mhScore || 0) + (assessment.ahScore || 0) + (assessment.tmScore || 0);
      
      prompt = `
        Bertindaklah sebagai Ustadz/Ustadzah di TPQ (Taman Pendidikan Al-Qur'an).
        Buatkan catatan evaluasi singkat (3-4 kalimat) yang menyemangati untuk di raport santri Program Buku Paket (PBP).
        
        Data Santri:
        - Nama: ${santri.name}
        - Jilid: ${santri.currentJilid}
        
        Nilai Bacaan (Total ${totalBacaan}/100):
        - Fakta Huruf: ${assessment.fhScore}/30
        - Makhorijul & Sifatul Huruf: ${assessment.mhScore}/30
        - Ahkamul Huruf: ${assessment.ahScore}/20
        - Titian Murottal: ${assessment.tmScore}/20
        
        Hafalan: ${assessment.lastSurah} (Nilai: ${assessment.memorizationScore})
        Doa Harian: ${assessment.materialDoa}

        Sikap:
        - Sopan Santun: ${assessment.attitude?.sopanSantun}
        - Kedisiplinan: ${assessment.attitude?.kerajinan}
        
        Kehadiran: Sakit ${assessment.attendanceSakit} hari, Izin ${assessment.attendanceIzin} hari.

        Gunakan bahasa Indonesia yang sopan, islami, dan memotivasi untuk anak-anak.
      `;
    } else {
      // PSQ PROMPT
      const totalBacaan = (assessment.mhScore || 0) + (assessment.ahScore || 0) + (assessment.fashohahScore || 0);
      
      prompt = `
        Bertindaklah sebagai Ustadz/Ustadzah TPQ.
        Buatkan catatan evaluasi singkat (3-4 kalimat) untuk raport santri Program Sorogan Al-Qur'an (PSQ).
        
        Nama Santri: ${santri.name}
        Jilid/Kelas: ${santri.currentJilid}
        
        Detail Nilai Bacaan (Total: ${totalBacaan}/100):
        1. Makhorijul Huruf: ${assessment.mhScore}/30
        2. Ahkamul Huruf (Tajwid): ${assessment.ahScore}/30
        3. Fashohah (Kelancaran): ${assessment.fashohahScore}/40
        
        Materi Tambahan:
        - Hafalan (Tahfidz): ${assessment.memorizationScore}/100 (Surah: ${assessment.lastSurah})
        - Materi Tajwid: ${assessment.materialTajwid}
        - Ubudiyah: ${assessment.materialUbudiyah}

        Sikap:
        - Sopan Santun: ${assessment.attitude?.sopanSantun}
        - Kerjasama: ${assessment.attitude?.kerjasama}
        - Kedisiplinan: ${assessment.attitude?.kerajinan}
        
        Kehadiran: Sakit ${assessment.attendanceSakit}, Izin ${assessment.attendanceIzin}, Alpha ${assessment.attendanceAlpha}.

        Gunakan bahasa Indonesia yang sopan, islami, memotivasi, dan personal.
      `;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Teruslah belajar dan mengaji dengan giat.";
  } catch (error) {
    console.error("Error generating comment:", error);
    return "Mohon maaf, terjadi kesalahan saat membuat catatan otomatis. Silakan tulis manual.";
  }
};
