<template>
	<div>
		<v-layout wrap px-4 py-3>
			<v-flex xs12 md12 pr-2 mb-3>
				<v-text-field
					class="filter-select shadow-inset"
					label="Nombre del inventario"
					v-model="model.name">
				</v-text-field>
				<span class="form-group__message"
					v-if="$v.model.name.$invalid">
					El Nombre es requerido
				</span>
			</v-flex>
			<v-flex xs12 md6 pr-2 mb-3>
				<app-date-select
					label="Fecha Inicio"
					:date-formatted="startDate"
					model="startDate"
					:disabled="disabledChildren"
					@input="onDate"
				/>
				<span class="form-group__message"
					v-if="$v.model.startDate.$invalid">
					La fecha Inicial es requerida
				</span>
			</v-flex>
			<v-flex xs12 md6 pr-2 mb-3>
				<app-date-select
					label="Fecha Final"
					:date-formatted="endDate"
					model="endDate"
					@input="onDate"
				/>
				<span class="form-group__message"
					v-if="$v.model.endDate.$invalid">
					La fecha Final es requerida
				</span>
			</v-flex>
			<v-flex xs12 mb-3>
				<v-select
					label="Tipo de Inventario"
					:items="inventoriesType"
					single-line
					item-text="name"
					item-value="id"
					bottom
					hide-details
					v-model="model.type"
					class="filter-select shadow-inset"
					@input="messageComplete"
				></v-select>
				<span class="form-group__message"
					v-if="$v.model.type.$invalid">
					El Tipo de Inventario es requerido
				</span>
			</v-flex>
			<v-flex xs12 mb-3>
				<v-select
					v-model="model.warehouseId"
					:items="warehouses"
					:label="labelWarehouse()"
					single-line
					item-text="name"
					item-value="id"
					bottom
					hide-details
					class="filter-select shadow-inset"
					content-class="filter-select-content"
					:disabled="disabledEdit"
				></v-select>
				<span class="form-group__message"
					v-if="$v.model.warehouseId.$invalid">
					La {{labelWarehouse()}} es requerida
				</span>
			</v-flex>
			<v-flex xs12 mb-3>
				<label class="caption">Inventariadores</label>
				<v-select
					:items="employees"
					v-model="model.responsible"
					class="filter-select shadow-inset"
					placeholder="Inventariadores"
					item-text="fullname"
					multiple
					item-value="fullname"
					item-disabled="disabled"
					chips
					return-object
					@input="setResponsible"
				></v-select>
				<span class="form-group__message"
					v-if="$v.model.responsible.$invalid">
					Los Inventariadores es requerido
				</span>
			</v-flex>
		</v-layout>
		<section class="fast-register-footer">
			<modal-sidebar-button
				:is-loading="$v.model.$invalid || disabledDate || invalidEndDate"
				@cancel-button-clicked="closeModal"
				@accept-button-clicked="sendInventories"
			/>
		</section>
	</div>
</template>

<script>
import { differenceInDays, format } from 'date-fns';
import helper from '@/shared/helper';
import { required } from 'vuelidate/lib/validators';
import modalSidebarButton from './../utils/modal-sidebar-button';

function closeModal() {
	this.$emit('cancel-modal');
	this.clearModal();
}

async function sendInventories() {
	const validDate = differenceInDays(this.model.endDate, this.model.startDate) < 0;
	const flag = this.inventory ? Object.keys(this.inventory).length : false;
	const method = flag ? 'patch' : 'post';
	const url = flag ? `inventories/${this.inventory.id}/father` : 'inventories/father';
	const errorMessageByCountry = this.isPeru ? 'el inventario maestro' : 'la toma física';
	const message = flag ? `Se editó correctamente ${errorMessageByCountry}` :
		`Se creó correctamente ${errorMessageByCountry}`;
	let body = {};
	if (flag) {
		body = {
			responsible: this.model.responsible,
			responsibleIds: this.model.responsibleIds,
			type: this.model.type,
			name: this.model.name,
		};
	} else {
		body = { ...this.model };
	}
	body.startDate = this.model.startDate;
	body.endDate = this.model.endDate;
	body.responsible = body.responsible.map((r) => {
		if (r.fullname) {
			return r.fullname;
		}
		return r;
	});
	if (this.model.responsibleIds.length === 0) {
		body.responsibleIds = this.model.responsible.map(r => r.id);
	}
	if (validDate) {
		this.showNotification('La fecha final no puede ser menor a la inicial.', 'info');
	} else {
		try {
			await this.$httpProducts[method](url, body);
			this.showNotification(message);
			this.clearModal();
			this.$emit('update');
		} catch (error) {
			if (error.status === 400) {
				if (error.data.message === 'THERE_IS_ALREADY_AN_OPEN_INVENTORY') {
					this.showGenericError('Existe un inventario abierto para este almacén');
				} else if (error.data.message === 'CANNOT_EDIT_INVENTORY_TYPE') {
					this.showGenericError('No se puede editar el inventario ya que se realizó el conteo');
				} else if (error.data.message === 'INVENTORY_NOT_FOUND') {
					this.showGenericError('No se existe el inventario');
				} else if (error.data.message === 'EMPLOYEE_WITH_OPEN_INVENTORY_STATUS') {
					this.showGenericError('El empleado que intenta desvincular tiene un inventario activo');
				} else if (error.data.message === 'END_DATE_EDITION_ERROR') {
					this.showGenericError('Error en la fecha de edición');
				}
			} else {
				this.showGenericError();
			}
		}
	}
}

