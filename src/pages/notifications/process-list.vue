<template>
  <div>
    <header-page
		caption-navigation="Integración"
		item-text="sucursalName"
		:list-subsidiaries="showConfigGeneral"
		name="price-list"
		:show-clean="false"
		:show-excel="false"
		:subsidiaries="subsidiaries"
		:subsidiary-id="params.subsidiaryId"
		:title="$route.meta.title"
		to-show
		@selected-subsidiary="selectedSubsidiary"
    ></header-page>
	<app-actions
		:resource-uri="$route.name"
		:value-disabled="valueDisabled"
		@open-help="openHelp"
		@run-action="runAction"
	/>
	<v-layout row wrap mt-4 mx-4 justify-space-between align-end>
		<v-flex xs3>
			<app-select
				:item="params.typeProcessId"
				item-text="name"
				item-value="id"
				:items="typesProcess"
				label="Tipo de proceso"
				model="typeProcessId"
				:return-object="false"
				@input="setData($event, true)"
			></app-select>
		</v-flex>
		<v-flex xs2 text-xs-right>
			<v-btn
				class="btn-action btn-auto px-5 py-2"
				color="error"
				@click="cleanFilter"
			>
				Limpiar
			</v-btn>
		</v-flex>
	</v-layout>
    <div class="mt-3">
		<app-table
			:check-all="checkAll"
			class="is-not-selectable"
			:columns="columns"
			:current-page="currentPage"
			:last-page="lastPage"
			name="process"
			:rows="rows"
			selectable
			@on-page="changePage"
			@on-search-event="onSearchEvent"
			@row-is-selected="rowIsSelected"
			@on-selected-all="onSelectedAll"
		>
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable" v-show="showRow(columns, 1)">
					{{ props.row.name }}
				</td>
				<td v-show="showRow(columns, 2)">
					{{ props.row.module.name }}
				</td>
				<td v-show="showRow(columns, 3)">
					{{ props.row.ambit }}
				</td>
				<td v-show="showRow(columns, 4)">
					{{ props.row.typeNamesInline }}
				</td>
				<td v-show="showRow(columns, 5)">
					<app-tooltip-button
						:disabled="disabledTypeProcess(props.row, 1)"
						text="Asignar Tipo de Notificaciones"
						:icon="iconNotification(props.row)"
						color="success"
						@click-icon="goToNotification(props.row)"
					/>
					<app-tooltip-button
						:disabled="disabledTypeProcess(props.row, 2)"
						text="Sincronizar"
						icon="sync"
						color="success"
						@click-icon="goToSync(props.row)"
					/>
				</td>
			</template>
		</app-table>
    </div>
	<action-sidebar
		:title="action.title"
		:value="action.open"
		:code-action="action.code"
		:width="action.width"
		@close-modal="closeModal"
	>
		<new-process
			v-if="isActionCode('NP')"
			@cancel-modal="closeModal"
			@save-process="closeModal"
		/>
		<process-template
			v-if="isActionCode('new-process-template')"
			:disabled="disabled"
			:template="template"
			:types="typesTemplate"
			@close-slide="closeModal"
			@create-template="createTemplate"
			@get-data="setData"
			@get-file="setFile"
		></process-template>
	</action-sidebar>
  </div>
</template>

<script>
import actionSidebar from '@/components/shared/action-sidebar';
import appActions from '@/components/shared/app-actions';
import appTable from '@/components/shared/table/app-table';
import appTooltipButton from '@/components/shared/app-tooltip-button';
import headerPage from '@/components/shared/header-page';
import newProcess from '@/components/notifications/new-process';
import processTemplate from '@/components/integration/process-template';

function created() {
	this.loadSubsidiaries();
	this.showConfigGeneral = this.$userInfo.company && this.$userInfo.company.settings
		? !this.$userInfo.company.settings.flagTypeIntegrationGrouper : false;
}

function disabledTypeProcess({ typeProcessId }, value) {
	return typeProcessId !== value;
}

async function changeActive(value, id) {
	const body = {
		flagActive: value,
	};
	try {
		await this.$httpSales.patch(`process/${id}/active`, body);
		this.showNotification('Se actualizó correctamente.');
		this.loadListProcess();
	} catch (error) {
		this.showGenericError();
	}
}

