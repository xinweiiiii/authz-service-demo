import AWS from "aws-sdk";
import csv from "csvtojson";

const defaultS3Params = {
  region: "ap-southeast-1",
};
AWS.config?.update(defaultS3Params);
export const getJsonObjectByStream = async (key : string, bucketName : string, awsClient = AWS) => {
  const s3 = new awsClient.S3({ params: { Bucket: bucketName } });
  const params = {
    Key: `${key}`,
    Bucket: bucketName,
  };
  try {
    const stream = await s3.getObject(params).createReadStream();
    return await csv().fromStream(stream);
  } catch (e) {
    console.error(JSON.stringify({
      function: "getJsonObjectByStream",
      message: "The specified key does not exist"
    }))
  }
};

export const getS3Object = async (key : string, bucketName : string, awsClient = AWS) => {
  const s3 = new awsClient.S3({ params: { Bucket: bucketName } });
  const params = {
    Key: `${key}`,
    Bucket: bucketName,
  };
  try {
    const object = await s3.getObject(params).promise();
    return object;
  } catch (e) {
    console.error(JSON.stringify({
      function: "getS3Object",
      message: "The specified key does not exist"
    }))
    return {
      message: "The specified key does not exist",
    };
  }
};
