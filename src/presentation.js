import './presentation.css';

import airboySheetUrl from './assets/references/airboy-spritesheet.png';
import airDoorUrl from './assets/references/airdoor.png';
import boxUrl from './assets/references/box.png';
import cloudUrl from './assets/references/cloud.png';
import earthBtnUrl from './assets/references/earthbtn.png';
import earthDoorUrl from './assets/references/earthdoor.png';
import earthgirlSheetUrl from './assets/references/earthgirl-spritesheet.png';
import gateUrl from './assets/references/gate.png';
import lavaUrl from './assets/references/lava.png';
import liftUrl from './assets/references/lift.png';
import platformUrl from './assets/references/platform.png';
import specialEarthBtnUrl from './assets/references/specialearthbtn.png';
import wallUrl from './assets/references/wall.png';
import windUrl from './assets/references/windgenerator.png';

// Слики од играта (вистински скриншоти) и ликовите-инспирација, послужени од /public/slides.
const FIRE_IMG = '/slides/fire.svg';
const WATER_IMG = '/slides/water.svg';

const steps = [
  'Избери ниво',
  'Контролирај ги двата лика',
  'Собери ги соодветните кристали',
  'Активирај копчиња',
  'Избегнувај лава',
  'Користи лифтови, порти, ветер и столбови',
  'Стигни до двете врати',
  'Отклучи го следното ниво'
];

const levels = [
  ['Ниво 1', 'Земјена порта', 'Воведна кооперативна загатка со порта и лифт што учи на тимска работа.'],
  ['Ниво 2', 'Ветрен премин', 'Воведува ветрогенератори, движење со воздушни струи, копчиња, мостови и пречки.'],
  ['Ниво 3', 'Коренова одаја', 'Се фокусира на Earthgirl, земјени столбови, подвижни објекти и напредна соработка.']
];

const screenshots = [
  ['Главно мени', '/slides/menu.png'],
  ['Ниво 1 — Земјена порта', '/slides/level1.png'],
  ['Ниво 2 — Ветрен премин', '/slides/level2.png'],
  ['Ниво 3 — Коренова одаја', '/slides/level3.png'],
  ['Завршен екран', '/slides/win.png']
];

const mechanics = [
  ['Копчиња', earthBtnUrl],
  ['Порти', gateUrl],
  ['Лифтови', liftUrl],
  ['Ветер', windUrl],
  ['Земјени прекинувачи', specialEarthBtnUrl],
  ['Облаци', cloudUrl],
  ['Подвижна кутија', boxUrl],
  ['Лава', lavaUrl]
];

function card(title, body, className = '') {
  return `
    <article class="presentation-card ${className}">
      <h3>${title}</h3>
      <p>${body}</p>
    </article>
  `;
}

function section(id, label, title, body, content) {
  return `
    <section class="presentation-section reveal" id="${id}">
      <div class="section-heading">
        <span>${label}</span>
        <h2>${title}</h2>
        ${body ? `<p>${body}</p>` : ''}
      </div>
      ${content}
    </section>
  `;
}

