<template>
	<v-dialog persistent v-model="open" max-width="750">
		<v-card class="modal-lotes-sales">
			<v-card-title class="modal-items-title">
				Seleccione el periodo contable
			</v-card-title>
			<v-divider></v-divider>
			<v-card-text>
				<div v-if="accountingPeriods.length === 0">
					<p class="text-center">No hay periodos contables</p>
				</div>
				<div v-else class="period-grid">
					<div
						v-for="(period, index) in accountingPeriods"
						@click="$emit('confirm', period)"
						:key="index"
						class="period-item"
					>
						<span>
							{{ period.code }}
						</span>
						<app-tooltip-button
							color="success"
							icon="arrow_forward"
							text="Seleccionar"
							@click-icon="$emit('confirm', period)"
						></app-tooltip-button>
					</div>
				</div>
			</v-card-text>
			<v-card-actions class="modal-items-action py-3 justify-center">
				<v-btn
					color="error"
					class="btn-action white--text"
					@click="$emit('close')"
				>
					Cancelar
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
import simpleModal from '@/components/field-sale/shared/simple-modal';

export default {
	name: 'modal-accounting-period',
	components: {
		simpleModal,
	},
	created() {
		this.loadAccountingPeriods();
	},
	data() {
		return {
			accountingPeriods: [],
		};
	},
	props: {
		open: {
			default: false,
			type: Boolean,
		},
	},
	methods: {
		async loadAccountingPeriods() {
			try {
				const response = await this.$httpSales.get('accounting-period');
				this.accountingPeriods = response.data;
			} catch (error) {
				this.showGenericError(error);
			}
		},
	},
};
</script>

<style lang="scss" scoped>
.period-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr); /* 4 columnas iguales */
	gap: 16px; /* Espacio entre los elementos */
}

.period-item {
	display: flex;
	padding: 0.5rem;
	border: 1px solid #e0e0e0;
	border-radius: 4px;
	justify-content: space-around;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	&:hover {
		cursor: pointer;
	}
}
</style>
