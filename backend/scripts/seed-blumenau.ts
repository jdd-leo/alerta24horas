import { FloodLevel, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// TTLs iguais aos dos services (Flood: 72h, Signal: 24h)
const FLOOD_TTL_MS = 72 * 60 * 60 * 1000;
const SIGNAL_TTL_MS = 24 * 60 * 60 * 1000;

// 20 pontos de alagamento em Blumenau/SC, em bairros próximos ao Rio Itajaí-Açu
// e áreas historicamente afetadas por enchentes.
const floods: { level: FloodLevel; lat: number; lng: number }[] = [
  { level: 'HIGH', lat: -26.9189, lng: -49.0658 }, // Centro (beira-rio)
  { level: 'HIGH', lat: -26.9405, lng: -49.0998 }, // Velha
  { level: 'HIGH', lat: -26.9255, lng: -49.0552 }, // Ponta Aguda
  { level: 'HIGH', lat: -26.9220, lng: -49.0610 }, // Centro / Ponte Aldo Pereira
  { level: 'HIGH', lat: -26.9480, lng: -49.0900 }, // Velha Central
  { level: 'MEDIUM', lat: -26.9302, lng: -49.0748 }, // Vila Nova
  { level: 'MEDIUM', lat: -26.9552, lng: -49.0748 }, // Garcia
  { level: 'MEDIUM', lat: -26.9150, lng: -49.0720 }, // Boa Vista
  { level: 'MEDIUM', lat: -26.9050, lng: -49.0820 }, // Vorstadt
  { level: 'MEDIUM', lat: -26.9620, lng: -49.0820 }, // Progresso
  { level: 'MEDIUM', lat: -26.9100, lng: -49.0560 }, // Itoupava Seca
  { level: 'MEDIUM', lat: -26.8980, lng: -49.0680 }, // Bom Retiro
  { level: 'LOW', lat: -26.8902, lng: -49.0902 }, // Fortaleza
  { level: 'LOW', lat: -26.8505, lng: -49.0702 }, // Itoupava Central
  { level: 'LOW', lat: -26.9702, lng: -49.0602 }, // Água Verde
  { level: 'LOW', lat: -26.8700, lng: -49.0500 }, // Salto do Norte
  { level: 'LOW', lat: -26.8400, lng: -49.1100 }, // Badenfurt
  { level: 'LOW', lat: -26.9750, lng: -49.0950 }, // Escola Agrícola
  { level: 'LOW', lat: -26.8850, lng: -49.0450 }, // Testo Salto
  { level: 'LOW', lat: -26.9000, lng: -49.1050 }, // Passo Manso
];

// 12 pontos de sinalização em Blumenau/SC.
const signals: {
  emoji: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
}[] = [
  {
    emoji: '🚧',
    title: 'Via interditada',
    description: 'Rua bloqueada pela Defesa Civil devido ao nível do rio.',
    lat: -26.9195,
    lng: -49.0665,
  },
  {
    emoji: '⚡',
    title: 'Sem energia',
    description: 'Queda de energia no bairro desde o início da manhã.',
    lat: -26.9310,
    lng: -49.0760,
  },
  {
    emoji: '🏠',
    title: 'Abrigo aberto',
    description: 'Ginásio recebendo desabrigados, com colchões e alimentação.',
    lat: -26.9098,
    lng: -49.0710,
  },
  {
    emoji: '🌳',
    title: 'Árvore caída',
    description: 'Árvore sobre a pista, trânsito em meia-pista.',
    lat: -26.9410,
    lng: -49.1005,
  },
  {
    emoji: '🚤',
    title: 'Resgate de barco',
    description: 'Voluntários com barco apoiando moradores ilhados.',
    lat: -26.9260,
    lng: -49.0545,
  },
  {
    emoji: '💧',
    title: 'Ponto de água potável',
    description: 'Distribuição de água potável para a comunidade.',
    lat: -26.9560,
    lng: -49.0755,
  },
  {
    emoji: '🩺',
    title: 'Atendimento médico',
    description: 'Posto de atendimento médico emergencial montado no local.',
    lat: -26.9055,
    lng: -49.0815,
  },
  {
    emoji: '🍲',
    title: 'Doação de alimentos',
    description: 'Ponto de coleta e distribuição de alimentos e roupas.',
    lat: -26.9620,
    lng: -49.0825,
  },
  {
    emoji: '⚠️',
    title: 'Deslizamento de terra',
    description: 'Encosta com risco de deslizamento, evitem a área.',
    lat: -26.9750,
    lng: -49.0955,
  },
  {
    emoji: '🚗',
    title: 'Carro submerso',
    description: 'Veículo abandonado na via alagada, cuidado ao passar.',
    lat: -26.9225,
    lng: -49.0615,
  },
  {
    emoji: '📶',
    title: 'Sem sinal de telefonia',
    description: 'Sem cobertura de celular na região, comunicação instável.',
    lat: -26.8510,
    lng: -49.0705,
  },
  {
    emoji: '🔋',
    title: 'Recarga de celular',
    description: 'Ponto com gerador para recarregar celulares e baterias.',
    lat: -26.9145,
    lng: -49.0725,
  },
];

async function main() {
  const user = await prisma.user.upsert({
    where: { googleId: 'dev:seed@alerta24horas.local' },
    update: {},
    create: {
      googleId: 'dev:seed@alerta24horas.local',
      email: 'seed@alerta24horas.local',
      name: 'Seed Blumenau',
    },
  });

  // Idempotente: remove os pontos criados por este script antes de recriá-los.
  await prisma.flood.deleteMany({ where: { userId: user.id } });
  await prisma.signal.deleteMany({ where: { userId: user.id } });

  const now = Date.now();

  await prisma.flood.createMany({
    data: floods.map((f) => ({
      userId: user.id,
      level: f.level,
      lat: f.lat,
      lng: f.lng,
      expiresAt: new Date(now + FLOOD_TTL_MS),
    })),
  });

  await prisma.signal.createMany({
    data: signals.map((s) => ({
      userId: user.id,
      emoji: s.emoji,
      title: s.title,
      description: s.description,
      photos: [],
      lat: s.lat,
      lng: s.lng,
      expiresAt: new Date(now + SIGNAL_TTL_MS),
    })),
  });

  console.log(
    `Seed concluído: ${floods.length} alagamentos e ${signals.length} sinalizações em Blumenau/SC (usuário ${user.email}).`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
