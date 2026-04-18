import { useEffect, useState } from "react";
import { CheckCircle2, MapPin, Plus } from "lucide-react";
import {
  formatDeliveryAreaAddress,
  type ApiAddress,
  type ApiDeliveryArea,
  type CreateAddressPayload,
} from "../lib/api";

interface CheckoutAddressSectionProps {
  isAuthenticated: boolean;
  deliveryArea: ApiDeliveryArea | null;
  addresses: ApiAddress[];
  selectedAddressId: string | null;
  onSelectAddress: (addressId: string) => void;
  onOpenDeliveryAreaPicker: () => void;
  onAddAddress: (payload: CreateAddressPayload) => Promise<void>;
  isLoading?: boolean;
  isSaving?: boolean;
}

const emptyForm = {
  name: "",
  addressLine: "",
  phone: "",
};

export function CheckoutAddressSection({
  isAuthenticated,
  deliveryArea,
  addresses,
  selectedAddressId,
  onSelectAddress,
  onOpenDeliveryAreaPicker,
  onAddAddress,
  isLoading = false,
  isSaving = false,
}: CheckoutAddressSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowForm(false);
      setFormError(null);
      return;
    }

    if (!deliveryArea) {
      setShowForm(false);
      return;
    }

    if (addresses.length === 0) {
      setShowForm(true);
    }
  }, [addresses.length, deliveryArea, isAuthenticated]);

  useEffect(() => {
    setShowForm(false);
    setFormData(emptyForm);
    setFormError(null);
  }, [deliveryArea?.id]);

  const handleFieldChange = (field: keyof typeof emptyForm, value: string) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!deliveryArea) {
      setFormError("Please select your society before saving an address.");
      return;
    }

    const payload = {
      deliveryAreaId: deliveryArea.id,
      name: formData.name.trim(),
      addressLine: formData.addressLine.trim(),
      phone: formData.phone.trim(),
    };

    if (!payload.addressLine) {
      setFormError("Please enter your flat, house, or unit detail.");
      return;
    }

    try {
      await onAddAddress(payload);
      setFormData(emptyForm);
      setShowForm(false);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to save address right now.",
      );
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-[#1B4332]/10 bg-white/80 px-4 py-4">
        <p className="text-sm text-[#1B4332]/70">
          Sign in to select your delivery address and place the order.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-3xl border border-[#1B4332]/10 bg-white/80 p-4">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.12em] text-[#1B4332]/45">
            Delivery Address
          </p>
          <p className="mt-1 text-sm text-[#1B4332]/70">
            {deliveryArea
              ? "Pick a saved address or add your flat/unit inside this society."
              : "Select your society first, then save the exact delivery point."}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenDeliveryAreaPicker}
          className="shrink-0 inline-flex items-center gap-1 rounded-full bg-[#F8F4E1] px-3 py-2 text-xs text-[#1B4332] transition-colors hover:bg-[#1B4332] hover:text-white"
        >
          <MapPin className="h-3.5 w-3.5" />
          {deliveryArea ? "Change Society" : "Select Society"}
        </button>
      </div>

      {deliveryArea ? (
        <div className="mb-4 rounded-2xl border border-[#1B4332]/10 bg-[#F8F4E1] px-4 py-4">
          <p className="text-sm text-[#1B4332]">{deliveryArea.name}</p>
          <p className="mt-1 text-sm text-[#1B4332]/65">
            {formatDeliveryAreaAddress(deliveryArea)}
          </p>
          <p className="mt-2 text-xs text-[#1B4332]/55">
            We will auto-fill the society details. You only need to save the
            exact flat, wing, or house line.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#F8F4E1] px-4 py-4 text-sm text-[#1B4332]/60">
          Choose your delivery society to unlock saved addresses and checkout.
        </div>
      )}

      {deliveryArea && (
        <>
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setShowForm((current) => !current);
                setFormError(null);
              }}
              className="inline-flex items-center gap-1 rounded-full bg-[#F8F4E1] px-3 py-2 text-xs text-[#1B4332] transition-colors hover:bg-[#1B4332] hover:text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              {showForm ? "Close" : "Add New"}
            </button>
          </div>

          {isLoading ? (
            <div className="rounded-2xl bg-[#F8F4E1] px-4 py-4 text-sm text-[#1B4332]/60">
              Loading saved addresses...
            </div>
          ) : addresses.length === 0 ? (
            <div className="rounded-2xl bg-[#F8F4E1] px-4 py-4 text-sm text-[#1B4332]/60">
              No saved address yet for this society. Add one below to continue.
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((address) => {
                const isSelected = selectedAddressId === address.id;
                const addressArea = address.deliveryArea || deliveryArea;

                return (
                  <button
                    key={address.id}
                    type="button"
                    onClick={() => onSelectAddress(address.id)}
                    className={`w-full rounded-2xl border px-4 py-4 text-left transition-all ${
                      isSelected
                        ? "border-[#1B4332] bg-[#F8F4E1] shadow-sm"
                        : "border-[#1B4332]/10 bg-white hover:border-[#1B4332]/30"
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
                          <p className="text-[#1B4332]">{address.name}</p>
                          {isSelected && (
                            <span className="rounded-full bg-[#1B4332] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-white">
                              Selected
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex items-start gap-2 text-sm text-[#1B4332]/65">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                          <div>
                            <p>{address.addressLine}</p>
                            {addressArea && (
                              <p className="mt-1">{addressArea.name}</p>
                            )}
                            {addressArea && (
                              <p className="mt-1 text-[#1B4332]/55">
                                {formatDeliveryAreaAddress(addressArea)}
                              </p>
                            )}
                          </div>
                        </div>

                        {address.phone && (
                          <p className="mt-2 text-sm text-[#1B4332]/65">
                            Contact: {address.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="mt-4 border-t border-[#1B4332]/10 pt-4"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs text-[#1B4332]/60">
                    Label
                  </span>
                  <input
                    value={formData.name}
                    onChange={(event) =>
                      handleFieldChange("name", event.target.value)
                    }
                    placeholder="Home, Kitchen, Store Room"
                    className="w-full rounded-2xl border border-[#1B4332]/10 bg-white px-4 py-3 text-sm text-[#1B4332] placeholder:text-[#1B4332]/35 focus:border-[#1B4332] focus:outline-none"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs text-[#1B4332]/60">
                    Phone
                  </span>
                  <input
                    value={formData.phone}
                    onChange={(event) =>
                      handleFieldChange("phone", event.target.value)
                    }
                    placeholder="+91 98765 43210 (optional)"
                    className="w-full rounded-2xl border border-[#1B4332]/10 bg-white px-4 py-3 text-sm text-[#1B4332] placeholder:text-[#1B4332]/35 focus:border-[#1B4332] focus:outline-none"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-xs text-[#1B4332]/60">
                    Flat / House / Unit
                  </span>
                  <input
                    value={formData.addressLine}
                    onChange={(event) =>
                      handleFieldChange("addressLine", event.target.value)
                    }
                    placeholder="A-302, Maple Wing, near Club House"
                    className="w-full rounded-2xl border border-[#1B4332]/10 bg-white px-4 py-3 text-sm text-[#1B4332] placeholder:text-[#1B4332]/35 focus:border-[#1B4332] focus:outline-none"
                  />
                </label>
              </div>

              {formError && (
                <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="mt-4 w-full rounded-full bg-[#1B4332] px-4 py-3 text-white transition-colors hover:bg-[#2D6A4F] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? "Saving Address..." : "Save Address"}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
