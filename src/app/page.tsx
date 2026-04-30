/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useState, useEffect } from "react";

interface Option { id: number | string; identity: string; }

interface PlanFeature {
  id: number;
  uuid: string;
  identity: string | null;
  description: string | null;
}

interface Plan {
  id: number;
  uuid: string;
  identity: string;
  description: string;
  plan_type: string;
  amount: number;
  currency: string;
  interval: string;
  razorpay_plan_id: string;
  features: PlanFeature[];
}

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
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
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
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [updates, setUpdates] = useState(false);
  const [whatsappMsg, setWhatsappMsg] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [ctaHover, setCtaHover] = useState(false);
  const [learnHover, setLearnHover] = useState(false);
  const [techHover, setTechHover] = useState(false);
  const [resHover, setResHover] = useState(false);

  const fieldErr = (key: string) =>
    fieldErrors[key]?.length ? (
      <p className="mt-1 text-xs text-red-600">{fieldErrors[key][0]}</p>
    ) : null;

  const inpCls = (key: string) =>
    `w-full rounded-lg border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition bg-white ${
      fieldErrors[key]?.length
        ? "border-red-400 focus:border-red-400 focus:ring-red-100"
        : "border-gray-300 focus:border-purple-500 focus:ring-purple-200"
    }`;

  useEffect(() => {
    Promise.all([
      apiFetch("/api/senior/create/meta/"),
      apiFetch("/api/administration/language-list/"),
      apiFetch("/api/administration/platform/"),
      apiFetch("/api/subscription/plan/list/"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ]).then(([meta, lang, platform, planData]: any[]) => {
      setGenderOptions(meta?.data?.meta?.gender ?? []);
      setRelationshipOptions(meta?.data?.meta?.relationship ?? []);
      setLanguages(lang?.data?.results ?? []);
      setPlatforms(platform?.data?.results ?? []);
      const fetchedPlans: Plan[] = planData?.data?.results ?? [];
      setPlans(fetchedPlans);
      if (fetchedPlans.length > 0) setSelectedPlan(fetchedPlans[0]);
    }).catch((e) => setLoadError(`Failed to load options: ${e}`));
  }, []);

  useEffect(() => {
    if (!device) { setModels([]); setDeviceModel(""); return; }
    setDeviceModel("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiFetch("/api/administration/device-model-list/", `platform=${device}`).then((d: any) => setModels(d?.data?.results ?? []));
  }, [device]);

  const loadRazorpayScript = () =>
    new Promise<void>((resolve, reject) => {
      if (document.getElementById("razorpay-script")) { resolve(); return; }
      const s = document.createElement("script");
      s.id = "razorpay-script";
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
      document.body.appendChild(s);
    });

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
    if (!selectedPlan) { setFormError("Please select a plan."); return; }
    setFormError("");
    setFieldErrors({});
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
      plan: selectedPlan.id,
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
      if (!res.ok) {
        if (data?.data && typeof data.data === "object") {
          setFieldErrors(data.data);
        } else {
          setFormError("Something went wrong. Please try again.");
        }
        return;
      }

      const razorpaySubscriptionId: string = data?.data?.razorpay_subscription_id ?? "";

      if (!razorpaySubscriptionId) {
        alert("Registration successful! Your plan is now active.");
        return;
      }

      await loadRazorpayScript();

      const rzpOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "rzp_test_SjGvV9e0WsF8uT",
        subscription_id: razorpaySubscriptionId,
        name: "Saksham Senior",
        description: selectedPlan.identity,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch(`${BASE}/api/subscription/verify-razorpay-subscription/`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const verifyData: any = await verifyRes.json();
            if (verifyRes.ok && verifyData?.status === "success") {
              alert("Payment successful! Your subscription is now active.");
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } catch {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: { name: `${firstName} ${lastName}`, email, contact: `${COUNTRY_CODES[countryCode]}${phone}` },
        theme: { color: "#814398" },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay(rzpOptions);
      rzp.open();
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
        <div data-w-id="5b56ab36-260c-0462-ceea-c6b8266c509e" data-animation="default" data-collapse="medium" data-duration="400" data-easing="ease" data-easing2="ease" role="banner" className="navbar w-nav">
          <div className="padding-global">
            <div className="container-large">
              <div className="padding-section-small is-nav">
                <div className="navbar-component">
                  <a href="/" className="w-inline-block">
                    <img loading="lazy" src="https://cdn.prod.website-files.com/69df9a13ad765128599ea0d4/69df9a13ad765128599ea0da_Saksham%20Senior%20Logo.svg" alt="Saksham Senior Logo" />
                  </a>
                  <nav role="navigation" className="navigation-content-holder w-nav-menu">
                    <div className="navbar-link-holder">
                      <a data-w-id="8243afb1-9867-78e6-d41a-72f9a1832200" href="/" className="nav-links w-inline-block"><div>Home</div><div className="nav-border" style={{width:"0%"}}></div></a>
                      <a data-w-id="cc978fc5-03ab-9988-1cf7-594dab22b9e5" href="/about-us" className="nav-links w-inline-block"><div>About</div><div className="nav-border" style={{width:"0%"}}></div></a>
                      <a data-w-id="463413de-4fbd-327b-d381-9a82274f5307" href="/plan" className="nav-links w-inline-block"><div>Plans</div><div className="nav-border" style={{width:"0%"}}></div></a>
                      <a data-w-id="ed52862c-f02a-39c5-0ad9-6cf59bb4e4d0" href="/service" className="nav-links w-inline-block"><div>Services</div><div className="nav-border" style={{width:"0%"}}></div></a>
                      <div className="nav-links w-inline-block" style={{position:"relative", cursor:"pointer"}} onMouseEnter={() => setLearnHover(true)} onMouseLeave={() => setLearnHover(false)}>
                        <div style={{display:"flex", alignItems:"center", gap:"6px"}}>
                          <div>Learn</div>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                        <div className="nav-border" style={{width:"0%"}}></div>
                        {learnHover && (
                          <div style={{position:"absolute", top:"100%", left:0, zIndex:9999, minWidth:"260px", borderRadius:"12px", overflow:"hidden", boxShadow:"0 8px 32px rgba(0,0,0,0.15)"}}>
                            <a href="/tutorials" onMouseEnter={() => setTechHover(true)} onMouseLeave={() => setTechHover(false)}
                              style={{display:"flex", alignItems:"center", gap:"12px", padding:"18px 24px", backgroundColor: techHover ? "#814398" : "#ffffff", textDecoration:"none", transition:"background-color 0.2s ease"}}>
                              <div style={{color: techHover ? "#ffffff" : "#814398", width:"32px", height:"32px", flexShrink:0, transition:"color 0.2s ease"}}>
                                <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M4 2.25C2.48122 2.25 1.25 3.48122 1.25 5V17C1.25 18.5188 2.48122 19.75 4 19.75H14.9844C13.4859 18.8947 13.6983 16.4072 15.621 16.0142C16.3225 15.8708 16.8708 15.3225 17.0142 14.621C17.456 12.4596 20.5441 12.4598 20.9858 14.621C21.1292 15.3225 21.6775 15.8708 22.379 16.0142C22.5107 16.0411 22.6344 16.0778 22.75 16.1232V5C22.75 3.48122 21.5188 2.25 20 2.25H4ZM9 7.78719V14.2128C9 14.6476 9.35244 15 9.78719 15C9.92656 15 10.0634 14.963 10.1838 14.8928L15.5681 11.7519C15.8355 11.5959 16 11.3096 16 11C16 10.6904 15.8356 10.4041 15.5681 10.2481L10.1838 7.10723C10.0634 7.037 9.92656 7 9.78719 7C9.35244 7 9 7.35243 9 7.78719ZM19.7611 14.8713C19.5918 14.0429 18.4082 14.0429 18.2389 14.8713C17.9952 16.0635 17.0635 16.9952 15.8713 17.2389C15.0429 17.4082 15.0429 18.5918 15.8713 18.7611C17.0635 19.0048 17.9952 19.9365 18.2389 21.1287C18.4082 21.9571 19.5918 21.9571 19.7611 21.1287C20.0048 19.9365 20.9365 19.0048 22.1287 18.7611C22.9571 18.5918 22.9571 17.4082 22.1287 17.2389C20.9365 16.9952 20.0048 16.0635 19.7611 14.8713Z" fill="currentcolor"></path></svg>
                              </div>
                              <span style={{color: techHover ? "#ffffff" : "rgb(30,30,30)", fontWeight:600, fontSize:"16px", transition:"color 0.2s ease"}}>Tech Tutorials</span>
                            </a>
                            <a href="/blogs" onMouseEnter={() => setResHover(true)} onMouseLeave={() => setResHover(false)}
                              style={{display:"flex", alignItems:"center", gap:"12px", padding:"18px 24px", backgroundColor: resHover ? "#814398" : "#ffffff", textDecoration:"none", transition:"background-color 0.2s ease"}}>
                              <div style={{color: resHover ? "#ffffff" : "#814398", width:"32px", height:"32px", flexShrink:0, transition:"color 0.2s ease"}}>
                                <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M16.989 1.40314C15.8497 1.24997 14.3941 1.24998 12.5564 1.25H11.4436C9.60587 1.24998 8.15025 1.24997 7.01105 1.40313C5.83863 1.56076 4.88969 1.89287 4.14133 2.64123C3.39297 3.38958 3.06085 4.33852 2.90321 5.51094C2.75004 6.65014 2.75004 8.10576 2.75004 9.94351L2.75 14.0563C2.74997 15.894 2.74995 17.3498 2.9031 18.489C3.06072 19.6614 3.39283 20.6104 4.1412 21.3587C4.88956 22.1071 5.83851 22.4392 7.01094 22.5969C8.15016 22.75 9.60579 22.75 11.4435 22.75H12.5563C14.394 22.75 15.8497 22.75 16.989 22.5969C18.1614 22.4392 19.1103 22.1071 19.8587 21.3588C20.6071 20.6104 20.9392 19.6614 21.0968 18.489C21.25 17.3498 21.2499 15.8942 21.2499 14.0565V9.94359C21.2499 8.10585 21.25 6.65018 21.0968 5.51098C20.9392 4.33856 20.6071 3.38961 19.8587 2.64124C19.1103 1.89288 18.1614 1.56076 16.989 1.40314ZM8 6C7.44772 6 7 6.44772 7 7C7 7.55229 7.44772 8 8 8H16C16.5523 8 17 7.55229 17 7C17 6.44772 16.5523 6 16 6H8ZM8 11C7.44772 11 7 11.4477 7 12C7 12.5523 7.44772 13 8 13H16C16.5523 13 17 12.5523 17 12C17 11.4477 16.5523 11 16 11H8ZM8 16C7.44772 16 7 16.4477 7 17C7 17.5523 7.44772 18 8 18H12C12.5523 18 13 17.5523 13 17C13 16.4477 12.5523 16 12 16H8Z" fill="currentcolor"></path></svg>
                              </div>
                              <span style={{color: resHover ? "#ffffff" : "rgb(30,30,30)", fontWeight:500, fontSize:"16px", transition:"color 0.2s ease"}}>Resources</span>
                            </a>
                          </div>
                        )}
                      </div>
                      <a href="/community" className="nav-links w-inline-block"><div>Community</div><div className="nav-border" style={{width:"0%"}}></div></a>
                    </div>
                    <div className="navbar-rightholder">
                      <div className="navbar-cta-wrap" onMouseEnter={() => setCtaHover(true)} onMouseLeave={() => setCtaHover(false)} style={{cursor:"pointer",position:"relative"}}>
                        <a data-w-id="5b56ab36-260c-0462-ceea-c6b8266c50bf" href="/contact-us" className="navbar-btn w-inline-block"></a>
                        <div className="hover-state-wrap" style={{width: ctaHover ? "100%" : "0%", transition:"width 0.3s ease"}}></div>
                        <a href="/contact-us" className="navbar-cta-text" style={{color: ctaHover ? "#ffffff" : "#814398", transition:"color 0.3s ease", position:"relative", zIndex:1, textDecoration:"none"}}>Contact Us</a>
                      </div>
                    </div>
                  </nav>
                  <div className="menu-btn w-nav-button" role="button" tabIndex={0} aria-label="menu" aria-controls="w-nav-overlay-0" aria-haspopup="menu" aria-expanded={menuOpen ? "true" : "false"} onClick={() => setMenuOpen(v => !v)}>
                    <div className="menu-icon1">
                      <div className="menu-icon1_line-top-4"></div>
                      <div className="menu-icon1_line-middle-3"><div className="menu-icon_line-middle-inner"></div></div>
                      <div className="menu-icon1_line-bottom-3"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-nav-overlay" data-wf-ignore="" id="w-nav-overlay-0" style={menuOpen ? {display:"block", height:"auto"} : {display:"none"}}>
            <nav role="navigation" className="navigation-content-holder w-nav-menu" style={{display:"flex", flexDirection:"column", padding:"16px 24px", gap:"8px", background:"#fff"}}>
              <a href="/" className="nav-links w-inline-block" style={{padding:"12px 0", borderBottom:"1px solid #f0f0f0", textDecoration:"none", color:"inherit"}}><div>Home</div></a>
              <a href="/about-us" className="nav-links w-inline-block" style={{padding:"12px 0", borderBottom:"1px solid #f0f0f0", textDecoration:"none", color:"inherit"}}><div>About</div></a>
              <a href="/plan" className="nav-links w-inline-block" style={{padding:"12px 0", borderBottom:"1px solid #f0f0f0", textDecoration:"none", color:"inherit"}}><div>Plans</div></a>
              <a href="/service" className="nav-links w-inline-block" style={{padding:"12px 0", borderBottom:"1px solid #f0f0f0", textDecoration:"none", color:"inherit"}}><div>Services</div></a>
              <div style={{padding:"12px 0", borderBottom:"1px solid #f0f0f0", cursor:"pointer"}} onClick={() => setLearnHover(v => !v)}>
                <div style={{display:"flex", alignItems:"center", gap:"6px"}}>
                  <span>Learn</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                {learnHover && (
                  <div style={{paddingLeft:"16px", marginTop:"8px", display:"flex", flexDirection:"column", gap:"4px"}}>
                    <a href="/tutorials" style={{display:"flex", alignItems:"center", gap:"10px", padding:"10px 0", textDecoration:"none", color:"rgb(30,30,30)"}}>
                      <span style={{color:"#814398", width:"20px", height:"20px", flexShrink:0}}>
                        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M4 2.25C2.48122 2.25 1.25 3.48122 1.25 5V17C1.25 18.5188 2.48122 19.75 4 19.75H14.9844C13.4859 18.8947 13.6983 16.4072 15.621 16.0142C16.3225 15.8708 16.8708 15.3225 17.0142 14.621C17.456 12.4596 20.5441 12.4598 20.9858 14.621C21.1292 15.3225 21.6775 15.8708 22.379 16.0142C22.5107 16.0411 22.6344 16.0778 22.75 16.1232V5C22.75 3.48122 21.5188 2.25 20 2.25H4ZM9 7.78719V14.2128C9 14.6476 9.35244 15 9.78719 15C9.92656 15 10.0634 14.963 10.1838 14.8928L15.5681 11.7519C15.8355 11.5959 16 11.3096 16 11C16 10.6904 15.8356 10.4041 15.5681 10.2481L10.1838 7.10723C10.0634 7.037 9.92656 7 9.78719 7C9.35244 7 9 7.35243 9 7.78719Z" fill="currentcolor"/></svg>
                      </span>
                      <span style={{fontWeight:500}}>Tech Tutorials</span>
                    </a>
                    <a href="/blogs" style={{display:"flex", alignItems:"center", gap:"10px", padding:"10px 0", textDecoration:"none", color:"rgb(30,30,30)"}}>
                      <span style={{color:"#814398", width:"20px", height:"20px", flexShrink:0}}>
                        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M16.989 1.40314C15.8497 1.24997 14.3941 1.24998 12.5564 1.25H11.4436C9.60587 1.24998 8.15025 1.24997 7.01105 1.40313C5.83863 1.56076 4.88969 1.89287 4.14133 2.64123C3.39297 3.38958 3.06085 4.33852 2.90321 5.51094C2.75004 6.65014 2.75004 8.10576 2.75004 9.94351L2.75 14.0563C2.74997 15.894 2.74995 17.3498 2.9031 18.489C3.06072 19.6614 3.39283 20.6104 4.1412 21.3587C4.88956 22.1071 5.83851 22.4392 7.01094 22.5969C8.15016 22.75 9.60579 22.75 11.4435 22.75H12.5563C14.394 22.75 15.8497 22.75 16.989 22.5969C18.1614 22.4392 19.1103 22.1071 19.8587 21.3588C20.6071 20.6104 20.9392 19.6614 21.0968 18.489C21.25 17.3498 21.2499 15.8942 21.2499 14.0565V9.94359C21.2499 8.10585 21.25 6.65018 21.0968 5.51098C20.9392 4.33856 20.6071 3.38961 19.8587 2.64124C19.1103 1.89288 18.1614 1.56076 16.989 1.40314ZM8 6C7.44772 6 7 6.44772 7 7C7 7.55229 7.44772 8 8 8H16C16.5523 8 17 7.55229 17 7C17 6.44772 16.5523 6 16 6H8ZM8 11C7.44772 11 7 11.4477 7 12C7 12.5523 7.44772 13 8 13H16C16.5523 13 17 12.5523 17 12C17 11.4477 16.5523 11 16 11H8ZM8 16C7.44772 16 7 16.4477 7 17C7 17.5523 7.44772 18 8 18H12C12.5523 18 13 17.5523 13 17C13 16.4477 12.5523 16 12 16H8Z" fill="currentcolor"/></svg>
                      </span>
                      <span style={{fontWeight:500}}>Resources</span>
                    </a>
                  </div>
                )}
              </div>
              <a href="/community" className="nav-links w-inline-block" style={{padding:"12px 0", borderBottom:"1px solid #f0f0f0", textDecoration:"none", color:"inherit"}}><div>Community</div></a>
              <a href="/contact-us" style={{display:"inline-block", marginTop:"12px", padding:"12px 24px", borderRadius:"999px", border:"2px solid #814398", color:"#814398", textDecoration:"none", fontWeight:600, textAlign:"center"}}>Contact Us</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
        <a href="/plan" className="mb-3 flex items-center gap-2 text-sm text-gray-600 hover:text-purple-700">← Back to plans</a>
        <h1 className="mb-5 text-xl font-bold leading-tight text-gray-900 sm:text-2xl lg:text-3xl">Complete Your Subscription</h1>

        {/* Plan */}
        {selectedPlan && (
          <div className="mb-5 rounded-2xl border border-purple-100 p-4 sm:p-6" style={{backgroundColor:"#FCEBFF99"}}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-bold text-gray-900">Selected Plan</div>
                <div className="mt-0.5 text-xs text-gray-700">{selectedPlan.identity}</div>
                {selectedPlan.description && <div className="mt-0.5 text-xs text-gray-500">{selectedPlan.description}</div>}
              </div>
              <div className="shrink-0 text-right">
                <div className="text-base font-bold text-purple-700">
                  {selectedPlan.amount === 0 ? "Free" : `₹${selectedPlan.amount}/${selectedPlan.interval === "monthly" ? "month" : "year"}`}
                </div>
                <div className="text-xs text-gray-600 capitalize">{selectedPlan.interval}</div>
              </div>
            </div>
          </div>
        )}
        {plans.length === 0 && !loadError && (
          <div className="mb-5 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-6 text-center text-sm text-gray-400">Loading plan...</div>
        )}

        {loadError && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>}

        <form onSubmit={handleSubmit}>
          {/* Onboarding type */}
          <div className="mb-5 grid grid-cols-2 gap-3">
            {([
              { type: "self" as const, icon: "👤", label: "I'm Senior", desc: "I am subscribing for myself to learn and stay safe online." },
              { type: "relation" as const, icon: "👥", label: "For Someone else", desc: "I am subscribing for a parent, relative, or friend." },
            ]).map(({ type, icon, label, desc }) => (
              <button key={type} type="button" onClick={() => setOnboardingType(type)}
                className={`rounded-2xl border p-3 sm:p-5 text-center transition ${onboardingType === type ? "border-purple-500 bg-purple-50" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                <div className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg text-lg ${onboardingType === type ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600"}`}>{icon}</div>
                <div className={`text-sm font-bold ${onboardingType === type ? "text-purple-700" : "text-gray-900"}`}>{label}</div>
                <p className="mt-1 text-xs text-gray-500 leading-tight">{desc}</p>
              </button>
            ))}
          </div>

          {/* ── RELATION: Relative blocks first ── */}
          {onboardingType === "relation" && (
            <div className="mb-6">
              {relatives.map((rel, i) => (
                <div key={i} className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
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
                        placeholder="Enter the number"
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
                    className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium hover:opacity-90"
                    style={{backgroundColor:"#814398", color:"#ffffff"}}>
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
          <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
            {onboardingType === "relation" && (
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">02</span>
                <span className="text-sm font-semibold text-purple-700">Senior Information</span>
              </div>
            )}

            {/* Name */}
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div><label className={lbl}>First Name</label><input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" className={inpCls("first_name")} required />{fieldErr("first_name")}</div>
              <div><label className={lbl}>Last Name</label><input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" className={inpCls("last_name")} required />{fieldErr("last_name")}</div>
              <div><label className={lbl}>Initial</label><input type="text" value={initial} onChange={(e) => setInitial(e.target.value)} placeholder="Initial" maxLength={3} className={inpCls("initial")} />{fieldErr("initial")}</div>
            </div>

            {/* DOB */}
            <div className="mb-4">
              <label className={lbl}>Date Of Birth</label>
              <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={inpCls("dob")} required />
              {fieldErr("dob")}
            </div>

            {/* Gender */}
            <div className="mb-4">
              <label className={lbl}>Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className={inpCls("gender")} required>
                <option value="">Select</option>
                {genderOptions.map((g) => <option key={g.id} value={g.id}>{g.identity}</option>)}
              </select>
              {fieldErr("gender")}
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className={lbl}>Email (Optional)</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className={inpCls("email")} />
              {fieldErr("email")}
            </div>

            {/* Phone */}
            <div className="mb-4">
              <label className={lbl}>Phone number</label>
              <div className={`flex rounded-lg border ${fieldErrors["phone_number"]?.length ? "border-red-400" : "border-gray-300"}`}>
                <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="rounded-l-lg border-0 bg-white px-3 py-3 text-sm focus:outline-none">
                  {Object.keys(COUNTRY_CODES).map((cc) => <option key={cc} value={cc}>{cc} {COUNTRY_CODES[cc]}</option>)}
                </select>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter the number"
                  className="w-full rounded-r-lg border-0 bg-white px-4 py-3 text-sm placeholder-gray-400 focus:outline-none" required />
              </div>
              {fieldErr("phone_number")}
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
              {fieldErr("language")}
            </div>

            {/* Device */}
            <div className="mb-4">
              <label className={lbl}>Device</label>
              <select value={device} onChange={(e) => setDevice(e.target.value)} className={inpCls("device")} required>
                <option value="">Select</option>
                {platforms.map((p) => <option key={p.id} value={p.id}>{p.identity}</option>)}
              </select>
              {fieldErr("device")}
            </div>

            {/* Model */}
            <div className="mb-4">
              <label className={lbl}>Model</label>
              <select value={deviceModel} onChange={(e) => setDeviceModel(e.target.value)} className={inpCls("device_model")} disabled={!device} required>
                <option value="">Select</option>
                {models.map((m) => <option key={m.id} value={m.id}>{m.identity}</option>)}
              </select>
              {fieldErr("device_model")}
            </div>

            {/* Zoom */}
            <div className="mb-4">
              <label className={lbl}>Do you know how to join a Zoom call?</label>
              <select value={zoomCall} onChange={(e) => setZoomCall(e.target.value)} className={inpCls("zoom_call")} required>
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
              {fieldErr("zoom_call")}
            </div>

            {/* WhatsApp */}
            <div>
              <label className={lbl}>Do you know how to take calls on WhatsApp?</label>
              <select value={whatsappCall} onChange={(e) => setWhatsappCall(e.target.value)} className={inpCls("whatsapp_call")} required>
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
              {fieldErr("whatsapp_call")}
            </div>
          </div>

          {/* Checkboxes */}
          <div className="mb-6 space-y-4" style={{display:"flex", flexDirection:"column", alignItems:"flex-start"}}>
            <label style={{display:"flex", alignItems:"center", gap:"12px", width:"fit-content"}} className="text-sm font-bold text-gray-800"><input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="h-5 w-5 shrink-0 rounded border-gray-300 accent-purple-600" />Agree to terms and conditions</label>
            <label style={{display:"flex", alignItems:"center", gap:"12px", width:"fit-content"}} className="text-sm text-gray-700"><input type="checkbox" checked={updates} onChange={(e) => setUpdates(e.target.checked)} className="h-5 w-5 shrink-0 rounded border-gray-300 accent-purple-600" />Allow us to send periodic emails and updates</label>
            <label style={{display:"flex", alignItems:"center", gap:"12px", width:"fit-content"}} className="text-sm text-gray-700"><input type="checkbox" checked={whatsappMsg} onChange={(e) => setWhatsappMsg(e.target.checked)} className="h-5 w-5 shrink-0 rounded border-gray-300 accent-purple-600" />Agree to get WhatsApp messages from us</label>
          </div>

          {formError && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>}

          <button type="submit" disabled={submitting} style={{color:"#ffffff"}}
            className="w-full rounded-full bg-purple-600 px-6 py-4 text-base font-semibold text-white shadow-md transition hover:bg-purple-700 active:scale-[0.99] disabled:opacity-60">
            {submitting ? "Submitting..." : selectedPlan?.amount === 0 ? "Activate Free Plan" : "Proceed to Payment"}
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
                        <a href="/community" className="footer-link w-inline-block"><div>Community</div></a>
                      </div>
                    </div>
                    <div>
                      <div className="footer-link-header"><div>Learn</div></div>
                      <div className="footer-link-holder">
                        <a href="/tutorials" className="footer-link w-inline-block"><div>Tech Tutorials</div></a>
                        <a href="/blogs" className="footer-link w-inline-block"><div>Resources</div></a>
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
