import type { Exercise } from '../db/types'

// Pausen-Defaults nach Schoenfeld et al. (2016) & de Salles et al. (2009):
//   Schwere Grundübungen (Kniebeuge, Bankdrücken, Kreuzheben): 180 s
//   Mittlere Verbundübungen (Rudern, Klimmzüge, Dips):         120 s
//   Isolationsübungen (Curls, Seitheben, Trizeps):              90 s
//   Maschinen-Übungen:                                          90 s
//   Rumpf/Bauch:                                                60 s

export const SEED_EXERCISES: Exercise[] = [
  // ── Brust ──────────────────────────────────────────────────────────
  { id: 'seed-bankdruecken',        name: 'Bankdrücken',              muscleGroup: 'Brust',    source: 'seeded', defaultRestSeconds: 180 },
  { id: 'seed-kh-bankdruecken',     name: 'KH-Bankdrücken',           muscleGroup: 'Brust',    source: 'seeded', defaultRestSeconds: 120 },
  { id: 'seed-schraegbankdruecken', name: 'Schrägbankdrücken',        muscleGroup: 'Brust',    source: 'seeded', defaultRestSeconds: 120 },
  { id: 'seed-kh-fliegende',        name: 'KH-Fliegende',             muscleGroup: 'Brust',    source: 'seeded', defaultRestSeconds:  90 },
  { id: 'seed-dips-brust',          name: 'Dips',                     muscleGroup: 'Brust',    source: 'seeded', defaultRestSeconds: 120 },
  { id: 'seed-maschine-brust',      name: 'Brustpresse (Maschine)',   muscleGroup: 'Brust',    source: 'seeded', defaultRestSeconds:  90 },
  { id: 'seed-pec-deck',            name: 'Butterfly / Pec Deck',     muscleGroup: 'Brust',    source: 'seeded', defaultRestSeconds:  90 },
  { id: 'seed-kabel-fliegende',     name: 'Kabelzug-Fliegende',       muscleGroup: 'Brust',    source: 'seeded', defaultRestSeconds:  90 },

  // ── Rücken ─────────────────────────────────────────────────────────
  { id: 'seed-klimmzuege',          name: 'Klimmzüge',                muscleGroup: 'Rücken',   source: 'seeded', defaultRestSeconds: 120 },
  { id: 'seed-lh-rudern',           name: 'LH-Rudern',                muscleGroup: 'Rücken',   source: 'seeded', defaultRestSeconds: 120 },
  { id: 'seed-kh-rudern',           name: 'KH-Rudern',                muscleGroup: 'Rücken',   source: 'seeded', defaultRestSeconds: 120 },
  { id: 'seed-latzug',              name: 'Latzug',                   muscleGroup: 'Rücken',   source: 'seeded', defaultRestSeconds: 120 },
  { id: 'seed-kabelrudern',         name: 'Kabelrudern',              muscleGroup: 'Rücken',   source: 'seeded', defaultRestSeconds:  90 },
  { id: 'seed-kreuzheben',          name: 'Kreuzheben',               muscleGroup: 'Rücken',   source: 'seeded', defaultRestSeconds: 180 },
  { id: 'seed-rudermaschine',       name: 'Rudermaschine',            muscleGroup: 'Rücken',   source: 'seeded', defaultRestSeconds:  90 },
  { id: 'seed-hyperextension',      name: 'Hyperextension',           muscleGroup: 'Rücken',   source: 'seeded', defaultRestSeconds:  90 },

  // ── Schultern ──────────────────────────────────────────────────────
  { id: 'seed-schulterdruecken',    name: 'Schulterdrücken',          muscleGroup: 'Schultern', source: 'seeded', defaultRestSeconds: 180 },
  { id: 'seed-kh-schulterdruecken', name: 'KH-Schulterdrücken',       muscleGroup: 'Schultern', source: 'seeded', defaultRestSeconds: 120 },
  { id: 'seed-seitheben',           name: 'Seitheben',                muscleGroup: 'Schultern', source: 'seeded', defaultRestSeconds:  90 },
  { id: 'seed-frontheben',          name: 'Frontheben',               muscleGroup: 'Schultern', source: 'seeded', defaultRestSeconds:  90 },
  { id: 'seed-facepull',            name: 'Face Pull',                muscleGroup: 'Schultern', source: 'seeded', defaultRestSeconds:  90 },
  { id: 'seed-maschine-schulter',   name: 'Schulterpresse (Maschine)', muscleGroup: 'Schultern', source: 'seeded', defaultRestSeconds:  90 },
  { id: 'seed-kabel-seitheben',     name: 'Seitheben (Kabel)',         muscleGroup: 'Schultern', source: 'seeded', defaultRestSeconds:  90 },

  // ── Bizeps ─────────────────────────────────────────────────────────
  { id: 'seed-bizepscurl',          name: 'Bizepscurl',               muscleGroup: 'Bizeps',   source: 'seeded', defaultRestSeconds:  90 },
  { id: 'seed-hammer-curl',         name: 'Hammer Curl',              muscleGroup: 'Bizeps',   source: 'seeded', defaultRestSeconds:  90 },
  { id: 'seed-kh-curl',             name: 'KH-Curl',                  muscleGroup: 'Bizeps',   source: 'seeded', defaultRestSeconds:  90 },
  { id: 'seed-prediger-curl',       name: 'Prediger-Curl',            muscleGroup: 'Bizeps',   source: 'seeded', defaultRestSeconds:  90 },
  { id: 'seed-kabelcurl',           name: 'Kabelcurl',                muscleGroup: 'Bizeps',   source: 'seeded', defaultRestSeconds:  90 },

  // ── Trizeps ────────────────────────────────────────────────────────
  { id: 'seed-trizepsdruecken',     name: 'Trizepsdrücken (Kabel)',   muscleGroup: 'Trizeps',  source: 'seeded', defaultRestSeconds:  90 },
  { id: 'seed-enges-bankdruecken',  name: 'Enges Bankdrücken',        muscleGroup: 'Trizeps',  source: 'seeded', defaultRestSeconds: 120 },
  { id: 'seed-schaedelbrecher',     name: 'Schädelbrecher',           muscleGroup: 'Trizeps',  source: 'seeded', defaultRestSeconds:  90 },
  { id: 'seed-trizeps-overhead',    name: 'Trizeps Overhead (Kabel)', muscleGroup: 'Trizeps',  source: 'seeded', defaultRestSeconds:  90 },
  { id: 'seed-maschine-trizeps',    name: 'Trizepspresse (Maschine)', muscleGroup: 'Trizeps',  source: 'seeded', defaultRestSeconds:  90 },

  // ── Beine ──────────────────────────────────────────────────────────
  { id: 'seed-kniebeuge',           name: 'Kniebeuge',                muscleGroup: 'Beine',    source: 'seeded', defaultRestSeconds: 180 },
  { id: 'seed-beinpresse',          name: 'Beinpresse',               muscleGroup: 'Beine',    source: 'seeded', defaultRestSeconds: 150 },
  { id: 'seed-ausfallschritte',     name: 'Ausfallschritte',          muscleGroup: 'Beine',    source: 'seeded', defaultRestSeconds: 120 },
  { id: 'seed-beinstrecker',        name: 'Beinstrecker',             muscleGroup: 'Beine',    source: 'seeded', defaultRestSeconds:  90 },
  { id: 'seed-beincurl',            name: 'Bein-Curl',                muscleGroup: 'Beine',    source: 'seeded', defaultRestSeconds:  90 },
  { id: 'seed-wadenheben',          name: 'Wadenheben',               muscleGroup: 'Beine',    source: 'seeded', defaultRestSeconds:  60 },
  { id: 'seed-sumo-kreuzheben',     name: 'Sumo-Kreuzheben',          muscleGroup: 'Beine',    source: 'seeded', defaultRestSeconds: 180 },
  { id: 'seed-hip-thrust',          name: 'Hip Thrust',               muscleGroup: 'Beine',    source: 'seeded', defaultRestSeconds: 150 },
  { id: 'seed-hackenschmidt',       name: 'Hackenschmidt',            muscleGroup: 'Beine',    source: 'seeded', defaultRestSeconds: 150 },
  { id: 'seed-abduktoren',          name: 'Abduktoren-Maschine',      muscleGroup: 'Beine',    source: 'seeded', defaultRestSeconds:  60 },
  { id: 'seed-adduktoren',          name: 'Adduktoren-Maschine',      muscleGroup: 'Beine',    source: 'seeded', defaultRestSeconds:  60 },
  { id: 'seed-waden-maschine',      name: 'Waden-Maschine',           muscleGroup: 'Beine',    source: 'seeded', defaultRestSeconds:  60 },

  // ── Bauch ──────────────────────────────────────────────────────────
  { id: 'seed-crunches',            name: 'Crunches',                 muscleGroup: 'Bauch',    source: 'seeded', defaultRestSeconds:  60 },
  { id: 'seed-beinheben',           name: 'Beinheben',                muscleGroup: 'Bauch',    source: 'seeded', defaultRestSeconds:  60 },
  { id: 'seed-russian-twist',       name: 'Russian Twist',            muscleGroup: 'Bauch',    source: 'seeded', defaultRestSeconds:  60 },
  { id: 'seed-kabelcrunches',       name: 'Kabelcrunches',            muscleGroup: 'Bauch',    source: 'seeded', defaultRestSeconds:  60 },
  { id: 'seed-ab-roller',           name: 'Ab-Roller',                muscleGroup: 'Bauch',    source: 'seeded', defaultRestSeconds:  60 },
  { id: 'seed-bauchpresse',         name: 'Bauchpresse (Maschine)',   muscleGroup: 'Bauch',    source: 'seeded', defaultRestSeconds:  60 },
]
