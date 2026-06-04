import type { Exercise } from '../db/types'

export const SEED_EXERCISES: Exercise[] = [
  // Brust
  { id: 'seed-bankdruecken',        name: 'Bankdrücken',           muscleGroup: 'Brust',    source: 'seeded' },
  { id: 'seed-kh-bankdruecken',     name: 'KH-Bankdrücken',        muscleGroup: 'Brust',    source: 'seeded' },
  { id: 'seed-schraegbankdruecken', name: 'Schrägbankdrücken',     muscleGroup: 'Brust',    source: 'seeded' },
  { id: 'seed-kh-fliegende',        name: 'KH-Fliegende',          muscleGroup: 'Brust',    source: 'seeded' },
  { id: 'seed-dips-brust',          name: 'Dips',                  muscleGroup: 'Brust',    source: 'seeded' },
  // Rücken
  { id: 'seed-klimmzuege',          name: 'Klimmzüge',             muscleGroup: 'Rücken',   source: 'seeded' },
  { id: 'seed-lh-rudern',           name: 'LH-Rudern',             muscleGroup: 'Rücken',   source: 'seeded' },
  { id: 'seed-kh-rudern',           name: 'KH-Rudern',             muscleGroup: 'Rücken',   source: 'seeded' },
  { id: 'seed-latzug',              name: 'Latzug',                muscleGroup: 'Rücken',   source: 'seeded' },
  { id: 'seed-kabelrudern',         name: 'Kabelrudern',           muscleGroup: 'Rücken',   source: 'seeded' },
  { id: 'seed-kreuzheben',          name: 'Kreuzheben',            muscleGroup: 'Rücken',   source: 'seeded' },
  // Schultern
  { id: 'seed-schulterdruecken',    name: 'Schulterdrücken',       muscleGroup: 'Schultern', source: 'seeded' },
  { id: 'seed-kh-schulterdruecken', name: 'KH-Schulterdrücken',    muscleGroup: 'Schultern', source: 'seeded' },
  { id: 'seed-seitheben',           name: 'Seitheben',             muscleGroup: 'Schultern', source: 'seeded' },
  { id: 'seed-frontheben',          name: 'Frontheben',            muscleGroup: 'Schultern', source: 'seeded' },
  { id: 'seed-facepull',            name: 'Face Pull',             muscleGroup: 'Schultern', source: 'seeded' },
  // Bizeps
  { id: 'seed-bizepscurl',          name: 'Bizepscurl',            muscleGroup: 'Bizeps',   source: 'seeded' },
  { id: 'seed-hammer-curl',         name: 'Hammer Curl',           muscleGroup: 'Bizeps',   source: 'seeded' },
  { id: 'seed-kh-curl',             name: 'KH-Curl',               muscleGroup: 'Bizeps',   source: 'seeded' },
  // Trizeps
  { id: 'seed-trizepsdruecken',     name: 'Trizepsdrücken (Kabel)', muscleGroup: 'Trizeps', source: 'seeded' },
  { id: 'seed-enges-bankdruecken',  name: 'Enges Bankdrücken',     muscleGroup: 'Trizeps',  source: 'seeded' },
  { id: 'seed-schaedelbrecher',     name: 'Schädelbrecher',        muscleGroup: 'Trizeps',  source: 'seeded' },
  // Beine
  { id: 'seed-kniebeuge',           name: 'Kniebeuge',             muscleGroup: 'Beine',    source: 'seeded' },
  { id: 'seed-beinpresse',          name: 'Beinpresse',            muscleGroup: 'Beine',    source: 'seeded' },
  { id: 'seed-ausfallschritte',     name: 'Ausfallschritte',       muscleGroup: 'Beine',    source: 'seeded' },
  { id: 'seed-beinstrecker',        name: 'Beinstrecker',          muscleGroup: 'Beine',    source: 'seeded' },
  { id: 'seed-beincurl',            name: 'Bein-Curl',             muscleGroup: 'Beine',    source: 'seeded' },
  { id: 'seed-wadenheben',          name: 'Wadenheben',            muscleGroup: 'Beine',    source: 'seeded' },
  { id: 'seed-sumo-kreuzheben',     name: 'Sumo-Kreuzheben',       muscleGroup: 'Beine',    source: 'seeded' },
  // Bauch
  { id: 'seed-crunches',            name: 'Crunches',              muscleGroup: 'Bauch',    source: 'seeded' },
  { id: 'seed-beinheben',           name: 'Beinheben',             muscleGroup: 'Bauch',    source: 'seeded' },
  { id: 'seed-russian-twist',       name: 'Russian Twist',         muscleGroup: 'Bauch',    source: 'seeded' },
  { id: 'seed-kabelcrunches',       name: 'Kabelcrunches',         muscleGroup: 'Bauch',    source: 'seeded' },
]