function changePage(page) {
	this.currentPage = page;
	this.loadListProcess();
}

function cleanFilter() {
	this.params.page = 1;
	this.params.search = null;
	this.params.subsidiaryId = this.subsidiaries[0].id;
	this.params.typeProcessId = null;
	this.loadListProcess();
}

function closeModal() {
	this.action = {
		title: '',
		code: '',
		open: false,
	};
}

async function createTemplate() {
	this.loading = true;
	const body = { ...this.template };
	try {
		await this.$httpSales.post(`process/${this.dataSelected[0].id}/new-template`, body);
		this.showNotification('El proceso ha sido creado correctamente.');
		this.closeModal();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.loading = false;
	}
}

function disabled() {
	const templateKeys = Object.keys(this.template);
	return this.loading || templateKeys.some(k => !this.template[k]);
}

function goToNotification({ ambit, id, moduleId, name }) {
	const subsidiary = this.subsidiaries.find(s => s.id === this.params.subsidiaryId);
	this.goTo('assign-notification-type',
		{
			params: { id },
			query: {
				ambit,
				moduleId,
				name,
				subsidiaryId: this.params.subsidiaryId,
				subsidiaryName: subsidiary.sucursalName,
			},
		},
	);
}

function goToSync({ moduleId, ambit, id, name, code, typeProcess }) {
	const subsidiary = this.subsidiaries.find(s => s.id === this.params.subsidiaryId);
	this.goTo('sync-process',
		{
			params: { id },
			query: {
				typeProcess,
				code,
				ambit,
				moduleId,
				name,
				subsidiaryId: this.params.subsidiaryId,
				subsidiaryName: subsidiary.sucursalName,
			},
		},
	);
}

function iconNotification({ processTypeIntegration }) {
	const { configTypeIntegration } = processTypeIntegration || {};
	const existNotifications = configTypeIntegration ?
		configTypeIntegration.some(cti => cti.flagActive) : false;
	return existNotifications ? 'notifications' : 'notifications_none';
}

function isActionCode(actionCode) {
	return this.action.code === actionCode;
}

