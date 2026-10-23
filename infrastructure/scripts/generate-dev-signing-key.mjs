import { generateKeyPairSync } from 'node:crypto';
const {privateKey,publicKey}=generateKeyPairSync('ed25519');
console.log('Development only: keep this private key out of source control.');
console.log('CREDENTIAL_PRIVATE_KEY_PEM='+JSON.stringify(privateKey.export({type:'pkcs8',format:'pem'}).toString()));
console.log('Public key:\n'+publicKey.export({type:'spki',format:'pem'}).toString());
