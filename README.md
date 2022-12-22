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

Latest version

https://unpkg.com/snapman

Specific:

https://unpkg.com/browse/snapman@1.0.6/

And also you can use the already bundled umd `index.umd.js` file in [releases](https://github.com/TheMagicianDev/snapman.js/releases).

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
s.getSnap('category1:snap-4')

// by index in the timeline, start from zero
sm.getSnapAtIndex(index)

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
```

## Usage in real tests with "experience first, tests after" pattern

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
