export function Disclaimer({ className }: { className?: string }) {
  return (
    <p className={className ?? "text-xs leading-relaxed text-muted-foreground"}>
      Taxpayer-prepared contemporaneous log for substantiation. This is not tax
      advice and does not prepare Form 8582 or make elections. Your CPA must
      review these records.
    </p>
  );
}
