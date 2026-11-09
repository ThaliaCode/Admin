<template>
	<div>
		<template v-if="customSearch">
			<input-autocomplete-search
				v-bind="$attrs"
				:chips="chips"
				:clean-data="onClean"
				:customer="customer"
				:item-text="itemText"
				:item-value="itemValue"
				:items="newItems"
				:label-value="labelValue"
				:loading="loading"
				:multiple="multiple"
				:no-data="noData"
				:placeholder="placeholder"
				:value="item"
				:return-object="returnObject"
				:autocomplete="autocomplete"
				@search="onSearch"
				@set-data="setData"
			/>
		</template>
		<template v-else-if="custom">
			<input-autocomplete-accounting
				v-bind="$attrs"
				:chips="chips"
				:clean-data="onClean"
				:item-text="itemText"
				:item-value="itemValue"
				:items="newItems"
				:label-value="labelValue"
				:loading="loading"
				:multiple="multiple"
				:placeholder="placeholder"
				:value="item"
				:return-object="returnObject"
				:autocomplete="autocomplete"
				@search="onSearch"
				@set-data="setData"
			/>
		</template>
		<template v-else-if="selectCreate">
			<v-layout row wrap align-end>
				<v-flex :class="!!readonlyPropShow ? `xs${selectColumn}` : 'xs12'">
					<select-autocomplete-create
						v-bind="$attrs"
						:chips="chips"
						:clean-data="onClean || cleanData"
						:content-class-custom="contentClassCustom"
						:id="idSelectCreate"
						:item-text="itemText"
						:item-value="itemValue"
						:items="newItems"
						:label-value="labelValue"
						:loading="loading"
						:model="model"
						:multiple="multiple"
						:new-register-text="newRegisterText"
						:no-data="noData"
						:placeholder="placeholder"
						:prop="prop"
						:prop-search="propSearch"
						:value="item"
						:return-object="returnObject"
						:autocomplete="autocomplete"
						@new-register="$emit('new-register', $event)"
						@search="onSearch"
						@set-data="setData"
					/>
				</v-flex>
				<v-flex :class="`xs${disabledColumn}`" v-if="readonlyPropShow">
					<app-input-text
						:class="disabledClass"
						disabled
						:placeholder="placeholderInput"
						readonly
						:text="readonlyProp"
					></app-input-text>
				</v-flex>
			</v-layout>
		</template>
		<template v-else>
			<input-autocomplete
				v-bind="$attrs"
				:chips="chips"
				:clean-data="onClean"
				:item-text="itemText"
				:item-value="itemValue"
				:items="newItems"
				:label-value="labelValue"
				:loading="loading"
				:multiple="multiple"
				:placeholder="placeholder"
				:value="item"
				:slot-custom="slotCustom"
				:return-object="returnObject"
				:autocomplete="autocomplete"
				@search="onSearch"
				@set-data="setData"
			/>
		</template>
	</div>
</template>

<script>
/* eslint-disable arrow-parens */
import helper from '@/shared/helper';
import lib from '@/shared/lib';
import inputAutocomplete from './input-autocomplete';
import inputAutocompleteAccounting from './input-autocomplete-accounting';
import inputAutocompleteSearch from './input-autocomplete-search';

const { debounce } = helper;
const { setNewProperty } = lib;

function mounted() {
	this.newItems = [...this.items];
}

async function loadData(search) {
	const searchTrim = search ? search.trim() : '';
	if (searchTrim) {
		this.cleanData = false;
		if (!this.localSearch) {
			this.loading = true;
			const params = this.getSearchParams(this.searchParams, searchTrim);
			try {
				({ data: this.newItems }
				= await this[this.httpCode][this.httpMethod](this.resourceUrl, { params }));
				if (this.objectData) {
					this.newItems = this.newItems.map(ni => ni[this.objectData]);
				}
				if (this.propertiesToShow.length > 0) {
					this.createNewProperties(this.newItems, this.itemText, this.propertiesToShow);
				}
				if (this.newRegisterText) {
					let autocompleteItems = '';
					const newProp = this.propSearch || this.prop;
					this.newItems.forEach((s) => {
						autocompleteItems = autocompleteItems.concat(`${s[newProp]} `);
					});
					const newRow = { id: 0, [newProp]: autocompleteItems, btn: true };
					this.newItems.push(newRow);
				}
				this.noData = this.newItems.length === 0;
			} catch (err) {
				if (err.status === 500) {
					this.showGenericError();
				} else if (err.status === 400) {
					if (err.data.message === 'SUBSIDIARY_NOT_FOUND') {
						this.showGenericError('No se encontró información de cuentas contables para la sucursal.');
					}
				}
			} finally {
				this.loading = false;
			}
		}
	} else {
		this.cleanData = true;
	}
}

