import './presentation.css';

import airboySheetUrl from './assets/references/airboy-spritesheet.png';
import airDoorUrl from './assets/references/airdoor.png';
import boxUrl from './assets/references/box.png';
import cloudUrl from './assets/references/cloud.png';
import earthBtnUrl from './assets/references/earthbtn.png';
import earthDoorUrl from './assets/references/earthdoor.png';
import earthgirlSheetUrl from './assets/references/earthgirl-spritesheet.png';
import gateUrl from './assets/references/gate.png';
import gemsUrl from './assets/references/gems.png';
import lavaUrl from './assets/references/lava.png';
import liftUrl from './assets/references/lift.png';
import platformUrl from './assets/references/platform.png';
import specialEarthBtnUrl from './assets/references/specialearthbtn.png';
import wallUrl from './assets/references/wall.png';
import windUrl from './assets/references/windgenerator.png';

const steps = [
  'Choose level',
  'Control both characters',
  'Collect matching crystals',
  'Activate buttons',
  'Avoid lava',
  'Use lifts, gates, wind, and pillars',
  'Reach both doors',
  'Unlock next level'
];

const features = [
  ['2P', 'Local 2-player controls'],
  ['G', 'Crystal collection'],
  ['E/A', 'Character-specific collectibles'],
  ['B', 'Buttons and gates'],
  ['L', 'Moving platforms'],
  ['W', 'Wind generators'],
  ['P', 'Earth pillars'],
  ['!', 'Lava hazards'],
  ['3', 'Level unlocking'],
  ['✓', 'Win screen']
];

const levels = [
  ['Level 1', 'Earth Gate', 'Introductory cooperative puzzle with a gate and lift mechanic that teaches teamwork.'],
  ['Level 2', 'Wind Passage', 'Introduces wind generators, air-flow movement, buttons, bridges, and blockers.'],
  ['Level 3', 'Root Chamber', 'Focuses on Earthgirl, earth pillars, pushable objects, and advanced cooperation.']
];

const screenshots = ['Main Menu', 'Level 1', 'Level 2', 'Level 3', 'Win Screen'];

