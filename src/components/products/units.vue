<template>
	<div class="warehouse">
		<header-page :title="$route.meta.title" />
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
			@open-help="openHelp"
		/>
		<v-layout mt-5>
			<v-flex xs12>
				<app-table
					name="units"
					:selectable="false"
					:inputSearch="false"
					:filterColumns="false"
					:rows="rows"
					:items-quantity="rows.length"
					:columns="columns"
					:last-page="lastPage"
					:current-page="currentPage"
					@on-page="changePage"
					class="is-not-selectable"
				>
					<template slot="rows" slot-scope="props">
						<td class="is-not-selectable" v-show="showRow(columns, 1)">
							{{ props.index + 1 }}
						</td>
						<td v-show="showRow(columns, 2)">{{ props.row.code }}</td>
						<td v-show="showRow(columns, 3)">{{ props.row.name }}</td>
						<td v-show="showRow(columns, 4)">{{ props.row.color }}</td>
						<td v-show="showRow(columns, 5)">
							{{ props.row.flagWeighable === 1 ? 'Sí' : 'No' }}
						</td>
						<td v-show="showRow(columns, 6)">
							<document-state
								:color="getColorStatus(props.row)"
								icon="radio_button_checked"
								:tooltip="getTextStatus(props.row)"
							/>
						</td>
						<td v-show="showRow(columns, 6)">
							<app-tooltip-button
								color="yellowFav"
								icon="star_border"
								text="Favorito"
								:size="19"
								:disabled="!props.row.flagDefault"
							/>
							<app-tooltip-button
								color="success"
								icon="edit"
								text="Editar"
								:size="19"
								@click-icon="openIt(props.row)"
							/>
						</td>
					</template>
				</app-table>
			</v-flex>
		</v-layout>
		<action-sidebar
			:width="action.width"
			v-model="action.open"
			:title="action.title"
			:active="action.active"
			:help-actions="actionsToHelp"
			:code-action="action.code"
			@close-modal="closeModal"
		>
			<v-container v-if="action.code !== 'HELP'">
				<v-layout wrap px-2>
					<v-flex xs12 px-2>
						<app-input-text
							label="Nombre"
							model="name"
							:text="newUnit.name"
							@input="setData"
						/>
						<span class="form-group__message" v-if="!$v.newUnit.name.required">
							El nombre de la unidad es requerido
						</span>
					</v-flex>
					<v-flex xs6 px-2>
						<app-input-text
							label="Código"
							model="code"
							:disabled="!!id"
							:text="newUnit.code"
							@input="setData"
						/>
						<span class="form-group__message" v-if="!$v.newUnit.code.required">
							El código de la unidad es requerido
						</span>
						<span class="form-group__message" v-if="!$v.newUnit.code.maxLength">
							Máximo 25 caracteres
						</span>
						<span class="form-group__message" v-if="checkBlankCode(newUnit.code)">
							No se permite espacios en blanco
						</span>
					</v-flex>
					<v-flex xs6 px-2>
						<app-input-text
							label="Color"
							model="color"
							:text="newUnit.color"
							type="color"
							@input="setData"
						/>
					</v-flex>
					<v-flex xs12 px-2 mt-3>
						<v-checkbox
							color="success"
							hide-details
							label="Unidad Principal"
							@input="setData"
							v-model="newUnit.flagDefault"
						></v-checkbox>
					</v-flex>
					<v-flex xs12 px-2 mt-3>
						<v-checkbox
							color="success"
							hide-details
							label="Unidad Activa"
							@input="setData"
							v-model="newUnit.flagActive"
						></v-checkbox>
					</v-flex>
					<v-flex xs12 px-2 mt-3>
						<v-checkbox
							color="success"
							hide-details
							label="Unidad Pesable"
							@input="setData"
							v-model="newUnit.flagWeighable"
						></v-checkbox>
					</v-flex>
				</v-layout>
			</v-container>
			<section class="modal-filter-footer">
				<modal-sidebar-button
					:is-loading="$v.newUnit.$invalid || checkBlankCode(newUnit.code)"
					@cancel-button-clicked="closeModal"
					@accept-button-clicked="saveData"
				/>
			</section>
		</action-sidebar>
	</div>
</template>

<script>
import { maxLength, required } from 'vuelidate/lib/validators';
import actionSidebar from '@/components/shared/action-sidebar';
import appActions from '@/components/shared/app-actions';
import appInputText from '@/components/shared/app-input-text';
import appTable from '@/components/shared/table/app-table';
import headerPage from '@/components/shared/header-page';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import documentState from '@/components/shared/document-state';

