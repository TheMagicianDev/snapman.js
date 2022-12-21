import { Snapman } from './index.js';
import { Snap } from '/Snap/index.js';

interface ITypeDef {
  [id: string]: {
    id: string;
  };
}

const s = new Snapman<ITypeDef>();

for (let i = 0; i < 5; i++) {
  s.snap(`category1:snap-${i}`, {
    id: `snap-${i}`,
  });
}

for (let i = 0; i < 3; i++) {
  s.snap(`category2:snap-${i}`, {
    id: `snap-${i}`,
  });
}

test('snap() and Timeline is working well', () => {
  expect(s.getSnapsCount()).toBe(8);
  expect(s.getSnapTimeLine().map((snap) => snap.id())).toEqual(
    Array(8)
      .fill(0)
      .map((_, i) => {
        if (i < 5) {
          return `category1:snap-${i}`;
        }
        return `category2:snap-${i - 5}`;
      }),
  );
  expect(s.getSnapAtIndex(4).id()).toBe('category1:snap-4');
  expect(s.getSnapAtIndex(2).next(2)?.id()).toBe('category1:snap-4');

  let snap = s.getSnapAtIndex(4);
  for (let i = 5; i < 8; i++) {
    snap = snap.next() as Snap;
    expect(snap.id()).toBe(`category2:snap-${i - 5}`);
  }
  expect(snap.next()).toBe(undefined);
});

test('getSnap(), getVal()', () => {
  expect(s.getSnap('category1:snap-4').val().id).toBe('snap-4');
  expect(s.getSnap('category1:snap-3').getVal().id).toBe('snap-3');
});

test('getSnapAtIndex()', () => {
  for (let i = 0; i < 5; i++) {
    expect(s.getSnapAtIndex(i).id()).toBe(`category1:snap-${i}`);
  }
});

test('searchSnaps() substring', () => {
  expect(s.searchSnaps('category1').map((snap) => snap.id())).toEqual(
    Array(5)
      .fill(0)
      .map((_, i) => `category1:snap-${i}`),
  );
});

test('searchSnaps() regex', () => {
  expect(s.searchSnaps(/category1/).map((snap) => snap.id())).toEqual(
    Array(5)
      .fill(0)
      .map((_, i) => `category1:snap-${i}`),
  );
});

test('Snap api works well for accessor', () => {
  const snap = s.getSnapAtIndex(3);
  expect(snap.id()).toBe('category1:snap-3');
  expect(snap.getId()).toBe('category1:snap-3');
  expect(snap.getVal().id).toBe('snap-3');
  expect(snap.val().id).toBe('snap-3');
  expect(snap.getTimelineIndex()).toBe(3);
  expect(snap.tIndex()).toBe(3);
});

test('previous(), next() navigation', () => {
  /**
   * next()
   */
  let snap = s.getSnapAtIndex(4);
  for (let i = 5; i < 8; i++) {
    snap = snap.next() as Snap;
    expect(snap.id()).toBe(`category2:snap-${i - 5}`);
  }
  expect(snap.next()).toBe(undefined);

  snap = s.getSnapAtIndex(5);
  for (let i = 4; i >= 0; i--) {
    snap = snap.previous() as Snap;
    expect(snap.id()).toBe(`category1:snap-${i}`);
  }
  expect(snap.previous()).toBe(undefined);
});
