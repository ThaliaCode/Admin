<template>
	<v-layout row wrap justify-center class="step-accountant">
		<v-flex xs12 text-xs-center v-if="showOptions && !createPlan">
			<button
				v-for="item in btnAccounts"
				:disabled="item.action !== 'importPlan'"
				:key="item.id"
				:class="{ 'active' : item.active }"
				class="step-accountant-option"
				type="button"
				@click="openDialog(item)"
			>
				{{ item.name }}
			</button>
		</v-flex>
		<v-layout wrap justify-space-between v-else>
			<span class="title-step text-xs-left">
				<template v-if="importPlan">
					PLAN DE CUENTAS IMPORTADO DESDE QUIPU ENGINE
				</template>
				<template v-else-if="loadPlan">
					PLAN DE CUENTAS CARGADO DESDE EXCEL
				</template>
				<template v-else-if="createPlan">
					INGRESA LOS CÓDIGOS DE CUENTA PARA CREAR TU PROPIO PLAN DE CUENTAS
				</template>
				<app-tooltip-button
					color="success"
					:disabled="loading"
					icon="settings"
					text="Volver a configurar mi plan de cuentas"
					@click-icon="updateShowOptions"
				></app-tooltip-button>
			</span>
			<span class="btn-balance">
				<v-btn
					class="btn-action btn-auto mr-0 my-0 px-3 py-2"
					color="primary"
					:disabled="loading"
					type="button"
					@click="showBalanceColumn"
				>
					<template v-if="columns.length < 5">
						Configurar Saldos
					</template>
					<template v-else>
						Ocultar Saldos
					</template>
				</v-btn>
			</span>
			<v-flex xs12 text-xs-center>
				<template v-if="loading">
					<div class="title-step text-xs-center title-modal">
						Espera un momento para ver el plan de cuentas importado.
					</div>
				</template>
				<template v-else>
					<accountant-table-tree
						:columns="columns"
						:create-plan="createPlan"
						:rows="planAccounts"
						show-name-code
						@add-account="addAccount"
						@delete-account="deleteAccount"
						@edit-account="editAccount"
						@get-data="setData"
						@row-expanded="$emit('row-expanded', $event)"
						@save-balance="saveBalance"
					></accountant-table-tree>
				</template>
			</v-flex>
		</v-layout>
		<v-dialog
			v-model="importPlanModal"
			persistent
			max-height="510"
			max-width="922"
		>
			<v-card class="dialog dialog-padding">
				<v-layout row justify-space-between align-center>
					<v-flex class="title-dialog">
						PLAN DE CUENTAS A IMPORTAR DESDE QUIPU ENGINE
					</v-flex>
					<v-flex text-xs-right>
						<v-btn
							class="btn-close btn-auto"
							depressed
							small
							@click="closeDialog('importPlanModal')"
						>
							<span class="error--text">x</span>
						</v-btn>
					</v-flex>
				</v-layout>
				<template v-if="loading">
					<div class="title-step text-xs-center title-modal">
						Espera un momento para ver la vista previa del plan
						de cuentas que puedes importar desde quipu engine.
					</div>
				</template>
				<template v-else>
					<accountant-table-tree
						class="accountant-table-tree-modal"
						:columns="columnsWithoutActions"
						:create-plan="createPlan"
						:rows="rows"
						@add-account="addAccount"
						@edit-account="editAccount"
						@delete-account="deleteAccount"
					></accountant-table-tree>
				</template>
				<section class="modal-footer">
					<v-flex text-xs-center>
						<v-btn
							class="btn-action mr-0 ml-1"
							color="primary"
							:disabled="loadingAssign"
							type="button"
							@click="assignPlan"
						>
							Asignar
						</v-btn>
					</v-flex>
				</section>
			</v-card>
		</v-dialog>
		<v-dialog
			v-model="loadPlanModal"
			persistent
			max-width="436"
		>
			<v-card class="dialog">
				<v-layout wrap row align-center>
					<v-flex class="title-step" pl-4>
						CARGAR MI PLAN DE CUENTAS EXCEL
					</v-flex>
					<v-flex text-xs-right pr-4>
						<v-btn
							class="btn-close btn-auto"
							depressed
							small
							@click="closeDialog('loadPlanModal')"
						>
							<span class="error--text">x</span>
						</v-btn>
					</v-flex>
					<v-flex xs12 pt-4 text-xs-center>
						<img
							class="mb-4"
							src="/static/img/excel-template.png"
							alt=""
							height="377"
						/>
						<!-- url caido -->
						<a
							href="AccessDenied"
							download="plantilla_plan_contable"
							class="btn-link"
						>
							<v-btn
								class="btn-action btn-auto px-4 py-1"
								color="primary"
								outline
								type="button"
							>
								DESCARGAR MODELO XLS
							</v-btn>
						</a>
						<label
							class="step-input-upload pt-2"
							for="file-plan-accounts"
							ref="plan-accounts"
						>
							<vue-six-four
								hidden
								id="file-plan-accounts"
								@vue-six-four="getFileUpdate"
							/>
							<v-btn
								class="btn-action btn-auto px-4 py-1"
								:class="{ 'btn-excel-active' : fileName }"
								color="primary"
								outline
								type="button"
								@click="showDialog"
							>
								<template v-if="fileName">
									{{ fileName }}
								</template>
								<template v-else>
									CARGAR DOCUMENTO XLS
								</template>
							</v-btn>
						</label>
					</v-flex>
					<v-flex xs12 text-xs-center mt-4>
						<v-btn
							class="btn-action mr-0 ml-1"
							color="primary"
							:disabled="!fileName || loadingAssign"
							type="button"
							@click="saveUploadPlan"
						>
							Guardar
						</v-btn>
					</v-flex>
				</v-layout>
			</v-card>
		</v-dialog>
		<v-dialog
			v-model="dialogDelete"
			persistent
			max-width="425">
			<v-card>
				<v-card-title class="headline" text-xs-center>
					<p class="text-xs-center" mb-0>¿Deseas eliminar la cuenta {{ dataSelected.name }}?</p>
				</v-card-title>
				<v-card-actions class="btn-block">
					<v-layout row wrap>
						<v-flex xs6 pr-1
							text-xs-right>
							<v-btn
								color="info"
								class="btn-action white--text"
								@click.native="closeDialog('dialogDelete')"
							>
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs6 pl-1
							text-xs-left>
							<v-btn
								color="pink"
								class="btn-action white--text"
								@click.native="accountDelete">
								Aceptar
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<section class="modal-filter-footer">
			<v-flex text-xs-center>
				<v-btn
					class="btn-auto btn-back ma-0"
					color="primary"
					:disabled="loadingAssign"
					outline
					type="button"
					@click="$emit('back-step')"
				>
					Atrás
				</v-btn>
				<v-btn
					v-if="!showOptions || createPlan"
					class="btn-auto btn-back ml-3 my-0"
					color="success"
					type="button"
					@click="nextStep(true)"
				>
					<span class="primary--text">Guardar</span>
				</v-btn>
			</v-flex>
		</section>
		<action-sidebar
			:code-action="action.code"
			:title="action.title"
			:width="action.width"
			v-model="action.open"
			@close-modal="closeModal"
		>
			<create-item-account
				v-if="action.code === 'edit-account'"
				:account="dataSelected"
				:create-plan="createPlan"
				:edit="flagEdit"
				@close-modal="closeModal"
				@save="createAccount"
			/>
		</action-sidebar>
	</v-layout>
