import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { forgotPasswordSchema } from "../../lib/validators/auth.schema";
import type { ForgotPasswordInput } from "../../lib/validators/auth.schema";
import { supabase } from "../../lib/supabase/client";
import { useToast } from "../../context/ToastContext";
import GlassCard from "../common/GlassCard";
import Input from "../common/Input";
import Button from "../common/Button";

export const ForgotPasswordForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        showToast(
          error.message || "Không thể gửi email khôi phục mật khẩu",
          "error",
        );
        return;
      }

      setSent(true);
      showToast("Yêu cầu khôi phục mật khẩu đã được gửi!", "success");
    } catch (err) {
      console.error(err);
      showToast("Đã xảy ra lỗi bất ngờ.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#F9F5EE]">
        <GlassCard className="max-w-md w-full text-center space-y-6 p-8 border border-white/60 shadow-2xl">
          <div className="w-16 h-16 bg-amber-50 text-[#C89A3D] rounded-full flex items-center justify-center mx-auto border border-amber-100 animate-pulse">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
              />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-medium text-gray-800">
              Kiểm tra hộp thư email
            </h3>
            <p className="text-sm text-gray-500 font-light leading-relaxed">
              Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu vào email của bạn.
              Vui lòng làm theo hướng dẫn trong email để tiến hành thiết lập mật
              khẩu mới.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/login">
              <Button variant="secondary" className="w-full">
                Quay lại Đăng nhập
              </Button>
            </Link>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F9F5EE]">
      <div className="max-w-md w-full flex flex-col space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[#C89A3D] rounded-2xl flex items-center justify-center text-white shadow-md font-semibold tracking-wider text-xl mx-auto">
            YVH
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-medium text-gray-800">
              Quên mật khẩu?
            </h2>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-light">
              Nhận liên kết khôi phục qua Email
            </p>
          </div>
        </div>

        {/* Form panel */}
        <GlassCard className="space-y-6 shadow-2xl p-8 border border-white/60">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <p className="text-xs text-gray-500 font-light leading-relaxed text-center">
              Nhập địa chỉ email đăng ký tài khoản của bạn dưới đây, hệ thống sẽ
              gửi một email hướng dẫn đặt lại mật khẩu bảo mật mới.
            </p>

            <Input
              id="email"
              type="email"
              label="Địa chỉ Email của bạn"
              placeholder="nhanvien@yensaovinhhung.vn"
              error={errors.email?.message}
              {...register("email")}
            />

            <Button type="submit" className="w-full" isLoading={loading}>
              Gửi email yêu cầu
            </Button>
          </form>
        </GlassCard>

        {/* Footer text */}
        <div className="text-center text-xs text-gray-400 font-light">
          Quay lại{" "}
          <Link
            to="/login"
            className="text-[#C89A3D] hover:underline font-normal"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};
export default ForgotPasswordForm;
