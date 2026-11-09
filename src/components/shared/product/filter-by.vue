<template>
	<div>
		<v-layout column wrap>
			<v-flex xs12 v-for="(item, index) in items" :key="item.id" class="filter-by-row">
				<v-checkbox
					v-if="item.id === 1"
					:id="`${item.id}-${index}`"
					:label="item.name"
					color="primary"
					size="small"
					:true-value="1"
					:false-value="0"
					v-model="item.value"
					@change="onChange"
					hide-details
				>
				</v-checkbox>
				<v-checkbox
					v-else-if="item.id === 3"
					:id="`${item.id}-${index}`"
					:label="item.name"
					color="primary"
					size="small"
					:true-value="2"
					:false-value="0"
					v-model="item.value"
					@change="onChangeVal"
					hide-details
				>
				</v-checkbox>
				<v-checkbox
					v-else-if="item.id === 6"
					:id="`${item.id}-${index}`"
					:label="item.name"
					color="primary"
					size="small"
					:true-value="1"
					:false-value="0"
					v-model="item.value"
					@change="onChangeVal"
					hide-details
				>
				</v-checkbox>
				<v-checkbox
					v-else-if="item.id === 7 || item.id === 13 || item.id === 14 || item.id === 15"
					:id="`${item.id}-${index}`"
					:label="item.name"
					color="primary"
					size="small"
					:true-value="1"
					:false-value="0"
					v-model="item.value"
					@change="onChangeVal"
					hide-details
				>
				</v-checkbox>
				<v-checkbox
					v-else
					:id="`${item.id}-${index}`"
					:label="item.name"
					color="primary"
					size="small"
					:true-value="1"
					:false-value="0"
					v-model="item.value"
					@change="onChangeVal"
					hide-details
				>
				</v-checkbox>
			</v-flex>
			<v-flex xs12 px-4 v-if="showCategories">
				<!-- <app-select
					chips
					:item="categoriesValue"
					item-text="name"
					item-value="id"
					:items="categories"
					label="Categorías"
					model="categoriesValue"
					multiple
					:return-object="false"
					@input="setCategories"
				/> -->
				<categories-autocomplete
					:is-multiple="true"
					multiple
					:label="`Categoría`"
					:item="categoriesValue"
					:items="categories"
					item-text="name"
					:slot-custom="true"
					item-value="id"
					@return-data="setCategories"
				></categories-autocomplete>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				@cancel-button-clicked="closeModal"
				@accept-button-clicked="applyFilter"
			/>
		</section>
	</div>
</template>

<script>
import categoriesAutocomplete from '@/components/shared/autocomplete/categories-autocomplete';
import lib from '@/shared/lib';
import modalSidebarButton from './../utils/modal-sidebar-button';

const { setNewProperty } = lib;

function created() {
	if (
		this.showCategories &&
		this.categoriesSelected &&
		this.categoriesSelected.length > 0
	) {
		this.categoriesValue = this.categoriesSelected.split(',');
	}

	this.items = this.items.map((item) => {
		if (item.code === 'types') {
			return {
				...item,
				value: this.typesSelected.includes(String(item.send)),
			};
		}
		return item;
	});
}

function applyFilter() {
	this.dataSelected = this.items.reduce((list, item) => {
		const { id, value } = item;
		if (value > 0) {
			return id === 7 ? list.concat(setNewProperty('value', 0)(item)) : list.concat(item);
		}
		return list;
	}, []);
	this.$emit('filter-by-event', this.dataSelected, this.categoriesValue);
	this.closeModal();
}

function clean(val) {
	if (val) {
		this.clearModal();
	}
}

function clearModal() {
	this.items = this.items.map((item) => {
		const newItem = Object.assign({}, item);
		newItem.value = 0;
		return newItem;
	});
	this.dataSelected = [];
	this.categoriesValue = [];
}

function closeModal() {
	this.$emit('cancel-modal', false);
}

