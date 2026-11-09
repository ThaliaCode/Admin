<template>
	<div>
		<section>
			<v-flex xs12 mt-4 pa-4>
				<app-table
					name="asign-client"
					:input-search="true"
					:filter-columns="true"
					:rows="rows"
					:columns="columns"
					selectable
					v-on:row-is-selected="rowIsSelected"
					v-on:on-selected-all="selectedAll"
					:check-all="checkAll"
				>
				<template slot="rows" slot-scope="props">
					<td>{{ props.row.name }}</td>
				</template>
			</app-table>
			</v-flex>
		</section>
		<section class="fast-register-footer">
			<modal-sidebar-button
				:isLoading="disabledButton"
				v-on:cancel-button-clicked="closeModal"
				v-on:accept-button-clicked="saveData"/>
		</section>
	</div>
</template>

<script>
	import appTable from './../shared/table/app-table';
	import modalSidebarButton from './../shared/utils/modal-sidebar-button';

	function data() {
		return {
			columns: [
				{ id: 1, name: 'Nombre de la Empresa', value: 'name', visible: true },
			],
			rows: [
				{ name: 'Devin Obrien' },
				{ name: 'Jack Alvarado' },
				{ name: 'Howard Bowen' },
				{ name: 'Jose Peterson' },
			],
			dataSelected: [],
			checkAll: false,
		};
	}

	function closeModal() {
		this.$emit('close-modal');
	}

	function saveData() {}

	function disabledButton() {
		return !this.dataSelected.length > 0;
	}

	function rowIsSelected(row) {
		if (row.isSelected) {
			this.dataSelected.push(row);
		} else {
			const index = this.dataSelected.findIndex(ds => ds.id === row.id);
			if (index > -1) {
				this.dataSelected.splice(index, 1);
			}
		}
		this.checkAll = this.rows.every(element => element.isSelected);
	}

	function selectedAll(value) {
		this.checkAll = value;
		this.dataSelected = [];
		this.rows = this.rows.map((element) => {
			const newRow = { ...element };
			newRow.isSelected = value;
			if (value) {
				this.dataSelected.push(element);
			}
			return newRow;
		});
	}

	export default {
		name: 'asign-client',
		components: {
			appTable,
			modalSidebarButton,
		},
		methods: {
			closeModal,
			saveData,
			rowIsSelected,
			selectedAll,
		},
		computed: {
			disabledButton,
		},
		data,
	};
</script>

