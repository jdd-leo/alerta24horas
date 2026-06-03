export interface EmergencyContact {
  name: string;
  phone: string;
  description: string;
}

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    name: 'Defesa Civil',
    phone: '199',
    description: 'Alertas e ações em desastres, enchentes e deslizamentos.',
  },
  {
    name: 'Bombeiros',
    phone: '193',
    description: 'Resgate, salvamento e combate a incêndios.',
  },
  {
    name: 'SAMU',
    phone: '192',
    description: 'Atendimento médico de urgência e emergência.',
  },
  {
    name: 'Polícia Militar',
    phone: '190',
    description: 'Emergências policiais e segurança pública.',
  },
  {
    name: 'Polícia Rodoviária Federal',
    phone: '191',
    description: 'Emergências e acidentes em rodovias federais.',
  },
  {
    name: 'Centro de Informações Toxicológicas',
    phone: '0800 722 6001',
    description: 'Orientação em casos de intoxicação e contato com água contaminada.',
  },
];
