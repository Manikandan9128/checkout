"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth, ProfileInput } from "./AuthProvider";

interface LoginModalProps {
  open: boolean;
  initialMode: "login" | "signup";
  onClose: () => void;
}

const COUNTRY_CODES: Record<string, string> = { IN: "+91", US: "+1", UK: "+44" };
const PHONE_MAX_LEN: Record<string, number> = { IN: 10, US: 10, UK: 11 };
const numericOnly = (val: string) => val.replace(/\D/g, "");

const INDIAN_STATES = [
  "Andhra Pradesh", "Bihar", "Delhi", "Gujarat", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal",
];

const META_BASE = "https://api-staging.sakshamsenior.com";

interface Option { id: number | string; identity: string; }

type Step = "login-phone" | "login-otp" | "signup-choice" | "signup-profile" | "signup-otp";

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200";
const labelCls = "mb-1.5 block text-sm font-medium text-gray-800";

function emptyRelative() {
  return { firstName: "", lastName: "", phone: "", email: "", relationship: "" };
}

export default function LoginModal({ open, initialMode, onClose }: LoginModalProps) {
  const { requestOtp, verifyOtp } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [step, setStep] = useState<Step>("login-phone");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [countryCode, setCountryCode] = useState("IN");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendIn, setResendIn] = useState(45);

  const [accountType, setAccountType] = useState<"self" | "family">("self");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [selectedLangs, setSelectedLangs] = useState<Option[]>([]);
  const [state, setState] = useState("");
  const [relative, setRelative] = useState(emptyRelative());

  const [genderOptions, setGenderOptions] = useState<Option[]>([]);
  const [relationshipOptions, setRelationshipOptions] = useState<Option[]>([]);
  const [languages, setLanguages] = useState<Option[]>([]);

  useEffect(() => {
    if (!open) return;
    Promise.all([
      fetch(`${META_BASE}/api/senior/create/meta/`).then((r) => r.json()),
      fetch(`${META_BASE}/api/administration/language-list/`).then((r) => r.json()),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ]).then(([meta, lang]: any[]) => {
      setGenderOptions(meta?.data?.meta?.gender ?? []);
      setRelationshipOptions(meta?.data?.meta?.relationship ?? []);
      setLanguages(lang?.data?.results ?? []);
    }).catch(() => {});
  }, [open]);

  useEffect(() => {
    if (step !== "login-otp" && step !== "signup-otp") return;
    setResendIn(45);
    const id = setInterval(() => setResendIn((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [step]);

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setStep(initialMode === "login" ? "login-phone" : "signup-choice");
      setError("");
    }
  }, [open, initialMode]);

  if (!open) return null;

  const resetAll = () => {
    setPhone("");
    setOtp(Array(6).fill(""));
    setAccountType("self");
    setFirstName("");
    setLastName("");
    setEmail("");
    setDob("");
    setGender("");
    setSelectedLangs([]);
    setState("");
    setRelative(emptyRelative());
    setError("");
    setSubmitting(false);
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const switchMode = (next: "login" | "signup") => {
    setMode(next);
    setStep(next === "login" ? "login-phone" : "signup-choice");
    setError("");
  };

  const phoneValid = () => phone.length >= 4;

  const handleGetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneValid()) return setError("Enter a valid mobile number.");
    setError("");
    setSubmitting(true);
    const result = await requestOtp(COUNTRY_CODES[countryCode], phone);
    setSubmitting(false);
    if (!result.ok) return setError(result.error);
    setOtp(Array(6).fill(""));
    setStep("login-otp");
  };

  const toggleLang = (lang: Option) =>
    setSelectedLangs((p) => (p.find((l) => l.id === lang.id) ? p.filter((l) => l.id !== lang.id) : [...p, lang]));

  const validateProfile = () => {
    if (!firstName.trim()) return "First name is required.";
    if (!lastName.trim()) return "Last name is required.";
    if (!phoneValid()) return "Enter a valid mobile number.";
    if (!dob) return "Date of birth is required.";
    if (!gender) return "Gender is required.";
    if (accountType === "family") {
      if (!relative.firstName.trim() || !relative.lastName.trim() || !relative.phone.trim()) {
        return "Relative's name and phone are required.";
      }
    }
    return "";
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateProfile();
    if (validationError) return setError(validationError);
    setError("");
    setSubmitting(true);
    const result = await requestOtp(COUNTRY_CODES[countryCode], phone);
    setSubmitting(false);
    if (!result.ok) return setError(result.error);
    setOtp(Array(6).fill(""));
    setStep("signup-otp");
  };

  const buildProfile = (): ProfileInput => ({
    accountType,
    firstName,
    lastName,
    email,
    dob,
    gender,
    languages: selectedLangs.map((l) => String(l.id)),
    state,
    relative: accountType === "family" ? relative : undefined,
  });

  const handleOtpChange = (i: number, val: string) => {
    const digit = numericOnly(val).slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[i] = digit;
      return next;
    });
    if (digit && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) return setError("Enter the 6-digit OTP.");
    setError("");
    setSubmitting(true);
    const result = await verifyOtp(
      COUNTRY_CODES[countryCode],
      phone,
      code,
      mode === "signup" ? buildProfile() : undefined
    );
    setSubmitting(false);
    if (!result.ok) return setError(result.error);
    resetAll();
    onClose();
  };

  const handleResend = async () => {
    if (resendIn > 0) return;
    setError("");
    const result = await requestOtp(COUNTRY_CODES[countryCode], phone);
    if (!result.ok) return setError(result.error);
    setResendIn(45);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={handleClose}>
      <div
        className="relative flex w-full max-w-[900px] flex-col overflow-hidden rounded-t-3xl bg-white shadow-xl sm:flex-row sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm transition hover:bg-gray-100 sm:right-6 sm:top-6"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div
          className="relative h-40 w-full shrink-0 sm:h-auto sm:w-[45%]"
          style={{ background: "linear-gradient(135deg, #814398 0%, #C4A8D4 100%)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://cdn.prod.website-files.com/69df9a13ad765128599ea0d4/69df9a13ad765128599ea0da_Saksham%20Senior%20Logo.svg"
            alt="Saksham Senior"
            className="absolute left-6 top-6 h-8 w-auto brightness-0 invert sm:left-8 sm:top-8"
          />
        </div>

        <div className="flex w-full flex-col overflow-y-auto px-5 pb-6 pt-6 sm:max-h-[85vh] sm:w-[55%] sm:px-10 sm:py-12">
          {(step === "login-phone" || step === "signup-choice") && (
            <div className="mb-6 flex gap-6 border-b border-gray-200">
              {(["login", "signup"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className="relative pb-3 text-sm font-semibold transition"
                  style={{ color: mode === m ? "#814398" : "#9ca3af" }}
                >
                  {m === "login" ? "Login" : "Sign Up"}
                  {mode === m && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full" style={{ backgroundColor: "#814398" }} />}
                </button>
              ))}
            </div>
          )}

          {step === "login-phone" && (
            <>
              <h2 className="text-xl font-bold" style={{ color: "#814398" }}>Welcome to Saksham Senior</h2>
              <p className="mt-1 text-sm text-gray-600">Enter your mobile number to continue.</p>
              <form onSubmit={handleGetOtp} className="mt-6">
                <label className={labelCls}>Mobile Number</label>
                <div className={`flex rounded-lg border ${error ? "border-red-400" : "border-gray-300"}`}>
                  <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="rounded-l-lg border-0 border-r border-gray-300 bg-white px-3 py-3 text-sm focus:outline-none">
                    {Object.keys(COUNTRY_CODES).map((cc) => <option key={cc} value={cc}>{COUNTRY_CODES[cc]}</option>)}
                  </select>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(numericOnly(e.target.value).slice(0, PHONE_MAX_LEN[countryCode] ?? 15))}
                    placeholder="00000 00000"
                    className="w-full rounded-r-lg border-0 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                    autoFocus
                  />
                </div>
                {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
                <button type="submit" disabled={submitting} style={{ color: "#ffffff" }}
                  className="mt-6 w-full rounded-full bg-purple-600 px-6 py-4 text-base font-semibold shadow-md transition hover:bg-purple-700 active:scale-[0.99] disabled:opacity-60">
                  {submitting ? "Sending..." : "Get OTP"}
                </button>
              </form>
            </>
          )}

          {step === "signup-choice" && (
            <>
              <h2 className="text-xl font-bold" style={{ color: "#814398" }}>New to Saksham, Create your account</h2>
              <p className="mt-1 text-sm text-gray-600">Who are you creating this account for?</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {([
                  { key: "self", title: "For Myself", desc: "I am creating an account for myself." },
                  { key: "family", title: "For a Family Member", desc: "I'm creating an account for my parent, relative, or someone I care for." },
                ] as const).map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setAccountType(opt.key)}
                    className="rounded-xl border-2 p-4 text-left transition"
                    style={{ borderColor: accountType === opt.key ? "#814398" : "#e5e7eb", backgroundColor: accountType === opt.key ? "#F3E8FF" : "#fff" }}
                  >
                    <div className="text-sm font-semibold" style={{ color: accountType === opt.key ? "#814398" : "#1f2937" }}>{opt.title}</div>
                    <div className="mt-1 text-xs text-gray-500">{opt.desc}</div>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => { setError(""); setStep("signup-profile"); }}
                style={{ color: "#ffffff" }}
                className="mt-8 w-full rounded-full bg-purple-600 px-6 py-4 text-base font-semibold shadow-md transition hover:bg-purple-700"
              >
                Next
              </button>
            </>
          )}

          {step === "signup-profile" && (
            <>
              <button type="button" onClick={() => setStep("signup-choice")} className="mb-3 text-left text-xs font-medium text-gray-500 hover:text-gray-700">&larr; Go Back</button>
              <h2 className="text-xl font-bold" style={{ color: "#814398" }}>
                {accountType === "self" ? "Create Your Profile" : "Registering for someone else"}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {accountType === "self" ? "Tell us a little about yourself to complete your profile." : "Please provide your details first, followed by the senior's information."}
              </p>

              <form onSubmit={handleProfileSubmit} className="mt-6 flex flex-col gap-4">
                {accountType === "family" && <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">Your Information</div>}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>First Name</label>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Last Name</label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Phone number</label>
                  <div className="flex rounded-lg border border-gray-300">
                    <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="rounded-l-lg border-0 border-r border-gray-300 bg-white px-3 py-3 text-sm focus:outline-none">
                      {Object.keys(COUNTRY_CODES).map((cc) => <option key={cc} value={cc}>{COUNTRY_CODES[cc]}</option>)}
                    </select>
                    <input type="tel" inputMode="numeric" value={phone} onChange={(e) => setPhone(numericOnly(e.target.value).slice(0, PHONE_MAX_LEN[countryCode] ?? 15))} placeholder="00000 00000" className="w-full rounded-r-lg border-0 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none" />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className={inputCls} />
                </div>

                {accountType === "family" && (
                  <div>
                    <label className={labelCls}>Relationship</label>
                    <select value={relative.relationship} onChange={(e) => setRelative((r) => ({ ...r, relationship: e.target.value }))} className={inputCls}>
                      <option value="">Select</option>
                      {relationshipOptions.map((r) => <option key={r.id} value={r.id}>{r.identity}</option>)}
                    </select>
                  </div>
                )}

                {accountType === "family" && (
                  <>
                    <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Senior Information</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>First Name</label>
                        <input type="text" value={relative.firstName} onChange={(e) => setRelative((r) => ({ ...r, firstName: e.target.value }))} placeholder="First name" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Last Name</label>
                        <input type="text" value={relative.lastName} onChange={(e) => setRelative((r) => ({ ...r, lastName: e.target.value }))} placeholder="Last name" className={inputCls} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Phone number</label>
                      <input type="tel" inputMode="numeric" value={relative.phone} onChange={(e) => setRelative((r) => ({ ...r, phone: numericOnly(e.target.value).slice(0, 15) }))} placeholder="00000 00000" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Email</label>
                      <input type="email" value={relative.email} onChange={(e) => setRelative((r) => ({ ...r, email: e.target.value }))} placeholder="you@company.com" className={inputCls} />
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Date Of Birth</label>
                    <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Gender</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)} className={inputCls}>
                      <option value="">Select</option>
                      {genderOptions.map((g) => <option key={g.id} value={g.id}>{g.identity}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Preferred Languages</label>
                    <div className="flex flex-wrap gap-1.5 rounded-lg border border-gray-300 p-2">
                      {selectedLangs.length === 0 && <span className="px-1 py-1 text-xs text-gray-400">Select languages</span>}
                      {selectedLangs.map((l) => (
                        <span key={l.id} className="flex items-center gap-1 rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
                          {l.identity}
                          <button type="button" onClick={() => toggleLang(l)} className="text-purple-500 hover:text-purple-800">&times;</button>
                        </span>
                      ))}
                    </div>
                    <select
                      value=""
                      onChange={(e) => {
                        const lang = languages.find((l) => String(l.id) === e.target.value);
                        if (lang) toggleLang(lang);
                      }}
                      className={`${inputCls} mt-1.5`}
                    >
                      <option value="">Add language...</option>
                      {languages.filter((l) => !selectedLangs.find((s) => s.id === l.id)).map((l) => (
                        <option key={l.id} value={l.id}>{l.identity}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>State</label>
                    <select value={state} onChange={(e) => setState(e.target.value)} className={inputCls}>
                      <option value="">Select</option>
                      {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {error && <p className="text-xs text-red-600">{error}</p>}

                <button type="submit" disabled={submitting} style={{ color: "#ffffff" }}
                  className="mt-2 w-full rounded-full bg-purple-600 px-6 py-4 text-base font-semibold shadow-md transition hover:bg-purple-700 disabled:opacity-60">
                  {submitting ? "Please wait..." : "Create Account"}
                </button>
              </form>
            </>
          )}

          {(step === "login-otp" || step === "signup-otp") && (
            <>
              <button
                type="button"
                onClick={() => setStep(mode === "login" ? "login-phone" : "signup-profile")}
                className="mb-3 text-left text-xs font-medium text-gray-500 hover:text-gray-700"
              >
                &larr; Go Back
              </button>
              <h2 className="text-xl font-bold" style={{ color: "#814398" }}>Verify your mobile number</h2>
              <p className="mt-1 text-sm text-gray-600">
                We&apos;ve sent a 6-digit OTP to {COUNTRY_CODES[countryCode]} {phone}.
              </p>

              <div className="mt-6 flex gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="h-12 w-full rounded-lg border border-gray-300 text-center text-lg font-semibold focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                ))}
              </div>

              <button type="button" onClick={handleResend} disabled={resendIn > 0} className="mt-2 self-start text-xs font-medium disabled:text-gray-400" style={{ color: resendIn > 0 ? undefined : "#814398" }}>
                {resendIn > 0 ? `Didn't receive the OTP? Resend in 00:${String(resendIn).padStart(2, "0")}` : "Resend OTP"}
              </button>

              {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

              <button type="button" onClick={handleVerify} disabled={submitting} style={{ color: "#ffffff" }}
                className="mt-6 w-full rounded-full bg-purple-600 px-6 py-4 text-base font-semibold shadow-md transition hover:bg-purple-700 disabled:opacity-60">
                {submitting ? "Verifying..." : mode === "login" ? "Verify & Continue" : "Validate OTP"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
