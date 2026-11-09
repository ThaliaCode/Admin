<template>
	<v-container pt-5>
		<app-table
			name="selecting-sale-account"
			:columns="columns"
			:rows="rows"
			class="is-not-selectable">
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable">{{props.row.code}}</td>
				<td>{{props.row.account}}</td>
				<td :class="[props.row.group === 1 ? 'active' : 'inactive']">
					<button>
						{{statusInWords(props.row.group)}}
					</button>
				</td>
			</template>
		</app-table>
	</v-container>
</template>

<script>
import appTable from './../../shared/table/app-table';

function statusInWords(status) {
	return status === 1 ? 'ACTIVO' : 'INACTIVO';
}

function data() {
	return {
		columns: [
			{ id: 1, name: 'Código', value: 'code', visible: true, checked: true },
			{ id: 2, name: 'Cuenta', value: 'account', visible: true, checked: true },
			{ id: 3, name: 'Grupo', value: 'group', visible: true, checked: true },
		],
		rows: [
			{ code: '001', account: '191 0001 374638', group: 1 },
			{ code: '002', account: '192 0101 432234', group: 0 },
		],
	};
}

export default {
	name: 'selecting-sale-account',
	components: {
		appTable,
	},
	data,
	methods: {
		statusInWords,
	},
};
</script>

<style lang="scss" scoped>
.active {
	color: color(success);
	font-family: font(open-bold);
}
.inactive {
	color: color(red-error);
	font-family: font(open-bold);
}
</style>
