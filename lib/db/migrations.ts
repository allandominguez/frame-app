// Current schema (after all migrations):
//
// day_entries
//   date             TEXT  PK NOT NULL
//   photo_path       TEXT
//   note_text        TEXT
//   latitude         REAL
//   longitude        REAL
//   location_name    TEXT
//   location_source  TEXT    -- 'exif' | 'device' | 'place'
//   created_at       TEXT  NOT NULL
//   updated_at       TEXT  NOT NULL
//   accent_color     TEXT    -- hex string e.g. '#A3C4F5'; vibrant swatch cached at photo save time
//   share_color      TEXT    -- colour name key e.g. 'blue'; mapped to circle emoji at share time
//
// settings
//   key              TEXT  PK NOT NULL
//   value            TEXT

import { migration as v1 } from './migrations/001_initial_schema'
import { migration as v2 } from './migrations/002_add_color_columns'

export const migrations: string[] = [v1, v2]
