<template>
	<div>
		<label class="caption">{{ labelValue }}</label>
		<v-select
			autocomplete
			class="filter-select shadow-inset"
			content-class="filter-select-content custom-select-content"
			hide-details
			single-line
			:search-input.sync="search"
			v-bind="$attrs"
			@input="setData"
		>
			<template slot="item" slot-scope="data">
				<v-list-tile-content>
					<v-list-tile-title v-html="data.item.account"></v-list-tile-title>
					<v-list-tile-sub-title v-html="data.item.name"></v-list-tile-sub-title>
				</v-list-tile-content>
			</template>
		</v-select>
	</div>
</template>

<script>
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

function data() {
	return {
		search: null,
	};
}

function cleanData(newValue) {
	if (newValue) {
		this.search = null;
	}
}

export default {
	name: 'input-autocomplete',
	data,
	inheritAttrs: false,
	methods: {
		setData,
	},
	props: {
		labelValue: {
			type: String,
		},
		cleanData: {
			default: false,
			type: Boolean,
		},
	},
	watch: {
		search,
		cleanData,
	},
};
</script>
