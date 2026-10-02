const emit = (name, data = {}) => {

  window.dataLayer = window.dataLayer || [];

  window.dataLayer.push({
    event: name,
    ...data
  });

};

emit('view_landing_page');


// Chame window.trackAtlasPurchase({ plan, value, transaction_id })
// na confirmação do gateway para registrar a conversão final.

window.trackAtlasPurchase = (purchase) => {
  emit('purchase', purchase);
};


// =========================================================
// REVEALS
// =========================================================

const reveals = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {

    entries.forEach((entry) => {

      if (!entry.isIntersecting) return;

      entry.target.classList.add('visible');

      revealObserver.unobserve(entry.target);

    });

  },
  {
    threshold: 0.12,
    rootMargin: '0px 0px -40px'
  }
);


reveals.forEach((element, index) => {

  element.style.transitionDelay =
    `${Math.min(index % 4, 3) * 55}ms`;

  revealObserver.observe(element);

});


// =========================================================
// DATA EVENTS
// =========================================================

document
  .querySelectorAll('[data-event]')
  .forEach((element) => {

    element.addEventListener('click', () => {

      emit(element.dataset.event);

    });

  });


// =========================================================
// PARALLAX DO HERO
// =========================================================

const deviceStage =
  document.querySelector('.device-stage');


if (
  deviceStage &&
  matchMedia(
    '(hover: hover) and (prefers-reduced-motion: no-preference)'
  ).matches
) {

  const layers =
    Array.from(
      deviceStage.querySelectorAll('.wall-card')
    ).map(
      (layer, index) => [
        layer,
        3 + (index % 5) * 1.2
      ]
    );


  let frame;


  deviceStage.addEventListener(
    'pointermove',
    (event) => {

      cancelAnimationFrame(frame);

      frame = requestAnimationFrame(() => {

        const box =
          deviceStage.getBoundingClientRect();

        const x =
          (event.clientX - box.left) /
            box.width -
          0.5;

        const y =
          (event.clientY - box.top) /
            box.height -
          0.5;


        layers.forEach(([layer, depth]) => {

          if (!layer) return;

          layer.style.setProperty(
            '--parallax-x',
            `${(x * depth).toFixed(2)}px`
          );

          layer.style.setProperty(
            '--parallax-y',
            `${(y * depth * 0.65).toFixed(2)}px`
          );

        });

      });

    }
  );


  deviceStage.addEventListener(
    'pointerleave',
    () => {

      layers.forEach(([layer]) => {

        layer?.style.setProperty(
          '--parallax-x',
          '0px'
        );

        layer?.style.setProperty(
          '--parallax-y',
          '0px'
        );

      });

    }
  );

}


// =========================================================
// GALERIA
// =========================================================

const gallery =
  document.querySelector('[data-gallery]');


if (gallery) {

  new IntersectionObserver(
    ([entry], observer) => {

      if (entry.isIntersecting) {

        emit('view_gallery');

        observer.disconnect();

      }

    },
    {
      threshold: 0.25
    }
  ).observe(gallery);

}


// =========================================================
// COMPARADOR
// =========================================================

const comparison =
  document.querySelector('[data-compare]');

const range =
  comparison?.querySelector('input');


if (range) {

  let tracked = false;


  range.addEventListener(
    'input',
    () => {

      comparison.style.setProperty(
        '--pos',
        `${range.value}%`
      );


      if (!tracked) {

        emit('use_before_after');

        tracked = true;

      }

    }
  );

}


// =========================================================
// FAQ
// =========================================================

document
  .querySelectorAll('details')
  .forEach((details) => {

    details.addEventListener(
      'toggle',
      () => {

        if (!details.open) return;


        document
          .querySelectorAll('details[open]')
          .forEach((other) => {

            if (other !== details) {

              other.removeAttribute('open');

            }

          });

      }
    );

  });


// =========================================================
// UPSELL
// =========================================================

const upsellDialog =
  document.querySelector('.upsell-dialog');


// =========================================================
// BOTÃO ESSENCIAL
//
// IMPORTANTE:
// Esse botão NÃO possui checkout.
// Ele somente abre o upsell.
// =========================================================

const essentialButton =
  document.getElementById(
    'essential-offer-btn'
  );


