<template>
	<th v-bind:id="'column-' + column.id">
		<span
			v-if="column.isEditable"
			:style="
				column.borderBottom ? 'border-bottom: 2px solid color(success)' : null
			"
		>
			<span
				v-if="column.showInput"
				:style="
					column.borderBottom ? 'border-bottom: 2px solid color(success)' : null
				"
			>
				<input
					class="column-input"
					type="text"
					:placeholder="column.name"
					:ref="`colheader${column.id}`"
					@keyup.esc.enter="toggleInput(column)"
					@input="$emit('column-input', { event: $event, column })"
				/>
			</span>
			<span class="column-edit-container" v-else-if="column.tooltip">
				<v-tooltip top>
					<span slot="activator">{{ column.name }}</span>
					{{ column.tooltip }}
				</v-tooltip>
				<button @click="toggleInput(column)" class="ml-3">
					<v-icon color="white">create</v-icon>
				</button>
			</span>
			<span
				class="column-edit-container"
				:style="
					column.borderBottom
						? 'border-bottom: 2px solid color(success);width: 135px;margin: auto;'
						: null
				"
				v-else
			>
				{{ column.name }}
				<button @click="toggleInput(column)" class="ml-3">
					<v-icon color="white">create</v-icon>
				</button>
			</span>
		</span>
		<span
			v-else-if="column.tooltip"
			:style="
				column.borderBottom ? 'border-bottom: 2px solid color(success)' : null
			"
		>
			<v-tooltip top>
				<template v-if="column.img">
					<img slot="activator" :src="column.img" alt="" height="19" />
				</template>
				<template v-else>
					<span slot="activator">{{ column.name }}</span>
				</template>
				{{ column.tooltip }}
			</v-tooltip>
		</span>
		<span
			v-else
			:style="
				column.borderBottom ? 'border-bottom: 2px solid color(success)' : null
			"
		>
			{{ column.name }}
		</span>
		<button
			v-if="column.isSortable && isButton"
			@click="onColumnSortable(column)"
			class="sortable-button"
		>
			<v-icon
				v-if="column.isSortable.down"
				color="white"
				class="sortable-icon material-icons icon"
			>
				arrow_drop_down
			</v-icon>
			<v-icon
				v-if="column.isSortable.up"
				color="white"
				class="sortable-icon material-icons icon"
			>
				arrow_drop_up
			</v-icon>
		</button>
	</th>
</template>

<script>
const SORTABLE_COLUMN_EVENT = 'on-column-sortable';

function data() {
	return {
		showInput: false,
	};
}

function onColumnSortable(column) {
	this.$emit(SORTABLE_COLUMN_EVENT, column);
}

function toggleInput(column) {
	if (column.code === 'list-price-sl') {
		if (column.showInput) {
			this.$nextTick(() => {
				const columnInput = this.$refs[`colheader${column.id}`];
				if (columnInput) {
					columnInput.focus();
				}
			});
		}
		this.$emit('show-list');
	} else {
		this.$set(column, 'showInput', !column.showInput);
		if (column.showInput) {
			this.$nextTick(() => {
				const columnInput = this.$refs[`colheader${column.id}`];
				if (columnInput) {
					columnInput.focus();
				}
			});
		}
	}
}

export default {
	name: 'table-column-item',
	data,
	props: {
		column: {
			type: Object,
			required: true,
		},
		onCloumnSortable: {
			type: Function,
		},
		isButton: {
			default: true,
			type: Boolean,
		},
	},
	methods: {
		onColumnSortable,
		toggleInput,
	},
};
</script>

<style lang="scss" scoped>
.column-edit-container {
	display: flex;
	justify-content: center;
}

.column-input {
	border-radius: 3px;
	background-color: white;
	box-shadow: inset 0 0 2px 0 rgba(0, 0, 0, 0.2);
	color: black;
	max-width: 93px;
	padding: 3px;
}
</style>
