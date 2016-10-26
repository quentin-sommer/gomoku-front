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

export function toIdx(x, y) {
  return (x + (config.nbCase * y));
}

export function toCoord(idx) {
  return {
    x: idx % config.nbCase,
    y: (idx / config.nbCase) >> 0
  }
}
