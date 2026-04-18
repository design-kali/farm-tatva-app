import { motion, AnimatePresence } from 'motion/react';
import { X, Leaf, Mail, Lock, User, Phone } from 'lucide-react';
import { useState } from 'react';

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginDialog({ isOpen, onClose }: LoginDialogProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    emailOrPhone: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login/register logic here
    console.log(isLogin ? 'Login' : 'Register', formData);
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
                  {isLogin ? 'Welcome Back!' : 'Join FarmTatva'}
                </h3>
                <p className="text-white/80 text-sm">
                  {isLogin
                    ? 'Sign in to access fresh farm produce'
                    : 'Create an account to start your fresh journey'}
                </p>

                {/* Decorative Elements */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"
                />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-8 py-8">
                <div className="space-y-5">
                  {/* Name (Register Only) */}
                  <AnimatePresence mode="wait">
                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
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
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Enter your name"
                            className="w-full pl-12 pr-4 py-3.5 bg-[#F8F4E1] border-2 border-transparent rounded-2xl text-[#1B4332] placeholder:text-[#1B4332]/40 focus:outline-none focus:border-[#1B4332] transition-colors"
                            required={!isLogin}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email/Phone */}
                  <div>
                    <label className="block text-sm text-[#1B4332]/70 mb-2">
                      Email or Phone
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <Mail className="w-5 h-5 text-[#1B4332]/40" />
                        <span className="text-[#1B4332]/20">/</span>
                        <Phone className="w-4 h-4 text-[#1B4332]/40" />
                      </div>
                      <input
                        type="text"
                        value={formData.emailOrPhone}
                        onChange={(e) => handleInputChange('emailOrPhone', e.target.value)}
                        placeholder="email@example.com or +91 98765 43210"
                        className="w-full pl-[4.5rem] pr-4 py-3.5 bg-[#F8F4E1] border-2 border-transparent rounded-2xl text-[#1B4332] placeholder:text-[#1B4332]/40 focus:outline-none focus:border-[#1B4332] transition-colors"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm text-[#1B4332]/70 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1B4332]/40" />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-12 pr-4 py-3.5 bg-[#F8F4E1] border-2 border-transparent rounded-2xl text-[#1B4332] placeholder:text-[#1B4332]/40 focus:outline-none focus:border-[#1B4332] transition-colors"
                        required
                      />
                    </div>
                  </div>

                  {/* Forgot Password (Login Only) */}
                  {isLogin && (
                    <div className="text-right">
                      <a
                        href="#"
                        className="text-sm text-[#1B4332]/60 hover:text-[#1B4332] underline decoration-dotted underline-offset-2 transition-colors"
                      >
                        Forgot password?
                      </a>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-6 bg-[#1B4332] text-white py-4 rounded-full flex items-center justify-center gap-2 hover:bg-[#2D6A4F] transition-colors shadow-lg"
                >
                  <span className="text-lg">
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </span>
                  <Leaf className="w-5 h-5" />
                </motion.button>

                {/* Toggle Login/Register */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-[#1B4332]/60">
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setFormData({ name: '', emailOrPhone: '', password: '' });
                      }}
                      className="text-[#1B4332] hover:underline"
                    >
                      {isLogin ? 'Register' : 'Sign In'}
                    </button>
                  </p>
                </div>

                {/* Terms (Register Only) */}
                {!isLogin && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 text-xs text-center text-[#1B4332]/50"
                  >
                    By registering, you agree to our{' '}
                    <a href="#" className="underline hover:text-[#1B4332]">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="underline hover:text-[#1B4332]">
                      Privacy Policy
                    </a>
                  </motion.p>
                )}
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
