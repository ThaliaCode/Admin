<template>
	<div>
		<header-page :title="$route.meta.title" />
		<purchases-list-details
			:columns="columns"
			:details="details"
			:purchase="purchase"
		/>
		<router-view></router-view>
	</div>
</template>

<script>
	import headerPage from '@/components/shared/header-page';
	import purchasesListDetails from '@/components/purchases/purchases-list-details';

	function created() {
		this.loadData();
	}

	async function loadData() {
		try {
			({ data: this.purchase } = await this.$httpSales.get(`purchase-documents/${this.id}`));
			this.details = this.purchase.details.map((detail) => {
				const newDetail = { ...detail };
				const subTotal = Number(detail.quantity) * Number(detail.price);
				newDetail.subTotal = (subTotal + Number(detail.taxAmount)) - Number(detail.discountAmount);
				return newDetail;
			});
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	function data() {
		return {
			columns: [
				{ id: 1, name: 'Código', visible: true },
				{ id: 2, name: 'Nombre', visible: true },
				{ id: 3, name: 'Características', visible: true },
				{ id: 4, name: 'Cantidad', visible: true },
				{ id: 5, name: 'Precio', visible: true },
				{ id: 6, name: 'Total', visible: true },
			],
			purchase: {},
			details: [],
		};
	}

	export default {
		name: 'pages-purchases-details',
		components: {
			headerPage,
			purchasesListDetails,
		},
		created,
		data,
		methods: {
			loadData,
		},
		props: {
			id: {
				type: [Number, String],
			},
		},
	};
</script>
