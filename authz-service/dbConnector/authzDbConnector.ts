import AWS from "aws-sdk";
import type { DocumentClient } from "aws-sdk/clients/dynamodb";

const defaultDbClient = new AWS.DynamoDB.DocumentClient({ region: "ap-southeast-1" })
const tableName = process.env.AUTHZ_TABLE ? process.env.AUTHZ_TABLE : "authz-table"

export const getClient = async (
  clientId: string,
  dynamoDB: DocumentClient = defaultDbClient
) => {
  const params = {
    TableName: tableName,
    Key: {
      clientId: clientId,
    },
    ProjectionExpression: "#clientId, #clientSecret, salt, entityName",
    ExpressionAttributeNames: {
      "#clientId": "clientId",
      "#clientSecret": "clientSecret",
    },
    ExpressionAttributeValues: {
      ":clientId": clientId,
    },
  };
  try {
    const result = await dynamoDB
        .get(params)
        .promise();

    return result ? result.Item : null;
  } catch (err) {
    console.error("error", err);
    return null;
  }
};
