/* ============================================
   Financial Intelligence Briefing — Dashboard JS
   ============================================ */

const DATA_PATH = 'data/briefing.json';

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  loadBriefing();
  initTabs();
  initIdeaTabs();
});

async function loadBriefing() {
  try {
    const response = await fetch(DATA_PATH + '?t=' + Date.now());
    if (!response.ok) throw new Error('No briefing data');
    const data = await response.json();
    renderDashboard(data);
    hideLoading();
  } catch (err) {
    console.warn('No briefing data available:', err);
    renderNoBriefing();
    hideLoading();
  }
}

function hideLoading() {
  setTimeout(() => {
    document.getElementById('loading').classList.add('hidden');
  }, 800);
}

// ============================================
// Render Dashboard
// ============================================
function renderDashboard(data) {
  renderHeader(data);
  renderExecutiveSummary(data.executiveSummary);
  renderMarketRegime(data.regime);
  renderPortfolioNews(data.portfolioNews);
  renderNarratives(data.narratives);
  renderSecondOrderEffects(data.secondOrderEffects);
  renderActionableIdeas(data.actionableIdeas);
  renderRiskWatch(data.riskWatch);
  renderKeyEvents(data.keyEvents);
  renderBottomLine(data.bottomLine);
}

// ============================================
// Header
// ============================================
function renderHeader(data) {
  document.getElementById('briefing-date').textContent = data.date || '—';
  
  const regimeEl = document.getElementById('regime-badge');
  const regimeClass = getRegimeClass(data.regime?.label);
  regimeEl.textContent = data.regime?.label || '—';
  regimeEl.className = 'regime-badge ' + regimeClass;

  const updated = data.lastUpdated || data.generatedAt || '';
  document.getElementById('last-updated').textContent = updated ? `Updated: ${updated}` : '';
}

function getRegimeClass(label) {
  if (!label) return 'mixed';
  const l = label.toLowerCase();
  if (l.includes('risk-on') || l.includes('momentum')) return 'risk-on';
  if (l.includes('risk-off') || l.includes('defensive')) return 'risk-off';
  if (l.includes('euphoric')) return 'euphoric';
  if (l.includes('dislocation')) return 'dislocation';
  if (l.includes('macro')) return 'macro';
  if (l.includes('ai')) return 'ai-momentum';
  return 'mixed';
}

// ============================================
// Executive Summary
// ============================================
function renderExecutiveSummary(items) {
  const container = document.getElementById('summary-cards');
  if (!items || !items.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">No summary items</div></div>';
    return;
  }

  container.innerHTML = items.map((item, i) => {
    const sentimentClass = item.sentiment || 'info';
    return `
      <div class="summary-card ${sentimentClass}">
        <div class="summary-card-number">#${i + 1}</div>
        <div class="summary-card-text">${escapeHtml(item.text)}</div>
        ${item.tag ? `<span class="summary-card-tag ${sentimentClass}">${escapeHtml(item.tag)}</span>` : ''}
      </div>
    `;
  }).join('');
}

// ============================================
// Market Regime
// ============================================
function renderMarketRegime(regime) {
  const container = document.getElementById('regime-grid');
  if (!regime || !regime.metrics) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📊</div><div class="empty-state-text">Market data unavailable</div></div>';
    return;
  }

  container.innerHTML = regime.metrics.map(m => {
    const dir = getDirection(m.change);
    return `
      <div class="regime-item">
        <div class="regime-label">${escapeHtml(m.label)}</div>
        <div class="regime-value">${escapeHtml(m.value)}</div>
        <div class="regime-change ${dir}">${escapeHtml(m.change || '—')}</div>
      </div>
    `;
  }).join('');
}

function getDirection(change) {
  if (!change) return 'flat';
  const c = change.toString();
  if (c.startsWith('+') || c.startsWith('▲')) return 'up';
  if (c.startsWith('-') || c.startsWith('▼')) return 'down';
  return 'flat';
}

