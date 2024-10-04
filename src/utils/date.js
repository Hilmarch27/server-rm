// utils/dateUtils.js
import { format, parseISO, isDate } from "date-fns";
import { id as idLocale } from "date-fns/locale";

/**
 * Mengonversi tanggal menjadi format dd-MMMM-yy
 * @param {Date|string} date - Tanggal yang akan dikonversi (bisa berupa objek Date atau string)
 * @returns {string} - Tanggal dalam format dd-MMMM-yy
 */
const formatDate = (date) => {
  // Jika date adalah string, konversi ke objek Date
  if (typeof date === "string") {
    date = parseISO(date);
  }

  // Pastikan bahwa date adalah objek Date yang valid
  if (isDate(date)) {
    return format(date, "dd-MMMM-yyyy", { locale: idLocale });
  } else {
    throw new Error("Invalid date provided");
  }
};

export default formatDate;
