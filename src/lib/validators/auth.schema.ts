import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email không được để trống")
    .email("Địa chỉ email không hợp lệ"),
  password: z
    .string()
    .min(8, "Mật khẩu phải chứa ít nhất 8 ký tự")
    .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ cái viết hoa")
    .regex(/[0-9]/, "Mật khẩu phải chứa ít nhất 1 chữ số")
    .regex(/[^A-Za-z0-9]/, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt"),
});

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, "Email không được để trống")
    .email("Địa chỉ email không hợp lệ"),
  fullName: z
    .string()
    .min(2, "Họ và tên phải chứa ít nhất 2 ký tự")
    .max(50, "Họ và tên không được dài quá 50 ký tự"),
  password: z
    .string()
    .min(8, "Mật khẩu phải chứa ít nhất 8 ký tự")
    .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ cái viết hoa")
    .regex(/[0-9]/, "Mật khẩu phải chứa ít nhất 1 chữ số")
    .regex(/[^A-Za-z0-9]/, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt"),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email không được để trống")
    .email("Địa chỉ email không hợp lệ"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Mật khẩu phải chứa ít nhất 8 ký tự")
      .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ cái viết hoa")
      .regex(/[0-9]/, "Mật khẩu phải chứa ít nhất 1 chữ số")
      .regex(/[^A-Za-z0-9]/, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