// ============================================
// Portfolio News
// ============================================
function renderPortfolioNews(portfolioNews) {
  renderNewsList('news-us-global', portfolioNews?.usGlobal);
  renderNewsList('news-singapore', portfolioNews?.singapore);
  renderNewsList('news-commodities', portfolioNews?.commodities);
}

function renderNewsList(containerId, items) {
  const container = document.getElementById(containerId);
  if (!items || !items.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📰</div><div class="empty-state-text">No portfolio-relevant news in the last 24 hours</div></div>';
    return;
  }

  container.innerHTML = items.map(item => {
    const impClass = item.implication || 'mixed';
    const urgClass = (item.urgency || 'low').toLowerCase();
    const tickerHtml = (item.tickers || []).map(t => 
      `<span class="ticker-tag">${escapeHtml(t)}</span>`
    ).join('');

    return `
      <div class="news-item ${impClass}">
        <div class="news-header">
          <div class="news-what">${escapeHtml(item.what)}</div>
          <span class="news-urgency ${urgClass}">${escapeHtml(item.urgency || 'Low')}</span>
        </div>
        <div class="news-why">${escapeHtml(item.why)}</div>
        <div class="news-tickers">${tickerHtml}</div>
        <span class="news-implication ${impClass}">${escapeHtml(item.implication || 'Mixed')}</span>
      </div>
    `;
  }).join('');
}

// ============================================
// Narratives
// ============================================
function renderNarratives(narratives) {
  const container = document.getElementById('narrative-grid');
  if (!narratives || !narratives.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">💬</div><div class="empty-state-text">No narrative breakouts detected</div></div>';
    return;
  }

  container.innerHTML = narratives.map(n => {
    const stageClass = (n.stage || 'emerging').toLowerCase().replace(/\s+/g, '-');
    const tickerHtml = (n.tickers || []).map(t => 
      `<span class="ticker-tag">${escapeHtml(t)}</span>`
    ).join('');

    return `
      <div class="narrative-card">
        <div class="narrative-header">
          <div class="narrative-title">${escapeHtml(n.title)}</div>
          <span class="narrative-stage ${stageClass}">${escapeHtml(n.stage || 'Unknown')}</span>
        </div>
        <div class="narrative-body">${escapeHtml(n.description)}</div>
        <div class="narrative-source">${escapeHtml(n.source || '')}</div>
        ${tickerHtml ? `<div class="narrative-tickers">${tickerHtml}</div>` : ''}
        ${n.priceImpact ? `<div class="narrative-impact">Price impact: ${escapeHtml(n.priceImpact)}</div>` : ''}
      </div>
    `;
  }).join('');
}

// ============================================
// Second-Order Effects
// ============================================
function renderSecondOrderEffects(effects) {
  const container = document.getElementById('effects-list');
  if (!effects || !effects.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔮</div><div class="empty-state-text">No second-order effects identified</div></div>';
    return;
  }

  container.innerHTML = effects.map(e => `
    <div class="effect-item">
      <div class="effect-text">${escapeHtml(e.text)}</div>
      ${e.implication ? `<div class="effect-implication"><strong>Implication:</strong> ${escapeHtml(e.implication)}</div>` : ''}
    </div>
  `).join('');
}

// ============================================
// Actionable Ideas
// ============================================
function renderActionableIdeas(ideas) {
  renderIdeaCards('ideas-investment', ideas?.investment, 'investment');
  renderIdeaCards('ideas-trading', ideas?.trading, 'trading');
  renderIdeaCards('ideas-watchlist', ideas?.watchlist, 'watchlist');
}

