"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

async function verifyOtp(email, otp) {
  const res = await fetch("/api/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });

  const data = await res.json();
  if (res.ok) {
    console.log("Email Verified Successfully!", data);
    toast.success("Email Verified Successfully!");
    return true;
  } else {
    console.error("Verification failed:", data.message);
    toast.error("Verification failed: " + data.message);
    return false;
  }
}

async function resendOtp(email) {
  const res = await fetch("/api/resend-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();
  if (res.ok) {
    toast.success("OTP resent successfully!");
  } else {
    toast.error("Failed to resend OTP: " + data.message);
  }
}

function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const emailFromParams = searchParams.get("email");
    const passwordFromParams = searchParams.get("password");
    if (emailFromParams && passwordFromParams) {
      setEmail(decodeURIComponent(emailFromParams));
      setPassword(decodeURIComponent(passwordFromParams));
    }
  }, [searchParams]);

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("OTP must be 6 digits.");
      return;
    }
    if (!email) {
      toast.error("Email is missing.");
      return;
    }
    try {
      const isVerified = await verifyOtp(email, otp);
      if (isVerified) {
        // 🟰 After successful verification, Sign In the user automatically
        const signInResult = await signIn('credentials', {
          email,
          password, // No password needed here if you allow login without it, otherwise collect from signup or ask again.
          redirect: false,
        });

        if (signInResult?.error) {
          console.error("Sign In failed:", signInResult.error);
          toast.error("Sign In failed. Please login manually.");
          router.push('/signin');
        } else {
          toast.success("Logged in successfully!");
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error("Error during OTP verification:", error);
      toast.error("Error during OTP verification.");
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      toast.error("Email is missing.");
      return;
    }
    try {
      await resendOtp(email);
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast.error("Error resending OTP.");
    }
  };

  if (!email) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center px-4 bg-white">
      <div className="max-w-sm w-full text-gray-600 space-y-5">
        <div className="text-center pb-8">
          <h3 className="text-gray-800 text-2xl font-bold sm:text-3xl">
            Verify your Email
          </h3>
        </div>

        <form onSubmit={handleOtpSubmit} className="space-y-5">
          <div>
            <label className="font-medium">Enter OTP</label>
            <input
              type="text"
              required
              value={otp}
              onChange={handleOtpChange}
              name="otp"
              placeholder="Enter your OTP"
              className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
          </div>

          <button
            type="submit"
            className="hover:cursor-pointer w-full px-4 py-2 text-white font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-600 rounded-lg duration-150"
          >
            Verify OTP
          </button>
        </form>

        <button
          onClick={handleResendOtp}
          className="w-full px-4 py-2 text-indigo-600 font-medium border rounded-lg duration-150 hover:bg-indigo-100"
        >
          Resend OTP
        </button>

        <div className="flex items-center justify-center gap-x-2">
          <p className="text-center">Didn’t receive OTP?</p>
          <p
            className="font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer"
            onClick={handleResendOtp}
          >
            Resend OTP
          </p>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default VerifyOtpPage;
