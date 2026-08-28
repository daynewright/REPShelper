export function FieldError({
  id,
  message,
  className,
}: {
  id?: string;
  message?: string;
  className?: string;
}) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className={
        className ?? "text-destructive text-xs leading-snug font-medium"
      }
    >
      {message}
    </p>
  );
}
