<template>
	<v-layout wrap class="total-by-payment total-border">
		<v-flex xs12>
			<v-layout
				wrap
				justify-end
				white--text
				class="total-header"
			>
				<v-flex xs10>
					<v-layout
						text-xs-center
						wrap
						align-center
					>
						<v-flex xs4 class="py-2px pr-2px">
							<span class="primary lighten-1 total-header-text">
								Conciliación
							</span>
						</v-flex>
						<v-flex xs4 class="py-2px pr-2px">
							<span class="primary lighten-1 total-header-text">
								En Libros
							</span>
						</v-flex>
						<v-flex xs4 class="py-2px">
							<span class="primary lighten-1 total-header-text">
								En Bancos
							</span>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
		</v-flex>
		<v-flex xs12>
			<v-layout wrap class="total-body">
				<v-flex xs2 class="pr-2px">
					<v-layout
						wrap
						white--text
						caption
						class="total-body-sidebar"
					>
						<v-flex xs12 text-xs-right class="pb-2px">
							<span class="primary lighten-1 total-sidebar-text">
								Saldo:
							</span>
						</v-flex>
						<v-flex
							xs12
							text-xs-right
							class="pb-2px"
							v-for="bankTransaction in bankTransactions"
							:key="bankTransaction.id"
						>
							<span class="primary lighten-1 total-sidebar-text">
								{{ bankTransaction.code }}:
							</span>
						</v-flex>
						<v-flex xs12 text-xs-right class="pb-2px">
							<span class="primary lighten-1 total-sidebar-text">
								Total:
							</span>
						</v-flex>
						<v-flex xs12 text-xs-right>
							<span class="primary lighten-1 total-sidebar-text">
								Difer:
							</span>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex
					xs10
					text-xs-right
					primary--text
					class="total-body-content"
				>
					<v-layout wrap align-center>
						<v-flex xs4 class="pb-2px pr-2px">
							<span class="total-body-text white">
								0
							</span>
						</v-flex>
						<v-flex xs4 class="pb-2px pr-2px">
							<span class="total-body-text white">
								{{ journalAmount }}
							</span>
						</v-flex>
						<v-flex xs4 class="pb-2px">
							<span class="total-body-text white">
								{{ bankAccountAmount }}
							</span>
						</v-flex>
					</v-layout>
					<v-layout
						wrap
						align-center
						v-for="bankTransaction in bankTransactions"
						:key="bankTransaction.id"
					>
						<v-flex xs4 class="pb-2px pr-2px">
							<span class="total-body-text white" v-if="paymentTypes.daily.paymentTypes[bankTransaction.code]">
								{{ paymentTypes.daily.paymentTypes[bankTransaction.code].totalReconcilement | round }}
							</span>
							<span class="total-body-text white" v-else>
								0
							</span>
						</v-flex>
						<v-flex xs4 class="pb-2px pr-2px">
							<span class="total-body-text white" v-if="paymentTypes.daily.paymentTypes[bankTransaction.code]">
								{{ paymentTypes.daily.paymentTypes[bankTransaction.code].totalBooks | round }}
							</span>
							<span class="total-body-text white" v-else>
								0
							</span>
						</v-flex>
						<v-flex xs4 class="pb-2px">
							<span class="total-body-text white" v-if="paymentTypes.bank.paymentTypes[bankTransaction.code]">
								{{ paymentTypes.bank.paymentTypes[bankTransaction.code].totalBank | round }}
							</span>
							<span class="total-body-text white" v-else>
								0.00
							</span>
						</v-flex>
					</v-layout>
					<!-- <v-layout wrap align-center>
						<v-flex xs4 class="pb-2px pr-2px">
							<span class="total-body-text white">
								2,937.89
							</span>
						</v-flex>
						<v-flex xs4 class="pb-2px pr-2px">
							<span class="total-body-text white">
								172,397.74
							</span>
						</v-flex>
						<v-flex xs4 class="pb-2px">
							<span class="total-body-text white">
								
							</span>
						</v-flex>
					</v-layout>
					<v-layout wrap align-center>
						<v-flex xs4 class="pb-2px pr-2px">
							<span class="total-body-text white">
								0.00
							</span>
						</v-flex>
						<v-flex xs4 class="pb-2px pr-2px">
							<span class="total-body-text white">
								7,364,627.39
							</span>
						</v-flex>
						<v-flex xs4 class="pb-2px">
							<span class="total-body-text white">
								
							</span>
						</v-flex>
					</v-layout>
					<v-layout wrap align-center>
						<v-flex xs4 class="pb-2px pr-2px">
							<span class="total-body-text white">
								0.00
							</span>
						</v-flex>
						<v-flex xs4 class="pb-2px pr-2px">
							<span class="total-body-text white">
								0.00
							</span>
						</v-flex>
						<v-flex xs4 class="pb-2px">
							<span class="total-body-text white">
								
							</span>
						</v-flex>
					</v-layout>
					<v-layout wrap align-center>
						<v-flex xs4 class="pb-2px pr-2px">
							<span class="total-body-text white">
								0.00
							</span>
						</v-flex>
						<v-flex xs4 class="pb-2px pr-2px">
							<span class="total-body-text white">
								5,699,872.87
							</span>
						</v-flex>
						<v-flex xs4 class="pb-2px">
							<span class="total-body-text white">
								
							</span>
						</v-flex>
					</v-layout> -->
					<v-layout wrap align-center>
						<v-flex xs8 class="pb-2px pr-2px">
							<span class="total-body-text white">
								{{ paymentTypes.daily.totalGeneral | round }}
							</span>
						</v-flex>
						<v-flex xs4 class="pb-2px">
							<span class="total-body-text white">
								{{ paymentTypes.bank.totalGeneral | round }}
							</span>
						</v-flex>
					</v-layout>
					<v-layout wrap align-center v-if="paymentTypes">
						<v-flex xs12 class="pb-2px">
							<span class="total-body-text white">
								{{ diferencePayment }}
							</span>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
		</v-flex>
	</v-layout>
</template>
<script>
	export default {
		name: 'bank-reconciliation-total-detail',
		props: {
			bankTransactions: {
				default: () => [],
				type: Array,
			},
			diferencePayment: Number,
			currency: String,
			paymentTypes: {
				default: () => {},
				type: Object,
			},
			bankAccountAmount: Number,
			journalAmount: Number,
		},
	};
</script>
<style lang="scss" scoped>
	.py-2px {
		padding-bottom: 2px;
		padding-top: 2px;
	}

	.pr-2px {
		padding-right: 2px;
	}

	.pl-2px {
		padding-left: 2px;
	}

	.pt-2px {
		padding-top: 2px;
	}

	.pb-2px {
		padding-bottom: 2px;
	}

	.total-header,
	.total-sidebar-text {
		font-size: size(small11);
	}

	.total-header-text,
	.total-sidebar-text,
	.total-body-text {
		align-items: center;
		display: flex;
		height: 30px;
		justify-content: center;
		width: 100%;
	}

	.total-sidebar-text,
	.total-body-text {
		justify-content: flex-end;
		padding-right: 5px;
	}

	.total-body-content {
		font-family: font(open-semibold);
		font-size: size(small13);
	}

	.total-body-text {
		border: 1px solid color(primary) !important;
		border-radius: 1px;
	}
</style>