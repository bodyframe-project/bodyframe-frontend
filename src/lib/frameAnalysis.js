const ELBOW_REFERENCE_BANDS = {
  female: [
    { minHeight: 146, maxHeight: 148, minElbow: 5.7, maxElbow: 6.4 },
    { minHeight: 150, maxHeight: 158, minElbow: 5.7, maxElbow: 6.4 },
    { minHeight: 160, maxHeight: 168, minElbow: 6.0, maxElbow: 6.7 },
    { minHeight: 170, maxHeight: 178, minElbow: 6.0, maxElbow: 6.7 },
    { minHeight: 180, maxHeight: 190, minElbow: 6.3, maxElbow: 7.0 },
  ],
  male: [
    { minHeight: 155, maxHeight: 158, minElbow: 6.4, maxElbow: 7.0 },
    { minHeight: 160, maxHeight: 168, minElbow: 6.7, maxElbow: 7.3 },
    { minHeight: 170, maxHeight: 178, minElbow: 7.0, maxElbow: 7.5 },
    { minHeight: 180, maxHeight: 188, minElbow: 7.0, maxElbow: 7.9 },
    { minHeight: 190, maxHeight: 198, minElbow: 7.3, maxElbow: 8.3 },
  ],
};

function normalizeGender(gender) {
  return `${gender ?? ""}`.toLowerCase() === "male" ? "male" : "female";
}

function getBandMidpoint(band) {
  return (band.minHeight + band.maxHeight) / 2;
}

function getNearestReferenceBand(bands, height) {
  return [...bands].sort(
    (left, right) =>
      Math.abs(getBandMidpoint(left) - height) -
      Math.abs(getBandMidpoint(right) - height),
  )[0];
}

export function normalizeCalculationResponse(payload) {
  return payload?.data ?? payload?.Data ?? payload;
}

export function calculateElbowFrame({ height, elbowWidth, gender }) {
  const parsedHeight = Number(height);
  const parsedElbowWidth = Number(elbowWidth);

  if (!parsedHeight || !parsedElbowWidth) {
    throw new Error("Boy ve dirsek olcusu girilmeden hesaplama yapilamaz.");
  }

  const normalizedGender = normalizeGender(gender);
  const referenceBands = ELBOW_REFERENCE_BANDS[normalizedGender];
  const matchedBand =
    referenceBands.find(
      (band) => parsedHeight >= band.minHeight && parsedHeight <= band.maxHeight,
    ) ?? getNearestReferenceBand(referenceBands, parsedHeight);
  const isApproximate =
    parsedHeight < matchedBand.minHeight || parsedHeight > matchedBand.maxHeight;

  let category = "Medium (Orta yapi)";
  if (parsedElbowWidth < matchedBand.minElbow) {
    category = "Small (Ince yapi)";
  } else if (parsedElbowWidth > matchedBand.maxElbow) {
    category = "Large (Iri yapi)";
  }

  return {
    method: "elbow",
    methodLabel: "Dirsek genisligi",
    category,
    frameIndex: Number((((parsedElbowWidth * 10) / parsedHeight) * 100).toFixed(2)),
    zScore: null,
    referenceRange: `${matchedBand.minElbow.toFixed(1)} - ${matchedBand.maxElbow.toFixed(1)} cm`,
    heightRange: `${matchedBand.minHeight} - ${matchedBand.maxHeight} cm`,
    note: isApproximate
      ? "Boy degeriniz tablonun dogrudan kapsamadigi bir aralikta oldugu icin en yakin referans bant kullanildi."
      : "Sonuc dirsek genisligi icin referans boy bandina gore siniflandirildi.",
    formula: "Frame Index = (dirsek [mm] / boy [cm]) x 100",
  };
}
