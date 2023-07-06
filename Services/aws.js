const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-northeast-1', apiVersion: '2016-11-15' });
module.exports = AWS;