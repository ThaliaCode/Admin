<template>
	<v-layout wrap row px-3 mt-5>
		<v-flex xs12>
			<p class="title-form">{{title}}</p>
		</v-flex>
		<v-flex xs12>
			<span>{{subtitle}}</span>
			<v-select
				chips
				tags
				clearable
				:items="items"
				item-text="name"
				item-value="id"
				solo
				class="select-chips_code"
				:label="title"
				@input="setItems($event)"
			>
				<template slot="selection" slot-scope="data">
					<v-chip
						close
						@input="removeItems(data.item)"
					>
						<strong>{{ data.item.name }}</strong>&nbsp;
					</v-chip>
				</template>
			</v-select>
		</v-flex>
	</v-layout>
</template>
<script>
function setItems(value) {
	this.$emit('input-multiple', value);
}

function removeItems(item) {
	this.$emit('input-delete', item);
}

function data() {
	return {
		warehousesIds: [],
	};
}
export default {
	name: 'form-multiple',
	data,
	methods: {
		setItems,
		removeItems,
	},
	props: {
		items: {
			type: Array,
			default: () => [],
		},
		title: {
			type: String,
			default: 'Tiendas',
		},
		subtitle: {
			type: String,
			default: 'Almacénes',
		},
	},
};
</script>
<style lang="scss" scoped>
	.title-form {
		border-bottom: 1px solid map-get($colors, subheader);
		color: map-get($colors, background-sidebar);
		font-family: map-get($fonts, open-bold);
		font-size: map-get($sizes, medium18);
		margin-bottom: 21px;
		padding-bottom: 9px;
	}
</style>


