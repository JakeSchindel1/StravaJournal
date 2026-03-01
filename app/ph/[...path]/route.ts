/**
 * PostHog first-party proxy. Forwards analytics requests through our domain
 * instead of posthog.com.
 *
 * Why: Ad blockers typically block requests to posthog.com and similar
 * analytics domains. By proxying through /ph/* on our own domain, requests
 * appear as first-party and are not blocked. This improves analytics
 * reliability and ensures events reach PostHog even when ad blockers are on.
 */

import { NextRequest, NextResponse } from "next/server";

const INGEST_HOST = process.env.POSTHOG_INGEST_HOST ?? "https://us.i.posthog.com";

/** Headers we should not forward to upstream (security/semantics) */
const SKIP_HEADERS = new Set([
  "host",
  "connection",
  "keep-alive",
  "transfer-encoding",
  "te",
  "trailer",
  "upgrade",
  "proxy-authorization",
  "proxy-connection",
]);

function buildUpstreamUrl(path: string[], request: NextRequest): string {
  const pathStr = path.join("/");
  const url = new URL(pathStr, INGEST_HOST);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });
  return url.toString();
}

function getForwardHeaders(request: NextRequest): Headers {
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (!SKIP_HEADERS.has(lower)) {
      headers.set(key, value);
    }
  });
  return headers;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  if (!path?.length) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  const upstreamUrl = buildUpstreamUrl(path, request);
  const headers = getForwardHeaders(request);

  const res = await fetch(upstreamUrl, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  const resHeaders = new Headers(res.headers);
  resHeaders.delete("transfer-encoding");
  resHeaders.delete("content-encoding");

  return new NextResponse(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: resHeaders,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  if (!path?.length) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  const upstreamUrl = buildUpstreamUrl(path, request);
  const headers = getForwardHeaders(request);

  // Forward body as stream to support large payloads without buffering
  const body = request.body;

  const res = await fetch(upstreamUrl, {
    method: "POST",
    headers,
    body,
    // Required for streaming request body in Node.js fetch
    duplex: "half",
    cache: "no-store",
  } as RequestInit & { duplex?: string });

  const resHeaders = new Headers(res.headers);
  resHeaders.delete("transfer-encoding");
  resHeaders.delete("content-encoding");

  return new NextResponse(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: resHeaders,
  });
}
