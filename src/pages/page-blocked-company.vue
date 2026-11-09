<template>
	<v-layout
		align-center
		justify-center
		column
		class="fill-height blocked-company"
	>
		<v-flex text-xs-center>
			<img
				src="static/img/blocked-company.png"
				alt="Mantenimiento"
				class="blocked-company-img"
			/>
			<h1 class="tittle">Tu pago ha vencido</h1>
			<p class="text--info">
				Para seguir disfrutando de CasaMarket, cancela tu recibo contactándote
				con Soporte
			</p>
			<v-btn size="large" class="btn-regresar" @click="goToLogin">
				<img
					src="/static/img/whatsapp-white.svg"
					alt=""
					height="18"
					class="mr-2"
				/>
				Contacta con Soporte
			</v-btn>
		</v-flex>
	</v-layout>
</template>

<script>
export default {
	name: 'page-blocked-company',
	methods: {
		goToLogin() {
			window.open(
				`https://api.whatsapp.com/send?phone=${process.env.NUMBER_SUPPORT}`,
				'_blank'
			);
		},
	},
};
</script>

<style lang="scss">
.blocked-company {
	background-color: white;
	text-align: center;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: 100vh;
}

.blocked-company-img {
	margin-top: 7rem;
	width: 35%;
	height: auto;
	max-width: 27rem;
}

.tittle {
	font-size: 2.5rem;
	margin-top: 0px;
	margin-bottom: 20px;
	color: #fd9501;
}

.text--info {
	font-weight: bold;
	font-size: 1.5rem;
	margin-top: 10px;
	max-width: 50%;
	margin-left: auto;
	margin-right: auto;
	word-wrap: break-word;
}

.btn-regresar {
	background-color: #ff5a00 !important;
	border-radius: 8px;
	color: white !important;
	width: 225px;
	height: 45px;
	text-transform: none;
}
</style>
