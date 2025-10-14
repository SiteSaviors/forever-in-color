/**
 * FloatingOrbs - Animated background atmosphere for pricing page
 * Creates floating gradient orbs with blur effects for cinematic depth
 */

const orbs = [
  {
    id: 1,
    size: 'w-96 h-96',
    position: 'top-[10%] left-[15%]',
    gradient: 'bg-gradient-to-br from-purple-500/30 via-indigo-500/20 to-transparent',
    animation: 'animate-float',
    animationDelay: '0s',
    blur: 'blur-3xl',
  },
  {
    id: 2,
    size: 'w-[28rem] h-[28rem]',
    position: 'top-[45%] right-[10%]',
    gradient: 'bg-gradient-to-br from-cyan-400/25 via-blue-500/20 to-transparent',
    animation: 'animate-float',
    animationDelay: '2s',
    blur: 'blur-3xl',
  },
  {
    id: 3,
    size: 'w-80 h-80',
    position: 'bottom-[15%] left-[25%]',
    gradient: 'bg-gradient-to-br from-pink-500/20 via-purple-500/15 to-transparent',
    animation: 'animate-float',
    animationDelay: '4s',
    blur: 'blur-3xl',
  },
  {
    id: 4,
    size: 'w-72 h-72',
    position: 'top-[60%] left-[5%]',
    gradient: 'bg-gradient-to-br from-orange-400/20 via-pink-500/15 to-transparent',
    animation: 'animate-float',
    animationDelay: '1s',
    blur: 'blur-3xl',
  },
  {
    id: 5,
    size: 'w-64 h-64',
    position: 'top-[25%] right-[30%]',
    gradient: 'bg-gradient-to-br from-indigo-400/25 via-purple-500/20 to-transparent',
    animation: 'animate-float',
    animationDelay: '3s',
    blur: 'blur-3xl',
  },
];

const FloatingOrbs = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className={`absolute rounded-full ${orb.size} ${orb.position} ${orb.gradient} ${orb.animation} ${orb.blur} opacity-40`}
          style={{
            animationDuration: '25s',
            animationDelay: orb.animationDelay,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
          }}
        />
      ))}
    </div>
  );
};

export default FloatingOrbs;
