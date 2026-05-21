import elbowReference from "../../assets/measurement-guides/elbow-reference.png";
import wristReference from "../../assets/measurement-guides/wrist-reference.png";

function MeasurementCardFrame({ accentClass = "", imageSrc, alt, title, note }) {
  return (
    <figure className={`measurement-illustration ${accentClass}`}>
      <div className="measurement-illustration-media">
        <img src={imageSrc} alt={alt} loading="lazy" />
      </div>
      <figcaption className="measurement-illustration-caption">
        <strong>{title}</strong>
        <span>{note}</span>
      </figcaption>
    </figure>
  );
}

export function WristMeasurementIllustration() {
  return (
    <MeasurementCardFrame
      accentClass="wrist"
      imageSrc={wristReference}
      alt="Bilek olcumunun alinacagi bolgeyi gosteren referans fotograf"
      title="Bilek referansi"
      note="En dar bolgeye odaklanin."
    />
  );
}

export function ElbowMeasurementIllustration() {
  return (
    <MeasurementCardFrame
      accentClass="elbow"
      imageSrc={elbowReference}
      alt="Dirsek genisliginin alinacagi bolgeyi gosteren referans fotograf"
      title="Dirsek referansi"
      note="En genis iki kemik ucu arasi."
    />
  );
}
