import config from '../config';

export function genInitialMap() {
  let i = 0;
  const map = [];

  while (i < (config.nbCase * config.nbCase)) {
    map.push({
      player: -1,
      empty: true,
      playable: true
    });
    i++;
  }

  return map;
}
