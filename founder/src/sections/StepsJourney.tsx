const steps = [
  {
    step: '01',
    title: 'Upload & Sense',
    description: 'Smart orientation detection, auto-crop, and emotional tagging set the stage for recommendations.',
  },
  {
    step: '02',
    title: 'Explore Styles',
    description: 'Parallel previews stream into the rail with blur placeholders so you never wait on a spinner.',
  },
  {
    step: '03',
    title: 'Customize & Upsell',
    description: 'Canvas, frame, Living Canvas, and digital bundles adjust the sticky order rail in real time.',
  },
  {
    step: '04',
    title: 'Celebrate & Share',
    description: 'Guest checkout wraps in seconds, while token bundles and loyalty unlock repeat purchases.',
  },
];

const StepsJourney = () => {
  return (
    <section className="bg-slate-900 py-20">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-sm uppercase tracking-[0.3em] text-purple-300">How Wondertone Works</p>
        <h2 className="text-3xl font-semibold mt-3 mb-10">A journey engineered for instant wow and long-term love</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((item) => (
            <div key={item.step} className="bg-white/5 border border-white/10 rounded-3xl p-6 min-h-[220px]">
              <div className="text-sm text-indigo-300 font-semibold tracking-[0.3em]">{item.step}</div>
              <h3 className="text-xl font-semibold mt-4">{item.title}</h3>
              <p className="text-sm text-white/70 mt-4 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StepsJourney;
