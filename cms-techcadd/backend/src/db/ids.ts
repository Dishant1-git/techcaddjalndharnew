import { randomUUID } from 'node:crypto'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * A primary key for a child row the client may have named itself.
 *
 * Forms generate ids locally so React has stable keys before anything is
 * saved, and those ids are prefixed — `note_<uuid>` is 41 characters, which a
 * CHAR(36) column rejects outright. A client id is therefore only trusted when
 * it is already a plain UUID, which in practice means it came from us on a
 * previous read; anything else gets a fresh one.
 */
export function toStorableId(candidate?: string): string {
  return candidate && UUID.test(candidate) ? candidate : randomUUID()
}
