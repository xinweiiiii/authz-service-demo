import AWS from "aws-sdk";
import { IsEmpty, IsEmptyObject } from "../common/helper"

export const getSecretValue = async (secretName) => {
  try {
    return new Promise((resolve, reject) => {
      const secretsManager = new AWS.SecretsManager({
        region: "ap-southeast-1",
      });
      secretsManager.getSecretValue({ SecretId: secretName }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          if (data && data.SecretString) {
            const secret = data.SecretString;
            const parsedSecret = JSON.parse(secret);
            // secrets[secretName] = parsedSecret;
            resolve({
              secrets: parsedSecret,
            });
          }
          if (data && data.SecretBinary) {
            // handle binary
            let dataSecretBinary = data.SecretBinary;
            if (dataSecretBinary) {
              let buff = Buffer.from(dataSecretBinary.toString(), "base64");
              const decodedBinarySecret = buff.toString("ascii");
              // secrets[secretName] = decodedBinarySecret;
              resolve({
                secrets: decodedBinarySecret,
              });
            }
          }
        }
      });
    });
  } catch (error) {
    throw {
      message: "Unable to retrieve value from Secrets Manager",
      cause: error,
    };
  }
};
