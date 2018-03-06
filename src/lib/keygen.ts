const scrypt = require('scrypt-async')
const bitcore = require('bitcore-lib')

const CHECKSUM_BIT = 128
const KEY_LENGTH = 32
const DEFAULT_LOGN = 4


/*
   Internal functions
 */
function myScrypt (pw, salt, itFac, callback){
  return scrypt(pw, salt, itFac, 8, KEY_LENGTH, 1000, callback);
};
function reduceSeed (seed, passwordLength){
  return seed.subarray(passwordLength + 1, seed.length - 1);
};
function cleanMetaByte (array){
  array[0] = 0;
  return array;
};
function putChecksumByte (array, checksumByte){
  array[0] = array[0] | CHECKSUM_BIT;
  array[1] = checksumByte;
  return array;
};
function readChecksumByte (array){
  return array[1];
};
function hasChecksum (array){
  return (array[0] & CHECKSUM_BIT) !== 0;
};
function putIterationFactor (array, iterations){
  array[0] = array[0] | iterations;
  return array;
};
function readIterationFactor (array){
  var mask;
  mask = 0xff ^ CHECKSUM_BIT;
  return array[0] & mask;
};

// exported
export function generateRandomSeed(){
  return bitcore.crypto.Random.getRandomBuffer(KEY_LENGTH);
}

export function generateLockedKey(seed, password, itFac, callback){
  return myScrypt(password, reduceSeed(seed, password.length), itFac, function(hash){
    return callback(
    bitcore.util.buffer.bufferToHex(
    putIterationFactor(putChecksumByte(cleanMetaByte(
    seed), hash[0]), itFac)));
  });
}

// TODO switched to crpyot-aes-gcm because I couldn't get this particular approach to generalize to arbitrary keys
export function lockKey(key: string, password: string, itFac = DEFAULT_LOGN, callback: Function | undefined = undefined){
  return callback ?
    generateLockedKey(key, password, itFac, callback) :
    new Promise((resolve, reject) => {
      try {
        return generateLockedKey(key, password, itFac, resolve)
      } catch (e) {
        reject(e)
      }
    })
}

export function unlockKey(lockedKey, password, callback: Function | undefined = undefined){
  if(!callback){
    return new Promise((resolve, reject) => {
      try {
        return unlockKey(lockedKey, password, resolve)
      } catch (e) {
        reject(e)
      }
    })
  }
  let keyBuffer = bitcore.util.buffer.hexToBuffer(lockedKey)
  let itFac = readIterationFactor(keyBuffer)
  if (hasChecksum(keyBuffer)) {
    return myScrypt(password, reduceSeed(keyBuffer, password.length), itFac, function(hash){
      var checksum;
      checksum = readChecksumByte(
      keyBuffer);
      if (hash[0] === checksum) {
        return myScrypt(password, keyBuffer, itFac, callback);
      } else {
        return callback(false);
      }
    });
  } else {
    return myScrypt(password, keyBuffer, itFac, callback);
  }
}
export function generateHdroot(unlockedKey, callback){
  return callback(
    !unlockedKey ? false : bitcore.HDPrivateKey.fromSeed(new Buffer(unlockedKey))
  )
}
export function generateCheckingRoot(lockedKey, password, callback){
  return unlockKey(lockedKey, password, function(unlockedKey){
    if (!unlockedKey) {
      return callback(false);
    } else {
      return generateHdroot(unlockedKey, function(hdroot){
        var path;
        path = getBip44RootPath() + "/0'";
        return callback(
        hdroot.derive(path));
      });
    }
  });
}
export function extractAddress(str: string){
  let match = /[a-km-zA-HJ-NP-Z0-9]{27,34}/.exec(str)
  if(!match){
    throw Error('string does not contain valid address')
  }
  return bitcore.Address.fromString(match[0])
}

export function getBip44RootPath(){
  const coinTypes = {
    'peercoin': 6,
    'peercoin-testnet': 1
  }
  var coinType;
  coinType = coinTypes[bitcore.Networks.defaultNetwork.name];
  return "m/44'/" + coinType + "'";
}
