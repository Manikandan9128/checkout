/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useState, useEffect } from "react";

interface Option { id: number | string; identity: string; }
interface RelativeEntry {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  countryCode: string;
  relationship: string;
}

const COUNTRY_CODES: Record<string, string> = { IN: "+91", US: "+1", UK: "+44" };
const BASE = "https://api-staging.sakshamsenior.com";

function apiFetch(path: string, query?: string) {
  const q = query ? `?${query}` : "";
  return fetch(`${BASE}${path}${q}`).then((r) => r.json());
}

const emptyRelative = (): RelativeEntry => ({ first_name: "", last_name: "", email: "", phone: "", countryCode: "IN", relationship: "" });

const inp = "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition";
const lbl = "mb-1.5 block text-sm font-medium text-gray-800";

export default function Home() {
  const [genderOptions, setGenderOptions] = useState<Option[]>([]);
  const [relationshipOptions, setRelationshipOptions] = useState<Option[]>([]);
  const [languages, setLanguages] = useState<Option[]>([]);
  const [platforms, setPlatforms] = useState<Option[]>([]);
  const [models, setModels] = useState<Option[]>([]);
  const [loadError, setLoadError] = useState("");

  const [onboardingType, setOnboardingType] = useState<"self" | "relation">("self");

  // Relatives (only for "relation")
  const [relatives, setRelatives] = useState<RelativeEntry[]>([emptyRelative()]);

  // Senior fields
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
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    Promise.all([
      apiFetch("/api/senior/create/meta/"),
      apiFetch("/api/administration/language-list/"),
      apiFetch("/api/administration/platform/"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ]).then(([meta, lang, platform]: any[]) => {
      setGenderOptions(meta?.data?.meta?.gender ?? []);
      setRelationshipOptions(meta?.data?.meta?.relationship ?? []);
      setLanguages(lang?.data?.results ?? []);
      setPlatforms(platform?.data?.results ?? []);
    }).catch((e) => setLoadError(`Failed to load options: ${e}`));
  }, []);

  useEffect(() => {
    if (!device) { setModels([]); setDeviceModel(""); return; }
    setDeviceModel("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiFetch("/api/administration/device-model-list/", `platform=${device}`).then((d: any) => setModels(d?.data?.results ?? []));
  }, [device]);

  const updateRelative = (i: number, field: keyof RelativeEntry, val: string) =>
    setRelatives((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  const addRelative = () => setRelatives((prev) => [...prev, emptyRelative()]);
  const removeRelative = (i: number) => setRelatives((prev) => prev.filter((_, idx) => idx !== i));

  const removeLang = (id: number | string) => setSelectedLangs((p) => p.filter((l) => l.id !== id));
  const addLang = (lang: Option) => {
    setSelectedLangs((p) => p.find((l) => l.id === lang.id) ? p : [...p, lang]);
    setShowLangDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) { setFormError("Please agree to terms and conditions."); return; }
    setFormError("");
    setSubmitting(true);
    const payload = {
      first_name: firstName,
      last_name: lastName,
      initial,
      dob,
      gender,
      email: email || undefined,
      phone_number: `${COUNTRY_CODES[countryCode]}${phone}`,
      language: selectedLangs.map((l) => String(l.id)),
      onboarding_type: onboardingType,
      device: device ? String(device) : undefined,
      device_model: deviceModel ? String(deviceModel) : undefined,
      zoom_call: zoomCall === "yes",
      whatsapp_call: whatsappCall === "yes",
      whatsapp_msg: whatsappMsg,
      updates,
      ...(onboardingType === "relation" ? {
        relatives: relatives.map((r) => ({
          first_name: r.first_name,
          last_name: r.last_name,
          email: r.email,
          phone_number: `${COUNTRY_CODES[r.countryCode]}${r.phone}`,
          relationship: r.relationship,
        })),
      } : {}),
    };
    try {
      const res = await fetch(`${BASE}/api/senior/create/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = await res.json();
      if (!res.ok) setFormError(JSON.stringify(data, null, 2));
      else alert("Subscription created! Proceeding to payment...");
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <header>
        <div role="banner" className="navbar w-nav">
          <div className="padding-global">
            <div className="container-large">
              <div className="padding-section-small is-nav">
                <div className="navbar-component">
                  <a href="/" className="w-inline-block">
                    <img loading="lazy" src="https://cdn.prod.website-files.com/69df9a13ad765128599ea0d4/69df9a13ad765128599ea0da_Saksham%20Senior%20Logo.svg" alt="Saksham Senior Logo" />
                  </a>
                  <nav role="navigation" className="navigation-content-holder w-nav-menu">
                    <div className="navbar-link-holder">
                      <a href="/" className="nav-links w-inline-block"><div>Home</div><div className="nav-border"></div></a>
                      <a href="/about-us" className="nav-links w-inline-block"><div>About</div><div className="nav-border"></div></a>
                      <a href="/plan" className="nav-links w-inline-block"><div>Plans</div><div className="nav-border"></div></a>
                      <a href="/service" className="nav-links w-inline-block"><div>Services</div><div className="nav-border"></div></a>
                      <div data-delay="0" data-hover="true" className="nav-megamenu-dropdown w-dropdown">
                        <div className="nav-megamenu-toggle w-dropdown-toggle" role="button" tabIndex={0}><div>Learn</div><div className="megamenu-icon w-icon-dropdown-toggle"></div></div>
                        <nav className="navbar-dropdown-navigation w-dropdown-list">
                          <div className="navbar-dropdown-linkholder">
                            <a href="/tutorials" className="navbar-linkblock is-radius-none w-inline-block" tabIndex={0}><div className="navbar-link-text">Tech Tutorials</div></a>
                            <a href="/blogs" className="navbar-linkblock w-inline-block" tabIndex={0}><div className="navbar-link-text">Resources</div></a>
                          </div>
                        </nav>
                      </div>
                      <a href="/community" className="nav-links w-inline-block"><div>Community</div><div className="nav-border"></div></a>
                    </div>
                    <div className="navbar-rightholder">
                      <div className="navbar-cta-wrap">
                        <a href="#" className="navbar-btn w-inline-block"></a>
                        <div className="navbar-cta-text" style={{ color: "rgb(129, 67, 152)" }}>Contact Us</div>
                      </div>
                    </div>
                  </nav>
                  <div className="w-nav-button" role="button" tabIndex={0} aria-label="menu"><div className="w-icon-nav-menu"></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <button className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-purple-700">← Back to plans</button>
        <h1 className="mb-6 text-2xl font-bold text-gray-900 sm:text-3xl">Complete Your Subscription</h1>

        {/* Plan */}
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

        {loadError && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>}

        <form onSubmit={handleSubmit}>
          {/* Onboarding type */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {([
              { type: "self" as const, icon: "👤", label: "I'm Senior", desc: "I am subscribing for myself to learn and stay safe online." },
              { type: "relation" as const, icon: "👥", label: "For Someone else", desc: "I am subscribing for a parent, relative, or friend." },
            ]).map(({ type, icon, label, desc }) => (
              <button key={type} type="button" onClick={() => setOnboardingType(type)}
                className={`rounded-2xl border p-5 text-center transition ${onboardingType === type ? "border-purple-500 bg-purple-50" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${onboardingType === type ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600"}`}>{icon}</div>
                <div className={`text-base font-bold ${onboardingType === type ? "text-purple-700" : "text-gray-900"}`}>{label}</div>
                <p className="mt-1 text-xs text-gray-600">{desc}</p>
              </button>
            ))}
          </div>

          {/* ── RELATION: Relative blocks first ── */}
          {onboardingType === "relation" && (
            <div className="mb-6">
              {relatives.map((rel, i) => (
                <div key={i} className="mb-4 rounded-2xl border border-gray-200 bg-white p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-semibold text-purple-700">Relative Information</span>
                  </div>

                  <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={lbl}>First Name</label>
                      <input type="text" value={rel.first_name} onChange={(e) => updateRelative(i, "first_name", e.target.value)}
                        placeholder="First name" className={inp} required />
                    </div>
                    <div>
                      <label className={lbl}>Last Name</label>
                      <input type="text" value={rel.last_name} onChange={(e) => updateRelative(i, "last_name", e.target.value)}
                        placeholder="Last name" className={inp} required />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className={lbl}>Email</label>
                    <input type="email" value={rel.email} onChange={(e) => updateRelative(i, "email", e.target.value)}
                      placeholder="you@company.com" className={inp} required />
                  </div>

                  <div className="mb-4">
                    <label className={lbl}>Phone number</label>
                    <div className="flex">
                      <select value={rel.countryCode} onChange={(e) => updateRelative(i, "countryCode", e.target.value)}
                        className="rounded-l-lg border border-r-0 border-gray-300 bg-white px-3 py-3 text-sm focus:outline-none">
                        {Object.keys(COUNTRY_CODES).map((cc) => <option key={cc} value={cc}>{cc} {COUNTRY_CODES[cc]}</option>)}
                      </select>
                      <input type="tel" value={rel.phone} onChange={(e) => updateRelative(i, "phone", e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full rounded-r-lg border border-gray-300 bg-white px-4 py-3 text-sm placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                        required />
                    </div>
                  </div>

                  <div>
                    <label className={lbl}>Relationship to senior</label>
                    <select value={rel.relationship} onChange={(e) => updateRelative(i, "relationship", e.target.value)}
                      className={inp} required>
                      <option value="">Select</option>
                      {relationshipOptions.map((r) => <option key={r.id} value={r.id}>{r.identity}</option>)}
                    </select>
                  </div>
                </div>
              ))}

              {/* Remove / Add More buttons */}
              <div className="flex justify-end gap-3">
                {relatives.length > 1 && (
                  <button type="button" onClick={() => removeRelative(relatives.length - 1)}
                    className="flex items-center gap-1 rounded-full bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700">
                    − Remove
                  </button>
                )}
                <button type="button" onClick={addRelative}
                  className="flex items-center gap-1 rounded-full border border-purple-600 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50">
                  + Add More Relatives
                </button>
              </div>
            </div>
          )}

          {/* ── Senior Information ── */}
          <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-5">
            {onboardingType === "relation" && (
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">02</span>
                <span className="text-sm font-semibold text-purple-700">Senior Information</span>
              </div>
            )}

            {/* Name */}
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div><label className={lbl}>First Name</label><input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" className={inp} required /></div>
              <div><label className={lbl}>Last Name</label><input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" className={inp} required /></div>
              <div><label className={lbl}>Initial</label><input type="text" value={initial} onChange={(e) => setInitial(e.target.value)} placeholder="Initial" maxLength={3} className={inp} /></div>
            </div>

            {/* DOB */}
            <div className="mb-4">
              <label className={lbl}>Date Of Birth</label>
              <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={inp} required />
            </div>

            {/* Gender */}
            <div className="mb-4">
              <label className={lbl}>Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className={inp} required>
                <option value="">Select</option>
                {genderOptions.map((g) => <option key={g.id} value={g.id}>{g.identity}</option>)}
              </select>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className={lbl}>Email (Optional)</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className={inp} />
            </div>

            {/* Phone */}
            <div className="mb-4">
              <label className={lbl}>Phone number</label>
              <div className="flex">
                <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="rounded-l-lg border border-r-0 border-gray-300 bg-white px-3 py-3 text-sm focus:outline-none">
                  {Object.keys(COUNTRY_CODES).map((cc) => <option key={cc} value={cc}>{cc} {COUNTRY_CODES[cc]}</option>)}
                </select>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000"
                  className="w-full rounded-r-lg border border-gray-300 bg-white px-4 py-3 text-sm placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200" required />
              </div>
            </div>

            {/* Languages */}
            <div className="relative mb-4">
              <label className={lbl}>Preferred Languages</label>
              <div className={`${inp} flex min-h-[48px] cursor-pointer flex-wrap items-center gap-2`} onClick={() => setShowLangDropdown((v) => !v)}>
                {selectedLangs.length === 0 && <span className="text-sm text-gray-400">Select languages</span>}
                {selectedLangs.map((lang) => (
                  <span key={lang.id} className="inline-flex items-center gap-1 rounded-md bg-purple-100 px-2 py-1 text-xs text-purple-700">
                    {lang.identity}
                    <button type="button" onClick={(e) => { e.stopPropagation(); removeLang(lang.id); }} className="hover:text-purple-900">×</button>
                  </span>
                ))}
                <span className="ml-auto text-gray-400">▾</span>
              </div>
              {showLangDropdown && (
                <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                  {languages.filter((l) => !selectedLangs.find((s) => s.id === l.id)).map((lang) => (
                    <button type="button" key={lang.id} onClick={() => addLang(lang)} className="block w-full px-4 py-2 text-left text-sm hover:bg-purple-50">{lang.identity}</button>
                  ))}
                </div>
              )}
            </div>

            {/* Device */}
            <div className="mb-4">
              <label className={lbl}>Device</label>
              <select value={device} onChange={(e) => setDevice(e.target.value)} className={inp} required>
                <option value="">Select</option>
                {platforms.map((p) => <option key={p.id} value={p.id}>{p.identity}</option>)}
              </select>
            </div>

            {/* Model */}
            <div className="mb-4">
              <label className={lbl}>Model</label>
              <select value={deviceModel} onChange={(e) => setDeviceModel(e.target.value)} className={inp} disabled={!device} required>
                <option value="">Select</option>
                {models.map((m) => <option key={m.id} value={m.id}>{m.identity}</option>)}
              </select>
            </div>

            {/* Zoom */}
            <div className="mb-4">
              <label className={lbl}>Do you know how to join a Zoom call?</label>
              <select value={zoomCall} onChange={(e) => setZoomCall(e.target.value)} className={inp} required>
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            {/* WhatsApp */}
            <div>
              <label className={lbl}>Do you know how to take calls on WhatsApp?</label>
              <select value={whatsappCall} onChange={(e) => setWhatsappCall(e.target.value)} className={inp} required>
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="mb-6 space-y-3">
            <label className="flex items-center gap-2 text-sm text-gray-800"><input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="h-4 w-4 rounded border-gray-300 accent-purple-600" />Agree to terms and conditions</label>
            <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={updates} onChange={(e) => setUpdates(e.target.checked)} className="h-4 w-4 rounded border-gray-300 accent-purple-600" />Allow us to send periodic emails and updates</label>
            <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={whatsappMsg} onChange={(e) => setWhatsappMsg(e.target.checked)} className="h-4 w-4 rounded border-gray-300 accent-purple-600" />Agree to get WhatsApp messages from us</label>
          </div>

          {formError && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 whitespace-pre-wrap">{formError}</div>}

          <button type="submit" disabled={submitting}
            className="w-full rounded-full bg-purple-600 px-6 py-4 text-base font-semibold text-white shadow-md transition hover:bg-purple-700 active:scale-[0.99] disabled:opacity-60">
            {submitting ? "Submitting..." : "Proceed to Payment"}
          </button>
        </form>
      </main>

      {/* Footer */}
      <footer>
        <div className="padding-global">
          <div className="container-large">
            <div className="padding-section-large">
              <div className="footer-component">
                <div className="footer-component-holder">
                  <div className="footer-content-wrapper">
                    <a href="/" className="w-inline-block">
                      <img loading="lazy" src="https://cdn.prod.website-files.com/69df9a13ad765128599ea0d4/69df9a13ad765128599ea0da_Saksham%20Senior%20Logo.svg" alt="Saksham Senior Logo" />
                    </a>
                    <div className="padding-bottom is-medium"></div>
                    <div className="footer-about-wrap">
                      <div>Our mission is to help seniors become digitally independent and have a wholesome and safe online experience. Join our community on WhatsApp and YouTube and follow us on Instagram, Facebook and X.</div>
                    </div>
                    <div className="padding-bottom is-xxsmall"></div>
                    <div className="footer-socialwrap">
                      <a href="#" className="social-icon w-inline-block"><div className="social-icon-code w-embed"><svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#yt)"><path d="M0 14C0 6.268 6.268 0 14 0s14 6.268 14 14-6.268 14-14 14S0 21.732 0 14z" fill="#FF0000"/><path d="M21.155 10.541a2.19 2.19 0 00-1.321-1.356C18.67 8.865 14 8.865 14 8.865s-4.67 0-5.835.32a2.19 2.19 0 00-1.32 1.356C6.533 11.737 6.533 14.232 6.533 14.232s0 2.495.312 3.69a2.19 2.19 0 001.32 1.357C9.33 19.598 14 19.598 14 19.598s4.67 0 5.834-.32a2.19 2.19 0 001.321-1.356c.312-1.195.312-3.69.312-3.69s0-2.495-.312-3.691z" fill="white"/><path d="M12.6 16.801V12.135l3.733 2.333-3.733 2.333z" fill="#FF0000"/></g><defs><clipPath id="yt"><rect width="28" height="28" fill="white"/></clipPath></defs></svg></div></a>
                      <a href="#" className="social-icon w-inline-block"><div className="social-icon-code w-embed"><svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="14" fill="#C32AA3"/><path d="M14 6.531c2.028 0 2.281.009 3.077.046.795.036 1.338.162 1.814.347a3.64 3.64 0 011.316.857c.415.415.671.832.862 1.323.184.475.31 1.018.347 1.812.036.797.045 1.051.045 3.079 0 2.027-.009 2.28-.045 3.077-.037.794-.163 1.337-.347 1.812a3.638 3.638 0 01-.862 1.322 3.64 3.64 0 01-1.316.857c-.476.185-1.02.311-1.814.347-.796.036-1.05.045-3.077.045-2.028 0-2.281-.009-3.078-.045-.794-.036-1.337-.162-1.812-.347a3.638 3.638 0 01-1.322-.857 3.64 3.64 0 01-.857-1.322c-.185-.475-.311-1.018-.347-1.812C6.543 16.28 6.533 16.027 6.533 14c0-2.027.01-2.28.046-3.077.036-.794.162-1.337.347-1.812a3.64 3.64 0 01.857-1.323 3.638 3.638 0 011.322-.857c.475-.185 1.018-.311 1.812-.347.797-.037 1.05-.046 3.078-.046zm0 1.343c-1.977 0-2.21.008-2.983.043-.722.033-1.114.155-1.374.257a2.3 2.3 0 00-.853.555 2.3 2.3 0 00-.555.853c-.102.26-.224.652-.257 1.374-.035.773-.043 1.005-.043 2.983s.008 2.21.043 2.983c.033.722.155 1.114.257 1.374.136.348.298.597.555.853.256.257.505.419.853.555.26.102.652.224 1.374.257.773.036 1.006.043 2.983.043 1.978 0 2.21-.007 2.983-.043.722-.033 1.114-.155 1.374-.257.348-.136.597-.298.853-.555.257-.256.419-.505.555-.853.102-.26.224-.652.257-1.374.035-.773.043-1.005.043-2.983s-.008-2.21-.043-2.983c-.033-.722-.155-1.114-.257-1.374a2.3 2.3 0 00-.555-.853 2.3 2.3 0 00-.853-.555c-.26-.102-.652-.224-1.374-.257-.773-.035-1.005-.043-2.983-.043zm0 2.29a3.836 3.836 0 110 7.672 3.836 3.836 0 010-7.672zm0 1.346a2.49 2.49 0 100 4.98 2.49 2.49 0 000-4.98zm4.986-2.388a.896.896 0 110 1.792.896.896 0 010-1.792z" fill="white"/></svg></div></a>
                      <a href="#" className="social-icon w-inline-block"><div className="social-icon-code w-embed"><svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="14" fill="black"/><path d="M18.212 7h2.012l-4.397 5.56L21 20.125h-4.05l-3.172-4.589-3.63 4.589H8.134l4.703-5.947L7.875 7h4.153l2.867 4.194L18.212 7zm-.707 11.792h1.116L11.422 8.263h-1.197l7.28 10.529z" fill="white"/></svg></div></a>
                      <a href="#" className="social-icon w-inline-block"><div className="social-icon-code w-embed"><svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="14" fill="#3B5998"/><path d="M15.46 22.232V14.615h2.103l.278-2.625H15.46l.004-1.313c0-.685.065-1.052 1.048-1.052h1.315V7h-2.103c-2.526 0-3.415 1.273-3.415 3.415v1.576H10.734v2.624H12.31v7.617h3.15z" fill="white"/></svg></div></a>
                      <a href="#" className="social-icon w-inline-block"><div className="social-icon-code w-embed"><svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="14" fill="url(#wg)"/><path fillRule="evenodd" clipRule="evenodd" d="M14 5.938A8.063 8.063 0 005.936 14c0 1.11.225 2.17.633 3.135l-.761 2.848 2.849-.762A8.063 8.063 0 1014 5.937zm-2.272 4.75h-.07c-.36-.001-.692.055-.966.203-.237.11-.44.294-.593.478-.153.184-.288.421-.334.676-.073.35-.013.616.052.9l.009.04c.326 1.443 1.088 2.858 2.26 4.03 1.172 1.172 2.587 1.934 4.03 2.26l.04.009c.284.065.55.125.9.052.225-.053.462-.188.646-.335.183-.147.367-.356.478-.593.148-.274.204-.606.203-.965v-.07c0-.165-.005-.443-.107-.7-.128-.307-.392-.56-.806-.628l-.004-.001c-.512-.08-.902-.14-1.177-.18-.138-.02-.252-.037-.342-.047-.074-.008-.175-.018-.26-.013-.368.021-.66.171-.886.326-.144.099-.3.23-.423.334l-.058.047c-.221.178-.332.268-.468.265-.137-.003-.237-.09-.437-.266-.127-.111-.252-.228-.374-.35-.122-.121-.24-.25-.356-.378-.175-.2-.262-.3-.265-.436-.003-.137.087-.248.265-.427l.047-.057c.104-.123.234-.279.333-.423.155-.226.305-.518.326-.886.005-.077-.005-.178-.013-.261-.01-.09-.027-.204-.047-.342-.04-.275-.1-.665-.18-1.177-.067-.413-.32-.678-.627-.806-.258-.102-.535-.107-.7-.107z" fill="white"/><defs><linearGradient id="wg" x1="14" y1="0" x2="14" y2="28" gradientUnits="userSpaceOnUse"><stop stopColor="#59D064"/><stop offset="1" stopColor="#2DB640"/></linearGradient></defs></svg></div></a>
                    </div>
                  </div>
                  <div className="footer-link-wrap">
                    <div>
                      <div className="footer-link-header"><div>Website</div></div>
                      <div className="footer-link-holder">
                        <a href="/" className="footer-link w-inline-block"><div>Home</div></a>
                        <a href="/about-us" className="footer-link w-inline-block"><div>About us</div></a>
                        <a href="/plan" className="footer-link w-inline-block"><div>Plan</div></a>
                        <a href="/service" className="footer-link w-inline-block"><div>Services</div></a>
                        <a href="#" className="footer-link w-inline-block"><div>Learn</div></a>
                        <a href="/community" className="footer-link w-inline-block"><div>Community</div></a>
                      </div>
                    </div>
                    <div>
                      <div className="footer-link-header"><div>Help</div></div>
                      <div className="footer-link-holder">
                        <a href="/contact-us" className="footer-link w-inline-block"><div>Contact us</div></a>
                      </div>
                    </div>
                    <div>
                      <div className="footer-link-header"><div>Legal</div></div>
                      <div className="footer-link-holder">
                        <a href="/terms-and-condition" className="footer-link w-inline-block"><div>Terms &amp; Conditions</div></a>
                        <a href="/privacy-policy" className="footer-link w-inline-block"><div>Privacy Policy</div></a>
                        <a href="/disclaimer" className="footer-link w-inline-block"><div>Disclaimer</div></a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="footer-border"></div>
                <div className="footer-copyright-holder">
                  <div>© 2026 Saksham Senior. All rights reserved.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
