<template>
	<label class="app-select-container">
		<template v-if="slotSelection">
			<v-select
				solo
				class="text-field filter-select"
				:class="{ 'select-input-tag': isTagInput, 'is-disabled': $attrs.disabled }"
				content-class="select-app-content"
				v-bind="$attrs"
				:id="forLabel"
				:item-text="itemText"
				:item-value="itemValue"
				:items="items"
				:placeholder="newPlaceHolder"
				:return-object="returnObject"
				:search-input.sync="searchInputValue"
				:value="item"
				@input="itemSelected"
				item-disabled="disabled"
			>
				<template slot="selection" slot-scope="data">
					<template v-if="showToolTip">
						<v-tooltip top>
							<p slot="activator" class="mb-0 baseText--text">
								{{ data.item[textSlot] | limitTo(limitToSlot) }}
							</p>
							<span>{{ data.item[textSlot] }}</span>
						</v-tooltip>
					</template>
					<template v-else>
						<span class="baseText--text">
							{{ data.item[itemText] }}
						</span>
					</template>
				</template>
			</v-select>
		</template>
		<template v-else-if="slotChip">
			<v-select
				solo
				class="filter-select text-field"
				:class="{ 'select-input-tag': isTagInput, 'is-disabled': $attrs.disabled }"
				v-bind="$attrs"
				content-class="select-app-content"
				:id="forLabel"
				:item-text="itemText"
				:item-value="itemValue"
				:items="items"
				:placeholder="newPlaceHolder"
				:return-object="returnObject"
				:search-input.sync="searchInputValue"
				:value="item"
				@input="itemSelected"
				item-disabled="disabled"
			>
				<template slot="selection" slot-scope="data">
					<v-chip
						:selected="data.selected"
						:key="data.item.id"
						class="chip--select-multi"
						close
						@click.stop="$emit('click-chip', data.item)"
					>
						{{ data.item.name }}
					</v-chip>
				</template>
			</v-select>
		</template>
		<template v-else-if="showAutocomplete">
			<v-select
				solo
				autocomplete
				class="text-filed-autocomplete select-app"
				:class="{
					'filter-select select-input-tag': isTagInput,
					'is-disabled': $attrs.disabled,
				}"
				v-bind="$attrs"
				content-class="select-app-content"
				:id="forLabel"
				:item-text="itemText"
				:item-value="itemValue"
				:items="items"
				:placeholder="newPlaceHolder"
				:return-object="returnObject"
				:value="item"
				@input="itemSelected"
				item-disabled="disabled"
			></v-select>
		</template>
		<template v-else-if="slotFormat">
			<v-select
				solo
				autocomplete
				class="text-filed-autocomplete select-app"
				:class="{
					'filter-select select-input-tag': isTagInput,
					'is-disabled': $attrs.disabled,
				}"
				v-bind="$attrs"
				content-class="select-app-content"
				:id="forLabel"
				:item-text="itemText"
				:item-value="itemValue"
				:items="items"
				:placeholder="newPlaceHolder"
				:return-object="returnObject"
				:value="item"
				@input="itemSelected"
				item-disabled="disabled"
			>
				<template slot="item" slot-scope="data">
					<span v-html="data.item.flagMain ? '' : `&nbsp;&nbsp;&nbsp;`"></span>
					<v-icon>
						{{ data.item.flagMain ? 'expand_more' : 'arrow_right' }}
					</v-icon>
					<span
						:class="`${
							data.item.flagMain ? 'font-weight-bold text-uppercase' : 'text-capitalize'
						}`"
					>
						{{ data.item.name }}
					</span>
				</template>
			</v-select>
			<!-- <small class="error--text" v-if="items.length <= 0">
				No cuenta con {{ label }} asignados
			</small> -->
		</template>
		<template v-else>
			<v-select
				solo
				class="filter-select text-field"
				:class="{ 'select-input-tag': isTagInput, 'is-disabled': $attrs.disabled }"
				v-bind="$attrs"
				content-class="select-app-content"
				:id="forLabel"
				:item-text="itemText"
				:item-value="itemValue"
				:items="items"
				:placeholder="newPlaceHolder"
				:return-object="returnObject"
				:search-input.sync="searchInputValue"
				:value="item"
				@input="itemSelected"
				item-disabled="disabled"
			></v-select>
			<!-- <small class="error--text" v-if="items.length <= 0">
				No cuenta con {{ label }} asignados
			</small> -->
		</template>
		<label class="label" :for="forLabel">
			<div class="layout">
				<span>{{ label }}</span>
				<v-tooltip top v-if="information">
					<img
						src="/static/img/informacion.svg"
						alt="signo de interrogación"
						slot="activator"
						class="ml-3 pb-1"
						height="20"
					/>
					<p class="mb-0 m-w-170">{{ informationText }}</p>
				</v-tooltip>
			</div>
		</label>
	</label>
</template>

<script>
function itemSelected(value, onSearch = false) {
	const body = { value, model: this.model, onSearch };
	this.$emit('input', body);
}

function searchInputValue(val) {
	this.itemSelected(val, true);
}

function newPlaceHolder() {
	return this.placeHolder || this.label;
}

function data() {
	return {
		searchInputValue: '',
	};
}

export default {
	name: 'app-select',
	computed: {
		newPlaceHolder,
	},
	data,
	inheritAttrs: false,
	methods: {
		itemSelected,
	},
	props: {
		item: {
			default: null,
		},
		itemText: {
			default: '',
			type: String,
		},
		itemValue: {
			default: '',
			type: String,
		},
		items: {
			default: () => [],
			type: Array,
		},
		label: {
			default: '',
			type: String,
		},
		model: {
			type: String,
		},
		placeHolder: {
			default: '',
			type: String,
		},
		returnObject: {
			default: true,
			type: Boolean,
		},
		isTagInput: {
			default: false,
			type: Boolean,
		},
		showToolTip: {
			default: false,
			type: Boolean,
		},
		slotSelection: {
			default: false,
			type: Boolean,
		},
		textSlot: {
			default: 'name',
			type: String,
		},
		limitToSlot: {
			default: 10,
			type: Number,
		},
		forLabel: String,
		information: {
			type: Boolean,
			default: false,
		},
		informationText: [String, Number],
		slotChip: {
			default: false,
			type: Boolean,
		},
		showAutocomplete: {
			default: false,
			type: Boolean,
		},
		slotFormat: {
			default: false,
			type: Boolean,
		},
	},
	watch: {
		searchInputValue,
	},
};
</script>

<style lang="scss" scoped>
.label {
	color: color(brown-grey);
	font-family: font(open-regular);
	font-size: size(small13);
	margin-bottom: 1px;
}

.app-select-container {
	display: flex;
	flex-direction: column-reverse;
	flex-wrap: wrap;
}

.is-disabled {
	opacity: 0.6;
	pointer-events: none;
	cursor: not-allowed;

	.v-input__slot {
		background-color: #f0f0f0 !important;
	}
}
</style>
