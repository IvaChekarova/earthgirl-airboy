import './presentation.css';

import airboySheetUrl from './assets/references/airboy-spritesheet.png';
import airBtnUrl from './assets/references/airbtn.png';
import earthBtnUrl from './assets/references/earthbtn.png';
import earthDoorUrl from './assets/references/earthdoor.png';
import earthgirlSheetUrl from './assets/references/earthgirl-spritesheet.png';
import gateUrl from './assets/references/gate.png';
import gemsUrl from './assets/references/gems.png';
import lavaUrl from './assets/references/lava.png';
import liftUrl from './assets/references/lift.png';
import pillarUrl from './assets/references/pillar.png';
import wallUrl from './assets/references/wall.png';
import windUrl from './assets/references/windgenerator.png';

// Слики од играта (вистински скриншоти) и ликовите-инспирација (од /public/slides).
const SHOT = {
  menu: '/slides/menu.png',
  level1: '/slides/level1.png',
  level2: '/slides/level2.png',
  level3: '/slides/level3.png',
  win: '/slides/win.png'
};
const FIRE_IMG = '/slides/fire.svg';
const WATER_IMG = '/slides/water.svg';

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

// Ниво-слајд: голем скриншот + листа механики + забелешка.
function levelSlide(id, label, title, tagline, shot, items, note) {
  return section(
    id,
    label,
    title,
    tagline,
    `<div class="level-detail" style="display:grid;grid-template-columns:1.25fr 0.75fr;gap:20px;align-items:center;">
      <figure class="screenshot-card" style="margin:0;overflow:hidden;">
        <img src="${shot}" alt="${title}" style="width:100%;display:block;" />
      </figure>
      <article class="presentation-card">
        <ul style="margin:0;padding-left:18px;display:grid;gap:10px;">
          ${items.map((it) => `<li>${it}</li>`).join('')}
        </ul>
        <p style="margin-top:16px;color:var(--muted);">${note}</p>
      </article>
    </div>`
  );
}

const gameObjects = [
  ['Earth Button', earthBtnUrl],
  ['Air Button', airBtnUrl],
  ['Gates', gateUrl],
  ['Lift Platforms', liftUrl],
  ['Wind Generators', windUrl],
  ['Earth Pillars', pillarUrl],
  ['Crystals', gemsUrl],
  ['Exit Doors', earthDoorUrl],
  ['Lava Pools', lavaUrl]
];

const techStack = [
  'JavaScript',
  'Phaser Framework',
  'Scene-Based Architecture',
  'Custom Sprite Assets',
  'Collision Detection',
  'Physics System',
  'Reusable Components'
];

const challenges = [
  'Координација на два карактери',
  'Collision систем',
  'Активирање на механики',
  'Дизајн на нивоа',
  'Креирање на custom assets'
];

