/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { useLoginModal } from "./LoginModalProvider";

export default function SiteHeader() {
  const { user, logout } = useAuth();
  const { openLoginModal } = useLoginModal();
  const [menuOpen, setMenuOpen] = useState(false);
  const [ctaHover, setCtaHover] = useState(false);
  const [learnHover, setLearnHover] = useState(false);
  const [techHover, setTechHover] = useState(false);
  const [resHover, setResHover] = useState(false);
  const [emergencyHover, setEmergencyHover] = useState(false);
  const [supportHover, setSupportHover] = useState(false);

  return (
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
                    {user ? (
                      <div style={{marginLeft:"12px", display:"flex", alignItems:"center", gap:"10px"}}>
                        <span style={{fontSize:"14px", fontWeight:600, color:"#1A1A1A"}}>{user.name}</span>
                        <button type="button" onClick={() => logout()}
                          style={{padding:"10px 20px", borderRadius:"999px", backgroundColor:"transparent", color:"#814398", fontWeight:600, fontSize:"14px", border:"2px solid #814398", cursor:"pointer"}}>
                          Logout
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => openLoginModal()}
                        style={{marginLeft:"12px", padding:"12px 24px", borderRadius:"999px", backgroundColor:"#814398", color:"#ffffff", fontWeight:600, fontSize:"15px", border:"none", cursor:"pointer"}}>
                        Login
                      </button>
                    )}
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
              <div style={{paddingTop:"16px", display:"flex", gap:"12px", flexWrap:"wrap"}}>
                <a href="/contact-us" style={{display:"inline-block", padding:"12px 28px", borderRadius:"999px", border:"2px solid #814398", color:"#814398", textDecoration:"none", fontWeight:600, fontSize:"15px"}}>Contact Us</a>
                {user ? (
                  <button type="button" onClick={() => { setMenuOpen(false); logout(); }}
                    style={{padding:"12px 28px", borderRadius:"999px", backgroundColor:"transparent", border:"2px solid #814398", color:"#814398", fontWeight:600, fontSize:"15px", cursor:"pointer"}}>
                    Logout ({user.name})
                  </button>
                ) : (
                  <button type="button" onClick={() => { setMenuOpen(false); openLoginModal(); }}
                    style={{padding:"12px 28px", borderRadius:"999px", backgroundColor:"#814398", color:"#ffffff", border:"none", fontWeight:600, fontSize:"15px", cursor:"pointer"}}>
                    Login
                  </button>
                )}
              </div>
            </div>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