export function renderPresentation() {
  document.title = 'Earthgirl & Airboy — Презентација';
  document.body.classList.add('presentation-page');

  const root = document.getElementById('game-container');
  root.id = 'presentation-root';
  root.innerHTML = `
    <div class="presentation-shell">
      <div class="presentation-bg" style="background-image: url('${wallUrl}')"></div>
      <div class="particle-layer" aria-hidden="true">
        ${Array.from({ length: 22 }, (_, i) => `<span style="--i:${i}"></span>`).join('')}
      </div>

      <nav class="presentation-nav">
        <a class="brand" href="/">Earthgirl & Airboy</a>
        <div>
          <a href="#idea">Идеја</a>
          <a href="#levels">Нивоа</a>
          <a href="#implementation">Технологија</a>
          <a class="nav-play" href="/">Играј</a>
        </div>
      </nav>

      <header class="hero-section">
        <div class="hero-copy">
          <p class="eyebrow">Кооперативен платформер со загатки</p>
          <h1>Earthgirl & Airboy</h1>
          <p class="subtitle">2Д кооперативен платформер со загатки, инспириран од Fireboy & Watergirl</p>
          <p class="hero-description">
            Два елементарни лика мора да соработуваат за да решаваат загатки, да собираат
            кристали, да избегнуваат опасности и да стигнат до своите излези.
          </p>
          <div class="hero-actions">
            <a class="primary-cta" href="/">Играј</a>
            <a class="secondary-cta" href="#flow">Погледни го текот на играта</a>
          </div>
        </div>
        <div class="hero-showcase">
          <div class="character-orbit earth">
            <img src="${earthgirlSheetUrl}" alt="Earthgirl преглед на спрајт" />
          </div>
          <div class="character-orbit air">
            <img src="${airboySheetUrl}" alt="Airboy преглед на спрајт" />
          </div>
          <div class="temple-platform" style="background-image:url('${platformUrl}')"></div>
        </div>
      </header>

      <main>
        ${section(
          'idea',
          '01',
          'Идеја на проектот',
          'Играта е изградена околу локална соработка. Еден играч ја контролира Earthgirl со WASD, а другиот го контролира Airboy со стрелките. Секој лик има задачи поради кои тимската работа е задолжителна, а не опционална.',
          `<div class="card-grid three">
            ${card('Локална соработка', 'Двата лика се контролираат на иста тастатура и мора да го координираат движењето, копчињата и тајмингот.')}
            ${card('Улоги на ликовите', 'Earthgirl и Airboy собираат различни кристали и користат различни елементарни механики.')}
            ${card('Тимска цел', 'Нивото е решено кога двата лика ќе стигнат до своите врати по решавањето на заедничката загатка.')}
          </div>`
        )}

        ${section(
          'inspiration',
          '02',
          'Инспирација',
          'Инспирирана од класичните прелистувачки игри како Fireboy & Watergirl, редизајнирана со елементите Земја и Воздух, сопствени ликови, оригинални механики, нови нивоа и визуелен стил базиран на мовлести фантастични храмови.',
          `<div class="inspiration-showcase">
            <div class="classic-reference">
              <div class="reference-stage">
                <img class="fire-avatar" src="${FIRE_IMG}" alt="Fireboy" style="object-fit:contain;background:none;box-shadow:none;filter:drop-shadow(0 0 18px rgba(255,120,80,0.55));" />
                <img class="water-avatar" src="${WATER_IMG}" alt="Watergirl" style="object-fit:contain;background:none;box-shadow:none;filter:drop-shadow(0 0 18px rgba(90,180,255,0.55));" />
                <div class="reference-platform"></div>
              </div>
              <p class="reference-label">Појдовна точка: кооперативно решавање загатки во стилот на Fireboy & Watergirl</p>
            </div>
            <div class="new-direction">
              <h3>Што променивме</h3>
              <ul>
                <li>Земја и Воздух наместо Оган и Вода</li>
                <li>Сопствени спрајтови за ликовите</li>
                <li>Оригинални храмски ресурси и механики</li>
                <li>Нов тек на нивоа со ветер, столбови, кутии и облаци</li>
              </ul>
            </div>
          </div>`
        )}

        <section class="mechanics-strip reveal">
          <div class="section-heading">
            <span>Игрови системи</span>
            <h2>Механики што веднаш ги препознавате</h2>
          </div>
          <div class="mechanics-track">
            ${[...mechanics, ...mechanics].map(([name, img]) => `
              <div class="mechanic-tile">
                <img src="${img}" alt="" />
                <p>${name}</p>
              </div>
            `).join('')}
          </div>
        </section>

        ${section(
          'flow',
          '03',
          'Тек на играта',
          '',
          `<div class="flow-grid">
            ${steps.map((step, i) => `<div class="flow-step"><span>${i + 1}</span><p>${step}</p></div>`).join('')}
          </div>`
        )}

        ${section(
          'characters',
          '04',
          'Ликови',
          '',
          `<div class="character-grid">
            <article class="character-card earth-card">
              <div class="sprite-strip"><img src="${earthgirlSheetUrl}" alt="Earthgirl пози" /></div>
              <h3>Earthgirl</h3>
              <p>Зелена и инспирирана од природата. Собира зелени кристали, активира земјени копчиња и користи земјени механики како столбови и лифтови.</p>
            </article>
            <article class="character-card air-card">
              <div class="sprite-strip"><img src="${airboySheetUrl}" alt="Airboy пози" /></div>
              <h3>Airboy</h3>
              <p>Син и инспириран од воздухот. Собира сини кристали, активира воздушни копчиња и користи ветрогенератори и воздушни механики.</p>
            </article>
          </div>`
        )}

        ${section(
          'levels',
          '05',
          'Нивоа',
          '',
          `<div class="card-grid three">
            ${levels.map(([tag, title, text]) => `
              <article class="level-card level-${tag.slice(-1)}">
                <span>${tag}</span>
                <h3>${title}</h3>
                <p>${text}</p>
                <div class="level-visual">
                  <img src="${tag === 'Ниво 1' ? gateUrl : tag === 'Ниво 2' ? windUrl : boxUrl}" alt="" />
                </div>
              </article>
            `).join('')}
          </div>`
        )}

        ${section(
          'implementation',
          '06',
          'Имплементација',
          'Earthgirl & Airboy е изработена во JavaScript со Phaser. Кодот користи структура базирана на сцени, повеќекратно употребливи ентитети, сопствени ресурси, Arcade физика, обработка на колизии и логика за загатки специфична за нивото, одделена од заедничкото однесување.',
          `<div class="implementation-grid">
            ${['BaseLevelScene', 'Сцени на нивоа', 'Ентитети на играчи', 'Копчиња', 'Порти', 'Кристали', 'Врати', 'Опасности'].map((item) => `<span>${item}</span>`).join('')}
          </div>`
        )}

        ${section(
          'screenshots',
          '07',
          'Слики од играта',
          '',
          `<div class="screenshot-grid">
            ${screenshots.map(([label, src]) => `
              <figure class="screenshot-card">
                <div class="shot-art">
                  <span class="shot-label">${label}</span>
                  <img src="${src}" alt="${label}" style="width:100%;height:100%;object-fit:cover;opacity:1;border-radius:0;transform:none;" />
                </div>
                <figcaption>${label}</figcaption>
              </figure>
            `).join('')}
          </div>`
        )}

        ${section(
          'controls',
          '08',
          'Контроли',
          '',
          `<div class="controls-grid">
            <div class="control-panel earth-panel"><h3>Earthgirl</h3><p><kbd>A</kbd> лево <kbd>D</kbd> десно <kbd>W</kbd> скок</p></div>
            <div class="control-panel air-panel"><h3>Airboy</h3><p><kbd>←</kbd> лево <kbd>→</kbd> десно <kbd>↑</kbd> скок</p></div>
            <div class="control-panel"><h3>Друго</h3><p><kbd>R</kbd> рестартирај ниво <kbd>Esc</kbd> назад во мени</p></div>
          </div>`
        )}

        <section class="conclusion-section">
          <img src="${earthDoorUrl}" alt="" />
          <div>
            <h2>Заклучок</h2>
            <p>Earthgirl & Airboy демонстрира кооперативен дизајн на загатки, повеќекратно употреблива архитектура, сопствени визуелни ресурси и прогресивни механики на нивоа.</p>
            <a class="primary-cta" href="/">Играј</a>
          </div>
          <img src="${airDoorUrl}" alt="" />
        </section>
      </main>
    </div>
  `;

  const revealItems = root.querySelectorAll('.reveal, .presentation-card, .level-card, .screenshot-card, .flow-step');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );
  revealItems.forEach((item, index) => {
    item.style.setProperty('--delay', `${Math.min(index % 8, 7) * 55}ms`);
    observer.observe(item);
  });
}
