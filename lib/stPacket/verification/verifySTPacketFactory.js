const { Transaction } = require('@dashevo/dashcore-lib');

const ValidationResult = require('../../validation/ValidationResult');

const UnconfirmedUserError = require('../../errors/UnconfirmedUserError');
const UserNotFoundError = require('../../errors/UserNotFoundError');
const InvalidTransactionTypeError = require('../../errors/InvalidTransactionTypeError');
const InvalidSTPacketHashError = require('../../errors/InvalidSTPacketHashError');

/**
 * @param {verifyContract} verifyContract
 * @param {verifyDocuments} verifyDocuments
 * @param {DataProvider} dataProvider
 * @return {verifySTPacket}
 */
function verifySTPacketFactory(verifyContract, verifyDocuments, dataProvider) {
  /**
   * @typedef verifySTPacket
   * @param {STPacket} stPacket
   * @param {Transaction} stateTransition
   * @return {ValidationResult}
   */
  async function verifySTPacket(stPacket, stateTransition) {
    const result = new ValidationResult();

    if (!stateTransition.isSpecialTransaction()
      || stateTransition.type !== Transaction.TYPES.TRANSACTION_SUBTX_TRANSITION) {
      result.addError(
        new InvalidTransactionTypeError(stateTransition),
      );

      return result;
    }

    if (stPacket.hash() !== stateTransition.extraPayload.hashSTPacket) {
      result.addError(
        new InvalidSTPacketHashError(stPacket, stateTransition),
      );
    }

    const userId = stateTransition.extraPayload.regTxId;

    const registrationTransaction = await dataProvider.fetchTransaction(userId);

    if (!registrationTransaction) {
      result.addError(
        new UserNotFoundError(userId),
      );
    } else if (registrationTransaction.confirmations < 6) {
      result.addError(
        new UnconfirmedUserError(registrationTransaction),
      );
    }

    const contract = await dataProvider.fetchContract(stPacket.getContractId());

    if (stPacket.getContract()) {
      result.merge(
        await verifyContract(stPacket, contract),
      );
    }

    if (stPacket.getDocuments().length > 0) {
      result.merge(
        await verifyDocuments(stPacket, userId, contract),
      );
    }

    return result;
  }

  return verifySTPacket;
}

module.exports = verifySTPacketFactory;
