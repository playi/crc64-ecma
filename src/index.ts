function generateTable() {
  // https://en.wikipedia.org/wiki/Cyclic_redundancy_check
  const POLY = 0xc96c5795d7870f42n;
  const table: bigint[][] = [];

  for (let i = 0; i < 8; i++) {
    table[i] = [];
  }

  let crc = 0n;

  for (let i = 0; i < 256; i++) {
    crc = BigInt(i);

    for (let j = 0; j < 8; j++) {
      if (crc & 1n) {
        crc = POLY ^ (crc >> 1n);
      } else {
        crc = crc >> 1n;
      }
    }

    table[0][i] = crc;
  }

  for (let i = 0; i < 256; i++) {
    crc = table[0][i];

    for (let j = 1; j < 8; j++) {
      const index = Number(crc & 0xffn);
      crc = table[0][index] ^ (crc >> 8n);
      table[j][i] = crc;
    }
  }

  return table;
}

function stringToUtf8(string: string): string {
  return unescape(encodeURIComponent(string));
}

function stringToBytes(string: string): number[] {
  const bytes: number[] = [];

  for (let index = 0; index < string.length; ++index) {
    bytes.push(string.charCodeAt(index));
  }

  return bytes;
}

const TABLE = generateTable();

export function crc64(string: string) {
  const utf8String = stringToUtf8(string);
  let bytes = stringToBytes(utf8String);
  let crc = ~BigInt(0) & 0xffffffffffffffffn;

  while (bytes.length > 8) {
    crc ^=
      BigInt(bytes[0]) |
      (BigInt(bytes[1]) << 8n) |
      (BigInt(bytes[2]) << 16n) |
      (BigInt(bytes[3]) << 24n) |
      (BigInt(bytes[4]) << 32n) |
      (BigInt(bytes[5]) << 40n) |
      (BigInt(bytes[6]) << 48n) |
      (BigInt(bytes[7]) << 56n);

    crc =
      TABLE[7][Number(crc & 0xffn)] ^
      TABLE[6][Number((crc >> 8n) & 0xffn)] ^
      TABLE[5][Number((crc >> 16n) & 0xffn)] ^
      TABLE[4][Number((crc >> 24n) & 0xffn)] ^
      TABLE[3][Number((crc >> 32n) & 0xffn)] ^
      TABLE[2][Number((crc >> 40n) & 0xffn)] ^
      TABLE[1][Number((crc >> 48n) & 0xffn)] ^
      TABLE[0][Number(crc >> 56n)];

    bytes = bytes.slice(8);
  }

  for (let i = 0; i < bytes.length; i++) {
    const lower = Number(crc & 0xffn);
    const index = lower ^ bytes[i];
    crc = TABLE[0][index] ^ (crc >> 8n);
  }

  crc = ~crc & 0xffffffffffffffffn;

  return crc;
}
