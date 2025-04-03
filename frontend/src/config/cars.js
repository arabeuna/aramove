export const CAR_TYPES = {
  economic: {
    name: 'Econômico',
    icon: '��',
    description: 'Carros compactos e econômicos',
    examples: 'HB20, Onix, Argo',
    features: [
      'Ar condicionado',
      'Até 4 passageiros',
      'Porta-malas pequeno'
    ],
    basePrice: 5,
    pricePerKm: 2
  },
  comfort: {
    name: 'Conforto',
    icon: '🚙',
    description: 'Carros espaçosos e confortáveis',
    examples: 'Corolla, Civic, Cruze',
    features: [
      'Ar condicionado',
      'Até 4 passageiros',
      'Porta-malas grande',
      'Mais espaço interno'
    ],
    basePrice: 8,
    pricePerKm: 2.5
  },
  premium: {
    name: 'Premium',
    icon: '🚘',
    description: 'Carros de luxo para ocasiões especiais',
    examples: 'BMW, Mercedes, Audi',
    features: [
      'Ar condicionado',
      'Até 4 passageiros',
      'Porta-malas grande',
      'Interior em couro',
      'Máximo conforto'
    ],
    basePrice: 12,
    pricePerKm: 3.5
  }
}; 