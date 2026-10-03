export interface AppConfig {
	appName: string;
	companyName: string;
	tagline: string;
	logoUrl: string;
	description: string;
}

export const defaultAppConfig: AppConfig = {
	appName: 'Citilumb SpeedType',
	companyName: 'Citilumb',
	tagline: 'Platform Resmi Tes Kecepatan Mengetik & Turnamen Citilumb',
	logoUrl: '/logo.svg',
	description: 'Tingkatkan akurasi dan kecepatan mengetik seluruh tim dan karyawan Citilumb.'
};
