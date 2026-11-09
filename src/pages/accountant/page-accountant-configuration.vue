<template>
	<div class="page-accountant-configuration">
		<header-page
			caption-navigation="Contabilidad"
			title="CONFIGURACIÓN"
		></header-page>
		<v-stepper v-model="step" non-linear class="accountant-steps">
			<v-stepper-header>
				<div class="stepper-header-container stepper__header justify-center">
					<v-stepper-step :step="1" :complete="step > 1">INTRODUCCIÓN</v-stepper-step>
					<v-divider></v-divider>
					<v-stepper-step :step="2" :complete="step > 2">PLAN DE CUENTAS</v-stepper-step>
				</div>
			</v-stepper-header>
			<v-stepper-items>
				<v-stepper-content step="1">
					<step-question
						:open-dialog="openDialog"
						:subsidiaries="subsidiaries"
						:subsidiary-id="subsidiary.id"
						@close-dialog="closeDialog"
						@following-question="followingQuestion"
						@selected-subsidiary="filterSubsidiary"
					></step-question>
				</v-stepper-content>
				<v-stepper-content step="2">
					<step-plan-accounts
						:charge-value="planAccounts.switch"
						:country-code="countryCode"
						:file-name="planAccounts.file"
						:loading-assign="loadingAssign"
						:plan-accounts="planAccounts.rows"
						:ruc="subsidiary.ruc"
						:show-options="showOptions"
						:text="planAccounts.file"
						@back-step="backStep"
						@file-charged="fileCharged"
						@import-plan="importPlan"
						@next-step="nextStep"
						@row-expanded="rowExpanded"
						@selected-subsidiary="filterSubsidiary"
						@switch-charge="switchCharge"
						@update-show-options="updateShowOptions"
					></step-plan-accounts>
				</v-stepper-content>
			</v-stepper-items>
		</v-stepper>
	</div>
</template>

<script>
	import headerPage from '@/components/shared/header-page';
	import stepQuestion from '@/components/accountant/step-question';
	import stepPlanAccounts from '@/components/accountant/step-plan-accounts';
	
	function created() {
		this.countryCode = this.$userInfo && this.$userInfo.company &&
			this.$userInfo.company.country ? this.$userInfo.company.country.countryCode : null;
		this.loadSubsidiaries();
	}

	function backStep() {
		this.step -= 1;
	}

	function closeDialog() {
		this.openDialog = false;
	}

	async function fileCharged(base64, name) {
		const body = { base64 };
		try {
			await this.$httpSales.post(`accounting-accounts/${this.subsidiary.ruc}/upload`, body);
			this.showNotification('El archivo ha sido cargado correctamente.');
			this.planAccounts.file = name;
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	function filterSubsidiary({ flagConfig, value }) {
		this.showOptions = !flagConfig;
		this.subsidiary = { ...value };
	}

	async function followingQuestion() {
		try {
			const response = await this.$httpSales.get(`accounting-integrations/${this.subsidiary.id}/fb`);
			this.flagIntegration = response.data.flagIntegration;
			if (this.flagIntegration) {
				this.step = 2;
			} else {
				this.openDialog = true;
			}
		} catch (error) {
			this.showGenericError();
		}
	}

	async function getPlanBySubsidiary(typeConfig) {
		const params = { typeConfig, tree: true };
		try {
			({ data: this.planAccounts.rows } = await this.$httpQuipu.get(
				`accounting-accounts/${this.countryCode}/${this.subsidiary.ruc}/fb`, { params }));
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			} else if (err.status === 400) {
				if (err.data.message === 'SUBSIDIARY_NOT_FOUND') {
					this.showGenericError('No se ha importado ningún plan a la empresa.');
				}
			}
		} finally {
			this.loadingAssign = false;
		}
	}

	async function importPlan(typeConfig) {
		this.loadingAssign = true;
		this.typeConfig = typeConfig;
		try {
			await this.$httpQuipu.post(`com-accounting-accounts/${this.subsidiary.ruc}/import`);
			this.showNotification(
				`El plan ha sido importado correctamente a la empresa ${this.subsidiary.rzSocial}`,
			);
			this.showOptions = false;
			this.getPlanBySubsidiary(this.typeConfig);
		} catch (err) {
			this.loadingAssign = false;
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	async function loadSubsidiaries() {
		try {
			({ data: this.subsidiaries } = await this.$httpSales.get('subsidiaries'));
			this.subsidiaries = this.subsidiaries.filter(s => !s.configIntegrations ||
				!s.configIntegrations.accountingPlan ||
				!s.configIntegrations.accountingPlan.flagConfig);
		} catch (error) {
			this.showGenericError();
		}
	}

	function nextStep(finish) {
		if (finish) {
			this.savePlan();
		} else {
			this.step += 1;
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

	async function savePlan() {
		const accountingPlan = {
			flagConfig: true,
			typeConfig: this.typeConfig,
			uploadPlan: this.typeConfig === 2,
		};
		const body = { accountingPlan };
		try {
			await this.$httpSales.patch(`accounting-integrations/${this.subsidiary.id}/fb`, body);
			this.showNotification(
				'La configuración del plan de cuentas ha sido guardado correctamente.',
			);
			this.goTo('accounts-plan', { params: { subsidiaryId: this.subsidiary.id } });
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	function switchCharge(value) {
		this.planAccounts.switch = value;
	}

	function updateShowOptions() {
		this.showOptions = true;
	}

	function data() {
		return {
			openDialog: null,
			flagIntegration: null,
			countryCode: '',
			labelSwitch: 'Manual',
			loadingAssign: false,
			planAccounts: {
				file: '',
				rows: [],
				switch: false,
			},
			params: {
				ruc: '',
			},
			showOptions: false,
			step: 0,
			subsidiaries: [],
			subsidiary: {},
			typeConfig: null,
		};
	}
	export default {
		name: 'page-accountant-configuration',
		components: {
			headerPage,
			stepPlanAccounts,
			stepQuestion,
		},
		created,
		data,
		methods: {
			backStep,
			closeDialog,
			filterSubsidiary,
			fileCharged,
			followingQuestion,
			getPlanBySubsidiary,
			importPlan,
			loadSubsidiaries,
			nextStep,
			rowExpanded,
			savePlan,
			switchCharge,
			updateShowOptions,
		},
	};
</script>