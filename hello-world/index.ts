import middy from "@middy/core";

const {validateJWTToken} = require("../common/middleware/validateJWTToken");

export const helloWorldHandler = async (event, context) => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Hello World"
        }),
    };
}

export const handler = middy(helloWorldHandler)
    .use(validateJWTToken);

