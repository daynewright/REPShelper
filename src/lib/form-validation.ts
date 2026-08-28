export type FieldErrors = Record<string, string>;

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function firstError(errors: FieldErrors): string | null {
  const values = Object.values(errors);
  return values[0] ?? null;
}

export function clearField(
  errors: FieldErrors,
  field: string,
): FieldErrors {
  if (!(field in errors)) return errors;
  const next = { ...errors };
  delete next[field];
  return next;
}

function requireNotes(notes: string, errors: FieldErrors) {
  if (!notes.trim()) {
    errors.notes = "Add a short description of what you did.";
  }
}

function requireRentalProperty(
  category: string,
  propertyId: string,
  errors: FieldErrors,
) {
  if (category === "rental" && !propertyId.trim()) {
    errors.property_id = "Pick which rental this work was on.";
  }
}

export function validateLogEntry(input: {
  category: string;
  propertyId: string;
  occurredOn: string;
  hours: string;
  startTime: string;
  endTime: string;
  notes: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (!input.category) {
    errors.category = "Choose what kind of work this was.";
  }
  requireRentalProperty(input.category, input.propertyId, errors);
  if (!input.occurredOn.trim()) {
    errors.occurred_on = "Choose a date.";
  }

  const hoursRaw = input.hours.trim();
  const start = input.startTime.trim();
  const end = input.endTime.trim();
  const hasBothTimes = Boolean(start && end);
  const hasPartialTimes = Boolean(start || end) && !hasBothTimes;

  if (hasBothTimes) {
    if (start >= end) {
      errors.end_time = "End time must be after start time.";
    }
  } else if (hoursRaw) {
    const hours = Number(hoursRaw);
    if (!Number.isFinite(hours) || hours <= 0) {
      errors.hours = "Enter hours greater than 0.";
    } else if (hours < 0.25) {
      errors.hours = "Use at least 0.25 hours (15 minutes).";
    }
    // Partial times with valid hours: ignore times and use hours.
  } else if (hasPartialTimes) {
    if (!start) errors.start_time = "Enter a start time.";
    if (!end) errors.end_time = "Enter an end time.";
  } else {
    errors.hours = "Enter hours, or a start and end time.";
  }

  requireNotes(input.notes, errors);
  return errors;
}

export function validateEntryEdit(input: {
  occurredOn: string;
  hours: string;
  notes: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (!input.occurredOn.trim()) {
    errors.occurred_on = "Choose a date.";
  }
  const hours = Number(input.hours.trim());
  if (!Number.isFinite(hours) || hours <= 0) {
    errors.hours = "Enter hours greater than 0.";
  } else if (hours < 0.25) {
    errors.hours = "Use at least 0.25 hours (15 minutes).";
  }
  requireNotes(input.notes, errors);
  return errors;
}

export function validateTimerStart(input: {
  category: string;
  propertyId: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (!input.category) {
    errors.category = "Choose what kind of work this was.";
  }
  requireRentalProperty(input.category, input.propertyId, errors);
  return errors;
}

export function validateTimerStop(input: { notes: string }): FieldErrors {
  const errors: FieldErrors = {};
  requireNotes(input.notes, errors);
  return errors;
}

export function validatePropertyName(name: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!name.trim()) {
    errors.name = "Enter a rental name.";
  }
  return errors;
}

/** Map known server messages onto field keys when possible. */
export function mapServerError(error: string): FieldErrors {
  const lower = error.toLowerCase();
  if (lower.includes("description") || lower.includes("what you did")) {
    return { notes: error };
  }
  if (lower.includes("pick which rental") || lower.includes("rental before")) {
    return { property_id: error };
  }
  if (lower.includes("end time")) return { end_time: error };
  if (lower.includes("start or end") || lower.includes("start time")) {
    return { start_time: error };
  }
  if (lower.includes("hours")) return { hours: error };
  if (lower.includes("date")) return { occurred_on: error };
  if (lower.includes("kind of work") || lower.includes("category")) {
    return { category: error };
  }
  if (lower.includes("name")) return { name: error };
  return { _form: error };
}
