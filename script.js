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

const deviceStage = document.querySelector('.device-stage');
if (deviceStage && matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) {
  const layers = Array.from(deviceStage.querySelectorAll('.wall-card'))
    .map((layer, index) => [layer, 3 + (index % 5) * 1.2]);
  let frame;
  deviceStage.addEventListener('pointermove', (event) => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const box = deviceStage.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - .5;
      const y = (event.clientY - box.top) / box.height - .5;
      layers.forEach(([layer, depth]) => {
        if (!layer) return;
        layer.style.setProperty('--parallax-x', `${(x * depth).toFixed(2)}px`);
        layer.style.setProperty('--parallax-y', `${(y * depth * .65).toFixed(2)}px`);
      });
    });
  });
  deviceStage.addEventListener('pointerleave', () => {
    layers.forEach(([layer]) => {
      layer?.style.setProperty('--parallax-x', '0px');
      layer?.style.setProperty('--parallax-y', '0px');
    });
  });
}

const gallery = document.querySelector('[data-gallery]');
if (gallery) {
  new IntersectionObserver(([entry], observer) => {
    if (entry.isIntersecting) { emit('view_gallery'); observer.disconnect(); }
  }, { threshold: 0.25 }).observe(gallery);
}

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

const upsellDialog = document.querySelector('.upsell-dialog');
document.querySelectorAll('[data-plan]').forEach((button) => {
  button.addEventListener('click', (event) => {
    const plan = button.dataset.plan;
    emit('select_plan', { plan });
    if (plan === 'essential' && upsellDialog) {
      event.preventDefault();
      upsellDialog.showModal();
      emit('view_upsell', { source_plan: 'essential' });
      return;
    }
    emit('begin_checkout', { plan: 'complete', value: 19.90, currency: 'BRL', offer: 'standard' });
  });
});

if (upsellDialog) {
  const dismissUpsell = () => {
    upsellDialog.close();
    emit('dismiss_upsell', { source_plan: 'essential' });
  };

  upsellDialog.querySelector('.upsell-accept').addEventListener('click', () => {
    emit('accept_upsell', { plan: 'complete', value: 14.90, currency: 'BRL' });
    emit('begin_checkout', { plan: 'complete', value: 14.90, currency: 'BRL', offer: 'essential_upsell' });
  });
  upsellDialog.querySelector('.upsell-decline').addEventListener('click', () => {
    emit('decline_upsell', { plan: 'essential', value: 9.90 });
    emit('begin_checkout', { plan: 'essential', value: 9.90, currency: 'BRL', offer: 'standard' });
  });
  upsellDialog.querySelector('.upsell-close').addEventListener('click', dismissUpsell);
  upsellDialog.addEventListener('click', (event) => {
    if (event.target === upsellDialog) dismissUpsell();
  });
  upsellDialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    dismissUpsell();
  });
}

const pricing = document.querySelector('#oferta');
if (pricing) {
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) emit('view_pricing');
  }, { threshold: 0.08 }).observe(pricing);
}
