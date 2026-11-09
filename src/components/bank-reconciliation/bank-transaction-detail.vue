<template>
	<div>
		<v-layout wrap pt-4 px-3>
			<v-flex xs12>
				<bank-title-block title="Detalle" />
			</v-flex>
			<v-flex xs12 class="white--text heading-text">
				<v-layout
					wrap
					pa-3
					align-center
					primary
					lighten-2
				>
					<v-flex xs7 text-xs-left>
						{{ detail.documentNumber }}
					</v-flex>
					<v-flex xs5 text-xs-right>
						{{ currency }}{{ detail.amount | round }}
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<v-layout class="body-text" wrap white py-5 px-3 mx-3>
			<v-flex xs12 pb-2>
				<span class="label-detail">Fecha:</span>
				{{ detail.paymentDate | exactDate('DD/MM/YYYY') }}
			</v-flex>
			<v-flex xs12 pb-2 v-if="detail.moduleOrigin">
				<span class="label-detail">Origen:</span>
				{{ detail.moduleOrigin.name }}
			</v-flex>
			<v-flex xs12 pb-2 v-if="detail.typeTransactionBank">
				<span class="label-detail">Tipo:</span>
				{{ detail.typeTransactionBank.name }}
			</v-flex>
			<v-flex xs12 pb-2>
				<span class="label-detail">Doc. Origen:</span>
				{{ detail.documentNumberOrigin }}
			</v-flex>
			<v-flex xs12 pb-2>
				<span class="label-detail">Importe:</span>
				{{ currency }}{{ detail.amount | round }}
			</v-flex>
			<v-flex xs12 pb-2 v-if="detail.additionalInformation">
				<span class="label-detail">Beneficiario:</span>
				{{ detail.additionalInformation.beneficiary }}
			</v-flex>
			<v-flex xs12 pb-2>
				<span class="label-detail">Concepto:</span>
				{{ detail.concept }}
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				hidden
				success-color="error"
				success-text="Cerrar"
				@accept-button-clicked="$emit('close-detail')"
			/>
		</section>
	</div>
</template>

<script>
	import bankTitleBlock from '@/components/bank-reconciliation/bank-title-block';
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

	export default {
		name: 'bank-transaction-detail',
		components: {
			bankTitleBlock,
			modalSidebarButton,
		},
		props: {
			currency: String,
			detail: {
				default: () => {},
				type: Object,
			},
		},
	};
</script>

<style lang="scss" scoped>
	.heading-text {
		font-family: font(open-bold);
		font-size: size(medium20);
	}

	.body-text {
		color: color(paginationText);
		font-family: font(open-regular);
		font-size: size(small13);
	}

	.label-detail {
		font-family: font(open-semibold);
	}
</style>
