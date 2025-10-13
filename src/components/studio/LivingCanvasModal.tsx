import * as Dialog from '@radix-ui/react-dialog';
import { Sparkles, Video } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useFounderStore } from '@/store/useFounderStore';

const LivingCanvasModal = () => {
  const open = useFounderStore((state) => state.livingCanvasModalOpen && !state.livingCanvasEnabled());
  const setOpen = useFounderStore((state) => state.setLivingCanvasModalOpen);
  const setEnhancementEnabled = useFounderStore((state) => state.setEnhancementEnabled);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-0 w-full max-w-xl mx-auto my-auto bg-slate-900 text-white rounded-[2rem] border border-white/10 shadow-founder p-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-400/15 text-emerald-200 text-xs tracking-[0.3em] uppercase">
            <Sparkles className="w-4 h-4" /> Living Canvas
          </div>
          <Dialog.Title className="text-3xl font-semibold">Make your canvas come alive</Dialog.Title>
          <Dialog.Description className="text-white/70 leading-relaxed">
            Add a 30-second video story that plays back when your canvas is scanned. Perfect for tributes, weddings, and
            milestone celebrations.
          </Dialog.Description>
          <div className="rounded-2xl overflow-hidden border border-white/10 aspect-[3/4]">
            <img
              src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80"
              alt="Living Canvas preview"
              className="w-full h-full object-cover"
            />
          </div>
          <ul className="space-y-3 text-white/70 text-sm">
            <li className="flex items-start gap-3">
              <Video className="w-5 h-5 text-emerald-300 mt-1" />
              <span>Attach a 30-second video that plays instantly—no app required.</span>
            </li>
            <li className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-emerald-300 mt-1" />
              <span>Share the QR with family so everyone can relive the moment.</span>
            </li>
          </ul>
          <div className="flex flex-col md:flex-row gap-3">
            <Button
              className="flex-1"
              onClick={() => {
                setEnhancementEnabled('living-canvas', true);
                setOpen(false);
              }}
            >
              Add Living Canvas ($59.99)
            </Button>
            <Button variant="ghost" className="flex-1" onClick={() => setOpen(false)}>
              Maybe Later
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default LivingCanvasModal;
