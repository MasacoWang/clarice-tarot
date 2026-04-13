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
    pentacles: { shape: 'pentacle', color: '#C4A97D' },
    disks: { shape: 'disk', color: '#D4AF37' }
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

  function svgDisk(x, y, scale) {
    const s = scale || 1;
    const r = 11 * s;
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#D4AF37" stroke-width="${2 * s}"/>
    <circle cx="${x}" cy="${y}" r="${r * 0.6}" fill="none" stroke="#D4AF37" stroke-width="${1.2 * s}"/>
    <line x1="${x - r * 0.7}" y1="${y}" x2="${x + r * 0.7}" y2="${y}" stroke="#D4AF37" stroke-width="${1 * s}"/>
    <line x1="${x}" y1="${y - r * 0.7}" x2="${x}" y2="${y + r * 0.7}" stroke="#D4AF37" stroke-width="${1 * s}"/>`;
  }

  function drawSuitSymbol(suit, x, y, scale) {
    switch (suit) {
      case 'wands': return svgWand(x, y, scale);
      case 'cups': return svgCup(x, y, scale);
      case 'swords': return svgSword(x, y, scale);
      case 'pentacles': return svgPentacle(x, y, scale);
      case 'disks': return svgDisk(x, y, scale);
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

  // ── Generate a default major arcana scene (RW) ──
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
  // ── Thoth shared helpers ──
  function thothBg(w, h, bg1, bg2) {
    return `<defs><linearGradient id="tbg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${bg1}"/><stop offset="100%" stop-color="${bg2}"/>
    </linearGradient></defs><rect width="${w}" height="${h}" fill="url(#tbg)"/>`;
  }

  function thothFrame(w, h) {
    return `<rect x="3" y="3" width="${w - 6}" height="${h - 6}" fill="none" stroke="#D4AF37" stroke-width="0.7" opacity="0.35" rx="3"/>`;
  }

  function sacredCircles(cx, cy, count, maxR, color, opBase) {
    let s = '';
    for (let i = 0; i < count; i++) {
      const r = maxR * (i + 1) / count;
      s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="0.5" opacity="${opBase - i * 0.04}"/>`;
    }
    return s;
  }

  function radiatingLines(cx, cy, count, r1, r2, color, op) {
    let s = '';
    for (let i = 0; i < count; i++) {
      const a = (i * 360 / count) * Math.PI / 180;
      s += `<line x1="${cx + r1 * Math.cos(a)}" y1="${cy + r1 * Math.sin(a)}" x2="${cx + r2 * Math.cos(a)}" y2="${cy + r2 * Math.sin(a)}" stroke="${color}" stroke-width="0.4" opacity="${op}"/>`;
    }
    return s;
  }

  // ── Thoth Major Arcana Scenes ──
  const MAJOR_THOTH_SCENES = {

    'major-0': function (w, h) { // The Fool — spiral, tiger, crocodile, void leap
      const cx = w / 2, cy = h / 2;
      let spiral = '';
      for (let i = 0; i < 40; i++) {
        const a = i * 0.5;
        const r = 3 + i * 0.8;
        const x = cx + r * Math.cos(a);
        const y = cy * 0.55 + r * Math.sin(a);
        spiral += `<circle cx="${x}" cy="${y}" r="0.8" fill="#8888CC" opacity="${0.6 - i * 0.012}"/>`;
      }
      return `<rect width="${w}" height="${h}" fill="#0D0A1A"/>
        <rect y="${h * 0.75}" width="${w}" height="${h * 0.25}" fill="#0A1628" opacity="0.8"/>
        ${spiral}
        ${sacredCircles(cx, cy * 0.55, 4, 35, '#8888CC', 0.25)}
        <circle cx="${cx}" cy="${h * 0.25}" r="6" fill="#E8D8FF" opacity="0.9"/>
        <line x1="${cx}" y1="${h * 0.31}" x2="${cx}" y2="${h * 0.52}" stroke="#B8A0E0" stroke-width="1.5"/>
        <line x1="${cx}" y1="${h * 0.52}" x2="${cx - 6}" y2="${h * 0.65}" stroke="#B8A0E0" stroke-width="1.2"/>
        <line x1="${cx}" y1="${h * 0.52}" x2="${cx + 6}" y2="${h * 0.65}" stroke="#B8A0E0" stroke-width="1.2"/>
        <line x1="${cx}" y1="${h * 0.4}" x2="${cx + 12}" y2="${h * 0.35}" stroke="#B8A0E0" stroke-width="1"/>
        <line x1="${cx}" y1="${h * 0.4}" x2="${cx - 12}" y2="${h * 0.36}" stroke="#B8A0E0" stroke-width="1"/>
        <path d="M${w * 0.65} ${h * 0.6} Q${w * 0.72} ${h * 0.55} ${w * 0.78} ${h * 0.58} L${w * 0.74} ${h * 0.63} Z" fill="#E8A040" opacity="0.7"/>
        <path d="M${w * 0.68} ${h * 0.58} L${cx + 5} ${h * 0.6}" stroke="#E8A040" stroke-width="0.8" opacity="0.5"/>
        <path d="M${w * 0.2} ${h * 0.85} Q${w * 0.35} ${h * 0.78} ${w * 0.5} ${h * 0.82} Q${w * 0.65} ${h * 0.86} ${w * 0.8} ${h * 0.83}" stroke="#4A8060" stroke-width="2" fill="none" opacity="0.6"/>
        <circle cx="${w * 0.35}" cy="${h * 0.84}" r="2" fill="#4A8060" opacity="0.5"/>
        <text x="${cx}" y="${h * 0.95}" text-anchor="middle" font-size="4" fill="#D4AF37" opacity="0.5">0 · THE FOOL</text>
        ${thothFrame(w, h)}`;
    },

    'major-1': function (w, h) { // The Magus — caduceus, juggling, dharma wheel
      const cx = w / 2, cy = h / 2;
      return `<rect width="${w}" height="${h}" fill="#0D0A1A"/>
        ${radiatingLines(cx, cy * 0.6, 12, 8, 38, '#8888CC', 0.2)}
        <line x1="${cx}" y1="${h * 0.12}" x2="${cx}" y2="${h * 0.75}" stroke="#D4AF37" stroke-width="1.5" opacity="0.6"/>
        <circle cx="${cx}" cy="${h * 0.12}" r="4" fill="none" stroke="#D4AF37" stroke-width="1"/>
        <path d="M${cx - 6} ${h * 0.2} Q${cx} ${h * 0.28} ${cx + 6} ${h * 0.2}" stroke="#8888CC" stroke-width="0.8" fill="none"/>
        <path d="M${cx + 6} ${h * 0.28} Q${cx} ${h * 0.36} ${cx - 6} ${h * 0.28}" stroke="#8888CC" stroke-width="0.8" fill="none"/>
        <path d="M${cx - 6} ${h * 0.36} Q${cx} ${h * 0.44} ${cx + 6} ${h * 0.36}" stroke="#E84A5F" stroke-width="0.8" fill="none"/>
        <circle cx="${cx}" cy="${h * 0.25}" r="6" fill="#E8D8FF" opacity="0.85"/>
        <line x1="${cx}" y1="${h * 0.31}" x2="${cx}" y2="${h * 0.52}" stroke="#D0C0F0" stroke-width="1.5"/>
        <line x1="${cx - 15}" y1="${h * 0.38}" x2="${cx + 15}" y2="${h * 0.38}" stroke="#D0C0F0" stroke-width="1"/>
        <circle cx="${cx - 18}" cy="${h * 0.38}" r="3" fill="#E84A5F" opacity="0.7"/>
        <circle cx="${cx + 18}" cy="${h * 0.38}" r="3" fill="#4A7A8C" opacity="0.7"/>
        <circle cx="${cx - 8}" cy="${h * 0.3}" r="2.5" fill="#D4AF37" opacity="0.6"/>
        <circle cx="${cx + 8}" cy="${h * 0.3}" r="2.5" fill="#8888CC" opacity="0.6"/>
        <circle cx="${cx}" cy="${h * 0.7}" r="12" fill="none" stroke="#D4AF37" stroke-width="1" opacity="0.5"/>
        ${radiatingLines(cx, h * 0.7, 8, 8, 12, '#D4AF37', 0.4)}
        <text x="${cx}" y="${h * 0.95}" text-anchor="middle" font-size="4" fill="#D4AF37" opacity="0.5">I · THE MAGUS</text>
        ${thothFrame(w, h)}`;
    },

    'major-2': function (w, h) { // The Priestess — veil, web of light, crystals, lunar path
      const cx = w / 2, cy = h / 2;
      let web = '';
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        web += `<line x1="${cx}" y1="${cy * 0.7}" x2="${cx + 40 * Math.cos(a)}" y2="${cy * 0.7 + 40 * Math.sin(a)}" stroke="#6688CC" stroke-width="0.3" opacity="0.25"/>`;
      }
      for (let r = 10; r <= 35; r += 8) {
        web += `<circle cx="${cx}" cy="${cy * 0.7}" r="${r}" fill="none" stroke="#6688CC" stroke-width="0.3" opacity="0.2"/>`;
      }
      return `<rect width="${w}" height="${h}" fill="#0A0820"/>
        ${web}
        <path d="M${w * 0.3} ${h * 0.05} Q${cx} ${h * 0.15} ${w * 0.7} ${h * 0.05}" stroke="#4455AA" stroke-width="0.6" fill="none" opacity="0.4"/>
        <path d="M${w * 0.2} ${h * 0.02} L${w * 0.2} ${h * 0.65}" stroke="#4455AA" stroke-width="0.4" stroke-dasharray="2,3" opacity="0.3"/>
        <path d="M${w * 0.8} ${h * 0.02} L${w * 0.8} ${h * 0.65}" stroke="#4455AA" stroke-width="0.4" stroke-dasharray="2,3" opacity="0.3"/>
        <circle cx="${cx}" cy="${h * 0.28}" r="6" fill="#C8D8F0" opacity="0.9"/>
        <line x1="${cx}" y1="${h * 0.34}" x2="${cx}" y2="${h * 0.55}" stroke="#8899CC" stroke-width="1.5"/>
        <path d="M${cx - 10} ${h * 0.2} A10 10 0 0 1 ${cx + 10} ${h * 0.2}" fill="none" stroke="#B8C8E8" stroke-width="1" opacity="0.6"/>
        <polygon points="${cx - 5},${h * 0.62} ${cx},${h * 0.56} ${cx + 5},${h * 0.62}" fill="#88AADD" opacity="0.3"/>
        <polygon points="${cx - 8},${h * 0.68} ${cx - 3},${h * 0.62} ${cx + 2},${h * 0.68}" fill="#7799CC" opacity="0.25"/>
        <circle cx="${cx}" cy="${h * 0.8}" r="8" fill="none" stroke="#B8C8E8" stroke-width="1" opacity="0.5"/>
        <path d="M${cx - 5} ${h * 0.8} A5 5 0 0 1 ${cx + 5} ${h * 0.8}" fill="#B8C8E8" opacity="0.3"/>
        <line x1="${cx}" y1="${h * 0.6}" x2="${cx}" y2="${h * 0.72}" stroke="#8899CC" stroke-width="0.6" stroke-dasharray="1,2" opacity="0.4"/>
        <text x="${cx}" y="${h * 0.95}" text-anchor="middle" font-size="4" fill="#D4AF37" opacity="0.5">II · THE PRIESTESS</text>
        ${thothFrame(w, h)}`;
    },
    'major-3': function (w, h) { // The Empress — pelican, lotus, Venus, abundance
      const cx = w / 2, cy = h / 2;
      return `<rect width="${w}" height="${h}" fill="#0A1A0A"/>
        <rect y="${h * 0.6}" width="${w}" height="${h * 0.4}" fill="#0A200A" opacity="0.6"/>
        ${sacredCircles(cx, cy, 3, 40, '#6B8E4E', 0.15)}
        <path d="M${cx} ${h * 0.55} Q${cx - 8} ${h * 0.48} ${cx - 4} ${h * 0.42} Q${cx} ${h * 0.38} ${cx + 4} ${h * 0.42} Q${cx + 8} ${h * 0.48} ${cx} ${h * 0.55}" fill="#D070A0" opacity="0.4"/>
        <path d="M${cx - 12} ${h * 0.52} Q${cx} ${h * 0.42} ${cx + 12} ${h * 0.52}" fill="none" stroke="#D070A0" stroke-width="0.8" opacity="0.5"/>
        <path d="M${cx - 16} ${h * 0.56} Q${cx} ${h * 0.44} ${cx + 16} ${h * 0.56}" fill="none" stroke="#D070A0" stroke-width="0.6" opacity="0.35"/>
        <text x="${cx}" y="${h * 0.28}" text-anchor="middle" font-size="14" fill="#D4AF37" opacity="0.7">♀</text>
        <circle cx="${cx}" cy="${h * 0.2}" r="6" fill="#E8D0C0" opacity="0.85"/>
        <line x1="${cx}" y1="${h * 0.26}" x2="${cx}" y2="${h * 0.4}" stroke="#A0D0A0" stroke-width="1.5"/>
        <path d="M${w * 0.2} ${h * 0.32} Q${w * 0.28} ${h * 0.25} ${w * 0.35} ${h * 0.3}" stroke="#8B7355" stroke-width="1" fill="none" opacity="0.6"/>
        <circle cx="${w * 0.27}" cy="${h * 0.28}" r="4" fill="none" stroke="#8B7355" stroke-width="0.8" opacity="0.5"/>
        <path d="M${w * 0.15} ${h * 0.68} Q${w * 0.3} ${h * 0.62} ${cx} ${h * 0.66} Q${w * 0.7} ${h * 0.62} ${w * 0.85} ${h * 0.68}" stroke="#6B8E4E" stroke-width="1.2" fill="none" opacity="0.4"/>
        <circle cx="${w * 0.75}" cy="${h * 0.35}" r="3" fill="#E8C84A" opacity="0.4"/>
        <circle cx="${w * 0.25}" cy="${h * 0.45}" r="2" fill="#E8C84A" opacity="0.3"/>
        <text x="${cx}" y="${h * 0.95}" text-anchor="middle" font-size="4" fill="#D4AF37" opacity="0.5">III · THE EMPRESS</text>
        ${thothFrame(w, h)}`;
    },

    'major-4': function (w, h) { // The Emperor — ram heads, fire, Aries, scepter
      const cx = w / 2, cy = h / 2;
      return `<rect width="${w}" height="${h}" fill="#1A0808"/>
        ${radiatingLines(cx, cy * 0.5, 16, 5, 42, '#E84A5F', 0.12)}
        <rect x="${w * 0.25}" y="${h * 0.35}" width="${w * 0.5}" height="${h * 0.4}" rx="2" fill="#E84A5F" opacity="0.08"/>
        <polygon points="${w * 0.3},${h * 0.38} ${cx},${h * 0.28} ${w * 0.7},${h * 0.38}" fill="none" stroke="#E84A5F" stroke-width="0.8" opacity="0.4"/>
        <circle cx="${cx}" cy="${h * 0.32}" r="6" fill="#F0D0C0" opacity="0.9"/>
        <line x1="${cx}" y1="${h * 0.38}" x2="${cx}" y2="${h * 0.58}" stroke="#E84A5F" stroke-width="2"/>
        <text x="${cx}" y="${h * 0.2}" text-anchor="middle" font-size="12" fill="#E84A5F" opacity="0.8">♈</text>
        <path d="M${w * 0.18} ${h * 0.3} Q${w * 0.22} ${h * 0.22} ${w * 0.28} ${h * 0.28}" stroke="#D4AF37" stroke-width="1" fill="none" opacity="0.5"/>
        <path d="M${w * 0.82} ${h * 0.3} Q${w * 0.78} ${h * 0.22} ${w * 0.72} ${h * 0.28}" stroke="#D4AF37" stroke-width="1" fill="none" opacity="0.5"/>
        <circle cx="${w * 0.22}" cy="${h * 0.28}" r="3" fill="#D4AF37" opacity="0.3"/>
        <circle cx="${w * 0.78}" cy="${h * 0.28}" r="3" fill="#D4AF37" opacity="0.3"/>
        <line x1="${cx + 12}" y1="${h * 0.42}" x2="${cx + 12}" y2="${h * 0.22}" stroke="#D4AF37" stroke-width="1.5" opacity="0.6"/>
        <circle cx="${cx + 12}" cy="${h * 0.2}" r="3" fill="#D4AF37" opacity="0.4"/>
        <circle cx="${cx - 10}" cy="${h * 0.5}" r="5" fill="none" stroke="#D4AF37" stroke-width="0.8" opacity="0.4"/>
        <text x="${cx}" y="${h * 0.95}" text-anchor="middle" font-size="4" fill="#D4AF37" opacity="0.5">IV · THE EMPEROR</text>
        ${thothFrame(w, h)}`;
    },

    'major-5': function (w, h) { // The Hierophant — pentagram window, bull, pillars, key
      const cx = w / 2, cy = h / 2;
      const r = 18;
      let star = '';
      for (let i = 0; i < 5; i++) {
        const a1 = (i * 144 - 90) * Math.PI / 180;
        const a2 = ((i + 1) * 144 - 90) * Math.PI / 180;
        star += `<line x1="${cx + r * Math.cos(a1)}" y1="${cy * 0.55 + r * Math.sin(a1)}" x2="${cx + r * Math.cos(a2)}" y2="${cy * 0.55 + r * Math.sin(a2)}" stroke="#D4AF37" stroke-width="0.8" opacity="0.5"/>`;
      }
      return `<rect width="${w}" height="${h}" fill="#0A1408"/>
        <rect x="${w * 0.1}" y="${h * 0.06}" width="${w * 0.06}" height="${h * 0.7}" rx="2" fill="#3A5A3A" opacity="0.5"/>
        <rect x="${w * 0.84}" y="${h * 0.06}" width="${w * 0.06}" height="${h * 0.7}" rx="2" fill="#3A5A3A" opacity="0.5"/>
        <circle cx="${cx}" cy="${cy * 0.55}" r="22" fill="none" stroke="#D4AF37" stroke-width="0.6" opacity="0.3"/>
        ${star}
        <circle cx="${cx}" cy="${h * 0.28}" r="6" fill="#E8D8C0" opacity="0.85"/>
        <line x1="${cx}" y1="${h * 0.34}" x2="${cx}" y2="${h * 0.55}" stroke="#6B8E4E" stroke-width="1.5"/>
        <path d="M${w * 0.3} ${h * 0.7} Q${w * 0.35} ${h * 0.65} ${w * 0.42} ${h * 0.7}" stroke="#8B7355" stroke-width="1.5" fill="none" opacity="0.5"/>
        <circle cx="${w * 0.36}" cy="${h * 0.68}" r="4" fill="#8B7355" opacity="0.25"/>
        <text x="${cx}" y="${h * 0.82}" text-anchor="middle" font-size="10" fill="#D4AF37" opacity="0.6">🔑</text>
        <text x="${cx}" y="${h * 0.95}" text-anchor="middle" font-size="4" fill="#D4AF37" opacity="0.5">V · THE HIEROPHANT</text>
        ${thothFrame(w, h)}`;
    },

    'major-6': function (w, h) { // The Lovers — twin figures, angel, serpent, sword, union
      const cx = w / 2, cy = h / 2;
      return `<rect width="${w}" height="${h}" fill="#0D0A1A"/>
        ${sacredCircles(cx, cy * 0.5, 3, 30, '#8888CC', 0.2)}
        <polygon points="${cx},${h * 0.08} ${cx - 8},${h * 0.2} ${cx + 8},${h * 0.2}" fill="#D4AF37" opacity="0.15"/>
        <line x1="${cx - 4}" y1="${h * 0.16}" x2="${cx - 12}" y2="${h * 0.12}" stroke="#D4AF37" stroke-width="0.6" opacity="0.4"/>
        <line x1="${cx + 4}" y1="${h * 0.16}" x2="${cx + 12}" y2="${h * 0.12}" stroke="#D4AF37" stroke-width="0.6" opacity="0.4"/>
        <circle cx="${cx}" cy="${h * 0.14}" r="3" fill="#E8D8FF" opacity="0.7"/>
        <circle cx="${cx - 14}" cy="${h * 0.42}" r="5" fill="#D0C0F0" opacity="0.8"/>
        <line x1="${cx - 14}" y1="${h * 0.47}" x2="${cx - 14}" y2="${h * 0.62}" stroke="#B8A0E0" stroke-width="1.2"/>
        <line x1="${cx - 14}" y1="${h * 0.62}" x2="${cx - 18}" y2="${h * 0.72}" stroke="#B8A0E0" stroke-width="1"/>
        <line x1="${cx - 14}" y1="${h * 0.62}" x2="${cx - 10}" y2="${h * 0.72}" stroke="#B8A0E0" stroke-width="1"/>
        <circle cx="${cx + 14}" cy="${h * 0.42}" r="5" fill="#F0D0D0" opacity="0.8"/>
        <line x1="${cx + 14}" y1="${h * 0.47}" x2="${cx + 14}" y2="${h * 0.62}" stroke="#E0A0A0" stroke-width="1.2"/>
        <line x1="${cx + 14}" y1="${h * 0.62}" x2="${cx + 10}" y2="${h * 0.72}" stroke="#E0A0A0" stroke-width="1"/>
        <line x1="${cx + 14}" y1="${h * 0.62}" x2="${cx + 18}" y2="${h * 0.72}" stroke="#E0A0A0" stroke-width="1"/>
        <path d="M${cx - 5} ${h * 0.75} Q${cx} ${h * 0.65} ${cx + 5} ${h * 0.75}" stroke="#E84A5F" stroke-width="0.8" fill="none" opacity="0.5"/>
        <line x1="${cx}" y1="${h * 0.22}" x2="${cx}" y2="${h * 0.38}" stroke="#708090" stroke-width="1" opacity="0.4"/>
        <polygon points="${cx},${h * 0.2} ${cx - 2},${h * 0.24} ${cx + 2},${h * 0.24}" fill="#A0B0C0" opacity="0.4"/>
        <path d="M${w * 0.3} ${h * 0.82} Q${cx} ${h * 0.76} ${w * 0.7} ${h * 0.82}" stroke="#4A8060" stroke-width="1" fill="none" opacity="0.4"/>
        <text x="${cx}" y="${h * 0.95}" text-anchor="middle" font-size="4" fill="#D4AF37" opacity="0.5">VI · THE LOVERS</text>
        ${thothFrame(w, h)}`;
    },
    'major-7': function (w, h) { // The Chariot — grail, four sphinxes, canopy of stars
      const cx = w / 2, cy = h / 2;
      let stars = '';
      for (let i = 0; i < 12; i++) {
        const sx = 10 + Math.random() * (w - 20);
        const sy = 8 + i * 4;
        stars += `<circle cx="${sx}" cy="${sy}" r="0.8" fill="#E8C84A" opacity="${0.3 + Math.random() * 0.4}"/>`;
      }
      return `<rect width="${w}" height="${h}" fill="#0A0A28"/>
        ${stars}
        <path d="M${w * 0.1} ${h * 0.25} Q${cx} ${h * 0.08} ${w * 0.9} ${h * 0.25}" stroke="#4A7A8C" stroke-width="1" fill="#0A0A28" opacity="0.6"/>
        <rect x="${w * 0.2}" y="${h * 0.55}" width="${w * 0.6}" height="${h * 0.25}" rx="3" fill="#1A1A3E" stroke="#D4AF37" stroke-width="0.6" opacity="0.5"/>
        <circle cx="${cx}" cy="${h * 0.35}" r="6" fill="#E0D8F0" opacity="0.9"/>
        <line x1="${cx}" y1="${h * 0.41}" x2="${cx}" y2="${h * 0.55}" stroke="#4A7A8C" stroke-width="1.5"/>
        <path d="M${cx - 6} ${h * 0.48} Q${cx} ${h * 0.42} ${cx + 6} ${h * 0.48}" fill="#4A7A8C" opacity="0.4"/>
        <ellipse cx="${w * 0.22}" cy="${h * 0.72}" rx="6" ry="4" fill="#D4AF37" opacity="0.2"/>
        <ellipse cx="${w * 0.38}" cy="${h * 0.75}" rx="6" ry="4" fill="#D4AF37" opacity="0.2"/>
        <ellipse cx="${w * 0.62}" cy="${h * 0.75}" rx="6" ry="4" fill="#D4AF37" opacity="0.2"/>
        <ellipse cx="${w * 0.78}" cy="${h * 0.72}" rx="6" ry="4" fill="#D4AF37" opacity="0.2"/>
        <circle cx="${w * 0.22}" cy="${h * 0.7}" r="3" fill="#E8C84A" opacity="0.3"/>
        <circle cx="${w * 0.78}" cy="${h * 0.7}" r="3" fill="#E8C84A" opacity="0.3"/>
        <text x="${cx}" y="${h * 0.95}" text-anchor="middle" font-size="4" fill="#D4AF37" opacity="0.5">VII · THE CHARIOT</text>
        ${thothFrame(w, h)}`;
    },

    'major-8': function (w, h) { // Adjustment — scales, diamonds, feather, sword, balance
      const cx = w / 2, cy = h / 2;
      return `<rect width="${w}" height="${h}" fill="#0D0A1A"/>
        ${sacredCircles(cx, cy * 0.6, 4, 38, '#8888CC', 0.18)}
        <circle cx="${cx}" cy="${h * 0.26}" r="5" fill="#D8D0F0" opacity="0.9"/>
        <line x1="${cx}" y1="${h * 0.31}" x2="${cx}" y2="${h * 0.55}" stroke="#8888CC" stroke-width="1.5"/>
        <line x1="${cx}" y1="${h * 0.55}" x2="${cx - 25}" y2="${h * 0.55}" stroke="#D4AF37" stroke-width="1"/>
        <line x1="${cx}" y1="${h * 0.55}" x2="${cx + 25}" y2="${h * 0.55}" stroke="#D4AF37" stroke-width="1"/>
        <path d="M${cx - 30} ${h * 0.55} Q${cx - 25} ${h * 0.6} ${cx - 20} ${h * 0.55}" stroke="#D4AF37" stroke-width="0.8" fill="none"/>
        <path d="M${cx + 20} ${h * 0.55} Q${cx + 25} ${h * 0.6} ${cx + 30} ${h * 0.55}" stroke="#D4AF37" stroke-width="0.8" fill="none"/>
        <polygon points="${cx},${h * 0.35} ${cx + 10},${cy} ${cx},${h * 0.65} ${cx - 10},${cy}" fill="none" stroke="#8888CC" stroke-width="0.6" opacity="0.4"/>
        <polygon points="${cx},${h * 0.3} ${cx + 14},${cy * 0.95} ${cx},${h * 0.7} ${cx - 14},${cy * 0.95}" fill="none" stroke="#D4AF37" stroke-width="0.5" opacity="0.25"/>
        <line x1="${cx - 3}" y1="${h * 0.14}" x2="${cx}" y2="${h * 0.2}" stroke="#8888CC" stroke-width="0.6" opacity="0.6"/>
        <line x1="${cx + 3}" y1="${h * 0.14}" x2="${cx}" y2="${h * 0.2}" stroke="#8888CC" stroke-width="0.6" opacity="0.6"/>
        <line x1="${cx}" y1="${h * 0.06}" x2="${cx}" y2="${h * 0.2}" stroke="#708090" stroke-width="0.8" opacity="0.5"/>
        <text x="${cx}" y="${h * 0.82}" text-anchor="middle" font-size="10" fill="#D4AF37" opacity="0.6">⚖</text>
        <text x="${cx}" y="${h * 0.95}" text-anchor="middle" font-size="4" fill="#D4AF37" opacity="0.5">VIII · ADJUSTMENT</text>
        ${thothFrame(w, h)}`;
    },

    'major-9': function (w, h) { // The Hermit — lantern, wheat, serpent, mountain
      const cx = w / 2, cy = h / 2;
      return `<rect width="${w}" height="${h}" fill="#0A0D14"/>
        <polygon points="${w * 0.1},${h * 0.85} ${cx},${h * 0.2} ${w * 0.9},${h * 0.85}" fill="#1A2030" opacity="0.5"/>
        <polygon points="${w * 0.25},${h * 0.85} ${cx},${h * 0.35} ${w * 0.75},${h * 0.85}" fill="#1A2538" opacity="0.4"/>
        <circle cx="${cx - 5}" cy="${h * 0.38}" r="5" fill="#E0D8C0" opacity="0.85"/>
        <line x1="${cx - 5}" y1="${h * 0.43}" x2="${cx - 5}" y2="${h * 0.62}" stroke="#6B8E4E" stroke-width="1.5"/>
        <line x1="${cx - 5}" y1="${h * 0.62}" x2="${cx - 10}" y2="${h * 0.75}" stroke="#6B8E4E" stroke-width="1.2"/>
        <line x1="${cx - 5}" y1="${h * 0.62}" x2="${cx}" y2="${h * 0.75}" stroke="#6B8E4E" stroke-width="1.2"/>
        <circle cx="${cx + 8}" cy="${h * 0.32}" r="4" fill="#E8C84A" opacity="0.6"/>
        <circle cx="${cx + 8}" cy="${h * 0.32}" r="6" fill="none" stroke="#E8C84A" stroke-width="0.5" opacity="0.3"/>
        ${radiatingLines(cx + 8, h * 0.32, 8, 6, 12, '#E8C84A', 0.25)}
        <line x1="${cx + 12}" y1="${h * 0.38}" x2="${cx + 12}" y2="${h * 0.52}" stroke="#8B7355" stroke-width="1"/>
        <line x1="${w * 0.65}" y1="${h * 0.65}" x2="${w * 0.68}" y2="${h * 0.55}" stroke="#C4A97D" stroke-width="0.8" opacity="0.5"/>
        <line x1="${w * 0.68}" y1="${h * 0.55}" x2="${w * 0.66}" y2="${h * 0.52}" stroke="#C4A97D" stroke-width="0.8" opacity="0.5"/>
        <line x1="${w * 0.68}" y1="${h * 0.55}" x2="${w * 0.71}" y2="${h * 0.52}" stroke="#C4A97D" stroke-width="0.8" opacity="0.5"/>
        <path d="M${w * 0.35} ${h * 0.78} Q${w * 0.4} ${h * 0.72} ${w * 0.45} ${h * 0.76} Q${w * 0.5} ${h * 0.7} ${w * 0.55} ${h * 0.78}" stroke="#6B8E4E" stroke-width="0.8" fill="none" opacity="0.4"/>
        <text x="${cx}" y="${h * 0.95}" text-anchor="middle" font-size="4" fill="#D4AF37" opacity="0.5">IX · THE HERMIT</text>
        ${thothFrame(w, h)}`;
    },

    'major-10': function (w, h) { // Fortune — wheel, sphinx, serpent, three figures
      const cx = w / 2, cy = h / 2;
      let spokes = '';
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        spokes += `<line x1="${cx}" y1="${cy}" x2="${cx + 28 * Math.cos(a)}" y2="${cy + 28 * Math.sin(a)}" stroke="#D4AF37" stroke-width="0.6" opacity="0.3"/>`;
      }
      return `<rect width="${w}" height="${h}" fill="#1A0A1A"/>
        <circle cx="${cx}" cy="${cy}" r="30" fill="none" stroke="#E84A5F" stroke-width="1.2" opacity="0.4"/>
        <circle cx="${cx}" cy="${cy}" r="22" fill="none" stroke="#D4AF37" stroke-width="0.8" opacity="0.35"/>
        <circle cx="${cx}" cy="${cy}" r="14" fill="none" stroke="#E84A5F" stroke-width="0.6" opacity="0.25"/>
        ${spokes}
        <circle cx="${cx}" cy="${cy - 32}" r="4" fill="#D4AF37" opacity="0.5"/>
        <polygon points="${cx - 3},${cy - 36} ${cx},${cy - 40} ${cx + 3},${cy - 36}" fill="#D4AF37" opacity="0.35"/>
        <path d="M${cx + 28} ${cy + 8} L${cx + 34} ${cy + 14} L${cx + 28} ${cy + 14}" stroke="#4A8060" stroke-width="1" fill="none" opacity="0.5"/>
        <path d="M${cx - 30} ${cy + 4} Q${cx - 34} ${cy + 8} ${cx - 30} ${cy + 12}" stroke="#E84A5F" stroke-width="1" fill="none" opacity="0.5"/>
        <circle cx="${cx}" cy="${cy}" r="3" fill="#D4AF37" opacity="0.4"/>
        <text x="${cx}" y="${h * 0.95}" text-anchor="middle" font-size="4" fill="#D4AF37" opacity="0.5">X · FORTUNE</text>
        ${thothFrame(w, h)}`;
    },
    'major-11': function (w, h) { // Lust — Babalon on Beast, seven heads, grail
      const cx = w / 2, cy = h / 2;
      return `<rect width="${w}" height="${h}" fill="#1A0808"/>
        ${radiatingLines(cx, cy * 0.7, 12, 6, 40, '#E84A5F', 0.12)}
        <ellipse cx="${cx}" cy="${h * 0.62}" rx="28" ry="14" fill="#E84A5F" opacity="0.08"/>
        <path d="M${w * 0.25} ${h * 0.65} Q${w * 0.35} ${h * 0.5} ${cx} ${h * 0.55} Q${w * 0.65} ${h * 0.5} ${w * 0.75} ${h * 0.65}" stroke="#E84A5F" stroke-width="1.5" fill="none" opacity="0.4"/>
        <circle cx="${cx}" cy="${h * 0.32}" r="5" fill="#F0D0D0" opacity="0.9"/>
        <line x1="${cx}" y1="${h * 0.37}" x2="${cx}" y2="${h * 0.52}" stroke="#E84A5F" stroke-width="1.5"/>
        <line x1="${cx}" y1="${h * 0.44}" x2="${cx - 10}" y2="${h * 0.4}" stroke="#E84A5F" stroke-width="1"/>
        <line x1="${cx}" y1="${h * 0.44}" x2="${cx + 10}" y2="${h * 0.4}" stroke="#E84A5F" stroke-width="1"/>
        <circle cx="${cx - 18}" cy="${h * 0.52}" r="2.5" fill="#E84A5F" opacity="0.3"/>
        <circle cx="${cx - 12}" cy="${h * 0.48}" r="2.5" fill="#E84A5F" opacity="0.3"/>
        <circle cx="${cx - 6}" cy="${h * 0.46}" r="2.5" fill="#E84A5F" opacity="0.3"/>
        <circle cx="${cx}" cy="${h * 0.45}" r="2.5" fill="#E84A5F" opacity="0.35"/>
        <circle cx="${cx + 6}" cy="${h * 0.46}" r="2.5" fill="#E84A5F" opacity="0.3"/>
        <circle cx="${cx + 12}" cy="${h * 0.48}" r="2.5" fill="#E84A5F" opacity="0.3"/>
        <circle cx="${cx + 18}" cy="${h * 0.52}" r="2.5" fill="#E84A5F" opacity="0.3"/>
        <path d="M${cx - 4} ${h * 0.25} Q${cx} ${h * 0.2} ${cx + 4} ${h * 0.25}" fill="#D4AF37" opacity="0.4"/>
        <circle cx="${cx}" cy="${h * 0.22}" r="3" fill="#D4AF37" opacity="0.3"/>
        <text x="${cx}" y="${h * 0.82}" text-anchor="middle" font-size="10" fill="#E84A5F" opacity="0.5">🦁</text>
        <text x="${cx}" y="${h * 0.95}" text-anchor="middle" font-size="4" fill="#D4AF37" opacity="0.5">XI · LUST</text>
        ${thothFrame(w, h)}`;
    },

    'major-12': function (w, h) { // The Hanged Man — inverted figure, ankh, grid, serpent
      const cx = w / 2, cy = h / 2;
      let grid = '';
      for (let i = 0; i < 8; i++) {
        grid += `<line x1="${w * 0.15}" y1="${h * (0.15 + i * 0.08)}" x2="${w * 0.85}" y2="${h * (0.15 + i * 0.08)}" stroke="#4A7A8C" stroke-width="0.3" opacity="0.15"/>`;
      }
      for (let i = 0; i < 6; i++) {
        grid += `<line x1="${w * (0.15 + i * 0.14)}" y1="${h * 0.15}" x2="${w * (0.15 + i * 0.14)}" y2="${h * 0.75}" stroke="#4A7A8C" stroke-width="0.3" opacity="0.15"/>`;
      }
      return `<rect width="${w}" height="${h}" fill="#0A1420"/>
        ${grid}
        <line x1="${cx - 15}" y1="${h * 0.15}" x2="${cx + 15}" y2="${h * 0.15}" stroke="#4A7A8C" stroke-width="1.5" opacity="0.5"/>
        <line x1="${cx}" y1="${h * 0.15}" x2="${cx}" y2="${h * 0.28}" stroke="#4A7A8C" stroke-width="1"/>
        <circle cx="${cx}" cy="${h * 0.55}" r="5" fill="#C0D8E8" opacity="0.85"/>
        <line x1="${cx}" y1="${h * 0.28}" x2="${cx}" y2="${h * 0.5}" stroke="#4A7A8C" stroke-width="1.5"/>
        <line x1="${cx}" y1="${h * 0.33}" x2="${cx - 10}" y2="${h * 0.4}" stroke="#4A7A8C" stroke-width="1"/>
        <line x1="${cx}" y1="${h * 0.33}" x2="${cx + 10}" y2="${h * 0.4}" stroke="#4A7A8C" stroke-width="1"/>
        <line x1="${cx - 4}" y1="${h * 0.28}" x2="${cx - 8}" y2="${h * 0.22}" stroke="#4A7A8C" stroke-width="1"/>
        <line x1="${cx + 4}" y1="${h * 0.28}" x2="${cx + 8}" y2="${h * 0.22}" stroke="#4A7A8C" stroke-width="1"/>
        <circle cx="${cx}" cy="${h * 0.72}" r="5" fill="none" stroke="#D4AF37" stroke-width="0.8" opacity="0.5"/>
        <line x1="${cx}" y1="${h * 0.67}" x2="${cx}" y2="${h * 0.62}" stroke="#D4AF37" stroke-width="0.8" opacity="0.5"/>
        <line x1="${cx - 3}" y1="${h * 0.67}" x2="${cx + 3}" y2="${h * 0.67}" stroke="#D4AF37" stroke-width="0.8" opacity="0.5"/>
        <path d="M${w * 0.65} ${h * 0.6} Q${w * 0.72} ${h * 0.55} ${w * 0.68} ${h * 0.5} Q${w * 0.75} ${h * 0.45} ${w * 0.7} ${h * 0.4}" stroke="#4A8060" stroke-width="0.8" fill="none" opacity="0.4"/>
        <text x="${cx}" y="${h * 0.95}" text-anchor="middle" font-size="4" fill="#D4AF37" opacity="0.5">XII · THE HANGED MAN</text>
        ${thothFrame(w, h)}`;
    },

    'major-13': function (w, h) { // Death — skeleton, scythe, scorpion, eagle, bubbles
      const cx = w / 2, cy = h / 2;
      let bubbles = '';
      for (let i = 0; i < 8; i++) {
        const bx = w * 0.2 + Math.random() * w * 0.6;
        const by = h * 0.6 + Math.random() * h * 0.25;
        const br = 1.5 + Math.random() * 2;
        bubbles += `<circle cx="${bx}" cy="${by}" r="${br}" fill="none" stroke="#4A7A8C" stroke-width="0.5" opacity="${0.2 + Math.random() * 0.3}"/>`;
      }
      return `<rect width="${w}" height="${h}" fill="#0A0A14"/>
        <rect y="${h * 0.65}" width="${w}" height="${h * 0.35}" fill="#0A1420" opacity="0.5"/>
        <circle cx="${cx}" cy="${h * 0.3}" r="6" fill="#D0D0D0" opacity="0.8"/>
        <circle cx="${cx - 2}" cy="${h * 0.29}" r="1" fill="#0A0A14"/>
        <circle cx="${cx + 2}" cy="${h * 0.29}" r="1" fill="#0A0A14"/>
        <line x1="${cx}" y1="${h * 0.36}" x2="${cx}" y2="${h * 0.55}" stroke="#B0B0B0" stroke-width="1.5"/>
        <line x1="${cx}" y1="${h * 0.42}" x2="${cx - 8}" y2="${h * 0.38}" stroke="#B0B0B0" stroke-width="1"/>
        <line x1="${cx}" y1="${h * 0.42}" x2="${cx + 15}" y2="${h * 0.35}" stroke="#B0B0B0" stroke-width="1"/>
        <path d="M${cx + 15} ${h * 0.35} Q${cx + 20} ${h * 0.3} ${cx + 18} ${h * 0.25}" stroke="#B0B0B0" stroke-width="1" fill="none"/>
        <path d="M${w * 0.7} ${h * 0.7} L${w * 0.73} ${h * 0.68} L${w * 0.76} ${h * 0.72} L${w * 0.72} ${h * 0.74} Z" fill="#4A2020" opacity="0.5"/>
        <path d="M${w * 0.76} ${h * 0.72} Q${w * 0.82} ${h * 0.68} ${w * 0.78} ${h * 0.66}" stroke="#4A2020" stroke-width="0.8" fill="none" opacity="0.4"/>
        <path d="M${w * 0.25} ${h * 0.18} L${w * 0.32} ${h * 0.15} L${w * 0.3} ${h * 0.12}" stroke="#D4AF37" stroke-width="0.8" fill="none" opacity="0.4"/>
        <path d="M${w * 0.25} ${h * 0.18} L${w * 0.28} ${h * 0.21}" stroke="#D4AF37" stroke-width="0.8" fill="none" opacity="0.4"/>
        ${bubbles}
        <text x="${cx}" y="${h * 0.95}" text-anchor="middle" font-size="4" fill="#D4AF37" opacity="0.5">XIII · DEATH</text>
        ${thothFrame(w, h)}`;
    },

    'major-14': function (w, h) { // Art — alchemical figure, fire+water mixing, cauldron, rainbow
      const cx = w / 2, cy = h / 2;
      return `<rect width="${w}" height="${h}" fill="#0D0A1A"/>
        <path d="M${w * 0.1} ${h * 0.12} Q${cx} ${h * 0.02} ${w * 0.9} ${h * 0.12}" stroke="#E84A5F" stroke-width="1" fill="none" opacity="0.3"/>
        <path d="M${w * 0.12} ${h * 0.14} Q${cx} ${h * 0.04} ${w * 0.88} ${h * 0.14}" stroke="#E8A040" stroke-width="0.8" fill="none" opacity="0.25"/>
        <path d="M${w * 0.14} ${h * 0.16} Q${cx} ${h * 0.06} ${w * 0.86} ${h * 0.16}" stroke="#E8C84A" stroke-width="0.8" fill="none" opacity="0.25"/>
        <path d="M${w * 0.16} ${h * 0.18} Q${cx} ${h * 0.08} ${w * 0.84} ${h * 0.18}" stroke="#6B8E4E" stroke-width="0.8" fill="none" opacity="0.25"/>
        <path d="M${w * 0.18} ${h * 0.2} Q${cx} ${h * 0.1} ${w * 0.82} ${h * 0.2}" stroke="#4A7A8C" stroke-width="0.8" fill="none" opacity="0.25"/>
        <path d="M${w * 0.2} ${h * 0.22} Q${cx} ${h * 0.12} ${w * 0.8} ${h * 0.22}" stroke="#8888CC" stroke-width="0.8" fill="none" opacity="0.25"/>
        <circle cx="${cx}" cy="${h * 0.35}" r="6" fill="#E0D8F0" opacity="0.85"/>
        <line x1="${cx}" y1="${h * 0.41}" x2="${cx}" y2="${h * 0.55}" stroke="#8E5BC0" stroke-width="1.5"/>
        <line x1="${cx - 12}" y1="${h * 0.42}" x2="${cx}" y2="${h * 0.5}" stroke="#E84A5F" stroke-width="1" opacity="0.6"/>
        <line x1="${cx + 12}" y1="${h * 0.42}" x2="${cx}" y2="${h * 0.5}" stroke="#4A7A8C" stroke-width="1" opacity="0.6"/>
        <path d="M${cx - 10} ${h * 0.62} Q${cx} ${h * 0.58} ${cx + 10} ${h * 0.62} L${cx + 8} ${h * 0.72} Q${cx} ${h * 0.75} ${cx - 8} ${h * 0.72} Z" fill="#2D1B4E" stroke="#D4AF37" stroke-width="0.6" opacity="0.5"/>
        <circle cx="${cx - 4}" cy="${h * 0.66}" r="2" fill="#E84A5F" opacity="0.3"/>
        <circle cx="${cx + 4}" cy="${h * 0.66}" r="2" fill="#4A7A8C" opacity="0.3"/>
        <path d="M${cx - 3} ${h * 0.64} Q${cx} ${h * 0.6} ${cx + 3} ${h * 0.64}" stroke="#D4AF37" stroke-width="0.4" fill="none" opacity="0.5"/>
        <text x="${cx}" y="${h * 0.95}" text-anchor="middle" font-size="4" fill="#D4AF37" opacity="0.5">XIV · ART</text>
        ${thothFrame(w, h)}`;
    },
    'major-15': function (w, h) { // The Devil — goat, third eye, two figures, chains
      const cx = w / 2, cy = h / 2;
      return `<rect width="${w}" height="${h}" fill="#0A0808"/>
        ${sacredCircles(cx, cy * 0.6, 3, 35, '#6B8E4E', 0.12)}
        <polygon points="${cx},${h * 0.12} ${cx + 20},${h * 0.55} ${cx - 20},${h * 0.55}" fill="none" stroke="#6B8E4E" stroke-width="0.8" opacity="0.25"/>
        <polygon points="${cx},${h * 0.58} ${cx - 20},${h * 0.15} ${cx + 20},${h * 0.15}" fill="none" stroke="#6B8E4E" stroke-width="0.8" opacity="0.25"/>
        <circle cx="${cx}" cy="${h * 0.28}" r="8" fill="#1A1A1A" stroke="#6B8E4E" stroke-width="0.8" opacity="0.6"/>
        <circle cx="${cx}" cy="${h * 0.28}" r="4" fill="#2A2A2A" opacity="0.8"/>
        <path d="M${cx - 6} ${h * 0.25} Q${cx - 10} ${h * 0.18} ${cx - 5} ${h * 0.15}" stroke="#D4AF37" stroke-width="0.8" fill="none" opacity="0.5"/>
        <path d="M${cx + 6} ${h * 0.25} Q${cx + 10} ${h * 0.18} ${cx + 5} ${h * 0.15}" stroke="#D4AF37" stroke-width="0.8" fill="none" opacity="0.5"/>
        <circle cx="${cx}" cy="${h * 0.22}" r="2" fill="#E84A5F" opacity="0.6"/>
        <line x1="${cx}" y1="${h * 0.36}" x2="${cx}" y2="${h * 0.55}" stroke="#6B8E4E" stroke-width="1.5"/>
        <circle cx="${cx - 16}" cy="${h * 0.62}" r="3" fill="#C0B0A0" opacity="0.5"/>
        <line x1="${cx - 16}" y1="${h * 0.65}" x2="${cx - 16}" y2="${h * 0.74}" stroke="#A09080" stroke-width="1"/>
        <circle cx="${cx + 16}" cy="${h * 0.62}" r="3" fill="#C0B0A0" opacity="0.5"/>
        <line x1="${cx + 16}" y1="${h * 0.65}" x2="${cx + 16}" y2="${h * 0.74}" stroke="#A09080" stroke-width="1"/>
        <circle cx="${cx - 16}" cy="${h * 0.72}" r="4" fill="none" stroke="#708090" stroke-width="0.6" opacity="0.4"/>
        <circle cx="${cx + 16}" cy="${h * 0.72}" r="4" fill="none" stroke="#708090" stroke-width="0.6" opacity="0.4"/>
        <path d="M${cx - 12} ${h * 0.72} L${cx - 5} ${h * 0.7}" stroke="#708090" stroke-width="0.5" opacity="0.3"/>
        <path d="M${cx + 12} ${h * 0.72} L${cx + 5} ${h * 0.7}" stroke="#708090" stroke-width="0.5" opacity="0.3"/>
        <text x="${cx}" y="${h * 0.95}" text-anchor="middle" font-size="4" fill="#D4AF37" opacity="0.5">XV · THE DEVIL</text>
        ${thothFrame(w, h)}`;
    },

    'major-16': function (w, h) { // The Tower — burning tower, eye of Horus, lightning, falling figures
      const cx = w / 2, cy = h / 2;
      return `<rect width="${w}" height="${h}" fill="#1A0505"/>
        <rect x="${cx - 10}" y="${h * 0.2}" width="20" height="${h * 0.55}" rx="2" fill="#2A1515" stroke="#E84A5F" stroke-width="0.8" opacity="0.6"/>
        <polygon points="${cx - 12},${h * 0.2} ${cx},${h * 0.1} ${cx + 12},${h * 0.2}" fill="#3A2020" opacity="0.5"/>
        <path d="M${cx + 3} ${h * 0.05} L${cx - 5} ${h * 0.18} L${cx + 2} ${h * 0.22} L${cx - 4} ${h * 0.35}" stroke="#E8C84A" stroke-width="2" fill="none" opacity="0.8"/>
        <circle cx="${cx}" cy="${h * 0.15}" r="6" fill="#E84A5F" opacity="0.15"/>
        <circle cx="${cx}" cy="${h * 0.15}" r="3" fill="#E8C84A" opacity="0.3"/>
        <circle cx="${cx}" cy="${h * 0.32}" r="5" fill="none" stroke="#D4AF37" stroke-width="0.8" opacity="0.5"/>
        <circle cx="${cx - 2}" cy="${h * 0.31}" r="1.5" fill="#D4AF37" opacity="0.5"/>
        <path d="M${cx + 2} ${h * 0.33} L${cx + 5} ${h * 0.35}" stroke="#D4AF37" stroke-width="0.6" opacity="0.4"/>
        <circle cx="${cx - 18}" cy="${h * 0.5}" r="2.5" fill="#F0D0C0" opacity="0.6"/>
        <line x1="${cx - 18}" y1="${h * 0.52}" x2="${cx - 20}" y2="${h * 0.6}" stroke="#C0A080" stroke-width="0.8"/>
        <circle cx="${cx + 18}" cy="${h * 0.55}" r="2.5" fill="#F0D0C0" opacity="0.6"/>
        <line x1="${cx + 18}" y1="${h * 0.57}" x2="${cx + 22}" y2="${h * 0.65}" stroke="#C0A080" stroke-width="0.8"/>
        <circle cx="${cx - 3}" cy="${h * 0.45}" r="2" fill="#E84A5F" opacity="0.25"/>
        <circle cx="${cx + 4}" cy="${h * 0.5}" r="1.5" fill="#E8A040" opacity="0.2"/>
        <circle cx="${cx - 5}" cy="${h * 0.55}" r="2.5" fill="#E84A5F" opacity="0.2"/>
        <path d="M${cx - 12} ${h * 0.78} Q${cx} ${h * 0.72} ${cx + 12} ${h * 0.78}" stroke="#4A2020" stroke-width="2" fill="none" opacity="0.4"/>
        <text x="${cx}" y="${h * 0.95}" text-anchor="middle" font-size="4" fill="#D4AF37" opacity="0.5">XVI · THE TOWER</text>
        ${thothFrame(w, h)}`;
    },

    'major-17': function (w, h) { // The Star — pouring water, seven-pointed star, celestial dome
      const cx = w / 2, cy = h / 2;
      let starPts = '';
      for (let i = 0; i < 14; i++) {
        const a = (i * 360 / 14 - 90) * Math.PI / 180;
        const r = i % 2 === 0 ? 18 : 9;
        starPts += `${cx + r * Math.cos(a)},${cy * 0.4 + r * Math.sin(a)} `;
      }
      let smallStars = '';
      const sPositions = [[w*0.15,h*0.15],[w*0.3,h*0.1],[w*0.7,h*0.12],[w*0.85,h*0.18],[w*0.2,h*0.28],[w*0.8,h*0.25]];
      sPositions.forEach(([sx,sy]) => {
        smallStars += `<circle cx="${sx}" cy="${sy}" r="1.2" fill="#E8C84A" opacity="0.5"/>`;
      });
      return `<rect width="${w}" height="${h}" fill="#0A0A28"/>
        <path d="M0 ${h * 0.35} Q${cx} ${h * 0.25} ${w} ${h * 0.35}" stroke="#2A2A5A" stroke-width="0.6" fill="none" opacity="0.4"/>
        ${smallStars}
        <polygon points="${starPts.trim()}" fill="#E8C84A" opacity="0.15" stroke="#E8C84A" stroke-width="0.6"/>
        <circle cx="${cx}" cy="${cy * 0.4}" r="5" fill="#E8C84A" opacity="0.4"/>
        <circle cx="${cx + 8}" cy="${h * 0.52}" r="4" fill="#C0D8F0" opacity="0.8"/>
        <line x1="${cx + 8}" y1="${h * 0.56}" x2="${cx + 8}" y2="${h * 0.68}" stroke="#8899CC" stroke-width="1.2"/>
        <line x1="${cx + 5}" y1="${h * 0.62}" x2="${cx - 5}" y2="${h * 0.72}" stroke="#4A7A8C" stroke-width="1" opacity="0.6"/>
        <path d="M${cx - 5} ${h * 0.72} Q${cx - 8} ${h * 0.78} ${cx - 12} ${h * 0.82}" stroke="#4A7A8C" stroke-width="0.8" fill="none" opacity="0.4"/>
        <line x1="${cx + 12}" y1="${h * 0.62}" x2="${cx + 20}" y2="${h * 0.72}" stroke="#4A7A8C" stroke-width="1" opacity="0.6"/>
        <path d="M${cx + 20} ${h * 0.72} Q${cx + 22} ${h * 0.78} ${cx + 25} ${h * 0.82}" stroke="#4A7A8C" stroke-width="0.8" fill="none" opacity="0.4"/>
        <rect y="${h * 0.78}" width="${w}" height="${h * 0.22}" fill="#0A1420" opacity="0.4"/>
        <text x="${cx}" y="${h * 0.95}" text-anchor="middle" font-size="4" fill="#D4AF37" opacity="0.5">XVII · THE STAR</text>
        ${thothFrame(w, h)}`;
    },

    'major-18': function (w, h) { // The Moon — twin towers, scarab, moon phases, dark pool, jackals
      const cx = w / 2, cy = h / 2;
      return `<rect width="${w}" height="${h}" fill="#08081A"/>
        <circle cx="${cx}" cy="${h * 0.15}" r="14" fill="#1A1A3E" stroke="#4A7A8C" stroke-width="0.8" opacity="0.4"/>
        <circle cx="${cx}" cy="${h * 0.15}" r="10" fill="none" stroke="#8EC5E0" stroke-width="0.6" opacity="0.5"/>
        <circle cx="${cx + 4}" cy="${h * 0.15}" r="8" fill="#08081A" opacity="0.7"/>
        <circle cx="${cx - 18}" cy="${h * 0.16}" r="4" fill="#4A7A8C" opacity="0.2"/>
        <circle cx="${cx + 22}" cy="${h * 0.16}" r="3" fill="none" stroke="#4A7A8C" stroke-width="0.5" opacity="0.3"/>
        <rect x="${w * 0.12}" y="${h * 0.35}" width="8" height="${h * 0.35}" rx="1" fill="#1A1A3E" opacity="0.6"/>
        <polygon points="${w * 0.12},${h * 0.35} ${w * 0.16},${h * 0.3} ${w * 0.2},${h * 0.35}" fill="#1A1A3E" opacity="0.5"/>
        <rect x="${w * 0.8}" y="${h * 0.35}" width="8" height="${h * 0.35}" rx="1" fill="#1A1A3E" opacity="0.6"/>
        <polygon points="${w * 0.8},${h * 0.35} ${w * 0.84},${h * 0.3} ${w * 0.87},${h * 0.35}" fill="#1A1A3E" opacity="0.5"/>
        <ellipse cx="${cx}" cy="${h * 0.45}" rx="10" ry="6" fill="none" stroke="#D4AF37" stroke-width="0.8" opacity="0.4"/>
        <circle cx="${cx}" cy="${h * 0.45}" r="3" fill="#D4AF37" opacity="0.2"/>
        <path d="M${w * 0.25} ${h * 0.62} L${w * 0.3} ${h * 0.58} L${w * 0.32} ${h * 0.62}" stroke="#8B7355" stroke-width="0.8" fill="none" opacity="0.4"/>
        <path d="M${w * 0.68} ${h * 0.62} L${w * 0.72} ${h * 0.58} L${w * 0.75} ${h * 0.62}" stroke="#8B7355" stroke-width="0.8" fill="none" opacity="0.4"/>
        <ellipse cx="${cx}" cy="${h * 0.78}" rx="${w * 0.35}" ry="8" fill="#0A1420" opacity="0.6"/>
        <ellipse cx="${cx}" cy="${h * 0.78}" rx="${w * 0.25}" ry="5" fill="#0D1B3E" opacity="0.4"/>
        <text x="${cx}" y="${h * 0.95}" text-anchor="middle" font-size="4" fill="#D4AF37" opacity="0.5">XVIII · THE MOON</text>
        ${thothFrame(w, h)}`;
    },
    'major-19': function (w, h) { // The Sun — twin children, zodiac ring, green mound, radiating sun
      const cx = w / 2, cy = h / 2;
      let rays = '';
      for (let i = 0; i < 16; i++) {
        const a = i * Math.PI / 8;
        rays += `<line x1="${cx + 12 * Math.cos(a)}" y1="${h * 0.2 + 12 * Math.sin(a)}" x2="${cx + 28 * Math.cos(a)}" y2="${h * 0.2 + 28 * Math.sin(a)}" stroke="#E8C84A" stroke-width="${i % 2 === 0 ? 1.5 : 0.8}" opacity="${i % 2 === 0 ? 0.5 : 0.3}"/>`;
      }
      let zodiac = '';
      for (let i = 0; i < 12; i++) {
        const a = i * Math.PI / 6;
        const r = 35;
        zodiac += `<circle cx="${cx + r * Math.cos(a)}" cy="${cy * 0.8 + r * Math.sin(a)}" r="1.5" fill="#D4AF37" opacity="0.25"/>`;
      }
      return `<rect width="${w}" height="${h}" fill="#1A1408"/>
        ${zodiac}
        <circle cx="${cx}" cy="${cy * 0.8}" r="36" fill="none" stroke="#D4AF37" stroke-width="0.5" opacity="0.2"/>
        ${rays}
        <circle cx="${cx}" cy="${h * 0.2}" r="10" fill="#E8C84A" opacity="0.4"/>
        <circle cx="${cx}" cy="${h * 0.2}" r="6" fill="#F0E060" opacity="0.5"/>
        <path d="M${w * 0.25} ${h * 0.7} Q${cx} ${h * 0.58} ${w * 0.75} ${h * 0.7}" fill="#2A4020" opacity="0.4"/>
        <circle cx="${cx - 10}" cy="${h * 0.58}" r="4" fill="#F0D8C0" opacity="0.8"/>
        <line x1="${cx - 10}" y1="${h * 0.62}" x2="${cx - 10}" y2="${h * 0.7}" stroke="#E8A040" stroke-width="1"/>
        <circle cx="${cx + 10}" cy="${h * 0.58}" r="4" fill="#F0D8C0" opacity="0.8"/>
        <line x1="${cx + 10}" y1="${h * 0.62}" x2="${cx + 10}" y2="${h * 0.7}" stroke="#E8A040" stroke-width="1"/>
        <line x1="${cx - 6}" y1="${h * 0.64}" x2="${cx + 6}" y2="${h * 0.64}" stroke="#E8A040" stroke-width="0.6" opacity="0.4"/>
        <text x="${cx}" y="${h * 0.95}" text-anchor="middle" font-size="4" fill="#D4AF37" opacity="0.5">XIX · THE SUN</text>
        ${thothFrame(w, h)}`;
    },

    'major-20': function (w, h) { // The Aeon — Nuit arched, Hadit winged disk, Horus child
      const cx = w / 2, cy = h / 2;
      return `<rect width="${w}" height="${h}" fill="#0D0A1A"/>
        <path d="M${w * 0.05} ${h * 0.75} Q${cx} ${h * 0.02} ${w * 0.95} ${h * 0.75}" stroke="#8888CC" stroke-width="1.2" fill="none" opacity="0.4"/>
        <path d="M${w * 0.08} ${h * 0.72} Q${cx} ${h * 0.05} ${w * 0.92} ${h * 0.72}" stroke="#8888CC" stroke-width="0.6" fill="none" opacity="0.25"/>
        <circle cx="${cx}" cy="${h * 0.15}" r="2" fill="#E84A5F" opacity="0.8"/>
        <circle cx="${cx}" cy="${h * 0.15}" r="5" fill="none" stroke="#E84A5F" stroke-width="0.5" opacity="0.4"/>
        <line x1="${cx - 15}" y1="${h * 0.16}" x2="${cx - 5}" y2="${h * 0.15}" stroke="#D4AF37" stroke-width="0.8" opacity="0.5"/>
        <line x1="${cx + 5}" y1="${h * 0.15}" x2="${cx + 15}" y2="${h * 0.16}" stroke="#D4AF37" stroke-width="0.8" opacity="0.5"/>
        <path d="M${cx - 15} ${h * 0.16} Q${cx - 18} ${h * 0.12} ${cx - 20} ${h * 0.15}" stroke="#D4AF37" stroke-width="0.6" fill="none" opacity="0.4"/>
        <path d="M${cx + 15} ${h * 0.16} Q${cx + 18} ${h * 0.12} ${cx + 20} ${h * 0.15}" stroke="#D4AF37" stroke-width="0.6" fill="none" opacity="0.4"/>
        <circle cx="${cx}" cy="${h * 0.55}" r="7" fill="#E84A5F" opacity="0.12"/>
        <circle cx="${cx}" cy="${h * 0.55}" r="5" fill="#F0E0D0" opacity="0.8"/>
        <line x1="${cx}" y1="${h * 0.6}" x2="${cx}" y2="${h * 0.72}" stroke="#E84A5F" stroke-width="1.2"/>
        <line x1="${cx}" y1="${h * 0.65}" x2="${cx - 6}" y2="${h * 0.62}" stroke="#E84A5F" stroke-width="0.8"/>
        <line x1="${cx}" y1="${h * 0.65}" x2="${cx + 6}" y2="${h * 0.62}" stroke="#E84A5F" stroke-width="0.8"/>
        <line x1="${cx}" y1="${h * 0.72}" x2="${cx - 4}" y2="${h * 0.78}" stroke="#E84A5F" stroke-width="0.8"/>
        <line x1="${cx}" y1="${h * 0.72}" x2="${cx + 4}" y2="${h * 0.78}" stroke="#E84A5F" stroke-width="0.8"/>
        ${sacredCircles(cx, h * 0.55, 3, 22, '#D4AF37', 0.15)}
        <text x="${cx}" y="${h * 0.95}" text-anchor="middle" font-size="4" fill="#D4AF37" opacity="0.5">XX · THE AEON</text>
        ${thothFrame(w, h)}`;
    },

    'major-21': function (w, h) { // The Universe — dancing figure, oval wreath, four elements, eye
      const cx = w / 2, cy = h / 2;
      return `<rect width="${w}" height="${h}" fill="#0A0D14"/>
        <ellipse cx="${cx}" cy="${cy}" rx="30" ry="42" fill="none" stroke="#6B8E4E" stroke-width="1.5" opacity="0.35"/>
        <ellipse cx="${cx}" cy="${cy}" rx="26" ry="38" fill="none" stroke="#D4AF37" stroke-width="0.6" opacity="0.2"/>
        <circle cx="${cx}" cy="${h * 0.35}" r="5" fill="#E0D8F0" opacity="0.85"/>
        <line x1="${cx}" y1="${h * 0.4}" x2="${cx}" y2="${h * 0.58}" stroke="#8E5BC0" stroke-width="1.5"/>
        <line x1="${cx}" y1="${h * 0.46}" x2="${cx - 10}" y2="${h * 0.42}" stroke="#8E5BC0" stroke-width="1"/>
        <line x1="${cx}" y1="${h * 0.46}" x2="${cx + 10}" y2="${h * 0.5}" stroke="#8E5BC0" stroke-width="1"/>
        <line x1="${cx}" y1="${h * 0.58}" x2="${cx - 8}" y2="${h * 0.68}" stroke="#8E5BC0" stroke-width="1"/>
        <line x1="${cx}" y1="${h * 0.58}" x2="${cx + 5}" y2="${h * 0.66}" stroke="#8E5BC0" stroke-width="1"/>
        <circle cx="${w * 0.12}" cy="${h * 0.12}" r="4" fill="#E84A5F" opacity="0.3"/>
        <text x="${w * 0.12}" y="${h * 0.14}" text-anchor="middle" font-size="5" fill="#E84A5F" opacity="0.5">△</text>
        <circle cx="${w * 0.88}" cy="${h * 0.12}" r="4" fill="#4A7A8C" opacity="0.3"/>
        <text x="${w * 0.88}" y="${h * 0.14}" text-anchor="middle" font-size="5" fill="#4A7A8C" opacity="0.5">▽</text>
        <circle cx="${w * 0.12}" cy="${h * 0.88}" r="4" fill="#8888CC" opacity="0.3"/>
        <text x="${w * 0.12}" y="${h * 0.9}" text-anchor="middle" font-size="5" fill="#8888CC" opacity="0.5">◇</text>
        <circle cx="${w * 0.88}" cy="${h * 0.88}" r="4" fill="#6B8E4E" opacity="0.3"/>
        <text x="${w * 0.88}" y="${h * 0.9}" text-anchor="middle" font-size="5" fill="#6B8E4E" opacity="0.5">◻</text>
        <ellipse cx="${cx}" cy="${h * 0.78}" rx="8" ry="4" fill="none" stroke="#D4AF37" stroke-width="0.8" opacity="0.4"/>
        <circle cx="${cx}" cy="${h * 0.78}" r="2" fill="#D4AF37" opacity="0.3"/>
        <text x="${cx}" y="${h * 0.95}" text-anchor="middle" font-size="4" fill="#D4AF37" opacity="0.5">XXI · THE UNIVERSE</text>
        ${thothFrame(w, h)}`;
    }
  };

  // ── Default Thoth Major Arcana fallback ──
  function defaultMajorThoth(card, w, h) {
    const elColor = ELEMENT_COLORS[card.element] ? ELEMENT_COLORS[card.element].thoth : '#D4AF37';
    return `<rect width="${w}" height="${h}" fill="#0D0A1A"/>
      ${sacredCircles(w / 2, h / 2, 4, 38, elColor, 0.2)}
      ${radiatingLines(w / 2, h / 2, 8, 10, 40, '#D4AF37', 0.15)}
      <polygon points="${w * 0.5},${h * 0.12} ${w * 0.82},${h * 0.68} ${w * 0.18},${h * 0.68}" fill="none" stroke="#D4AF37" stroke-width="0.6" opacity="0.25"/>
      <polygon points="${w * 0.5},${h * 0.88} ${w * 0.18},${h * 0.32} ${w * 0.82},${h * 0.32}" fill="none" stroke="#D4AF37" stroke-width="0.6" opacity="0.25"/>
      <text x="${w * 0.5}" y="${h * 0.54}" text-anchor="middle" font-size="22" opacity="0.9">${card.symbol}</text>
      ${thothFrame(w, h)}`;
  }
  // ── Thoth Pip Card (Aces through Tens) ──
  function pipCardThoth(card, w, h) {
    const cx = w / 2, cy = h / 2;
    const suitKey = card.suit || 'wands';
    const elKey = {wands: 'fire', cups: 'water', swords: 'air', pentacles: 'earth', disks: 'earth'}[suitKey] || 'fire';
    const cols = ELEMENT_COLORS[elKey] ? ELEMENT_COLORS[elKey] : {thoth: '#D4AF37', glow: '#D4AF3740'};
    const suitFn = suitKey === 'disks' ? 'disks' : suitKey;

    // Extract number from card id
    const numMatch = card.id ? card.id.match(/(\d+)/) : null;
    const num = numMatch ? parseInt(numMatch[1], 10) : 1;

    // Cosmic background
    let svg = thothBg(w, h, '#0D0A1A', '#1A0D2E');

    // Sacred geometry overlay
    svg += sacredCircles(cx, cy, 3, 32, cols.thoth, 0.12);
    svg += radiatingLines(cx, cy, 6, 8, 36, cols.thoth, 0.08);

    // Suit symbols arranged
    const positions = getPipPositions(num, w, h);
    positions.forEach(function (p) {
      svg += drawSuitSymbol(suitFn, p.x, p.y, 7);
    });

    // Card number label
    const romanNumerals = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    const roman = romanNumerals[num] || String(num);
    svg += `<text x="${cx}" y="${h * 0.95}" text-anchor="middle" font-size="4" fill="#D4AF37" opacity="0.4">${roman} · ${(suitKey === 'disks' ? 'DISKS' : suitKey.toUpperCase())}</text>`;
    svg += thothFrame(w, h);
    return svg;
  }

  // ── Thoth Court Cards ──
  function courtCardThoth(card, w, h) {
    const cx = w / 2, cy = h / 2;
    const suitKey = card.suit || 'wands';
    const elKey = {wands: 'fire', cups: 'water', swords: 'air', pentacles: 'earth', disks: 'earth'}[suitKey] || 'fire';
    const cols = ELEMENT_COLORS[elKey] ? ELEMENT_COLORS[elKey] : {thoth: '#D4AF37', glow: '#D4AF3740'};

    // Determine Thoth court rank
    const id = card.id || '';
    let rank = 'Knight';
    if (id.indexOf('queen') !== -1) rank = 'Queen';
    else if (id.indexOf('prince') !== -1 || id.indexOf('knight') !== -1) rank = 'Prince';
    else if (id.indexOf('princess') !== -1 || id.indexOf('page') !== -1) rank = 'Princess';
    else if (id.indexOf('king') !== -1) rank = 'Knight';

    // Background gradient based on element
    const bgMap = {fire: ['#1A0A08', '#2E1A0D'], water: ['#0A0A1A', '#0D1A2E'], air: ['#0A0D14', '#14202E'], earth: ['#0D0A04', '#1A1408']};
    const bg = bgMap[elKey] || bgMap.fire;
    let svg = thothBg(w, h, bg[0], bg[1]);

    // Throne / element region
    if (rank === 'Knight') {
      // Dynamic, fiery / charging
      svg += `<path d="M${cx - 20} ${h * 0.65} Q${cx} ${h * 0.3} ${cx + 20} ${h * 0.65}" fill="none" stroke="${cols.thoth}" stroke-width="1" opacity="0.3"/>`;
      svg += `<polygon points="${cx},${h * 0.2} ${cx + 5},${h * 0.3} ${cx - 5},${h * 0.3}" fill="${cols.thoth}" opacity="0.25"/>`;
    } else if (rank === 'Queen') {
      // Seated, receptive
      svg += `<rect x="${cx - 16}" y="${h * 0.5}" width="32" height="20" rx="3" fill="${cols.thoth}" opacity="0.12"/>`;
      svg += sacredCircles(cx, h * 0.35, 3, 18, cols.thoth, 0.15);
    } else if (rank === 'Prince') {
      // Chariot-like
      svg += `<rect x="${cx - 14}" y="${h * 0.6}" width="28" height="14" rx="2" fill="${cols.thoth}" opacity="0.15"/>`;
      svg += `<circle cx="${cx - 10}" cy="${h * 0.74}" r="3" fill="none" stroke="${cols.thoth}" stroke-width="0.6" opacity="0.3"/>`;
      svg += `<circle cx="${cx + 10}" cy="${h * 0.74}" r="3" fill="none" stroke="${cols.thoth}" stroke-width="0.6" opacity="0.3"/>`;
    } else {
      // Princess — grounded, elemental
      svg += `<path d="M${cx - 22} ${h * 0.75} L${cx + 22} ${h * 0.75}" stroke="${cols.thoth}" stroke-width="0.8" opacity="0.3"/>`;
      svg += `<path d="M${cx - 18} ${h * 0.78} L${cx + 18} ${h * 0.78}" stroke="${cols.thoth}" stroke-width="0.5" opacity="0.2"/>`;
    }

    // Figure
    svg += `<circle cx="${cx}" cy="${h * 0.28}" r="7" fill="${cols.thoth}" opacity="0.18"/>`;
    svg += `<circle cx="${cx}" cy="${h * 0.28}" r="5" fill="#E0D8F0" opacity="0.8"/>`;
    svg += `<line x1="${cx}" y1="${h * 0.33}" x2="${cx}" y2="${h * 0.52}" stroke="${cols.thoth}" stroke-width="1.5"/>`;
    svg += `<line x1="${cx}" y1="${h * 0.38}" x2="${cx - 10}" y2="${h * 0.44}" stroke="${cols.thoth}" stroke-width="1"/>`;
    svg += `<line x1="${cx}" y1="${h * 0.38}" x2="${cx + 10}" y2="${h * 0.44}" stroke="${cols.thoth}" stroke-width="1"/>`;
    svg += `<line x1="${cx}" y1="${h * 0.52}" x2="${cx - 7}" y2="${h * 0.62}" stroke="${cols.thoth}" stroke-width="1"/>`;
    svg += `<line x1="${cx}" y1="${h * 0.52}" x2="${cx + 7}" y2="${h * 0.62}" stroke="${cols.thoth}" stroke-width="1"/>`;

    // Crown for Knight/Queen
    if (rank === 'Knight' || rank === 'Queen') {
      svg += `<polygon points="${cx - 6},${h * 0.21} ${cx - 3},${h * 0.17} ${cx},${h * 0.21} ${cx + 3},${h * 0.17} ${cx + 6},${h * 0.21}" fill="${cols.thoth}" opacity="0.5"/>`;
    }

    // Suit symbol held by figure
    svg += drawSuitSymbol(suitKey === 'disks' ? 'disks' : suitKey, cx + 12, h * 0.42, 6);

    // Label
    svg += `<text x="${cx}" y="${h * 0.95}" text-anchor="middle" font-size="4" fill="#D4AF37" opacity="0.5">${rank.toUpperCase()} · ${(suitKey === 'disks' ? 'DISKS' : suitKey.toUpperCase())}</text>`;
    svg += thothFrame(w, h);
    return svg;
  }
  // ── Main SVG Generator ──
  function generateSVG(card, deck, width, height) {
    const w = width || 120;
    const h = height || 180;
    const isThoth = deck === 'thoth';
    let inner = '';

    if (card.type === 'major') {
      if (isThoth) {
        const sceneFn = MAJOR_THOTH_SCENES[card.id];
        inner = sceneFn ? sceneFn(w, h) : defaultMajorThoth(card, w, h);
      } else {
        const sceneFn = MAJOR_RW_SCENES[card.id];
        inner = sceneFn ? sceneFn(w, h) : defaultMajorRW(card, w, h);
      }
    } else if (card.type === 'court') {
      inner = isThoth ? courtCardThoth(card, w, h) : courtCardRW(card, w, h);
    } else {
      inner = isThoth ? pipCardThoth(card, w, h) : pipCardRW(card, w, h);
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${inner}</svg>`;
  }

  return { generateSVG: generateSVG };
})();