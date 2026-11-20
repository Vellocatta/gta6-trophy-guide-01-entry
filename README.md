# Vice Ledger — GTA VI Trophy Guide &amp; Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Vellocatta/gta6-trophy-guide-01-entry/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Vellocatta/gta6-trophy-guide-01-entry/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

The best offline guide and tracker for the 55 PlayStation 5 trophies of
Grand Theft Auto VI. Static files, no build step, no network: serve `app/`
with any static server and open `index.html` in a desktop browser.

## What it does

- **Every trophy, official** — all 55 names, descriptions and grades exactly
  as PlayStation publishes them (1 platinum, 2 gold, 6 silver, 46 bronze),
  with PSN's tracked counts where a trophy has one.
- **A guide for each, in its own words** — what to do, where and how, and
  when it can be missed, with the source named beside every guide
  (Exophase, PSNProfiles, GTABase, Push Square and others). Where a trigger
  is not pinned down in any source checked, the guide says so instead of
  inventing one.
- **A tracker that remembers** — tick trophies off and the ticks stay saved
  in the browser (localStorage). Export progress to a file and import it
  back; reset any time.
- **Filters that answer questions** — by kind (story, missable,
  collectibles, activities, characters, combat, exploration, money,
  platinum), by grade, by earned status, and free-text search. The Online
  filter honestly shows nothing: all 55 trophies are single-player.
- **A spoiler setting** — on by default, it hides the names and descriptions
  of the 12 story trophies until they are earned.
- **A roadmap to the platinum** — five stages built from the official
  descriptions, in the order to earn them, with per-stage counts.
- **Missables, flagged once** — only Positive Mental Attitude is reported as
  possibly missable (Lucia's Chapter 1 balcony meditation); everything else
  is safe in free roam after the story.
- **Next up** — the next unearned trophy in roadmap order, so you always
  know what to do next.

## Run it

```sh
node serve.ts        # serves app/ at http://localhost:8080
```

Deep links: `?view=roadmap`, `?view=missables`, `?kind=story`,
`?spoiler=off`, `?select=Positive%20Mental%20Attitude`, `?demo=1` (seeds
the fixed 13-trophy demo progress on a fresh browser).

## Design tournament

Eight layouts were compared head-to-head against the judge's criteria
(tracker first, roadmap/missables second, cited guides third, polish
fourth) — see `tournament.md`. The winner: a two-pane checklist with a
persistent detail pane, tabs for Roadmap / Missables / Sources, a paper
look with a coral accent.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and
`screenshots/` to the output directory and writes `dossier.json` with the
vendored make.fun library. No Rockstar Games logo, artwork or game
screenshot is used anywhere.
