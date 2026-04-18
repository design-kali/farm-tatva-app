import { motion, AnimatePresence } from "motion/react";
import { X, Leaf, Mail, Lock, User } from "lucide-react";
import { useEffect, useState } from "react";
import type { ApiUser } from "../lib/api";

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    mode: "login" | "register",
    values: { name: string; email: string; password: string },
  ) => void;
  isSubmitting: boolean;
  errorMessage?: string | null;
  currentUser: ApiUser | null;
  onLogout: () => void;
}

const getUserDisplayName = (user: ApiUser | null | undefined) => {
  const rawName = typeof user?.name === "string" ? user.name.trim() : "";

  if (rawName) {
    return rawName;
  }

  const rawEmail = typeof user?.email === "string" ? user.email.trim() : "";

  if (rawEmail) {
    return rawEmail.split("@")[0];
  }

  return "Farmer";
};

const getUserFirstName = (user: ApiUser | null | undefined) => {
  return getUserDisplayName(user).split(" ")[0];
};

const getUserInitial = (user: ApiUser | null | undefined) => {
  return getUserDisplayName(user).charAt(0).toUpperCase();
};

export function LoginDialog({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  errorMessage,
  currentUser,
  onLogout,
}: LoginDialogProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const currentUserDisplayName = getUserDisplayName(currentUser);
  const currentUserFirstName = getUserFirstName(currentUser);
  const currentUserInitial = getUserInitial(currentUser);

  useEffect(() => {
    if (!isOpen) {
      setIsLogin(true);
      setFormData({
        name: "",
        email: "",
        password: "",
      });
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(isLogin ? "login" : "register", formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white px-8 py-10">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-serif">FarmTatva</h2>
                </div>

                <h3 className="text-xl mb-2">
                  {currentUser
                    ? `Hello, ${currentUserFirstName}`
                    : isLogin
                      ? "Welcome Back!"
                      : "Join FarmTatva"}
                </h3>
                <p className="text-white/80 text-sm">
                  {currentUser
                    ? "Your FarmTatva account is ready for fresh orders."
                    : isLogin
                      ? "Sign in to access fresh farm produce"
                      : "Create an account to start your fresh journey"}
                </p>

                {/* Decorative Elements */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"
                />
              </div>

              {currentUser ? (
                <div className="px-8 py-8">
                  <div className="bg-[#F8F4E1] rounded-3xl p-6 text-[#1B4332]">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-14 h-14 rounded-full bg-[#1B4332] text-white flex items-center justify-center text-xl">
                        {currentUserInitial}
                      </div>
                      <div>
                        <p className="text-xl">{currentUserDisplayName}</p>
                        <p className="text-sm text-[#1B4332]/60">
                          {currentUser.email}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3 text-sm">
                      Signed in as {currentUser.role}
                    </div>
                  </div>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onLogout}
                    className="w-full mt-6 bg-[#1B4332] text-white py-4 rounded-full flex items-center justify-center gap-2 hover:bg-[#2D6A4F] transition-colors shadow-lg"
                  >
                    <span className="text-lg">Log Out</span>
                    <Leaf className="w-5 h-5" />
                  </motion.button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="px-8 py-8">
                  <div className="space-y-5">
                    <AnimatePresence mode="wait">
                      {!isLogin && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <label className="block text-sm text-[#1B4332]/70 mb-2">
                            Full Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1B4332]/40" />
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) =>
                                handleInputChange("name", e.target.value)
                              }
                              placeholder="Enter your name"
                              className="w-full pl-12 pr-4 py-3.5 bg-[#F8F4E1] border-2 border-transparent rounded-2xl text-[#1B4332] placeholder:text-[#1B4332]/40 focus:outline-none focus:border-[#1B4332] transition-colors"
                              required={!isLogin}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div>
                      <label className="block text-sm text-[#1B4332]/70 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1B4332]/40" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          placeholder="email@example.com"
                          className="w-full pl-12 pr-4 py-3.5 bg-[#F8F4E1] border-2 border-transparent rounded-2xl text-[#1B4332] placeholder:text-[#1B4332]/40 focus:outline-none focus:border-[#1B4332] transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-[#1B4332]/70 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1B4332]/40" />
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) =>
                            handleInputChange("password", e.target.value)
                          }
                          placeholder="Enter your password"
                          className="w-full pl-12 pr-4 py-3.5 bg-[#F8F4E1] border-2 border-transparent rounded-2xl text-[#1B4332] placeholder:text-[#1B4332]/40 focus:outline-none focus:border-[#1B4332] transition-colors"
                          required
                        />
                      </div>
                    </div>

                    {errorMessage && (
                      <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                        {errorMessage}
                      </div>
                    )}
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                    className="w-full mt-6 bg-[#1B4332] text-white py-4 rounded-full flex items-center justify-center gap-2 hover:bg-[#2D6A4F] transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <span className="text-lg">
                      {isSubmitting
                        ? isLogin
                          ? "Signing In..."
                          : "Creating Account..."
                        : isLogin
                          ? "Sign In"
                          : "Create Account"}
                    </span>
                    <Leaf className="w-5 h-5" />
                  </motion.button>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-[#1B4332]/60">
                      {isLogin
                        ? "Don't have an account?"
                        : "Already have an account?"}{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setIsLogin(!isLogin);
                          setFormData({ name: "", email: "", password: "" });
                        }}
                        className="text-[#1B4332] hover:underline"
                      >
                        {isLogin ? "Register" : "Sign In"}
                      </button>
                    </p>
                  </div>

                  {!isLogin && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 text-xs text-center text-[#1B4332]/50"
                    >
                      By registering, you agree to our{" "}
                      <a href="#" className="underline hover:text-[#1B4332]">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="underline hover:text-[#1B4332]">
                        Privacy Policy
                      </a>
                    </motion.p>
                  )}
                </form>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
