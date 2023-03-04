import crypto from "crypto";
import { getClient } from "../dbConnector/authzDbConnector";
import { IsEmpty } from "../../common/helper";

export const GenerateSalt = () => {
  const keyLength = 64; // in bytes
  return crypto.randomBytes(keyLength).toString("hex");
};

export const HashSecret = (secret, salt) => {
  const iterations = 100000;
  const keyLength = 64; // in bytes
  const digest = "sha512";
  return crypto
    .pbkdf2Sync(secret, salt, iterations, keyLength, digest)
    .toString("hex");
};

export const HashSecretWithDigest = (secret, salt, digest) => {
  const iterations = 100000;
  const keyLength = 64;
  return crypto
      .pbkdf2Sync(secret, salt, iterations, keyLength, digest)
      .toString("hex");
}

export const GenerateSecrets = async () => {
  const bytes = 20;
  const clientId = crypto.randomBytes(bytes).toString("hex");
  const clientSecret = crypto.randomBytes(bytes).toString("hex");
  const dbClientId = await getClient(clientId);
  if (!IsEmpty(dbClientId)) {
    return await GenerateSecrets();
  }
  return {
    clientId: clientId,
    clientSecret: clientSecret,
  };
};
