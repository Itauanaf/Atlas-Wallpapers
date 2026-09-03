const emit = (name, data = {}) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...data });
};

emit('view_landing_page');

// Chame window.trackAtlasPurchase({ plan, value, transaction_id })
// na confirmação do gateway para registrar a conversão final.
window.trackAtlasPurchase = (purchase) => emit('purchase', purchase);

const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px' });
reveals.forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 4, 3) * 55}ms`;
  revealObserver.observe(element);
});

document.querySelectorAll('[data-event]').forEach((element) => {
  element.addEventListener('click', () => emit(element.dataset.event));
});

const gallery = document.querySelector('[data-gallery]');
if (gallery) {
  new IntersectionObserver(([entry], observer) => {
    if (entry.isIntersecting) { emit('view_gallery'); observer.disconnect(); }
  }, { threshold: 0.25 }).observe(gallery);
}

const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox.querySelector('img');
document.querySelectorAll('.tile').forEach((tile) => {
  tile.addEventListener('click', () => {
    lightboxImage.src = tile.dataset.full;
    lightbox.showModal();
    emit('click_gallery_image', { artwork: tile.querySelector('.tile-meta')?.childNodes[0]?.textContent.trim() });
  });
});
lightbox.querySelector('button').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', (event) => { if (event.target === lightbox) lightbox.close(); });

const comparison = document.querySelector('[data-compare]');
const range = comparison?.querySelector('input');
if (range) {
  let tracked = false;
  range.addEventListener('input', () => {
    comparison.style.setProperty('--pos', `${range.value}%`);
    if (!tracked) { emit('use_before_after'); tracked = true; }
  });
}

document.querySelectorAll('details').forEach((details) => {
  details.addEventListener('toggle', () => {
    if (!details.open) return;
    document.querySelectorAll('details[open]').forEach((other) => {
      if (other !== details) other.removeAttribute('open');
    });
  });
});

document.querySelectorAll('[data-plan]').forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    const plan = button.dataset.plan;
    emit('select_plan', { plan });
    emit('begin_checkout', { plan });
    alert(`Checkout do plano ${plan === 'complete' ? 'Coleção Completa' : 'Coleção Essencial'} pronto para receber a URL de pagamento.`);
  });
});

const hero = document.querySelector('.hero');
const pricing = document.querySelector('#oferta');
const sticky = document.querySelector('[data-sticky]');
let heroVisible = true;
let pricingVisible = false;
const syncSticky = () => sticky.classList.toggle('visible', !heroVisible && !pricingVisible);
new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; syncSticky(); }, { threshold: 0.08 }).observe(hero);
new IntersectionObserver(([entry]) => {
  pricingVisible = entry.isIntersecting;
  if (entry.isIntersecting) emit('view_pricing');
  syncSticky();
}, { threshold: 0.08 }).observe(pricing);

document.querySelector('.sticky-buy a').addEventListener('click', () => emit('select_plan', { placement: 'sticky' }));
