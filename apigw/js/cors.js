exports.handler = async () => {
  const response = {
    "statusCode": 200,
    "headers": {
      "Content-Type": 'plain/text',
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": process.env.cors_headers,
      "Access-Control-Allow-Methods": process.env.cors_methods,
      "Access-Control-Allow-Origin": process.env.cors_origins
    },
    "body": ""
  };

  return response;
};
