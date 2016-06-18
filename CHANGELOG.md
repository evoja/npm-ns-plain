# Change Log
All notable changes to this project will be documented in this file.

#### [Unreleased][unreleased]
##### Added
* Escaping periods with slashes in keys. Slashes are need to be escaped as well. Two new public functions `escapeKey` and `unescapeKey` were added.

### 0.0

#### [0.0.1] - [2016-02-09][c-0.0.1]
##### Fixed
Fix using of `require-globify` for building tests. The previous version of configurations forced dependent projects to require the `require-globify` as well. Now it's fixed.

#### [0.0.0] - 2016-01-24
##### Added
`namespace`, access`, `assignInPlace`, `appendInPlace`, `assign`


------------
Changelog file follows [this convention](http://keepachangelog.com/)

[unreleased]: https://github.com/evoja/npm-ns-plain/compare/0.0.1...master
[c-0.0.1]: https://github.com/evoja/npm-ns-plain/compare/0.0.0...0.0.1
[0.0.1]: https://github.com/evoja/npm-ns-plain/tree/0.0.1
[0.0.0]: https://github.com/evoja/npm-ns-plain/tree/0.0.0
