import { Snapman } from './index.js';
import { Snap } from '/Snap/index.js';
import { last } from '/Utils/helpers.js';

interface ITypeDef {
  [id: string]: {
    id: string;
  };
}

const sm = new Snapman<ITypeDef>();

for (let i = 0; i < 5; i++) {
  sm.snap(`category1:snap-${i}`, {
    id: `snap-${i}`,
  });
}

for (let i = 0; i < 3; i++) {
  sm.snap(`category2:snap-${i}`, {
    id: `snap-${i}`,
  });
}

const sm2 = new Snapman<ITypeDef>();

for (let i = 0; i < 3; i++) {
  sm2.snap(`before-sameId:${i}`, {
    id: `snap-${i}`,
  });
}

for (let i = 1; i < 5; i++) {
  sm2.snap('sameId', {
    id: `snap-${i}`,
  });
}

sm2.snap('after-sameId', { id: 'afterSameId' });

test('snap() and Timeline is working well', () => {
  expect(sm.getSnapsCount()).toBe(8);
  expect(sm.getSnapTimeLine().map((snap) => snap.id())).toEqual(
    Array(8)
      .fill(0)
      .map((_, i) => {
        if (i < 5) {
          return `category1:snap-${i}`;
        }
        return `category2:snap-${i - 5}`;
      }),
  );
  expect(sm.getSnapAtIndex(4).id()).toBe('category1:snap-4');
  expect(sm.getSnapAtIndex(2).next(2)?.id()).toBe('category1:snap-4');

  let snap = sm.getSnapAtIndex(4);
  for (let i = 5; i < 8; i++) {
    snap = snap.next() as Snap;
    expect(snap.id()).toBe(`category2:snap-${i - 5}`);
  }
  expect(snap.next()).toBe(undefined);
});

test('getSnap(), getVal()', () => {
  expect(sm.getSnap('category1:snap-4').val().id).toBe('snap-4');
  expect(sm.getSnap('category1:snap-3').getVal().id).toBe('snap-3');
});

test('getSnapAtIndex()', () => {
  for (let i = 0; i < 5; i++) {
    expect(sm.getSnapAtIndex(i).id()).toBe(`category1:snap-${i}`);
  }
});

test('searchSnaps() substring', () => {
  expect(sm.searchSnaps('category1').map((snap) => snap.id())).toEqual(
    Array(5)
      .fill(0)
      .map((_, i) => `category1:snap-${i}`),
  );
});

test('searchSnaps() regex', () => {
  expect(sm.searchSnaps(/category1/).map((snap) => snap.id())).toEqual(
    Array(5)
      .fill(0)
      .map((_, i) => `category1:snap-${i}`),
  );
});

test('Snap api works well for accessor', () => {
  const snap = sm.getSnapAtIndex(3);
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
  let snap = sm.getSnapAtIndex(4);
  for (let i = 5; i < 8; i++) {
    snap = snap.next() as Snap;
    expect(snap.id()).toBe(`category2:snap-${i - 5}`);
  }
  expect(snap.next()).toBe(undefined);

  snap = sm.getSnapAtIndex(5);
  for (let i = 4; i >= 0; i--) {
    snap = snap.previous() as Snap;
    expect(snap.id()).toBe(`category1:snap-${i}`);
  }
  expect(snap.previous()).toBe(undefined);
});

test('Testing same id snap taking and getter (getSnapsOfId())', () => {
  const snaps = sm2.getSnapsOfId('sameId');
  snaps.forEach((snap, index) => {
    let id = 'sameId';
    if (index > 0) {
      id += `:${index + 1}`;
    }
    expect(snap.id()).toBe(id);
    expect(snap.val().id).toBe(`snap-${index + 1}`);
  });
  const lastSnap = last(snaps);
  const nextSnapInTimeLine = lastSnap.next();
  expect(nextSnapInTimeLine?.id()).toBe('after-sameId');
  expect(nextSnapInTimeLine?.val().id).toBe('afterSameId');

  let backSnap: Snap = snaps[0];
  for (let i = 2; i >= 0; i--) {
    backSnap = backSnap.previous()!;
    expect(backSnap.id()).toBe(`before-sameId:${i}`);
  }
  expect(backSnap.previous()).toBe(undefined);
});

