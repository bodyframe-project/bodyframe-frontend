export function MeasurementForm({
  title,
  description,
  values,
  onChange,
  onPreview,
  onSubmit,
  submitLabel = "Kaydet",
  previewLabel = "Onizleme Yap",
  previewing = false,
  submitting = false,
  footerNote,
}) {
  return (
    <section className="surface-card measurement-form-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Yeni Olcum Ekle</p>
          <h3>{title}</h3>
        </div>
        {description ? <p className="section-copy">{description}</p> : null}
      </div>

      <form
        className="form-grid measurement-form-grid"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <label className="field">
          <span>Boy (cm)</span>
          <input
            type="number"
            step="0.1"
            min="1"
            value={values.height}
            onChange={(event) => onChange("height", event.target.value)}
            placeholder="Orn. 170"
          />
        </label>

        <label className="field">
          <span>Kilo (kg)</span>
          <input
            type="number"
            step="0.1"
            min="1"
            value={values.weight}
            onChange={(event) => onChange("weight", event.target.value)}
            placeholder="Orn. 65"
          />
        </label>

        <label className="field">
          <span>Dirsek Genisligi (cm)</span>
          <input
            type="number"
            step="0.1"
            min="1"
            value={values.elbowWidth}
            onChange={(event) => onChange("elbowWidth", event.target.value)}
            placeholder="Orn. 6.2"
          />
        </label>

        <label className="field">
          <span>Bilek Genisligi (cm)</span>
          <input
            type="number"
            step="0.1"
            min="1"
            value={values.wristWidth}
            onChange={(event) => onChange("wristWidth", event.target.value)}
            placeholder="Orn. 5.4"
          />
        </label>

        <label className="field field-full">
          <span>Olcum Tarihi</span>
          <input
            type="date"
            value={values.measurementDate}
            onChange={(event) => onChange("measurementDate", event.target.value)}
          />
        </label>

        <div className="form-actions field-full">
          <button
            type="button"
            className="button button-secondary"
            onClick={onPreview}
            disabled={previewing || submitting}
          >
            {previewing ? "Hesaplaniyor..." : previewLabel}
          </button>
          <button type="submit" className="button" disabled={submitting}>
            {submitting ? "Kaydediliyor..." : submitLabel}
          </button>
        </div>
      </form>

      {footerNote ? <p className="section-note">{footerNote}</p> : null}
    </section>
  );
}
