<template>
	<v-layout align-center justify-center column class="fill-height maintenance">
		<v-flex text-xs-center>
			<img
				src="static/img/maintenance.png"
				alt="Mantenimiento"
				class="maintenance-img"
			/>
			<h1 class="tittle">Mantenimiento en curso</h1>
			<p class="text--info">
				En este momento estamos trabajando en optimizaciones importantes. El
				acceso se restablecerá en breve. Agradecemos tu comprensión
			</p>
			<v-btn size="large" class="btn-regresar" @click="goToLogin">
				Regresar
			</v-btn>
		</v-flex>
	</v-layout>
</template>

<script>
export default {
	name: 'page-maintenance',
	methods: {
		goToLogin() {
			this.goTo('login');
		},
	},
};
</script>

<style lang="scss">
.maintenance {
	background-color: white;
	text-align: center;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: 100vh;
}

.maintenance-img {
	margin-top: 7rem;
	width: 50%;
	height: auto;
	max-width: 27rem;
}

.tittle {
	font-size: 3rem;
	margin-top: 0px;
	margin-bottom: 20px;
	color: #fd9501;
}

.text--info {
	font-weight: bold;
	font-size: 1.5rem;
	margin-top: 10px;
	max-width: 35%;
	margin-left: auto;
	margin-right: auto;
	word-wrap: break-word;
}

.btn-regresar {
	background-color: #ff5a00 !important;
	border-radius: 8px;
	color: white !important;
	width: 125px;
	height: 45px;
}
</style>
