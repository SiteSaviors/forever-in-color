import type { PricingMode } from './PricingModeToggle';
import PricingModeToggle from './PricingModeToggle';
import { useState } from 'react';

const meta = {
  title: 'UI/PricingModeToggle',
  component: PricingModeToggle,
};

export default meta;

const Template = ({ initialMode }: { initialMode: PricingMode }) => {
  const [mode, setMode] = useState<PricingMode>(initialMode);
  return (
    <div className="bg-slate-900 p-8">
      <PricingModeToggle mode={mode} onChange={setMode} />
    </div>
  );
};

export const SubscriptionDefault = () => <Template initialMode="subscription" />;

export const PaygSelected = () => <Template initialMode="payg" />;
