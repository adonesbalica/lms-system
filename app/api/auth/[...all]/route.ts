import { findIp } from "@arcjet/ip";
import {
  type ArcjetDecision,
  type BotOptions,
  detectBot,
  type EmailOptions,
  type ProtectSignupOptions,
  protectSignup,
  type SlidingWindowRateLimitOptions,
  slidingWindow,
} from "@arcjet/next";
import { toNextJsHandler } from "better-auth/next-js";
import type { NextRequest } from "next/server";
import arcjet from "@/lib/arcjet";
import { auth } from "@/lib/auth";

//* EMAIL OPTION
const emailOptions = {
  mode: "LIVE",

  deny: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
} satisfies EmailOptions;

//* BOT OPTION
const botOptions = {
  mode: "LIVE",

  allow: [],
} satisfies BotOptions;

//* RESTRICTIVE RATE LIMIT SETTINGS
const restrictiveRateLimitSettings = {
  mode: "LIVE",
  max: 5,
  interval: "2m",
} satisfies SlidingWindowRateLimitOptions<[]>;

//* LAX RATE LIMIT SETTINGS
const laxRateLimitSettings = {
  mode: "LIVE",
  max: 60,
  interval: "1m",
} satisfies SlidingWindowRateLimitOptions<[]>;

//* SIGN UP OPTIONS
const signupOptions = {
  email: emailOptions,

  bots: botOptions,

  rateLimit: restrictiveRateLimitSettings,
} satisfies ProtectSignupOptions<[]>;

//* PROTECT FUNCTION
async function protect(req: NextRequest): Promise<ArcjetDecision> {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  let userId: string;
  if (session?.user.id) {
    userId = session.user.id;
  } else {
    userId = findIp(req) || "127.0.0.1";
  }

  if (
    req.nextUrl.pathname.startsWith("/api/auth/sign-up") ||
    req.nextUrl.pathname.startsWith("/api/auth/request-password-reset")
  ) {
    const body = await req.clone().json();

    if (typeof body.email === "string") {
      return arcjet
        .withRule(protectSignup(signupOptions))
        .protect(req, { email: body.email, fingerprint: userId });
    } else {
      return arcjet
        .withRule(detectBot(botOptions))
        .withRule(slidingWindow(restrictiveRateLimitSettings))
        .protect(req, { fingerprint: userId });
    }
  } else {
    // For all other auth requests
    return arcjet
      .withRule(detectBot(botOptions))
      .withRule(slidingWindow(laxRateLimitSettings))
      .protect(req, { fingerprint: userId });
  }
}

const authHandlers = toNextJsHandler(auth.handler);

export const { GET } = authHandlers;

//* CUSTOM POST REQUEST (BETTER AUTH)
export const POST = async (req: NextRequest) => {
  const decision = await protect(req);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return Response.json(
        { message: "Too many request. Please try again later" },
        { status: 429 },
      );
    } else if (decision.reason.isEmail()) {
      let message: string;

      if (decision.reason.emailTypes.includes("INVALID")) {
        message = "Email address format is invalid. Check if there's a typo";
      } else if (decision.reason.emailTypes.includes("DISPOSABLE")) {
        message = "We do not allow disposable email addresses.";
      } else if (decision.reason.emailTypes.includes("NO_MX_RECORDS")) {
        message =
          "Your email domain does not have an MX record. Check if there's a typo";
      } else {
        message = "Invalid email. Please try another one";
      }

      return Response.json({ message }, { status: 400 });
    } else {
      return Response.json(null, { status: 403 });
    }
  }

  return authHandlers.POST(req);
};
