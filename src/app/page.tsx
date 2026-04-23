/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useState, useEffect } from "react";

interface Option { id: number | string; identity: string; }
interface Relative {
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  relationship: string;
}

const COUNTRY_CODES: Record<string, string> = { IN: "+91", US: "+1", UK: "+44" };
const BASE = "https://api-staging.sakshamsenior.com";

function apiFetch(path: string, query?: string) {
  const q = query ? `?${query}` : "";
  return fetch(`${BASE}${path}${q}`).then((r) => r.json());
}

export default function Home() {
  const [genderOptions, setGenderOptions] = useState<Option[]>([]);
  const [relationshipOptions, setRelationshipOptions] = useState<Option[]>([]);
  const [languages, setLanguages] = useState<Option[]>([]);
  const [platforms, setPlatforms] = useState<Option[]>([]);
  const [models, setModels] = useState<Option[]>([]);
  const [loadError, setLoadError] = useState("");

  const [onboardingType, setOnboardingType] = useState<"self" | "relation">("self");
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
  const [relative, setRelative] = useState<Relative>({ first_name: "", last_name: "", phone_number: "", email: "", relationship: "" });
  const [relativeCountry, setRelativeCountry] = useState("IN");
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
        relatives: [{
          first_name: relative.first_name,
          last_name: relative.last_name,
          phone_number: `${COUNTRY_CODES[relativeCountry]}${relative.phone_number}`,
          email: relative.email || undefined,
          relationship: relative.relationship,
        }],
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

  const inp = "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition";
  const lbl = "mb-1.5 block text-sm font-medium text-gray-800";

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <header>
        <div data-animation="default" data-collapse="medium" data-duration="400" data-easing="ease" data-easing2="ease" role="banner" className="navbar w-nav">
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
                        <div className="navbar-cta-text" style={{color: "rgb(129, 67, 152)"}}>Contact Us</div>
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
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="00000 00000"
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
          <div className="mb-6">
            <label className={lbl}>Do you know how to take calls on WhatsApp?</label>
            <select value={whatsappCall} onChange={(e) => setWhatsappCall(e.target.value)} className={inp} required>
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          {/* Relative section */}
          {onboardingType === "relation" && (
            <div className="mb-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <h2 className="mb-4 text-base font-bold text-gray-900">Senior Details</h2>
              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div><label className={lbl}>First Name</label><input type="text" value={relative.first_name} onChange={(e) => setRelative({ ...relative, first_name: e.target.value })} placeholder="First name" className={inp} required /></div>
                <div><label className={lbl}>Last Name</label><input type="text" value={relative.last_name} onChange={(e) => setRelative({ ...relative, last_name: e.target.value })} placeholder="Last name" className={inp} required /></div>
              </div>
              <div className="mb-4">
                <label className={lbl}>Phone number</label>
                <div className="flex">
                  <select value={relativeCountry} onChange={(e) => setRelativeCountry(e.target.value)} className="rounded-l-lg border border-r-0 border-gray-300 bg-white px-3 py-3 text-sm focus:outline-none">
                    {Object.keys(COUNTRY_CODES).map((cc) => <option key={cc} value={cc}>{cc} {COUNTRY_CODES[cc]}</option>)}
                  </select>
                  <input type="tel" value={relative.phone_number} onChange={(e) => setRelative({ ...relative, phone_number: e.target.value })} placeholder="00000 00000"
                    className="w-full rounded-r-lg border border-gray-300 bg-white px-4 py-3 text-sm placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200" required />
                </div>
              </div>
              <div className="mb-4"><label className={lbl}>Email (Optional)</label><input type="email" value={relative.email} onChange={(e) => setRelative({ ...relative, email: e.target.value })} placeholder="you@company.com" className={inp} /></div>
              <div>
                <label className={lbl}>Relationship</label>
                <select value={relative.relationship} onChange={(e) => setRelative({ ...relative, relationship: e.target.value })} className={inp} required>
                  <option value="">Select</option>
                  {relationshipOptions.map((r) => <option key={r.id} value={r.id}>{r.identity}</option>)}
                </select>
              </div>
            </div>
          )}

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
                    <div className="footer-about-wrap"><div>Our mission is to help seniors become digitally independent and have a wholesome and safe online experience. Join our community on WhatsApp and YouTube and follow us on Instagram, Facebook and X.</div></div>
                    <div className="padding-bottom is-xxsmall"></div>
                    <div className="footer-socialwrap">
                      <a href="#" className="social-icon w-inline-block"><div className="social-icon-code w-embed"><svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#yt)"><path d="M0 14C0 6.26801 6.26801 0 14 0C21.732 0 28 6.26801 28 14C28 21.732 21.732 28 14 28C6.26801 28 0 21.732 0 14Z" fill="#FF0000"/><path d="M21.1545 10.5413C20.9827 9.88155 20.4767 9.36197 19.8342 9.18566C18.6697 8.86523 13.9998 8.86523 13.9998 8.86523C13.9998 8.86523 9.33005 8.86523 8.16552 9.18566C7.52296 9.36197 7.01692 9.88155 6.84518 10.5413C6.5332 11.737 6.5332 14.2319 6.5332 14.2319C6.5332 14.2319 6.5332 16.7268 6.84518 17.9225C7.01692 18.5823 7.52296 19.1019 8.16552 19.2783C9.33005 19.5986 13.9998 19.5986 13.9998 19.5986C13.9998 19.5986 18.6697 19.5986 19.8342 19.2783C20.4767 19.1019 20.9827 18.5823 21.1545 17.9225C21.4666 16.7268 21.4666 14.2319 21.4666 14.2319C21.4666 14.2319 21.4666 11.737 21.1545 10.5413Z" fill="white"/><path d="M12.5996 16.8014V12.1348L16.333 14.4682L12.5996 16.8014Z" fill="#FF0000"/></g><defs><clipPath id="yt"><rect width="28" height="28" fill="white"/></clipPath></defs></svg></div></a>
                      <a href="#" className="social-icon w-inline-block"><div className="social-icon-code w-embed"><svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#ig)"><path d="M0 14C0 6.26801 6.26801 0 14 0C21.732 0 28 6.26801 28 14C28 21.732 21.732 28 14 28C6.26801 28 0 21.732 0 14Z" fill="#C32AA3"/><path d="M13.9989 6.53125C16.0268 6.53126 16.2804 6.5403 17.0768 6.57654C17.8716 6.61295 18.4149 6.73883 18.8908 6.92347C19.3822 7.11398 19.7976 7.3688 20.2128 7.78393C20.6281 8.19894 20.8836 8.61564 21.0749 9.10669C21.2585 9.58147 21.3837 10.1242 21.421 10.9191C21.4568 11.7155 21.4663 11.9701 21.4663 13.9978C21.4663 16.0257 21.4568 16.2801 21.421 17.0765C21.3837 17.8707 21.2584 18.4134 21.0749 18.8881C20.8836 19.379 20.6281 19.7958 20.2128 20.2108C19.7979 20.6262 19.3818 20.8823 18.8908 21.073C18.4159 21.2576 17.8724 21.3836 17.0777 21.42C16.2813 21.4562 16.0275 21.4643 13.9998 21.4643C11.972 21.4643 11.7175 21.4562 10.921 21.42C10.1264 21.3836 9.58363 21.2576 9.10868 21.073C8.61791 20.8823 8.20157 20.6261 7.78674 20.2108C7.37156 19.7958 7.11628 19.3792 6.92541 18.8881C6.74094 18.4134 6.61504 17.8705 6.57848 17.0757C6.54241 16.2795 6.5332 16.0254 6.5332 13.9978C6.5332 11.9701 6.54286 11.7155 6.57848 10.9191C6.61426 10.1245 6.7403 9.58164 6.92541 9.10669C7.11674 8.61585 7.37147 8.1989 7.78674 7.78393C8.2017 7.36885 8.61849 7.11416 9.10947 6.92347C9.58424 6.73882 10.127 6.61294 10.9219 6.57654C11.718 6.54031 11.9726 6.53126 13.9989 6.53125Z" fill="white"/></g><defs><clipPath id="ig"><rect width="28" height="28" fill="white"/></clipPath></defs></svg></div></a>
                      <a href="#" className="social-icon w-inline-block"><div className="social-icon-code w-embed"><svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#tw)"><path d="M28 14C28 6.26801 21.732 0 14 0C6.26801 0 0 6.26801 0 14C0 21.732 6.26801 28 14 28C21.732 28 28 21.732 28 14Z" fill="black"/><path d="M18.2117 7H20.2243L15.8274 12.5596L21 20.125H16.9499L13.7777 15.5367L10.148 20.125H8.13417L12.8371 14.1783L7.875 7H12.0279L14.8953 11.194L18.2117 7ZM17.5053 18.7923H18.6205L11.422 8.2627H10.2253L17.5053 18.7923Z" fill="white"/></g><defs><clipPath id="tw"><rect width="28" height="28" fill="white"/></clipPath></defs></svg></div></a>
                      <a href="#" className="social-icon w-inline-block"><div className="social-icon-code w-embed"><svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#fb)"><path d="M0 14C0 6.26801 6.26801 0 14 0C21.732 0 28 6.26801 28 14C28 21.732 21.732 28 14 28C6.26801 28 0 21.732 0 14Z" fill="#3B5998"/><path d="M15.4603 22.2317V14.615H17.5628L17.8415 11.9902H15.4603L15.4638 10.6765C15.4638 9.99189 15.5289 9.62509 16.5122 9.62509H17.8266V7H15.7237C13.1978 7 12.3089 8.2733 12.3089 10.4146V11.9905H10.7344V14.6152H12.3089V22.2317H15.4603Z" fill="white"/></g><defs><clipPath id="fb"><rect width="28" height="28" fill="white"/></clipPath></defs></svg></div></a>
                      <a href="#" className="social-icon w-inline-block"><div className="social-icon-code w-embed"><svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#wa)"><path d="M0 14C0 6.26801 6.26801 0 14 0C21.732 0 28 6.26801 28 14C28 21.732 21.732 28 14 28C6.26801 28 0 21.732 0 14Z" fill="url(#wag)"/><path fillRule="evenodd" clipRule="evenodd" d="M13.998 5.9375C9.54527 5.9375 5.93556 9.54721 5.93556 14C5.93556 15.1107 6.16047 16.1703 6.56775 17.1346C6.67459 17.3875 6.74661 17.5585 6.79473 17.6899C6.84379 17.8239 6.85068 17.8723 6.85155 17.8848C6.85642 17.9552 6.8386 18.051 6.71699 18.5056L5.95467 21.3546C5.90275 21.5487 5.95827 21.7557 6.10032 21.8977C6.24237 22.0398 6.44939 22.0953 6.64345 22.0434L9.49253 21.2811C9.94705 21.1594 10.0428 21.1417 10.1132 21.1465C10.1257 21.1474 10.1742 21.1543 10.3082 21.2033C10.4396 21.2515 10.6105 21.3235 10.8635 21.4303C11.8278 21.8376 12.8874 22.0625 13.998 22.0625C18.4509 22.0625 22.0605 18.4528 22.0605 14C22.0605 9.54721 18.4509 5.9375 13.998 5.9375Z" fill="white"/></g><defs><linearGradient id="wag" x1="14" y1="0" x2="14" y2="28" gradientUnits="userSpaceOnUse"><stop stopColor="#59D064"/><stop offset="1" stopColor="#2DB640"/></linearGradient><clipPath id="wa"><rect width="28" height="28" fill="white"/></clipPath></defs></svg></div></a>
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
                      <div className="footer-link-holder"><a href="/contact-us" className="footer-link w-inline-block"><div>Contact us</div></a></div>
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
                <div className="footer-copyright-holder"><div>© 2026 Saksham Senior. All rights reserved.</div></div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
