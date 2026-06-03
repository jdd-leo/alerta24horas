/** "criada há X" em pt-BR a partir de uma data ISO. */
export function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);

  if (min < 1) return 'agora mesmo';
  if (min < 60) return `há ${min} min`;

  const hours = Math.floor(min / 60);
  if (hours < 24) return `há ${hours} h`;

  const days = Math.floor(hours / 24);
  return `há ${days} d`;
}
