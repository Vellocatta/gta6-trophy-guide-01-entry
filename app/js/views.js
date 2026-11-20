// views.js — every screen the guide shows: the checklist, the trophy detail pane,
// the roadmap, the missables page and the sources page. All rendering is plain DOM, no libraries.

import { gradeOrder, kindLabel, roadmapStages, sourceByKey } from './data.js';
import { applyFilters, countByKind, nextUnearned, spoilerMask } from './filters.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function gradeBadge(grade) {
  return el('span', `grade grade-${grade}`, grade);
}

// renderProgress updates the header: the big earned count, the bar, and the platinum line.
export function renderProgress(doc, earned) {
  const total = doc.trophies.length;
  document.getElementById('progressBig').textContent = `${earned.size} / ${total} earned`;
  document.getElementById('progressFill').style.width = `${Math.round((earned.size / total) * 100)}%`;
  document.getElementById('progressNote').textContent = earned.has('Vice Got a Price!')
    ? 'Platinum earned — you are a Leonida Legend.'
    : earned.has('A Long Road')
      ? '100% done — only the platinum is left.'
      : `Platinum: Vice Got a Price! — ${total - earned.size} to go.`;
}

// renderNextUp shows the next trophy in roadmap order, with the reason it is next.
export function renderNextUp(doc, earned) {
  const next = nextUnearned(doc.trophies, earned);
  const box = document.getElementById('nextUp');
  if (!next) {
    box.innerHTML = '';
    box.append(el('strong', null, 'Platinum earned. '), document.createTextNode('Every trophy is checked off — you are a Leonida Legend.'));
    return;
  }
  const stage = roadmapStages.find((s) => s.stage === next.stage);
  box.innerHTML = '';
  box.append(el('strong', null, 'Next up: '), document.createTextNode(`${next.name} — ${next.description} `));
  const why = el('span', null, `(${stage ? stage.title : ''} · ${next.missable ? 'missable — do it before its window closes' : 'roadmap order'})`);
  box.append(why);
}

// renderKindCounts shows the earned/total count for each kind under the controls.
export function renderKindCounts(doc, earned) {
  const counts = countByKind(doc.trophies, earned);
  const parts = Object.keys(counts)
    .sort()
    .map((kind) => `${kindLabel[kind] ?? kind}: ${counts[kind].earned}/${counts[kind].total}`);
  document.getElementById('kindCounts').textContent = parts.join(' · ');
}

// renderChecklist draws the filtered trophy table and wires each row to the detail pane.
export function renderChecklist(doc, state, onSelect) {
  const rows = document.getElementById('rows');
  const shown = applyFilters(doc.trophies, state);
  const empty = document.getElementById('emptyNote');
  rows.replaceChildren();
  if (state.kind === 'online') {
    empty.hidden = false;
    empty.textContent = 'No online trophies: all 55 are single-player and offline. GTABase and the official list agree — there is nothing to track under Online.';
  } else if (shown.length === 0) {
    empty.hidden = false;
    empty.textContent = 'No trophies match these filters. Clear the search or pick another kind.';
  } else {
    empty.hidden = true;
  }
  for (const t of shown) {
    const tr = document.createElement('tr');
    if (state.selected === t.name) tr.classList.add('selected');
    if (state.earned.has(t.name)) tr.classList.add('earnedRow');
    const boxCell = document.createElement('td');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = state.earned.has(t.name);
    box.setAttribute('aria-label', `Mark ${t.name} earned`);
    box.addEventListener('click', (event) => event.stopPropagation());
    box.addEventListener('change', () => state.onToggle(t.name, box.checked));
    boxCell.append(box);
    tr.append(boxCell);

    const nameCell = document.createElement('td');
    if (spoilerMask(t, state.spoilerOn, state.earned)) {
      nameCell.append(el('span', 'spoilerHidden', 'Hidden story trophy — earn it to reveal its name.'));
      nameCell.append(el('span', 'flagHidden', 'SPOILER'));
    } else {
      const name = el('span', 'trophyName', t.name);
      nameCell.append(name);
      if (t.missable) nameCell.append(el('span', 'flagMissable', 'MISSABLE'));
      if (t.hidden) nameCell.append(el('span', 'flagHidden', 'HIDDEN'));
      nameCell.append(el('span', 'trophyDesc', t.description));
    }
    tr.append(nameCell);

    const gradeCell = document.createElement('td');
    gradeCell.append(gradeBadge(t.grade));
    tr.append(gradeCell);

    const kindCell = document.createElement('td');
    kindCell.append(el('span', 'kindTag', kindLabel[t.kind] ?? t.kind));
    if (t.target) kindCell.append(el('span', 'kindTag', ` · ${t.target.toLocaleString('en-US')}`));
    tr.append(kindCell);

    tr.addEventListener('click', () => onSelect(t.name));
    rows.append(tr);
  }
}

