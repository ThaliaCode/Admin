<template>
  <div class="component-support"
	:class="{
		'top-btn' : $route.name === 'int-configuration',
		'none-component' : ($route.name === 'edit-route' || $route.name === 'new-route' || $route.name === 'page-zone-assignment'),
		'left-60': min && !isMovil
	}"
>
		<a :href="goToLinkWssp" target="_blank" class="btn-support">
			<img src="/static/icon/icon-whatsapp.svg" alt="">
			<span class="ml-18" v-if="!isMovil">Soporte</span>
		</a>
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
	name: 'component-support-whatsapp',
	data,
	computed: {
		goToLinkWssp,
	},
	props: {
		min: {
			default: false,
			type: Boolean,
		},
	},
};
</script>

<style lang="scss" scoped>
.btn-support {
	background-color: #64b161;
	border-radius: 25.5px !important;
	box-shadow: 0 2px 6px 0 rgba(158, 158, 158, 0.5) !important;
	color: white !important;
	font-family: map-get($fonts, open-bold) !important;
	font-size: 14px !important;
	padding: 18px 22px 18px 15px;
	text-decoration: none !important;

	@media (max-width: 760px) {
    display: inline-block;
		padding: 9px;
  }
}

.component-support {
	bottom: 29px;
	position: fixed;
	left: 230px;
	z-index: 10;

	@media (max-width: 760px) {
    left: auto;
		right: 10px;
		z-index: 2;
  }
}

.ml-18 {
	margin-left: 18px;
}

.top-btn {
	bottom: 95px !important;
}

.none-component {
	display: none;
}

.left-60 {
	left: 60px !important;
}
</style>