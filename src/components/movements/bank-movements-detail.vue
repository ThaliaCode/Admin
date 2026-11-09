<template>
	<div>
		<table-scroll 
			:rows="rows" 
			@on-row-clicked="$emit('reconcilement-selected', $event)"
			table-height="427px"
		>
			<template slot="header">
				<v-flex xs3>
					Fecha
				</v-flex>
				<v-flex xs2>
					Estado
				</v-flex>
				<v-flex xs3>
					Libros
				</v-flex>
				<v-flex xs3>
					Banco
				</v-flex>
			</template>
			<template slot="body" slot-scope="props">
				<v-flex xs3 class="table-scroll-col">
					<span class="table-scroll-text">
						{{ props.row.date | exactDate }}
					</span>
				</v-flex>
				<v-flex xs2 class="table-scroll-col">
					<app-tooltip-button
						icon="radio_button_checked"
						:color="props.row.statusColor"
						:text="props.row.statusLabel"
					/>
				</v-flex>
				<v-flex xs3 class="table-scroll-col">
					<span class="table-scroll-text">
						{{ currency }}
						{{ props.row.journalAmount | round }}
					</span>
				</v-flex>
				<v-flex xs3 class="table-scroll-col">
					<span class="table-scroll-text">
						{{ currency }}
						{{ props.row.bankAmount | round }}
					</span>
				</v-flex>
				<v-flex xs1 text-xs-center class="table-scroll-col">
					<app-tooltip-button
						color="error"
						icon="cancel"
						size="18"
						text="Eliminar"
						@click-icon="$emit('on-click-icon', props.row)"
					/>
				</v-flex>
			</template>
		</table-scroll>
	</div>
</template>

<script>
	import tableScroll from '@/components/shared/table/table-scroll';

	export default {
		name: 'bank-movements-detail',
		components: {
			tableScroll,
		},
		props: {
			currency: String,
			rows: {
				default: () => [],
				type: Array,
			},
		},
	};
</script>