import {
  ElbowMeasurementIllustration,
  WristMeasurementIllustration,
} from "../illustrations/MeasurementIllustrations";

const GUIDE_ITEMS = [
  {
    key: "wrist",
    eyebrow: "Bilek olcumu",
    title: "Bilegin en ince noktasini olcun.",
    description: "Ana sonuc bu olcuyle eslesir.",
    bullets: [
      "Kemigin hemen ustundeki dar noktayi secin.",
      "Mezurayi cilde temas edecek kadar yakin tutun.",
      "Santimetre cinsinden olcum girin.",
    ],
    Illustration: WristMeasurementIllustration,
  },
  {
    key: "elbow",
    eyebrow: "Dirsek olcumu",
    title: "Dirsek kemikleri arasini olcun.",
    description: "Ek yorum icin kullanilir.",
    bullets: [
      "Kolu rahat bir sekilde sabitleyin.",
      "On kolu yukari kaldirarak 90 derece aci olusturun.",
      "Dirsegin en genis iki kemik ucu arasini olcun.",
    ],
    Illustration: ElbowMeasurementIllustration,
  },
];

export function MeasurementGuideCards({
  id,
  title = "Olcumu nasil almalisiniz?",
  description = "Bilek ve dirsek olculerini ayni birimle girin.",
  compact = false,
}) {
  return (
    <section
      id={id}
      className={`surface-card measurement-guide-shell${compact ? " compact" : ""}`}
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">Olcum Rehberi</p>
          <h3>{title}</h3>
        </div>
        {!compact && description ? <p className="section-copy">{description}</p> : null}
      </div>

      <div className="measurement-guide-grid">
        {GUIDE_ITEMS.map(({ key, eyebrow, title: cardTitle, description: cardText, bullets, Illustration }) => (
          <article key={key} className={`guide-card${compact ? " compact" : ""}`}>
            <Illustration />
            <div className="guide-card-copy">
              <p className="eyebrow">{eyebrow}</p>
              <h4>{cardTitle}</h4>
              {compact ? (
                <p className="guide-compact-note">{bullets[0]}</p>
              ) : (
                <>
                  <p>{cardText}</p>
                  <ul className="guide-list">
                    {bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
