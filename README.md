# ns-plain [![npm version](https://badge.fury.io/js/%40evoja%2Fns-plain.svg)](https://badge.fury.io/js/%40evoja%2Fns-plain) [![Build Status](https://travis-ci.org/evoja/ns-plain.png)](https://travis-ci.org/evoja/ns-plain)





### assign
`assign(path_to_subobj, obj, value)`

Clones object and replaces deep value by new one. Keeps all other fields the same.
It clones every sub object in the path and just makes a link of any sub-object 
out of the path, does not do deeply copies of everything.

Complexity is O(N1+N2+...+Nk) where Ni is number of keys on every level of the path. In future we are going to support immutable-js.

##### Examples
```js
assign('a.b', {a: {b: 1, c: 2}, d: {e: 3}}, 100)
// => {
//   a: {
//     b: 100,
//     c: 2
//   },
//   d: {e: 3}
// }

assign('a.b', {}, 100)
// => {a: {b: 100}}
```

### access
`access(path_to_subobj, obj)`

Extracts the subobject. It does not modify the object and any subobject.

##### Examples
```js
access('a.b', {a: {b: 1, c: 2}})
// => 1

var obj = {}
access('a.b', obj)
// => undefined, obj = {}
```

### namespace
`namespace(path_to_subobj, obj)`

Extracts the substate or create new one. It modifies the object and
creates deep object with chain of all subobjects.

If obj is undefined it creates subobj in window.

##### Examples
```js
namespace('a.b', obj)
// => {}, obj = {a: {b: {}}}

namespace('a.b')
// window.a.b <= {}
```


### assignInPlace
`assignInPlace(path_to_subobj, value, context)`

Replaces deep value in the context by changing it. Keeps all other fields the same.
It creates sub objects if it's necessary.

If context is undefined it gets global object (`window` or `global`)


##### Examples
```js
assignInPlace('a.b', 100, {a: {b: 1, c: 2}, d: {e: 3}})
// => {
//   a: {
//     b: 100,
//     c: 2
//   },
//   d: {e: 3}
// }

assignInPlace('a.b', 100, {})
// => {a: {b: 100}}
```

### appendInPlace
`appendInPlace(path_to_subobj, value, context)`

Appends new fields to a deep object in the context. Keeps all other fields the same.
It creates sub objects if it's necessary.

If context is undefined it gets global object (`window` or `global`)

Returns `undefined`


##### Examples
```js
appendInPlace('a.b',
              {y: 20, z: 30},
              {a: {b: {x: 1, y: 2}, c: 2}, d: {e: 3}})
// => {
//   a: {
//     b: {
//       x: 1,
//       y: 20,
//       z: 30
//     },
//     c: 2
//   },
//   d: {e: 3}
// }

appendInPlace('a.b', {y: 20, z: 30}, {})
// => {a: {b: {y: 20, z: 30}}}
```