</template>

<script>
	import accountantTableTree from '@/components/accountant/accountant-table-tree';
	import createItemAccount from '@/components/accountant/create-item-account';
	import VueSixFour from 'vue-six-four';
	import actionSidebar from '@/components/shared/action-sidebar';

	async function accountDelete() {
		try {
			await this.$httpQuipu.delete(`com-accounting-accounts/${this.dataSelected.id}`);
			this.closeDialog('dialogDelete');
			this.showNotification('Se elimino correctamente');
		} catch (error) {
			this.showGenericError();
		}
	}

	function addAccount(row) {
		this.dataSelected = { ...row };
		this.flagEdit = false;
		this.action = {
			active: true,
			open: true,
			code: 'edit-account',
			title: `${row.name} - Agregar cuenta contable`,
			width: 450,
		};
	}

	function assignPlan() {
		this.loading = true;
		this.$emit('import-plan', this.typeConfig);
		this.importPlanModal = false;
		this.importPlan = true;
	}

	function balanceItemDelete(code) {
		const indexBalance = this.balanceData.findIndex(bd => bd.code === code);
		if (indexBalance > -1) {
			this.balanceData.splice(indexBalance, 1);
		}
	}

	function chargeValue(value) {
		this.charge = value;
	}

	function closeDialog(prop) {
		this[prop] = false;
	}

	function closeModal() {
		this.action = {
			active: false,
			open: false,
			code: '',
			title: '',
			width: 0,
		};
	}

	async function createAccount(item, isBalance) {
		const { account, accumulated, balance, code, description, accountingAccountCode, name } = item;
		const body = { accumulated, balance, name, description };
		let message = '';
		if (isBalance) {
			body.account = account;
			body.code = code;
			message = 'El balance ha sido agregado correctamente.';
		} else if (this.flagEdit) {
			body.account = accountingAccountCode ? `${accountingAccountCode}.${account}` :
				this.dataSelected.account;
			body.accumulated = this.dataSelected.accumulated || 0;
			body.balance = this.dataSelected.balance || 0;
			body.code = `${this.dataSelected.accountingAccountCode}${account.replace(/\./g, '')}`;
			message = 'La cuenta ha sido editada correctamente.';
		} else {
			body.account = `${this.dataSelected.account}${account}`;
			body.code = `${this.dataSelected.account}${account.replace(/\./g, '')}`;
			message = 'La cuenta ha sido creada correctamente.';
		}
		const urlCode = code || this.dataSelected.code;
		const url = this.flagEdit ? `accounting-accounts/${this.ruc}/${urlCode}/fb` :
			`accounting-accounts/${this.ruc}/${this.dataSelected.accountingPlanId}/fb`;
		const method = this.flagEdit ? 'patch' : 'post';
		try {
			await this.$httpQuipu[method](url, body);
			this.showNotification(message);
			if (isBalance) {
				this.balanceItemDelete(code);
			}
			this.closeModal();
			if (this.flagEdit) {
				this.setEditData(body);
			} else {
				this.setCreateData(body);
			}
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	function deleteAccount(row) {
		this.dataSelected = { ...row };
		this.dialogDelete = true;
	}

	function editAccount(row) {
		this.dataSelected = { ...row };
		this.flagEdit = true;
		this.action = {
			active: true,
			open: true,
			code: 'edit-account',
			title: `${row.name} - Editar cuenta contable`,
			width: 450,
		};
	}

	async function editMultipleItems() {
		const body = this.balanceData.map(bd => ({
			accumulated: bd.accumulated,
			balance: bd.balance,
			id: bd.id,
		}));
		try {
			await this.$httpQuipu.patch(`accounting-accounts/${this.ruc}/fb`, body);
			this.showNotification('El balance de los registros ha sido actualizado correctamente.');
			this.$emit('next-step', true);
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	function getFileUpdate(fileInfo) {
		const newFile = {
			name: fileInfo.name.replace(/\s/g, '-'),
			base64data: fileInfo.sixFour,
		};
		const words = newFile.name.split('.');
		const lastItem = words.length;
		const extension = words[lastItem - 1];
		if (this.allowedFiles.indexOf(extension) > -1) {
			this.$emit('file-charged', newFile.base64data, newFile.name);
		} else {
			this.showNotification(
				`Archivo no válido, solo se permite ${this.allowedFiles.join(',')}`,
				'warning',
			);
		}
	}

	function loadingAssign(val) {
		if (!val) {
			this.loading = val;
		}
	}

	async function loadPreview({ id }) {
		this.loading = true;
		this.typeConfig = id;
		const params = { typeConfig: this.typeConfig, tree: true };
		try {
			({ data: this.rows } = await this.$httpQuipu.get(
				`accounting-accounts-fb/${this.countryCode}`, { params }));
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		} finally {
			this.loading = false;
		}
	}

	function nextStep(finish) {
		if (this.balanceData.length > 0) {
			this.editMultipleItems();
		} else {
			this.$emit('next-step', finish);
		}
	}

	function openDialog(item) {
		this.btnAccounts = this.setValuByProp(this.btnAccounts, item, 'active', 'id');
		this[`${item.action}Modal`] = true;
		if (item.action === 'importPlan') {
			this.loadPreview(item);
		} else {
			this.typeConfig = item.id;
			if (item.action === 'createPlan') {
				this[`${item.action}Modal`] = false;
				this[item.action] = true;
				this.loadPreview({ id: this.typeConfig });
			}
		}
	}

	function saveBalance(item) {
		const indexItem = this.balanceData.findIndex(bd => bd.code === item.code);
		if (indexItem > -1) {
			this.balanceData[indexItem] = { ...item };
		} else {
			this.balanceData.push({ ...item });
		}
		this.flagEdit = true;
		this.createAccount(item, true);
	}

	function saveUploadPlan() {
		this.$emit('assign-plan', this.typeConfig);
		this.loadPlanModal = false;
		this.loadPlan = true;
	}

	function setCreateData({ account, description, name }) {
		const row = this.dataSelected.accountingAccountCode ?
			this.planAccounts.find(r => r.code === this.dataSelected.accountingAccountCode) :
			this.planAccounts.find(r => r.id === this.dataSelected.id);
		const newDetail = {
			account: this.dataSelected.accountingAccountCode ?
				`${this.dataSelected.accountingAccountCode}.${account}` : account,
			accountingPlanId: this.dataSelected.accountingPlanId,
			code: this.dataSelected.accountingAccountCode ?
				`${this.dataSelected.accountingAccountCode}${account.replace(/\./g, '')}` :
				account.replace(/\./g, ''),
			description,
			accountingAccountCode: this.dataSelected.code,
			level: this.dataSelected.level + 1,
			name,
		};
		if (row.details) {
			row.details.push(newDetail);
		} else {
			row.details = [];
			row.details.push(newDetail);
		}
	}

	function setData({ item, info }) {
		const { model, value } = info;
		this.$set(item, model, Number(value));
		this.$set(item, 'accumulated', Number(value));
		const itemToAccum = this.rows.find(r => r.code === item.accountingAccountCode);
		const accum = itemToAccum.details.reduce((a, ita) => a + (ita.balance || 0), 0);
		this.$set(itemToAccum, 'accumulated', accum);
		const indexItem = this.balanceData.findIndex(bd => bd.code === item.accountingAccountCode);
		if (indexItem > -1) {
			this.balanceData[indexItem] = { ...item };
		} else {
			this.balanceData.push({ ...item });
		}
	}

	function setEditData({ account, description, name }) {
		const row = this.dataSelected.accountingAccountCode ?
			this.planAccounts.find(r => r.code === this.dataSelected.accountingAccountCode) :
			this.planAccounts.find(r => r.id === this.dataSelected.id);
		const newRow = this.dataSelected.accountingAccountCode ? row.details.find(d =>
			d.id === this.dataSelected.id) : row;
		const newAccount = this.dataSelected.accountingAccountCode ?
			`${this.dataSelected.accountingAccountCode}.${account}` : account;
		this.$set(newRow, 'account', newAccount);
		this.$set(newRow, 'description', description);
		this.$set(newRow, 'name', name);
	}

	function setValuByProp(registers, item, prop, propToCompare) {
		return registers.map((register) => {
			const newRegister = { ...register };
			newRegister[prop] = register[propToCompare] === item[propToCompare];
			return newRegister;
		});
	}

	function showBalanceColumn() {
		this.loading = true;
		if (this.isPeru) {
			this.columns = this.columns.length < 4 ? [...this.columns] :
				[...this.columnsWithoutBalance];
		} else {
			this.columns = this.columns.length < 5 ? [...this.columns] :
				[...this.columnsWithoutBalance];
		}
		this.loading = false;
	}

	function showDialog() {
		this.$refs['plan-accounts'].click();
	}

	function updateShowOptions() {
		this.$emit('update-show-options');
		this.createPlan = false;
	}

	function created() {
		if (this.isPeru) {
			this.columns = [
				{
					id: 1,
					class: 'xs3',
					icon: true,
					name: 'Código',
					value: 'account',
				},
				{
					id: 2,
					class: 'xs3',
					icon: false,
					name: 'Descripción',
					value: 'description',
				},
				{
					id: 3,
					class: 'xs2 px-2',
					icon: false,
					edit: true,
					name: 'Saldos',
					value: 'balance',
				},
				{
					id: 4,
					class: 'xs2 text-xs-center pl-0 ml-0',
					icon: false,
					name: 'Acumulado',
					round: true,
					value: 'accumulated',
				},
				{
					id: 5,
					class: 'xs2',
					icon: false,
					name: 'Acciones',
					value: 'actions',
				},
			];
			this.columnsWithoutBalance = [
				{
					id: 1,
					class: 'xs4',
					icon: true,
					name: 'Código',
					value: 'account',
				},
				{
					id: 2,
					class: 'xs4',
					icon: false,
					name: 'Descripción',
					value: 'description',
				},
				{
					id: 3,
					class: 'xs4',
					icon: false,
					name: 'Acciones',
					value: 'actions',
				},
			];
		}
	}

	function data() {
		return {
			action: {
				active: false,
				open: false,
				code: '',
				title: '',
				width: 0,
			},
			allowedFiles: ['xls', 'xlsx'],
			balanceData: [],
			btnAccounts: [
				{
					id: 1,
					action: 'importPlan',
					name: 'IMPORTA TU PLAN DE CUENTAS DE QUIPU ENGIN',
					active: false,
				},
				{
					id: 2,
					action: 'loadPlan',
					name: 'CARGA MI PLAN DE CUENTAS EXCEL',
					active: false,
				},
				{
					id: 3,
					action: 'createPlan',
					name: 'CREAR MI PROPIO PLAN CUENTAS',
					active: false,
				},
			],
			charge: false,
			columnsOld: [
				{
					id: 1,
					class: 'xs2',
					icon: true,
					name: 'Código',
					value: 'account',
				},
				{
					id: 2,
					class: 'xs3',
					name: 'Título',
					value: 'name',
				},
				{
					id: 3,
					class: 'xs4',
					icon: false,
					name: 'Descripción',
					value: 'description',
				},
				{
					id: 4,
					class: 'xs3',
					icon: false,
					name: 'Acciones',
					value: 'actions',
				},
			],
			columns: [
				{
					id: 1,
					class: 'xs2',
					icon: true,
					name: 'Código',
					value: 'account',
				},
				{
					id: 2,
					class: 'xs2',
					name: 'Título',
					value: 'name',
				},
				{
					id: 3,
					class: 'xs3',
					icon: false,
					name: 'Descripción',
					value: 'description',
				},
				{
					id: 4,
					class: 'xs2 px-2',
					icon: false,
					edit: true,
					name: 'Saldos',
					value: 'balance',
				},
				{
					id: 5,
					class: 'xs2 text-xs-center pl-0 ml-0',
					icon: false,
					name: 'Acumulado',
					round: true,
					value: 'accumulated',
				},
				{
					id: 6,
					class: 'xs1',
					icon: false,
					name: 'Acciones',
					value: 'actions',
				},
			],
			columnsWithoutBalance: [
				{
					id: 1,
					class: 'xs2',
					icon: true,
					name: 'Código',
					value: 'account',
				},
				{
					id: 2,
					class: 'xs4',
					name: 'Título',
					value: 'name',
				},
				{
					id: 3,
					class: 'xs4',
					icon: false,
					name: 'Descripción',
					value: 'description',
				},
				{
					id: 4,
					class: 'xs2',
					icon: false,
					name: 'Acciones',
					value: 'actions',
				},
			],
			columnsWithoutActions: [
				{
					id: 1,
					class: 'xs2',
					icon: true,
					name: 'Código',
					value: 'account',
				},
				{
					id: 2,
					class: 'xs4',
					name: 'Título',
					value: 'name',
				},
				{
					id: 3,
					class: 'xs6',
					icon: false,
					name: 'Descripción',
					value: 'description',
				},
			],
			createPlan: false,
			createPlanModal: false,
			dataSelected: {},
			dialogDelete: false,
			flagEdit: false,
			importPlan: false,
			importPlanModal: false,
			loading: false,
			loadPlan: false,
			loadPlanModal: false,
			rows: [],
			typeConfig: 0,
		};
	}

	export default {
		name: 'step-plan-accounts',
		components: {
			accountantTableTree,
			VueSixFour,
			createItemAccount,
			actionSidebar,
		},
		data,
		methods: {
			accountDelete,
			addAccount,
			assignPlan,
			balanceItemDelete,
			closeDialog,
			closeModal,
			createAccount,
			deleteAccount,
			editAccount,
			editMultipleItems,
			getFileUpdate,
			loadPreview,
			nextStep,
			openDialog,
			saveBalance,
			saveUploadPlan,
			setCreateData,
			setData,
			setEditData,
			setValuByProp,
			showBalanceColumn,
			showDialog,
			updateShowOptions,
		},
		created,
		props: {
			baseSixFour: {
				default: false,
				type: Boolean,
			},
			chargeValue: {
				default: false,
				type: Boolean,
			},
			countryCode: [String, Number],
			fileName: String,
			loadingAssign: {
				default: false,
				type: Boolean,
			},
			planAccounts: {
				default: () => [],
				type: Array,
			},
			ruc: [Number, String],
			showOptions: {
				default: false,
				type: Boolean,
			},
			text: String,
		},
		watch: {
			chargeValue,
			loadingAssign,
		},
	};
</script>

<style lang="scss" scoped>
	.step-accountant {
		margin: 0px auto;
		padding: 53px 10px;

		@media (min-width: 900px) {
			max-width: 848px;
		}

		&-option {
			background-color: color(white);
			border: 1px solid color(primary);
			border-radius: 3px;
			color: color(primary);
			font-family: font(open-semibold);
			font-size: size(small);
			height: 59px;
			padding: 0 20px;
			margin: 0px 10px;
			width: 214px;

			&.active {
				background-color: color(primary);
				box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.27);
				color: color(white);
				font-family: font(open-bold);
			}
		}

		&-column-switch {
			max-width: 35px;
		}

		&-column-label {
			padding-left: 11px;
		}

		&-label {
			color: color(paginationText);
			font-family: font(open-semibold);
			font-size: size(medium);
		}
	}

	.step-input-upload {
		align-items: center;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
	}

	.btn-upload {
		background-color: color(background-excel);
		border-radius: 3px;
		height: 30px;
		max-width: 33px;
		width: 100%;
	}

	.input-upload {
		max-width: calc(100% - 33px);
		width: 100%;
	}

	.dialog {
		background-color: color(white);
		border-radius: 11px;
		box-shadow: 0 2px 13px 0 rgba(0, 0, 0, 0.13);
		height: 510px !important;
		margin: 0px !important;
		padding: 39px 0px;
		position: relative;
		&-padding {
			padding: 39px 36px;
		}
	}

	.title-dialog {
		color: color(paginationText);
		font-family: font(open-bold);
		font-size: size(medium);
	}

	.carge-excel {
		background-color: #e3e3e3;
		height: 386px;
		width: 100%;
	}

	.btn-xls {
		border: 1px solid color(primary) !important;
		border-radius: 5px;
		color: color(primary);
		font-family: font(open-semibold);
		font-size: size(small10);
	}

	.btn-back {
		border-radius: 5px !important;
		font-family: font(open-bold);
		font-size: size(medium);
		height: 40px !important;
		width: 129px !important;
	}

	.btn-close {
		background-color: transparent !important;
		margin: 0px !important;

		span {
			font-family: font(open-bold);
			font-size: size(medium22);
			height: 14px;
			line-height: 9px;
			text-transform: lowercase !important;
		}
	}

	.modal-filter-footer {
		border-top: 1px solid #e0e0e0;
	}

	.modal-footer {
		background-color: color(white);
		bottom: 0px;
		left: 0px;
		padding: 30px 0px;
		position: absolute;
		right: 0px;
		width: 100%;
	}

	.accountant-table-tree {
		margin-bottom: 35px;
		margin-top: 35px;
		&-modal {
			height: calc(100% - 107px);
			margin-top: 32px;
			overflow-y: scroll;
		}
	}

	.title-step {
		color: color(primary);
		font-family: font(open-bold);
		font-size: size(small13);
	}

	.title-modal {
		font-size: size(medium);
		margin: 150px auto 0px;
		max-width: 400px;
	}

	.btn-link {
		text-decoration: none !important;
	}

	.btn-excel-active {
		background-color: color(primary) !important;
		color: color(white) !important;
	}

	.btn-balance {
		margin-left: auto !important;
	}

	.headline {
		color: color(paginationText);
		font-family: font(open-semibold);
		font-size: size(medium) !important;
		letter-spacing: normal !important;
		line-height: 1 !important;
		margin: auto;
		max-width: 340px;
		padding-top: 37px !important;
		text-align: center;
	}

	.subtext {
		color: color(grey-border);
		font-family: font(open-regular);
		font-size: size(small) !important;
		letter-spacing: normal !important;
		line-height: 1 !important;
		margin: auto;
		max-width: 340px;
		padding: 0px !important;
		text-align: center;
	}

	.btn-block {
		padding-bottom: 24px !important;
		padding-top: 28px !important;
	}
</style>
