import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/UserModel";

export async function POST(req) {
  const { email } = await req.json();

  try {
    await dbConnect();
    const user = await UserModel.findOne({ email });

    if (user) {
      return Response.json({ exists: true });
    }

    return Response.json({ exists: false });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Server Error" }), { status: 500 });
  }
}
