import * as migration_20260924_075518_initial from './20260924_075518_initial';
import * as migration_20260924_080000_seed_content from './20260924_080000_seed_content';

export const migrations = [
  {
    up: migration_20260924_075518_initial.up,
    down: migration_20260924_075518_initial.down,
    name: '20260924_075518_initial'
  },
  {
    up: migration_20260924_080000_seed_content.up,
    down: migration_20260924_080000_seed_content.down,
    name: '20260924_080000_seed_content'
  },
];
