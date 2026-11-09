<template>
	<div class="show-plan">
		<img 
			:src="plan[value]" 
			:alt="plan.name"
			class="image-plan"
		>
		<div class="content-link">
			<a :href="goToLinkWssp" class="btn-wsp" target="_blank">
				<img src="/static/icon/icon-whatsapp.svg" alt="whatsapp" class="mr-2">
				<span class="text-wsp">Comunicate con nosotros</span>
			</a>
		</div>
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
	};
}

export default {
	name: 'show-plan',
	data,
	computed: {
		goToLinkWssp,
	},
	props: {
		plan: {
			type: Object,
			default: () => {},
		},
		value: {
			type: String,
			default: 'urlImage',
		},
	},
};
</script>
<style lang="scss" scoped>
	.show-plan {
		background-color: color(white);
		position: relative;
	}

	.image-plan {
		max-width: 100%;
	}

	.btn-wsp {
		align-items: center;
		background-color: color(green-wsp);
		box-shadow: 0 2px 6px 0 rgba(158, 158, 158, 0.5) !important;
		border-radius: 36px;
		color: color(white);
		display: inline-flex;
		height: 59px;
		padding: 10px;
		line-height: 16px;
		justify-content: center;
		text-decoration: none;
		width: 175px;
	}

	.text-wsp {
		text-align: center;
	}

	.content-link {
		bottom: 40px;
		position: absolute;
		text-align: center;
		width: 100%;
	}
</style>