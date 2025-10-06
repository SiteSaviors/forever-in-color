import LaunchpadLayout from '@/sections/LaunchpadLayout';
import StudioConfigurator from '@/sections/StudioConfigurator';

const StudioPage = () => {
  return (
    <div className="bg-slate-950 min-h-screen text-white">
      <LaunchpadLayout />
      <StudioConfigurator />
    </div>
  );
};

export default StudioPage;
