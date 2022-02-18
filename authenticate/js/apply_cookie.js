exports.handler = async () => {
  const keyPair = 'XXXXXXXX';
  const policy = 'XXXXXXXX';
  const signature = 'XXXXXXXX';

  const json = {
    policy: policy,
    signature: signature,
    keyPair: keyPair
  };

  const response = {
    "statusCode": 200,
    "headers": {
        "Content-Type": 'application/json',
        "Access-Control-Allow-Headers": 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Origin": "*"
    },
    "body": JSON.stringify(json)
  };

  return response;
};
