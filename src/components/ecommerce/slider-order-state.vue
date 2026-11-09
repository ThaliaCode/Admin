<template>
  <div>	

		<v-layout column wrap px-3 pt-2 v-if="onlyChangeState">
			<v-flex justify-center pa-5>
				<span class="bold subheading text-xs-center pt-5">
					¿ESTÁ SEGURO DE ACTUALIZAR EL ESTADO DE "PENDIENTE" A "PAGADO"?
				</span>				
			</v-flex>
		</v-layout>
		<v-layout column wrap px-3 pt-2 v-else>
			<v-flex class="bold">Datos de la Transacción:</v-flex>
			<v-flex mt-1>
				<span class="primary--text bold mr-2">Total:</span> {{ objectTransaction.amount }}
			</v-flex>
			<v-flex mt-1>
				<span class="primary--text bold mr-2">Código:</span> {{ objectTransaction.authorizationCode }}
			</v-flex>
			<v-flex mt-1>
				<span class="primary--text bold mr-2">Tipo de Moneda:</span> {{ objectTransaction.currency }}
			</v-flex>
			<v-flex mt-1>
				<span class="primary--text bold mr-2">Número de Compra:</span> {{ objectTransaction.purchaseNumber }}
			</v-flex>
			<v-flex mt-1>
				<span class="primary--text bold mr-2">Transacción Id:</span>
				{{ objectTransaction.transactionId }}
			</v-flex>
			<v-flex class="bold mt-2">Datos de la Operación:</v-flex>
			<v-flex mt-2>
				<v-flex v-for="(item, index) in objectCart" :key="index">
					<span class="primary--text bold mr-2">{{ item.code }}: </span> {{ item.value }}
				</v-flex>
			</v-flex>
		</v-layout>
		<v-layout>
			<section class="modal-filter-footer pa-2">
				<modal-sidebar-button
					success-text="Confirmar"
					:hiddenSaveBtn="!onlyChangeState"
					@cancel-button-clicked="$emit('close-modal')"
					@accept-button-clicked="$emit('change-payment-state')"
				/>
			</section>
		</v-layout>
  </div>
</template>

<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

export default {
	name: 'slider-order-state',
	components: {
		modalSidebarButton,
	},
	created() {
		console.log('crear');
	},
	props: {
		objectCart: {
			default: () => {},
			type: Object,
		},
		objectTransaction: {
			default: () => {},
			type: Object,
		},
	},
	computed: {
		onlyChangeState() {
			// Si no existen los objetos (nunca se mandaron) entonces este componente
			// solo sirve para actualiza el estado
			const areEmpty = Object.keys(this.objectTransaction).length +
				Object.keys(this.objectCart).length === 0;
			return areEmpty;
		},
	},
};
</script>

<style lang="scss" scoped>
.bold {
	font-weight: bold;
}
</style>