/* ═══════════════════════════════════════════════════════
   Card Art Generator — SVG Illustrations
   Rider-Waite: Scenic, symbolic, watercolor feel
   Thoth: Geometric, esoteric, sacred geometry
   ═══════════════════════════════════════════════════════ */

window.CardArt = (function () {

  // Color palettes
  const RW_PALETTE = {
    sky: ['#87CEEB', '#B0D4F1', '#6BA3D6', '#F5D6A8', '#E8B87A', '#D4A574'],
    earth: ['#8B7355', '#9CAF88', '#6B8E4E', '#A67B5B', '#C4A97D'],
    water: ['#5B8FA8', '#7FB3D8', '#4A7A8C', '#8EC5E0'],
    fire: ['#D4764E', '#E8A848', '#C45B3B', '#F0C060'],
    figure: '#5A4A3A',
    gold: '#C4A97D',
    cream: '#FAF0E0'
  };

  const THOTH_PALETTE = {
    primary: ['#2D1B4E', '#4A2D7A', '#6B3FA0', '#8E5BC0'],
    accent: ['#D4AF37', '#C9A227', '#E8C84A', '#B8960F'],
    cosmic: ['#1A0A2E', '#0D1B3E', '#162447', '#1F4068'],
    energy: ['#E84A5F', '#FF6B81', '#FF847C', '#E8575F'],
    glow: '#D4AF37',
    dark: '#0D0D1A'
  };

  // Element color mapping
  const ELEMENT_COLORS = {
    Fire: { rw: '#E8743A', thoth: '#E84A5F' },
    Water: { rw: '#5B8FA8', thoth: '#4A7A8C' },
    Air: { rw: '#B0C4DE', thoth: '#8888CC' },
    Earth: { rw: '#8B7355', thoth: '#6B8E4E' }
  };

  // Suit symbols for pip arrangement
  const SUIT_SYMBOLS = {
    wands: { shape: 'wand', color: '#8B5E3C' },
    cups: { shape: 'cup', color: '#5B8FA8' },
    swords: { shape: 'sword', color: '#708090' },
    pentacles: { shape: 'pentacle', color: '#C4A97D' }
  };

  // ── SVG Primitives ──

  function svgWand(x, y, scale) {
    const s = scale || 1;
    return `<line x1="${x}" y1="${y - 18 * s}" x2="${x}" y2="${y + 18 * s}" stroke="#8B5E3C" stroke-width="${2.5 * s}" stroke-linecap="round"/>
    <circle cx="${x}" cy="${y - 20 * s}" r="${3 * s}" fill="#6B8E4E"/>
    <line x1="${x - 4 * s}" y1="${y - 16 * s}" x2="${x + 4 * s}" y2="${y - 16 * s}" stroke="#6B8E4E" stroke-width="${1.5 * s}"/>`;
  }

  function svgCup(x, y, scale) {
    const s = scale || 1;
    return `<path d="M${x - 8 * s} ${y - 10 * s} Q${x - 10 * s} ${y + 5 * s} ${x} ${y + 12 * s} Q${x + 10 * s} ${y + 5 * s} ${x + 8 * s} ${y - 10 * s} Z" fill="#5B8FA8" opacity="0.8"/>
    <path d="M${x - 10 * s} ${y - 10 * s} L${x + 10 * s} ${y - 10 * s}" stroke="#4A7A8C" stroke-width="${2 * s}" stroke-linecap="round"/>
    <ellipse cx="${x}" cy="${y - 10 * s}" rx="${10 * s}" ry="${3 * s}" fill="#7FB3D8" opacity="0.5"/>`;
  }

  function svgSword(x, y, scale) {
    const s = scale || 1;
    return `<line x1="${x}" y1="${y - 22 * s}" x2="${x}" y2="${y + 14 * s}" stroke="#708090" stroke-width="${2 * s}"/>
    <line x1="${x - 8 * s}" y1="${y + 4 * s}" x2="${x + 8 * s}" y2="${y + 4 * s}" stroke="#708090" stroke-width="${2.5 * s}" stroke-linecap="round"/>
    <polygon points="${x},${y - 24 * s} ${x - 3 * s},${y - 18 * s} ${x + 3 * s},${y - 18 * s}" fill="#A0B0C0"/>`;
  }

  function svgPentacle(x, y, scale) {
    const s = scale || 1;
    const r = 10 * s;
    let points = '';
    for (let i = 0; i < 5; i++) {
      const angle = (i * 144 - 90) * Math.PI / 180;
      points += `${x + r * Math.cos(angle)},${y + r * Math.sin(angle)} `;
    }
    return `<circle cx="${x}" cy="${y}" r="${12 * s}" fill="none" stroke="#C4A97D" stroke-width="${2 * s}"/>
    <polygon points="${points.trim()}" fill="none" stroke="#C4A97D" stroke-width="${1.5 * s}"/>`;
  }

  function drawSuitSymbol(suit, x, y, scale) {
    switch (suit) {
      case 'wands': return svgWand(x, y, scale);
      case 'cups': return svgCup(x, y, scale);
      case 'swords': return svgSword(x, y, scale);
      case 'pentacles': return svgPentacle(x, y, scale);
      default: return '';
    }
  }

  // ── Pip Layout Positions ──
  function getPipPositions(count, w, h) {
    const cx = w / 2, cy = h / 2;
    const positions = {
      1: [[cx, cy]],
      2: [[cx, cy - 28], [cx, cy + 28]],
      3: [[cx, cy - 32], [cx, cy], [cx, cy + 32]],
      4: [[cx - 18, cy - 24], [cx + 18, cy - 24], [cx - 18, cy + 24], [cx + 18, cy + 24]],
      5: [[cx - 18, cy - 24], [cx + 18, cy - 24], [cx, cy], [cx - 18, cy + 24], [cx + 18, cy + 24]],
      6: [[cx - 18, cy - 28], [cx + 18, cy - 28], [cx - 18, cy], [cx + 18, cy], [cx - 18, cy + 28], [cx + 18, cy + 28]],
      7: [[cx - 18, cy - 28], [cx + 18, cy - 28], [cx - 18, cy], [cx + 18, cy], [cx, cy - 14], [cx - 18, cy + 28], [cx + 18, cy + 28]],
      8: [[cx - 18, cy - 32], [cx + 18, cy - 32], [cx - 18, cy - 10], [cx + 18, cy - 10], [cx - 18, cy + 12], [cx + 18, cy + 12], [cx - 18, cy + 34], [cx + 18, cy + 34]],
      9: [[cx - 18, cy - 32], [cx + 18, cy - 32], [cx - 18, cy - 10], [cx + 18, cy - 10], [cx, cy], [cx - 18, cy + 12], [cx + 18, cy + 12], [cx - 18, cy + 34], [cx + 18, cy + 34]],
      10: [[cx - 18, cy - 34], [cx + 18, cy - 34], [cx - 18, cy - 12], [cx + 18, cy - 12], [cx, cy - 22], [cx - 18, cy + 10], [cx + 18, cy + 10], [cx, cy + 22], [cx - 18, cy + 34], [cx + 18, cy + 34]]
    };
    return positions[count] || positions[1];
  }

  // ── Major Arcana RW SVG Scenes ──
  const MAJOR_RW_SCENES = {
    'major-0': function (w, h) { // The Fool
      return `<rect width="${w}" height="${h}" fill="#87CEEB"/>
        <rect y="${h * 0.6}" width="${w}" height="${h * 0.4}" fill="#8DAA7B"/>
        <circle cx="${w * 0.7}" cy="${h * 0.15}" r="14" fill="#F5D6A8"/>
        <path d="M${w * 0.35} ${h * 0.35} Q${w * 0.4} ${h * 0.25} ${w * 0.45} ${h * 0.35}" stroke="#5A4A3A" stroke-width="2" fill="none"/>
        <circle cx="${w * 0.4}" cy="${h * 0.3}" r="6" fill="#F5DEB3"/>
        <line x1="${w * 0.4}" y1="${h * 0.36}" x2="${w * 0.4}" y2="${h * 0.55}" stroke="#5A4A3A" stroke-width="2"/>
        <line x1="${w * 0.4}" y1="${h * 0.55}" x2="${w * 0.35}" y2="${h * 0.7}" stroke="#5A4A3A" stroke-width="2"/>
        <line x1="${w * 0.4}" y1="${h * 0.55}" x2="${w * 0.45}" y2="${h * 0.7}" stroke="#5A4A3A" stroke-width="2"/>
        <line x1="${w * 0.4}" y1="${h * 0.42}" x2="${w * 0.52}" y2="${h * 0.38}" stroke="#5A4A3A" stroke-width="1.5"/>
        <circle cx="${w * 0.55}" cy="${h * 0.38}" r="4" fill="none" stroke="#8B5E3C" stroke-width="1.5"/>
        <circle cx="${w * 0.58}" cy="${h * 0.58}" r="5" fill="#DDD" stroke="#AAA" stroke-width="1"/>
        <path d="M${w * 0.65} ${h * 0.62} L${w * 0.8} ${h * 0.58}" stroke="#9CAF88" stroke-width="6" stroke-linecap="round" opacity="0.3"/>
        <circle cx="${w * 0.25}" cy="${h * 0.48}" r="3" fill="white" opacity="0.7"/>
        <circle cx="${w * 0.6}" cy="${h * 0.2}" r="2" fill="white" opacity="0.5"/>
        <path d="M${w * 0.15} ${h * 0.55} Q${w * 0.3} ${h * 0.45} ${w * 0.5} ${h * 0.58}" stroke="#D4A0A0" stroke-width="1" fill="none" opacity="0.4"/>`;
    },
    'major-1': function (w, h) { // The Magician
      return `<rect width="${w}" height="${h}" fill="#F5D6A8"/>
        <rect y="${h * 0.7}" width="${w}" height="${h * 0.3}" fill="#8DAA7B"/>
        <text x="${w * 0.5}" y="${h * 0.12}" text-anchor="middle" font-size="14" fill="#C4A97D">∞</text>
        <circle cx="${w * 0.5}" cy="${h * 0.28}" r="6" fill="#F5DEB3"/>
        <line x1="${w * 0.5}" y1="${h * 0.34}" x2="${w * 0.5}" y2="${h * 0.55}" stroke="#C45B3B" stroke-width="2"/>
        <line x1="${w * 0.5}" y1="${h * 0.18}" x2="${w * 0.5}" y2="${h * 0.08}" stroke="#5A4A3A" stroke-width="1.5"/>
        <line x1="${w * 0.5}" y1="${h * 0.55}" x2="${w * 0.5}" y2="${h * 0.62}" stroke="#5A4A3A" stroke-width="1.5"/>
        <rect x="${w * 0.2}" y="${h * 0.6}" width="${w * 0.6}" height="${h * 0.06}" rx="2" fill="#8B7355" opacity="0.6"/>
        <circle cx="${w * 0.27}" cy="${h * 0.63}" r="3" fill="#C4A97D"/>
        <line x1="${w * 0.4}" y1="${h * 0.6}" x2="${w * 0.4}" y2="${h * 0.66}" stroke="#708090" stroke-width="1.5"/>
        <circle cx="${w * 0.57}" cy="${h * 0.63}" r="3" fill="#5B8FA8"/>
        <line x1="${w * 0.7}" y1="${h * 0.6}" x2="${w * 0.7}" y2="${h * 0.66}" stroke="#8B5E3C" stroke-width="2"/>
        <path d="M${w * 0.15} ${h * 0.75} Q${w * 0.5} ${h * 0.68} ${w * 0.85} ${h * 0.75}" stroke="#D4A0A0" fill="none" stroke-width="1" opacity="0.5"/>
        <circle cx="${w * 0.2}" cy="${h * 0.82}" r="2" fill="#D4A0A0" opacity="0.4"/>
        <circle cx="${w * 0.8}" cy="${h * 0.8}" r="2" fill="#D4A0A0" opacity="0.4"/>`;
    },
    'major-2': function (w, h) { // High Priestess
      return `<rect width="${w}" height="${h}" fill="#1A1A3E"/>
        <rect x="${w * 0.12}" y="${h * 0.1}" width="${w * 0.08}" height="${h * 0.6}" rx="3" fill="#2A2A4A"/>
        <text x="${w * 0.16}" y="${h * 0.18}" text-anchor="middle" font-size="7" fill="#888">B</text>
        <rect x="${w * 0.8}" y="${h * 0.1}" width="${w * 0.08}" height="${h * 0.6}" rx="3" fill="#DDD"/>
        <text x="${w * 0.84}" y="${h * 0.18}" text-anchor="middle" font-size="7" fill="#888">J</text>
        <circle cx="${w * 0.5}" cy="${h * 0.25}" r="6" fill="#E8D8C8"/>
        <line x1="${w * 0.5}" y1="${h * 0.31}" x2="${w * 0.5}" y2="${h * 0.55}" stroke="#6666AA" stroke-width="2"/>
        <rect x="${w * 0.38}" y="${h * 0.42}" width="${w * 0.24}" height="${h * 0.08}" rx="1" fill="#DDD" opacity="0.3"/>
        <path d="M${w * 0.3}" y="${h * 0.08} Q${w * 0.5} ${h * 0.02} ${w * 0.7} ${h * 0.08}" stroke="#C4A97D" fill="none" stroke-width="1"/>
        <circle cx="${w * 0.5}" cy="${h * 0.82}" r="8" fill="none" stroke="#B0C4DE" stroke-width="1" opacity="0.6"/>
        <path d="M${w * 0.44} ${h * 0.82} A6 6 0 0 1 ${w * 0.56} ${h * 0.82}" fill="#B0C4DE" opacity="0.4"/>`;
    },
    'major-3': function (w, h) { // The Empress
      return `<rect width="${w}" height="${h}" fill="#8DAA7B"/>
        <rect y="${h * 0.65}" width="${w}" height="${h * 0.35}" fill="#C4A97D"/>
        <path d="M0 ${h * 0.65} Q${w * 0.3} ${h * 0.55} ${w * 0.5} ${h * 0.63} Q${w * 0.7} ${h * 0.55} ${w} ${h * 0.65}" fill="#9CAF88"/>
        <circle cx="${w * 0.5}" cy="${h * 0.28}" r="6" fill="#F5DEB3"/>
        <path d="M${w * 0.42} ${h * 0.22} L${w * 0.5} ${h * 0.14} L${w * 0.58} ${h * 0.22}" stroke="#C4A97D" stroke-width="1.5" fill="none"/>
        <line x1="${w * 0.5}" y1="${h * 0.34}" x2="${w * 0.5}" y2="${h * 0.58}" stroke="#6B8E4E" stroke-width="2.5"/>
        <text x="${w * 0.5}" y="${h * 0.53}" text-anchor="middle" font-size="8" fill="#D4A0A0">♀</text>
        <circle cx="${w * 0.2}" cy="${h * 0.5}" r="3" fill="#E8A848" opacity="0.6"/>
        <circle cx="${w * 0.75}" cy="${h * 0.45}" r="4" fill="#D4A0A0" opacity="0.5"/>
        <path d="M${w * 0.1} ${h * 0.72} Q${w * 0.3} ${h * 0.68} ${w * 0.5} ${h * 0.72} Q${w * 0.7} ${h * 0.68} ${w * 0.9} ${h * 0.72}" stroke="#E8C84A" fill="none" stroke-width="1" opacity="0.4"/>`;
    },
    'major-4': function (w, h) { // The Emperor
      return `<rect width="${w}" height="${h}" fill="#D4764E" opacity="0.3"/>
        <rect width="${w}" height="${h}" fill="#E8B87A"/>
        <path d="M${w * 0.1} ${h * 0.3} L${w * 0.3} ${h * 0.05} L${w * 0.5} ${h * 0.2} L${w * 0.7} ${h * 0.05} L${w * 0.9} ${h * 0.3}" fill="#A67B5B" opacity="0.5"/>
        <rect x="${w * 0.3}" y="${h * 0.35}" width="${w * 0.4}" height="${h * 0.35}" rx="3" fill="#8B7355" opacity="0.4"/>
        <circle cx="${w * 0.5}" cy="${h * 0.4}" r="6" fill="#F5DEB3"/>
        <line x1="${w * 0.5}" y1="${h * 0.46}" x2="${w * 0.5}" y2="${h * 0.65}" stroke="#C45B3B" stroke-width="2"/>
        <circle cx="${w * 0.62}" cy="${h * 0.52}" r="4" fill="#C4A97D" opacity="0.6"/>
        <line x1="${w * 0.5}" y1="${h * 0.5}" x2="${w * 0.38}" y2="${h * 0.45}" stroke="#5A4A3A" stroke-width="1.5"/>
        <text x="${w * 0.5}" y="${h * 0.36}" text-anchor="middle" font-size="6" fill="#C4A97D">♈</text>`;
    }
  };

  // ── Generate a default major arcana scene ──
  function defaultMajorRW(card, w, h) {
    const elColor = ELEMENT_COLORS[card.element] ? ELEMENT_COLORS[card.element].rw : '#8B7355';
    const bgColors = {
      Fire: '#F5D6A8', Water: '#B0D4F1', Air: '#D4DCE8', Earth: '#D4C5A9'
    };
    const bg = bgColors[card.element] || '#E8DFC8';
    return `<rect width="${w}" height="${h}" fill="${bg}"/>
      <rect y="${h * 0.6}" width="${w}" height="${h * 0.4}" fill="${elColor}" opacity="0.15"/>
      <circle cx="${w * 0.5}" cy="${h * 0.35}" r="20" fill="none" stroke="${elColor}" stroke-width="1.5" opacity="0.4"/>
      <text x="${w * 0.5}" y="${h * 0.4}" text-anchor="middle" font-size="24" opacity="0.8">${card.symbol}</text>
      <circle cx="${w * 0.5}" cy="${h * 0.35}" r="28" fill="none" stroke="${elColor}" stroke-width="0.8" opacity="0.25"/>
      <path d="M${w * 0.15} ${h * 0.8} Q${w * 0.5} ${h * 0.7} ${w * 0.85} ${h * 0.8}" stroke="${elColor}" fill="none" stroke-width="1" opacity="0.3"/>`;
  }

  // ── Pip Cards (Ace through 10) RW ──
  function pipCardRW(card, w, h) {
    const suit = card.suit;
    const num = card.id.includes('ace') ? 1 : parseInt(card.id.split('-')[1]);
    const elColor = ELEMENT_COLORS[card.element] ? ELEMENT_COLORS[card.element].rw : '#8B7355';
    const bgColors = {
      wands: '#F5E6D0', cups: '#D8EAF0', swords: '#E0E4EA', pentacles: '#E8E0D0'
    };
    const bg = bgColors[suit] || '#EDE4D0';
    const positions = getPipPositions(num, w, h);
    const scale = num > 6 ? 0.6 : (num > 3 ? 0.7 : 0.85);

    let symbols = '';
    positions.forEach(([px, py]) => {
      symbols += drawSuitSymbol(suit, px, py, scale);
    });

    return `<rect width="${w}" height="${h}" fill="${bg}"/>
      <rect x="4" y="4" width="${w - 8}" height="${h - 8}" fill="none" stroke="${elColor}" stroke-width="0.5" opacity="0.3" rx="2"/>
      ${symbols}`;
  }

  // ── Court Cards RW ──
  function courtCardRW(card, w, h) {
    const suit = card.suit;
    const rank = card.id.split('-')[1]; // page, knight, queen, king
    const elColor = ELEMENT_COLORS[card.element] ? ELEMENT_COLORS[card.element].rw : '#8B7355';
    const bgColors = {
      wands: '#F5E6D0', cups: '#D8EAF0', swords: '#E0E4EA', pentacles: '#E8E0D0'
    };
    const bg = bgColors[suit] || '#EDE4D0';

    const figureColors = {
      page: '#7BA37B', knight: '#C45B3B', queen: '#5B8FA8', king: '#8B5E3C'
    };
    const fc = figureColors[rank] || '#5A4A3A';

    let throne = '';
    if (rank === 'queen' || rank === 'king') {
      throne = `<rect x="${w * 0.2}" y="${h * 0.3}" width="${w * 0.6}" height="${h * 0.45}" rx="4" fill="${elColor}" opacity="0.15"/>`;
    }
    let mount = '';
    if (rank === 'knight') {
      mount = `<ellipse cx="${w * 0.5}" cy="${h * 0.68}" rx="20" ry="12" fill="#A67B5B" opacity="0.4"/>`;
    }

    return `<rect width="${w}" height="${h}" fill="${bg}"/>
      ${throne}
      ${mount}
      <circle cx="${w * 0.5}" cy="${h * 0.28}" r="7" fill="#F5DEB3"/>
      <line x1="${w * 0.5}" y1="${h * 0.35}" x2="${w * 0.5}" y2="${h * 0.58}" stroke="${fc}" stroke-width="2.5"/>
      <line x1="${w * 0.5}" y1="${h * 0.58}" x2="${w * 0.42}" y2="${h * 0.72}" stroke="${fc}" stroke-width="2"/>
      <line x1="${w * 0.5}" y1="${h * 0.58}" x2="${w * 0.58}" y2="${h * 0.72}" stroke="${fc}" stroke-width="2"/>
      <line x1="${w * 0.5}" y1="${h * 0.42}" x2="${w * 0.35}" y2="${h * 0.38}" stroke="${fc}" stroke-width="1.5"/>
      ${drawSuitSymbol(suit, w * 0.32, h * 0.35, 0.7)}
      <rect x="4" y="4" width="${w - 8}" height="${h - 8}" fill="none" stroke="${elColor}" stroke-width="0.5" opacity="0.3" rx="2"/>`;
  }

  // ── Thoth Major Arcana ──
  function majorThoth(card, w, h) {
    const elColor = ELEMENT_COLORS[card.element] ? ELEMENT_COLORS[card.element].thoth : '#D4AF37';
    return `<rect width="${w}" height="${h}" fill="#1A0A2E"/>
      <circle cx="${w * 0.5}" cy="${h * 0.5}" r="35" fill="none" stroke="${elColor}" stroke-width="0.8" opacity="0.3"/>
      <circle cx="${w * 0.5}" cy="${h * 0.5}" r="25" fill="none" stroke="#D4AF37" stroke-width="1" opacity="0.5"/>
      <circle cx="${w * 0.5}" cy="${h * 0.5}" r="15" fill="${elColor}" opacity="0.15"/>
      <text x="${w * 0.5}" y="${h * 0.54}" text-anchor="middle" font-size="22" opacity="0.9">${card.symbol}</text>
      <line x1="${w * 0.5}" y1="${h * 0.08}" x2="${w * 0.5}" y2="${h * 0.92}" stroke="#D4AF37" stroke-width="0.5" opacity="0.2"/>
      <line x1="${w * 0.08}" y1="${h * 0.5}" x2="${w * 0.92}" y2="${h * 0.5}" stroke="#D4AF37" stroke-width="0.5" opacity="0.2"/>
      <line x1="${w * 0.15}" y1="${h * 0.15}" x2="${w * 0.85}" y2="${h * 0.85}" stroke="${elColor}" stroke-width="0.3" opacity="0.2"/>
      <line x1="${w * 0.85}" y1="${h * 0.15}" x2="${w * 0.15}" y2="${h * 0.85}" stroke="${elColor}" stroke-width="0.3" opacity="0.2"/>
      <polygon points="${w * 0.5},${h * 0.12} ${w * 0.82},${h * 0.68} ${w * 0.18},${h * 0.68}" fill="none" stroke="#D4AF37" stroke-width="0.6" opacity="0.25"/>
      <polygon points="${w * 0.5},${h * 0.88} ${w * 0.18},${h * 0.32} ${w * 0.82},${h * 0.32}" fill="none" stroke="#D4AF37" stroke-width="0.6" opacity="0.25"/>`;
  }

  // ── Thoth Pip Cards ──
  function pipCardThoth(card, w, h) {
    const suit = card.suit;
    const num = card.id.includes('ace') ? 1 : parseInt(card.id.split('-')[1]);
    const elColor = ELEMENT_COLORS[card.element] ? ELEMENT_COLORS[card.element].thoth : '#D4AF37';
    const positions = getPipPositions(num, w, h);
    const scale = num > 6 ? 0.55 : (num > 3 ? 0.65 : 0.8);

    let symbols = '';
    positions.forEach(([px, py]) => {
      symbols += drawSuitSymbol(suit, px, py, scale);
    });

    // Sacred geometry background
    let geo = '';
    for (let i = 0; i < 3; i++) {
      const r = 15 + i * 12;
      geo += `<circle cx="${w * 0.5}" cy="${h * 0.5}" r="${r}" fill="none" stroke="${elColor}" stroke-width="0.4" opacity="${0.15 - i * 0.03}"/>`;
    }

    return `<rect width="${w}" height="${h}" fill="#0D1B3E"/>
      ${geo}
      ${symbols}
      <rect x="3" y="3" width="${w - 6}" height="${h - 6}" fill="none" stroke="#D4AF37" stroke-width="0.5" opacity="0.3" rx="2"/>`;
  }

  // ── Thoth Court Cards ──
  function courtCardThoth(card, w, h) {
    const suit = card.suit;
    const elColor = ELEMENT_COLORS[card.element] ? ELEMENT_COLORS[card.element].thoth : '#D4AF37';

    return `<rect width="${w}" height="${h}" fill="#162447"/>
      <circle cx="${w * 0.5}" cy="${h * 0.4}" r="22" fill="none" stroke="#D4AF37" stroke-width="1" opacity="0.4"/>
      <circle cx="${w * 0.5}" cy="${h * 0.4}" r="12" fill="${elColor}" opacity="0.2"/>
      <text x="${w * 0.5}" y="${h * 0.44}" text-anchor="middle" font-size="18" opacity="0.85">${card.symbol}</text>
      ${drawSuitSymbol(suit, w * 0.5, h * 0.72, 0.8)}
      <polygon points="${w * 0.5},${h * 0.1} ${w * 0.8},${h * 0.55} ${w * 0.5},${h * 0.9} ${w * 0.2},${h * 0.55}" fill="none" stroke="#D4AF37" stroke-width="0.6" opacity="0.3"/>
      <rect x="3" y="3" width="${w - 6}" height="${h - 6}" fill="none" stroke="#D4AF37" stroke-width="0.5" opacity="0.3" rx="2"/>`;
  }

  // ── Public API ──

  function generateSVG(card, deck, width, height) {
    const w = width || 120;
    const h = height || 180;
    let inner = '';

    if (deck === 'thoth') {
      if (card.suit === 'major') {
        inner = majorThoth(card, w, h);
      } else if (card.type === 'court') {
        inner = courtCardThoth(card, w, h);
      } else {
        inner = pipCardThoth(card, w, h);
      }
    } else {
      // Rider-Waite
      if (card.suit === 'major') {
        const sceneFn = MAJOR_RW_SCENES[card.id];
        inner = sceneFn ? sceneFn(w, h) : defaultMajorRW(card, w, h);
      } else if (card.type === 'court') {
        inner = courtCardRW(card, w, h);
      } else {
        inner = pipCardRW(card, w, h);
      }
    }

    return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block;">${inner}</svg>`;
  }

  return { generateSVG };
})();
