const options = {};
const swarmgw = require('swarmgw')(options);

export function putToSwarm(content) {
  return new Promise((resolve, reject) => {
    swarmgw.put(content, function (error, hash) {
      if (error) {
        reject(error);
      } else {
        resolve(hash);
      }
    });
  });
}

export function getFromSwarm(hash) {
  return new Promise((resolve, reject) => {
    swarmgw.get(`bzz-raw://${hash}`, function (error, content) {
      if (error) {
        reject(error);
      } else {
        resolve(content);
      }
    });
  });
}
