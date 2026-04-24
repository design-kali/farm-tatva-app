import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, MapPin, X } from "lucide-react";
import { formatDeliveryAreaAddress, type ApiDeliveryArea } from "../lib/api";

interface DeliveryAreaDialogProps {
  isOpen: boolean;
  areas: ApiDeliveryArea[];
  selectedAreaId: string | null;
  isLoading?: boolean;
  error?: string | null;
  onConfirm: (areaId: string) => void;
  onClose?: () => void;
}

export function DeliveryAreaDialog({
  isOpen,
  areas,
  selectedAreaId,
  isLoading = false,
  error = null,
  onConfirm,
  onClose,
}: DeliveryAreaDialogProps) {
  const [draftAreaId, setDraftAreaId] = useState<string | null>(selectedAreaId);

  useEffect(() => {
    if (isOpen) {
      setDraftAreaId(selectedAreaId);
    }
  }, [isOpen, selectedAreaId]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-[#1B4332]/45 backdrop-blur-sm"
            onClick={() => onClose?.()}
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="fixed inset-x-4 top-1/2 z-[71] mx-auto w-[min(100%,42rem)] -translate-y-1/2 rounded-[32px] border border-white/60 bg-[#F8F4E1] p-5 shadow-2xl sm:inset-x-6 sm:p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[#1B4332]/45">
                  Choose Delivery Society
                </p>
                <h2 className="mt-2 text-2xl font-serif text-[#1B4332]">
                  Where should we deliver?
                </h2>
                <p className="mt-2 text-sm text-[#1B4332]/70">
                  Pick your society once and we will keep future addresses tied
                  to that location.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={onClose}
                className="rounded-full bg-[#F8F4E1] p-2 text-[#1B4332] transition-colors hover:bg-red-100 hover:text-red-600"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {error && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="rounded-3xl bg-white px-4 py-10 text-center text-sm text-[#1B4332]/60">
                Loading delivery areas...
              </div>
            ) : areas.length === 0 ? (
              <div className="rounded-3xl bg-white px-4 py-10 text-center text-sm text-[#1B4332]/60">
                No delivery areas are configured yet. Contact support to get
                this resolved.
              </div>
            ) : (
              <div className="space-y-3">
                {areas.map((area) => {
                  const isSelected = draftAreaId === area.id;

                  return (
                    <button
                      key={area.id}
                      type="button"
                      onClick={() => setDraftAreaId(area.id)}
                      className={`w-full rounded-3xl border px-4 py-4 text-left transition-all ${
                        isSelected
                          ? "border-[#1B4332] bg-white shadow-sm"
                          : "border-[#1B4332]/10 bg-white/70 hover:border-[#1B4332]/30"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="pt-0.5">
                          {isSelected ? (
                            <CheckCircle2 className="h-5 w-5 text-[#1B4332]" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-[#1B4332]/25" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-base text-[#1B4332]">
                              {area.name}
                            </p>
                            {area.description && (
                              <span className="rounded-full bg-[#F8F4E1] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[#1B4332]/70">
                                {area.description}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex items-start gap-2 text-sm text-[#1B4332]/65">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                            <p>{formatDeliveryAreaAddress(area)}</p>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                if (draftAreaId) {
                  onConfirm(draftAreaId);
                }
              }}
              disabled={!draftAreaId || isLoading || areas.length === 0}
              className="mt-5 w-full rounded-full bg-[#1B4332] px-4 py-4 text-white transition-colors hover:bg-[#2D6A4F] disabled:cursor-not-allowed disabled:opacity-70"
            >
              Continue with Selected Society
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