function mapNewProperties(prop, properties) {
	return function inner(obj) {
		const newObj = { ...obj };
		const values = properties.map(p => newObj[p]).join(' ');
		return setNewProperty(prop, values)(newObj);
	};
}

function createNewProperties(values, prop, properties) {
	this.newItems = values.map(mapNewProperties(prop, properties));
}

function itemAlreadySelected(search) {
	return this.newItems.findIndex(i => i[this.itemText] && (i[this.itemText].trim() === search));
}

function itemsValues(values) {
	this.newItems = [...values];
}

function onSearch(value) {
	const searchTrim = value ? value.trim() : '';
	const index = itemAlreadySelected.call(this, searchTrim);
	if (index === -1) {
		this.loadData(value);
	}
}

function placeholder() {
	return this.placeholderValue || this.labelValue;
}

function setData(dataItem) {
	if (!dataItem) return;
	if (this.newRegisterText) {
		this.$emit('return-data', { model: this.model, value: dataItem });
	} else {
		this.$emit('return-data', dataItem);
	}
}

function getSearchParams(collection, search) {
	let newObject = {};
	collection.forEach(v => {
		newObject = setNewProperty(v, search)(newObject);
	});
	return newObject;
}

function onClean(newValue) {
	if (newValue) {
		this.newItems = [];
	}
}

function data() {
	return {
		cleanData: false,
		loading: false,
		newItems: [],
		noData: false,
	};
}

export default {
	name: 'autocomplete-component',
	components: {
		inputAutocomplete,
		inputAutocompleteAccounting,
		inputAutocompleteSearch,
	},
	computed: {
		placeholder,
	},
	data,
	methods: {
		createNewProperties,
		getSearchParams,
		loadData: debounce(loadData),
		onSearch,
		setData,
	},
	model: {
		event: 'return-data',
	},
	mounted,
	props: {

		autocomplete: {
			default: 'on',
			type: String,
		},
		chips: {
			default: false,
			type: Boolean,
		},
		customSearch: {
			default: false,
			type: Boolean,
		},
		custom: {
			default: false,
			type: Boolean,
		},
		customer: {
			default: false,
			type: Boolean,
		},
		disabledClass: String,
		disabledColumn: {
			default: '6',
			type: [String, Number],
		},
		httpCode: String,
		httpMethod: {
			default: 'get',
			type: String,
		},
		item: '',
		items: {
			default: () => [],
			type: Array,
		},
		itemText: String,
		itemValue: String,
		labelValue: String,
		localSearch: {
			default: false,
			type: Boolean,
		},
		multiple: {
			default: false,
			type: Boolean,
		},
		objectData: String,
		onClean: {
			deafult: false,
			type: Boolean,
		},
		placeholderValue: String,
		placeholderInput: String,
		propertiesToShow: {
			type: Array,
			default: () => [],
		},
		resourceUrl: String,
		returnObject: {
			default: false,
			type: Boolean,
		},
		searchParams: {
			type: Array,
			default: () => ['search'],
		},
		selectColumn: {
			default: '6',
			type: [String, Number],
		},
		newRegisterText: String,
		model: String,
		prop: String,
		selectCreate: {
			default: false,
			type: Boolean,
		},
		readonlyPropShow: {
			default: false,
			type: Boolean,
		},
		readonlyProp: String,
		propSearch: String,
		idSelectCreate: [String, Number],
		contentClassCustom: String,
		slotCustom: {
			default: false,
			type: Boolean,
		},
	},
	watch: {
		items: {
			deep: true,
			handler: itemsValues,
		},
		onClean,
	},
};
</script>