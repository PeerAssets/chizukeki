import { Buffer } from 'buffer'

var pb = require('./peerassets_pb');

var minTagFee = 10000; // 0.01PPC
var txnFee = 10000;   // 0.01PPC

// P2TH info
// PPC mainnet:
//  PAprod: PAprodbYvZqf4vjhef49aThB9rSZRxXsM6 - U624wXL6iT7XZ9qeHsrtPGEiU78V1YxDfwq75Mymd61Ch56w47KE
//  PAtest: PAtesth4QreCwMzXJjYHBcCVKbC4wjbYKP - UAbxMGQQKmfZCwKXAhUQg3MZNXcnSqG5Z6wAJMLNVUAcyJ5yYxLP
// PPC testnet:
//  PAprod: miHhMLaMWubq4Wx6SdTEqZcUHEGp8RKMZt - cTJVuFKuupqVjaQCFLtsJfG8NyEyHZ3vjCdistzitsD2ZapvwYZH
//  PAtest: mvfR2sSxAfmDaGgPcmdsTwPqzS6R9nM5Bo - cQToBYwzrB3yHr8h7PchBobM3zbrdGKj2LtXqg7NQLuxsHeKJtRL
function getDeckSpawnTagHash(PPCtestnet = false, PAtest = false) {
  // Setup the deck spawn tag hash
  if (!PPCtestnet && !PAtest)
    return 'PAprodbYvZqf4vjhef49aThB9rSZRxXsM6'
  else if (!PPCtestnet && PAtest)
    return 'PAtesth4QreCwMzXJjYHBcCVKbC4wjbYKP'
  else if (PPCtestnet && !PAtest)
    return 'miHhMLaMWubq4Wx6SdTEqZcUHEGp8RKMZt'
  else if (PPCtestnet && PAtest)
    return 'mvfR2sSxAfmDaGgPcmdsTwPqzS6R9nM5Bo'
}

