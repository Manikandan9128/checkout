"use client";

import { useState, useEffect } from "react";

const api = (path: string, query?: string) =>
  `/api/proxy?path=${encodeURIComponent(path)}${query ? `&query=${encodeURIComponent(query)}` : ""}`;

type OnboardingType = "self" | "relation";

interface Option { id: number | string; identity: string; }
interface Relative {
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  relationship: string;
}

const COUNTRY_CODES: Record<string, string> = { IN: "+91", US: "+1", UK: "+44" };

export default function Home() {
  // Meta from API
  const [genderOptions, setGenderOptions] = useState<Option[]>([]);
  const [relationshipOptions, setRelationshipOptions] = useState<Option[]>([]);
  const [languages, setLanguages] = useState<Option[]>([]);
  const [platforms, setPlatforms] = useState<Option[]>([]);
  const [models, setModels] = useState<Option[]>([]);

  // Form state
  const [onboardingType, setOnboardingType] = useState<OnboardingType>("self");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [initial, setInitial] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("IN");
  const [selectedLangs, setSelectedLangs] = useState<Option[]>([]);
  const [device, setDevice] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [zoomCall, setZoomCall] = useState("");
  const [whatsappCall, setWhatsappCall] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [updates, setUpdates] = useState(false);
  const [whatsappMsg, setWhatsappMsg] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  // Relative fields (when onboarding_type = relation)
  const [relative, setRelative] = useState<Relative>({
    first_name: "", last_name: "", phone_number: "", email: "", relationship: "",
  });
  const [relativeCountry, setRelativeCountry] = useState("IN");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch meta + languages + platforms on mount
  useEffect(() => {
    Promise.all([
      fetch(api("/api/senior/create/meta/")).then((r) => r.json() as Promise<Record<string, unknown>>),
      fetch(api("/api/administration/language-list/")).then((r) => r.json() as Promise<Record<string, unknown>>),
      fetch(api("/api/administration/platform/")).then((r) => r.json() as Promise<Record<string, unknown>>),
    ]).then(([meta, lang, platform]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const m = meta as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const l = lang as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = platform as any;
      setGenderOptions(m?.data?.meta?.gender ?? []);
      setRelationshipOptions(m?.data?.meta?.relationship ?? []);
      setLanguages(l?.data?.results ?? []);
      setPlatforms(p?.data?.results ?? []);
    }).catch(() => setError("Failed to load form options. Check connection."));
  }, []);

  // Fetch models when device changes
  useEffect(() => {
    if (!device) { setModels([]); setDeviceModel(""); return; }
    setDeviceModel("");
    fetch(api("/api/administration/device-model-list/", `platform=${device}`))
      .then((r) => r.json() as Promise<Record<string, unknown>>)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((d: any) => setModels(d?.data?.results ?? []));
  }, [device]);

  const removeLang = (id: number | string) =>
    setSelectedLangs(selectedLangs.filter((l) => l.id !== id));
  const addLang = (lang: Option) => {
    if (!selectedLangs.find((l) => l.id === lang.id))
      setSelectedLangs([...selectedLangs, lang]);
    setShowLangDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) { setError("Please agree to terms and conditions."); return; }
    setError("");
    setSubmitting(true);

    const fullPhone = `${COUNTRY_CODES[countryCode]}${phone}`;
    const relativePhone = `${COUNTRY_CODES[relativeCountry]}${relative.phone_number}`;

    const payload = {
      first_name: firstName,
      last_name: lastName,
      initial,
      dob,
      gender,
      email: email || undefined,
      phone_number: fullPhone,
      language: selectedLangs.map((l) => String(l.id)),
      onboarding_type: onboardingType,
      device: device ? String(device) : undefined,
      device_model: deviceModel ? String(deviceModel) : undefined,
      zoom_call: zoomCall === "yes",
      whatsapp_call: whatsappCall === "yes",
      whatsapp_msg: whatsappMsg,
      updates,
      ...(onboardingType === "relation"
        ? {
            relatives: [{
              first_name: relative.first_name,
              last_name: relative.last_name,
              phone_number: relativePhone,
              email: relative.email || undefined,
              relationship: relative.relationship,
            }],
          }
        : {}),
    };

    try {
      const res = await fetch(api("/api/senior/create/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json() as Record<string, unknown>;
      if (!res.ok) {
        setError(JSON.stringify(data, null, 2));
      } else {
        alert("Subscription created! Proceeding to payment...");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition";
  const labelClass = "mb-1.5 block text-sm font-medium text-gray-800";

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="border-b border-gray-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 font-bold text-purple-700">S</div>
            <div className="text-sm font-semibold leading-tight">
              <div className="text-purple-700">Saksham</div>
              <div className="text-purple-700">Senior</div>
            </div>
          </div>
          <div className="hidden items-center gap-8 text-sm font-medium text-gray-700 md:flex">
            <a href="#" className="hover:text-purple-700">Home</a>
            <a href="#" className="hover:text-purple-700">About</a>
            <a href="#" className="text-purple-700">Plans</a>
            <a href="#" className="hover:text-purple-700">Services</a>
            <a href="#" className="hover:text-purple-700">Learn ▾</a>
            <a href="#" className="hover:text-purple-700">Community</a>
          </div>
          <button className="rounded-full border border-purple-600 px-5 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50">Contact Us</button>
        </div>
      </nav>

      {/* Main */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <button className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-purple-700">← Back to plans</button>
        <h1 className="mb-6 text-2xl font-bold text-gray-900 sm:text-3xl">Complete Your Subscription</h1>

        {/* Selected Plan */}
        <div className="mb-6 rounded-2xl border border-purple-100 bg-purple-50/60 p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
            <div>
              <div className="text-base font-bold text-gray-900">Selected Plan</div>
              <div className="mt-1 text-sm text-gray-700">SS Tech Saathi - Lite Plan (Peace of Mind)</div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-lg font-bold text-purple-700">₹199/month</div>
              <div className="text-sm text-gray-600">Monthly</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Subscriber Type */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { type: "self" as OnboardingType, icon: "👤", label: "I'm Senior", desc: "I am subscribing for myself to learn and stay safe online." },
              { type: "relation" as OnboardingType, icon: "👥", label: "For Someone else", desc: "I am subscribing for a parent, relative, or friend." },
            ].map(({ type, icon, label, desc }) => (
              <button
                key={type}
                type="button"
                onClick={() => setOnboardingType(type)}
                className={`rounded-2xl border p-5 text-center transition ${
                  onboardingType === type ? "border-purple-500 bg-purple-50" : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg text-white ${onboardingType === type ? "bg-purple-600" : "bg-gray-200 text-gray-700"}`}>{icon}</div>
                <div className={`text-base font-bold ${onboardingType === type ? "text-purple-700" : "text-gray-900"}`}>{label}</div>
                <p className="mt-1 text-xs text-gray-600">{desc}</p>
              </button>
            ))}
          </div>

          {/* Name */}
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>First Name</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Initial</label>
              <input type="text" value={initial} onChange={(e) => setInitial(e.target.value)} placeholder="Initial" maxLength={3} className={inputClass} />
            </div>
          </div>

          {/* DOB */}
          <div className="mb-4">
            <label className={labelClass}>Date Of Birth</label>
            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={inputClass} required />
          </div>

          {/* Gender */}
          <div className="mb-4">
            <label className={labelClass}>Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)} className={inputClass} required>
              <option value="">Select</option>
              {genderOptions.map((g) => (
                <option key={g.id} value={g.id}>{g.identity}</option>
              ))}
            </select>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className={labelClass}>Email (Optional)</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className={inputClass} />
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label className={labelClass}>Phone number</label>
            <div className="flex">
              <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="rounded-l-lg border border-r-0 border-gray-300 bg-white px-3 py-3 text-sm focus:outline-none">
                {Object.keys(COUNTRY_CODES).map((cc) => <option key={cc} value={cc}>{cc} {COUNTRY_CODES[cc]}</option>)}
              </select>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="00000 00000" className="w-full rounded-r-lg border border-gray-300 bg-white px-4 py-3 text-sm placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200" required />
            </div>
          </div>

          {/* Languages */}
          <div className="relative mb-4">
            <label className={labelClass}>Preferred Languages</label>
            <div
              className={`${inputClass} flex min-h-[48px] cursor-pointer flex-wrap items-center gap-2`}
              onClick={() => setShowLangDropdown(!showLangDropdown)}
            >
              {selectedLangs.map((lang) => (
                <span key={lang.id} className="inline-flex items-center gap-1 rounded-md bg-purple-100 px-2 py-1 text-xs text-purple-700">
                  {lang.identity}
                  <button type="button" onClick={(e) => { e.stopPropagation(); removeLang(lang.id); }} className="hover:text-purple-900">×</button>
                </span>
              ))}
              {selectedLangs.length === 0 && <span className="text-gray-400 text-sm">Select languages</span>}
              <span className="ml-auto text-gray-400">▾</span>
            </div>
            {showLangDropdown && (
              <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                {languages.filter((l) => !selectedLangs.find((s) => s.id === l.id)).map((lang) => (
                  <button type="button" key={lang.id} onClick={() => addLang(lang)} className="block w-full px-4 py-2 text-left text-sm hover:bg-purple-50">
                    {lang.identity}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Device (Platform) */}
          <div className="mb-4">
            <label className={labelClass}>Device</label>
            <select value={device} onChange={(e) => setDevice(e.target.value)} className={inputClass} required>
              <option value="">Select</option>
              {platforms.map((p) => <option key={p.id} value={p.id}>{p.identity}</option>)}
            </select>
          </div>

          {/* Model */}
          <div className="mb-4">
            <label className={labelClass}>Model</label>
            <select value={deviceModel} onChange={(e) => setDeviceModel(e.target.value)} className={inputClass} disabled={!device} required>
              <option value="">Select</option>
              {models.map((m) => <option key={m.id} value={m.id}>{m.identity}</option>)}
            </select>
          </div>

          {/* Zoom */}
          <div className="mb-4">
            <label className={labelClass}>Do you know how to join a Zoom call?</label>
            <select value={zoomCall} onChange={(e) => setZoomCall(e.target.value)} className={inputClass} required>
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          {/* WhatsApp call */}
          <div className="mb-6">
            <label className={labelClass}>Do you know how to take calls on WhatsApp?</label>
            <select value={whatsappCall} onChange={(e) => setWhatsappCall(e.target.value)} className={inputClass} required>
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          {/* Relative fields — shown when onboarding_type = relation */}
          {onboardingType === "relation" && (
            <div className="mb-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <h2 className="mb-4 text-base font-bold text-gray-900">Senior Details</h2>
              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>First Name</label>
                  <input type="text" value={relative.first_name} onChange={(e) => setRelative({ ...relative, first_name: e.target.value })} placeholder="First name" className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Last Name</label>
                  <input type="text" value={relative.last_name} onChange={(e) => setRelative({ ...relative, last_name: e.target.value })} placeholder="Last name" className={inputClass} required />
                </div>
              </div>
              <div className="mb-4">
                <label className={labelClass}>Phone number</label>
                <div className="flex">
                  <select value={relativeCountry} onChange={(e) => setRelativeCountry(e.target.value)} className="rounded-l-lg border border-r-0 border-gray-300 bg-white px-3 py-3 text-sm focus:outline-none">
                    {Object.keys(COUNTRY_CODES).map((cc) => <option key={cc} value={cc}>{cc} {COUNTRY_CODES[cc]}</option>)}
                  </select>
                  <input type="tel" value={relative.phone_number} onChange={(e) => setRelative({ ...relative, phone_number: e.target.value })} placeholder="00000 00000" className="w-full rounded-r-lg border border-gray-300 bg-white px-4 py-3 text-sm placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200" required />
                </div>
              </div>
              <div className="mb-4">
                <label className={labelClass}>Email (Optional)</label>
                <input type="email" value={relative.email} onChange={(e) => setRelative({ ...relative, email: e.target.value })} placeholder="you@company.com" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Relationship</label>
                <select value={relative.relationship} onChange={(e) => setRelative({ ...relative, relationship: e.target.value })} className={inputClass} required>
                  <option value="">Select</option>
                  {relationshipOptions.map((r) => <option key={r.id} value={r.id}>{r.identity}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Checkboxes */}
          <div className="mb-6 space-y-3">
            <label className="flex items-center gap-2 text-sm text-gray-800">
              <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="h-4 w-4 rounded border-gray-300 accent-purple-600" />
              Agree to terms and conditions
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={updates} onChange={(e) => setUpdates(e.target.checked)} className="h-4 w-4 rounded border-gray-300 accent-purple-600" />
              Allow us to send periodic emails and updates
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={whatsappMsg} onChange={(e) => setWhatsappMsg(e.target.checked)} className="h-4 w-4 rounded border-gray-300 accent-purple-600" />
              Agree to get WhatsApp messages from us
            </label>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 whitespace-pre-wrap">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-purple-600 px-6 py-4 text-base font-semibold text-white shadow-md transition hover:bg-purple-700 active:scale-[0.99] disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Proceed to Payment"}
          </button>
        </form>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-100 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 font-bold text-purple-700">S</div>
              <div className="text-sm font-semibold leading-tight text-purple-700">Saksham<br />Senior</div>
            </div>
            <p className="text-xs leading-relaxed text-gray-600">
              Our mission is to help seniors become digitally independent and have a wholesome and safe online experience.
            </p>
          </div>
          <div>
            <div className="mb-3 text-sm font-semibold text-gray-900">Website</div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Home</li><li>About us</li><li>Plan</li><li>Services</li><li>Learn</li><li>Community</li>
            </ul>
          </div>
          <div>
            <div className="mb-3 text-sm font-semibold text-gray-900">Help</div>
            <ul className="space-y-2 text-sm text-gray-600"><li>Contact us</li></ul>
          </div>
          <div>
            <div className="mb-3 text-sm font-semibold text-gray-900">Legal</div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Terms &amp; Conditions</li><li>Privacy Policy</li><li>Disclaimer</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-100 py-4 text-center text-xs text-gray-500">
          © 2026 Saksham Senior. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
