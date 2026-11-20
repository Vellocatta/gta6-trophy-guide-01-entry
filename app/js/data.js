// loadTrophies fetches the guide's own data file (app/data/trophies.json, same origin, offline-safe)
// and returns the parsed document: { game, platform, list, sources, trophies }.
export async function loadTrophies() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error('could not load data/trophies.json');
  return response.json();
}

// sourceByKey looks a source up by its key in the document's sources list.
export function sourceByKey(doc, key) {
  return doc.sources.find((s) => s.key === key) ?? { key, name: key, url: '' };
}

// gradeOrder ranks grades for sorting: platinum first, then gold, silver, bronze.
export const gradeOrder = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

// kindLabel is the human name of a kind filter value.
export const kindLabel = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  characters: 'Characters & Strangers',
  combat: 'Combat & Heists',
  exploration: 'Exploration & Moments',
  money: 'Money & Property',
  platinum: 'Platinum & 100%',
  online: 'Online',
};

// roadmapStages is the five-stage order to the platinum, built from the official descriptions.
export const roadmapStages = [
  {
    stage: 1,
    title: 'Stage 1 — Play the story',
    goal: 'Chapters 1–4 and the final mission. Do the Chapter 1 meditation spot FIRST.',
    note: 'Story trophies unlock by playing the missions in order. There is no mission replay, but nothing here can be failed permanently — except the one meditation spot in Chapter 1, which is the list’s only possibly missable trophy.',
  },
  {
    stage: 2,
    title: 'Stage 2 — Characters & strangers',
    goal: 'The six character finales and 8 stranger strands.',
    note: 'Andy, Kenton, Billy, Randy, Tyrone and Bret each have a final mission; strangers give the silver Strangers & Freaks at 8 finished strands. Stranger missions are not part of 100% completion, so do them for this stage, not for A Long Road.',
  },
  {
    stage: 3,
    title: 'Stage 3 — Activities & ranges',
    goal: 'The 9 activity types, 42 gold range challenges, 14 drone-race locations, 20 race wins.',
    note: 'One try of each activity type earns Master of None. The Shootist needs gold in all 42 Shooting Range challenges — the hardest silver — so learn each range before chasing gold.',
  },
  {
    stage: 4,
    title: 'Stage 4 — Collectibles & the map',
    goal: 'Cards, WAiNK spots, meditation spots, vehicles, areas, gangs, garages.',
    note: 'Sweep Leonida in free roam: 3 card sets, WAiNK It at 100 spots, meditate at 18 spots, discover 100 vehicles, explore 52 areas, rob one illegal operation per gang (9), buy 8 garages, register 10 vehicles in the Scooter Bros app.',
  },
  {
    stage: 5,
    title: 'Stage 5 — Money, heists & moments, then 100%',
    goal: 'Vaults, trucks, shops, laundering — then A Long Road and the platinum.',
    note: 'Rob 5 bank vaults, one armored truck, 3 shops in a row with your partner; launder $250,000 of Marked Bills and spend $100,000 in shops. Then finish the 100% checklist (unlocked after the story) for A Long Road — and Vice Got a Price! pops with it.',
  },
];
