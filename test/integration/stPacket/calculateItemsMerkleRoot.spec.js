const calculateItemsMerkleRoot = require('../../../lib/stPacket/calculateItemsMerkleRoot');

describe('calculateItemsMerkleRoot', () => {
  it('should return null if contracts and documents are empty', () => {
    const result = calculateItemsMerkleRoot({
      contracts: [],
      documents: [],
    });

    expect(result).to.be.null();
  });
});
