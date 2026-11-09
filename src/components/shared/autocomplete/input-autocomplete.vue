<template>
	<div class="input-autocomplete-container">
		<template v-if="!slotCustom">
			<v-select
				autocomplete
				class="text-field select-app"
				content-class="select-app-content"
				hide-details
				single-line
				:search-input.sync="search"
				v-bind="$attrs"
				@input="setData"
			>
				<template :slot="$attrs.multiple && 'selection'" slot-scope="data">
					<!-- <v-btn @click="log(data)">a</v-btn> -->
					<template v-if="data.index < maxVisible">
						<v-chip :key="data.index" small class="ma-1">
							{{ getTextItem(data.item) }}
						</v-chip>
					</template>
					<template v-else-if="data.index === maxVisible">
						<span class="baseText--text caption py-1 px-2">
							{{ getExtraSelectionLabel() }}
						</span>
					</template>
				</template>
			</v-select>
			<label class="caption-autocomplete">{{ labelValue }}</label>
		</template>
		<template v-else-if="slotCustom && isMultiple">
			<v-select
				autocomplete
				multiple
				:disabled="disabled"
				:label="label"
				class="filter-select"
				content-class="select-app-content"
				hide-details
				single-line
				:search-input.sync="search"
				v-bind="$attrs"
				@input="setData"
				chips
				small-chips
				outlined
			>
				<template slot="item" slot-scope="data">
					<span v-html="data.item.flagMain ? '' : `&nbsp;&nbsp;&nbsp;`"></span>
					<input class="ml-2" type="checkbox" v-model="data.tile.props.value" />
					<span
						:class="`${
							data.item.flagMain
								? 'font-weight-bold text-uppercase black--text pl-1'
								: 'pl-2 text-capitalize'
						}`"
					>
						{{ data.item.name }}
					</span>
				</template>
			</v-select>

			<label class="caption-autocomplete">{{ labelValue }}</label>
		</template>
		<template v-else>
			<v-select
				autocomplete
				class="text-field select-app"
				content-class="select-app-content"
				hide-details
				single-line
				:search-input.sync="search"
				v-bind="$attrs"
				@input="setData"
			>
				<template slot="item" slot-scope="data">
					<span v-html="data.item.flagMain ? '' : `&nbsp;&nbsp;&nbsp;`"></span>
					<v-icon>
						{{ data.item.flagMain ? 'expand_more' : 'arrow_right' }}
					</v-icon>
					<span
						:class="`${
							data.item.flagMain
								? 'font-weight-bold text-uppercase black--text pl-1'
								: 'pl-2 text-capitalize'
						}`"
					>
						{{ data.item.name }}
					</span>
				</template>
			</v-select>

			<label class="caption-autocomplete">{{ labelValue }}</label>
		</template>
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
	if (this.slotCustom && this.isMultiple) {
		this.activeItems = itemData.slice();
	}
	this.$emit('set-data', itemData);
}

function data() {
	return {
		activeItems: [],
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
		// remove(item) {
		// 	const value = this.$attrs.value || [];
		// 	const updated = value.filter((v) => v !== item);
		// 	this.$emit('input', updated)
		// },
		// setData(val) {
		// 	this.$emit('input', val);
		// },
		log(val) {
			console.log(val);
			console.log(this.$attrs);
		},
		getTextItem(item) {
			if (item == null) return '';
			const textKey = this.$attrs['item-text'] || 'text';
			let value = typeof item === 'object' ? item[textKey] : item;
			value = value.trim();
			return value.length > 20 ? `${value.slice(0, 20)}...` : value;
		},
		getExtraSelectionLabel() {
			const { value = [], multiple } = this.$attrs;
			const maxVisible = this.maxVisible || 3;

			// Si no es múltiple, o no hay más de maxVisible ítems, no mostramos nada
			if (!multiple || value.length <= this.maxVisible) {
				return '';
			}

			const extraItems = value.slice(maxVisible);

			return `(+${extraItems.length} otros)`;
		},
	},
	props: {
		label: {
			type: String,
		},
		isMultiple: {
			default: false,
			type: Boolean,
		},
		labelValue: {
			type: String,
		},
		cleanData: {
			default: false,
			type: Boolean,
		},
		slotCustom: {
			default: false,
			type: Boolean,
		},
		disabled: {
			default: false,
			type: Boolean,
		},
		maxVisible: {
			default: 3,
			type: Number,
		},
	},
	watch: {
		search,
		cleanData,
	},
	computed: {
		extraSelections() {
			const value = this.$attrs.value || [];
			return value.length > this.maxVisible ? value.slice(this.maxVisible) : [];
		},
	},
};
</script>
<style lang="scss" scoped>
.input-autocomplete-container {
	display: flex;
	flex-direction: column-reverse;
	flex-wrap: wrap;
}

.caption-autocomplete {
	color: color(brown-grey) !important;
	font-family: font(open-regular) !important;
	font-size: size(small13) !important;
	margin-bottom: 1px;
}
</style>
