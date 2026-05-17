import { describe, it, expect } from "vitest";
import { formatVND, formatDate } from "../lib/utils/format";
import { normalizePhone, validatePhoneVN } from "../lib/utils/phone";

describe("Định dạng tiền tệ VND & Ngày tháng", () => {
  it("định dạng số tiền VND chính xác", () => {
    // Note: Vitest output format can have narrow non-breaking spaces or different unicode chars depending on locale,
    // so we can test the numeric parts and symbols presence to make it robust.
    const result = formatVND(15000000);
    expect(result).toContain("15");
    expect(result).toContain("000");
    // It should contain the Dong currency sign
    expect(result).toMatch(/[₫đ]/i);
  });

  it("định dạng ngày tháng chuẩn Việt Nam", () => {
    expect(formatDate("2026-05-17T00:00:00.000")).toBe("17/05/2026");
    expect(formatDate(null)).toBe("-");
    expect(formatDate("invalid-date")).toBe("-");
  });
});

describe("Chuẩn hóa số điện thoại di động Việt Nam", () => {
  it("loại bỏ các ký tự đặc biệt và khoảng trắng", () => {
    expect(normalizePhone("0912.345.678")).toBe("0912345678");
    expect(normalizePhone("0912-345-678")).toBe("0912345678");
    expect(normalizePhone("(0912) 345 678")).toBe("0912345678");
  });

  it("chuyển đổi đầu số quốc gia +84 hoặc 84 về 0", () => {
    expect(normalizePhone("+84912345678")).toBe("0912345678");
    expect(normalizePhone("84912345678")).toBe("0912345678");
  });

  it("kiểm tra số điện thoại di động hợp lệ", () => {
    expect(validatePhoneVN("0912345678")).toBe(true);
    expect(validatePhoneVN("0356789123")).toBe(true);
    expect(validatePhoneVN("0243123456")).toBe(false); // Số bàn không bắt đầu bằng đầu số di động
    expect(validatePhoneVN("12345")).toBe(false);
  });
});
