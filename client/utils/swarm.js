import axios from 'axios';

function isValidHash(hash) {
  return /^[0-9a-f]{64}$/.test(hash);
}

function getFile(hash) {
  return axios.get('http://swarm-gateways.net/bzz-raw:/' + hash).then(res => res.data);
}

function putFile(content) {
  return axios.post('http://swarm-gateways.net/bzz-raw:/', content).then(res => res.data);
}

export async function putToSwarm(content) {
  const hash = await putFile(content);
  if (isValidHash(hash)) return hash;
  return null;
}

export async function getFromSwarm(hash) {
  return JSON.stringify(await getFile(hash));
}
