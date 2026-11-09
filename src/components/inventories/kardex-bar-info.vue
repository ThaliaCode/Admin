<template>
	<v-layout row wrap justify-end class="kardex-bar-info">
		<v-flex xs3>
			<label class="label-info">Código</label>
			<p class="value-info">{{ productCode }}</p>
		</v-flex>
		<v-flex xs2>
			<label class="label-info">Stock actual</label>
			<p class="value-info">{{ actualStock }}</p>
		</v-flex>
		<v-flex xs2 v-if="!isNotShowCostPrice">
			<label class="label-info" v-if="showRoleWarehouse">
				{{ labelKardex }}
			</label>
			<p class="value-info">{{ totalCost | round }}</p>
		</v-flex>
		<v-flex xs2>
			<label class="label-info">Unidad</label>
			<p class="value-info">{{ productUnity }}</p>
		</v-flex>
	</v-layout>
</template>

<script>
function created() {
	this.showRoleWarehouse = !this.isWarehouse;
	this.labelKardex = this.$userInfo.company.settings.flagKardexValued
		? 'Costo Total'
		: 'Ultimo Costo';
	this.isNotShowCostPrice = this.$userInfo.flagNotShowCostPrice;
}

function data() {
	return {
		labelKardex: '',
		showRoleWarehouse: true,
	};
}

export default {
	name: 'kardex-bar-info',
	props: {
		actualStock: [Number, String],
		productCode: [String, Number],
		productUnity: [String, Number],
		totalCost: Number,
	},
	created,
	data,
};
</script>

<style lang="scss" scoped>
.kardex-bar-info {
	padding-right: 10px;

	div {
		border-right: 1px solid color(background-sidebar);
		margin: 3px 0px;
		padding: 0px 0px 0px 8px;
	}
}
</style>