if (essentialButton) {

  essentialButton.addEventListener(
    'click',
    (event) => {

      event.preventDefault();

      event.stopPropagation();


      emit('select_plan', {
        plan: 'essential'
      });


      if (!upsellDialog) {

        console.error(
          'ATLAS: .upsell-dialog não encontrado.'
        );

        return;

      }


      upsellDialog.showModal();


      emit('view_upsell', {
        source_plan: 'essential'
      });

    }
  );

}


// =========================================================
// BOTÃO COLEÇÃO COMPLETA
//
// Esse continua indo normalmente para a Cakto
// de R$ 19,90.
// =========================================================

const completeButton =
  document.querySelector(
    '.pricing [data-plan="complete"]'
  );


if (completeButton) {

  completeButton.addEventListener(
    'click',
    () => {

      emit('select_plan', {
        plan: 'complete'
      });


      emit('begin_checkout', {

        plan: 'complete',

        value: 19.90,

        currency: 'BRL',

        offer: 'standard'

      });

    }
  );

}


// =========================================================
// CONTROLES DO UPSELL
// =========================================================

if (upsellDialog) {


  // =======================================================
  // FECHAR UPSELL
  // =======================================================

  const closeUpsell = () => {

    if (upsellDialog.open) {

      upsellDialog.close();

    }

  };


  // =======================================================
  // ACEITAR UPSELL
  //
  // R$ 14,90
  // O <a> fará o redirecionamento para a Cakto.
  // =======================================================

  const acceptButton =
    upsellDialog.querySelector(
      '.upsell-accept'
    );


  if (acceptButton) {

    acceptButton.addEventListener(
      'click',
      () => {

        emit('accept_upsell', {

          plan: 'complete',

          value: 14.90,

          currency: 'BRL'

        });


        emit('begin_checkout', {

          plan: 'complete',

          value: 14.90,

          currency: 'BRL',

          offer: 'essential_upsell'

        });


        closeUpsell();

      }
    );

  }


  // =======================================================
  // RECUSAR UPSELL
  //
  // Vai para a Essencial de R$ 9,90.
  // =======================================================

  const declineButton =
    upsellDialog.querySelector(
      '.upsell-decline'
    );


  if (declineButton) {

    declineButton.addEventListener(
      'click',
      () => {

        emit('decline_upsell', {

          plan: 'essential',

          value: 9.90

        });


        emit('begin_checkout', {

          plan: 'essential',

          value: 9.90,

          currency: 'BRL',

          offer: 'standard'

        });


        window.open(
          'https://pay.cakto.com.br/pfrouu2',
          '_blank',
          'noopener,noreferrer'
        );


        closeUpsell();

      }
    );

  }


  // =======================================================
  // BOTÃO X
  // =======================================================

  const closeButton =
    upsellDialog.querySelector(
      '.upsell-close'
    );


  if (closeButton) {

    closeButton.addEventListener(
      'click',
      () => {

        emit('dismiss_upsell', {

          source_plan: 'essential'

        });


        closeUpsell();

      }
    );

  }


  // =======================================================
  // CLICAR FORA DO CARD
  // =======================================================

  upsellDialog.addEventListener(
    'click',
    (event) => {

      if (event.target === upsellDialog) {

        emit('dismiss_upsell', {

          source_plan: 'essential'

        });


        closeUpsell();

      }

    }
  );


  // =======================================================
  // ESC
  // =======================================================

  upsellDialog.addEventListener(
    'cancel',
    (event) => {

      event.preventDefault();


      emit('dismiss_upsell', {

        source_plan: 'essential'

      });


      closeUpsell();

    }
  );

}


// =========================================================
// PRICING VIEW
// =========================================================

const pricing =
  document.querySelector('#oferta');


if (pricing) {

  new IntersectionObserver(
    ([entry]) => {

      if (entry.isIntersecting) {

        emit('view_pricing');

      }

    },
    {
      threshold: 0.08
    }
  ).observe(pricing);

}


// =========================================================
// CARROSSEL INFINITO ATLAS WALLPAPERS
// =========================================================

