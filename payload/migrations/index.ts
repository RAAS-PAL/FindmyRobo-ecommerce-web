import * as migration_20260924_075518_initial from './20260924_075518_initial';
import * as migration_20260924_075900_media_storage_fields from './20260924_075900_media_storage_fields';
import * as migration_20260924_080000_seed_content from './20260924_080000_seed_content';
import * as migration_20260928_083000_about_story from './20260928_083000_about_story';

export const migrations = [
  {
    up: migration_20260924_075518_initial.up,
    down: migration_20260924_075518_initial.down,
    name: '20260924_075518_initial',
  },
  {
    up: migration_20260924_075900_media_storage_fields.up,
    down: migration_20260924_075900_media_storage_fields.down,
    name: '20260924_075900_media_storage_fields',
  },
  {
    up: migration_20260924_080000_seed_content.up,
    down: migration_20260924_080000_seed_content.down,
    name: '20260924_080000_seed_content',
  },
  {
    up: migration_20260928_083000_about_story.up,
    down: migration_20260928_083000_about_story.down,
    name: '20260928_083000_about_story',
  },
];
