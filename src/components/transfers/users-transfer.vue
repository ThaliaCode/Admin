<template>
	<div>
		<v-layout wrap px-4 py-3 v-if="showAlert">
			<v-flex xs12 text-xs-center>
				No se encontró información de los usuarios que
				realizaron movimientos en esta transferencia
			</v-flex>
		</v-layout>
		<v-layout wrap px-4 py-3 v-else>
			<v-flex xs12 v-if="dataExist('createdUserInfo')">
				<label class="slide-title px-1">
					Transferencia creada por:
				</label>
				<p class="body-2 px-1 mb-0 mt-1">
					{{ createdUserInfo.name }} {{ createdUserInfo.lastname }}
				</p>
				<v-divider class="my-2"></v-divider>
			</v-flex>
			<v-flex xs12 v-if="dataExist('clearanceUserInfo')">
				<label class="slide-title px-1">
					Transferencia iniciada por:
				</label>
				<p class="body-2 px-1 mb-0 mt-1">
					{{ clearanceUserInfo.name }} {{ clearanceUserInfo.lastname }}
				</p>
				<v-divider class="my-2"></v-divider>
			</v-flex>
			<v-flex xs12 v-if="dataExist('deliveryUserInfo')">
				<label class="slide-title px-1">
					Transferencia finalizada por:
				</label>
				<p class="body-2 px-1 mb-0 mt-1">
					{{ deliveryUserInfo.name }} {{ deliveryUserInfo.lastname }}
				</p>
				<v-divider class="my-2"></v-divider>
			</v-flex>
			<v-flex xs12 v-if="dataExist('cancelUserInfo')">
				<label class="slide-title px-1">
					Transferencia anulada por:
				</label>
				<p class="body-2 px-1 mb-0 mt-1">
					{{ cancelUserInfo.name }} {{ cancelUserInfo.lastname }}
				</p>
				<v-divider class="my-2"></v-divider>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				@cancel-button-clicked="$emit('close')"
				@accept-button-clicked="$emit('close')"
			/>
		</section>
	</div>
</template>

<script>
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

	function dataExist(type) {
		return this[type] && this[type].name;
	}

	function showAlert() {
		return !this.cancelUserInfo && !this.clearanceUserInfo && !this.createdUserInfo &&
			!this.deliveryUserInfo;
	}

	export default {
		name: 'users-transfer',
		components: {
			modalSidebarButton,
		},
		computed: {
			showAlert,
		},
		methods: {
			dataExist,
		},
		props: {
			cancelUserInfo: {
				default: () => {},
				type: Object,
			},
			clearanceUserInfo: {
				default: () => {},
				type: Object,
			},
			createdUserInfo: {
				default: () => {},
				type: Object,
			},
			deliveryUserInfo: {
				default: () => {},
				type: Object,
			},
		},
	};
</script>

<style lang="scss" scoped>
	div {
		color: map-get($colors, generalText);
		font-family: map-get($fonts, open-semibold);
		font-size: map-get($sizes, medium);
		letter-spacing: 0;
	}

	.slide-title {
		color: map-get($colors, blue-card);
		font-family: map-get($fonts, lato-bold);
		font-size: map-get($sizes, small);
		letter-spacing: 0;
	}
</style>
