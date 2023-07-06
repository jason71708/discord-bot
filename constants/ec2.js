const ec2Ids = [
  'i-088ccd0c0fd37cfc0'
];

const EC2_STATUS = {
  pending: 0,
  running: 16,
  'shutting-down': 32,
  terminated: 48,
  stopping: 64,
  stopped: 80
};

module.exports = {
  EC2_STATUS,
  ec2Ids
};