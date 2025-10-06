const styles = [
  {
    name: 'Watercolor Dreams',
    description: 'Soft washes of color with delicate light leaks for portraits and landscapes.',
    thumb: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
    preview: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Pastel Bliss',
    description: 'Dreamy pastel gradients with tactile brush texture that flatters family shots.',
    thumb: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    preview: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Neon Bloom',
    description: 'High-energy neon streaks and light blooms for nightlife and celebration scenes.',
    thumb: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    preview: 'https://images.unsplash.com/photo-1511765224389-37f0e77cf0eb?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Monochrome Muse',
    description: 'Cinematic black-and-white toning with silver gelatin contrast.',
    thumb: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    preview: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Prismatic Dreams',
    description: 'Faceted, gemstone-inspired refractions for statement canvases.',
    thumb: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=800&q=80',
    preview: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=80',
  },
];

const carousel = document.getElementById('style-carousel');
const heroPreview = document.getElementById('hero-preview');
const uploadBtn = document.getElementById('upload-btn');
const browseBtn = document.getElementById('browse-btn');
const summaryStyle = document.getElementById('summary-style');
const summaryStatus = document.getElementById('summary-status');
const viewAllBtn = document.getElementById('view-all-styles');

function createStyleCard(style) {
  const card = document.createElement('div');
  card.className = 'style-card';
  card.innerHTML = `
    <img src="${style.thumb}" alt="${style.name}" />
    <div class="body">
      <div>
        <p class="text-xs uppercase tracking-[0.3em] text-slate-400">Signature</p>
        <h3 class="text-lg font-semibold">${style.name}</h3>
        <p class="text-sm text-slate-500 leading-relaxed">${style.description}</p>
      </div>
      <button data-style="${style.name}">Try This Style</button>
    </div>
  `;
  card.querySelector('button').addEventListener('click', () => handleStyleSelect(style));
  return card;
}

function populateCarousel() {
  styles.forEach((style) => {
    carousel.appendChild(createStyleCard(style));
  });
}

function handleStyleSelect(style) {
  heroPreview.style.opacity = '0';
  summaryStatus.textContent = 'Generating…';
  summaryStyle.textContent = style.name;
  setTimeout(() => {
    heroPreview.src = style.preview;
    heroPreview.style.opacity = '1';
    summaryStatus.textContent = 'Preview Ready';
  }, 600);
}

uploadBtn?.addEventListener('click', () => {
  document.getElementById('launchpad-section')?.scrollIntoView({ behavior: 'smooth' });
});

browseBtn?.addEventListener('click', () => {
  document.getElementById('style-gallery')?.scrollIntoView({ behavior: 'smooth' });
});

viewAllBtn?.addEventListener('click', () => {
  alert('In production this opens the full style explorer with filters.');
});

populateCarousel();
