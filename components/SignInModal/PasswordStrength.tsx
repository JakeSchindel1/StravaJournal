"use client";

type PasswordStrengthProps = {
  password: string;
};

type Strength = "empty" | "weak" | "fair" | "good" | "strong";

function getStrength(password: string): Strength {
  if (!password) return "empty";
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const types = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  const length = password.length;

  if (length < 6) return "weak";
  if (length >= 6 && types <= 1) return "weak";
  if (length >= 6 && types === 2) return "fair";
  if (length >= 8 && types >= 3) return "strong";
  return "good";
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = getStrength(password);
  if (strength === "empty") return null;

  const segments = 4;
  const filled =
    strength === "weak" ? 1 : strength === "fair" ? 2 : strength === "good" ? 3 : 4;

  const barColor =
    strength === "weak"
      ? "bg-amber-400/70"
      : strength === "fair"
        ? "bg-amber-500/80"
        : strength === "good"
          ? "bg-emerald-500/80"
          : "bg-emerald-600";

  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1" role="progressbar" aria-valuenow={filled} aria-valuemin={0} aria-valuemax={4} aria-label={`Password strength: ${strength}`}>
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
              i < filled ? barColor : "bg-[#D6D0C4]/50"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-[#5A5853]">
        {strength === "weak" && "Add more characters or mix letter types"}
        {strength === "fair" && "Add uppercase, numbers, or symbols"}
        {strength === "good" && "Good — longer is stronger"}
        {strength === "strong" && "Strong password"}
      </p>
    </div>
  );
}
