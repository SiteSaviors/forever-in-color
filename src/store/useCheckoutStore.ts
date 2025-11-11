import { create } from 'zustand';

export type CheckoutStep = 'canvas' | 'contact' | 'shipping' | 'payment' | 'review' | 'success';

export type ContactInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
};

export type ShippingInfo = {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
};

type ResetCheckoutOptions = {
  step?: CheckoutStep;
};

type CheckoutState = {
  step: CheckoutStep;
  contact: ContactInfo;
  shipping: ShippingInfo;
  saveToProfile: boolean;
  marketingOptIn: boolean;
  paymentIntentId: string | null;
  paymentIntentSecret: string | null;
  paymentAmount: number | null;
  paymentCurrency: string;
  inModalCheckout: boolean;
  setStep: (step: CheckoutStep) => void;
  setContact: (contact: Partial<ContactInfo>) => void;
  setShipping: (shipping: Partial<ShippingInfo>) => void;
  setSaveToProfile: (value: boolean) => void;
  setMarketingOptIn: (value: boolean) => void;
  setPaymentIntent: (payload: {
    id: string;
    clientSecret: string;
    amount: number;
    currency: string;
  }) => void;
  clearPaymentIntent: () => void;
  resetCheckout: (options?: ResetCheckoutOptions) => void;
  enterModalCheckout: () => void;
  leaveModalCheckout: () => void;
};

const createDefaultContact = (): ContactInfo => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
});

const createDefaultShipping = (): ShippingInfo => ({
  addressLine1: '',
  addressLine2: '',
  city: '',
  region: '',
  postalCode: '',
  country: 'US',
});

const buildBaseResetState = () => ({
  contact: createDefaultContact(),
  shipping: createDefaultShipping(),
  saveToProfile: true,
  marketingOptIn: false,
  paymentIntentId: null,
  paymentIntentSecret: null,
  paymentAmount: null,
  paymentCurrency: 'usd' as CheckoutState['paymentCurrency'],
});

const isModalOnlyStep = (step: CheckoutStep) => step === 'canvas' || step === 'success';
const isPageOnlyStep = (step: CheckoutStep) => step === 'review';

export const useCheckoutStore = create<CheckoutState>((set) => ({
  step: 'contact',
  ...buildBaseResetState(),
  inModalCheckout: false,
  setStep: (step) =>
    set((state) => {
      if (!state.inModalCheckout && isModalOnlyStep(step)) {
        return {};
      }
      if (state.inModalCheckout && isPageOnlyStep(step)) {
        return {};
      }
      if (state.step === step) {
        return {};
      }
      return { step };
    }),
  setContact: (contact) =>
    set((state) => ({
      contact: {
        ...state.contact,
        ...contact,
      },
      paymentIntentId: null,
      paymentIntentSecret: null,
      paymentAmount: null,
    })),
  setShipping: (shipping) =>
    set((state) => ({
      shipping: {
        ...state.shipping,
        ...shipping,
      },
      paymentIntentId: null,
      paymentIntentSecret: null,
      paymentAmount: null,
    })),
  setSaveToProfile: (value) => set({ saveToProfile: value }),
  setMarketingOptIn: (value) => set({ marketingOptIn: value }),
  setPaymentIntent: ({ id, clientSecret, amount, currency }) =>
    set({
      paymentIntentId: id,
      paymentIntentSecret: clientSecret,
      paymentAmount: amount,
      paymentCurrency: currency,
    }),
  clearPaymentIntent: () =>
    set({
      paymentIntentId: null,
      paymentIntentSecret: null,
      paymentAmount: null,
      paymentCurrency: 'usd',
    }),
  resetCheckout: (options) =>
    set((state) => ({
      ...buildBaseResetState(),
      step: options?.step ?? (state.inModalCheckout ? 'canvas' : 'contact'),
    })),
  enterModalCheckout: () =>
    set({
      ...buildBaseResetState(),
      step: 'canvas',
      inModalCheckout: true,
    }),
  leaveModalCheckout: () =>
    set({
      ...buildBaseResetState(),
      step: 'contact',
      inModalCheckout: false,
    }),
}));
