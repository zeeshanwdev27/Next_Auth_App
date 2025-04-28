import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/UserModel";
import OtpModel from "@/models/OtpModel";
import { NextResponse } from "next/server";

export async function POST(req) {
  await dbConnect();

  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ message: "Email and OTP are required." }, { status: 400 });
    }

    // Find user by email
    const user = await UserModel.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // Find OTP entry for this user
    const otpEntry = await OtpModel.findOne({ userId: user._id });

    if (!otpEntry) {
      return NextResponse.json({ message: "OTP not found or expired." }, { status: 400 });
    }

    // Check if OTP matches
    if (otpEntry.otp !== otp) {
      return NextResponse.json({ message: "Invalid OTP." }, { status: 400 });
    }

    // Check if OTP is expired
    if (otpEntry.expiresAt < new Date()) {
      return NextResponse.json({ message: "OTP expired." }, { status: 400 });
    }

    // Update user to verified
    user.isVerified = true;
    await user.save();

    // Delete OTP entry (optional but recommended)
    await OtpModel.deleteOne({ _id: otpEntry._id });

    return NextResponse.json({ message: "Email verified successfully." }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}
