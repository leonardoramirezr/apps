/**
 * Instituciones mexicanas donde alguien puede tener una cuenta, agrupadas para el selector.
 *
 * Se guarda el nombre tal cual, no un código: un préstamo viejo sigue mostrando su banco
 * aunque la institución cambie de nombre o desaparezca de esta lista.
 */
export interface BankGroup {
	label: string;
	banks: string[];
}

export const bankGroups: BankGroup[] = [
	{
		label: 'Bancos',
		banks: [
			'Actinver',
			'Afirme',
			'Autofin',
			'Banamex',
			'Banca Mifel',
			'Banco Azteca',
			'Banco Base',
			'Banco Covalto',
			'Banco del Bajío',
			'Banco Dondé',
			'Banco Finterra',
			'Banco Forjadores',
			'Banco Inmobiliario Mexicano',
			'Banco Invex',
			'Banco Monex',
			'Banco Multiva',
			'Banco PagaTodo',
			'Banco Sabadell',
			'Banco Ve por Más',
			'BanCoppel',
			'Bancrea',
			'Bankaool',
			'Banorte',
			'Banregio',
			'Bansí',
			'BBVA México',
			'CIBanco',
			'Compartamos Banco',
			'Consubanco',
			'Hey Banco',
			'HSBC México',
			'Inbursa',
			'Intercam Banco',
			'Santander México',
			'Scotiabank México',
			'Volkswagen Bank'
		]
	},
	{
		label: 'Fintech y no bancarias',
		banks: [
			'Albo',
			'Arcus',
			'Broxel',
			'Caja Popular Mexicana',
			'Cuenca',
			'Fincomún',
			'Finsus',
			'Fondeadora',
			'Klar',
			'Kuspit',
			'Libertad',
			'Mercado Pago',
			'Nu México',
			'NVIO',
			'Spin by OXXO',
			'Stori',
			'STP',
			'Ualá'
		]
	},
	{
		label: 'Banca de desarrollo',
		banks: [
			'Banco del Bienestar',
			'Banjército',
			'Banobras',
			'Bancomext',
			'Nacional Financiera',
			'Sociedad Hipotecaria Federal'
		]
	},
	{
		label: 'Corporativos y extranjeros',
		banks: [
			'American Express',
			'Bank of America México',
			'Bank of China México',
			'Barclays México',
			'Banco S3 México',
			'ICBC México',
			'J.P. Morgan México',
			'KEB Hana México',
			'Mizuho Bank México',
			'MUFG Bank México',
			'Shinhan de México'
		]
	},
	{
		label: 'Otros',
		banks: ['Efectivo', 'Otra institución']
	}
];

/** Todos los nombres en una sola lista, para búsquedas y validación. */
export const allBanks: string[] = bankGroups.flatMap((group) => group.banks);
