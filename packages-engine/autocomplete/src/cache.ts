import type { AutocompleteCache } from './types'

interface CacheEntry<V> {
  key: string
  value: V
  prev: CacheEntry<V> | undefined
  next: CacheEntry<V> | undefined
}

/**
 * Minimal LRU cache backed by a `Map` and a doubly linked list.
 *
 * Only implements the operations needed by the autocomplete cache, so the
 * package does not have to depend on a full-featured cache library.
 *
 * @internal
 */
export class LRUCache<V> implements AutocompleteCache<V> {
  private readonly map = new Map<string, CacheEntry<V>>()
  private head: CacheEntry<V> | undefined
  private tail: CacheEntry<V> | undefined

  constructor(private readonly max: number) {}

  get size(): number {
    return this.map.size
  }

  has(key: string): boolean {
    return this.map.has(key)
  }

  get(key: string): V | undefined {
    const entry = this.map.get(key)
    if (entry === undefined)
      return undefined
    if (entry !== this.tail)
      this.moveToTail(entry)
    return entry.value
  }

  set(key: string, value: V): void {
    const entry = this.map.get(key)
    if (entry !== undefined) {
      entry.value = value
      if (entry !== this.tail)
        this.moveToTail(entry)
      return
    }

    const node: CacheEntry<V> = { key, value, prev: this.tail, next: undefined }
    if (this.tail !== undefined)
      this.tail.next = node
    else
      this.head = node
    this.tail = node
    this.map.set(key, node)

    if (this.map.size > this.max)
      this.evict()
  }

  clear(): void {
    this.map.clear()
    this.head = undefined
    this.tail = undefined
  }

  private moveToTail(entry: CacheEntry<V>): void {
    const { prev, next } = entry

    if (prev !== undefined)
      prev.next = next
    else
      this.head = next
    if (next !== undefined)
      next.prev = prev

    entry.prev = this.tail
    entry.next = undefined
    if (this.tail !== undefined)
      this.tail.next = entry
    this.tail = entry
  }

  private evict(): void {
    const head = this.head
    if (head === undefined)
      return

    this.head = head.next
    if (this.head !== undefined)
      this.head.prev = undefined
    else
      this.tail = undefined

    this.map.delete(head.key)
  }
}
