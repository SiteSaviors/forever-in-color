type GallerySkeletonRowProps = {
  count?: number;
};

const SkeletonCard = () => (
  <div className="flex w-[120px] flex-col gap-3 shrink-0 md:w-[110px] sm:w-[96px]">
    <div className="h-[98px] w-full rounded-2xl bg-white/5 animate-pulse md:h-[92px] sm:h-[84px]" />
    <div className="h-3 w-[80%] rounded-full bg-white/5 animate-pulse" />
  </div>
);

const GallerySkeletonRow = ({ count = 5 }: GallerySkeletonRowProps) => (
  <div className="flex gap-2 overflow-hidden">
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={`gallery-skeleton-${index}`} />
    ))}
  </div>
);

export default GallerySkeletonRow;
