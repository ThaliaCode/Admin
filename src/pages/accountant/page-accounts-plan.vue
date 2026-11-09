<template>
	<div>
		<header-page
			caption-navigation="Contabilidad"
			list-subsidiaries
			:subsidiaries="subsidiaries"
			:subsidiary-id="subsidiary.id"
			title="PLAN DE CUENTAS"
			@selected-subsidiary="selectedSubsidiary"
		></header-page>
		<v-stepper v-model="step" non-linear class="accountant-steps">
			<v-stepper-header class="stepper__header-start stepper__header-height">
				<div class="stepper-header-container stepper__header stepper__header-start">
					<v-stepper-step
						class="stepper__step--active-border"
						editable
						:step="1"
					>
						PLAN DE CUENTAS
					</v-stepper-step>
					<v-stepper-step
						class="stepper__step--active-border"
						editable
						:step="2"
					>
						PROCESOS A CONTABILIZAR
					</v-stepper-step>
				</div>
			</v-stepper-header>
			<v-stepper-items>
				<v-stepper-content step="1">
					<v-layout row wrap justify-center pb-5>
						<v-flex xs10 pt-5>
							<template v-if="loading">
								<div class="title-step text-xs-center title-modal">
									Espera un momento para ver el plan de cuentas.
								</div>
							</template>
							<template v-else>
								<accountant-table-tree
									:columns="columns"
									:dialog="dialog"
									:rows="accountsPlanRows"
									@add-account="addAccount"
									@delete-account="deleteAccount"
									@edit-account="editAccount"
									@get-data="setData"
									@row-expanded="rowExpanded"
									@save-balance="saveBalance"
								></accountant-table-tree>
							</template>
						</v-flex>
						<section class="modal-filter-footer">
							<v-flex text-xs-center>
								<v-btn
									class="btn-auto btn-back ml-3 my-0"
									color="success"
									type="button"
									@click="editMultipleItems"
								>
									<span class="primary--text">
										<template v-if="balanceData.length > 0">Guardar</template>
										<template v-else>Siguiente</template>
									</span>
								</v-btn>
							</v-flex>
						</section>
					</v-layout>
				</v-stepper-content>
				<v-stepper-content step="2">
					<v-layout row wrap justify-center>
						<v-flex xs10 pt-3>
							<template v-if="!listProcessAccounted || listProcessAccounted.length === 0">
								<div class="title-step text-xs-center title-modal">
									No se ha encontrado información.
								</div>
							</template>
							<template v-else>
								<step-process-accounted
									:actions="false"
									:dialog="dialog"
									:label-switch="labelSwitch"
									:list-process="listProcessAccounted"
									:loading="loadingAssign"
								></step-process-accounted>
							</template>
						</v-flex>
						<section class="modal-filter-footer">
							<v-flex text-xs-center>
								<v-btn
									class="btn-auto btn-back ma-0"
									color="primary"
									:disabled="loadingAssign"
									outline
									type="button"
									@click="step = 1"
								>
									Atrás
								</v-btn>
								<v-btn
									class="btn-auto btn-back ml-3 my-0"
									color="success"
									type="button"
									@click="saveProcess"
								>
									<span class="primary--text">Guardar</span>
								</v-btn>
							</v-flex>
						</section>
					</v-layout>
				</v-stepper-content>
			</v-stepper-items>
		</v-stepper>
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
								@click.native="accountDelete"
							>
								Aceptar
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
	import accountantTableTree from '@/components/accountant/accountant-table-tree';
	import actionSidebar from '@/components/shared/action-sidebar';
	import createItemAccount from '@/components/accountant/create-item-account';
	import stepProcessAccounted from '@/components/accountant/step-process-accounted';

	function created() {
		this.loadSubsidiaries();
	}

	async function accountDelete() {
		try {
			await this.$httpQuipu.delete(`com-accounting-accounts/${this.dataSelected.id}`);
			this.closeDialog('dialogDelete');
			this.showNotification('Se eliminó correctamente');
			const idxDataSelected = this.fatherDataSelected.details.findIndex(fds => fds.id ===
				this.dataSelected.id);
			if (idxDataSelected > -1) {
				this.fatherDataSelected.details.splice(idxDataSelected, 1);
			}
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

	function balanceItemDelete(code) {
		const indexBalance = this.balanceData.findIndex(bd => bd.code === code);
		if (indexBalance > -1) {
			this.balanceData.splice(indexBalance, 1);
		}
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
		const { account, accumulated, balance, code, description, name } = item;
		const body = { accumulated, balance, name, description };
		let message = '';
		if (isBalance) {
			body.account = account;
			body.code = code;
			message = 'El balance ha sido agregado correctamente.';
		} else if (this.flagEdit) {
			// const aacValid = accountingAccountCode ?
			// 	(accountingAccountCode.length - 1) === accountingAccountCode.lastIndexOf('.') :
			// 	false;
			// const aacItem = aacValid ? `${accountingAccountCode}${account}` :
			// 	`${accountingAccountCode}.${account}`;
			// body.account = accountingAccountCode ? aacItem : this.dataSelected.account;
			body.account = account;
			body.accumulated = this.dataSelected.accumulated || 0;
			body.balance = this.dataSelected.balance || 0;
			// body.code = `${this.dataSelected.accountingAccountCode}${account.replace(/\./g, '')}`;
			body.code = account.replace(/\./g, '');
			message = 'La cuenta ha sido editada correctamente.';
		} else {
			const aacValid = (this.dataSelected.account.length - 1) === this.dataSelected.account.lastIndexOf('.');
			const aacItem = aacValid ? `${this.dataSelected.account}${account}` :
				`${this.dataSelected.account}.${account}`;
			body.account = aacItem;
			body.code = `${this.dataSelected.code}${account.replace(/\./g, '')}`;
			message = 'La cuenta ha sido creada correctamente.';
		}
		const urlCode = code || this.dataSelected.code;
		const url = this.flagEdit ? `accounting-accounts/${this.subsidiary.ruc}/${urlCode}/fb` :
			`accounting-accounts/${this.subsidiary.ruc}/${this.dataSelected.accountingPlanId}/fb`;
		const method = this.flagEdit ? 'patch' : 'post';
		try {
			const { data: bodyCreated } = await this.$httpQuipu[method](url, body);
			this.showNotification(message);
			if (isBalance) {
				this.balanceItemDelete(code);
			}
			this.closeModal();
			if (this.flagEdit) {
				const ele = this.getElement(this.accountsPlanRows, this.dataSelected);
				this.$set(ele, 'account', body.account);
				this.$set(ele, 'description', body.description);
				this.$set(ele, 'name', body.name);
			} else {
				this.bodyDataCreated = bodyCreated;
				const ele = this.getElement(this.accountsPlanRows, this.dataSelected);
				this.$set(ele, 'flagParent', 1);
				if (ele.details) {
					ele.details.push(this.bodyDataCreated);
				} else {
					this.$set(ele, 'details', [this.bodyDataCreated]);
				}
				this.$set(ele, 'open', true);
			}
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			} else if (err.status === 400) {
				if (err.data.message === 'ACCOUNTING_ACCOUNT_EXIST') {
					this.showGenericError('La cuenta ya existe.');
				}
			}
		}
	}

	function deleteAccount(row) {
		this.dataSelected = { ...row };
		const fatherSelected = { code: row.accountingAccountCode };
		this.fatherDataSelected = this.getElement(this.accountsPlanRows, fatherSelected, 'code');
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
		if (this.balanceData.length > 0) {
			const body = this.balanceData.map(bd => ({
				accumulated: bd.accumulated,
				balance: bd.balance,
				id: bd.id,
			}));
			try {
				await this.$httpQuipu.patch(`accounting-accounts/${this.subsidiary.ruc}/fb`, body);
				this.showNotification('El balance de los registros ha sido actualizado correctamente.');
				this.loadAccountsPlan();
				this.step = 2;
			} catch (err) {
				if (err.status === 500) {
					this.showGenericError();
				}
			}
		} else {
			this.step = 2;
		}
	}

	async function loadAccountsPlan() {
		this.loading = true;
		this.typeConfig = this.subsidiary.configIntegrations.accountingPlan ?
			this.subsidiary.configIntegrations.accountingPlan.typeConfig : 1;
		this.countryCode = this.$userInfo.company.country.countryCode;
		const params = { typeConfig: this.typeConfig, tree: true };
		try {
			({ data: this.accountsPlanRows } = await this.$httpQuipu.get(
				`accounting-accounts/${this.countryCode}/${this.subsidiary.ruc}/fb`, { params }));
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			} else if (err.status === 400) {
				if (err.data.message === 'SUBSIDIARY_NOT_FOUND') {
					this.accountsPlanRows = [];
					this.showGenericError('No se encuentra un plan de cuentas para la sucursal seleccionada');
				}
			}
		} finally {
			this.loading = false;
		}
	}

	async function loadProcess() {
		try {
			const { data: process } = await this.$httpSales.get(
				`accounting-configuration/${this.subsidiary.ruc}/fb`);
			this.listProcessAccounted = process.data;
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	async function loadSubsidiaries() {
		const params = { flagIntegrations: true };
		try {
			({ data: this.subsidiaries } = await this.$httpSales.get('subsidiaries', { params }));
			this.subsidiaries = this.subsidiaries.filter(s => s.configIntegrations);
			if (this.subsidiaries.length > 0) {
				const validSubsidiary = this.subsidiaryId || this.$userInfo.comSubsidiariesId;
				this.subsidiary = this.subsidiaries.find(s => s.id === validSubsidiary) ||
					this.subsidiaries[0];
				this.loadAccountsPlan();
				this.loadProcess();
			} else {
				this.dialog = {
					open: true,
					route: 'accountant-configuration',
				};
			}
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	async function rowExpanded(item) {
		const { code, status } = item;
		const params = { typeConfig: this.typeConfig, tree: true, accountingAccountCode: code };
		if (status === 0) {
			try {
				const { data: newDetails } = await this.$httpQuipu.get(
					`accounting-accounts/${this.countryCode}/${this.subsidiary.ruc}/fb`,
					{ params });
				this.$set(item, 'details', newDetails);
			} catch (err) {
				if (err.status === 500) {
					this.showGenericError();
				}
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

	async function saveProcess() {
		const accountingConfiguration = {
			data: [...this.listProcessAccounted],
			flagConfig: true,
		};
		const body = { accountingConfiguration };
		try {
			await this.$httpSales.patch(`accounting-integrations/${this.subsidiary.id}/fb`, body);
			this.showNotification(
				'La configuración de los procesos a contabilizar ha sido guardada correctamente.',
			);
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	function selectedSubsidiary({ value }) {
		this.subsidiary = { ...value };
		this.loadAccountsPlan();
		this.loadProcess();
	}

	function setData({ item, info }) {
		const { model, value } = info;
		this.$set(item, model, Number(value));
		this.$set(item, 'accumulated', Number(value));
		const itemToAccum = this.accountsPlanRows.find(r => r.code === item.accountingAccountCode);
		const accum = itemToAccum.details.reduce((a, ita) => a + (ita.balance || 0), 0);
		this.$set(itemToAccum, 'accumulated', accum);
		const indexItem = this.balanceData.findIndex(bd => bd.code === item.code);
		if (indexItem > -1) {
			this.balanceData[indexItem] = { ...item };
		} else {
			this.balanceData.push({ ...item });
		}
	}

	function setEditData({ account, description, name }) {
		const row = this.dataSelected.accountingAccountCode ?
			this.accountsPlanRows.find(r => r.code === this.dataSelected.accountingAccountCode) :
			this.accountsPlanRows.find(r => r.id === this.dataSelected.id);
		const newRow = this.dataSelected.accountingAccountCode ? row.details.find(d =>
			d.id === this.dataSelected.id) : row;
		this.$set(newRow, 'account', account);
		this.$set(newRow, 'description', description);
		this.$set(newRow, 'name', name);
	}

	function getElement(elements, target, prop = 'id') {
		let o;
		elements.some(function iter(a) {
			if (a[prop] === target[prop]) {
				o = a;
				return true;
			}
			return Array.isArray(a.details) && a.details.some(iter);
		});
		return o;
	}

	function data() {
		return {
			accountsPlanRows: [],
			action: {
				active: false,
				open: false,
				code: '',
				title: '',
				width: 0,
			},
			balanceData: [],
			bodyDataCreated: {},
			columns: [
				{
					id: 1,
					class: 'xs3',
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
					class: 'xs3',
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
			countryCode: null,
			createPlan: false,
			dataSelected: {},
			dialog: {
				open: false,
				route: '',
			},
			dialogDelete: false,
			fatherDataSelected: {},
			flagEdit: false,
			indexes: [],
			labelSwitch: 'Manual',
			loading: false,
			loadingAssign: false,
			listProcessAccounted: [],
			modelAccount: null,
			modelDescription: null,
			modelName: null,
			rowToCreate: null,
			step: 1,
			subsidiaries: [],
			subsidiary: {},
			elementGetted: null,
		};
	}

	export default {
		name: 'page-accounts-plan',
		components: {
			accountantTableTree,
			actionSidebar,
			createItemAccount,
			stepProcessAccounted,
		},
		created,
		data,
		methods: {
			accountDelete,
			addAccount,
			balanceItemDelete,
			closeDialog,
			closeModal,
			createAccount,
			deleteAccount,
			editAccount,
			editMultipleItems,
			getElement,
			loadAccountsPlan,
			loadProcess,
			loadSubsidiaries,
			rowExpanded,
			saveBalance,
			saveProcess,
			selectedSubsidiary,
			setData,
			setEditData,
		},
		props: {
			subsidiaryId: [Number, String],
		},
	};
</script>

<style lang="scss" scoped>
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

	.btn-back {
		border-radius: 5px !important;
		font-family: font(open-bold);
		font-size: size(medium);
		height: 40px !important;
		width: 129px !important;
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
</style>