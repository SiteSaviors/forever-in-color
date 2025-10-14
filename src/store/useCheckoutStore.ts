import { create } from 'zustand';

export type CheckoutStep = 'contact' | 'shipping' | 'payment' | 'review';

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
  resetCheckout: () => void;
};

const defaultContact: ContactInfo = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
};

const defaultShipping: ShippingInfo = {
  addressLine1: '',
  addressLine2: '',
  city: '',
  region: '',
  postalCode: '',
  country: 'US',
};

export const useCheckoutStore = create<CheckoutState>((set) => ({
  step: 'contact',
  contact: defaultContact,
  shipping: defaultShipping,
  saveToProfile: true,
  marketingOptIn: false,
  paymentIntentId: null,
  paymentIntentSecret: null,
  paymentAmount: null,
  paymentCurrency: 'usd',
  setStep: (step) => set({ step }),
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
  resetCheckout: () =>
    set({
      step: 'contact',
      contact: defaultContact,
      shipping: defaultShipping,
      saveToProfile: true,
      marketingOptIn: false,
      paymentIntentId: null,
      paymentIntentSecret: null,
      paymentAmount: null,
      paymentCurrency: 'usd',
    }),
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
}));
