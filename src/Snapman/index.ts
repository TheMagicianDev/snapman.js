import { Snap } from '/Snap/index.js';

/**
 * Snap manager
 * Allow taking snapshots and track them on a timeline and
 * provide different way to access and navigate the snapshots.
 * With a Concise API
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Snapman<TMapDef extends Record<string, any> = any> {
  private _snapsTimeLine: Snap[] = [];

  private _snapsMap: Map<string, Snap> = new Map();

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
    const snap = new Snap({
      id,
      timelineIndex: this._snapsTimeLine.length,
      val,
      snapman: this,
    });
    this._snapsMap.set(id, snap);
    this._snapsTimeLine.push(snap);
    return this;
  }

  /**
   * Get a Snap by id
   * @param id snap id
   * @returns Snap object (
   *  Represent the Snap and have different helpers methods
   * and you can access value with Snap.getVal() or Snap.val()
   * )
   */
  public getSnap<TId extends string>(id: TId): Snap<TMapDef[TId]> {
    const snap = this._snapsMap.get(id);

    if (!snap) {
      throw new Error(`No snap with id: ${id} exists!`);
    }

    return snap;
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
