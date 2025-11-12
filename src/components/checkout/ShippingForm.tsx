import { FormEvent, memo, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { shallow } from 'zustand/shallow';
import { useCheckoutStore } from '@/store/useCheckoutStore';

type ShippingFormProps = {
  onNext?: () => void;
  onBack?: () => void;
};

type ShippingErrors = Partial<Record<'addressLine1' | 'city' | 'region' | 'postalCode', string>>;

const COUNTRIES = [
  { code: 'US', label: 'United States' },
  { code: 'CA', label: 'Canada' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'AU', label: 'Australia' },
];

const ShippingFormComponent = ({ onNext, onBack }: ShippingFormProps) => {
  const { shipping, setShipping } = useCheckoutStore(
    (state) => ({
      shipping: state.shipping,
      setShipping: state.setShipping,
    }),
    shallow
  );
  const [formState, setFormState] = useState(shipping);
  const [errors, setErrors] = useState<ShippingErrors>({});

  const isDirty = useMemo(
    () => JSON.stringify(formState) !== JSON.stringify(shipping),
    [formState, shipping]
  );

  const validate = (): boolean => {
    const nextErrors: ShippingErrors = {};
    if (!formState.addressLine1.trim()) {
      nextErrors.addressLine1 = 'Address is required';
    }
    if (!formState.city.trim()) {
      nextErrors.city = 'City is required';
    }
    if (!formState.region.trim()) {
      nextErrors.region = 'State / Province is required';
    }
    if (!formState.postalCode.trim()) {
      nextErrors.postalCode = 'Postal code is required';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  useEffect(() => {
    setFormState(shipping);
  }, [shipping]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setShipping(formState);
    onNext?.();
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-white/60">
          Country / Region
          <select
            value={formState.country}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, country: event.target.value }))
            }
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-400/60"
          >
            {COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="space-y-2 text-sm text-white/60">
        Street address
        <input
          type="text"
          value={formState.addressLine1}
          onChange={(event) =>
            setFormState((prev) => ({ ...prev, addressLine1: event.target.value }))
          }
          className={clsx(
            'w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/60',
            errors.addressLine1 ? 'border-red-500/50' : 'border-white/15'
          )}
          placeholder="123 Memory Lane"
        />
        {errors.addressLine1 && (
          <span className="text-xs text-red-300">{errors.addressLine1}</span>
        )}
      </label>

      <label className="space-y-2 text-sm text-white/60">
        Apt, suite, etc. (optional)
        <input
          type="text"
          value={formState.addressLine2 ?? ''}
          onChange={(event) =>
            setFormState((prev) => ({ ...prev, addressLine2: event.target.value }))
          }
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/60"
          placeholder="Unit 204"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2 text-sm text-white/60">
          City
          <input
            type="text"
            value={formState.city}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, city: event.target.value }))
            }
            className={clsx(
              'w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/60',
              errors.city ? 'border-red-500/50' : 'border-white/15'
            )}
            placeholder="Austin"
          />
          {errors.city && <span className="text-xs text-red-300">{errors.city}</span>}
        </label>
        <label className="space-y-2 text-sm text-white/60">
          State / Province
          <input
            type="text"
            value={formState.region}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, region: event.target.value }))
            }
            className={clsx(
              'w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/60',
              errors.region ? 'border-red-500/50' : 'border-white/15'
            )}
            placeholder="TX"
          />
          {errors.region && (
            <span className="text-xs text-red-300">{errors.region}</span>
          )}
        </label>
        <label className="space-y-2 text-sm text-white/60">
          Postal code
          <input
            type="text"
            value={formState.postalCode}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, postalCode: event.target.value }))
            }
            className={clsx(
              'w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/60',
              errors.postalCode ? 'border-red-500/50' : 'border-white/15'
            )}
            placeholder="73301"
          />
          {errors.postalCode && (
            <span className="text-xs text-red-300">{errors.postalCode}</span>
          )}
        </label>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
        <p>
          We ship via insured carriers with tracking. Double-check your address to avoid delays.
        </p>
        <p>{isDirty ? 'Shipping details have unsaved changes.' : 'Shipping details synced.'}</p>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            onBack?.();
          }}
          className="rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/40"
        >
          Back
        </button>
        <button
          type="submit"
          className="rounded-xl bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(99,102,241,0.45)] transition hover:scale-[1.02]"
        >
          Continue to Payment →
        </button>
      </div>
    </form>
  );
};

const ShippingForm = memo(ShippingFormComponent);

export default ShippingForm;