async function loadListProcess(page = 1) {
	this.currentPage = page;
	this.params.page = this.currentPage;
	const params = { ...this.params };
	try {
		const { data: rows, headers } = await this.$httpSales.get('process', { params });
		this.rows = rows.map((row) => {
			const newRow = { ...row };
			newRow.typeNamesInline = row.typeNotNames ? row.typeNotNames.join(', ') : '';
			return newRow;
		});
		this.lastPage = Number(headers['x-last-page']);
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

async function loadSubsidiaries() {
	({ data: this.subsidiaries } = await this.subsidiariesList());
	this.params.subsidiaryId = this.subsidiaries.length > 0 ? this.subsidiaries[0].id : null;
	this.loadListProcess();
}

function onSearchEvent(search) {
	this.params.search = search ? search.trim() : null;
	this.loadListProcess();
}

function onSelectedAll(checked) {
	this.checkAll = checked;
	this.rows = this.setPropByRow('rows', 'isSelected', checked);
	this.dataSelected = this.runMethodByRows('rows', 'filter', 'isSelected', true);
	this.setTypesTemplate();
}

function rowIsSelected() {
	this.dataSelected = this.runMethodByRows('rows', 'filter', 'isSelected', true);
	this.checkAll = this.runMethodByRows('rows', 'every', 'isSelected', true);
	this.setTypesTemplate();
}

function runAction({ code }) {
	this.action.code = code;
	if (code === 'NP') {
		this.action.title = 'Nuevo Proceso';
		this.action.width = 538;
	} else if (code === 'new-process-template') {
		this.action.title = 'CREAR TEMPLATE';
		this.action.width = 357;
	}
	this.action.open = true;
}

function runMethodByRows(registers, method, prop, value) {
	return this[registers][method](r => r[prop] === value);
}

function setData({ model, value }, list) {
	if (list) {
		this.params[model] = value;
		this.loadListProcess();
	} else {
		this.template[model] = value;
	}
}

async function setFile({ name, sixFour }) {
	this.loading = true;
	const newFile = { name: name.replace(/\s/g, '-'), base64data: sixFour };
	try {
		const words = newFile.name.split('.');
		const lastItem = words.length;
		const extension = words[lastItem - 1];
		if (this.allowedFiles.indexOf(extension) > -1) {
			const { data: file } = await this.$httpProduction.post('upload-files', newFile);
			this.setData({ model: 'urlImage', value: file.Location });
		} else {
			this.showNotification(`Archivo no válido, solo se permite ${this.allowedFiles.join(',')}`, 'warning');
		}
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.loading = false;
	}
}

function selectedSubsidiary({ model, value }) {
	this.params[model] = value.id;
	this.loadListProcess();
}

function setPropByRow(registers, prop, value) {
	return this[registers].map((register) => {
		const newRegister = { ...register };
		newRegister[prop] = value;
		return newRegister;
	});
}

function setTypesTemplate() {
	this.typesTemplate = this.dataSelected.reduce((a, d) => {
		const typesNot = d.typeNot ? d.typeNot.reduce((ac, tn, index) => {
			const indexAc = ac.findIndex(i => i.code === tn.code);
			const type = {
				id: Number(`${d.id}${index}`),
				code: tn.code,
				name: tn.name,
			};
			if (indexAc < 0) {
				ac.push(type);
			}
			return ac;
		}, []) : [];
		const typeIndex = a.findIndex(item =>
			item.code === typesNot.find(tp => tp.code === item.code).code);
		if (typeIndex < 0) {
			return a.concat(typesNot);
		}
		return a;
	}, []);
}

function stateName({ flagActive }) {
	return flagActive ? 'Activado' : 'Desactivado';
}

function valueDisabled() {
	const disabledValue = this.dataSelected.length !== 1;
	return [{ code: 'new-process-template', disabled: disabledValue }];
}

function data() {
	return {
		action: {
			code: '',
			title: '',
			open: false,
			width: 538,
		},
		allowedFiles: ['jpg', 'png', 'jpeg', 'svg', 'gif'],
		checkAll: false,
		currentPage: 1,
		columns: [
			{ id: 1, name: 'Nombre', value: 'name', visible: true, flagVisible: true, checked: true },
			{ id: 2, name: 'Módulo', value: 'moduleName', visible: true, flagVisible: true, checked: true },
			{ id: 3, name: 'Ambito', value: 'ambit', visible: true, flagVisible: true, checked: true },
			{ id: 4, name: 'Tipo de integración', value: 'typeNotification', visible: true, flagVisible: true, checked: true },
			{ id: 5, name: 'Acciones', visible: true, flagVisible: true, checked: true },
		],
		dataSelected: [],
		flagActive: false,
		lastPage: 0,
		loading: false,
		params: {
			page: 1,
			limit: 30,
			search: null,
			subsidiaryId: null,
			typeProcessId: null,
		},
		rows: [],
		showConfigGeneral: false,
		subsidiaries: [],
		template: {
			name: '',
			tramaHtml: '',
			typeNotificationCode: '',
			urlImage: '',
		},
		typesProcess: [
			{
				id: 1,
				code: 'by-order',
				name: 'Por petición',
			},
			{
				id: 2,
				code: 'in-background',
				name: 'En segundo plano',
			},
			{
				id: 3,
				code: 'cron',
				name: 'Emisor de procesos (CRON)',
			},
		],
		typesTemplate: [],
	};
}

export default {
	name: 'process-list',
	data,
	created,
	components: {
		appActions,
		actionSidebar,
		appTable,
		appTooltipButton,
		headerPage,
		newProcess,
		processTemplate,
	},
	computed: {
		disabled,
		valueDisabled,
	},
	methods: {
		changePage,
		changeActive,
		cleanFilter,
		closeModal,
		createTemplate,
		disabledTypeProcess,
		goToNotification,
		goToSync,
		iconNotification,
		isActionCode,
		loadListProcess,
		loadSubsidiaries,
		onSelectedAll,
		onSearchEvent,
		rowIsSelected,
		runAction,
		selectedSubsidiary,
		runMethodByRows,
		setPropByRow,
		setData,
		setFile,
		setTypesTemplate,
		stateName,
	},
};
</script>