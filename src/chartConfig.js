export const MARGIN = { top: 100, right: 50, bottom: 70, left: 180 };
export const WIDTH = 1300;
export const BAND_HEIGHT = 90;
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
  etappetid: {
    label: 'Etappetid',
    explanation: 'Hvor raskt deltakeren fullførte etappen.',
    domain: 'auto',
    tickFormat: formatTime,
    getValue: (d) => parseTime(d.etappetid),
  },
  etappe_hastighet: {
    label: 'Hastighet (min/km)',
    explanation: 'Hvor raskt deltakeren løp etappen i minutter per kilometer.',
    domain: 'auto',
    tickFormat: formatTime,
    getValue: (d) => parseTime(d.etappe_hastighet),
  },
  plassering_totalt: {
    label: 'Plassering (totalt)',
    explanation: 'Hvor deltakeren plasserte seg totalt.',
    domain: 'auto',
    tickFormat: (v) => `${v}`,
    getValue: (d) => d.plassering_totalt,
  },
  plassering_klasse: {
    label: 'Plassering (klasse)',
    explanation: 'Hvor deltakeren plasserte seg i sin klasse (A1 for førstelaget og A2 for andrelaget).',
    domain: 'auto',
    tickFormat: (v) => `${v}`,
    getValue: (d) => d.plassering_klasse,
  },
  plassering_rr: {
    label: 'Plassering (blant RR-ansatte)',
    explanation: 'Hvilken plassering deltakeren har blant RR-ansatte som har løpt samme etappe.',
    domain: 'auto',
    tickFormat: (v) => `${v}`,
    getValue: (d) => d.plassering_rr,
  },
  persentil_totalt: {
    label: 'Persentil (totalt)',
    explanation: 'Hvor deltakeren plasserte seg i forhold til alle deltakere.',
    domain: [0, 100],
    tickFormat: (v) => `${v}%`,
    getValue: (d) => d.persentil_totalt,
  },
  persentil_klasse: {
    label: 'Persentil (blant klasse)',
    explanation: 'Hvor deltakeren plasserte seg i forhold til andre deltakere i sin klasse.',
    domain: [0, 100],
    tickFormat: (v) => `${v}%`,
    getValue: (d) => d.persentil_klasse,
  },
};
