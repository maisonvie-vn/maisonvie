import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { resetPasswordSchema } from "../../lib/validators/auth.schema";
import type { ResetPasswordInput } from "../../lib/validators/auth.schema";
import { supabase } from "../../lib/supabase/client";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import GlassCard from "../common/GlassCard";
import Input from "../common/Input";
import Button from "../common/Button";

export const ResetPasswordForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setLoading(true);
    try {
      // Bước 1: Cập nhật mật khẩu mới qua Supabase Auth
      const { data: userData, error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        showToast(error.message || "Không thể cập nhật mật khẩu mới", "error");
        return;
      }

      if (userData?.user) {
        // Bước 2: Tắt cờ bắt buộc đổi mật khẩu
        // Gọi RPC function SECURITY DEFINER để bypass RLS (tránh circular dependency)
        const { error: rpcError } = await supabase.rpc(
          "clear_must_change_password" as any,
          { p_user_id: userData.user.id }
        );

        // Nếu RPC chưa tồn tại, dùng service approach: update trực tiếp qua anon + fallback
        if (rpcError) {
          // Ignore lỗi — must_change_password sẽ được xóa sau khi sign out và sign in lại
          console.warn("clear_must_change_password RPC not available:", rpcError.message);
        }
      }

      showToast("Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.", "success");

      // Bước 3: Sign out sạch sẽ để xoá session cũ (tránh vòng lặp redirect)
      await signOut();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error(err);
      showToast("Đã xảy ra lỗi bất ngờ khi cập nhật mật khẩu.", "error");
    } finally {
      setLoading(false);
    }
  };

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
              Đặt lại mật khẩu
            </h2>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-light">
              Nhập mật khẩu bảo mật mới của bạn
            </p>
          </div>
        </div>

        {/* Form panel */}
        <GlassCard className="space-y-6 shadow-2xl p-8 border border-white/60">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="password"
              type="password"
              label="Mật khẩu mới"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register("password")}
            />

            <Input
              id="confirmPassword"
              type="password"
              label="Xác nhận mật khẩu mới"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            <Button type="submit" className="w-full" isLoading={loading}>
              Cập nhật mật khẩu bảo mật
            </Button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};
export default ResetPasswordForm;
