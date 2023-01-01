import { Snap } from '/Snap/index.js';
import { last } from '/Utils/helpers.js';

interface ISnapData {
  snaps: Snap[];
}

/**
 * Snap manager
 * Allow taking snapshots and track them on a timeline and
 * provide different way to access and navigate the snapshots.
 * With a Concise API
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Snapman<TMapDef extends Record<string, any> = any> {
  private _snapsTimeLine: Snap[] = [];

  private _snapsMap: Map<string, ISnapData> = new Map();

  /**
   * Create a snapshot with id
   * (all snaps are deep cloned. You never think about references what accessing them)
   * Snaps are added to a timeline and can be retrieved later by id, or by index
   * and by using Snap.next() Snap.prev() calls as well.
   * @param id snap id
   * @param val snap deep cloned value
   * @returns this
   */
  public snap<TId extends string>(id: string, val?: TMapDef[TId]): this {
    const snapData = this._snapsMap.get(id);

    const _addSnapToMapAndTimeLine = (snapId: string) => {
      const snap = new Snap({
        id: snapId,
        timelineIndex: this._snapsTimeLine.length,
        val,
        snapman: this,
      });
      this._snapsMap.set(snapId, {
        snaps: [snap],
      });
      this._snapsTimeLine.push(snap);
      return snap;
    };

    if (snapData) {
      const snapId = `${id}:${snapData.snaps.length + 1}`;
      const snap = _addSnapToMapAndTimeLine(snapId);
      snapData.snaps.push(snap);
      return this;
    }

    _addSnapToMapAndTimeLine(id);

    return this;
  }

  /**
   * Get a Snap by exact id
   * @param id snap id
   * @returns Snap object (
   *  Represent the Snap and have different helpers methods
   * and you can access value with Snap.getVal() or Snap.val()
   * )
   */
  public getSnap<TId extends string>(id: TId): Snap<TMapDef[TId]> {
    const snapData = this._snapsMap.get(id);

    if (!snapData) {
      throw new Error(`No snap with id: ${id} exists!`);
    }

    return snapData.snaps[0];
  }

  /**
   * This method allow you to retrieve the snapshots that were taken using exactly the same id.
   * sm.snap("someId", {}) sm.snap("someId", {}) first one will go with `someId`,
   * second will go with `someId:2`. Managed automatically.
   * And so getting the multiple Snaps of same id that were automatically incrementally indexed
   * some_id, some_id:2, some_id:3 ... When the snaps of same id were taken.
   * @param id snaps type id
   * @returns Array of Snap objects (
   *  Represent the Snap and have different helpers methods
   * and you can access value with Snap.getVal() or Snap.val()
   * )
   */
  public getSnapsOfId<TId extends string>(id: TId): Snap<TMapDef[TId]>[] {
    const snapData = this._snapsMap.get(id);

    if (!snapData) {
      throw new Error(`No snap with id: ${id} exists!`);
    }

    return snapData.snaps;
  }

  /**
   * Get snaps matched by the query for a sub part of the id.
   * Parts are determined by `:`.
   * category1:sub2:some_some => if query = category1 that would be matched.
   * If query = sub2 that wouldn't be matched.
   * If query = category1:sub2 that would be matched. as it's a valid id part. Or categorization.
   * If query = category => it wouldn't be matched. Because there is no id with
   * `category` or `category:` categorization.
   * Unlike the searchSnaps() function which lookup for a substring.
   * This one match with the id parts `:`. Starting from the start. And not just a substring.
   *
   * The order would follow the one of the timeline.
   *
   * @param id snaps type id
   * @returns Array of Snap objects (
   *  Represent the Snap and have different helpers methods
   * and you can access value with Snap.getVal() or Snap.val()
   * )
   */
  public getSnaps(query: string): Snap[] {
    const queryWithoutDelimiter =
      last(query) === ':' ? query.slice(0, query.length - 1) : query;
    const queryWithDelimiter = `${queryWithoutDelimiter}:`;

    return this._snapsTimeLine.filter(
      (snap) =>
        snap.id() === queryWithoutDelimiter ||
        snap.id().indexOf(queryWithDelimiter) === 0,
    );
  }

  /**
   * Get a snap by index at timeline start from Zero.
   * First snap index is Zero.
   * @param index
   * @returns Snap
   */
  public getSnapAtIndex<T = any>(index: number): Snap<T> {
    return this._snapsTimeLine[index];
  }

  /**
   * Return the Snap timeline as an array
   * NOTE: remember that the snapshot are intended for read only.
   * NOTE: Never modify the timeline or the value directly
   * IF For some reason you would need to do so. Make sure to use the clone() helper method.
   * @returns Snap[]
   */
  public getSnapTimeLine<T = any>(): Snap<T>[] {
    return this._snapsTimeLine;
  }

  /**
   * Return the total number of recorded snaps
   * @returns total snaps count
   */
  public getSnapsCount(): number {
    return this._snapsTimeLine.length;
  }

  /**
   * Search for snaps using a string or RegExp matcher that get matched against the Snaps id's.
   * @param {string|RegExp} query query string or RegExp to search with against the id
   * @returns {Snap[]} matched snaps
   */
  public searchSnaps(query: string | RegExp): Snap[] {
    if (query instanceof RegExp) {
      return this._searchSnapsByRegex(query);
    }
    return this._snapsTimeLine.filter((snap) => snap.id().indexOf(query) > -1);
  }

  private _searchSnapsByRegex(regex: RegExp): Snap[] {
    return this._snapsTimeLine.filter((snap) => regex.test(snap.id()));
  }
}
