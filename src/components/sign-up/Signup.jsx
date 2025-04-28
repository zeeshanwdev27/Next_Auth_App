"use client";
import Link from "next/link";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      const emailCheckRes = await fetch("/api/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const emailCheckData = await emailCheckRes.json();
      if (emailCheckData.exists) {
        toast.error("Email is already in use!");
        return;
      }

      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        // 👇👇 CHANGED THIS PART 👇👇
        const email = formData.email;
        const password = formData.password
        toast.success("Signup successful! Please verify your email.");
        router.push(`/verify-otp?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
        // 👆👆 Redirecting to OTP verification page instead of logging in 👆👆
      } else {
        const errorData = await res.json();
        console.error(errorData.message);
        toast.error(errorData.message || "Something went wrong!");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred!");
    }
  }

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <>
      <main className="w-full h-screen flex flex-col items-center justify-center px-4 bg-white">
        <div className="max-w-sm w-full text-gray-600 space-y-5">
          <div className="text-center pb-8">
            <div className="mt-5">
              <h3 className="text-gray-800 text-2xl font-bold sm:text-3xl">
                Sign up to your account
              </h3>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-medium">Username</label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                name="username"
                placeholder="Enter your username"
                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
              />
            </div>

            <div>
              <label className="font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
              />
            </div>

            <div>
              <label className="font-medium">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                name="password"
                placeholder="Enter your password"
                className="mb-3 w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
              />
              {error && (
                <div className="text-red-600 text-sm mt-2">{error}</div>
              )}
            </div>

            <button
              type="submit"
              className="hover:cursor-pointer w-full px-4 py-2 text-white font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-600 rounded-lg duration-150"
            >
              {isLoading ? "Signing up..." : "Sign up"}
            </button>
          </form>

          {/* Google Sign Up */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-x-3 py-2.5 border rounded-lg text-sm font-medium ${
              isLoading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-100 duration-150 active:bg-gray-100"
            }`}
          >
            {isLoading ? (
              "Redirecting..."
            ) : (
              <>
                <img
                  src="https://raw.githubusercontent.com/sidiDev/remote-assets/7cd06bf1d8859c578c2efbfda2c68bd6bedc66d8/google-icon.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                Continue with Google
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-x-2">
            <p className="text-center">Already have an account?</p>
            <p>
              <Link
                href="/signin"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </main>
      <ToastContainer />
    </>
  );
}

export default Signup;
