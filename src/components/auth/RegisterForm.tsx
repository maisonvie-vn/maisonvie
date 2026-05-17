import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { registerSchema } from "../../lib/validators/auth.schema";
import type { RegisterInput } from "../../lib/validators/auth.schema";
import { supabase } from "../../lib/supabase/client";
import { useToast } from "../../context/ToastContext";
import GlassCard from "../common/GlassCard";
import Input from "../common/Input";
import Button from "../common/Button";

export const RegisterForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: "sales", // Default role is sales as defined by database seed/triggers
          },
        },
      });

      if (error) {
        showToast(
          error.message || "Không thể đăng ký tài khoản nhân sự mới",
          "error",
        );
        return;
      }

      setRegisteredEmail(data.email);
      setIsRegistered(true);
      showToast("Đăng ký tài khoản nhân sự thành công!", "success");
    } catch (err) {
      console.error(err);
      showToast("Lỗi bất ngờ xảy ra khi kết nối đăng ký.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#F9F5EE]">
        <GlassCard className="max-w-md w-full text-center space-y-6 p-8 border border-white/60 shadow-2xl">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-100 animate-pulse">
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
              Xác thực Email của bạn
            </h3>
            <p className="text-sm text-gray-500 font-light leading-relaxed">
              Chúng tôi đã gửi một liên kết kích hoạt đến địa chỉ email{" "}
              <span className="font-medium text-gray-800">
                {registeredEmail}
              </span>
              . Vui lòng nhấp vào liên kết trong hộp thư của bạn để hoàn tất
              việc kích hoạt tài khoản.
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
              Đăng ký thành viên Vĩnh Hưng
            </h2>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-light">
              Gia nhập hệ sinh thái chăm sóc yến sào
            </p>
          </div>
        </div>

        {/* Form panel */}
        <GlassCard className="space-y-6 shadow-2xl p-8 border border-white/60">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="fullName"
              type="text"
              label="Họ và tên"
              placeholder="Nguyễn Văn A"
              error={errors.fullName?.message}
              {...register("fullName")}
            />

            <Input
              id="email"
              type="email"
              label="Địa chỉ Email công việc"
              placeholder="nhanvien@yensaovinhhung.vn"
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              id="password"
              type="password"
              label="Mật khẩu bảo mật"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register("password")}
            />

            <Button type="submit" className="w-full" isLoading={loading}>
              Đăng ký tài khoản mới
            </Button>
          </form>
        </GlassCard>

        {/* Footer text */}
        <div className="text-center text-xs text-gray-400 font-light">
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            className="text-[#C89A3D] hover:underline font-normal"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
};
export default RegisterForm;
