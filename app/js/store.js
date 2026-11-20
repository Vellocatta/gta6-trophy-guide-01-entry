// store.js — earned progress and settings, saved in the browser (localStorage), with export/import.
// Nothing leaves the machine: no account, no server, no network.

// loadEarned reads the saved set of earned trophy names (an array of names in localStorage).
export function loadEarned() {
  try {
    const raw = localStorage.getItem('vice-ledger-earned');
    const list = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(list) ? list.filter((n) => typeof n === 'string') : []);
  } catch {
    return new Set();
  }
}

// saveEarned writes the earned set back to localStorage.
export function saveEarned(earned) {
  localStorage.setItem('vice-ledger-earned', JSON.stringify([...earned]));
}

// loadSettings reads the saved spoiler and filter settings.
export function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem('vice-ledger-settings') ?? '{}') ?? {};
  } catch {
    return {};
  }
}

// saveSettings writes the spoiler and filter settings.
export function saveSettings(settings) {
  localStorage.setItem('vice-ledger-settings', JSON.stringify(settings));
}

// exportProgress downloads the earned set as a JSON file the app can import back.
export function exportProgress(earned) {
  const blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned] }, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'vice-ledger-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

// importProgress reads an exported progress file and returns its earned set (or throws).
export async function importProgress(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  const list = Array.isArray(data) ? data : data.earned;
  if (!Array.isArray(list)) throw new Error('not a Vice Ledger progress file');
  return new Set(list.filter((n) => typeof n === 'string'));
}

// demoEarned is the fixed demo set (?demo=1): 13 earned, the early story plus a first few activities,
// so a fresh visitor sees the tracker, the progress bar and the guide pane working.
export const demoEarned = [
  'Just Like Paradise',
  'Paradise Lost',
  'Trust',
  'Break the Bank',
  'Family Matters',
  'DWNFALL',
  'Master of None',
  'Stick Fiddler',
  'Baited My Tackle',
  'In The Beginning…',
  'Let’s Go Bowling',
  'Whip It Good',
  'On the Spot',
];