function extendBitcore(bitcore, configuration = { minTagFee, txnFee, deckSpawnTagHash: getDeckSpawnTagHash() }) {
  bitcore.peerassets = {
    ISSUE_MODE: pb.DeckSpawn.MODE,
    configuration,

    //
    // Deck spawn functions
    //
    createDeckSpawnTransaction(utxo, shortName, numberOfDecimals, issueModes) {
      let { minTagFee, txnFee, deckSpawnTagHash } = this.configuration
      let deckSpawnTxn = new bitcore.Transaction()
        .from(utxo)                           // vin[0]: Owner signature
        .to(deckSpawnTagHash, minTagFee)      // vout[0]: Deck spawn P2TH
        .addData(this.createDeckSpawnMessage(shortName, numberOfDecimals, issueModes))  // vout[1]: Asset data
        // free format from here, typically a change Output
        .to(utxo.address, utxo.satoshis - minTagFee - txnFee);  // vout[2]
      return deckSpawnTxn
    },
    decodeDeckSpawnTransaction(transaction) {
      // Test for validity
      // TODO: error handling
      var inputs = transaction.inputs
      var outputs = transaction.outputs;
      if (outputs.length < 2) return undefined;
      if (!outputs[0].script.isPublicKeyHashOut()) return undefined;
      if (!outputs[1].script.isDataOut()) return undefined;

      var retVal = this.decodeDeckSpawnMessage(outputs[1].script.getData());
      retVal.assetId = transaction.id;
      retVal.owner = inputs[0].script.toAddress().toString();

      return retVal;
    },


    //
    // Card transfer functions
    //
    createCardTransferTransaction(utxo, amountsMap: Record<string, number>, deckSpawnTxn) {
      let { minTagFee, txnFee } = this.configuration
      var receivers: Array<string> = [];
      var amounts: Array<number> = [];
      for (let a in amountsMap) {
        receivers.push(a);
        amounts.push(amountsMap[a]);
      }

      var cardTransferTxn = new bitcore.Transaction()
        .from(utxo)                             // vin[0]: Sending party signature
        .to(this.assetTag(deckSpawnTxn), minTagFee)  // vout[0]: Asset P2TH
        .addData(this.createCardTransferMessage(amounts, deckSpawnTxn));  // vout[1]: Transfer data

      // vout[2] - vout[n+2] -> the receivers
      for (let i = 0; i < receivers.length; i++){
        cardTransferTxn.to(receivers[i], 0);  // vout[2]-vout[n+2]: Receiving parties
      }

      // free format from here, typically a change Output
      cardTransferTxn.to(utxo.address, utxo.satoshis - minTagFee - minTagFee - txnFee);  // vout[n+3] Change

      return cardTransferTxn;
    },

    decodeCardTransferTransaction(transaction) {
      // Test for validity
      // TODO: error handling
      var inputs = transaction.inputs;
      var outputs = transaction.outputs;
      if (outputs.length < 3) return undefined;
      if (!outputs[0].script.isPublicKeyHashOut()) return undefined;
      if (!outputs[1].script.isDataOut()) return undefined;

      var msg = this.decodeCardTransferMessage(outputs[1].script.getData());
      let retVal = {
        numberOfDecimals: msg.numberOfDecimals,
        from: inputs[0].script.toAddress().toString(),
        to: <Record<string, number>>{}
      }
      for (let i = 0; i < msg.amounts.length; i++) {
        // Test for validity
        if (!outputs[2 + i].script.isPublicKeyHashOut() && !outputs[2 + i].script.isScriptHashOut()) return undefined;
        retVal.to[outputs[2 + i].script.toAddress().toString()] = msg.amounts[i];
      }
      return retVal;
    },

    //
    // Internal functions
    //
    createDeckSpawnMessage(shortName, numberOfDecimals, issueModes) {
      var ds = new pb.DeckSpawn();
      ds.setVersion(1);
      ds.setShortName(shortName);
      ds.setNumberOfDecimals(numberOfDecimals);

      if (typeof issueModes == 'number') {
        ds.setIssueMode(issueModes);
      }
      else if (issueModes.length && typeof issueModes[0] == 'number') {
        var issueMode = 0;
        for (var i = 0; i < issueModes.length; i++)
          issueMode = issueMode ^ issueModes[i];
        ds.setIssueMode(issueMode);
      }
      else {
        return undefined; // TODO: imlement array of strings & error handling
      }

      return new Buffer(ds.serializeBinary());
    },

    decodeDeckSpawnMessage(message) {
      var ds = pb.DeckSpawn.deserializeBinary(new Uint8Array(message));
      var issueMode = ds.getIssueMode();

      return {
        version: ds.getVersion(),
        shortName: ds.getShortName(),
        numberOfDecimals: ds.getNumberOfDecimals(),
        issueMode: issueMode,
        getIssueModes: function () {
          var issueModes: Array<string> = [];
          for (var mode in pb.DeckSpawn.MODE){
            if (issueMode & pb.DeckSpawn.MODE[mode]){
              issueModes.push(mode)
            }
          }
          return issueModes;
        }
      }
    },

    assetTag(deckSpawnTxn) {
      // Create the compressed address for deckSpawnTxn.id
      var binaryTxnId = Buffer.from(deckSpawnTxn.id, 'hex');
      var bn = bitcore.crypto.BN.fromBuffer(binaryTxnId);
      return new bitcore.PrivateKey(bn).toPublicKey().toAddress();
    },

    createCardTransferMessage(amounts, deckSpawnTxn) {
      var decoded = this.decodeDeckSpawnTransaction(deckSpawnTxn);
      if (!decoded) return undefined;

      var ct = new pb.CardTransfer();
      ct.setAmountsList(amounts);
      ct.setNumberOfDecimals(decoded.numberOfDecimals);

      return new Buffer(ct.serializeBinary());
    },

    decodeCardTransferMessage(message) {
      var ds = pb.CardTransfer.deserializeBinary(new Uint8Array(message));

      return {
        amounts: ds.getAmountsList(),
        numberOfDecimals: ds.getNumberOfDecimals()
      }
    }

  }
  return bitcore
}


export { getDeckSpawnTagHash }
export default extendBitcore