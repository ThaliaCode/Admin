<template>
	<div class="accountant-table-tree">
		<v-layout row wrap class="accountant-table-tree-container">
			<v-flex xs12>
				<v-layout row wrap class="accountant-table-tree-header">
					<v-flex
						v-for="column in columns"
						:key="column.id"
						:class="column.class"
					>
						{{ column.name }}
					</v-flex>
				</v-layout>
				<v-layout row wrap class="accountant-table-tree-body" :class="{ 'loading-body' : dialog && dialog.open }">
					<template v-if="dialog && dialog.open">
						<v-flex xs5 px-4 py-2 class="loading-map-container">
							<p class="loading-map-text mb-0">
								Aún no ha sido configurada ninguna empresa.
								Puedes ir a <router-link :to="{ name: dialog.route }">esta ruta</router-link> para realizar una configuración.
							</p>
						</v-flex>
					</template>
					<template v-else>
						<template v-for="(row, index) in rows">
							<tree-item
								:columns="columns"
								:create-plan="createPlan"
								:index="index"
								:item="row"
								:key="row.id"
								:open="row.open"
								:show-name-code="showNameCode"
								@add-account="$emit('add-account', $event)"
								@delete-account="$emit('delete-account', $event)"
								@edit-account="$emit('edit-account', $event)"
								@get-data="$emit('get-data', $event)"
								@row-expanded="$emit('row-expanded', $event)"
								@save-balance="$emit('save-balance', $event)"
							></tree-item>
						</template>
					</template>
				</v-layout>
			</v-flex>
		</v-layout>
	</div>
</template>

<script>
	import treeItem from '@/components/accountant/tree-item';

	export default {
		name: 'accountant-table-tree',
		components: {
			treeItem,
		},
		props: {
			columns: {
				default: () => [],
				type: Array,
			},
			createPlan: {
				default: false,
				type: Boolean,
			},
			dialog: {
				default: () => {},
				type: Object,
			},
			rows: {
				default: () => [],
				type: Array,
			},
			showNameCode: {
				default: false,
				type: Boolean,
			},
		},
	};
</script>

<style lang="scss" scoped>
	.accountant-table-tree {
		&-header {
			align-items: flex-end;
			background-color: color(primary);
			color: color(white);
			font-family: font(open-regular);
			font-size: size(small);
			height: 61px;
			justify-content: center;
			padding-bottom: 12px;
			text-align: center;
		}
	}

	.loading-body {
		align-items: center;
		height: 300px;
		justify-content: center;
	}

	.loading-map {
		&-container {
			background-color: color(white);
			border: 2px solid color(background-sidebar);
			border-radius: 6px;
		}

		&-text {
			color: color(paginationText);
			font-family: font(open-semibold);
			font-size: size(small13);
		}
	}
</style>