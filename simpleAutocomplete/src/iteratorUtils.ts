/**
 * Joins multiple iterables into a single iterator.
 * Yields all values from the first iterable, then all values from the second iterable, and so on.
 *
 * @param iterables The iterables to join
 */
export function* join<T>(...iterables: Iterable<T>[]): IterableIterator<T> {
  for (const iterable of iterables) {
    yield* iterable;
  }
}
