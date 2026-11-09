<template>
	<div class="select-autocomplete-create-container">
		<v-select
			autocomplete
			:chips="chips"
			class="text-field select-app"
			:content-class="`select-app-content ${contentClassCustom}
				${!!search && noData ? 'select-autocomplete-create-content-open' : ''}`"
			hide-details
			:multiple="multiple"
			no-data-text="No se encontraron resultados para su búsqueda"
			single-line
			:search-input.sync="search"
			v-bind="$attrs"
			@input="setData"
		>
			<template slot="no-data">
				<v-list-tile-content class="pl-2">
					<v-list-tile-title>No se encontraron resultados para su búsqueda</v-list-tile-title>
				</v-list-tile-content>
				<v-list-tile-content v-if="newRegisterText" class="primary pl-2 btn-item">
					<v-list-tile-title v-if="newRegisterText">
						<v-btn
							class="ma-0 btn-auto btn-total btn-transform-none btn-decoration-underline"
							color="white"
							depressed
							flat
							@click="$emit('new-register', model)"
						>
							{{ newRegisterText }}
						</v-btn>
					</v-list-tile-title>
				</v-list-tile-content>
			</template>
			<template slot="item" slot-scope="data">
				<v-list-tile-content v-if="data.item.btn" class="btn-item">
					<v-list-tile-title
						v-html="newRegisterText"
						@click="$emit('new-register', model)"
					></v-list-tile-title>
				</v-list-tile-content>
				<v-list-tile-content v-else>
					<v-list-tile-title v-html="data.item[newProp]"></v-list-tile-title>
				</v-list-tile-content>
			</template>
			<template slot="selection" slot-scope="data">
				<template v-if="!data.item.btn && !search">
					<div class="input-group__selections__comma" :style="styleSelection(data.item[prop])">
						{{ data.item[prop] }}
					</div>
				</template>
			</template>
		</v-select>
		<label class="label text-xs-left">{{ labelValue }}</label>
	</div>
</template>

<script>
function cleanData(newValue) {
	if (newValue) {
		this.search = null;
	}
}

function newProp() {
	return this.propSearch || this.prop;
}

function search(value) {
	if (value) {
		this.$emit('search', value);
	} else {
		this.setData(value);
	}
}

function setData(itemData) {
	this.$emit('set-data', itemData);
}

function styleSelection() {
// function styleSelection(item) {
	// if (item.length === 29) {
	// 	return 'position: relative; top: 0px';
	// } else if (item.length > 29) {
	// 	return 'position: relative; top: 44px';
	// } else if (item.length > 44) {
	// 	return 'position: relative; top: 63px';
	// }
	return '';
}

function data() {
	return {
		newItems: [],
		search: null,
	};
}

export default {
	name: 'select-autocomplete-create',
	computed: {
		newProp,
	},
	data,
	inheritAttrs: false,
	methods: {
		setData,
		styleSelection,
	},
	props: {
		chips: {
			default: false,
			type: Boolean,
		},
		cleanData: {
			default: false,
			type: Boolean,
		},
		labelValue: {
			type: String,
		},
		model: String,
		multiple: {
			default: false,
			type: Boolean,
		},
		newRegisterText: String,
		noData: {
			default: false,
			type: Boolean,
		},
		prop: String,
		propSearch: String,
		contentClassCustom: String,
	},
	watch: {
		cleanData,
		search,
	},
};
</script>
<style lang="scss" scoped>
	.select-autocomplete-create-container {
		display: flex;
		flex-direction: column-reverse;
		flex-wrap: wrap;
	}

	.label {
		color: color(brown-grey);
		font-family: font(open-regular);
		font-size: size(small13);
	}
</style>