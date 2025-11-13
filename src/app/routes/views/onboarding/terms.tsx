"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Background } from "@/components/shared/background";
import { useNavigate } from "@/lib/hooks/useNavigate";
import { ChevronDown } from "lucide-react";
import { SocketBanner } from "@/components/shared/banners/socket_banner";
import { useOnboarding } from "@/lib/stores/onboarding";
import { useSocketStore } from "@/lib/socket";
import { useAuth } from "@/lib/stores/auth";
import { useErrorBanners } from "@/lib/stores/error_banner";

export default function TermsView() {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isScrollingRef = useRef(false);
  const scrollTargetRef = useRef(0);
  const animationFrameRef = useRef<number>(0);

  const { completeStep, setStep } = useOnboarding();
  const { isConnected } = useSocketStore();
  const { isAuthenticated } = useAuth();
  const { add } = useErrorBanners();

  useEffect(() => {
    setStep("terms");
  }, [setStep]);

  const smoothScroll = useCallback((target: number) => {
    if (!scrollRef.current) return;

    const start = scrollRef.current.scrollTop;
    const distance = target - start;
    const duration = 300;
    let startTime: number | null = null;

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      const easeOutCubic = 1 - Math.pow(1 - progress, 3);

      if (scrollRef.current) {
        scrollRef.current.scrollTop = start + distance * easeOutCubic;
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animation);
      } else {
        isScrollingRef.current = false;
      }
    };

    isScrollingRef.current = true;
    animationFrameRef.current = requestAnimationFrame(animation);
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!scrollRef.current) return;

      if (Math.abs(e.deltaY) < 10) return;

      e.preventDefault();

      const scrollSpeed = 2;
      const delta = e.deltaY * scrollSpeed;

      scrollTargetRef.current = Math.max(
        0,
        Math.min(
          scrollRef.current.scrollHeight - scrollRef.current.clientHeight,
          scrollRef.current.scrollTop + delta
        )
      );

      if (!isScrollingRef.current) {
        smoothScroll(scrollTargetRef.current);
      } else {
        scrollTargetRef.current = Math.max(
          0,
          Math.min(
            scrollRef.current.scrollHeight - scrollRef.current.clientHeight,
            scrollRef.current.scrollTop + delta
          )
        );
      }
    },
    [smoothScroll]
  );

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;

    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    } else if (!isAtBottom && hasScrolledToBottom) {
      setHasScrolledToBottom(false);
    }
  }, [hasScrolledToBottom]);

  const handleContinue = () => {
    if (agreed && hasScrolledToBottom && !isAnimating) {
      if (!isConnected || !isAuthenticated) {
        add({
          type: "error",
          title: "Connection Required",
          message:
            "Please ensure you are connected to the server before continuing.",
          autoDismiss: true,
          dismissAfter: 5000,
        });
        return;
      }

      setIsAnimating(true);
      completeStep("terms");
      setTimeout(() => {
        navigate("/onboarding/username");
      }, 300);
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center p-4">
      <Background />

      <div className="relative z-10 w-full max-w-2xl">
        <div className="bg-card/60 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl p-8">
          <SocketBanner />

          <div className="mb-6">
            <div className="flex items-center justify-between mb-1">
              <h1 className="text-2xl font-semibold text-foreground">
                Terms of Service & Privacy Policy
              </h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Please read carefully before continuing
            </p>
          </div>

          <div className="relative">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              onWheel={handleWheel}
              className="h-96 overflow-y-auto border border-border rounded-xl p-6 bg-background/50 mb-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgb(115 115 115 / 0.5) transparent",
              }}
            >
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Project Anora – Terms of Service
              </h2>

              <div className="text-sm text-muted-foreground space-y-4 leading-relaxed">
                <h3 className="font-semibold text-foreground">
                  1. Introduction and Description of Project Anora
                </h3>
                <p>
                  Project Anora (&quot;Anora,&quot; &quot;we,&quot;
                  &quot;our,&quot; or &quot;us&quot;) is a community-driven
                  emulator project dedicated to recreating and preserving legacy
                  versions of Fortnite for educational, archival, and nostalgic
                  purposes. The objective of Project Anora is to provide users
                  with an authentic recreation of earlier Fortnite experiences
                  in a controlled, non-commercial environment.
                </p>
                <p>
                  By accessing or using Project Anora, you (&quot;User,&quot;
                  &quot;you,&quot; or &quot;your&quot;) agree to the terms and
                  conditions set forth in this Privacy Policy and Terms of
                  Service (collectively, the &quot;Agreement&quot;).
                </p>

                <h3 className="font-semibold text-foreground">
                  2. Account Access and Authentication
                </h3>
                <p>
                  Access to Project Anora requires authentication through the
                  official Anora Launcher using a verified Discord account. This
                  process ensures secure account linkage, helps maintain player
                  identity, and prevents unauthorized access or misuse of the
                  platform.
                </p>
                <p>
                  You are responsible for maintaining the confidentiality of
                  your account information and for all activities conducted
                  through your account.
                </p>

                <h3 className="font-semibold text-foreground">
                  5. Community Guidelines
                </h3>
                <p>
                  All users are expected to maintain a respectful and positive
                  environment within the Project Anora community. The following
                  principles apply:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Treat all participants with respect and courtesy.</li>
                  <li>
                    Use Project Anora&apos;s services in a lawful and ethical
                    manner.
                  </li>
                  <li>
                    Follow staff directions and posted rules within the official
                    Discord server.
                  </li>
                  <li>
                    Refrain from harassment, hate speech, or disruptive
                    behavior.
                  </li>
                </ul>
                <p>
                  Violations of these guidelines may result in account warnings,
                  suspension, or permanent removal from Project Anora.
                </p>

                <h3 className="font-semibold text-foreground">
                  6. Prohibited Conduct
                </h3>
                <p>Users may not:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>
                    Reverse-engineer, exploit, or intentionally damage Project
                    Anora&apos;s systems;
                  </li>
                  <li>
                    Use cheats, hacks, or unauthorized third-party tools to
                    alter gameplay;
                  </li>
                  <li>Share or distribute copyrighted material or exploits;</li>
                  <li>
                    Engage in any form of fraudulent, deceptive, or abusive
                    activity.
                  </li>
                </ul>
                <p>
                  Any violation of these provisions may lead to immediate
                  account termination or permanent bans from Project Anora
                  services.
                </p>

                <h3 className="font-semibold text-foreground">
                  Donation Policy and Chargeback Notice
                </h3>
                <p>
                  Anora&apos;s servers are supported and maintained through
                  contributions made via our official SellAuth donation page. By
                  donating, users acknowledge and agree that all donations are
                  voluntary and non-refundable.
                </p>
                <p>
                  Initiating a chargeback is strictly prohibited and constitutes
                  a violation of our Terms of Service (TOS). Any chargeback
                  attempts may result in account penalties or other appropriate
                  actions.
                </p>
                <p>
                  Users are solely responsible for ensuring the accuracy and
                  security of their donation transactions. Anora is not liable
                  for any financial loss or disputes arising from user error or
                  unauthorized activity.
                </p>

                <h3 className="font-semibold text-foreground">
                  7. Legal Disclaimer and Non-Affiliation
                </h3>
                <p>
                  Project Anora is an independent, fan-created emulator project
                  and is not affiliated with, endorsed by, or connected to Epic
                  Games, Inc. All Fortnite assets, trademarks, and intellectual
                  property remain the property of Epic Games, Inc.
                </p>
                <p>
                  Project Anora is maintained for educational and preservation
                  purposes only and operates on a non-commercial basis. Use of
                  the service is at your own discretion and risk.
                </p>

                <h2 className="text-lg font-semibold text-foreground mb-4 mt-8 pt-4 border-t border-border">
                  Privacy Policy
                </h2>

                <h3 className="font-semibold text-foreground">
                  3. Data Collection and Security
                </h3>

                <h4 className="font-medium text-foreground mt-2">
                  3.1 Information We Collect
                </h4>
                <p>
                  For operational, compatibility, and security purposes, Project
                  Anora may collect and temporarily store the following
                  information:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Your Discord account email (for authentication only);</li>
                  <li>
                    Your IP address (for security, anti-abuse, and anti-cheat
                    purposes);
                  </li>
                  <li>
                    Basic system information (for compatibility checks and
                    integrity verification).
                  </li>
                </ul>
                <p>
                  No other personally identifiable information is intentionally
                  collected.
                </p>

                <h4 className="font-medium text-foreground mt-2">
                  3.2 Use of Information
                </h4>
                <p>
                  The information collected is used solely for the following
                  purposes:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Verifying user identity and authentication;</li>
                  <li>
                    Ensuring fair gameplay and preventing cheating or network
                    abuse;
                  </li>
                  <li>
                    Maintaining platform integrity and technical performance;
                  </li>
                  <li>
                    Protecting the Anora community and systems from malicious
                    activity.
                  </li>
                </ul>
                <p>
                  We do not sell, rent, disclose, or share any user data with
                  third parties outside of Project Anora&apos;s internal
                  systems.
                </p>

                <h4 className="font-medium text-foreground mt-2">
                  3.3 Data Protection
                </h4>
                <p>
                  We take reasonable administrative, technical, and physical
                  measures to protect your information against unauthorized
                  access, alteration, disclosure, or destruction. While we
                  strive to use industry-standard safeguards, no online service
                  can guarantee absolute security.
                </p>

                <h4 className="font-medium text-foreground mt-2">
                  3.4 User Rights
                </h4>
                <p>You may request, at any time, to:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>
                    Access or review the data associated with your account;
                  </li>
                  <li>Request modification or deletion of such data; or</li>
                  <li>Withdraw your authorization for its use.</li>
                </ul>
                <p>
                  To protect your privacy, we may require verification of your
                  identity prior to processing such requests.
                </p>

                <h3 className="font-semibold text-foreground">
                  4. Information Processing and Consent
                </h3>
                <p>
                  By using Project Anora, you consent to the collection and
                  limited processing of the minimal data described above, solely
                  to maintain service functionality, verify identity, and comply
                  with security and operational requirements.
                </p>
                <p>
                  We do not process or retain data beyond what is necessary for
                  the operation and protection of the platform.
                </p>

                <h3 className="font-semibold text-foreground">
                  8. Changes to This Policy
                </h3>
                <p>
                  We reserve the right to update or amend this Privacy Policy
                  and Terms of Service at any time. Any changes will take effect
                  upon posting within our official Discord server or launcher.
                  Continued use of the service after such updates constitutes
                  your acceptance of the revised terms.
                </p>

                <h3 className="font-semibold text-foreground">
                  9. Contact Information
                </h3>
                <p>
                  For any questions, concerns, or data-related requests
                  regarding this Privacy Policy or Terms of Service, please
                  contact us through our official Discord Support server. A
                  member of the Anora Team will respond as soon as possible.
                </p>

                <p className="text-foreground font-medium pt-4 pb-2 border-t border-border mt-4">
                  <em>
                    Portions of the materials used are trademarks and/or
                    copyrighted works of Epic Games, Inc. All rights reserved by
                    Epic. This material is not official and is not endorsed by
                    Epic.
                  </em>
                </p>

                <p className="text-foreground font-medium pt-4 pb-2">
                  By checking the box below, you acknowledge that you have read
                  and agree to these terms.
                </p>
              </div>
            </div>

            {!hasScrolledToBottom && (
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-card/80 to-transparent pointer-events-none rounded-b-xl flex items-end justify-center pb-4">
                <div className="flex flex-col items-center gap-1 animate-bounce">
                  <span className="text-xs text-muted-foreground font-medium">
                    Scroll to continue
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            )}
          </div>

          <label
            className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all select-none ${
              hasScrolledToBottom
                ? agreed
                  ? "border-[#5865F2] bg-[#5865F2]/10 cursor-pointer"
                  : "border-border hover:border-border/80 hover:bg-card/30 cursor-pointer"
                : "border-border/30 opacity-50 cursor-not-allowed"
            }`}
          >
            <div className="relative flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                disabled={!hasScrolledToBottom}
                className="peer w-5 h-5 rounded-md border-2 border-border bg-background appearance-none cursor-pointer disabled:cursor-not-allowed checked:bg-[#5865F2] checked:border-[#5865F2] transition-all duration-200"
              />
              {agreed && (
                <svg
                  className="absolute top-0 left-0 w-5 h-5 text-white pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            <span className="text-sm text-foreground leading-relaxed">
              I have read and agree to the Terms of Service and Privacy Policy
            </span>
          </label>

          <button
            onClick={handleContinue}
            disabled={!agreed || !hasScrolledToBottom || isAnimating}
            className={`
              mt-4 w-full py-3 px-4 rounded-xl font-medium text-base transition-all duration-200 select-none
              ${
                agreed && hasScrolledToBottom && !isAnimating
                  ? "bg-[#5865F2] hover:bg-[#4752C4] text-white cursor-pointer transform hover:scale-105 active:scale-95"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }
            `}
          >
            {isAnimating ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Continuing...
              </div>
            ) : (
              "Continue"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