const mechanics = [
  ['Buttons', earthBtnUrl],
  ['Gates', gateUrl],
  ['Lifts', liftUrl],
  ['Wind', windUrl],
  ['Earth Switches', specialEarthBtnUrl],
  ['Clouds', cloudUrl],
  ['Pushable Box', boxUrl],
  ['Lava', lavaUrl]
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
  document.title = 'Earthgirl & Airboy Presentation';
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
          <a href="#idea">Idea</a>
          <a href="#levels">Levels</a>
          <a href="#implementation">Tech</a>
          <a class="nav-play" href="/">Play Game</a>
        </div>
      </nav>

      <header class="hero-section">
        <div class="hero-copy">
          <p class="eyebrow">Cooperative puzzle platformer</p>
          <h1>Earthgirl & Airboy</h1>
          <p class="subtitle">A 2D cooperative puzzle platformer inspired by Fireboy & Watergirl</p>
          <p class="hero-description">
            Two elemental characters must work together to solve puzzles, collect crystals,
            avoid hazards, and reach their own exits.
          </p>
          <div class="hero-actions">
            <a class="primary-cta" href="/">Play Game</a>
            <a class="secondary-cta" href="#flow">View Gameplay Flow</a>
          </div>
        </div>
        <div class="hero-showcase">
          <div class="character-orbit earth">
            <img src="${earthgirlSheetUrl}" alt="Earthgirl sprite sheet preview" />
          </div>
          <div class="character-orbit air">
            <img src="${airboySheetUrl}" alt="Airboy sprite sheet preview" />
          </div>
          <div class="temple-platform" style="background-image:url('${platformUrl}')"></div>
        </div>
      </header>

      <main>
        ${section(
          'idea',
          '01',
          'Project Idea',
          'The game is built around local cooperation. One player controls Earthgirl with WASD while the other controls Airboy with the arrow keys. Each character has responsibilities that make teamwork required, not optional.',
          `<div class="card-grid three">
            ${card('Local Co-op', 'Two characters are controlled on the same keyboard and must coordinate movement, buttons, and timing.')}
            ${card('Character Roles', 'Earthgirl and Airboy collect different crystals and interact with different elemental mechanics.')}
            ${card('Team Goal', 'Levels are solved when both characters reach their own doors after completing the shared puzzle.')}
          </div>`
        )}

        ${section(
          'inspiration',
          '02',
          'Inspiration',
          'Inspired by classic browser puzzle-platform games like Fireboy & Watergirl, redesigned with Earth and Air elements, custom characters, original mechanics, new levels, and a visual direction based on mossy fantasy temples.',
          `<div class="inspiration-showcase">
            <div class="classic-reference">
              <div class="reference-stage">
                <span class="fire-avatar">F</span>
                <span class="water-avatar">W</span>
                <div class="reference-platform"></div>
              </div>
              <p class="reference-label">Reference point: Fireboy & Watergirl style co-op puzzle platforming</p>
              <p class="reference-note">Use a licensed or professor-approved screenshot here if you want a direct image in the final deck.</p>
            </div>
            <div class="new-direction">
              <h3>What we changed</h3>
              <ul>
                <li>Earth and Air instead of Fire and Water</li>
                <li>Custom character sprite sheets</li>
                <li>Original temple assets and mechanics</li>
                <li>New level flow with wind, pillars, boxes, and clouds</li>
              </ul>
            </div>
          </div>`
        )}

        <section class="mechanics-strip reveal">
          <div class="section-heading">
            <span>Game Systems</span>
            <h2>Mechanics you can recognize immediately</h2>
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
          'Gameplay Flow',
          '',
          `<div class="flow-grid">
            ${steps.map((step, i) => `<div class="flow-step"><span>${i + 1}</span><p>${step}</p></div>`).join('')}
          </div>`
        )}

        ${section(
          'characters',
          '04',
          'Characters',
          '',
          `<div class="character-grid">
            <article class="character-card earth-card">
              <div class="sprite-strip"><img src="${earthgirlSheetUrl}" alt="Earthgirl poses" /></div>
              <h3>Earthgirl</h3>
              <p>Green and nature themed. She collects green crystals, activates earth buttons, and uses earth mechanics such as pillars and lifts.</p>
            </article>
            <article class="character-card air-card">
              <div class="sprite-strip"><img src="${airboySheetUrl}" alt="Airboy poses" /></div>
              <h3>Airboy</h3>
              <p>Blue and air themed. He collects blue crystals, activates air buttons, and uses wind generators and air-flow mechanics.</p>
            </article>
          </div>`
        )}

        ${section(
          'levels',
          '05',
          'Levels',
          '',
          `<div class="card-grid three">
            ${levels.map(([tag, title, text]) => `
              <article class="level-card level-${tag.slice(-1)}">
                <span>${tag}</span>
                <h3>${title}</h3>
                <p>${text}</p>
                <div class="level-visual">
                  <img src="${tag === 'Level 1' ? gateUrl : tag === 'Level 2' ? windUrl : boxUrl}" alt="" />
                </div>
              </article>
            `).join('')}
          </div>`
        )}

        ${section(
          'implementation',
          '06',
          'Implementation',
          'Earthgirl & Airboy is implemented in JavaScript with Phaser. The code uses a scene-based structure, reusable entities, custom assets, Arcade physics, collision handling, and level-specific puzzle logic separated from shared gameplay behavior.',
          `<div class="implementation-grid">
            ${['BaseLevelScene', 'Level scenes', 'Player entities', 'Buttons', 'Gates', 'Crystals', 'Doors', 'Hazards'].map((item) => `<span>${item}</span>`).join('')}
          </div>`
        )}

        ${section(
          'screenshots',
          '07',
          'Screenshots',
          'Placeholder frames are ready to replace with real gameplay screenshots later.',
          `<div class="screenshot-grid">
            ${screenshots.map((shot, i) => `
              <figure class="screenshot-card">
                <div class="shot-art ${i % 2 ? 'air-shot' : 'earth-shot'}">
                  <span class="shot-label">${shot}</span>
                  <img src="${i === 4 ? gemsUrl : i === 2 ? windUrl : i === 3 ? lavaUrl : platformUrl}" alt="" />
                </div>
                <figcaption>${shot}</figcaption>
              </figure>
            `).join('')}
          </div>`
        )}

        ${section(
          'features',
          '08',
          'Features',
          '',
          `<div class="feature-grid">
            ${features.map(([icon, text]) => `<div class="feature-card"><span>${icon}</span><p>${text}</p></div>`).join('')}
          </div>`
        )}

        ${section(
          'controls',
          '09',
          'Controls',
          '',
          `<div class="controls-grid">
            <div class="control-panel earth-panel"><h3>Earthgirl</h3><p><kbd>A</kbd> left <kbd>D</kbd> right <kbd>W</kbd> jump</p></div>
            <div class="control-panel air-panel"><h3>Airboy</h3><p><kbd>←</kbd> left <kbd>→</kbd> right <kbd>↑</kbd> jump</p></div>
            <div class="control-panel"><h3>Other</h3><p><kbd>R</kbd> restart level <kbd>Esc</kbd> return to menu</p></div>
          </div>`
        )}

        <section class="conclusion-section">
          <img src="${earthDoorUrl}" alt="" />
          <div>
            <h2>Conclusion</h2>
            <p>Earthgirl & Airboy demonstrates cooperative puzzle design, reusable game architecture, custom visual assets, and progressive level mechanics.</p>
            <a class="primary-cta" href="/">Play Game</a>
          </div>
          <img src="${airDoorUrl}" alt="" />
        </section>
      </main>
    </div>
  `;

  const revealItems = root.querySelectorAll('.reveal, .presentation-card, .level-card, .feature-card, .screenshot-card, .flow-step');
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
