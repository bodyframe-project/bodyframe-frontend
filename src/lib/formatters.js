export function formatDate(dateValue) {
  if (!dateValue) {
    return "-";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateValue));
}

export function formatDateTime(dateValue) {
  if (!dateValue) {
    return "-";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateValue));
}

export function toInputDate(dateValue) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function calculateAge(dateOfBirth) {
  if (!dateOfBirth) {
    return 18;
  }

  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age < 0 ? 0 : age;
}

export function formatNumber(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-";
  }

  return Number(value).toFixed(digits);
}

export function formatFrameCategory(category) {
  const normalized = `${category ?? ""}`.toLowerCase();

  if (normalized.includes("medium")) {
    return "Orta yapi";
  }

  if (normalized.includes("small")) {
    return "Ince yapi";
  }

  if (normalized.includes("large")) {
    return "Iri yapi";
  }

  if (normalized.includes("normal")) {
    return "Dengeli";
  }

  if (normalized.includes("alt")) {
    return "Alt bant";
  }

  if (normalized.includes("ust")) {
    return "Ust bant";
  }

  if (normalized.includes("geli")) {
    return normalized.includes("alt")
      ? "Alt bant"
      : "Ust bant";
  }

  return category ?? "-";
}

export function toApiDateTime(dateValue) {
  if (!dateValue) {
    return null;
  }

  return `${dateValue}T12:00:00`;
}

export function getCategoryTone(category) {
  const normalized = (category ?? "").toLowerCase();

  if (normalized.includes("normal") || normalized.includes("medium")) {
    return "good";
  }

  if (normalized.includes("ust") || normalized.includes("small")) {
    return "info";
  }

  if (normalized.includes("alt") || normalized.includes("large")) {
    return "warn";
  }

  if (normalized.includes("geli")) {
    return normalized.includes("alt") ? "warn" : "info";
  }

  return "neutral";
}

export function getCategorySummary(category) {
  const normalized = `${category ?? ""}`.toLowerCase();

  if (normalized.includes("medium") || normalized.includes("normal")) {
    return "Olcumler dengeli bir yapiya isaret ediyor. Takibi duzenli surdurmek yeterlidir.";
  }

  if (normalized.includes("small") || normalized.includes("ust")) {
    return "Daha ince bir yapi goruluyor. Sonuc genel takip icinde degerlendirilmelidir.";
  }

  if (normalized.includes("large") || normalized.includes("alt")) {
    return "Daha genis bir yapi goruluyor. Kilo ve boy takibiyle birlikte okunmasi daha sagliklidir.";
  }

  if (normalized.includes("geli")) {
    return normalized.includes("alt")
      ? "Sonuc alt banda yakin gorunuyor."
      : "Sonuc ust banda yakin gorunuyor.";
  }

  return "Sonuc genel takip icinde degerlendirilmelidir.";
}

export function translateGender(gender) {
  const normalized = (gender ?? "").toLowerCase();

  if (normalized === "male") {
    return "Erkek";
  }

  if (normalized === "female") {
    return "Kadin";
  }

  return "Diger";
}

export function translateRole(role) {
  if (role === "Admin") {
    return "Admin";
  }

  if (role === "Doctor") {
    return "Doktor";
  }

  if (role === "User") {
    return "Kullanici";
  }

  if (role === "Moderator") {
    return "Moderator";
  }

  return role ?? "-";
}

export function getInitials(name, lastName) {
  return `${name?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "BF";
}
