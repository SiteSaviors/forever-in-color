import { SubscriptionSection } from '@/pages/PricingPage';

const meta = {
  title: 'Pages/Pricing/SubscriptionSection',
  component: SubscriptionSection,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    isVisible: true,
    currentTier: 'free',
    loadingTier: null,
  },
};

export default meta;

export const Visible = (args: React.ComponentProps<typeof SubscriptionSection>) => (
  <SubscriptionSection {...args} onSelectTier={() => {}} />
);

export const Hidden = (args: React.ComponentProps<typeof SubscriptionSection>) => (
  <SubscriptionSection {...args} isVisible={false} onSelectTier={() => {}} />
);
