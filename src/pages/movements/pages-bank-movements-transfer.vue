<template>
	<div>
		<action-sidebar
			title="Transferencia de Banco a Banco"
			:value="true"
			:width="552"
			@close-modal="goTo('bank-movements')"
		>
			<bank-movements-transfer-form
				:loading="loading"
				@close="goTo('bank-movements')"
				@save="save"
			/>
		</action-sidebar>
	</div>
</template>

<script>
	import actionSidebar from '@/components/shared/action-sidebar';
	import bankMovementsTransferForm from '@/components/movements/bank-movements-transfer-form';

	async function save(model) {
		const newModel = { ...model };
		newModel.amount = -Number(model.amount);
		newModel.paymentAmount = -Number(model.amount);
		this.loading = true;
		try {
			await this.$httpSales.post('transaction-bank', newModel);
			this.showNotification('La transferencia se ha realizado correctamente.');
			this.goTo('bank-movements');
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			} else if (err.status === 400) {
				if (err.data.message === 'DOCUMENT_NUMBER_EXISTS') {
					this.showNotification('El número de documento ingresado ya ha sido registrado en otra transferencia.',
						'error');
				}
			}
		} finally {
			this.loading = false;
		}
	}

	function data() {
		return {
			loading: false,
		};
	}

	export default {
		name: 'bank-movements-transfer',
		components: {
			actionSidebar,
			bankMovementsTransferForm,
		},
		data,
		methods: {
			save,
		},
	};
</script>
