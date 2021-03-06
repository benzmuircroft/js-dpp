const ConsensusError = require('./ConsensusError');

class MissingDocumentActionError extends ConsensusError {
  constructor(rawDocument) {
    super('$action is not present');

    this.rawDocument = rawDocument;
  }

  /**
   * Get raw Document
   *
   * @return {RawDocument}
   */
  getRawDocument() {
    return this.rawDocument;
  }
}

module.exports = MissingDocumentActionError;
