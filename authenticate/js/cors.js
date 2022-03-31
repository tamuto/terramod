exports.handler = async () => {
  const response = {
    "statusCode": 200,
    "headers": {
      "Content-Type": 'plain/text',
      "Access-Control-Allow-Headers": 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      "Access-Control-Allow-Methods": process.env.cors_methods,
      "Access-Control-Allow-Origin": process.env.cors_origins
    },
    "body": ""
  };

  return response;
};