const results = [
  '3 Playable Levels',
  'Puzzle Mechanics',
  'Interactive Objects',
  'Character-Specific Abilities',
  'Custom Graphics',
  'Onboarding Presentation',
  'Win Screen & Ending'
];

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
          <a href="#tech">Технологија</a>
          <a class="nav-play" href="/">Играј</a>
        </div>
      </nav>

      <!-- СЛАЈД 1 -->
      <header class="hero-section">
        <div class="hero-copy">
          <p class="eyebrow">Кооперативна 2D Puzzle-Platformer Игра</p>
          <h1>Earthgirl & Airboy</h1>
          <p class="hero-description">
            Earthgirl &amp; Airboy е кооперативна игра-загатка во која се управуваат два лика
            истовремено. <strong>Earthgirl</strong> ја носи моќта на земјата, а <strong>Airboy</strong>
            моќта на воздухот. Заедно поминуваат низ древен храм — решаваат загатки, собираат
            кристали, избегнуваат лава и стигаат до своите излезни врати. Инспирирана е од
            класикот Fireboy &amp; Watergirl.
          </p>
          <div class="hero-actions">
            <a class="primary-cta" href="/">Играј</a>
            <a class="secondary-cta" href="#idea">Дознај повеќе</a>
          </div>
        </div>
        <div class="hero-showcase">
          <div class="vs-card">
            <div class="vs-half vs-left" style="background-image:url('/slides/char-earth.png')"></div>
            <div class="vs-half vs-right" style="background-image:url('/slides/char-air.png')"></div>
            <div class="vs-line"></div>
            <span class="vs-name vs-name-left">Earthgirl</span>
            <span class="vs-name vs-name-right">Airboy</span>
          </div>
        </div>
      </header>

      <main>
        <!-- СЛАЈД 2 -->
        ${section(
          'idea',
          'СЛАЈД 2',
          'Идеја и Приказна',
          '<strong>Два елементи. Една цел.</strong><br>Earthgirl и Airboy се заробени во древен храм исполнет со магични механизми и опасности. За да избегаат, мора да ги користат своите уникатни способности, да собираат кристали и да активираат различни механизми.',
          `<div class="character-grid">
            <article class="character-card earth-card">
              <div class="sprite-strip"><img src="${earthgirlSheetUrl}" alt="Earthgirl" /></div>
              <h3>Earthgirl</h3>
              <p>Претставува природа и земја.</p>
            </article>
            <article class="character-card air-card">
              <div class="sprite-strip"><img src="${airboySheetUrl}" alt="Airboy" /></div>
              <h3>Airboy</h3>
              <p>Претставува воздух и ветер.</p>
            </article>
          </div>
          <p style="text-align:center;margin-top:18px;font-weight:800;color:var(--text);">
            Само со заедничка соработка може да се заврши нивото.
          </p>
          <div class="inspo-banner">
            <span class="inspo-pair">
              <img src="${FIRE_IMG}" alt="Fireboy" />
              <img src="${WATER_IMG}" alt="Watergirl" />
            </span>
            <p>Инспирација: <strong>Fireboy &amp; Watergirl</strong> — класичната кооперативна
            игра-загатка со оган и вода. Кај нас огнот и водата стануваат <strong>земја</strong> и
            <strong>воздух</strong>.</p>
          </div>`
        )}

        <!-- СЛАЈД 3 -->
        ${section(
          'goal',
          'СЛАЈД 3',
          'Цел на Играта',
          'Како се победува? Во секое ниво играчот треба:',
          `<div class="flow-grid">
            ${[
              'Да ги контролира двата лика',
              'Да собира кристали',
              'Да активира копчиња',
              'Да избегнува лава',
              'Да отвора врати и премини',
              'Да стигне до излезните врати'
            ].map((s, i) => `<div class="flow-step"><span>${i + 1}</span><p>${s}</p></div>`).join('')}
          </div>
          <p style="text-align:center;margin-top:18px;font-weight:800;color:var(--text);">
            Нивото е завршено само кога двата лика ќе стигнат до своите врати.
          </p>`
        )}

        <!-- СЛАЈД 4 -->
        ${levelSlide(
          'levels',
          'СЛАЈД 4',
          'Ниво 1 – Earth Gate',
          'Вовед во механиките',
          SHOT.level1,
          ['Кристали', 'Копчиња', 'Врати', 'Лава', 'Лифт платформи'],
          'Играчот учи како двата карактери треба да соработуваат.'
        )}

        <!-- СЛАЈД 5 -->
        ${levelSlide(
          'level2',
          'СЛАЈД 5',
          'Ниво 2 – Wind Passage',
          'Моќта на воздухот',
          SHOT.level2,
          ['Wind Generator', 'Air Platform', 'Airboy механики', 'Подвижни елементи'],
          'Играчот мора да го искористи ветерот за да достигне недостапни позиции.'
        )}

        <!-- СЛАЈД 6 -->
        ${levelSlide(
          'level3',
          'СЛАЈД 6',
          'Ниво 3 – Root Chamber',
          'Најголемиот предизвик',
          SHOT.level3,
          ['Earth Pillars', 'Wind Mechanics', 'Лифтови', 'Копчиња', 'Кристали', 'Лава'],
          'Сите претходно научени механики мора да се искористат за успешно завршување на играта.'
        )}

        <!-- СЛАЈД 7 -->
        ${section(
          'objects',
          'СЛАЈД 7',
          'Game Objects',
          'Интерактивни елементи. Во играта се имплементирани повеќе интерактивни објекти, секој со специфична улога во решавањето на загатките.',
          `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;">
            ${gameObjects.map(([name, img]) => `
              <article class="presentation-card" style="display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center;">
                <img src="${img}" alt="" style="height:60px;width:auto;object-fit:contain;" />
                <p style="margin:0;font-weight:800;">${name}</p>
              </article>
            `).join('')}
          </div>`
        )}

        <!-- СЛАЈД 8 -->
        ${section(
          'controls',
          'СЛАЈД 8',
          'Контроли и Камера',
          'Camera & Inputs',
          `<div class="controls-grid">
            <div class="control-panel earth-panel"><h3>Earthgirl</h3><p><kbd>A</kbd> лево <kbd>D</kbd> десно <kbd>W</kbd> скок</p></div>
            <div class="control-panel air-panel"><h3>Airboy</h3><p><kbd>←</kbd> лево <kbd>→</kbd> десно <kbd>↑</kbd> скок</p></div>
            <div class="control-panel"><h3>Дополнително</h3><p><kbd>R</kbd> рестартирање на нивото <kbd>Esc</kbd> враќање во мени</p></div>
          </div>
          <p style="text-align:center;margin-top:18px;color:var(--muted);">
            Камерата автоматски го следи движењето на играчите и овозможува прегледност на нивото.
          </p>`
        )}

        <!-- СЛАЈД 9 -->
        ${section(
          'tech',
          'СЛАЈД 9',
          'Техничка Имплементација',
          'Како е изработена играта? Играта е организирана во посебни сцени и компоненти за полесно додавање нови нивоа и механики.',
          `<div class="implementation-grid">
            ${techStack.map((item) => `<span>${item}</span>`).join('')}
          </div>`
        )}

        <!-- СЛАЈД 10 -->
        ${section(
          'challenges',
          'СЛАЈД 10',
          'Предизвици и Решенија',
          'Што научивме? Главни предизвици:',
          `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;">
            ${challenges.map((c) => `<article class="presentation-card"><p style="margin:0;font-weight:800;">${c}</p></article>`).join('')}
          </div>
          <p style="text-align:center;margin-top:18px;color:var(--muted);">
            Решенијата беа постигнати преку постепено тестирање, оптимизација и редизајн на механиките.
          </p>`
        )}

        <!-- СЛАЈД 11 -->
        ${section(
          'result',
          'СЛАЈД 11',
          'Резултат',
          'Што е реализирано?',
          `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;">
            ${results.map((r) => `
              <article class="presentation-card" style="display:flex;align-items:center;gap:12px;">
                <span style="font-size:22px;">✅</span>
                <p style="margin:0;font-weight:800;">${r}</p>
              </article>
            `).join('')}
          </div>`
        )}

        <!-- СЛАЈД 12 -->
        <section class="conclusion-section reveal" id="thanks" style="display:block;text-align:center;">
          <h2 style="font-size:clamp(40px,6vw,72px);">Earthgirl &amp; Airboy</h2>
          <p style="font-style:italic;color:var(--muted);max-width:640px;margin:18px auto 30px;font-size:20px;">
            „Само преку соработка може да се стигне до излезот.“
          </p>
          <a class="primary-cta" href="/">Играј</a>
        </section>
      </main>
    </div>
  `;

  const revealItems = root.querySelectorAll('.reveal, .presentation-card, .level-card, .character-card, .screenshot-card, .flow-step');
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
