<template>
	<div class="assign-delivery">
		<v-layout px-4 mt-4 wrap row>
			<v-flex xs12>
				<v-radio-group
					colums
					class="sale-radio"
					v-model="distributorId"
				>
					<v-radio
						v-for="t in listDistributors"
						class="mb-3"
						:key="t.id"
						:label="`${t.name} ${t.lastname}`"
						:value="t.id"
						color="success"
					>
						<template slot="label">
							<div>
								<span>{{ t.name }} {{ t.lastname }}</span>
								<v-chip color="info" text-color="white" v-if="t.orderId">Asignado</v-chip>
								<v-chip color="primary" text-color="white" v-if="t.orderId">Nº de Pedido: {{ t.orderId }}</v-chip>
							</div>
						</template>
					</v-radio>
				</v-radio-group>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="!distributorId"
				@cancel-button-clicked="$emit('close')"
				@accept-button-clicked="assignDelivery"
			/>
		</section>
	</div>
</template>
<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

async function assignDelivery() {
	const body = { flagNotification: true, flagChangeStatus: true };
	try {
		await this.$httpSales.patch(`orders/${this.order.id}/assign-delivery/${this.distributorId}`, body);
		this.$emit('update-assign-delivery');
	} catch (error) {
		if (error.status === 500) {
			this.showGenericError();
		} else if (error.status === 400) {
			if (error.data.message === 'ALREADY_ASSIGNED_TO_ORDER') {
				this.showGenericError('El repartidor ya tiene asignado un pedido en curso.');
			} else {
				this.showGenericError(error.data.messageError);
			}
		}
	}
}

function created() {
	this.distributorId = this.order.deliveryId;
	this.listDistributors = this.distributors.map((d) => {
		const newD = { ...d };
		newD.disabled = d.orders.length > 0;
		newD.orderId = d.orders.length > 0 ? d.orders[0].number : null;
		return newD;
	});
}

function data() {
	return {
		distributorId: null,
		listDistributors: [],
	};
}

export default {
	name: 'assign-delivery',
	created,
	components: {
		modalSidebarButton,
	},
	methods: {
		assignDelivery,
	},
	data,
	props: {
		distributors: {
			type: Array,
			default: () => [],
		},
		order: {
			type: Object,
			default: () => {},
		},
	},
};
</script>
