<template>
	<v-layout wrap class="section-plan">
		<v-flex xs12 pa-2 class="section-plan-header" v-if="isPlanSelect(plan)">
			<v-layout wrap justify-center>
				<v-flex xs3 mr-3>
					<div class="layout justify-center">
						<img src="/static/img/calendar-plan.svg" alt="calendario" height="16" class="mr-2">
						<p class="mb-0"><span class="bold">Empieza tu plan:</span> {{ planSelect.startDate }}</p>
					</div>
				</v-flex>
				<v-flex xs3 mr-3>
					<div class="layout justify-center">
						<img src="/static/img/calendar-plan.svg" alt="calendario" height="16" class="mr-2">
						<p class="mb-0"><span class="bold">Termina tu plan:</span> {{ planSelect.endDate }}</p>
					</div>
				</v-flex>
				<v-flex xs2 mr-3>
					<div class="layout justify-center">
						<img src="/static/img/pay-day-plan.svg" alt="Pago" height="16" class="mr-2">
						<p class="mb-0"><span class="bold">Último pago:</span> ---</p>
					</div>
				</v-flex>
				<v-flex xs2>
					<div class="layout justify-center">
						<img src="/static/img/bill-plan.svg" alt="Boleta" height="16" class="mr-2">
						<p class="mb-0"><span class="bol">Factura</span>: ---</p>
					</div>
				</v-flex>
			</v-layout>
		</v-flex>
		<v-flex xs12>
			<v-layout pa-2 class="content-items">
				<v-flex xs3 class="content-letter">
					<div 
						class="section-plan-name"
						:class="{'not-plan' : !isPlanSelect(plan)}">
						{{ isPlanSelect(plan) ? 'Plan que tengo' : 'Plan que puedo tener' }}
					</div>
					<div class="content-img-plan">
						<div 
							class="wrapper-img"
							:class="{'img-plan-select': isPlanSelect(plan)}">
							<img :src="plan.logo" alt="plan" height="30">
						</div>
						<p class="mb-0 text-name">{{ plan.name }}</p>
						<p class="mb-0" v-if="getPrice(plan)">
							<span>{{countryCurrencySymbol}}</span>
							<span class="text-price">{{ getPrice(plan)}}</span>
						</p>
						<p v-if="plan.pdfLink">
							<a :href="plan.pdfLink" target="_blank" class="link-plan">Ver Detalle</a>
						</p>
					</div>
				</v-flex>
				<v-flex xs9>
					<v-layout wrap>
						<v-flex v-for="item in plan.features" :key="item" xs6 mb-1 class="layout align-start">
							<img src="/static/img/check.svg" alt="check" class="mr-2">
							<span 
								class="item-text"
								:class="{'primary--text': item === 'ALL_ABOVE'}">
								{{ item === 'ALL_ABOVE' ? 'Todo lo anterior' : item}}
							</span>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
		</v-flex>
		<v-flex xs12 class="conten-btn-wsp" v-if="!isPlanSelect(plan)">
			<a :href="goToLinkWssp" class="btn-wsp" target="_blank">
				<div class="layout">
					<img src="/static/icon/icon-whatsapp.svg" alt="wsp" class="mr-2">
					<span>Deseo más información</span>
				</div>
			</a>
		</v-flex>
	</v-layout>
</template>
<script>

function getPrice() {
	if (this.plan.price) {
		return this.isPeru ? this.plan.price.PER : this.plan.price.ECU;
	}
	return 0;
}

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

function isPlanSelect(plan) {
	return plan.code === this.planSelect.code;
}

function planSelect() {
	if (this.$userInfo.additionalInformation) {
		if (this.$userInfo.additionalInformation.plan) {
			return { ...this.$userInfo.additionalInformation.plan };
		}
		return { ...this.select };
	}
	return { ...this.select };
}

function data() {
	return {
		numberEcu: '984000466',
		numberPer: '981290555',
		select: {
			code: 'gratuito',
			startDate: '10/10/2020',
			endDate: '10/11/2020',
		},
	};
}
export default {
	name: 'section-plan',
	data,
	computed: {
		goToLinkWssp,
		planSelect,
	},
	methods: {
		getPrice,
		isPlanSelect,
	},
	props: {
		plan: {
			type: Object,
			default: () => {},
		},
	},
};

</script>
<style lang="scss" scoped>
	.section-plan {
		background-color: color(white);
		box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
		color: color(color-input);
		font-family: map-get($fonts, open-regular);
		max-width: 1042px;
		margin: 0 auto;

		&-header {
			background-color: rgba(195, 231, 232, 0.28);
			
			font-size: 12px;
		}

		.bold {
			font-weight: 600;
		}

		&-name {
			background-color: color(success);
			color: color(primary);
			font-size: 13px;
			font-weight: 600;
			text-transform: uppercase;
			transform: rotate(-90deg);
			width: 202px;
			position: absolute;
			top: 75px;
			left: -74px;
			height: 37px;
			border-radius: 4px;
			width: 188px;
			padding: 9px;
			text-align: center;
		}

		.content-items {
			min-height: 202px;
		}

		.content-letter {
			position: relative;
		}

		.content-img-plan {
			align-items: center;
			display: flex;
			color: color(primary);
			justify-content: center;
			flex-direction: column;
			font-size: 20px;
			font-weight: 600;
			margin-left: 40px;
			height: 100%;
		}

		.text-name {
			margin-top: 8px;
			line-height: 24px;
			text-align: center;
			text-transform: uppercase;
			width: 120px;
		}

		.btn-wsp {
			background-color: color(green-wsp);
			border-radius: 25px;
			box-shadow: 0 2px 6px 0 rgba(158, 158, 158, 0.5);
			color: color(white);
			display: inline-block;
			font-size: 12px;
			font-weight: 600;
			padding: 9px 20px;
			text-decoration: none;
			width: 152px;
		}

		.conten-btn-wsp {
			background-color: rgba(195, 231, 232, 0.28);
			padding: 10px;
			text-align: center;
		}

		.item-text {
			font-size: 13px;
		}

		.wrapper-img {
			align-items: center;
			background-color: color(brown-grey);
			border-radius: 50%;
			display: flex;
			height: 58px;
			justify-content: center;
			width: 58px;
		}

		.text-price {
			color: color(primary);
			font-size: 32px;
		}
	}

	.not-plan {
		background-color: color(brown-grey);
		color: color(white);
	}

	.img-plan-select {
		background-color: color(primary) !important;
	}

	.link-plan {
		font-size: 13px;
	}
</style>