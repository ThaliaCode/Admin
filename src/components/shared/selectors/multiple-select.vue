<template>
	<v-layout row wrap px-4 py-3>
		<v-flex xs12>
			<v-select
				class="text-field select-app"
				hide-details
				multiple
				:placeholder="placeholder"
				solo
				v-bind="$attrs"
				v-on="$listeners"
			>
				<template slot="selection" slot-scope="data">
					<v-chip v-if="false">
						<span>{{ data.item }}</span>
					</v-chip>
					<span class="label-multi-select" v-if="data.index === 0">{{
						placeholder
					}}</span>
				</template>
			</v-select>
			<v-card
				class="mt-3 py-2 px-3 scroll-card"
				:style="`max-height: ${maxHeight}px`"
				v-if="itemsSelected.length > 0"
			>
				<template v-if="heading">
					<template v-if="itemDefault">
						<p class="label-heading mb-0 pl-1">Punto de venta por defecto</p>
						<v-chip
							label
							outline
							close
							color="primary"
							class="heading-chip primary lighten-2"
							@input="$emit('delete-item', itemDefault)"
						>
							<span class="prefix-name pr-1"
								>Tienda {{ itemDefault.warWarehousesName }} -</span
							>
							{{ itemDefault.name }}
						</v-chip>
						<v-divider class="my-2"></v-divider>
					</template>
					<template v-for="item in itemsSelected">
						<v-chip
							v-if="!item.flagDefault"
							:key="item.id"
							label
							outline
							close
							color="primary"
							@input="$emit('delete-item', item)"
							@click="$emit('on-click', item)"
						>
							<span class="prefix-name pr-1"
								>Tienda {{ item.warWarehousesName }} -</span
							>
							{{ item.name }}
						</v-chip>
					</template>
				</template>
				<template v-else>
					<v-chip
						v-for="item in itemsSelected"
						:key="item.id"
						label
						outline
						close
						color="primary"
						@input="$emit('delete-item', item)"
						@click="$emit('on-click', item)"
					>
						{{ item.name }}
					</v-chip>
				</template>
			</v-card>
		</v-flex>
	</v-layout>
</template>

<script>
export default {
	name: 'multiple-select',
	inheritAttrs: false,
	props: {
		heading: {
			default: false,
			type: Boolean,
		},
		itemDefault: {
			default: () => {},
			type: Object,
		},
		itemsSelected: {
			default: () => [],
			type: Array,
		},
		maxHeight: {
			default: 137,
			type: [Number, String],
		},
		placeholder: String,
	},
};
</script>

<style lang="scss" scoped>
.select-app {
	padding-left: 16px;
}

.label-multi-select {
	color: color(grey-border);
	font-size: size(small);
	padding-left: 10px;
}

.scroll-card {
	overflow: auto;
}

.prefix-name {
	font-family: font(open-bold);
}

.label-heading {
	color: color(grey-border);
	font-family: font(open-semibold);
	font-size: size(small11);
}

.chip.chip.chip--outline.heading-chip {
	background: rgba(color(primary), 0.5) !important;
}
</style>
