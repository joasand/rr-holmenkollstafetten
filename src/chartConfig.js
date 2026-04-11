export const MARGIN = { top: 100, right: 50, bottom: 70, left: 180 };
export const JITTER_WIDTH = 25;
export const WIDTH = 1100;
export const BAND_HEIGHT = 70;
export const boundsWidth = WIDTH - MARGIN.left - MARGIN.right;

export const parseTime = (t) => {
  const parts = t.split(':').map(Number);
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
};

export const formatTime = (s) => {
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
};

export const X_VARIABLES = {
  persentil_totalt: {
    label: 'Persentil (totalt)',
    domain: [0, 100],
    tickFormat: (v) => `${v}%`,
    getValue: (d) => d.persentil_totalt,
  },
  persentil_klasse: {
    label: 'Persentil (blant klasse)',
    domain: [0, 100],
    tickFormat: (v) => `${v}%`,
    getValue: (d) => d.persentil_klasse,
  },
  etappetid: {
    label: 'Etappetid',
    domain: 'auto',
    tickFormat: formatTime,
    getValue: (d) => parseTime(d.etappetid),
  },
  etappe_hastighet: {
    label: 'Hastighet (min/km)',
    domain: 'auto',
    tickFormat: formatTime,
    getValue: (d) => parseTime(d.etappe_hastighet),
  },
  plassering_totalt: {
    label: 'Plassering (totalt)',
    domain: 'auto',
    tickFormat: (v) => `${v}`,
    getValue: (d) => d.plassering_totalt,
  },
  plassering_klasse: {
    label: 'Plassering (klasse)',
    domain: 'auto',
    tickFormat: (v) => `${v}`,
    getValue: (d) => d.plassering_klasse,
  },
};
