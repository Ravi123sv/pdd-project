"use client";

import { useEffect, useState } from "react";
import { auth, isSignInWithEmailLink, signInWithEmailLink } from "../../../lib/firebase";
import { useRouter } from "next/navigation";
import { useStore } from "../../../lib/store/useStore";
import { Loader2, ShieldCheck, AlertTriangle } from "lucide-react";

/**
 * AuthVerifyPage
 * Handles the incoming Firebase Email Link callback to complete the professional handshake.
 */
export default function AuthVerifyPage() {
  const router = useRouter();
  const { setAuth } = useStore();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const finalizeHandshake = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');

        if (!email) {
          // If email is missing (e.g. user opened link on different device)
          email = window.prompt('Please provide your email for confirmation');
        }

        try {
          const result = await signInWithEmailLink(auth, email!, window.location.href);
          window.localStorage.removeItem('emailForSignIn');

          const userData = {
            uid: result.user.uid,
            email: result.user.email!,
            name: result.user.displayName || 'Practitioner',
            role: 'doctor' as const,
            userType: 'individual' as const,
          };

          localStorage.setItem("user_session", JSON.stringify({ user: userData, token: await result.user.getIdToken() }));
          setAuth(true, userData);
          setStatus('success');

          setTimeout(() => router.push("/dashboard"), 2000);
        } catch (error: any) {
          setStatus('error');
          setErrorMsg(error.message || "Clinical handshake failed.");
        }
      }
    };

    finalizeHandshake();
  }, [router, setAuth]);

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-8 text-white">
      <div className="max-w-md w-full text-center space-y-8">
        {status === 'verifying' && (
          <div className="space-y-6">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <h2 className="text-2xl font-black uppercase tracking-widest">Validating Clinical Link</h2>
            <p className="text-slate-400 text-sm font-medium">Please wait while we establish your secure workstation session...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="h-20 w-20 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(16,185,129,0.3)]">
               <ShieldCheck className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-widest">Identity Verified</h2>
            <p className="text-slate-400 text-sm font-medium">Authentication successful. Entering dashboard...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-2xl font-black uppercase tracking-widest">Handshake Failed</h2>
            <p className="text-red-400/80 text-sm font-bold">{errorMsg}</p>
            <button
              onClick={() => router.push("/auth/login")}
              className="mt-8 px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest"
            >
              Return to Gateway
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
