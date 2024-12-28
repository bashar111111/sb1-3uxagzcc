const { ROAD_STATUS } = require('../config/constants');

function isValidStatus(status) {
  return Object.values(ROAD_STATUS).includes(status);
}

module.exports = {
  isValidStatus
};