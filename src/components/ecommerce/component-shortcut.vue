<template>
	<div v-if="showUpsellings">
		<div class="wrapper-shortcut">
			<div class="component-shortcut">
				<button
				v-for="(item, index) in showUpsellings"
				:key="index"
				type="button"
				class="btn-shortcut"
				@click="openShowDialog(item)">
					<v-layout row wrap align-center>
						<v-flex>
							<img
								v-if="item.icon"
								:src="item.icon"
								class="img-shortcut">
						</v-flex>
						<v-flex>
							<p class="item-shortcut">{{ item.title }}</p>
						</v-flex>
					</v-layout>
				</button>
			</div>
			<button class="ml-2" @click="$emit('close-upselling')">
				<v-icon color="primary">clear</v-icon>
			</button>
		</div>
		<v-dialog
			v-model="dialogElectronicBilling"
			max-width="381"
			persistent
			class="dialog"
		>
			<v-card>
				<v-flex text-xs-right pt-3 pr-3>
					<button type="button"
					@click="closeDialog">
						<v-icon color="greenSave">clear</v-icon>
					</button>
				</v-flex>
				<v-flex text-xs-center>
					<img :src="dialogImage">
				</v-flex>
				<v-card-title class="title-dialog">
					<v-layout d-flex justify-center>
						<p>
							{{ dialogTitle }}
						</p>
					</v-layout>
				</v-card-title>
				<v-flex text-xs-center class="description-dialog">
						{{ dialogDescription }}
 				</v-flex>
				<v-card-actions>
					<v-layout d-flex column align-center pb-5>
						<v-flex text-xs-center mt-4>
							<a
							class="btn-plans"
							href="https://drive.google.com/file/d/1N2SgnIsaPDGtSO3dSq0WWfUPyh_gGGAs/view"
							target="_blank">
								Conoce nuestros planes
							</a>
						</v-flex>
							<a
							class="btn-wssp"
							:href="goToLinkWssp"
							target="_blank">
								<img src="/static/img/whatsapp-white.svg" alt="icon-wssp" height="33">
								<p class="text-wssp">Cómunicate con uno de nuestros asesores</p>
							</a>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
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

function openShowDialog(item) {
	this.dialogElectronicBilling = true;
	this.dialogImage = item.icon;
	this.dialogTitle = item.title;
	this.dialogDescription = item.description;
}

function closeDialog() {
	this.dialogElectronicBilling = false;
}

function listUpsellings() {
	if (this.$userInfo.company) {
		if (this.$userInfo.company.plans) {
			if (Object.keys(this.$userInfo.company.plans).length) {
				return this.$userInfo.company.plans.upsellings;
			}
			return null;
		}
		return null;
	}
	return null;
}

function showUpsellings() {
	if (this.$userInfo.additionalInformation) {
		if (this.$userInfo.additionalInformation.plan) {
			if (this.$userInfo.additionalInformation.plan.upselling) {
				const list = this.$userInfo.additionalInformation.plan;
				if (this.listUpsellings) {
					return Object.keys(this.listUpsellings).reduce((acum, l) => {
						const newAcum = [...acum];
						const index = list.upselling.findIndex(p => p === l);
						if (index > -1) {
							newAcum.push({ ...this.listUpsellings[l] });
						}
						return newAcum;
					}, []);
				}
			}
			return null;
		}
		return null;
	}
	return null;
}

function data() {
	return {
		flagPlans: null,
		dialogElectronicBilling: false,
		dialogTitle: '',
		dialogImage: '',
		dialogDescription: '',
		numberEcu: '984000466',
		numberPer: '981290555',
		prueba: {
			code: 'gratuito',
			startDate: '10/10/2020',
			endDate: '10/11/2020',
			uppseling: ['billing', 'more-products', 'domain', 'store-v2'],
		},
	};
}

export default {
	name: 'component-shortcut',
	data,
	computed: {
		goToLinkWssp,
		listUpsellings,
		showUpsellings,
	},
	methods: {
		closeDialog,
		openShowDialog,
	},
};
</script>

<style lang="scss" scoped>
.btn-shortcut {
	background-color: rgba(195, 231, 232, 0.41);
	border: 1px solid map-get($colors, item-select);
	border-radius: 5px;
	box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.13);
	color: map-get($colors, selector-color);
	margin: 0 0 10px 10px;
	min-height: 70px;
	min-width: 209px;
	padding: 13px 23px;

	&:hover {
		background-color: map-get($colors, selector-color);
		box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.13);
		color: map-get($colors, white);

		.img-shortcut {
			filter: brightness(2%) invert(3);
		}
	}

	@media (max-width: 760px) {
		min-width: 150px;
    padding: 4px;
  }
}

.item-shortcut {
	font-family: map-get($fonts, open-semibold);
	font-size: map-get($sizes, small11);
	margin: 0 0 0 31px !important;
	max-width: 93px;
	text-align: left;
	text-transform: uppercase;

	@media (max-width: 760px) {
		margin: 0 0 0 10px !important;
  }
}

.component-shortcut {
	margin: 24px auto 0 auto;

	@media (max-width: 760px) {
    display: flex;
		flex-wrap: wrap;
		justify-content: center;
		width: 90%;
  }
}

.img-shortcut {
	height: 37px;
}

.title-dialog {
	color: map-get($colors, selector-color);
	font-family: map-get($fonts, open-bold);
	font-size: map-get($sizes, medium);
	text-align: center;
}

.dialog {
	border-radius: 10px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.09);
}

.description-dialog {
	color: map-get($colors, paginationText);
	font-family: map-get($fonts, open-regular);
	font-size: map-get($sizes, 	small);
	padding: 0 33px;
}

.bold {
	font-family: map-get($fonts, open-bold);
}

.btn-plans {
	background-color: map-get($colors, selector-color);
	border-radius: 10px;
	box-shadow: 0 2px 6px 0 rgba(158, 158, 158, 0.5);
	color: map-get($colors, white);
	font-family: map-get($fonts, open-semibold);
	font-size: 14px;
	padding: 16px 47px;
	text-decoration: none;
}

.btn-wssp {
	background-color: #64b161;
	border-radius: 10px;
  	box-shadow: 0 2px 6px 0 rgba(158, 158, 158, 0.5);
	color: map-get($colors, white);
	display: flex;
	font-family: map-get($fonts, open-semibold);
	font-size: map-get($sizes, medium);
	margin-top: 25px;
	padding: 10px 29px 10px 22px;
	text-decoration: none;
}

.text-wssp {
	margin: 0 0 0 24px;
	width: 149px;
}

.wrapper-shortcut {
	display: flex;
}
</style>