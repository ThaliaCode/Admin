<template>
	<div>
		<router-view
			:bank="bank"
			:title="pageTitle"
		></router-view>
	</div>
</template>
<script>

function created() {
	({ bankAccountId: this.bankAccountId } = this.$route.params);
	this.loadData();
}

async function loadData() {
	const requests = [
		this.$httpSales.get(`bank-account/${this.bankAccountId}`),
	];
	([
		{ data: this.bank },
	] = await Promise.all(requests));
}

function pageTitle() {
	return this.$route.meta.title;
}

function data() {
	return {
		bank: {},
		bankAccountId: null,
	};
}

export default {
	name: 'page-check-book',
	computed: {
		pageTitle,
	},
	created,
	data,
	methods: {
		loadData,
	},
};
</script>