function renderIdeaCards(containerId, items, type) {
  const container = document.getElementById(containerId);
  if (!items || !items.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">💡</div><div class="empty-state-text">No actionable ideas — market doesn\'t always offer a trade</div></div>';
    return;
  }

  container.innerHTML = items.map(item => {
    const horizonClass = (item.horizon || 'medium-term').toLowerCase().replace(/\s+/g, '-');
    return `
      <div class="idea-card">
        <div class="idea-type ${horizonClass}">${escapeHtml(item.horizon || 'Medium-term')}</div>
        <div class="idea-thesis">${escapeHtml(item.thesis)}</div>
        ${item.trigger ? `<div class="idea-detail"><strong>Trigger:</strong> ${escapeHtml(item.trigger)}</div>` : ''}
        ${item.whyNow ? `<div class="idea-detail"><strong>Why now:</strong> ${escapeHtml(item.whyNow)}</div>` : ''}
        ${item.invalidator ? `<div class="idea-invalidator">⚠ Risk: ${escapeHtml(item.invalidator)}</div>` : ''}
      </div>
    `;
  }).join('');
}

// ============================================
// Risk Watch
// ============================================
function renderRiskWatch(risks) {
  const container = document.getElementById('risk-grid');
  if (!risks || !risks.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⚠️</div><div class="empty-state-text">No active risk warnings</div></div>';
    return;
  }

  container.innerHTML = risks.map(r => {
    const levelClass = (r.level || 'medium').toLowerCase();
    return `
      <div class="risk-card">
        <div class="risk-header">
          <div class="risk-name">${escapeHtml(r.name)}</div>
          <span class="risk-level ${levelClass}">${escapeHtml(r.level || 'Medium')}</span>
        </div>
        <div class="risk-description">${escapeHtml(r.description)}</div>
        ${r.mitigation ? `<div class="risk-mitigation"><strong>Mitigation:</strong> ${escapeHtml(r.mitigation)}</div>` : ''}
      </div>
    `;
  }).join('');
}

// ============================================
// Key Events
// ============================================
function renderKeyEvents(events) {
  const container = document.getElementById('events-list');
  if (!events || !events.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📅</div><div class="empty-state-text">No key events scheduled</div></div>';
    return;
  }

  container.innerHTML = events.map(e => `
    <div class="event-item">
      <div class="event-icon">${escapeHtml(e.icon || '📌')}</div>
      <div>
        <div class="event-text">${escapeHtml(e.text)}</div>
        ${e.source ? `<div class="event-source">${escapeHtml(e.source)}</div>` : ''}
      </div>
    </div>
  `).join('');
}

// ============================================
// Bottom Line
// ============================================
function renderBottomLine(bl) {
  const container = document.getElementById('bottom-line-grid');
  if (!bl) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🏁</div><div class="empty-state-text">Bottom line not available</div></div>';
    return;
  }

  container.innerHTML = `
    <div class="bottom-line-item what-matters">
      <h3>What Matters Most</h3>
      <p>${escapeHtml(bl.whatMatters || '—')}</p>
    </div>
    <div class="bottom-line-item what-to-do">
      <h3>What to Consider Doing</h3>
      <p>${escapeHtml(bl.whatToDo || '—')}</p>
    </div>
    <div class="bottom-line-item what-to-ignore">
      <h3>What to Ignore</h3>
      <p>${escapeHtml(bl.whatToIgnore || '—')}</p>
    </div>
  `;
}

// ============================================
// No Briefing State
// ============================================
function renderNoBriefing() {
  document.getElementById('dashboard').innerHTML = `
    <div class="no-briefing">
      <div class="no-briefing-icon">📊</div>
      <div class="no-briefing-title">Today's Briefing Not Yet Available</div>
      <div class="no-briefing-subtitle">The daily intelligence briefing is generated at 7:30 AM SGT.</div>
      <div class="no-briefing-time">Next briefing: 7:30 AM SGT</div>
    </div>
  `;
}

// ============================================
// Tab Navigation
// ============================================
function initTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const parent = tab.closest('.section');
      parent.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      parent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.getAttribute('data-tab');
      document.getElementById('tab-' + target).classList.add('active');
    });
  });
}

function initIdeaTabs() {
  document.querySelectorAll('.idea-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.idea-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.idea-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.getAttribute('data-idea-tab');
      document.getElementById('ideas-' + target).classList.add('active');
    });
  });
}

// ============================================
// Utilities
// ============================================
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
