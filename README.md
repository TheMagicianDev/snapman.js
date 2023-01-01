# snapman

![snapman.js banner](./imgs/snapman_banner.jpg)

<div align="center">
  <a href="https://www.npmjs.org/package/snapman">
    <img src="https://img.shields.io/npm/v/snapman.svg?style=flat-square" alt="npm version"/>
  </a>
  <a href="https://github.com/TheMagicianDev/snapman.js/actions?query=workflow%3ACI+branch%3Amain">
    <img src="https://img.shields.io/github/actions/workflow/status/TheMagicianDev/snapman.js/ci.yml?branch=main" alt="Build Status">
  </a>
  <a href='https://coveralls.io/github/TheMagicianDev/snapman.js?branch=main'>
    <img src='https://coveralls.io/repos/github/TheMagicianDev/snapman.js/badge.svg?branch=main' alt='Coverage Status' />
  </a>
  <a href='LICENSE'>
    <img src='https://img.shields.io/badge/license-MIT-blue.svg?style=flat' alt='Coverage Status' />
  </a>
</div>

<div align="center">
  <a href="https://www.npmjs.com/package/snapman">npm page</a>, 
  <a href="https://github.com/TheMagicianDev/snapman.js">repo page</a>,
  <a href="https://github.com/TheMagicianDev/snapman.js" style="color: yellow; text-decoration: inherit;">Star me ⭐💫</a>
</div>

<hr>

Snapshots manager for taking snapshots where the values are automatically deep cloned when taken. Track timeline. And can be used as events source. Navigate snapshots and there timeline. Can be used for testing and any other application.

