import { NextRequest, NextResponse } from "next/server";

const BASE = "http://13.203.81.21:8000";

export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get("path") ?? "";
  const query = req.nextUrl.searchParams.get("query") ?? "";
  const url = `${BASE}${path}${query ? `?${query}` : ""}`;

  const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const path = req.nextUrl.searchParams.get("path") ?? "";
  const url = `${BASE}${path}`;
  const body = await req.text();

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
