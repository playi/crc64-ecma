# crc64-ecma

Calculate CRC64-ECMA182 hashes using reversed polynomial for NodeJS.

## Installation

`yarn add crc64-ecma`

## Usage

```js
import { crc64 } from 'crc64-ecma';

const data = 'Hello';
const crc = crc64(data);
// Output: 51cf5c3bc87bacc8
console.log(crc.toString(16));
```

## License

[GPL v2](LICENSE)
