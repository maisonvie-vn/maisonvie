/**
 * Chuẩn hóa số điện thoại Việt Nam về định dạng thống nhất (Bắt đầu bằng 0, không ký tự đặc biệt)
 * @param phone Chuỗi số điện thoại thô đầu vào
 * @returns Chuỗi số điện thoại đã được chuẩn hóa hoặc chuỗi gốc nếu không hợp lệ
 */
export const normalizePhone = (phone: string): string => {
  if (!phone) return "";

  // 1. Loại bỏ toàn bộ khoảng trắng, dấu chấm, dấu gạch ngang, dấu ngoặc
  let cleaned = phone.replace(/[\s.\-()]/g, "");

  // 2. Xử lý mã quốc gia +84 hoặc 84 ở đầu
  if (cleaned.startsWith("+84")) {
    cleaned = "0" + cleaned.substring(3);
  } else if (cleaned.startsWith("84") && cleaned.length > 9) {
    cleaned = "0" + cleaned.substring(2);
  }

  return cleaned;
};

/**
 * Kiểm tra xem số điện thoại có phải số di động Việt Nam hợp lệ hay không
 * Đầu số hợp lệ: 03, 05, 07, 08, 09 (gồm 10 chữ số)
 * @param phone Số điện thoại cần kiểm tra
 * @returns boolean
 */
export const validatePhoneVN = (phone: string): boolean => {
  const normalized = normalizePhone(phone);
  // Định dạng chuẩn di động Việt Nam gồm 10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09
  const phoneRegex = /^(03|05|07|08|09)[0-9]{8}$/;
  return phoneRegex.test(normalized);
};
