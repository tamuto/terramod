exports.handler = async () => {
  const response = {
    "statusCode": 200,
    "headers": {
      "Content-Type": 'plain/text',
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": '*',
      "Access-Control-Allow-Methods": 'GET,POST,PUT,DELETE',
      "Access-Control-Allow-Origin": 'http://verify.datalive.co.jp'
    },
    "body": ""
  };

  return response;
};