// renderDetail shows one trophy: its official name, description and grade, the own-words guide,
// its sources, and the earned toggle. Story trophies stay masked here too while spoilers are on.
export function renderDetail(doc, state, name) {
  const pane = document.getElementById('detail');
  const t = doc.trophies.find((x) => x.name === name);
  pane.replaceChildren();
  if (!t) {
    pane.append(el('h3', null, 'Pick a trophy'));
    pane.append(el('p', null, 'Select any row on the left to read its official description, its guide in this entry’s own words, and the sources each fact comes from.'));
    return;
  }
  if (spoilerMask(t, state.spoilerOn, state.earned)) {
    pane.append(el('h3', null, 'Hidden story trophy'));
    pane.append(el('p', null, 'Spoilers are on: this story trophy’s name and description stay hidden until you earn it. Turn “Hide story spoilers” off to read it, or tick it earned below.'));
    const button = el('button', 'earnButton', 'Mark earned — reveal it');
    button.addEventListener('click', () => state.onToggle(t.name, true));
    pane.append(button);
    return;
  }
  pane.append(el('h3', null, t.name));
  const meta = el('p', 'detailMeta', `${t.grade} · ${kindLabel[t.kind] ?? t.kind}${t.target ? ` · PSN target: ${t.target.toLocaleString('en-US')}` : ''}${t.missable ? ' · MISSABLE' : ''}${t.hidden ? ' · hidden on PSN' : ''}`);
  pane.append(meta);
  const official = el('div', 'official');
  official.append(el('p', null, 'Official description (PlayStation):'));
  const desc = el('p', null);
  desc.append(el('strong', null, t.description));
  official.append(desc);
  pane.append(official);
  pane.append(el('p', 'guideText', t.guide));
  const sources = el('p', 'sourcesLine', 'Sources: ');
  t.sources.forEach((key, i) => {
    const s = sourceByKey(doc, key);
    if (i > 0) sources.append(document.createTextNode(' · '));
    const link = document.createElement('a');
    link.href = s.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = s.name;
    sources.append(link);
  });
  sources.append(document.createTextNode(' — the name, description and grade are the official list; the guide above is this entry’s own words.'));
  pane.append(sources);
  const isEarned = state.earned.has(t.name);
  const button = el('button', `earnButton${isEarned ? ' earned' : ''}`, isEarned ? '✓ Earned — unmark' : 'Mark earned');
  button.addEventListener('click', () => state.onToggle(t.name, !isEarned));
  pane.append(button);
}

// renderRoadmap draws the five stages, each with its trophies, earned state and counts.
export function renderRoadmap(doc, earned) {
  const host = document.getElementById('roadmap');
  host.replaceChildren();
  for (const stage of roadmapStages) {
    const members = doc.trophies
      .filter((t) => t.stage === stage.stage && t.kind !== 'platinum')
      .sort((a, b) => a.id - b.id);
    const done = members.filter((t) => earned.has(t.name)).length;
    const card = el('div', 'stage');
    const head = el('div', 'stageHead');
    head.append(el('h3', null, stage.title));
    head.append(el('span', 'stageCount', `${done} / ${members.length} earned`));
    card.append(head);
    card.append(el('p', null, stage.goal));
    card.append(el('p', null, stage.note));
    const list = document.createElement('ul');
    for (const t of members) {
      const li = document.createElement('li');
      if (earned.has(t.name)) li.classList.add('done');
      li.append(el('span', 'stageItemName', `${t.name} — ${t.description}`));
      if (t.missable) li.append(el('span', 'flagMissable', 'MISSABLE'));
      list.append(li);
    }
    card.append(list);
    host.append(card);
  }
  const final = el('div', 'stage');
  final.append(el('h3', null, 'The finish — A Long Road, then the platinum'));
  final.append(el('p', null, 'The 100% checklist unlocks after the story. Finish it for A Long Road (gold), and Vice Got a Price! (platinum) pops the moment the other 54 are done. GTABase puts the whole run at around 200 hours; Push Square at 300 or more.'));
  host.append(final);
}

// renderMissables lists the one possibly-missable trophy with its warning, then the safe ones.
export function renderMissables(doc, earned) {
  const host = document.getElementById('missables');
  host.replaceChildren();
  const missable = doc.trophies.filter((t) => t.missable);
  for (const t of missable) {
    const card = el('div', 'missableCard');
    card.append(el('h3', null, `${t.name} — MISSABLE`));
    card.append(el('p', null, t.description));
    card.append(el('p', null, t.guide));
    card.append(el('p', null, 'Flagged by GTABase and PowerPyx as the only trophy reported as possibly missable: Lucia’s balcony meditation in Chapter 1 disappears after that chapter. Do it before Chapter 1 closes — everything else on this page can wait until free roam.'));
    host.append(card);
  }
  const safe = el('div', 'missableCard safe');
  safe.append(el('h3', null, 'Everything else: safe after the story'));
  safe.append(el('p', null, 'The other 54 trophies can all be finished in free roam after the credits — there is no mission replay and no New Game+, but the open world stays open, and the 100% checklist unlocks once the story is done. Story trophies unlock by playing the missions; they cannot be missed, only left unfinished. The character finales, the stranger strands, the ranges, the collectibles and the heists all stay available.'));
  const count = doc.trophies.filter((t) => !t.missable && t.kind !== 'platinum').length;
  safe.append(el('p', null, `${count} trophies are safe to leave until after the story. Only the one above has a window that closes.`));
  host.append(safe);
}

// renderSources lists every source the guides cite, plus the honesty notes.
export function renderSources(doc) {
  const host = document.getElementById('sources');
  host.replaceChildren();
  const intro = el('p', 'lede', 'Every guide in this entry is written in its own words for this entry. The official trophy names, descriptions and grades are shown as PlayStation publishes them; the counts are PSN’s tracked targets. Where a guide’s exact trigger is not pinned down in any source checked, the guide says so instead of inventing one.');
  host.append(intro);
  const list = el('div', 'sourceList');
  list.append(el('h3', null, 'Sources cited by the guides'));
  const ul = document.createElement('ul');
  for (const s of doc.sources) {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = s.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = s.name;
    li.append(link);
    ul.append(li);
  }
  list.append(ul);
  list.append(el('p', null, 'Also consulted for the roadmap and the missable flag: PowerPyx’s GTA 6 trophy guide (GTABase and PowerPyx agree that Positive Mental Attitude is the only possibly missable trophy). No guide text is copied from any of these sources.'));
  list.append(el('p', null, 'List checked 20 November 2026, the day after launch. If a later patch changes a count or a trigger, the guide’s “not pinned down” notes are the places to re-check first.'));
  host.append(list);
}
