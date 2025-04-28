import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/UserModel";
import OtpModel from "@/models/OtpModel";
import bcrypt from "bcrypt";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  await dbConnect();

  try {
    const { username, email, password, provider = 'credentials' } = await req.json();   //manually put required, Now didnt need in User Schema

    if (!username || !email) {
      return NextResponse.json({ message: "Username and email are required." }, { status: 400 });
    }

    if (provider === 'credentials') {
      if (!password || password.length < 8) {
        return NextResponse.json({ message: "Password must be at least 8 characters." }, { status: 400 });
      }
    }

    const userExist = await UserModel.findOne({ email });

    if (userExist) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    let hashedPassword;
    if (provider === 'credentials' && password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const newUser = await UserModel.create({
      username,
      email,
      password: hashedPassword,
      provider,
      isVerified: provider === 'google' ? true : false,
    });

    // Only create OTP if user signed up with credentials
    if (provider === 'credentials') {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      await OtpModel.create({
        userId: newUser._id,
        otp: otpCode,
        expiresAt: Date.now() + 10 * 60 * 1000, // expires in 10 minutes
      });

      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Verify your Email',
        html: `<p>Your OTP code is: <b>${otpCode}</b></p><p>It will expire in 10 minutes.</p>`,
      });
    }

    return NextResponse.json({ message: "User created successfully." }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
