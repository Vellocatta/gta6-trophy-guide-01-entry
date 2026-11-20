// main.js — Vice Ledger boot: loads the trophy data, restores saved progress and settings,
// wires the controls, and renders the checklist, roadmap, missables and sources views.
// Deep links: ?view=checklist|roadmap|missables|sources, ?spoiler=on|off, ?kind=<kind>,
// ?select=<trophy name>, ?demo=1 (seeds the fixed 13-trophy demo progress on a fresh browser).

import { loadTrophies } from './data.js';
import { demoEarned, exportProgress, importProgress, loadEarned, loadSettings, saveEarned, saveSettings } from './store.js';
import { renderChecklist, renderDetail, renderKindCounts, renderMissables, renderNextUp, renderProgress, renderRoadmap, renderSources } from './views.js';

// bootViceLedger is the entry point: everything runs after the data file loads.
async function bootViceLedger() {
  const doc = await loadTrophies();
  const params = new URLSearchParams(location.search);
  const earned = loadEarned();
  const saved = loadSettings();

  // bootState holds the checklist controls and the selected trophy.
  const state = {
    earned,
    kind: params.get('kind') ?? saved.kind ?? 'all',
    grade: saved.grade ?? 'all',
    status: saved.status ?? 'all',
    search: '',
    spoilerOn: params.get('spoiler') ? params.get('spoiler') !== 'off' : saved.spoilerOn !== false,
    selected: params.get('select') ?? null,
    onToggle: toggleEarned,
  };

  // toggleEarned flips one trophy and saves, then re-renders every view that shows it.
  function toggleEarned(name, value) {
    if (value) earned.add(name);
    else earned.delete(name);
    saveEarned(earned);
    renderAll();
  }

  // renderAll redraws the progress header, the checklist, the detail pane and the stage pages.
  function renderAll() {
    renderProgress(doc, earned);
    renderNextUp(doc, earned);
    renderKindCounts(doc, earned);
    renderChecklist(doc, state, selectTrophy);
    renderDetail(doc, state, state.selected);
    renderRoadmap(doc, earned);
    renderMissables(doc, earned);
  }

  // selectTrophy opens a trophy in the detail pane beside the checklist.
  function selectTrophy(name) {
    state.selected = name;
    renderChecklist(doc, state, selectTrophy);
    renderDetail(doc, state, name);
  }

  // showView switches the four tabs and remembers the choice in the address bar.
  function showView(view) {
    for (const tab of document.querySelectorAll('.tab')) {
      tab.classList.toggle('active', tab.dataset.view === view);
    }
    for (const section of document.querySelectorAll('.view')) {
      section.hidden = section.id !== `view-${view}`;
    }
    const url = new URL(location.href);
    url.searchParams.set('view', view);
    history.replaceState(null, '', url);
  }

  // Demo mode seeds the fixed 13-trophy demo progress, but only on a fresh browser
  // (a visitor with saved progress keeps their own ticks).
  if (params.get('demo') === '1' && earned.size === 0) {
    for (const name of demoEarned) earned.add(name);
    saveEarned(earned);
  }
  if (!state.selected) {
    const first = doc.trophies.find((t) => t.missable);
    state.selected = first ? first.name : doc.trophies[0].name;
  }

  document.getElementById('kind').value = state.kind;
  document.getElementById('grade').value = state.grade;
  document.getElementById('status').value = state.status;
  document.getElementById('spoiler').checked = state.spoilerOn;

  document.getElementById('search').addEventListener('input', (event) => {
    state.search = event.target.value;
    renderChecklist(doc, state, selectTrophy);
  });
  document.getElementById('kind').addEventListener('change', (event) => {
    state.kind = event.target.value;
    saveSettings({ ...loadSettings(), kind: state.kind });
    renderChecklist(doc, state, selectTrophy);
  });
  document.getElementById('grade').addEventListener('change', (event) => {
    state.grade = event.target.value;
    saveSettings({ ...loadSettings(), grade: state.grade });
    renderChecklist(doc, state, selectTrophy);
  });
  document.getElementById('status').addEventListener('change', (event) => {
    state.status = event.target.value;
    saveSettings({ ...loadSettings(), status: state.status });
    renderChecklist(doc, state, selectTrophy);
  });
  document.getElementById('spoiler').addEventListener('change', (event) => {
    state.spoilerOn = event.target.checked;
    saveSettings({ ...loadSettings(), spoilerOn: state.spoilerOn });
    renderAll();
  });
  document.getElementById('export').addEventListener('click', () => exportProgress(earned));
  document.getElementById('import').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const imported = await importProgress(file);
      earned.clear();
      for (const name of imported) earned.add(name);
      saveEarned(earned);
      renderAll();
    } catch {
      alert('That file is not a Vice Ledger progress export.');
    }
    event.target.value = '';
  });
  document.getElementById('reset').addEventListener('click', () => {
    if (confirm('Clear all earned ticks?')) {
      earned.clear();
      saveEarned(earned);
      renderAll();
    }
  });
  for (const tab of document.querySelectorAll('.tab')) {
    tab.addEventListener('click', () => showView(tab.dataset.view));
  }

  renderSources(doc);
  renderAll();
  showView(params.get('view') ?? 'checklist');
}

bootViceLedger().catch((error) => {
  document.getElementById('detail').textContent = `The guide could not load its data file: ${error.message}`;
});
