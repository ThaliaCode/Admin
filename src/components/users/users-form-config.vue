<template>
	<div class="pb-5 mb-5">
		<v-layout wrap px-4>
			<v-flex xs12 px-2 pt-3>
				<div class="title grey--text">Configuración de filtros</div>
			</v-flex>
			<v-flex xs12 px-2 pt-3>
				<label class="body-2">Permisos al módulo de Ventas</label>
			</v-flex>
			<v-flex xs12 px-2>
				<app-select
					chips
					:item="salesSubsidiaries"
					item-text="sucursalName"
					item-value="id"
					:items="subsidiaries"
					:label="`Accesos a las ${labelSucursal(true)}:`"
					model="salesSubsidiaries"
					multiple
					:return-object="false"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 px-2>
				<app-select
					chips
					:item="salesWarehouses"
					item-text="name"
					item-value="id"
					:items="warehouses"
					label="Accesos a las Tiendas:"
					model="salesWarehouses"
					multiple
					:return-object="false"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 px-2 pt-3>
				<label class="body-2">Permisos al módulo de Almacenes</label>
			</v-flex>
			<v-flex xs12 px-2>
				<app-select
					chips
					:item="warehousesSubsidiaries"
					item-text="sucursalName"
					item-value="id"
					:items="subsidiaries"
					:label="`Accesos a las ${labelSucursal(true)}:`"
					model="warehousesSubsidiaries"
					multiple
					:return-object="false"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 px-2>
				<app-select
					chips
					:item="warehousesSelected"
					item-text="name"
					item-value="id"
					:items="warehouses"
					label="Accesos a los Almacenes:"
					model="warehousesSelected"
					multiple
					:return-object="false"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 px-2 pt-3>
				<label class="body-2">Permisos al módulo de Productos</label>
			</v-flex>
			<v-flex xs12 px-2>
				<app-select
					chips
					:item="productsWarehouses"
					item-text="name"
					item-value="id"
					:items="warehouses"
					label="Accesos a los Almacenes:"
					model="productsWarehouses"
					multiple
					:return-object="false"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 px-2 pt-3>
				<label class="body-2">Permisos al módulo de Transferencias</label>
			</v-flex>
			<v-flex xs12 px-2>
				<app-select
					chips
					:item="transfersWarehouses"
					item-text="name"
					item-value="id"
					:items="warehouses"
					label="Accesos a los Almacenes:"
					model="transfersWarehouses"
					multiple
					:return-object="false"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 px-2 pt-3>
				<label class="body-2">Permisos al módulo de Configuración</label>
			</v-flex>
			<v-flex xs12 px-2>
				<app-select
					chips
					:item="subsidiariesSelected"
					item-text="sucursalName"
					item-value="id"
					:items="subsidiaries"
					:label="`Accesos a las ${labelSucursal(true)}:`"
					model="subsidiariesSelected"
					multiple
					:return-object="false"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 px-2>
				<app-select
					chips
					:item="cashSelected"
					item-text="name"
					item-value="id"
					:items="cashs"
					:label="`Accesos a las Cajas:`"
					model="cashSelected"
					multiple
					:return-object="false"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 px-2 pt-3>
				<label class="body-2">Permisos al módulo de Comercios</label>
			</v-flex>
			<v-flex xs12 px-2>
				<app-select
					chips
					:item="commercesSubsidiaries"
					item-text="sucursalName"
					item-value="id"
					:items="subsidiaries"
					:label="`Accesos a las ${labelSucursal(true)}:`"
					model="commercesSubsidiaries"
					multiple
					:return-object="false"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 px-2>
				<app-select
					chips
					:item="commercesCommerces"
					item-text="name"
					item-value="id"
					:items="commerces"
					:label="`Accesos a las Comercios:`"
					model="commercesCommerces"
					multiple
					:return-object="false"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 px-2 pt-3>
				<label class="body-2">Permisos para asociar grupo de Clientes</label>
			</v-flex>
			<v-flex xs12 px-2>
				<app-select
					chips
					:item="commercesGroups"
					item-text="name"
					item-value="id"
					:items="groups"
					:label="`Acceso a los grupos de clientes:`"
					model="commercesGroups"
					multiple
					:return-object="false"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 px-2>
				<app-select
					chips
					:item="customersDirection"
					item-text="name"
					item-value="id"
					:items="groupsDirection"
					:label="`Acceso a los grupos de direcciones:`"
					model="customersDirection"
					multiple
					:return-object="false"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 px-2 pt-3>
				<label class="body-2">Permisos al módulo de Pedidos</label>
			</v-flex>
			<v-flex xs12 px-2>
				<app-select
					chips
					:item="orderWarehouses"
					item-text="name"
					item-value="id"
					:items="warehouses"
					label="Accesos a los Almacenes:"
					model="orderWarehouses"
					multiple
					:return-object="false"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 px-2>
				<app-select
					chips
					:item="orderSubsidiaries"
					item-text="sucursalName"
					item-value="id"
					:items="subsidiaries"
					:label="`Accesos a las ${labelSucursal(true)}:`"
					model="orderSubsidiaries"
					multiple
					:return-object="false"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 px-2 pt-3>
				<label class="body-2">Permisos de Lista de Precio</label>
			</v-flex>
			<v-flex xs12 px-2>
				<app-select
					chips
					:item="priceLists"
					item-text="description"
					item-value="id"
					:items="salPriceList"
					label="Acceso a la Lista de Precios:"
					model="priceLists"
					multiple
					:return-object="false"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 px-2>
				<app-select
					:item="priceListsDefault"
					item-text="description"
					item-value="id"
					:items="salPriceListDefault"
					label="Acceso a la Lista de Precios por defecto:"
					model="priceListsDefault"
					@input="setData"
				/>
				<span class="form-group__message" v-if="priceLists.length && !priceListsDefault">
					La lista de precio por defecto es requerida
				</span>
			</v-flex>
		</v-layout>
	</div>
