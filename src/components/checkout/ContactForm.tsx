import { FormEvent, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { useCheckoutStore } from '@/store/useCheckoutStore';

type ContactFormProps = {
  onNext?: () => void;
};

type ContactErrors = Partial<Record<'firstName' | 'lastName' | 'email', string>>;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ContactForm = ({ onNext }: ContactFormProps) => {
  const { contact, setContact } = useCheckoutStore();
  const [formState, setFormState] = useState(contact);
  const [errors, setErrors] = useState<ContactErrors>({});

  const isDirty = useMemo(
    () => JSON.stringify(formState) !== JSON.stringify(contact),
    [formState, contact]
  );

  const validate = (): boolean => {
    const nextErrors: ContactErrors = {};
    if (!formState.firstName.trim()) {
      nextErrors.firstName = 'First name is required';
    }
    if (!formState.lastName.trim()) {
      nextErrors.lastName = 'Last name is required';
    }
    if (!formState.email.trim() || !emailRegex.test(formState.email)) {
      nextErrors.email = 'Enter a valid email address';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  useEffect(() => {
    setFormState(contact);
  }, [contact]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setContact(formState);
    onNext?.();
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-white/60">
          First name
          <input
            type="text"
            value={formState.firstName}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, firstName: event.target.value }))
            }
            className={clsx(
              'w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/60',
              errors.firstName ? 'border-red-500/50' : 'border-white/15'
            )}
            placeholder="Avery"
          />
          {errors.firstName && (
            <span className="text-xs text-red-300">{errors.firstName}</span>
          )}
        </label>
        <label className="space-y-2 text-sm text-white/60">
          Last name
          <input
            type="text"
            value={formState.lastName}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, lastName: event.target.value }))
            }
            className={clsx(
              'w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/60',
              errors.lastName ? 'border-red-500/50' : 'border-white/15'
            )}
            placeholder="Rivera"
          />
          {errors.lastName && (
            <span className="text-xs text-red-300">{errors.lastName}</span>
          )}
        </label>
      </div>
      <label className="space-y-2 text-sm text-white/60">
        Email address
        <input
          type="email"
          value={formState.email}
          onChange={(event) =>
            setFormState((prev) => ({ ...prev, email: event.target.value }))
          }
          className={clsx(
            'w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/60',
            errors.email ? 'border-red-500/50' : 'border-white/15'
          )}
          placeholder="you@wondertone.com"
        />
        {errors.email && <span className="text-xs text-red-300">{errors.email}</span>}
      </label>
      <label className="space-y-2 text-sm text-white/60">
        Phone (optional)
        <input
          type="tel"
          value={formState.phone ?? ''}
          onChange={(event) =>
            setFormState((prev) => ({ ...prev, phone: event.target.value }))
          }
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/60"
          placeholder="For delivery updates"
        />
      </label>

      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
        <p>
          We’ll send order confirmations and studio updates to this email. Add your phone number to receive delivery notices.
        </p>
        <p>
          {isDirty
            ? 'Changes will be saved to your Wondertone checkout profile when you continue.'
            : 'Your contact details are synced with the current session.'}
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-xl bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(99,102,241,0.45)] transition hover:scale-[1.02]"
        >
          Continue to Shipping
        </button>
      </div>
    </form>
  );
};

export default ContactForm;
