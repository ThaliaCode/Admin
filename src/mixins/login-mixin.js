// src/mixins/loginMixin.js
import helper from '@/shared/helper';

const configMap = [
	{ httpKey: '$httpSales', code: 'SALES_URL' },
	{ httpKey: '$httpMiddleware', code: 'MIDDLEWARE_URL' },
	{ httpKey: '$httpProduction', code: 'PRODUCTION_URL' },
	{ httpKey: '$httpProducts', code: 'PRODUCTS_URL' },
	{ httpKey: '$httpProductsRead', code: 'PRODUCTS_READ_URL' },
	{ httpKey: '$httpNotifications', code: 'NOTIFICATIONS_URL' },
	{ httpKey: '$httpSalesRead', code: 'SALES_READ_URL' },
	{ httpKey: '$httpFacSunat', code: 'FACTURACION_SUNAT_URL' },
	{ httpKey: '$httpReportSales', code: 'SALES_REPORT' },
	{ httpKey: '$httpProductsSales', code: 'PRODUCTS_REPORT' },
	{ httpKey: '$httpReports', code: 'API_REPORTS' },
	{ httpKey: '$httpCMS', code: 'CMS_URL' },
	{ httpKey: '$httpSettlement', code: 'SETTLEMENT_URL' },
];

export default {
	data() {
		return {
			user: '',
			password: '',
			isLoading: false,
			loginError: '',
		};
	},
	methods: {
		async signin() {
			window.localStorage.clear();
			this.isLoading = true;
			this.loginError = '';
			const userData = {
				email: this.user,
				password: this.password,
				codeApp: process.env.APP_CODE,
			};
			try {
				const response = await this.$httpAcl.post('authenticate', userData);
				const user = response.data;
				const inLocalStorage = JSON.stringify(user);
				const { token, codeProject, domains } = user;

				if (domains) {
					helper.setLocalData('domains', domains);
					this.$bus.$emit('DOMAINS', domains);
				}
				this.setUrlDomains();

				const headers = {
					Authorization: `Bearer ${token}`,
				};

				const requests = [
					this.$httpSales.get('employees/current', { headers }),
					this.$httpSales.get('/catalog-sunat-details-list/TABLA17', {
						headers,
					}),
					this.$httpSales.get('/catalog-sunat-details-list/TABLA16', {
						headers,
					}),
					this.$httpSales.get('/type-documents', { headers }),
					this.$httpProducts.get('warehouses', { headers }),
				];

				const [responseJapi, taxes, otherTaxes, documents, warehouses] =
					await Promise.all(requests);

				const userJapi = responseJapi.data;

				localStorage.setItem(process.env.STORAGE_USER_KEY, inLocalStorage);
				localStorage.setItem(`${process.env.STORAGE_USER_KEY}::token`, token);
				helper.setLocalData('codeProject', codeProject);
				helper.setLocalData('documents', documents.data);
				helper.setLocalData('warehouses', warehouses.data);
				helper.setLocalData('acl-id', userJapi.aclUserId);
				helper.setLocalData('acl-code', userJapi.aclUserCode);
				helper.setLocalData('admin-user', userJapi);
				helper.setLocalData('general-taxes', taxes.data);
				helper.setLocalData('other-taxes', otherTaxes.data);

				this.$bus.$emit('USER_INFO', userJapi);
				try {
					const { data: levelProgress } = await this.$httpAcl.get(
						`level-progress/${userJapi.company.aclId}`,
						{
							headers: {
								...headers,
								Accept: 'application/vnd.apiacl.v2+json',
							},
						}
					);
					helper.setLocalData('level-progress', levelProgress);
					this.$bus.$emit('LEVEL_PROGRESS', levelProgress);
				} catch (error) {
					console.error('Error loading level progress:', error);
				}
				const countryId = userJapi.company.comCountryId;
				await this.loadTaxIbc(countryId);

				const isDistri = this.$userInfo.roleCompanyCode === 'DISTRIBUIDOR';
				this.goTo(isDistri ? 'commerce-table' : 'commerce');
			} catch (e) {
				console.error(e);
				this.handleLoginError(e);
			} finally {
				this.isLoading = false;
			}
		},

		async checkSession() {
			try {
				const { data: checked } = await this.$httpSales.get(
					'devices-validation'
				);
				if (checked.codeMessage === 'TERMINAL_SESSION_EXIST') {
					this.showGenericError(
						`El punto de venta asignado al usuario con el que ingresó está siendo usado por ${checked.deviceTerminal.userName}`,
						7000
					);
				}
			} catch (err) {
				console.error(err);
				if (err.status === 500) {
					this.showGenericError();
				}
			}
		},

		async loadTaxIbc(countryId) {
			try {
				const response = await this.$httpSales.get(
					`/electronic-taxes/${countryId}/default`
				);
				helper.setLocalData('tax-icb', response.data);
			} catch (error) {
				console.error('Error loading tax ICB:', error);
			}
		},

		setUrlDomains() {
			const domains = helper.getLocalData('domains') || [];
			const aclUrls = domains.reduce((acc, domain) => {
				acc[domain.code] = domain.endPoint;
				return acc;
			}, {});

			configMap.forEach(({ httpKey, code }) => {
				this[httpKey].defaults.baseURL = aclUrls[code] || process.env[code];
			});

			this.$httpSunat.defaults.baseURL = (() => {
				const dynamic = aclUrls.API_SEARCH;
				const fallback = process.env.API_SEARCH;
				return dynamic ? `${dynamic}/api` : fallback;
			})();
		},

		handleLoginError(e) {
			this.loginError = ''; // Limpieza por si se llama varias veces

			// const contactNumber = process.env.NUMBER_CONTACT;
			// if (!e || !e.response) {
			// 	console.error('Network or unexpected error:', e);
			// 	// this.loginError =
			// 	// 	'No se pudo conectar con el servidor. Verifica tu conexión.';
			// 	return;
			// }
			// Axios error con respuesta
			const { status, data = {} } = e;
			const message = data.message;
			const messageError = data.messageError;
			const code = data.code;

			// 🚧 Mantenimiento
			if (status === 405 && message === 'MAINTENANCE') {
				window.location.href = '/maintenance';
				return;
			}

			// 🚫 Empresa bloqueada
			if (status === 405) {
				if (message === 'ACCESS_NOT_ALLOWED_BLOCKED_COMPANY') this.goTo('blocked-company');
				else if (message === 'ACCESS_NOT_PERMITTED_BY_MAINTENANCE')
					this.goTo('maintenance');
			}

			// 🧑‍💻 Usuario conectado desde otro dispositivo (con info detallada)
			if (status === 401 && code === 1153 && data.infoData) {
				const device = data.infoData.infoDevice;
				const msg = `Actualmente está conectado desde el dispositivo marca ${device.brand} modelo ${device.model}`;
				this.loginError = msg;
				this.showGenericError(msg, 10000); // solo si el método está disponible
				return;
			}

			// 🔁 Usuario ya tiene sesión activa
			if (status === 401 && message === 'USER_WITH_PREVIOUS_CONNECTION') {
				const msg = 'Ya existe una sesión activa con el usuario ingresado.';
				this.loginError = msg;
				this.showGenericError(msg);
				return;
			}

			// ❌ Credenciales incorrectas u otro mensaje directo
			if (
				typeof message === 'string' &&
				message.toLowerCase().includes('incorrecto')
			) {
				this.loginError = message;
				return;
			}

			// 🧾 Fallback genérico desde el servidor
			this.loginError = messageError || message || 'Error al iniciar sesión.';
		},
	},
	beforeDestroy() {
		this.checkSession();
	},
};
