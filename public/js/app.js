/* ═══════════════════════════════════════════════════════
   Bloom Tarot — Application Logic
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── State ──
  let currentDeck = 'rw'; // 'rw' or 'thoth'
  let currentLang = 'en'; // 'en' or 'zh'
  let currentSpread = [];
  let revealedCount = 0;
  let totalCards = 0;
  let currentPage = 'home';
  let dailyDrawn = false;

  // ── i18n Helpers ──
  function t(key) {
    const strings = window.I18N && window.I18N[currentLang];
    return (strings && strings[key]) || key;
  }

  function getCardTranslation(cardId) {
    if (currentLang !== 'zh') return null;
    const map = currentDeck === 'rw' ? window.CARDS_ZH_RW : window.CARDS_ZH_THOTH;
    return map && map[cardId] || null;
  }

  function getCardName(card) {
    const zh = getCardTranslation(card.id);
    if (zh) return zh.name || zh.thothTitle || card.name;
    if (currentDeck === 'thoth' && card.thothTitle) return card.thothTitle;
    return card.name;
  }

  function getCardKeywords(card) {
    const zh = getCardTranslation(card.id);
    return (zh && zh.keywords) || card.keywords;
  }

  function getCardUpright(card) {
    const zh = getCardTranslation(card.id);
    return (zh && zh.upright) || card.upright;
  }

  function getCardReversed(card) {
    const zh = getCardTranslation(card.id);
    return (zh && zh.reversed) || card.reversed;
  }

  function getCardSymbolism(card) {
    const zh = getCardTranslation(card.id);
    return (zh && zh.symbolism) || card.symbolism;
  }

  function applyI18n() {
    // Update html lang attribute
    document.documentElement.lang = currentLang === 'zh' ? 'zh-Hant' : 'en';

    // Update all data-i18n text elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = t(key);
      if (val && val !== key) el.textContent = val;
    });

    // Update all data-i18n-placeholder elements
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = t(key);
      if (val && val !== key) el.placeholder = val;
    });

    // Update logo
    const logo = document.querySelector('.logo');
    if (logo) {
      logo.innerHTML = currentLang === 'zh'
        ? "clarice's <span>塔羅</span>"
        : "clarice's <span>tarot</span>";
    }

    // Update footer logo
    const footerLogo = document.querySelector('.logo-small');
    if (footerLogo) {
      footerLogo.textContent = currentLang === 'zh'
        ? "clarice's tarot — 內在療癒"
        : "clarice's tarot — inner healing";
    }
  }

  function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.lang === lang);
    });
    applyI18n();

    // Re-render dynamic content for current page
    if (currentPage === 'library') renderLibrary();
    if (currentPage === 'journal') renderJournal();

    // If a reading is active, re-render the spread with translated labels
    if (currentPage === 'reading' && window._currentReadingType) {
      const type = window._currentReadingType;
      const labels = window._currentReadingLabels;
      // Update reading header
      const titleKeys = { single: 'title_single', three: 'title_three', celtic: 'title_celtic', choice: 'title_choice' };
      document.getElementById('readingTitle').textContent = t(titleKeys[type]);
      document.getElementById('readingDeckLabel').textContent = getDeckLabel();

      // Update card labels under each card
      const labelKeys = {
        single: ['pos_your_card'],
        three: ['pos_past', 'pos_present', 'pos_future'],
        celtic: ['pos_celtic_1','pos_celtic_2','pos_celtic_3','pos_celtic_4','pos_celtic_5','pos_celtic_6','pos_celtic_7','pos_celtic_8','pos_celtic_9','pos_celtic_10'],
        choice: ['pos_situation','pos_choice_a','pos_choice_b','pos_outcome_a','pos_outcome_b']
      };
      const newLabels = labelKeys[type].map(k => t(k));
      window._currentReadingLabels = newLabels;
      document.querySelectorAll('.card-label').forEach((el, i) => {
        if (newLabels[i]) el.textContent = newLabels[i];
      });

      // Update card front text for revealed cards
      document.querySelectorAll('.tarot-card[data-index]').forEach(cardEl => {
        const idx = parseInt(cardEl.dataset.index);
        const card = currentSpread[idx];
        if (card && cardEl.classList.contains('revealed')) {
          const front = cardEl.querySelector('.card-front');
          if (front) {
            const name = getCardName(card);
            const keywords = getCardKeywords(card);
            front.querySelector('.card-name').textContent = name;
            front.querySelector('.card-keyword').textContent = keywords[0];
            const revBadge = front.querySelector('.reversed-badge');
            if (revBadge) revBadge.textContent = t('card_reversed');
          }
        }
      });

      // Re-render interpretation cards
      const interpEl = document.getElementById('interpretation');
      if (interpEl && interpEl.children.length > 0) {
        interpEl.innerHTML = '';
        currentSpread.forEach((card, i) => {
          const cardEl = document.querySelector(`.tarot-card[data-index="${i}"]`);
          if (cardEl && cardEl.classList.contains('revealed')) {
            interpEl.innerHTML += buildInterpCard(card, newLabels[i]);
          }
        });
      }

      // Update subtitle
      if (revealedCount === totalCards) {
        document.getElementById('readingSubtitle').textContent = t('reading_complete');
      } else {
        document.getElementById('readingSubtitle').textContent = t('reading_tap');
      }
    }

    // If daily card was drawn, re-render it in new language
    if (dailyDrawn && window._dailyCard) {
      const card = window._dailyCard;
      const dailyCardEl = document.getElementById('dailyCard');
      const front = document.getElementById('dailyFront');
      if (front) {
        front.innerHTML = `
          <div class="card-numeral">${card.numeral}</div>
          <div class="card-symbol">${card.symbol}</div>
          <div class="card-name">${getCardName(card)}</div>
          <div class="card-keyword">${getCardKeywords(card)[0]}</div>
          ${card.isReversed ? `<div class="reversed-badge">${t('card_reversed')}</div>` : ''}
        `;
      }
      const msg = document.getElementById('dailyMessage');
      if (msg && msg.classList.contains('active')) {
        const noteVal = document.getElementById('dailyNote')?.value || '';
        msg.innerHTML = `
          ${buildInterpCard(card, t('daily_guidance'))}
          <div class="journal-note-area active" id="dailyNoteArea">
            <textarea id="dailyNote" placeholder="${t('daily_note_placeholder')}">${noteVal}</textarea>
            <div class="btn-group" style="margin-top:12px;">
              <button class="btn btn-sage btn-sm" onclick="window.BloomTarot.saveDailyToJournal()">${t('daily_save')}</button>
            </div>
          </div>
        `;
      }
    }

    showToast(t('toast_lang_switch'));
  }

  // ── Deck Access ──
  function getDeck() {
    return currentDeck === 'rw' ? window.DECK_RW : window.DECK_THOTH;
  }

  function getDeckLabel() {
    return currentDeck === 'rw' ? t('deck_rw') : t('deck_thoth');
  }

  // ── Shuffle Logic (Fisher-Yates, no duplicates) ──
  function drawCards(count) {
    const deck = [...getDeck()];
    const drawn = [];
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * deck.length);
      const card = { ...deck.splice(idx, 1)[0] };
      card.isReversed = Math.random() < 0.28;
      drawn.push(card);
    }
    return drawn;
  }

  // ── Navigation ──
  function navigate(page) {
    currentPage = page;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-links a').forEach(a => {
      a.classList.toggle('active', a.dataset.page === page);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (page === 'library') renderLibrary();
    if (page === 'journal') renderJournal();
  }

  // ── Deck Toggle ──
  function switchDeck(deck) {
    currentDeck = deck;
    document.querySelectorAll('.deck-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.deck === deck);
    });
    if (currentPage === 'library') renderLibrary();
    showToast(t('toast_deck_switch').replace('{deck}', getDeckLabel()));
  }

  // ── Toast ──
  function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
  }

  // ── Card HTML Builders ──
  function buildCardBack() {
    return `
      <div class="card-face card-back">
        <div class="card-back-pattern">
          <span class="star">✿</span>
          <span class="label">${t('card_bloom')}</span>
        </div>
      </div>`;
  }

  function buildCardFront(card) {
    const displayName = getCardName(card);
    const keywords = getCardKeywords(card);
    return `
      <div class="card-face card-front">
        <div class="card-numeral">${card.numeral}</div>
        <div class="card-symbol">${card.symbol}</div>
        <div class="card-name">${displayName}</div>
        <div class="card-keyword">${keywords[0]}</div>
        ${card.isReversed ? `<div class="reversed-badge">${t('card_reversed')}</div>` : ''}
      </div>`;
  }

  function buildInterpCard(card, positionLabel) {
    const meaning = card.isReversed ? getCardReversed(card) : getCardUpright(card);
    const displayName = getCardName(card);
    const keywords = getCardKeywords(card);
    const symbolism = getCardSymbolism(card);

    let extraInfo = '';
    if (currentDeck === 'thoth' && card.qabalah) {
      extraInfo = `<div class="qabalah-info">🌿 <strong>${t('modal_qabalah')}:</strong> ${card.qabalah} · <strong>${t('modal_astrology')}:</strong> ${card.astrology}</div>`;
    }

    return `
      <div class="interp-card">
        <span class="position-label">${positionLabel}</span>
        <h3>${card.symbol} ${displayName} ${card.isReversed ? `(${t('card_reversed')})` : ''}</h3>
        <span class="card-astro">${card.element || ''} ${card.astrology ? '· ' + card.astrology : ''}</span>
        <p class="meaning">${meaning}</p>
        <p class="symbolism-text">"${symbolism}"</p>
        <div class="keywords-list">${keywords.map(k => `<span>${k}</span>`).join('')}</div>
        ${extraInfo}
      </div>`;
  }

  // ── Daily Draw ──
  function initDailyDraw() {
    const slot = document.getElementById('dailyCard');
    if (!slot) return;
    slot.addEventListener('click', function () {
      if (dailyDrawn) return;
      dailyDrawn = true;

      const card = drawCards(1)[0];
      const front = document.getElementById('dailyFront');
      front.innerHTML = buildCardFront(card).replace('<div class="card-face card-front">', '').replace('</div>\n', '');
      // Re-render front properly
      const displayName = getCardName(card);
      const keywords = getCardKeywords(card);
      front.innerHTML = `
        <div class="card-numeral">${card.numeral}</div>
        <div class="card-symbol">${card.symbol}</div>
        <div class="card-name">${displayName}</div>
        <div class="card-keyword">${keywords[0]}</div>
        ${card.isReversed ? `<div class="reversed-badge">${t('card_reversed')}</div>` : ''}
      `;
      this.classList.add('revealed');

      setTimeout(() => {
        const msg = document.getElementById('dailyMessage');
        msg.innerHTML = `
          ${buildInterpCard(card, t('daily_guidance'))}
          <div class="journal-note-area" id="dailyNoteArea">
            <textarea id="dailyNote" placeholder="${t('daily_note_placeholder')}"></textarea>
            <div class="btn-group" style="margin-top:12px;">
              <button class="btn btn-sage btn-sm" onclick="window.BloomTarot.saveDailyToJournal()">${t('daily_save')}</button>
            </div>
          </div>
        `;
        msg.classList.add('active');
        document.getElementById('dailyNoteArea').classList.add('active');

        // Store for journal save
        window._dailyCard = card;
      }, 900);
    });
  }

  function saveDailyToJournal() {
    const card = window._dailyCard;
    if (!card) return;
    const note = document.getElementById('dailyNote')?.value || '';
    saveToJournal(t('daily_draw_label'), [card], note);
    showToast(t('toast_saved'));
  }

  // ── Start Reading ──
  function startReading(type) {
    navigate('reading');

    const spreadConfig = {
      single: { labels: [t('pos_your_card')], title: t('title_single'), subtitle: t('reading_tap') },
      three: { labels: [t('pos_past'), t('pos_present'), t('pos_future')], title: t('title_three'), subtitle: t('reading_tap') },
      celtic: {
        labels: [t('pos_celtic_1'), t('pos_celtic_2'), t('pos_celtic_3'), t('pos_celtic_4'), t('pos_celtic_5'), t('pos_celtic_6'), t('pos_celtic_7'), t('pos_celtic_8'), t('pos_celtic_9'), t('pos_celtic_10')],
        title: t('title_celtic'), subtitle: t('reading_tap')
      },
      choice: {
        labels: [t('pos_situation'), t('pos_choice_a'), t('pos_choice_b'), t('pos_outcome_a'), t('pos_outcome_b')],
        title: t('title_choice'), subtitle: t('reading_tap')
      }
    };

    const config = spreadConfig[type];
    totalCards = config.labels.length;
    currentSpread = drawCards(totalCards);
    revealedCount = 0;

    document.getElementById('readingTitle').textContent = config.title;
    document.getElementById('readingSubtitle').textContent = config.subtitle;
    document.getElementById('readingDeckLabel').textContent = getDeckLabel();

    const spreadEl = document.getElementById('cardSpread');
    const interpEl = document.getElementById('interpretation');
    interpEl.innerHTML = '';

    const isCeltic = type === 'celtic';
    spreadEl.className = isCeltic ? 'celtic-cross-layout shuffling' : 'card-spread shuffling';

    spreadEl.innerHTML = '';
    currentSpread.forEach((card, i) => {
      const wrapper = document.createElement('div');
      wrapper.className = isCeltic ? `tarot-card-wrapper celtic-pos-${i + 1}` : 'tarot-card-wrapper';
      wrapper.innerHTML = `
        <div class="tarot-card" data-index="${i}">
          <div class="card-inner">
            ${buildCardBack()}
            ${buildCardFront(card)}
          </div>
        </div>
        <div class="card-label">${config.labels[i]}</div>
      `;
      spreadEl.appendChild(wrapper);
    });

    // Remove shuffle animation after it plays
    setTimeout(() => spreadEl.classList.remove('shuffling'), 800);

    // Store type for reset
    window._currentReadingType = type;
    window._currentReadingLabels = config.labels;

    // Setup journal note area
    const noteArea = document.getElementById('readingNoteArea');
    noteArea.classList.remove('active');
    document.getElementById('readingNote').value = '';
    document.getElementById('readingNote').placeholder = t('reading_note_placeholder');
  }

  // ── Reveal Card ──
  function revealCard(cardEl) {
    if (cardEl.classList.contains('revealed')) return;
    const index = parseInt(cardEl.dataset.index);
    cardEl.classList.add('revealed');
    revealedCount++;

    const card = currentSpread[index];
    const labels = window._currentReadingLabels;
    const interpEl = document.getElementById('interpretation');

    interpEl.innerHTML += buildInterpCard(card, labels[index]);

    if (revealedCount === totalCards) {
      document.getElementById('readingSubtitle').textContent = t('reading_complete');
      document.getElementById('readingNoteArea').classList.add('active');
    }
  }

  function resetReading() {
    const type = window._currentReadingType || 'three';
    startReading(type);
  }

  function saveReadingToJournal() {
    const type = window._currentReadingType || 'Reading';
    const titles = { single: t('title_single'), three: t('title_three'), celtic: t('title_celtic'), choice: t('title_choice') };
    const note = document.getElementById('readingNote')?.value || '';
    saveToJournal(titles[type] || type, currentSpread, note);
    showToast(t('toast_reading_saved'));
  }

  // ── Journal (localStorage) ──
  function getJournal() {
    try {
      return JSON.parse(localStorage.getItem('bloom_tarot_journal') || '[]');
    } catch { return []; }
  }

  function saveToJournal(spreadName, cards, note) {
    const journal = getJournal();
    journal.unshift({
      id: Date.now(),
      date: new Date().toISOString(),
      deck: getDeckLabel(),
      spread: spreadName,
      cards: cards.map(c => ({
        name: getCardName(c),
        symbol: c.symbol,
        isReversed: c.isReversed,
        keywords: getCardKeywords(c)
      })),
      note: note
    });
    localStorage.setItem('bloom_tarot_journal', JSON.stringify(journal.slice(0, 100)));
  }

  function deleteJournalEntry(id) {
    const journal = getJournal().filter(e => e.id !== id);
    localStorage.setItem('bloom_tarot_journal', JSON.stringify(journal));
    renderJournal();
    showToast(t('toast_removed'));
  }

  function renderJournal() {
    const container = document.getElementById('journalEntries');
    const journal = getJournal();

    if (journal.length === 0) {
      container.innerHTML = `
        <div class="journal-empty">
          <span class="icon">${t('journal_empty_icon')}</span>
          <p>${t('journal_empty')}</p>
          <p style="font-size:0.85rem; margin-top:8px;">${t('journal_empty_hint')}</p>
        </div>`;
      return;
    }

    container.innerHTML = journal.map(entry => {
      const date = new Date(entry.date);
      const locale = currentLang === 'zh' ? 'zh-TW' : 'en-US';
      const dateStr = date.toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      return `
        <div class="glass-card-static journal-entry">
          <div class="je-date">${dateStr} · ${entry.deck}</div>
          <div class="je-spread">${entry.spread}</div>
          <div class="je-cards">
            ${entry.cards.map(c => `<span class="je-card-chip">${c.symbol} ${c.name}${c.isReversed ? ' ↺' : ''}</span>`).join('')}
          </div>
          ${entry.note ? `<div class="je-notes">"${entry.note}"</div>` : ''}
          <div class="je-actions">
            <button class="btn btn-sm btn-secondary" onclick="window.BloomTarot.deleteJournalEntry(${entry.id})">${t('journal_remove')}</button>
          </div>
        </div>`;
    }).join('');
  }

  // ── Card Library ──
  let libraryFilter = 'all';
  let librarySearch = '';

  function renderLibrary() {
    const deck = getDeck();
    const grid = document.getElementById('libraryGrid');
    const countEl = document.getElementById('libraryCount');

    let filtered = deck;

    if (libraryFilter !== 'all') {
      filtered = filtered.filter(c => {
        if (libraryFilter === 'major') return c.suit === 'major';
        if (libraryFilter === 'wands') return c.suit === 'wands';
        if (libraryFilter === 'cups') return c.suit === 'cups';
        if (libraryFilter === 'swords') return c.suit === 'swords';
        if (libraryFilter === 'pentacles') return c.suit === 'pentacles' || c.suit === 'disks';
        if (libraryFilter === 'court') return c.type === 'court';
        return true;
      });
    }

    if (librarySearch.trim()) {
      const q = librarySearch.toLowerCase();
      filtered = filtered.filter(c => {
        const zhTrans = getCardTranslation(c.id);
        return c.name.toLowerCase().includes(q) ||
          (c.thothTitle && c.thothTitle.toLowerCase().includes(q)) ||
          c.keywords.some(k => k.toLowerCase().includes(q)) ||
          (c.element && c.element.toLowerCase().includes(q)) ||
          (c.astrology && c.astrology.toLowerCase().includes(q)) ||
          (zhTrans && zhTrans.name && zhTrans.name.includes(q)) ||
          (zhTrans && zhTrans.keywords && zhTrans.keywords.some(k => k.includes(q)));
      });
    }

    countEl.textContent = `${t('library_showing')} ${filtered.length} ${t('library_of')} ${deck.length} ${t('library_cards')} · ${getDeckLabel()}`;

    grid.innerHTML = filtered.map(card => {
      const displayName = getCardName(card);
      const keywords = getCardKeywords(card);
      const suitLabel = card.suit === 'major' ? t('suit_major') :
        (t('suit_' + card.suit) || card.suit.charAt(0).toUpperCase() + card.suit.slice(1)) +
        (card.type === 'court' ? ` · ${t('suit_court')}` : ` · ${t('suit_minor')}`);
      return `
        <div class="glass-card library-card" onclick="window.BloomTarot.showCardDetail('${card.id}')">
          <div class="lib-header">
            <span class="lib-symbol">${card.symbol}</span>
            <div class="lib-info">
              <h4>${displayName}</h4>
              <span class="lib-suit">${suitLabel}</span>
            </div>
          </div>
          <div class="lib-keywords">
            ${keywords.map(k => `<span>${k}</span>`).join('')}
          </div>
        </div>`;
    }).join('');

    if (filtered.length === 0) {
      grid.innerHTML = `<p style="text-align:center;color:var(--text-light);grid-column:1/-1;padding:40px;">${t('library_no_results')}</p>`;
    }
  }

  function setLibraryFilter(filter) {
    libraryFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.filter === filter);
    });
    renderLibrary();
  }

  function setLibrarySearch(value) {
    librarySearch = value;
    renderLibrary();
  }

  // ── Card Detail Modal ──
  function showCardDetail(cardId) {
    const deck = getDeck();
    const card = deck.find(c => c.id === cardId);
    if (!card) return;

    const displayName = getCardName(card);
    const keywords = getCardKeywords(card);
    const suitLabel = card.suit === 'major' ? t('suit_major') :
      (t('suit_' + card.suit) || card.suit.charAt(0).toUpperCase() + card.suit.slice(1));

    const modal = document.getElementById('cardModal');
    document.getElementById('modalBody').innerHTML = `
      <button class="modal-close" onclick="window.BloomTarot.closeModal()">✕</button>
      <div class="modal-header">
        <span class="modal-symbol">${card.symbol}</span>
        <h2>${displayName}</h2>
        <span class="modal-subtitle">${card.numeral} · ${suitLabel} · ${getDeckLabel()}</span>
      </div>

      <div class="modal-section">
        <div class="detail-row"><span class="detail-label">${t('modal_element')}</span><span class="detail-value">${card.element || '—'}</span></div>
        <div class="detail-row"><span class="detail-label">${t('modal_astrology')}</span><span class="detail-value">${card.astrology || '—'}</span></div>
        ${card.qabalah ? `<div class="detail-row"><span class="detail-label">${t('modal_qabalah')}</span><span class="detail-value">${card.qabalah}</span></div>` : ''}
      </div>

      <div class="modal-section">
        <h4>${t('modal_upright')}</h4>
        <p>${getCardUpright(card)}</p>
      </div>

      <div class="modal-section">
        <h4>${t('modal_reversed')}</h4>
        <p>${getCardReversed(card)}</p>
      </div>

      <div class="modal-section">
        <h4>${t('modal_symbolism')}</h4>
        <p>${getCardSymbolism(card)}</p>
      </div>

      <div class="modal-section">
        <h4>${t('modal_keywords')}</h4>
        <div class="keywords-list">
          ${keywords.map(k => `<span>${k}</span>`).join('')}
        </div>
      </div>
    `;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    document.getElementById('cardModal').classList.remove('active');
    document.body.style.overflow = '';
  }

  // ── Floating Particles ──
  function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    const colors = ['#D4A0A0', '#B5C4A3', '#D4C5A9', '#E8C4C4', '#DCE6D4'];
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 6 + 3;
      p.style.cssText = `
        width:${size}px; height:${size}px;
        left:${Math.random() * 100}%;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        animation-duration:${Math.random() * 14 + 10}s;
        animation-delay:${Math.random() * 10}s;
      `;
      container.appendChild(p);
    }
  }

  // ── Scroll Fade-In Observer ──
  function observeFadeIns() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.12 });
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
  }

  // ── Event Delegation for Card Reveals ──
  document.addEventListener('click', function (e) {
    const card = e.target.closest('.tarot-card[data-index]');
    if (card && !card.classList.contains('revealed')) {
      revealCard(card);
    }
  });

  // ── Close modal on overlay click ──
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal-overlay')) {
      closeModal();
    }
  });

  // ── Keyboard: Escape closes modal ──
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  // ── Initialize ──
  function init() {
    createParticles();
    observeFadeIns();
    initDailyDraw();

    // Nav links
    document.querySelectorAll('.nav-links a').forEach(a => {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        navigate(this.dataset.page);
      });
    });

    // Deck toggle
    document.querySelectorAll('.deck-btn').forEach(b => {
      b.addEventListener('click', () => switchDeck(b.dataset.deck));
    });

    // Library search
    const searchBox = document.getElementById('librarySearch');
    if (searchBox) {
      searchBox.addEventListener('input', (e) => setLibrarySearch(e.target.value));
    }

    // Library filters
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.addEventListener('click', () => setLibraryFilter(b.dataset.filter));
    });

    // Lang toggle
    document.querySelectorAll('.lang-btn').forEach(b => {
      b.addEventListener('click', () => switchLang(b.dataset.lang));
    });

    // Logo click => home
    document.querySelector('.logo')?.addEventListener('click', () => navigate('home'));

    // Show home
    navigate('home');
  }

  // ── Public API ──
  window.BloomTarot = {
    navigate,
    switchDeck,
    switchLang,
    startReading,
    resetReading,
    saveReadingToJournal,
    saveDailyToJournal,
    showCardDetail,
    closeModal,
    deleteJournalEntry
  };

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
