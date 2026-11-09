<template>
	<div>
		<v-layout wrap pa-4>
			<v-flex xs12>
				<app-table
					name="transfer-series"
					:columns="columns"
					:rows="data"
					:main-list="false"
					:input-search="false"
					selectable
					dispatch-detail
					disabled-value="disabled"
					check-all-disabled
					@row-is-selected="rowIsSelected"
				>
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)">{{ props.row.name }}</td>
						<td v-show="showRow(columns, 2)">
							<v-text-field
								hide-details
								single-line
								v-model="props.row.valueEdit"
								class="filter-select"
								@input="validate(props.row, $event)"
							></v-text-field>
						</td>
						<td v-show="showRow(columns, 3)">
							<v-checkbox
								disabled
								v-model="props.row.flagRole"
							></v-checkbox>
						</td>
					</template>
				</app-table>
			</v-flex>
		</v-layout>
		<section class="fast-register-footer">
			<modal-sidebar-button
				:is-loading="!send.length"
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="sendAssign">
			</modal-sidebar-button>
		</section>
	</div>
</template>
<script>
import appTable from '@/components/shared/table/app-table';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function data() {
	return {
		columns: [
			{ id: 1, name: 'Nombre', visible: true, checked: true },
			{ id: 2, name: 'Valor Númerico', visible: true, checked: true },
			{ id: 3, name: 'Rol', visible: true, checked: true },
		],
		data: [],
		send: [],
	};
}

function created() {
	this.loadData();
}

function rowIsSelected(row) {
	this.data = this.data.map((d) => {
		const newData = { ...d };
		if (d.id === row.id) {
			newData.isSelected = d.employeeFilds;
		}
		return newData;
	});
}

async function loadData() {
	try {
		const response = await this.$httpSales.get(`employee/${this.id}/additional-fields`);
		this.data = response.data.map((row) => {
			const newRow = { ...row };
			newRow.valueEdit = row.employeeFilds ? row.employeeFilds.value : row.value;
			newRow.valueChange = row.employeeFilds ? row.employeeFilds.value : row.value;
			newRow.isSelected = !!row.employeeFilds;
			newRow.disabled = 1;
			return newRow;
		});
	} catch (error) {
		this.showGenericError();
	}
}

function addSend(row, text) {
	const selectRow = this.data.filter(d => d.id === row.id);
	if (selectRow.length) {
		if (selectRow[0].valueChange !== text) {
			const body = {
				id: row.id,
				value: text,
				flagActive: row.flagActive === 1,
			};
			if (row.employeeFilds) {
				body.fildsEmployeeId = row.employeeFilds.id;
			}
			if (this.send.length) {
				const flag = this.send.filter(s => s.id === row.id);
				if (flag.length) {
					this.send = this.send.map((s) => {
						const newSend = { ...s };
						if (s.id === row.id) {
							newSend.value = text;
						}
						return newSend;
					});
				} else {
					this.send.push(body);
				}
			} else {
				this.send.push(body);
			}
		} else if (this.send.length) {
			const index = this.send.map(s => s.id).indexOf(row.id);
			this.send.splice(index, 1);
		}
	}
}

function sendAssign() {
	const body = {
		data: this.send,
	};
	try {
		this.$httpSales.post(`/employee/${this.id}/additional-fields`, body);
		this.$emit('close-modal');
		this.showNotification('Se realizó la acción correctamente');
	} catch (error) {
		this.showGenericError();
	}
}

function validate(row, text) {
	const type = row.typeFormat.code;
	const flag = type === 'CHAR' ? isNaN(text) : !isNaN(text);
	const message = type === 'CHAR' ? 'una cadena de texto' : 'un número';
	const textClear = text.trim();
	if (textClear.length) {
		if (flag) {
			const selectRow = this.data.filter(d => d.id === row.id);
			if (selectRow.length) {
				if (selectRow[0].valueChange !== text) {
					const body = {
						id: row.id,
						value: textClear,
						flagActive: row.flagActive === 1,
					};
					if (row.employeeFilds) {
						body.fildsEmployeeId = row.employeeFilds.id;
					}
					if (this.send.length) {
						const index = this.send.map(s => s.id).indexOf(row.id);
						if (index > -1) {
							this.send[index].value = textClear;
						} else {
							this.send.push(body);
						}
					} else {
						this.send.push(body);
					}
				} else if (this.send.length) {
					this.spliceSend(row);
				}
			}
		} else {
			this.showGenericError(`El texto debe ser ${message}`);
			this.spliceSend(row);
		}
	} else {
		this.showGenericError('Texto inválido');
		this.spliceSend(row);
	}
}

function spliceSend(row) {
	const index = this.send.map(s => s.id).indexOf(row.id);
	if (index > -1) {
		this.send.splice(index, 1);
	}
}

export default {
	name: 'assign-additional',
	data,
	components: {
		appTable,
		modalSidebarButton,
	},
	created,
	methods: {
		loadData,
		rowIsSelected,
		addSend,
		sendAssign,
		validate,
		spliceSend,
	},
	props: {
		id: {
			type: [String, Number],
		},
	},
};
</script>

