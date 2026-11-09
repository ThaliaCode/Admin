<template>
	<div class="migrate-plan">
		<v-layout wrap>
			<v-flex xs12>
				<p class="mb-3 migrate-plan-title">MIGRA A UN MEJOR PLAN</p>
			</v-flex>
			<v-flex xs12>
				<div>
					<div>
						<div class="text-xs-center"><img src="/static/img/more-plan.svg" alt="mas"></div>
						<div class="text-xs-center"><img src="/static/img/arrow-plan.svg" alt="flecha"></div>
					</div>
				</div>
				<v-layout>
					<v-flex xs6 px-2>
						<p class="mb-2 text-xs-center migrate-plan-label">El plan que tengo</p>
						<div class="migrate-plan-plan mb-3">PLAN DESPLEGUE</div>
						<div class="migrate-plan-group">
							<div>
								<div class="migrate-plan-circle mb-2">
									<img 
										src="/static/img/plan-1.svg" 
										alt="plan desplegue" 
										height="30">
								</div>
								<p>
									<span class="bold">Primer paso</span> 
									para iniciar tu viaje digital:
								</p>
								<div 
									class="layout align-start mb-2" 
									v-for="plan in planOne" 
									:key="plan">
									<img src="/static/img/check.svg" alt="check" class="mr-2">
									<span>{{ plan }}</span>
								</div>
							</div>
						</div>
					</v-flex>
					<v-flex xs6 px-2>
						<p class="mb-2 text-xs-center migrate-plan-label">El plan que puedo tener</p>
						<div class="migrate-plan-plan mb-3">PLAN EMPRENDEDOR</div>
						<div class="migrate-plan-group">
							<div>
								<div class="migrate-plan-circle mb-2">
									<img 
										src="/static/img/plan-2.svg" 
										alt="plan desplegue" 
										height="23">
								</div>
								<p>
									<span class="bold">Segundo paso</span> 
									todo lo del plan anterior más:
								</p>
								<div 
									class="layout align-start mb-2" 
									v-for="plan in planTwo" 
									:key="plan">
									<img src="/static/img/check.svg" alt="check" class="mr-2">
									<span>{{ plan }}</span>
								</div>
							</div>
						</div>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex text-xs-center mt-3>
				<a :href="goToLinkWssp" target="_blank" class="migrate-plan-info">
					Deseo más información
				</a>
			</v-flex>
		</v-layout>
	</div>
</template>
<script>

function goToLinkWssp() {
	const userAgent = navigator.userAgent || navigator.vendor || window.opera;
	const regDeviceOne = /Android|webOS|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i;
	const regDeviceTwo = /iPad|iPhone|iPod/;
	const numberWssp = this.isEcuador ? this.numberEcu : this.numberPer;
	if (regDeviceOne.test(userAgent)) {
		return `https://api.whatsapp.com/send?phone=${this.labelsByCountry.phoneCode}${numberWssp}`;
	} else if (regDeviceTwo.test(userAgent) && !window.MSStream) {
		return `https://wa.me/${this.labelsByCountry.phoneCode}${numberWssp}`;
	}
	return `https://web.whatsapp.com/send?phone=${this.labelsByCountry.phoneCode}${numberWssp}`;
}

function data() {
	return {
		numberEcu: '984000466',
		numberPer: '981290555',
		planOne: [
			'Tienda Online: recibe pedidos por WhatsApp +',
			'Facturación Electrónica ilimitada',
		],
		planTwo: [
			'Dominio Propio y Hosting +',
			'500 Productos en tu catálogo +',
			'Control de stock +',
			'Cupones de descuento +',
			'Módulo de Gestión de tienda física',
		],
	};
}

export default {
	name: 'migrate-plan',
	data,
	computed: {
		goToLinkWssp,
	},
};
</script>
<style lang="scss" scoped>
	.migrate-plan {
		background: color(white);
		padding: 60px 30px;

		&-title {
			color: color(background-sidebar);
			font-size: 22px;
			font-weight: 700;
			text-align: center;
		}

		&-plan {
			border: 2px solid color(primary);
			border-radius: 21px;
			color: color(primary);
			font-weight: 700;
			padding: 7px 0;
			text-align: center;
		}

		&-label {
			color: color(background-sidebar);
			font-size: 13px;
			font-weight: 700;
		}

		&-group {
			border-radius: 12px;
			border: solid 3px color(top-background);
			color: color(color-input);
			font-size: 13px;
			height: 318px;
			padding: 19px 25px;
		}

		&-circle {
			align-items: center;
			background: color(primary);
			border-radius: 50%;
			display: flex;
			height: 58px;
			justify-content: center;
			margin: 0 auto;
			width: 58px;
		}

		&-info {
			border: 2px solid color(success);
			border-radius: 5px;
			display: inline-block;
			font-weight: 700;
			font-size: 18px;
			padding: 12px 20px;
			text-decoration: none;
		}
	}

	.bold {
		font-weight: 700;
	}
</style>