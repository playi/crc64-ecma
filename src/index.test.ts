import { crc64 } from '.';

const samples = [
  {
    data: 'Hello',
    hash: '51cf5c3bc87bacc8',
  },
  {
    data: 'Hello 😁 there\n👻',
    hash: '735b664f601d3944',
  },
  {
    data: '1234xP;./#uiXAJhb🎃',
    hash: '5bf01f880761729a',
  },
];

it('should generate hashes', () => {
  samples.forEach((sample) => {
    expect(crc64(sample.data).toString(16)).toBe(sample.hash);
  });
});
