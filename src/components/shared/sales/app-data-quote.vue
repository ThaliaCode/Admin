<template>
	<div class="pt-2 px-3">
		<v-flex mb-2 class="title-modal">Datos de Entrega:</v-flex>
		<v-layout column wrap>
			<v-flex
				mt-2
				class="title-form"
				v-for="(item, index) in dataForm"
				:key="index"
			>
				{{ item.label }}:
				<span v-if="item.order === 5">{{ item.valueName || '' }}</span>
				<span v-else>{{
					item.type === 'text' ? item.value : item.value.name
				}}</span>
			</v-flex>
		</v-layout>
		<v-flex mb-2 mt-2 class="title-modal">Datos de Pago:</v-flex>
		<v-layout column wrap>
			<v-flex
				mt-2
				class="title-form"
				v-for="(item, index) in dataPayment"
				:key="index"
				>{{ item.label }}:
				<span>{{ item.type === 'text' ? item.value : item.value.name }}</span>
			</v-flex>
		</v-layout>
		<v-layout>
			<v-flex mt-2 class="title-form">
				Imagen Voucher:
				<a :href="urlVoucher" target="_blank">
					<span>{{ urlVoucher }}</span>
				</a>
			</v-flex>
		</v-layout>
		<v-flex mb-2 mt-2 class="title-modal">Datos de Facturación:</v-flex>
		<v-layout column wrap>
			<v-flex
				mt-2
				class="title-form"
				v-for="(item, index) in dataFac"
				:key="index"
			>
				{{ item.label }}:
				<span>{{ item.type === 'text' ? item.value : item.value.name }}</span>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				hidden-save-btn
				cancel-text="Cerrar"
				@cancel-button-clicked="$emit('close-modal')"
			/>
		</section>
	</div>
</template>

<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

export default {
	name: 'app-data-quote',
	components: {
		modalSidebarButton,
	},
	props: {
		dataForm: {
			type: Object,
			default: () => {},
		},
		dataPayment: {
			type: Object,
			default: () => {},
		},
		dataFac: {
			type: Object,
			default: () => {},
		},
		urlVoucher: {
			type: String,
			default: '',
		},
	},
};
</script>

<style lang="scss" scoped>
.title-modal {
	color: color(primary) !important;
	font-size: 17px !important;
	font-weight: bold;
}
</style>