See examples at the end for usage with [jest](https://jestjs.io/docs/getting-started). Here some articles and content showing that.

## Installation

```sh
npm install snapman
pnpm add snapman
pnpm add snapman
```

For usage with browser you can use bundlers like webpack or vite or rollup.

Otherwise you can use the CDN link:

```html
<!-- Latest version -->
<script src="https://unpkg.com/snapman"></script>

<!-- Specific: -->
<script src="https://unpkg.com/snapman@1.0.6"></script>
```

And also you can use the already bundled umd `index.umd.js` file in [releases](https://github.com/TheMagicianDev/snapman.js/releases).

The library is exposed as `SnapmanJs`

```js
const sm = new SnapmanJs.Snapman();
```
## Usage

### Construction

```ts
interface ITypeDef {
  [id: string]: {
    id: string;
  };
}

const s = new Snapman<ITypeDef>();
```

### Taking snapshots

```ts
public snap<TId extends string>(id: string, val?: TMapDef[TId]): this
```

```ts
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
```

That is 8 snapshots taken

### Timeline

For the example above, the timeline is

```ts
// type: Snap[]
[Snap-category1:snap-1, ...., Snap-category1:snap-4, Snap-category2:snap-0, ..., Snap-category2:snap-3]
```

to access a timeline

```ts
sm.getSnapTimeLine()
```

### Accessing snapshots

```ts
// by id
sm.getSnap('category1:snap-4')

// by index in the timeline, start from zero
sm.getSnapAtIndex(index)

// Search and get the snapshots from the timeline that start with the part of the id. (start)
const snaps = sm.getSnaps('category1');
// ---> Will get all the snapshots of an id equal to `category1` or starting by `category1:` (the `:` delimiter is used)
const snaps = sm.getSnaps('tegory1');
// ---> will return an empty array. getSnaps() doesn't match substring but only t he one that start from the start.
// You can use searchSnaps() instead of you want to match against just any substring
const snaps = sm.getSnaps('category');
// ---> Will return an empty array as well. because no `category` id or an id that start with `category:` exist.


// Searching for snapshots matching against id
// ---- substring
sm.searchSnaps('category1')
// return all snapshots that category1 is a substring of there id
// ---- regex
sm.searchSnaps(/category1/)
// return all snapshots that the regex /category1/ match there id

// Snap.next() Snap.previous() and navigating timeline
const snap = sm.getSnapAtIndex(index)
const nextSnap = snap.next() // access the next snap in the timeline
const prevSnap = snap.previous() // access the previous snap in the timeline
```

### Multiple snapshots of same id

For convenience and ease of use. If you are in a case where you need to take snapshots of the same event (id). Snapman help with that in the following way:

If we take multiple snaps with same id like in:

```ts
for (let i = 1; i < 5; i++) {
  sm2.snap('sameId', {
    id: `snap-${i}`,
  });
}
```

That would do the following:

- register first snapshot as `sameId`
- The next ones as `sameId:{index}` while index gonna start with `2`.

Meaning `sameId, sameId:2, sameId:3 ...` you got it.

- the first snapshot `sameId`. Is added to the timeline and added to the map.
- The next ones `sameId:2, sameId:3 ...` will be added to the timeline in the order they were taken. So if we do:

```ts
sm.snap('some', {})
sm.snap('sameId', {})
sm.snap('someOther', {})
sm.snap('sameId', {})
sm.snap('sameId', {})
sm.snap('someOther', {})
```

timeline ==> 

```
some, someId, someOther, sameId:2, sameId:3, someOther:2
```

- To access the elements of same id, we use `sm.getSnapsOfId()`

```ts
for (let i = 1; i < 5; i++) {
  sm.snap('sameId', {
    id: `snap-${i}`,
  });
}

const snaps = sm.getSnapsOfId('sameId')
// Snap[] -> [sameId, sameId:2, sameId:3, sameId:4]
```

- We can access a one exactly directly by `sm.getSnap(id)`

```ts
const snap3 = sm.getSnap('sameId:3')
```

- If we take a snapshot like:

```ts
// sameId:3 already exists
sm.snap('sameId:3', {})
sm.snap('sameId:3', {})
```

=> This will create `sameId:3:2, sameId:3:3`. Making the totality of `sameId:3, sameId:3:2, sameId:3:3`.

```ts
const snaps = sm.getSnapsOfId('sameId:3')
// Snap[] -> [sameId:3, sameId:3:2, sameId:3:3]
```

Do that only when you need it.

Also given that the above is done.

```ts
const snaps = sm.getSnapsOfId('sameId')
// Snap[] -> [sameId, sameId:2, sameId:3, sameId:4]
```

Will still return the same as before. As `getSnapsOfId()` will return the snapshots that were taken by the same id when using `snap()`.

And surely to access just all in case you ever need. use:

```ts
const snaps = sm.getSnaps('sameId');
// Snap[] -> [sameId, sameId:2, sameId:3, sameId:4, sameId:3:2, sameId:3:3]
```

And it follows the timeline, in matter of order.

### `Snap` object and accessing values

```ts
  const snap = s.getSnapAtIndex(3);
  
  // accessing id of the snap
  snap.getId()
  snap.id() // alias

  // accessing the value of the snap, (safely cloned at the time the snapshot was created)
  snap.getVal()
  snap.val() // alias

  // accessing the index of the snapshot in the timeline
  snap.getTimelineIndex()
  snap.tIndex() // alias
```


### API and examples

Funny enough one of the main usage intended for snapman is testing.

First get to know the api through the test file of `snapman` itself.

```ts
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
```

## Usage in real tests with "run experiences first, tests after" pattern

If you have something that works through time. Like for instance a client. ...

If you do `e2e` testing like testing something like `laravel-mix` or `laravel-mix-glob` or `webpack` ... Something `cli` based. You account for output ...

**A great pattern is to create experiments and run them all at first. While at it, you collect all sort of relevant events and there data. And then we write the test by consuming and testing against the experiments collected data. Kind like with event sourcing.**

`Snapman` was created to help with that process. Taking snapshot. Automatically the values are deeply cloned. And a timeline is created and managed. You can access any snapshot. And you can navigate the timeline and in different ways. And you can too search as well. 

And by using the right ids structure. You can also categorize events that are alike. And group them.

```ts
id = `category1:sub2:someEvent1`

s.searchSnaps(/^category1/) // would give all the events of category1
s.searchSnaps(/^category1\:sub2/) // would give all the events of category1:sub2
```

Example of a real experiment based testing:

[to be added]
