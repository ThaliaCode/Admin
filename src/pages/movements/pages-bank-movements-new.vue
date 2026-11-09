<template>
	<div>
		<action-sidebar
			title="Nuevo Movimiento de Banco"
			:value="true"
			:width="552"
			:code-action="action.code"
			:help-actions="actionsToHelp"
			@close-modal="close"
		>
			<bank-movements-form
				v-if="action.code !== 'HELP'"
				:loading="loading"
				@close="close"
				@save="save"
			/>
		</action-sidebar>
	</div>
</template>

<script>
import actionSidebar from '@/components/shared/action-sidebar';
import bankMovementsForm from '@/components/movements/bank-movements-form';

function close() {
	this.goTo('bank-movements');
}

async function save(model, code) {
	const newModel = { ...model };
	newModel.amount =
		code === 'CH' || code === 'ND' || model.typeMovement === 2
			? Number(model.amount) * -1
			: Number(model.amount);
	newModel.paymentAmount =
		code === 'CH' || code === 'ND' || model.typeMovement === 2
			? Number(model.amount) * -1
			: Number(model.amount);
	newModel.paymentDate = model.paymentDate;
	this.loading = true;
	try {
		await this.$httpSales.post('transaction-bank', newModel);
		this.showNotification('El movimiento ha sido creado correctamente.');
		this.$emit('reload-data');
		this.close();
	} catch (err) {
		this.loading = false;
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'DOCUMENT_NUMBER_EXISTS') {
				this.showNotification(
					'El número de documento ingresado ya ha sido registrado en otro movimiento.',
					'error'
				);
			} else if (err.data.message === 'TRANSACTION_INVALID') {
				this.showNotification(
					'Para poder crear, debe ingresar el importe con valor positivo.',
					'error'
				);
			}
		}
	} finally {
		this.loading = false;
	}
}

function data() {
	return {
		action: {
			active: false,
			open: false,
			title: 'Nuevo Movimiento de Banco',
			width: 552,
		},
		loading: false,
	};
}

export default {
	name: 'bank-movements-new',
	components: {
		actionSidebar,
		bankMovementsForm,
	},
	data,
	methods: {
		close,
		save,
	},
};
</script>
