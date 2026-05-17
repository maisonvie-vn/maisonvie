/**
 * Định dạng số tiền thành tiền tệ VND chuẩn vi-VN
 * @param amount Số tiền cần định dạng
 * @returns Chuỗi tiền tệ dạng 100.000 ₫ hoặc tương đương
 */
export const formatVND = (amount: number): string => {
  if (isNaN(amount)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

/**
 * Định dạng ngày tháng năm chuẩn tiếng Việt
 * @param dateString Chuỗi ngày tháng hoặc đối tượng Date
 * @returns Chuỗi ngày dạng 17/05/2026
 */
export const formatDate = (dateString: string | Date | null): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/**
 * Định dạng ngày giờ chi tiết chuẩn tiếng Việt
 * @param dateString Chuỗi ngày tháng
 * @returns Chuỗi thời gian dạng 18:24 17/05/2026
 */
export const formatDateTime = (dateString: string | Date | null): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";
  return (
    date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }) +
    " " +
    date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  );
};
