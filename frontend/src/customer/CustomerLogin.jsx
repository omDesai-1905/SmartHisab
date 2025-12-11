import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CustomerLogin = () => {
  const [customerId, setCustomerId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5001/api/customer-portal/login",
        {
          customerId,
          password,
        }
      );

      localStorage.setItem("customerToken", response.data.token);
      localStorage.setItem("customerData", JSON.stringify(response.data.customer));
      
      navigate("/customer/portal");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2] p-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute w-[400px] h-[400px] bg-white/10 rounded-full -top-[100px] -left-[100px] animate-[float_6s_ease-in-out_infinite]"></div>
      <div className="absolute w-[300px] h-[300px] bg-white/10 rounded-full -bottom-[50px] -right-[50px]" style={{ animation: 'float 8s ease-in-out infinite reverse' }}></div>

      {/* Login Card */}
      <div className="bg-white p-12 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] w-full max-w-[480px] relative z-[1]">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-[#764ba2] tracking-tight">
            Customer Portal
          </h1>
          <p className="text-base text-gray-500 font-medium">
            Welcome back! Please login to continue
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 px-5 py-4 bg-gradient-to-r from-red-100 to-red-200 border-l-4 border-red-500 rounded-xl flex items-center gap-3 animate-[shake_0.5s_ease]">
            <span className="text-2xl">⚠️</span>
            <p className="text-red-900 font-semibold text-[0.95rem] m-0">
              {error}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Customer ID Field */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Customer ID
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400">
                🆔
              </div>
              <input
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full py-4 pl-14 pr-4 border-2 border-gray-200 rounded-xl text-base font-medium outline-none transition-all bg-gray-50 focus:border-[#667eea] focus:bg-white focus:shadow-[0_0_0_4px_rgba(102,126,234,0.1)] disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="Enter your ID"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400">
                🔒
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-4 pl-14 pr-4 border-2 border-gray-200 rounded-xl text-base font-medium outline-none transition-all bg-gray-50 focus:border-[#667eea] focus:bg-white focus:shadow-[0_0_0_4px_rgba(102,126,234,0.1)] disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-4 ${
              loading ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-[#696FC7] cursor-pointer shadow-[0_10px_30px_rgba(102,126,234,0.4)] hover:-translate-y-0.5 hover:shadow-[0_15px_40px_rgba(102,126,234,0.5)]'
            } text-white border-none rounded-xl text-lg font-bold transition-all mt-2 flex items-center justify-center gap-3`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <span>Login</span>
                <span className="text-xl">→</span>
              </>
            )}
          </button>
        </form>

        {/* Info Box */}
        
      </div>
    </div>
  );
};

export default CustomerLogin;
