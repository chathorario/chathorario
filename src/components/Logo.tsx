export function Logo({ className }: { className?: string }) {
  return (
    <img
      src="/logo/logo_chathorario_fundo_transparente_2.png"
      alt="Logo ChatHorário"
      className={className ?? "h-10 w-auto"}
      loading="lazy"
    />
  );
}