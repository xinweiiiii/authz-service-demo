import * as jwt from "jsonwebtoken";
import middy from "@middy/core";
import {errorHandler} from "./errorHandling/middlewareErrorHandler";

import {getClient} from "./dbConnector/authzDbConnector";
import {HashSecret} from "./utils/utils";

const secretName = process.env.AUTHZ_KEY
    ? process.env.AUTHZ_KEY
    : "dev/authz";


const SecretsManager = require("../common/secretsManager.ts");

export const authzHandler = async (event: {
    headers: { Authorization: string };
    body: string;
}) => {

    const authHeader = event.headers.Authorization; 
    const encodedCredentials = authHeader.split(" ")[1]; // To split the Basic and the Credentials
    const authHeader_decoded = Buffer.from(encodedCredentials, "base64").toString(
        "utf-8"
    ); // Decode the String
    const credentials = authHeader_decoded.split(":"); // Split the credentials to ClientID and Client Secret

    const [clientId, clientSecret] = credentials;

    const {entityName, clientSecretHash, salt} = await getClientRecord( // Retrieve DB Record using the ClientID
        clientId
    ); 

    const hashInputClientSecret = HashSecret(clientSecret, salt); // Hash the clientSecret input

    if (hashInputClientSecret === clientSecretHash) { // Verify the input Client Secret and Client Secret from DB
        
        // Get private key from secrets manager
        const secrets = await SecretsManager.getSecretValue(secretName);
        const privateKey_BASE64 = secrets.secrets.authz_key;
        const privateKey = Buffer.from(privateKey_BASE64, "base64").toString(
            "utf-8"
        );

        const jwtHeader = {
            alg: "ES256",
            typ: "JWT",
        };

        const currentTime = Math.floor(Date.now() / 1000);
        const expiresIn = 1800; // half hour

        const payload = {
            iss: "https://api.dev.com",
            aud: entityName,
            exp: currentTime + expiresIn,
            iat: currentTime,
            sub: "authz",
        };

        const token = jwt.sign(payload, privateKey, {header: jwtHeader})

        return {
            statusCode: 200,
            body: JSON.stringify({
                access_token: token,
                expires_in: expiresIn,
                token_type: "bearer",
            }),
        };
    } else {
        console.log("Unauthorized Client")
        return {
            statusCode: 401,
            body: JSON.stringify({
                error: "unauthorized_client",
                error_description: "Authorisation Failure"
            }),
        };
    }
};

export const signJwtToken = (payload, privateKey, jwtHeader) => {
    return jwt.sign(payload, privateKey, {header: jwtHeader});
}

export const getClientRecord = async (_clientId) => {
    const record = await getClient(_clientId);
    console.log(record)
    if (!record) {  
        console.error("record is empty")
        throw new Error("record is empty");
    } 
    const {entityName, clientSecret, salt} = record;
    const clientSecretHash = clientSecret; // must have this to rename the clientSecret to clientSecretHash
    return {entityName, clientSecretHash, salt};
    
}


export const handler = middy(authzHandler);
