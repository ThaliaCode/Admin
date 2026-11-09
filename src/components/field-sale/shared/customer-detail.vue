<template>
	<v-layout align-center px-2 py-3>
		<v-flex v-if="customer.urlImage">
			<img :src="customer.urlImage" alt="" height="118" width="65" />
		</v-flex>
		<v-flex pl-3>
			<v-layout wrap align-start>
				<v-flex xs12 sm6 pr-2 class="border-right">
					<p class="modal-text">
						<span>{{ customer.documentName }}:</span>
						{{ customer.documentNumber }}
					</p>
					<p class="modal-text">
						<span>Celular:</span>
						{{ (customer.customer && customer.customer.phone) || 'S/N' }}
					</p>
					<p class="modal-text">
						<span>Correo:</span>
						{{ (customer.customer && customer.customer.email) || 'S/N' }}
					</p>
					<p class="modal-text">
						<span>Dirección:</span>
						{{ customer.customerGeoPosition }}
						<span v-if="customer.parishId && customer.parish">
							, {{ customer.parish.name }}
						</span>
						<span v-if="customer.parish && customer.city && customer.city">
							- {{ customer.city.name }}
						</span>
						<span v-if="customer.addressLine1">
							- {{ customer.addressLine1 }}
						</span>
					</p>
				</v-flex>
				<v-flex xs12 sm6 pl-3>
					<p class="modal-text">
						<span>Cant. Compras:</span>
						{{
							customer.customer && customer.customer.formatDocuments
								? customer.customer.formatDocuments.totalFac
								: 0
						}}
					</p>
					<p v-if="customer.purchasesFrequency" class="modal-text">
						<span>Frec. Compras:</span>
						{{ customer.purchasesFrequency }}
					</p>
					<p class="modal-text" v-if="customer.limitAmountCredit >= 0">
						<span>Línea Cred.:</span>
						{{ $userInfo.company.currency }}
						{{ customer.limitAmountCredit | round }}
					</p>
					<p class="modal-text error--text" v-if="customer.debtsSales">
						<span>Deuda:</span>
						{{ $userInfo.company.currency }}
						{{ customer.debtsSales[$userInfo.company.currency] | round }}
					</p>
				</v-flex>
			</v-layout>
		</v-flex>
	</v-layout>
</template>

<script>
export default {
	name: 'customer-detail',
	props: {
		customer: {
			default: () => {},
			type: Object,
		},
	},
};
</script>

<style lang="scss" scoped>
.card-title {
	color: color(paginationText);
	font-family: font(open-bold);
	font-size: size(small);
	margin-bottom: 12px;
	margin-top: 0px;
}

.modal-text {
	color: color(paginationText);
	font-family: font(open-regular);
	font-size: size(small11);
	margin-bottom: 12px;
	margin-top: 0px;

	span {
		font-size: size(small9);
	}

	&:last-child {
		margin-bottom: 0px;
	}
}

.border-right {
	border-right: 1px solid color(text-gray);
}
</style>