function onChange() {
	if (this.items[0].value > 0) {
		this.items = this.items.map((item) => {
			const newItem = { ...item };
			newItem.value = newItem.id === 3 ? 2 : 1;
			return newItem;
		});
		this.categoriesValue = this.categories.map((c) => c.id);
	} else {
		this.items = this.items.map((item) => {
			const newItem = { ...item };
			newItem.value = 0;
			return newItem;
		});
		this.categoriesValue = [];
	}
}

function onChangeVal() {
	const newItems = this.items.reduce((a, i) => {
		if (i.id > 1) {
			a.push(i);
		}
		return a;
	}, []);
	this.items[0].value = Number(
		newItems.every((i) => i.value > 0) &&
			this.categoriesValue.length === this.categories.length
	);
}

function setCategories({ model, value }) {
	if (value) {
		this[model] = [...value];
		const itemsEvaluated = this.items.filter((i) => i.id > 1);
		this.items[0].value =
			Number(this[model].length === this.categories.length) &&
			itemsEvaluated.every((i) => i.value);
	}
}

function data() {
	return {
		categoriesValue: [],
		dataSelected: [],
		items: [
			{
				id: 1,
				name: 'Todos',
				value: 0,
			},
			{
				id: 2,
				code: 'typeView',
				name: 'Agrupados',
				value: 0,
			},
			{
				id: 3,
				code: 'typeView',
				name: 'Detalle',
				value: 0,
			},
			{
				id: 4,
				code: 'withStock',
				name: 'Con stock',
				value: 0,
			},
			{
				id: 5,
				code: 'withOutStock',
				name: 'Sin stock',
				value: 0,
			},
			{
				id: 6,
				code: 'minStock',
				name: 'Stock mínimo',
				value: 0,
			},
			// {
			// 	id: 7,
			// 	code: 'flagActive',
			// 	name: 'Productos desactivados',
			// 	value: 0,
			// },
			{
				id: 8,
				code: 'types',
				name: 'Terminado',
				value: 0,
				send: 1,
			},
			{
				id: 9,
				code: 'types',
				name: 'Servicio',
				value: 0,
				send: 2,
			},
			{
				id: 10,
				code: 'types',
				name: 'Variaciones',
				value: 0,
				send: 5,
			},
			{
				id: 11,
				code: 'types',
				name: 'Compuesto',
				value: 0,
				send: 6,
			},
			{
				id: 12,
				code: 'types',
				name: 'Insumo',
				value: 0,
				send: 3,
			},
			{
				id: 13,
				code: 'flagLotsEnabled',
				name: 'Lotes',
				value: 0,
			},
			{
				id: 14,
				code: 'flagFlowManufactured',
				name: 'Fabricado',
				value: 0,
			},
			{
				id: 15,
				code: 'flagControlSerie',
				name: 'Producto con serie',
				value: 0,
			},
			{
				id: 16,
				code: 'withWeight',
				name: 'Con peso',
				value: 0,
			},
		],
	};
}

export default {
	name: 'filter-by',
	components: {
		modalSidebarButton,
		categoriesAutocomplete,
	},
	created,
	data,
	methods: {
		applyFilter,
		clearModal,
		closeModal,
		onChange,
		onChangeVal,
		setCategories,
	},
	props: {
		categories: {
			default: () => [],
			type: Array,
		},
		categoriesSelected: {
			default: () => [],
			type: Array,
		},
		clean: {
			default: false,
			type: Boolean,
		},
		showCategories: {
			default: false,
			type: Boolean,
		},
		types: {
			default: '',
			type: String,
		},
	},

	computed: {
		typesSelected() {
			return this.types.split(',');
		},
	},
	watch: {
		clean,
	},
};
</script>

<style lang="scss" scoped>
.filter-by-row {
	&:nth-child(even) {
		background: map-get($colors, background-even-modal);
	}

	.input-group {
		label {
			color: map-get($colors, subheaderText);
			font-family: map-get($fonts, open-semibold);
			font-size: 13px;
		}
	}
}
</style>
