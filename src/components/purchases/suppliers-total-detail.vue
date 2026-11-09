<template>
	<div class="pa-4">
		<v-layout wrap>
			<v-flex xs12 mb-4>
				<h3 class="heading">{{ supplier.name }}</h3>
			</v-flex>
		</v-layout>
		<v-layout
			wrap
			v-for="(item, index) in supplier.currencyAmount"
			:key="index">
			<v-flex xs12>
				<h3 class="body-2">{{ index }}:</h3>
			</v-flex>
			<v-flex xs12>
				<p class="body-1">{{ item.symbol }}{{ item.total | round }}</p>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				hidden
				success-color="primary"
				success-text="Cerrar"
				@accept-button-clicked="close"
			/>
		</section>
	</div>
</template>

<script>
	import modalSidebarButton from './../shared/utils/modal-sidebar-button';

	function created() {
		this.loadResources();
	}

	function close() {
		this.$emit('close');
	}

	async function loadData() {
		({ data: this.supplier } = await this.$httpSales.get(`suppliers/${this.id}`));
		if (this.supplier.currencyAmount) {
			Object.keys(this.supplier.currencyAmount).forEach((key) => {
				this.supplier.currencyAmount[key].total = this.supplier.currencyAmount[key][this.type]
					|| 0;
			});
		} else {
			this.supplier.currencyAmount = {};
			this.currencies.forEach((currency) => {
				this.supplier.currencyAmount[currency.code] = {
					amount: 0,
					debt: 0,
					symbol: currency.symbol,
				};
			});
		}
	}

	async function loadResources() {
		({ data: this.currencies } = await this.$httpSales.get('currency-company',
			{ params: { company: true } }));
		this.loadData();
	}

	function data() {
		return {
			supplier: {},
		};
	}

	export default {
		name: 'suppliers-total-detail',
		components: {
			modalSidebarButton,
		},
		created,
		data,
		methods: {
			close,
			loadData,
			loadResources,
		},
		props: {
			id: {
				type: [Number, String],
			},
			type: {
				type: String,
			},
		},
	};
</script>
