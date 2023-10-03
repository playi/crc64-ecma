const JSBI = require('jsbi');

const one = JSBI.BigInt(1);
const FF = JSBI.BigInt(0xff);

function generateTable() {
  // https://en.wikipedia.org/wiki/Cyclic_redundancy_check
  const POLY = JSBI.BigInt('0xc96c5795d7870f42');
  const table: (typeof JSBI)[][] = [];

  for (let i = 0; i < 8; i++) {
    table[i] = [];
  }

  let crc = JSBI.BigInt(0);

  for (let i = 0; i < 256; i++) {
    crc = JSBI.BigInt(i);

    for (let j = 0; j < 8; j++) {
      const rightshift = JSBI.signedRightShift(crc, one);
      if (JSBI.toNumber(JSBI.bitwiseAnd(crc, one))) {
        crc = JSBI.bitwiseXor(POLY, rightshift)
      } else {
        crc = rightshift;
      }
    }

    table[0][i] = crc;
  }

  for (let i = 0; i < 256; i++) {
    crc = table[0][i];

    for (let j = 1; j < 8; j++) {
      const index = JSBI.toNumber(JSBI.bitwiseAnd(crc, FF));
      crc = JSBI.bitwiseXor(table[0][index], JSBI.signedRightShift(crc, JSBI.BigInt(8)));
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
  let crc = JSBI.bitwiseAnd(
      JSBI.bitwiseNot(JSBI.BigInt(0)),
      JSBI.BigInt('0xffffffffffffffff')
  );

  while (bytes.length > 8) {
    const op1 = 
      JSBI.bitwiseOr(JSBI.BigInt(bytes[0]),
        JSBI.bitwiseOr(
          JSBI.leftShift(JSBI.BigInt(bytes[1]), JSBI.BigInt(8)),
          JSBI.bitwiseOr(
            JSBI.leftShift(JSBI.BigInt(bytes[2]), JSBI.BigInt(16)),
            JSBI.bitwiseOr(
              JSBI.leftShift(JSBI.BigInt(bytes[3]), JSBI.BigInt(24)),
              JSBI.bitwiseOr(
                JSBI.leftShift(JSBI.BigInt(bytes[4]), JSBI.BigInt(32)),
                JSBI.bitwiseOr(
                  JSBI.leftShift(JSBI.BigInt(bytes[5]), JSBI.BigInt(40)),
                  JSBI.bitwiseOr(
                    JSBI.leftShift(JSBI.BigInt(bytes[6]), JSBI.BigInt(48)),
                    JSBI.leftShift(JSBI.BigInt(bytes[7]), JSBI.BigInt(56))
                  )
                )
              )
            )
          )
        )
      );
    crc = JSBI.bitwiseXor(crc, op1);
    crc =
      JSBI.bitwiseXor(
        TABLE[7][JSBI.toNumber(JSBI.bitwiseAnd(crc, FF))],
        JSBI.bitwiseXor(
          TABLE[6][JSBI.toNumber(JSBI.bitwiseAnd(JSBI.signedRightShift(crc, JSBI.BigInt(8)), FF))],
          JSBI.bitwiseXor(
            TABLE[5][JSBI.toNumber(JSBI.bitwiseAnd(JSBI.signedRightShift(crc, JSBI.BigInt(16)), FF))],
            JSBI.bitwiseXor(
              TABLE[4][JSBI.toNumber(JSBI.bitwiseAnd(JSBI.signedRightShift(crc, JSBI.BigInt(24)), FF))],
              JSBI.bitwiseXor(
                TABLE[3][JSBI.toNumber(JSBI.bitwiseAnd(JSBI.signedRightShift(crc, JSBI.BigInt(32)), FF))],
                JSBI.bitwiseXor(
                  TABLE[2][JSBI.toNumber(JSBI.bitwiseAnd(JSBI.signedRightShift(crc, JSBI.BigInt(40)), FF))],
                  JSBI.bitwiseXor(
                    TABLE[1][JSBI.toNumber(JSBI.bitwiseAnd(JSBI.signedRightShift(crc, JSBI.BigInt(48)), FF))],
                    TABLE[0][JSBI.toNumber(JSBI.signedRightShift(crc, JSBI.BigInt(56)))]
                  )
                )
              )
            )
          )
        )
      );
    bytes = bytes.slice(8);
  }

  for (let i = 0; i < bytes.length; i++) {
    const lower = JSBI.toNumber(JSBI.bitwiseAnd(crc, FF));
    const index = lower ^ bytes[i];
    crc = JSBI.bitwiseXor(TABLE[0][index], JSBI.signedRightShift(crc, JSBI.BigInt(8)));
  }

  crc = JSBI.bitwiseAnd(
      JSBI.bitwiseNot(crc),
      JSBI.BigInt('0xffffffffffffffff')
  );

  return crc;
}
