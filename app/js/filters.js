// filters.js — which trophies the checklist shows, and what the spoiler setting hides.

// spoilerMask decides whether a trophy's name and description stay hidden: story trophies
// (kind "story") are masked while the spoiler setting is on and the trophy is not yet earned.
export function spoilerMask(trophy, spoilerOn, earned) {
  return spoilerOn && trophy.kind === 'story' && !earned.has(trophy.name);
}

// applyFilters returns the trophies matching the current controls: kind, grade, status,
// free-text search, and the missable-only kind. "online" matches nothing on purpose:
// the game lists no online trophies, so the empty state says so.
export function applyFilters(trophies, { kind, grade, status, search, earned }) {
  const query = (search ?? '').trim().toLowerCase();
  return trophies.filter((t) => {
    if (kind === 'missable' && !t.missable) return false;
    if (kind === 'online') return false;
    if (kind !== 'all' && kind !== 'missable' && kind !== 'online' && t.kind !== kind) return false;
    if (grade !== 'all' && t.grade !== grade) return false;
    if (status === 'earned' && !earned.has(t.name)) return false;
    if (status === 'todo' && earned.has(t.name)) return false;
    if (query) {
      const haystack = `${t.name} ${t.description} ${t.guide} ${t.kind}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

// nextUnearned is the "Next up" pick: the first not-yet-earned trophy in roadmap order
// (earliest stage first, then the official list order), skipping the platinum itself.
export function nextUnearned(trophies, earned) {
  const ordered = [...trophies]
    .filter((t) => t.kind !== 'platinum')
    .sort((a, b) => a.stage - b.stage || a.id - b.id);
  return ordered.find((t) => !earned.has(t.name)) ?? null;
}

// countByKind counts earned trophies per kind for the header line.
export function countByKind(trophies, earned) {
  const counts = {};
  for (const t of trophies) {
    counts[t.kind] = counts[t.kind] ?? { total: 0, earned: 0 };
    counts[t.kind].total += 1;
    if (earned.has(t.name)) counts[t.kind].earned += 1;
  }
  return counts;
}
