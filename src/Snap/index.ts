import { clone } from '/Utils/helpers.js';
import { Snapman } from '/Snapman/index.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface IProps<TVal = any, TMapDef extends Record<string, any> = any> {
  id: string;
  timelineIndex: number;
  val: TVal;
  snapman: Snapman<TMapDef>;
}

/**
 * Snapshot representing class
 *
 * You can access it's value using .getVal() or .val()
 *
 * The values are safely cloned at the moment the snapshot was taken
 *
 * and added to the timeline and object constructed.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Snap<TVal = any, TMapDef extends Record<string, any> = any> {
  private _id: string;

  private _timelineIndex?: number;

  private _val: TVal;

  private _snapman: Snapman<TMapDef>;

  constructor({ id, timelineIndex, val, snapman }: IProps) {
    this._id = id;
    this._timelineIndex = timelineIndex;
    this._val = clone(val);
    this._snapman = snapman;
  }

  /**
   * Return the Snap id
   * @returns {string} snap id
   */
  public getId(): string {
    return this._id;
  }

  /**
   * (Alias of getId())
   * Return the Snap id
   * @returns {string}  snap id
   */
  public id(): string {
    return this.getId();
  }

  /**
   * Return the Snap value. Guaranteed to not be altered.
   * The snapshot is already cloned at the time it was taken.
   * @returns {string}  snap value
   */
  public getVal(): TVal {
    return this._val;
  }

  /**
   * (Alias of getVal())
   * Return the Snap value. Guaranteed to not be altered.
   * The snapshot is already cloned at the time it was taken.
   * @returns {string}  snap value
   */
  public val(): TVal {
    return this.getVal();
  }

  /**
   * Return the index in the snaps timeline (order) starting from zero
   * @returns index in timeline
   */
  public getTimelineIndex(): number {
    return this._timelineIndex || NaN;
  }

  /**
   * (Alias of getTimelineIndex())
   * Return the index in the snaps timeline (order) starting from zero
   * @returns index in timeline
   */
  public tIndex(): number {
    return this.getTimelineIndex();
  }

  /**
   * Return the next Snap in the timeline with ability to look more then one step forward.
   * @param step how many steps to look ahead [default is 1 (next el)]
   * @returns Snap | undefined (
   * if none like with the last Snap of the timeline it would return undefined
   * )
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public next<Tv = any>(step = 1): Snap<Tv, TMapDef> | undefined {
    if (this._timelineIndex) {
      return this._snapman.getSnapAtIndex(this._timelineIndex + step);
    }
    return undefined;
  }

  /**
   * Return the previous Snap in the timeline with ability to look more then one step backward.
   * @param step how many steps to look back [default is 1 (previous el)]
   * @returns Snap | undefined (
   * if none like with the first Snap of the timeline it would return undefined
   * )
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public previous<Tv = any>(step = 1): Snap<Tv, TMapDef> | undefined {
    if (this._timelineIndex) {
      return this._snapman.getSnapAtIndex(this._timelineIndex - step);
    }
    return undefined;
  }
}