test('getting snaps using getSnaps() and from start matching', () => {
  {
    const snaps = sm.getSnaps('category1');
    for (let i = 0; i < 5; i++) {
      expect(snaps[i].getId()).toBe(`category1:snap-${i}`);
    }
  }

  {
    // testing that it still work if : was included
    const snaps = sm.getSnaps('category1:');
    for (let i = 0; i < 5; i++) {
      expect(snaps[i].getId()).toBe(`category1:snap-${i}`);
    }
  }

  {
    const snaps = sm.getSnaps('category');
    expect(snaps.length).toBe(0);
  }

  {
    const snaps = sm.getSnaps('ategory');
    expect(snaps.length).toBe(0);
  }

  {
    const snaps = sm2.getSnaps('sameId');
    expect(snaps[0].getId()).toBe('sameId');

    for (let i = 1; i < 4; i++) {
      expect(snaps[i].getId()).toBe(`sameId:${i + 1}`);
    }
  }

  // testing sub category
  {
    const _sm = new Snapman<ITypeDef>();
    _sm.snap('experience1:target1', { id: 'target1:1' });
    _sm.snap('experience1:target1', { id: 'target1:2' });
    _sm.snap('experience1:target1', { id: 'target1:3' });
    _sm.snap('experience1:target2', { id: 'target2:1' });
    _sm.snap('experience1:target2', { id: 'target2:2' });
    _sm.snap('experience1:target2', { id: 'target2:3' });

    const experienceSnaps = _sm.getSnaps('experience1');
    for (let i = 0; i < 6; i++) {
      expect(experienceSnaps[i].getId()).toBe(
        `experience1:target${i < 3 ? 1 : 2}${
          i === 0 || i === 3 ? '' : `:${(i % 3) + 1}`
        }`,
      );
    }

    const target1Snaps = _sm.getSnaps('experience1:target1');
    for (let i = 0; i < 3; i++) {
      expect(target1Snaps[i].getId()).toBe(
        `experience1:target1${i === 0 ? '' : `:${i + 1}`}`,
      );
    }

    const target2Snaps = _sm.getSnaps('experience1:target2');
    for (let i = 0; i < 3; i++) {
      expect(target2Snaps[i].getId()).toBe(
        `experience1:target2${i === 0 ? '' : `:${i + 1}`}`,
      );
    }

    // testing when there is no such sub category and it's just a substring
    const noMatchSnaps = _sm.getSnaps('experience1:target');
    expect(noMatchSnaps.length).toBe(0);
  }
});
test('getting sameId snapshots using getSnap()', () => {
  for (let i = 2; i < 5; i++) {
    const snap = sm2.getSnap(`sameId:${i}`);
    expect(snap).toBeTruthy();
    expect(snap.id()).toBe(`sameId:${i}`);
  }
});

test('Taking extra snaps on the sameId auto incremented snaps', () => {
  const _sm = new Snapman<ITypeDef>();
  _sm.snap('sameId', { id: 'sameId-1' });
  _sm.snap('sameId', { id: 'sameId-2' });
  _sm.snap('sameId', { id: 'sameId-3' });

  _sm.snap('sameId:2', { id: 'sameId-1-2' });
  _sm.snap('sameId:2', { id: 'sameId-1-3' });
  _sm.snap('sameId:2', { id: 'sameId-1-4' });

  const sameIdSnaps = _sm.getSnapsOfId('sameId');
  expect(sameIdSnaps.length).toBe(3);
  for (let i = 0; i < 3; i++) {
    const secondPart = i === 0 ? '' : `:${i + 1}`;
    expect(sameIdSnaps[i].id()).toBe(`sameId${secondPart}`);
  }

  const sameId2Snaps = _sm.getSnapsOfId('sameId:2');
  expect(sameId2Snaps.length).toBe(4);
  for (let i = 0; i < 4; i++) {
    const secondPart = i === 0 ? '' : `:${i + 1}`;
    expect(sameId2Snaps[i].id()).toBe(`sameId:2${secondPart}`);
  }

  expect(_sm.getSnaps('sameId').length).toBe(6);
  expect(_sm.getSnaps('sameId:2').length).toBe(4);
});