function initAtlasCarousel() {

  const track =
    document.getElementById(
      'wallpaper-marquee'
    );


  if (!track) return;


  /*
   * Precisamos de pelo menos dois grupos:
   *
   * Grupo 1:
   * [1][2][3][4][5]
   *
   * Grupo 2:
   * [1][2][3][4][5]
   *
   * O segundo grupo precisa ser uma cópia
   * exata do primeiro.
   */


  const groups =
    track.querySelectorAll(
      '.marquee-group'
    );


  if (groups.length < 2) {

    console.warn(
      'ATLAS Carousel: são necessários pelo menos 2 grupos .marquee-group.'
    );

    return;

  }


  const firstGroup =
    groups[0];

  const secondGroup =
    groups[1];

  const stage =
    track.closest(
      '.marquee-stage'
    );


  // =======================================================
  // CONFIGURAÇÕES
  // =======================================================

  const SPEED = 35;


  let position = 0;

  let loopDistance = 0;

  let paused = false;

  let lastTime =
    performance.now();


  // =======================================================
  // CALCULA A DISTÂNCIA REAL DO LOOP
  // =======================================================

  function calculateLoopDistance() {

    const firstRect =
      firstGroup.getBoundingClientRect();

    const secondRect =
      secondGroup.getBoundingClientRect();


    const distance =
      secondRect.left -
      firstRect.left;


    if (distance > 0) {

      loopDistance =
        distance;

    }

  }


  // =======================================================
  // ESTADO INICIAL
  // =======================================================

  track.style.transform =
    'translate3d(0, 0, 0)';


  // =======================================================
  // PAUSAR COM MOUSE
  // =======================================================

  if (stage) {

    stage.addEventListener(
      'mouseenter',
      () => {

        paused = true;

      }
    );


    stage.addEventListener(
      'mouseleave',
      () => {

        paused = false;

        lastTime =
          performance.now();

      }
    );


    // =====================================================
    // PAUSAR NO TOUCH
    // =====================================================

    stage.addEventListener(
      'touchstart',
      () => {

        paused = true;

      },
      {
        passive: true
      }
    );


    stage.addEventListener(
      'touchend',
      () => {

        paused = false;

        lastTime =
          performance.now();

      },
      {
        passive: true
      }
    );


    stage.addEventListener(
      'touchcancel',
      () => {

        paused = false;

        lastTime =
          performance.now();

      },
      {
        passive: true
      }
    );

  }


  // =======================================================
  // ANIMAÇÃO
  // =======================================================

  function animate(currentTime) {

    const delta =
      Math.min(
        currentTime - lastTime,
        50
      );


    lastTime =
      currentTime;


    if (
      !paused &&
      loopDistance > 0
    ) {

      position +=
        (SPEED * delta) /
        1000;


      if (
        position >= loopDistance
      ) {

        position -=
          loopDistance;

      }


      track.style.transform =
        `translate3d(${-position}px, 0, 0)`;

    }


    requestAnimationFrame(
      animate
    );

  }


  // =======================================================
  // RESIZE
  // =======================================================

  let resizeTimer;


  function handleResize() {

    clearTimeout(
      resizeTimer
    );


    resizeTimer =
      setTimeout(
        () => {

          calculateLoopDistance();


          if (
            loopDistance > 0 &&
            position >= loopDistance
          ) {

            position =
              position % loopDistance;

          }


          lastTime =
            performance.now();

        },
        100
      );

  }


  window.addEventListener(
    'resize',
    handleResize,
    {
      passive: true
    }
  );


  // =======================================================
  // ESPERA AS IMAGENS CARREGAREM
  // =======================================================

  const images =
    track.querySelectorAll(
      'img'
    );


  images.forEach(
    (img) => {

      if (!img.complete) {

        img.addEventListener(
          'load',
          () => {

            calculateLoopDistance();

          },
          {
            once: true
          }
        );

      }

    }
  );


  // =======================================================
  // PRIMEIRO CÁLCULO
  // =======================================================

  calculateLoopDistance();


  requestAnimationFrame(
    () => {

      calculateLoopDistance();

    }
  );


  // =======================================================
  // INICIA ANIMAÇÃO
  // =======================================================

  requestAnimationFrame(
    animate
  );

}


// =========================================================
// INICIALIZAÇÃO
// =========================================================

if (
  document.readyState ===
  'loading'
) {

  document.addEventListener(
    'DOMContentLoaded',
    initAtlasCarousel,
    {
      once: true
    }
  );

} else {

  initAtlasCarousel();

}