</template>

<script>
import appSelect from '@/components/shared/app-select';

function created() {
	this.loadData();
}

async function loadData() {
	const aclCode = this.$userInfo.company.aclCode;
	const { data: info } = await this.$httpSales.get(`companies/${aclCode}/info`);
	this.subsidiaries = [...info.subsidiaries];
	this.warehouses = [...info.warehouses];
	this.salPriceListDefault = this.salPriceList.filter((item) =>
		this.priceLists.includes(item.id)
	);
}

function setData({ model, value }) {
	if (model === 'priceListsDefault') {
		this.$emit('set-data', { model, value: value.id });
	} else if (model === 'priceLists') {
		this.salPriceListDefault = this.salPriceList.filter((item) =>
			value.includes(item.id)
		);
		this.$emit('set-data', { model, value: [...value] });
	} else {
		const newValue = [...value];
		this.$emit('set-data', { model, value: newValue });
	}
}

function data() {
	return {
		subsidiaries: [],
		warehouses: [],
		salPriceListDefault: [],
	};
}

export default {
	name: 'users-form-config',
	components: {
		appSelect,
	},
	created,
	data,
	methods: {
		loadData,
		setData,
	},
	props: {
		orderWarehouses: {
			default: () => [],
			type: Array,
		},
		orderSubsidiaries: {
			default: () => [],
			type: Array,
		},
		productsWarehouses: {
			default: () => [],
			type: Array,
		},
		salesSubsidiaries: {
			default: () => [],
			type: Array,
		},
		salesWarehouses: {
			default: () => [],
			type: Array,
		},
		cashSelected: {
			default: () => [],
			type: Array,
		},
		subsidiariesSelected: {
			default: () => [],
			type: Array,
		},
		transfersWarehouses: {
			default: () => [],
			type: Array,
		},
		warehousesSelected: {
			default: () => [],
			type: Array,
		},
		warehousesSubsidiaries: {
			default: () => [],
			type: Array,
		},
		commerces: {
			default: () => [],
			type: Array,
		},
		groups: {
			default: () => [],
			type: Array,
		},
		commercesGroups: {
			default: () => [],
			type: Array,
		},
		groupsDirection: {
			default: () => [],
			type: Array,
		},
		customersDirection: {
			default: () => [],
			type: Array,
		},
		commercesCommerces: {
			default: () => [],
			type: Array,
		},
		commercesSubsidiaries: {
			default: () => [],
			type: Array,
		},
		cashs: {
			default: () => [],
			type: Array,
		},
		salPriceList: {
			default: () => [],
			type: Array,
		},
		priceListsDefault: {
			type: Number,
		},
		priceLists: {
			default: () => [],
			type: Array,
		},
	},
};
</script>
