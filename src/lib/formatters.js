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

  return "neutral";
}

export function translateGender(gender) {
  const normalized = (gender ?? "").toLowerCase();

  if (normalized === "male") {
    return "Erkek";
  }

  if (normalized === "female") {
    return "Kiz";
  }

  return "Diger";
}

export function translateRole(role) {
  if (role === "Doctor") {
    return "Doktor";
  }

  if (role === "User") {
    return "Kullanici";
  }

  return role ?? "-";
}

export function getInitials(name, lastName) {
  return `${name?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "BF";
}
