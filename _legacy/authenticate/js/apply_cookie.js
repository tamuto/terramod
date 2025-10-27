exports.handler = async () => {
  const json = {
    policy: process.env.policy,
    signature: process.env.signature,
    keyPair: process.env.keypair
  };

  const response = {
    "statusCode": 200,
    "headers": {
        "Content-Type": 'application/json',
        "Access-Control-Allow-Headers": 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        "Access-Control-Allow-Methods": process.env.cors_methods,
        "Access-Control-Allow-Origin": process.env.cors_origins
    },
    "body": JSON.stringify(json)
  };

  return response;
};
