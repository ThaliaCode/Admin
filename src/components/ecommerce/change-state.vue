<template>
	<v-container>
		<app-select
			label="Estados:"
			place-holder="Seleccione un estado"
			:item="id"
			:items="orderStatesChange"
			item-text="name"
			item-value="id"
			@input="setStateId"
		/>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="!id"
				@cancel-button-clicked="close"
				@accept-button-clicked="stateChanges"
			/>
		</section>
	</v-container>
</template>
<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import appSelect from '@/components/shared/app-select';
import typePickUp from '@/shared/type-pick-up';

function created() {
	this.orderStatesChange = this.orderStates.reduce((acum, order) => {
		const newAcum = [...acum];
		const requestedValidation = order.code === 'CONFIRMED' || order.code === 'CANCELED';
		const confirmedValidation = order.code === 'READY_TO_DELIVER' || order.code === 'CANCELED';
		const givenValidation = order.code === 'GIVEN';
		if (this.orderState.code === 'REQUESTED' && requestedValidation) {
			newAcum.push(order);
		} else if (this.orderState.code === 'CONFIRMED' && confirmedValidation) {
			newAcum.push(order);
		} else if (this.orderState.code === 'READY_TO_DELIVER') {
			if (this.flagPickUpOrder === typePickUp.PickUpStore && givenValidation) {
				newAcum.push(order);
			} else if (this.flagPickUpOrder === typePickUp.HomeDelivery && order.code === 'ASSIGNED') {
				newAcum.push(order);
			}
		} else if (this.orderState.code === 'IN_ROAD' && givenValidation) {
			newAcum.push(order);
		} else if (this.orderState.code === 'ASSIGNED' && order.code === 'IN_ROAD') {
			newAcum.push(order);
		}
		return newAcum;
	}, []);
	const orderState = this.orderStatesChange.find(os => os.id === this.stateId);
	this.id = orderState ? orderState.id : 0;
}

function setStateId({ value }) {
	const { id } = value;
	this.id = id;
}

function close() {
	this.$emit('close');
}

async function stateChanges() {
	const url = `orders/${this.orderId}/update-state`;
	const body = { orderStateId: this.id };
	try {
		await this.$httpSales.patch(url, body);
		this.showNotification('Se actualizó el pedido con éxito');
		this.close();
		this.$emit('change-state');
	} catch (error) {
		if (error.status === 500) {
			this.showGenericError();
		} else if (error.status === 400) {
			if (error.data.message === 'ORDER_NOT_APPROVED_YET') {
				this.showGenericError('El pedido debe estar aprobado para poder cambiar el estado.');
			} else if (error.data.message === 'CANCEL_UPDATE_IS_NOT_ALLOWED') {
				this.showGenericError('El pedido no puede ser anulado.');
			}
		}
	}
}

function data() {
	return {
		id: 0,
		orderStatesChange: [],
	};
}

export default {
	name: 'change-state',
	components: {
		appSelect,
		modalSidebarButton,
	},
	created,
	data,
	methods: {
		close,
		setStateId,
		stateChanges,
	},
	props: {
		stateId: {
			default: 0,
			type: Number,
		},
		orderId: {
			default: 0,
			type: [Number, String],
		},
		orderStates: {
			default: () => [],
			type: Array,
		},
		flagPickUpOrder: [Number, String],
		orderState: {
			default: () => {},
			type: Object,
		},
	},
};
</script>

