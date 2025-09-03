// app/api/chat/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  const { message } = await req.json();

  // Call Gemini API here (replace with actual endpoint + API key)
  const response = await fetch("http://localhost:5000/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  const data = await response.json();

  return NextResponse.json({ reply: data.reply });
}
