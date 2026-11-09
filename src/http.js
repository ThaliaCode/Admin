export function httpRequestInterceptor(config) {
	const token = window.localStorage.getItem(`${process.env.STORAGE_USER_KEY}::token`);
	const headers = config.headers;
	if (token) {
		headers.common.Authorization = `Bearer ${token}`;
		// headers.common['x-version'] = '12.2.4';
		this.$bus.$emit('is-loading', true);
	} else if (window.location.pathname === '/maintenance') {
		this.goTo('maintenance');
	} else if (window.location.pathname === '/blocked-company') {
		this.goTo('blocked-company');
	} else {
		this.goTo('login');
	}
	return config;
}

export function httpResponseSuccessInterceptor(response) {
	this.$bus.$emit('is-loading', false);
	return response;
}

export function httpResponseInterceptor(error) {
	this.$bus.$emit('is-loading', false);
	const { status, config, data } = error.response || {};

	// Debugging: Log all API errors globally
	const method = (config && config.method) ? config.method.toUpperCase() : 'UNKNOWN';
	const url = config ? config.url : 'UNKNOWN';
	const message = (data && data.message) ? data.message : error.message;

	console.error(`[API ERROR] ${method} ${url}:`, {
		status,
		message,
		details: data,
	});

	const loginRoute = 'login';

	if (status === 401) {
		if (error.response.data.code === 1008) {
			this.showGenericError('Usuario y/o contraseña incorrecta, vuelva a intentarlo');
		} else if (error.response.data.message === 'USER_WITH_PREVIOUS_CONNECTION') {
			this.showGenericError('Ya existe una sesión activa con el usuario ingresado.');
		} else if (error.response.data.message === 'HAS_TOO_MANY_LOGIN_ATTEMPS') {
			this.showGenericError('Tiene más de 5 intentos fallidos, comunicarse con soporte.');
		} else if (window.location.pathname === '/maintenance') {
			this.goTo('maintenance');
		} else if (window.location.pathname === '/blocked-company') {
			this.goTo('blocked-company');
		} else {
			const messageError =
				'Su sesión ha expirado o alguien más ha ingresado con su cuenta.';
			setTimeout(() => {
				this.showNotification(messageError, 'error', 10000);
			}, 1000);
			this.goTo(loginRoute);
		}
	} else if (status === 403) {
		this.showNotification('No tiene suficientes permisos para realizar esta acción');
	} else if (status === 500) {
		this.showGenericError();
	} else if (status === 406) {
		this.$bus.$emit('show-close-login', true);
	} else if (status === 400) {
		if (error.response.data.message === 'CASH_CLOSING_USER_EXIST') {
			// this.$bus.$emit('show-modal-error', true);
		}
	}
	return Promise.reject(error.response);
}