function onDate({ model, value }) {
	this[model] = format(value, 'YYYY/MM/DD');
	this.model[model] = format(value, 'YYYY/MM/DD');
	if (this.model.startDate === this.model.endDate) {
		this.showNotification('La fecha final debe ser mayor a la fecha inicial', 'warning');
		this.invalidEndDate = true;
	} else {
		this.invalidEndDate = false;
	}
	if (model === 'endDate' && this.inventory) {
		if (this.inventory.flagChildren) {
			this.disabledDate = differenceInDays(value, this.$today()) < 0;
			let date = [];
			if (value) {
				date = value.split('-');
			}
			if (date.length === 3) {
				this.messageDate(value);
			}
		}
	}
}

function messageDate(value) {
	const flag = 	differenceInDays(value, this.$today()) < 0;
	if (flag) {
		this.showNotification('La fecha final tiene no puede ser menor a hoy', 'info');
	}
}

function clearModal() {
	this.model = {
		startDate: null,
		endDate: null,
		responsible: [],
		responsibleIds: [],
		type: '',
		warehouseId: '',
		name: '',
	};
	this.startDate = null;
	this.endDate = null;
}

async function loadEmployees() {
	const response = await this.globalEmployees();
	this.employees = response.data;
	const flagEdit = this.inventory ? Object.keys(this.inventory).length : false;
	if (flagEdit) {
		this.inventoryEdit();
	}
}

function created() {
	this.loadEmployees();
	if (this.warehouseId) {
		this.model.warehouseId = this.warehouseId;
	}
}

function disabledEdit() {
	const edit = this.inventory ? !!Object.keys(this.inventory).length : false;
	return edit || !!this.warehouseId;
}

function inventoryEdit() {
	const flagEdit = Object.keys(this.inventory).length;
	this.model.name = this.inventory.name;
	this.model.type = this.inventory.type === 'Parcial' ? 1 : 2;
	this.model.responsible = this.inventory.responsible;
	this.model.responsibleIds = this.inventory.inventoryEmployee.map(ie => ie.employeeId) || [];
	this.startDate = helper.exactDate(this.inventory.startDate, 'YYYY-MM-DD');
	this.model.startDate = helper.exactDate(this.inventory.startDate, 'YYYY-MM-DD');
	this.endDate = helper.exactDate(this.inventory.endDate, 'YYYY-MM-DD');
	this.model.endDate = helper.exactDate(this.inventory.endDate, 'YYYY-MM-DD');
	this.model.warehouseId = this.inventory.warehouseId;
	this.employees = this.employees.map((employee) => {
		const newEmployee = { ...employee };
		if (flagEdit) {
			newEmployee.disabled = !!this.inventory.responsible.find(r => r === newEmployee.fullname);
		} else {
			newEmployee.disabled = false;
		}
		return newEmployee;
	});
}


function messageComplete() {
	if (this.model.type === 2) {
		this.showNotification('Los productos que no aparezcan en este inventario serán actualizados con stock = 0 al momento de hacer el cierre.', 'info');
	}
}

function disabledChildren() {
	return this.inventory ? this.inventory.flagChildren : false;
}

function setResponsible(value) {
	this.model.responsible = value;
	const newValue = value.reduce((acum, v) => {
		if (v.id) {
			acum.push(v.id);
		}
		return acum;
	}, []);
	this.model.responsibleIds = this.inventory.id ? this.model.responsibleIds.concat(newValue) :
		[...newValue];
}

function validations() {
	return {
		model: {
			startDate: {
				required,
			},
			endDate: {
				required,
			},
			responsible: {
				required,
			},
			type: {
				required,
			},
			warehouseId: {
				required,
			},
			name: {
				required,
			},
		},
	};
}
function data() {
	return {
		model: {
			startDate: null,
			endDate: null,
			responsible: [],
			responsibleIds: [],
			type: '',
			warehouseId: '',
			name: '',
		},
		invalidEndDate: false,
		startDate: null,
		endDate: null,
		employees: [],
		disabledDate: false,
	};
}
export default {
	name: 'new-master',
	data,
	components: {
		modalSidebarButton,
	},
	computed: {
		disabledEdit,
		disabledChildren,
	},
	methods: {
		closeModal,
		sendInventories,
		onDate,
		clearModal,
		loadEmployees,
		messageComplete,
		messageDate: helper.debounce(messageDate, 1000),
		inventoryEdit,
		setResponsible,
	},
	created,
	props: {
		warehouses: {
			type: [Object, Array],
			default: () => {},
		},
		inventory: {
			type: [Object, Array],
			default: () => {},
		},
		warehouseId: Number,
	},
	validations,
};
</script>


