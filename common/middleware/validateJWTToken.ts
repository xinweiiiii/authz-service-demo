import * as AWS from "aws-sdk";
import {getClientByServiceId} from "../../authz/dbConnector/authzDbConnector";

const jwt = require("jsonwebtoken");

export const retrievePublicKeyFromS3 = async (bucket, key) => {
    const params = {
        Bucket: bucket,
        Key: key,
    };

    const s3 = new AWS.S3();

    const response = await s3.getObject(params).promise();
    if (response && response.Body)
        return response.Body.toString();
    else
        return null;
};

export const validateJWTToken = {
    before: async (handler, next) => {

        // Step 1
        const accessToken = handler.event.headers.Authorization.split(" ")[1];

        // Step 2
        let publicKey = await retrievePublicKeyFromS3(
            "dev-assets-authz",
            "keys/public.pem"
        );

        try {
            // Step 3
            jwt.verify(accessToken, publicKey, {algorithms: ["ES256"]});
        } catch (error) {
            if (typeof next === "function") {
                return next(
                    new Error('Failed to validate JWT token')
                );
            } else {
                throw new Error("Failed to validate JWT token");
            }
        }

        // Step 4
        const decodedAccessToken = jwt.decode(accessToken);
        if (!decodedAccessToken) {
            if (typeof next === "function") {
                return next(
                    new Error("Access token cannot be decoded")
                );
            } else {
                throw new Error("Access token cannot be decoded");
            }
        }

        // Step 5
        if (decodedAccessToken.iss !== "https://api.dev.com") {
            if (typeof next === "function") {
                return next(
                    new Error("Invalid issuer in JWT token")
                );
            } else {
                throw new Error("Invalid issuer in JWT token");
            }
        }
        
        // Step 6
        if (Date.now() >= decodedAccessToken.exp * 1000) {
            if (typeof next === "function") {
                return next(
                    new Error("Token has expired")
                );
            } else {
                throw new Error("Token has expired");
            }
        }

        // Step 7
        const requestBody = JSON.parse(handler.event.body);

        if (decodedAccessToken.aud !== requestBody.entityName) {
            if (typeof next === "function") {
                return next(
                    new Error("Service ID does not match aud in access token")
                );
            } else {
                throw new Error("Service ID does not match aud in access token");
            }
        }

        if (typeof next === "function") next(null);
    }
};
