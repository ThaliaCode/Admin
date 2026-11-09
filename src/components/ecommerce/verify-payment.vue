<template>
  <div>
		<app-table
			name="verify-payment"
			:columns="columns"
			:rows="rows"
			class="is-not-selectable mt-4">
			<template slot="rows" slot-scope="props">
				<td
					class="is-not-selectable"
					v-show="showRow(columns, 1)">{{ getCustomerName(props.row) }}</td>
				<td v-show="showRow(columns, 2)">{{ props.row.total | round }}</td>
				<td v-show="showRow(columns, 3)">{{ getOrderState(props.row) }}</td>
				<td v-show="showRow(columns, 4)">{{ props.row.paymentStateName }}</td>
				<td v-show="showRow(columns, 5)">{{ getWarehousePickUp(props.row) }}</td>
				<td v-show="showRow(columns, 6)">
					<v-tooltip top>
						<v-btn
							slot="activator"
							icon
							@click="deleteRow(props.row.id)"
						>
							<v-icon color="red">delete</v-icon>
						</v-btn>
						<span>Eliminar</span>
					</v-tooltip>
				</td>
			</template>
		</app-table>
		<section class="fast-register-footer">
			<modal-sidebar-button
				:is-loading="!rows.length"
				success-text="Aprobar pedido"
				big
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="sendData">
			</modal-sidebar-button>
		</section>
	</div>
</template>
<script>
import appTable from '@/components/shared/table/app-table';
import lib from '@/shared/lib';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

const { getDeeper } = lib;

function getCustomerName({ customer }) {
	return getDeeper('typePerson', 'fullName')(customer);
}

function getOrderState({ orderState }) {
	return getDeeper('name')(orderState);
}

function getWarehousePickUp(row) {
	return getDeeper('warehouseName')(row);
}

function deleteRow(id) {
	const index = this.rows.findIndex(r => r.id === id);
	if (id > -1) {
		this.rows.splice(index, 1);
	}
}

async function sendData() {
	const body = {
		ordersId: this.rows.map(r => r.id),
	};
	try {
		await this.$httpSales.patch('orders/approval', body);
		this.showNotification('La acción se realizó correctamente');
		this.$emit('update');
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'ORDER_NOT_FOUND') {
				this.showGenericError('El pedido debe encontrarse en estado CONFIRMADO para poder aprobar el pago.');
			}
		}
	}
}

function data() {
	return {
		columns: [
			{ id: 1, name: 'Cliente', visible: true, checked: true },
			{ id: 2, name: 'Monto', visible: true, checked: true },
			{ id: 3, name: 'E. del Pedido', visible: true, checked: true },
			{ id: 4, name: 'E. de Pago', visible: true, checked: true },
			{ id: 5, name: 'T. Despacho', visible: true, checked: true },
			{ id: 6, name: 'Acciones', visible: true, checked: true },
		],
	};
}
export default {
	name: 'verify-payment',
	components: {
		appTable,
		modalSidebarButton,
	},
	methods: {
		deleteRow,
		getCustomerName,
		getOrderState,
		getWarehousePickUp,
		sendData,
	},
	data,
	props: {
		rows: {
			type: Array,
			default: () => [],
		},
	},
};
</script>

