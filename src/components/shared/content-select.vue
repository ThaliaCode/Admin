<template>
	<v-layout class="content-select">
		<v-flex xs1 v-if="!disabled">
			<button @click="$emit('click-add')">
				<v-tooltip top>
					<v-icon color="primary" slot="activator">add_circle</v-icon>
					<span>{{ textTooltip }}</span>
				</v-tooltip>
			</button>
		</v-flex>
		<v-flex xs11>
			<div class="layout wrap">
				<div v-for="item in itemsSelect" :key="item[value]" class="content-select-item">
					<span>{{ item[text]}}</span>
					<button @click="$emit('delete-item', item)" v-if="!disabled">
						<v-icon color="primary" size="13">clear</v-icon>
					</button>
				</div>
			</div>
		</v-flex>
	</v-layout>
</template>
<script>

function mounted() {
	this.changeItems(this.items);
}

function items(values) {
	this.changeItems(values);
	if (this.emitEvent) {
		this.$emit('change-items', values);
	}
}

function changeItems(values) {
	if (this.flagObject) {
		this.itemsSelect = values.reduce((acum, i) => {
			const index = this.itemsAll.findIndex(a => a[this.value] === i);
			if (index > -1) {
				acum.push(this.itemsAll[index]);
			}
			return acum;
		}, []);
	} else {
		this.itemsSelect = [...values];
	}
}

function itemsAll(values) {
	if (this.flagObject) {
		this.itemsSelect = this.items.reduce((acum, i) => {
			const index = values.findIndex(a => a[this.value] === i);
			if (index > -1) {
				acum.push(values[index]);
			}
			return acum;
		}, []);
	} else {
		this.itemsSelect = [...this.items];
	}
}

function flagDelete() {
	this.changeItems(this.items);
}

function data() {
	return {
		itemsSelect: [],
	};
}

export default {
	name: 'content-select',
	data,
	mounted,
	methods: {
		changeItems,
	},
	props: {
		items: {
			type: Array,
			default: () => [],
		},
		text: {
			type: String,
			default: 'name',
		},
		value: {
			type: String,
			default: 'id',
		},
		textTooltip: String,
		itemsAll: {
			type: Array,
			default: () => [],
		},
		flagObject: {
			type: Boolean,
			default: false,
		},
		emitEvent: {
			type: Boolean,
			default: false,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		flagDelete: {
			type: Boolean,
			default: false,
		},
	},
	watch: {
		items,
		itemsAll,
		flagDelete,
	},
};
</script>
<style lang="scss" scoped>
	.content-select {
		&-item {
			background-color: rgba(195, 231, 232, 0.21);
			border: 1px solid color(primary);
			border-radius: 5px;
			color: color(primary);
			font-size: 13px;
			margin: 4px;
			padding: 3px;
		}
	}
</style>