import { createCipher } from 'crypto'
// Taken from http://lollyrock.com/articles/nodejs-encryption/

async function aesGcmEncrypt(plaintext, password) {
  let cipher = createCipher('aes-256-ctr', password)
  let crypted = cipher.update(plaintext, 'utf8', 'hex')
  crypted += cipher.final('hex');
  return crypted;
}

async function aesGcmDecrypt(ciphertext, password) {
  var decipher = createDecipher('aes-256-ctr', password)
  var dec = decipher.update(ciphertext, 'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

export {
  aesGcmEncrypt as lockKey,
  aesGcmDecrypt as unlockKey
}
