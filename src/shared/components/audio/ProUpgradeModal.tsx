'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Disc, FolderSync, Lock, ShieldCheck, Sparkles, Tag, Zap } from 'lucide-react';
import { RiGoogleFill } from 'react-icons/ri';

import { signIn, useSession } from '@/core/auth/client';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { useAppContext } from '@/shared/contexts/app';

interface ProUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerFeature?: string;
}

export function ProUpgradeModal({
  open,
  onOpenChange,
  triggerFeature = 'Write ID3 Tags Directly Into Files',
}: ProUpgradeModalProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { setIsShowSignModal } = useAppContext();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signIn.social({
        provider: 'google',
        callbackURL: window.location.href,
      });
    } catch (err) {
      console.error('Google Sign-In failed', err);
      setGoogleLoading(false);
    }
  };

  const handleGoToPricing = () => {
    onOpenChange(false);
    router.push('/pricing');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-slate-950 border-slate-800 text-slate-100 p-6 sm:p-8">
        <DialogHeader className="text-left space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PRO DJ UNLOCK</span>
          </div>

          <DialogTitle className="text-2xl font-bold tracking-tight text-white">
            Unlock Pro Features
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-sm">
            You tried to access <strong className="text-white">{triggerFeature}</strong>. 
            Upgrade to Pro to streamline your DJ library preparation.
          </DialogDescription>
        </DialogHeader>

        {/* Pro Feature Highlights */}
        <div className="space-y-3 my-4 bg-slate-900/60 rounded-xl p-4 border border-slate-800">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 mt-0.5">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Write ID3 Tags In-Browser</h4>
              <p className="text-xs text-slate-400">
                Embed Camelot keys (TKEY) and BPM (TBPM) directly into MP3s for instant auto-loading in Rekordbox, Serato & Traktor.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 mt-0.5">
              <FolderSync className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Unlimited Batch Folder Analysis</h4>
              <p className="text-xs text-slate-400">
                Bypass the 20-track free batch cap. Drop entire playlist folders with zero file limits.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 mt-0.5">
              <Disc className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Harmonic Mix Order Optimizer</h4>
              <p className="text-xs text-slate-400">
                1-click reorder your crate by compatible Camelot harmonic sequence for smooth energy transitions.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <span className="text-2xl font-black text-white">$14.99</span>
              <span className="text-slate-400 text-xs ml-1.5 font-medium">One-time Lifetime Access</span>
            </div>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              Save $43 vs Mixed In Key ($58)
            </span>
          </div>

          {!session ? (
            <div className="space-y-2">
              <Button
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full bg-white hover:bg-slate-100 text-slate-900 font-semibold py-5 text-sm gap-2"
              >
                <RiGoogleFill className="w-4 h-4 text-slate-900" />
                {googleLoading ? 'Connecting to Google...' : 'Continue with Google to Unlock'}
              </Button>
              <p className="text-[11px] text-center text-slate-500">
                Free tier requires 0 login. Google login is only needed to purchase and bind your Pro license.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Button
                onClick={handleGoToPricing}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-5 text-sm gap-2 shadow-lg shadow-orange-500/20"
              >
                <Zap className="w-4 h-4 fill-white" />
                Unlock Pro License ($14.99)
              </Button>
              <p className="text-[11px] text-center text-slate-400">
                Signed in as <span className="text-white font-medium">{session.user?.email}</span>
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
