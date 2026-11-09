<template>
	<v-layout wrap px-4 py-3>
		<v-flex xs3 pr-4>
			<app-select
				:item="warehouse"
				item-text="name"
				item-value="id"
				:items="warehouses"
				label="Tienda"
				model="warehouse"
				@input="onInput"
			></app-select>
		</v-flex>
		<v-flex xs3 pr-4 v-if="!isDelivery">
			<app-select
				:item="supervisor"
				item-text="name"
				item-value="id"
				:items="supervisors"
				label="Supervisor"
				model="supervisor"
				@input="onInput"
			></app-select>
		</v-flex>
		<v-flex xs3 pr-4 v-if="!isDelivery">
			<app-select
				:item="group"
				item-text="name"
				item-value="id"
				:items="groups"
				label="Grupos"
				model="group"
				@input="onInput"
			></app-select>
		</v-flex>
	</v-layout>
</template>

<script>
	import TypeSeller from '@/shared/type-seller';

	function created() {
		this.loadSupervisor();
		this.loadWarehouses();
	}

	function clean(value) {
		if (value) {
			this.supervisor = null;
			this.warehouse = null;
			this.group = null;
		}
	}

	async function loadSupervisor() {
		const params = {
			typeSeller: TypeSeller.Supervisor,
		};
		try {
			({ data: this.supervisors } = await this.$httpSales.get('sellers', { params }));
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	async function loadWarehouses() {
		try {
			({ data: this.warehouses } = await this.warehousesList());
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	function onInput({ model, value }) {
		this[model] = value.id;
		this.$emit('filter-list', { model, value });
	}

	function data() {
		return {
			group: null,
			supervisor: null,
			supervisors: [],
			warehouse: null,
			warehouses: [],
		};
	}

	export default {
		name: 'vendors-filter',
		created,
		data,
		methods: {
			loadSupervisor,
			loadWarehouses,
			onInput,
		},
		props: {
			clean: {
				default: false,
				type: Boolean,
			},
			groups: {
				default: () => [],
				type: Array,
			},
			isDelivery: {
				default: false,
				type: Boolean,
			},
		},
		watch: {
			clean,
		},
	};
</script>