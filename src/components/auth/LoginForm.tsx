import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { loginSchema } from "../../lib/validators/auth.schema";
import type { LoginInput } from "../../lib/validators/auth.schema";
import { supabase } from "../../lib/supabase/client";
import { useToast } from "../../context/ToastContext";
import GlassCard from "../common/GlassCard";
import Input from "../common/Input";
import Button from "../common/Button";

export const LoginForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Find target redirect path (default is /dashboard)
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        showToast(
          error.message || "Email hoặc mật khẩu không chính xác",
          "error",
        );
        return;
      }

      if (authData?.user) {
        showToast("Đăng nhập hệ thống thành công!", "success");

        // Fetch role to redirect correctly
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, must_change_password")
          .eq("id", authData.user.id)
          .maybeSingle();

        const role = profile?.role || "sales";
        const mustChange = profile?.must_change_password || false;

        // Dynamic redirection based on role or password reset requirement
        if (mustChange) {
          showToast(
            "Đăng nhập thành công! Vui lòng đổi mật khẩu ở lần đăng nhập đầu tiên.",
            "info",
          );
          navigate("/reset-password", { replace: true });
        } else if (role === "accountant") {
          navigate("/payments", { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Đã có lỗi xảy ra khi kết nối máy chủ.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setOauthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        showToast(
          error.message || "Không thể đăng nhập bằng tài khoản Google",
          "error",
        );
      }
    } catch (err) {
      console.error(err);
      showToast("Không thể kích hoạt phiên đăng nhập Google.", "error");
    } finally {
      setOauthLoading(false);
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
              Đăng nhập Vĩnh Hưng CRM
            </h2>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-light">
              Yến Sào Cao Cấp Vận Hành
            </p>
          </div>
        </div>

        {/* Form panel */}
        <GlassCard className="space-y-6 shadow-2xl p-8 border border-white/60">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Địa chỉ Email"
              placeholder="nhanvien@yensaovinhhung.vn"
              error={errors.email?.message}
              {...register("email")}
            />

            <div className="space-y-1">
              <Input
                id="password"
                type="password"
                label="Mật khẩu"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password")}
              />
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#C89A3D] hover:underline font-light"
                >
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            <Button type="submit" className="w-full" isLoading={loading}>
              Đăng nhập tài khoản
            </Button>
          </form>

          {/* Separator */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-100/80"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-xs font-light">
              Hoặc đăng nhập bằng
            </span>
            <div className="flex-grow border-t border-gray-100/80"></div>
          </div>

          {/* OAuth button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={oauthLoading}
            className="w-full flex items-center justify-center space-x-3 px-5 py-3 rounded-xl border border-gray-200 bg-white/50 text-sm font-medium hover:bg-white text-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C89A3D] disabled:opacity-50"
          >
            {oauthLoading ? (
              <svg
                className="animate-spin h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            <span>Tiếp tục với Google</span>
          </button>
        </GlassCard>

        {/* Footer text */}
        <div className="text-center text-xs text-gray-400 font-light">
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="text-[#C89A3D] hover:underline font-normal"
          >
            Đăng ký nhân sự mới
          </Link>
        </div>
      </div>
    </div>
  );
};
export default LoginForm;
