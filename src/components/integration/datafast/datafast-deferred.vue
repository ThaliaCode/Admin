<template>
	<v-layout wrap mt-3 pa-3>
		<v-flex xs12>
			<app-select
				chips
				multiple
				deletable-chips
				item-text="name"
				item-value="code"
				label="Tipos de crédito"
				return-object
				:items="deferredSystem"
				:item="deferredSelected"
				@input="setDeferred"
			/>
		</v-flex>
		<v-flex xs12 mt-3 v-if="isDiffWithSelected.exist">
			<app-select
				chips
				multiple
				deletable-chips
				item-text="name"
				item-value="value"
				label="Diferido con interés y meses de gracia"
				:items="isDiffWithSelected.data"
				:item="diffWidthMonths"
				:return-object="false"
				@input="setDeferredWith"
			/>
		</v-flex>
		<v-flex xs12 mt-3 v-if="isDiffWithOutSelected.exist">
			<app-select
				chips
				multiple
				deletable-chips
				item-text="name"
				item-value="value"
				label="Diferido sin interés y meses de gracia"
				:items="isDiffWithOutSelected.data"
				:item="diffWidthOutMonths"
				:return-object="false"
				@input="setDeferredWithOut"
			/>
		</v-flex>
	</v-layout>
</template>
<script>

function setDeferred({ value }) {
	this.deferredSelected = [].concat(value);
}

function isDiffWithSelected() {
	const exist = this.deferredSelected.find(di => di.code === '07');
	if (!exist) {
		this.diffWidthMonths = [];
	}
	return {
		exist,
		data: (exist && exist.months) || [],
	};
}

function isDiffWithOutSelected() {
	const exist = this.deferredSelected.find(di => di.code === '09');
	if (!exist) {
		this.diffWidthOutMonths = [];
	}
	return {
		exist,
		data: (exist && exist.months) || [],
	};
}

function setDeferredWith({ value }) {
	this.diffWidthMonths = [].concat(value);
}

function setDeferredWithOut({ value }) {
	this.diffWidthOutMonths = [].concat(value);
}

function data() {
	return {
		deferredSelected: [],
		deferredSystem: [
			{ name: 'Transacción corriente', code: '00' },
			{ name: 'Diferido corriente', code: '01' },
			{ name: 'Diferido con interés', code: '02' },
			{ name: 'Diferido sin interés', code: '03' },
			{
				code: '07',
				name: 'Diferido con interés y meses de gracia',
				months: [
					{ value: 3, name: '3 meses' },
					{ value: 6, name: '6 meses' },
					{ value: 9, name: '9 meses' },
					{ value: 12, name: '12 meses' },
				],
			},
			{
				name: 'Diferido sin interés y meses de gracia',
				code: '09',
				months: [
					{ value: 3, name: '3 meses' },
					{ value: 6, name: '6 meses' },
					{ value: 9, name: '9 meses' },
					{ value: 12, name: '12 meses' },
				],
			},
			{ name: 'Diferido Plus cuotas', code: '21' },
			{ name: 'Diferido Plus', code: '22' },
		],
		diffWidthMonths: [],
		diffWidthOutMonths: [],
	};
}

export default {
	name: 'datafast-deferred',
	computed: {
		isDiffWithOutSelected,
		isDiffWithSelected,
	},
	data,
	methods: {
		setDeferred,
		setDeferredWith,
		setDeferredWithOut,
	},
};
</script>
<style lang="scss" scoped>

</style>