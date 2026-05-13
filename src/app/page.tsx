/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

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
const PHONE_MAX_LEN: Record<string, number> = { IN: 10, US: 10, UK: 11 };
const numericOnly = (val: string) => val.replace(/\D/g, "");
const BASE = "https://api-staging.sakshamsenior.com";

function apiFetch(path: string, query?: string) {
  const q = query ? `?${query}` : "";
  return fetch(`${BASE}${path}${q}`).then((r) => r.json());
}

const emptyRelative = (): RelativeEntry => ({ first_name: "", last_name: "", email: "", phone: "", countryCode: "IN", relationship: "" });

const inp = "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition";
const lbl = "mb-1.5 block text-sm font-medium text-gray-800";

function HomeInner() {
  const searchParams = useSearchParams();
  const planIdParam = searchParams.get("plan");

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
  const [emergencyHover, setEmergencyHover] = useState(false);
  const [supportHover, setSupportHover] = useState(false);

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
      if (fetchedPlans.length > 0) {
        const matched = planIdParam
          ? fetchedPlans.find((p) => p.razorpay_plan_id === planIdParam) ?? fetchedPlans[0]
          : fetchedPlans[0];
        setSelectedPlan(matched);
      }
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
    <div className="min-h-screen bg-white font-sans" data-comp="home">
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
                          <div>Resources</div>
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
                              <span style={{color: resHover ? "#ffffff" : "rgb(30,30,30)", fontWeight:500, fontSize:"16px", transition:"color 0.2s ease"}}>Blogs</span>
                            </a>
                            <a href="/emergency-contact"
                              onMouseEnter={() => setEmergencyHover(true)} onMouseLeave={() => setEmergencyHover(false)}
                              style={{display:"flex", alignItems:"center", gap:"12px", padding:"18px 24px", backgroundColor: emergencyHover ? "#814398" : "#ffffff", textDecoration:"none", transition:"background-color 0.2s ease"}}>
                              <div style={{color: emergencyHover ? "#ffffff" : "#814398", width:"32px", height:"32px", flexShrink:0, transition:"color 0.2s ease"}}>
                                <svg width="100%" height="100%" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M12.0564 1.6357e-07C13.8942 -9.83643e-06 15.3498 -2.98917e-05 16.489 0.15314C17.6614 0.31076 18.6104 0.64288 19.3588 1.39124C20.1071 2.13961 20.4392 3.08856 20.5969 4.26098C20.75 5.40018 20.75 6.85581 20.75 8.69354V12.8064C20.75 14.6441 20.75 16.0998 20.5969 17.239C20.4392 18.4114 20.1071 19.3604 19.3588 20.1088C18.6104 20.8571 17.6614 21.1892 16.489 21.3469C15.3498 21.5 13.8942 21.5 12.0565 21.5H10.4436C8.6059 21.5 7.15018 21.5 6.01098 21.3469C4.83856 21.1892 3.88961 20.8571 3.14124 20.1088C2.50477 19.4723 2.16938 18.6907 1.98635 17.75H1C0.44772 17.75 0 17.3023 0 16.75C0 16.1977 0.44772 15.75 1 15.75H1.78442C1.74998 14.9003 1.74999 13.924 1.75 12.8064V11.75H1C0.44772 11.75 0 11.3023 0 10.75C0 10.1977 0.44772 9.75 1 9.75H1.75V8.69358C1.74999 7.57601 1.74998 6.59973 1.78442 5.75H1C0.44772 5.75 0 5.30229 0 4.75C0 4.19772 0.44772 3.75 1 3.75H1.98635C2.16938 2.80927 2.50477 2.02771 3.14124 1.39124C3.88961 0.64288 4.83856 0.31076 6.01098 0.15314C7.15019 -2.98917e-05 8.6058 -9.83643e-06 10.4436 1.6357e-07H12.0564ZM9.0746 5.52512C9.4666 5.60614 9.7617 5.86643 9.9357 6.17865L10.3451 6.91322C10.4866 7.16694 10.6213 7.40852 10.7118 7.62464C10.8132 7.86668 10.8889 8.14247 10.8557 8.46083C10.8225 8.7792 10.6915 9.0334 10.5424 9.2493C10.4092 9.4421 10.2276 9.6507 10.0368 9.8698L9.2261 10.801C9.9253 11.8628 10.885 12.8229 11.9478 13.5227L12.879 12.712C13.098 12.5213 13.3067 12.3396 13.4995 12.2064C13.7154 12.0573 13.9696 11.9263 14.288 11.8931C14.6063 11.8599 14.8821 11.9356 15.1242 12.037C15.3403 12.1275 15.5818 12.2622 15.8356 12.4037L16.5702 12.8131C16.8824 12.9872 17.1427 13.2822 17.2237 13.6742C17.3059 14.0721 17.1796 14.4547 16.9407 14.7478C16.2355 15.613 15.0814 16.1921 13.8432 15.9423C13.1505 15.8026 12.4669 15.5686 11.6514 15.1009C10.0284 14.1701 8.5776 12.7185 7.64791 11.0974C7.1802 10.2819 6.94625 9.5983 6.80651 8.9056C6.55674 7.66735 7.13577 6.5133 8.00097 5.80813C8.29413 5.56918 8.6767 5.44287 9.0746 5.52512Z" fill="currentcolor"/></svg>
                              </div>
                              <span style={{color: emergencyHover ? "#ffffff" : "rgb(30,30,30)", fontWeight:500, fontSize:"16px", transition:"color 0.2s ease"}}>Emergency Contact</span>
                            </a>
                            <a href="/customer-support"
                              onMouseEnter={() => setSupportHover(true)} onMouseLeave={() => setSupportHover(false)}
                              style={{display:"flex", alignItems:"center", gap:"12px", padding:"18px 24px", backgroundColor: supportHover ? "#814398" : "#ffffff", textDecoration:"none", transition:"background-color 0.2s ease"}}>
                              <div style={{color: supportHover ? "#ffffff" : "#814398", width:"32px", height:"32px", flexShrink:0, transition:"color 0.2s ease"}}>
                                <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M12.0002 4C8.74885 4 6.31489 6.09486 6.02849 8.52063C6.15063 8.57303 6.26834 8.62684 6.37501 8.67566C6.73116 8.83478 7.40272 9.13482 7.6585 9.89191C7.75152 10.1672 7.75079 10.4616 7.75011 10.7355V15.2645C7.75079 15.5384 7.75152 15.8327 7.6585 16.1081C7.40272 16.8652 6.73116 17.1652 6.37501 17.3243C6.0121 17.4904 5.52133 17.7144 5.16362 17.7434C4.76625 17.7755 4.36396 17.6906 4.01491 17.4947C3.69791 17.3168 3.45992 17.0265 3.21887 16.7323C3.13171 16.6265 2.96671 16.4318 2.85082 16.2975C2.63896 16.052 2.39839 15.7733 2.20005 15.5137C1.8724 15.0849 1.54407 14.5711 1.38098 13.9741C1.20634 13.3348 1.20634 12.6652 1.38098 12.0259C1.49932 11.5927 1.71345 11.2104 1.99611 10.8091C2.26984 10.4205 2.73604 9.85098 3.19205 9.29711C3.26557 9.20387 3.36665 9.07569 3.44139 8.99009C3.57673 8.83505 3.76401 8.64608 4.01491 8.50526L4.0196 8.50263C4.31352 4.74952 7.91074 2 12.0002 2C16.0897 2 19.6869 4.74952 19.9809 8.50264L19.9855 8.50526C20.2364 8.64608 20.4237 8.83505 20.5591 8.99009C20.6338 9.07569 20.7349 9.20386 20.8084 9.2971C21.2644 9.85097 21.7306 10.4205 22.0044 10.8091C22.287 11.2104 22.5011 11.5927 22.6195 12.0259C22.7941 12.6652 22.7941 13.3348 22.6195 13.9741C22.4564 14.5711 22.1281 15.0849 21.8004 15.5137C21.6021 15.7733 21.3616 16.052 21.1497 16.2975C21.0339 16.4318 20.8688 16.6265 20.7816 16.7323C20.5443 17.0218 20.3099 17.3078 20.0002 17.4864V17.8C20.0002 20.3163 17.5419 22 15.0002 22H13.0002C12.4479 22 12.0002 21.5523 12.0002 21C12.0002 20.4477 12.4479 20 13.0002 20H15.0002C16.8768 20 18.0002 18.8183 18.0002 17.8V17.4914C17.868 17.4353 17.7403 17.3769 17.6255 17.3243C17.2693 17.1652 16.5977 16.8652 16.342 16.1081C16.2489 15.8327 16.2497 15.5384 16.2503 15.2645V10.7355C16.2497 10.4616 16.2489 10.1672 16.342 9.89191C16.5977 9.13482 17.2693 8.83478 17.6255 8.67566C17.7321 8.62684 17.8498 8.57303 17.972 8.52063C17.6856 6.09486 15.2516 4 12.0002 4Z" fill="currentcolor"/></svg>
                              </div>
                              <span style={{color: supportHover ? "#ffffff" : "rgb(30,30,30)", fontWeight:500, fontSize:"16px", transition:"color 0.2s ease"}}>Customer Support</span>
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
                    {menuOpen ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    ) : (
                      <div className="menu-icon1">
                        <div className="menu-icon1_line-top-4"></div>
                        <div className="menu-icon1_line-middle-3"><div className="menu-icon_line-middle-inner"></div></div>
                        <div className="menu-icon1_line-bottom-3"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-nav-overlay" data-wf-ignore="" id="w-nav-overlay-0" style={menuOpen ? {display:"block", position:"absolute", top:"100%", left:0, right:0, zIndex:9998, background:"#fff", overflowY:"auto", paddingBottom:"16px"} : {display:"none"}}>
            <nav role="navigation" style={{display:"flex", flexDirection:"column"}}>
              {/* Nav links */}
              <div className="padding-global">
                <div className="container-large">
              <div style={{display:"flex", flexDirection:"column"}}>
                {[
                  {href:"/", label:"Home"},
                  {href:"/about-us", label:"About"},
                  {href:"/plan", label:"Plans"},
                  {href:"/service", label:"Services"},
                ].map(({href, label}) => (
                  <a key={href} href={href} style={{display:"block", textAlign:"left", padding:"10px 0", textDecoration:"none", color:"#1A1A1A", fontSize:"16px", fontWeight:500}}>{label}</a>
                ))}
                {/* Resources */}
                <div style={{cursor:"pointer"}} onClick={() => setLearnHover(v => !v)}>
                  <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0"}}>
                    <span style={{fontSize:"16px", fontWeight:500, color:"#1A1A1A"}}>Resources</span>
                    <svg width="14" height="14" viewBox="0 0 12 12" fill="none" style={{transform: learnHover ? "rotate(180deg)" : "rotate(0deg)", transition:"transform 0.2s", flexShrink:0}}><path d="M2 4L6 8L10 4" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  {learnHover && (
                    <div style={{display:"flex", flexDirection:"column", paddingLeft:"8px", paddingBottom:"4px"}}>
                      {[
                        {href:"/tutorials", label:"Tech Tutorials", svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M4 2.25C2.48122 2.25 1.25 3.48122 1.25 5V17C1.25 18.5188 2.48122 19.75 4 19.75H14.9844C13.4859 18.8947 13.6983 16.4072 15.621 16.0142C16.3225 15.8708 16.8708 15.3225 17.0142 14.621C17.456 12.4596 20.5441 12.4598 20.9858 14.621C21.1292 15.3225 21.6775 15.8708 22.379 16.0142C22.5107 16.0411 22.6344 16.0778 22.75 16.1232V5C22.75 3.48122 21.5188 2.25 20 2.25H4ZM9 7.78719V14.2128C9 14.6476 9.35244 15 9.78719 15C9.92656 15 10.0634 14.963 10.1838 14.8928L15.5681 11.7519C15.8355 11.5959 16 11.3096 16 11C16 10.6904 15.8356 10.4041 15.5681 10.2481L10.1838 7.10723C10.0634 7.037 9.92656 7 9.35244 7 9 7.35243 9 7.78719ZM19.7611 14.8713C19.5918 14.0429 18.4082 14.0429 18.2389 14.8713C17.9952 16.0635 17.0635 16.9952 15.8713 17.2389C15.0429 17.4082 15.0429 18.5918 15.8713 18.7611C17.0635 19.0048 17.9952 19.9365 18.2389 21.1287C18.4082 21.9571 19.5918 21.9571 19.7611 21.1287C20.0048 19.9365 20.9365 19.0048 22.1287 18.7611C22.9571 18.5918 22.9571 17.4082 22.1287 17.2389C20.9365 16.9952 20.0048 16.0635 19.7611 14.8713Z" fill="#814398"/></svg>},
                        {href:"/blogs", label:"Blogs", svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M16.989 1.40314C15.8497 1.24997 14.3941 1.24998 12.5564 1.25H11.4436C9.60587 1.24998 8.15025 1.24997 7.01105 1.40313C5.83863 1.56076 4.88969 1.89287 4.14133 2.64123C3.39297 3.38958 3.06085 4.33852 2.90321 5.51094C2.75004 6.65014 2.75004 8.10576 2.75004 9.94351L2.75 14.0563C2.74997 15.894 2.74995 17.3498 2.9031 18.489C3.06072 19.6614 3.39283 20.6104 4.1412 21.3587C4.88956 22.1071 5.83851 22.4392 7.01094 22.5969C8.15016 22.75 9.60579 22.75 11.4435 22.75H12.5563C14.394 22.75 15.8497 22.75 16.989 22.5969C18.1614 22.4392 19.1103 22.1071 19.8587 21.3588C20.6071 20.6104 20.9392 19.6614 21.0968 18.489C21.25 17.3498 21.2499 15.8942 21.2499 14.0565V9.94359C21.2499 8.10585 21.25 6.65018 21.0968 5.51098C20.9392 4.33856 20.6071 3.38961 19.8587 2.64124C19.1103 1.89288 18.1614 1.56076 16.989 1.40314ZM8 6C7.44772 6 7 6.44772 7 7C7 7.55229 7.44772 8 8 8H16C16.5523 8 17 7.55229 17 7C17 6.44772 16.5523 6 16 6H8ZM8 11C7.44772 11 7 11.4477 7 12C7 12.5523 7.44772 13 8 13H16C16.5523 13 17 12.5523 17 12C17 11.4477 16.5523 11 16 11H8ZM8 16C7.44772 16 7 16.4477 7 17C7 17.5523 7.44772 18 8 18H12C12.5523 18 13 17.5523 13 17C13 16.4477 12.5523 16 12 16H8Z" fill="#814398"/></svg>},
                        {href:"/emergency-contact", label:"Emergency Contact", svg:<svg width="20" height="20" viewBox="0 0 21 22" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M12.0564 1.6357e-07C13.8942 -9.83643e-06 15.3498 -2.98917e-05 16.489 0.15314C17.6614 0.31076 18.6104 0.64288 19.3588 1.39124C20.1071 2.13961 20.4392 3.08856 20.5969 4.26098C20.75 5.40018 20.75 6.85581 20.75 8.69354V12.8064C20.75 14.6441 20.75 16.0998 20.5969 17.239C20.4392 18.4114 20.1071 19.3604 19.3588 20.1088C18.6104 20.8571 17.6614 21.1892 16.489 21.3469C15.3498 21.5 13.8942 21.5 12.0565 21.5H10.4436C8.6059 21.5 7.15018 21.5 6.01098 21.3469C4.83856 21.1892 3.88961 20.8571 3.14124 20.1088C2.50477 19.4723 2.16938 18.6907 1.98635 17.75H1C0.44772 17.75 0 17.3023 0 16.75C0 16.1977 0.44772 15.75 1 15.75H1.78442C1.74998 14.9003 1.74999 13.924 1.75 12.8064V11.75H1C0.44772 11.75 0 11.3023 0 10.75C0 10.1977 0.44772 9.75 1 9.75H1.75V8.69358C1.74999 7.57601 1.74998 6.59973 1.78442 5.75H1C0.44772 5.75 0 5.30229 0 4.75C0 4.19772 0.44772 3.75 1 3.75H1.98635C2.16938 2.80927 2.50477 2.02771 3.14124 1.39124C3.88961 0.64288 4.83856 0.31076 6.01098 0.15314C7.15019 -2.98917e-05 8.6058 -9.83643e-06 10.4436 1.6357e-07H12.0564ZM9.0746 5.52512C9.4666 5.60614 9.7617 5.86643 9.9357 6.17865L10.3451 6.91322C10.4866 7.16694 10.6213 7.40852 10.7118 7.62464C10.8132 7.86668 10.8889 8.14247 10.8557 8.46083C10.8225 8.7792 10.6915 9.0334 10.5424 9.2493C10.4092 9.4421 10.2276 9.6507 10.0368 9.8698L9.2261 10.801C9.9253 11.8628 10.885 12.8229 11.9478 13.5227L12.879 12.712C13.098 12.5213 13.3067 12.3396 13.4995 12.2064C13.7154 12.0573 13.9696 11.9263 14.288 11.8931C14.6063 11.8599 14.8821 11.9356 15.1242 12.037C15.3403 12.1275 15.5818 12.2622 15.8356 12.4037L16.5702 12.8131C16.8824 12.9872 17.1427 13.2822 17.2237 13.6742C17.3059 14.0721 17.1796 14.4547 16.9407 14.7478C16.2355 15.613 15.0814 16.1921 13.8432 15.9423C13.1505 15.8026 12.4669 15.5686 11.6514 15.1009C10.0284 14.1701 8.5776 12.7185 7.64791 11.0974C7.1802 10.2819 6.94625 9.5983 6.80651 8.9056C6.55674 7.66735 7.13577 6.5133 8.00097 5.80813C8.29413 5.56918 8.6767 5.44287 9.0746 5.52512Z" fill="#814398"/></svg>},
                        {href:"/customer-support", label:"Customer Support", svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M12.0002 4C8.74885 4 6.31489 6.09486 6.02849 8.52063C6.15063 8.57303 6.26834 8.62684 6.37501 8.67566C6.73116 8.83478 7.40272 9.13482 7.6585 9.89191C7.75152 10.1672 7.75079 10.4616 7.75011 10.7355V15.2645C7.75079 15.5384 7.75152 15.8327 7.6585 16.1081C7.40272 16.8652 6.73116 17.1652 6.37501 17.3243C6.0121 17.4904 5.52133 17.7144 5.16362 17.7434C4.76625 17.7755 4.36396 17.6906 4.01491 17.4947C3.69791 17.3168 3.45992 17.0265 3.21887 16.7323C3.13171 16.6265 2.96671 16.4318 2.85082 16.2975C2.63896 16.052 2.39839 15.7733 2.20005 15.5137C1.8724 15.0849 1.54407 14.5711 1.38098 13.9741C1.20634 13.3348 1.20634 12.6652 1.38098 12.0259C1.49932 11.5927 1.71345 11.2104 1.99611 10.8091C2.26984 10.4205 2.73604 9.85098 3.19205 9.29711C3.26557 9.20387 3.36665 9.07569 3.44139 8.99009C3.57673 8.83505 3.76401 8.64608 4.01491 8.50526L4.0196 8.50263C4.31352 4.74952 7.91074 2 12.0002 2C16.0897 2 19.6869 4.74952 19.9809 8.50264L19.9855 8.50526C20.2364 8.64608 20.4237 8.83505 20.5591 8.99009C20.6338 9.07569 20.7349 9.20386 20.8084 9.2971C21.2644 9.85097 21.7306 10.4205 22.0044 10.8091C22.287 11.2104 22.5011 11.5927 22.6195 12.0259C22.7941 12.6652 22.7941 13.3348 22.6195 13.9741C22.4564 14.5711 22.1281 15.0849 21.8004 15.5137C21.6021 15.7733 21.3616 16.052 21.1497 16.2975C21.0339 16.4318 20.8688 16.6265 20.7816 16.7323C20.5443 17.0218 20.3099 17.3078 20.0002 17.4864V17.8C20.0002 20.3163 17.5419 22 15.0002 22H13.0002C12.4479 22 12.0002 21.5523 12.0002 21C12.0002 20.4477 12.4479 20 13.0002 20H15.0002C16.8768 20 18.0002 18.8183 18.0002 17.8V17.4914C17.868 17.4353 17.7403 17.3769 17.6255 17.3243C17.2693 17.1652 16.5977 16.8652 16.342 16.1081C16.2489 15.8327 16.2497 15.5384 16.2503 15.2645V10.7355C16.2497 10.4616 16.2489 10.1672 16.342 9.89191C16.5977 9.13482 17.2693 8.83478 17.6255 8.67566C17.7321 8.62684 17.8498 8.57303 17.972 8.52063C17.6856 6.09486 15.2516 4 12.0002 4Z" fill="#814398"/></svg>},
                      ].map(({href, label, svg}) => (
                        <a key={href} href={href} style={{display:"flex", alignItems:"center", gap:"10px", padding:"8px 0", textDecoration:"none", color:"#1A1A1A", fontSize:"15px", fontWeight:500}}>
                          <span style={{flexShrink:0}}>{svg}</span>
                          {label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <a href="/community" style={{display:"block", textAlign:"left", padding:"10px 0", textDecoration:"none", color:"#1A1A1A", fontSize:"16px", fontWeight:500}}>Community</a>
                <div style={{paddingTop:"16px"}}>
                  <a href="/contact-us" style={{display:"inline-block", padding:"12px 28px", borderRadius:"999px", border:"2px solid #814398", color:"#814398", textDecoration:"none", fontWeight:600, fontSize:"15px"}}>Contact Us</a>
                </div>
              </div>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
        <a href="/plan" className="mb-3 flex items-center gap-2 text-sm text-gray-600 hover:text-purple-700">← Back to plans</a>
        <h1 className="mb-6" style={{marginBottom:"24px"}}>Complete Your Subscription</h1>

        {/* Plan */}
        {selectedPlan && (
          <div className="mb-5 rounded-2xl border border-purple-100 p-4 sm:p-6" style={{backgroundColor:"#FCEBFF99"}}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div style={{fontFamily:"Mukta, sans-serif", fontWeight:700, fontSize:"16px", lineHeight:"100%", color:"#1A1A1A"}}>Selected Plan</div>
                <div style={{fontFamily:"Mukta, sans-serif", fontWeight:400, fontSize:"14px", lineHeight:"100%", color:"#1A1A1A", marginTop:"6px"}}>{selectedPlan.identity}</div>
                {selectedPlan.description && <div style={{fontFamily:"Mukta, sans-serif", fontWeight:400, fontSize:"13px", color:"#4B5563", marginTop:"4px"}}>{selectedPlan.description}</div>}
              </div>
              <div className="shrink-0 text-right">
                <div style={{fontFamily:"Mukta, sans-serif", fontWeight:400, fontSize:"24px", lineHeight:"100%", letterSpacing:"0px", textAlign:"right", color:"#814398"}}>
                  {selectedPlan.amount === 0 ? "Free" : `₹${selectedPlan.amount}/${selectedPlan.interval === "monthly" ? "month" : "year"}`}
                </div>
                <div style={{fontFamily:"Mukta, sans-serif", fontWeight:700, fontSize:"16px", lineHeight:"100%", color:"#1A1A1A", textAlign:"right", marginTop:"6px", textTransform:"capitalize"}}>{selectedPlan.interval}</div>
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
              {
                type: "self" as const,
                icon: (active: boolean) => (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 4C14 5.10457 13.1046 6 12 6C10.8954 6 10 5.10457 10 4C10 2.89543 10.8954 2 12 2C13.1046 2 14 2.89543 14 4Z" stroke={active ? "#ffffff" : "#6B7280"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 12.5C16 10.6144 16 9.67157 15.4142 9.08579C14.8284 8.5 13.8856 8.5 12 8.5C10.1144 8.5 9.17157 8.5 8.58579 9.08579C8 9.67157 8 10.6144 8 12.5V14C8 14.9428 8 15.4142 8.29289 15.7071C8.58579 16 9.05719 16 10 16V20C10 20.9428 10 21.4142 10.2929 21.7071C10.5858 22 11.0572 22 12 22C12.9428 22 13.4142 22 13.7071 21.7071C14 21.4142 14 20.9428 14 20V16C14.9428 16 15.4142 16 15.7071 15.7071C16 15.4142 16 14.9428 16 14V12.5Z" stroke={active ? "#ffffff" : "#6B7280"} strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                ),
                label: "I'm Senior",
                desc: "I am subscribing for myself to learn and stay safe online."
              },
              {
                type: "relation" as const,
                icon: (active: boolean) => (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke={active ? "#ffffff" : "#6B7280"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16.5 8C17.8807 8 19 6.88071 19 5.5C19 4.11929 17.8807 3 16.5 3C15.1193 3 14 4.11929 14 5.5C14 6.88071 15.1193 8 16.5 8Z" stroke={active ? "#ffffff" : "#6B7280"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16.5 10.5C18.433 10.5 20 11.567 20 14" stroke={active ? "#ffffff" : "#6B7280"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 21C17 17.686 13.314 15 9 15C4.686 15 1 17.686 1 21" stroke={active ? "#ffffff" : "#6B7280"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
                label: "For Someone else",
                desc: "I am subscribing for a parent, relative, or friend."
              },
            ]).map(({ type, icon, label, desc }) => (
              <button key={type} type="button" onClick={() => setOnboardingType(type)}
                className={`rounded-2xl border p-3 sm:p-5 text-center transition ${onboardingType === type ? "bg-purple-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
                style={onboardingType === type ? {border:"1.5px solid #C4A8D4"} : {border:"1px solid #D0D5DD", borderRadius:"20px"}}>
                <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg ${onboardingType === type ? "bg-purple-600" : "bg-gray-100"}`}>{icon(onboardingType === type)}</div>
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
                      <input type="tel" inputMode="numeric" value={rel.phone}
                        onChange={(e) => updateRelative(i, "phone", numericOnly(e.target.value).slice(0, PHONE_MAX_LEN[rel.countryCode] ?? 15))}
                        placeholder={rel.countryCode === "IN" ? "98765 43210" : "555 000 0000"}
                        maxLength={PHONE_MAX_LEN[rel.countryCode] ?? 15}
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
              <div><label className={lbl}>Initials</label><input type="text" value={initial} onChange={(e) => setInitial(e.target.value)} placeholder="Initials" maxLength={3} className={inpCls("initial")} />{fieldErr("initial")}</div>
            </div>

            {/* DOB */}
            <div className="mb-4">
              <label className={lbl}>Date Of Birth</label>
              <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={inpCls("dob")} required
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 10)).toISOString().split("T")[0]} />
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
                <input type="tel" inputMode="numeric" value={phone}
                  onChange={(e) => setPhone(numericOnly(e.target.value).slice(0, PHONE_MAX_LEN[countryCode] ?? 15))}
                  placeholder={countryCode === "IN" ? "98765 43210" : "555 000 0000"}
                  maxLength={PHONE_MAX_LEN[countryCode] ?? 15}
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

          <button type="submit" disabled={submitting || !agreeTerms || !updates || !whatsappMsg} style={{color:"#ffffff"}}
            className="w-full rounded-full bg-purple-600 px-6 py-4 text-base font-semibold text-white shadow-md transition hover:bg-purple-700 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed">
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
                      <div className="footer-link-header"><div>Resources</div></div>
                      <div className="footer-link-holder">
                        <a href="/tutorials" className="footer-link w-inline-block"><div>Tech Tutorials</div></a>
                        <a href="/blogs" className="footer-link w-inline-block"><div>Blogs</div></a>
                        <a href="/emergency-contact" className="footer-link w-inline-block"><div>Emergency Contact</div></a>
                        <a href="/customer-support" className="footer-link w-inline-block"><div>Customer Support</div></a>
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

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeInner />
    </Suspense>
  );
}
