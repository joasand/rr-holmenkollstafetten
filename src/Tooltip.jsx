import styles from './tooltip.module.css';

export function Tooltip({ hovered, xScale, yScale, MARGIN, dodgeOffset = 0 }) {
  if (!hovered) return null;

  return (
    <div
      className={styles.tooltip}
      style={{
        left: xScale(hovered.x) + MARGIN.left + 10,
        top: yScale(hovered.y) + yScale.bandwidth() / 2 + dodgeOffset + MARGIN.top,
      }}
    >
      <div className={styles.title} style={{ fontWeight: "bold", color: "black" }}>{hovered.deltaker}</div>
      <div className={styles.separator} />
      <div className={styles.row}><span>År</span><span>{hovered.year}</span></div>
      <div className={styles.row}><span>Lag</span><span>{hovered.team}</span></div>
      <div className={styles.row}><span>Etappe</span><span>{hovered.y}</span></div>
      <div className={styles.separator} />
      <div className={styles.row}><span>Etappetid</span><span>{hovered.etappetid}</span></div>
      <div className={styles.row}><span>Hastighet (min/km)</span><span>{hovered.etappe_hastighet}</span></div>
      <div className={styles.separator} />
      <div className={styles.row}><span>Plassering (totalt)</span><span>{hovered.plassering_totalt}</span></div>
      <div className={styles.row}><span>Deltakere (totalt)</span><span>{hovered.deltakere_totalt}</span></div>
      <div className={styles.row}><span>Persentil (totalt)</span><span>{hovered.persentil_totalt.toFixed(1)} %</span></div>
      <div className={styles.separator} />
      <div className={styles.row}><span>Plassering (i klasse)</span><span>{hovered.plassering_klasse}</span></div>
      <div className={styles.row}><span>Deltakere (i klasse)</span><span>{hovered.deltakere_klasse}</span></div>
      <div className={styles.row}><span>Persentil (i klasse)</span><span>{hovered.persentil_klasse.toFixed(1)} %</span></div>
    </div>
  );
}