function created() {
	this.loadData();
}

async function loadData() {
	try {
		({ data: this.rows } = await this.listOfUnits());
	} catch (error) {
		this.showGenericError();
	}
}

function clearModal() {
	this.newUnit = {
		code: '',
		color: '#000000',
		name: '',
		flagDefault: false,
		flagActive: true,
		flagWeighable: false,
	};
	this.id = 0;
}

function closeModal() {
	this.action = { ...this.actionDefault };
	this.clearModal();
}

function changePage(page) {
	this.currentPage = page;
}

function openIt(unit) {
	if (unit.id) {
		this.action.title = 'Editar Unidad';
		this.newUnit.code = unit.code;
		this.newUnit.color = unit.color;
		this.newUnit.name = unit.name;
		this.newUnit.flagWeighable = Boolean(unit.flagWeighable);
		this.id = unit.id;
		if (unit.flagDefault === 1) {
			this.newUnit.flagDefault = true;
		} else {
			this.newUnit.flagDefault = false;
		}
		this.newUnit.flagActive = Boolean(unit.flagActive);
		this.action.active = true;
		this.action.open = true;
	}
}

function runAction(item) {
	this.action.active = true;
	this.action.code = item.code;
	this.action.open = true;
	this.action.title = item.name;
	this.action.width = 400;
}

async function saveData() {
	const url = this.id ? `units/${this.id}` : 'units';
	const method = this.id ? 'patch' : 'post';
	const message = this.id ? 'actualizada' : 'creada';
	const body = {
		color: this.newUnit.color || '#000000',
		code: this.newUnit.code,
		name: this.newUnit.name,
		flagDefault: this.newUnit.flagDefault,
		flagActive: this.newUnit.flagActive,
		flagWeighable: this.newUnit.flagWeighable,
	};
	try {
		await this.$httpProducts[method](url, body);
		this.showNotification(`Unidad ${message} exitosamente`);
		this.closeModal();
		this.loadData();
	} catch (error) {
		const messageExist = `Unit ${this.newUnit.name} already exists`;
		if (messageExist.toLowerCase() === error.data.message.toLowerCase()) {
			this.showNotification('Esta unidad ya existe', 'error');
		}
		if (error.status === 400) {
			if (error.data.message === 'UNIT_DUPLICATE_CODE') {
				this.showNotification('Codigo duplicado.', 'error');
			}
		} else {
			this.showGenericError();
		}
	}
}

function setData({ model, value }) {
	this.newUnit[model] = value;
}

function validations() {
	return {
		newUnit: {
			code: {
				maxLength: maxLength(25),
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
		action: {
			code: '',
			open: false,
			active: false,
			width: 400,
			title: 'Título desde data',
		},
		actionDefault: {
			code: '',
			open: false,
			active: false,
			width: 400,
			title: 'Título desde data',
		},
		columns: [
			{
				id: 1,
				name: 'Posición',
				value: 'position',
				visible: true,
				checked: true,
			},
			{ id: 2, name: 'Código', value: 'code', visible: true, checked: true },
			{ id: 3, name: 'Nombre', value: 'name', visible: true, checked: true },
			{ id: 4, name: 'Color', value: 'color', visible: true, checked: true },
			{ id: 5, name: 'Pesable', value: 'flagWeighable', visible: true, checked: true },
			{ id: 6, name: 'Estado', value: 'state', visible: true, checked: true },
			{
				id: 7,
				name: 'Acciones',
				visible: true,
				checked: true,
				flagVisible: true,
			},
		],
		currentPage: 1,
		id: 0,
		lastPage: 0,
		newUnit: {
			code: '',
			color: '#000000',
			name: '',
			flagDefault: false,
			flagActive: true,
			flagWeighable: false,
		},
		rows: [],
	};
}
export default {
	name: 'units',
	components: {
		actionSidebar,
		appActions,
		appInputText,
		appTable,
		headerPage,
		modalSidebarButton,
		documentState,
	},
	data,
	created,
	methods: {
		changePage,
		clearModal,
		closeModal,
		loadData,
		openIt,
		runAction,
		saveData,
		setData,
		getTextStatus(unit) {
			return unit.flagActive ? 'Activo' : 'Inactivo';
		},
		getColorStatus(unit) {
			return unit.flagActive ? 'success' : 'error';
		},
	},
	validations,
};
</script>
