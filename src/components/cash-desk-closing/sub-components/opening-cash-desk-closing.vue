<template>
	<v-container mt-3>
		<v-layout row wrap>
			<v-flex xs12 mb-3>
				<v-text-field
					hide-details
					label="Saldo Inicial"
					type="number"
					v-model.number="amount"
					class="filter-select shadow-inset"
				></v-text-field>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="disabled"
				@cancel-button-clicked="closeModal"
				@accept-button-clicked="accept"
			/>
		</section>
	</v-container>
</template>
<script>
import modalSidebarButton from './../../shared/utils/modal-sidebar-button';

function created() {
	this.currency = this.$userInfo.company.currency;
}

function clearForm() {
	this.amount = 0;
	this.currency = '';
}

async function accept() {
	const body = { startAmount: this.amount };
	this.disabled = true;
	try {
		await this.$httpSales.post(`cash-desk-opening/${this.currency}`, body);
		this.showNotification('Apertura realizada con éxito');
		this.closeModal();
	} catch (err) {
		if (err.status === 400) {
			if (err.data.message === 'CASH_DESK_CLOSING_EXIST') {
				this.showNotification('La caja ya ha sido abierta.', 'error');
			}
		} else if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.disabled = false;
	}
}

function closeModal() {
	this.clearForm();
	this.$emit('close-modal');
}

function data() {
	return {
		amount: 0,
		currency: '',
		disabled: false,
	};
}

export default {
	name: 'opening-cash-desk-closing',
	components: {
		modalSidebarButton,
	},
	created,
	data,
	methods: {
		accept,
		clearForm,
		closeModal,
	},
};
</script>

