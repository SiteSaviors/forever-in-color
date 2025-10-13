import { useMemo } from 'react';

interface ConfettiBurstProps {
  active: boolean;
}

const colors = ['#fbbf24', '#f472b6', '#60a5fa', '#34d399', '#c084fc'];

const ConfettiBurst = ({ active }: ConfettiBurstProps) => {
  const pieces = useMemo(() => {
    return new Array(30).fill(null).map((_, index) => ({
      id: index,
      left: Math.random() * 100,
      delay: Math.random() * 0.4,
      color: colors[index % colors.length],
    }));
  }, [active]);

  if (!active) return null;

  return (
    <div className="confetti-container">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.left}%`,
            top: '-10%',
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiBurst;
