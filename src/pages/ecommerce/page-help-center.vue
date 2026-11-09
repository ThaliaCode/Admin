<template>
	<div>
		<header-page
			:title="title"
			to-show
			:show-clean="false"
			:show-excel="false"
		>
			<v-flex xs6 text-xs-right class="btn-new-section">
				<v-btn
					small
					dark
					color="buttonCenter"
					class="btn-action ml-1"
					@click="openFormHelpCenter"
					v-if="openForm"
				>
					Nuevo +
				</v-btn>
			</v-flex>
		</header-page>
		<v-layout wrap>
			<v-flex :class="show ? 'md6 active px-5' : 'xs12'" px-4>
				<div class="background-table mt-4">
					<app-table
						name="table-help-center"
						:input-search="false"
						:columns="columns"
						:rows="rows"
						:filterColumns="false"
						:main-list="false"
						class="is-not-selectable no-main-list"
					>
						<template slot="rows" slot-scope="props">
							<td
								class="is-not-selectable"
								v-show="showRow(columns, 1)"
							>
								{{ props.row.orderNumber }}
							</td>
							<td v-show="showRow(columns, 2)">{{ props.row.sectionName }} </td>
							<td v-show="showRow(columns, 3)">{{ props.row.name }}</td>
							<td v-show="showRow(columns, 4)" class="help-actions">
								<v-switch
									hide-details
									slot="activator"
									class="switch-inline"
									color="success"
									v-model="props.row.flagActive"
									:disabled="!props.row.id"
									@change="toggleActive(props.row, props.index)"
								></v-switch>
								<button
									v-if="openForm"
									@click="openEditCenter(props.row)"
									class="table-icon"
								>
									<v-icon
										color="primary"
										size="19">
										edit
									</v-icon>
								</button>
								<button
									v-if="openForm"
									@click="confirmDelete(props.row)"
									class="table-icon ml-2"
									color="pink"
								>
									<v-icon
										color="pink"
										size="19">
										highlight_off
									</v-icon>
								</button>
							</td>
						</template>
					</app-table>
					<v-layout
						wrap justify-center mt-1
						v-if="show"
						class="content-buttons"
					>
						<v-flex xs2>
							<v-btn
								type="button"
								color="pink"
								class="btn-action"
								@click="cancelForm"
							>
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs2>
							<v-tooltip top>
								<v-btn
									class="btn-action ml-3"
									color="success"
									:disabled="disabledSave"
									slot="activator"
									type="button"
									@click="saveCenter"
								>
									Guardar todo
								</v-btn>
								<span>Se guardará todo lo que está en el listado. Lo que se encuentre en el formulario no se guardará</span>
							</v-tooltip>
						</v-flex>
					</v-layout>
					<v-dialog
						v-model="dialogCancel"
						persistent
						max-width="482"
					>
						<v-card class="modal-confirm-delete">
							<v-card-text>{{ dialogMessage }}</v-card-text>
							<v-card-actions>
								<v-layout row wrap>
									<v-flex xs6 pr-2 text-xs-right>
										<v-btn
											color="pink"
											class="btn-action white--text"
											@click="cancelModal"
										>
											No
										</v-btn>
									</v-flex>
									<v-flex xs6 pl-2 text-xs-left>
										<v-btn
											@click.native="deleteHelpCenter(itemId)"
											color="success"
											class="btn-action white--text"
										>
											Si
										</v-btn>
									</v-flex>
								</v-layout>
							</v-card-actions>
						</v-card>
					</v-dialog>
				</div>
			</v-flex>
			<transition md6 name="fade-left" mode="out-in">
				<v-flex md6 :class="{ 'active': show }" v-if="show">
					<form-center-help
						:id="itemId"
						:help-section="currentHelpSection"
						:loading="loading"
						:sections="sections"
						@add-section="addHelpSection"
						@cancel-modal="cancelForm"
						@save-help-center="saveProduct"
					/>
				</v-flex>
			</transition>
		</v-layout>
	</div>
</template>

<script>
	import appTable from '@/components/shared/table/app-table';
	import formCenterHelp from '@/components/ecommerce/form-center-help';
	import headerPage from '@/components/shared/header-page';

	function created() {
		this.getListCenter();
		this.loadCommerceData();
	}

	function addHelpSection(section) {
		if (section.id) {
			this.updateRows(section);
		} else {
			this.addRows(section);
		}
		this.itemId = null;
	}

	function addRows(section) {
		this.rows = [].concat(section, this.rows);
	}

	function addSectionNameRowsHelp() {
		this.rows = this.rows.map((r) => {
			const section = this.sections.find(s => s.id === r.typeHelperCenter);
			const newR = { ...r };
			newR.sectionName = section ? section.name : '';
			return newR;
		});
	}

	function buildHelperCenter() {
		const helperItems = this.rows.map((h) => {
			const newHelp = {
				description: h.description,
				name: h.name,
				orderNumber: h.orderNumber,
				subTitle: h.subTitle,
				type: h.type,
				typeHelperCenter: h.typeHelperCenter,
				urlImage: h.urlImage,
			};
			if (h.id) {
				newHelp.id = h.id;
			}
			return newHelp;
		});
		return helperItems;
	}

	async function cancelForm() {
		this.show = false;
		this.openForm = true;
		this.hideButtons = true;
		this.itemId = null;
		await this.getListCenter();
		this.addSectionNameRowsHelp();
	}

	function cancelModal() {
		this.dialogCancel = false;
		this.featureName = '';
	}

	function confirmDelete({ id, name }) {
		this.dialogMessage = ` ¿Desea eliminar '${name}' de la lista de centro de ayuda? `;
		this.itemId = id;
		this.featureName = name;
		this.dialogCancel = true;
	}

	function deleteHelpCenter(deleteId) {
		this.itemId = null;
		this.rows = this.rows.reduce((acc, item) => {
			if (item.id === deleteId) {
				return acc;
			}
			return acc.concat(item);
		}, []);
		this.saveCenter();
		this.cancelModal();
	}

	async function getListCenter() {
		const params = { commerceId: this.commerceId };
		({ data: this.rows } = await this.$httpSales.get('commerce-information', { params }));
		this.loadSections();
	}

	async function loadCommerceData() {
		({ data: this.commerce } = await this.$httpSales.get(
			`com-ecommerce-companies/${this.commerceId}`));
		this.title = `${this.commerce.name} - Centro de Ayuda`;
	}

	async function loadSections() {
		({ data: this.sections } = await this.$httpSales.get('group/typeHelperCenter/table'));
		this.addSectionNameRowsHelp();
	}

	async function openEditCenter(row) {
		this.itemId = row.id;
		this.currentHelpSection = { ...row };
		this.show = true;
		this.hideButtons = false;
	}

	function openFormHelpCenter() {
		this.show = true;
		this.openForm = false;
		this.hideButtons = false;
		this.currentHelpSection = {};
	}

	async function saveProduct(helpCenterData) {
		this.loading = true;
		const body = {
			settings: {
				codeTaxes: this.commerce.settings.codeTaxes,
				salPriceListId: this.commerce.settings.salPriceListId,
				limitHome: this.commerce.settings.limitHome,
				limitShownHome: this.commerce.settings.limitShownHome,
				template: this.commerce.settings.template,
				theme: this.commerce.settings.theme,
				defaultWarehouse: this.commerce.settings.defaultWarehouse,
				enablePushNotification: this.commerce.enablePushNotification,
			},
			itemId: this.commerce.itemId,
			address: this.commerce.address,
			bankAccountsRelated: this.commerce.bankAccountsRelated,
			colorCode: this.commerce.colorCode,
			email: this.commerce.email,
			favicon: this.commerce.favicon,
			phone: this.commerce.phone,
			socialNetworks: this.commerce.socialNetworks,
			templateCode: this.commerce.templateCode,
			templateId: this.commerce.templateId,
			warehousesRelated: this.commerce.warehousesRelated,
			wayPaymentRelated: this.commerce.wayPaymentRelated,
			whatsappNumber: this.commerce.whatsappNumber,
			urlQr: this.commerce.urlQr,
			urlImage: this.commerce.urlImage,
			scriptChat: this.commerce.scriptChat,
			helperCenter: this.buildHelperCenter(helpCenterData),
			wayPayment: this.commerce.wayPayment,
			deliveryType: this.commerce.deliveryType,
			name: this.commerce.name,
		};
		try {
			await this.$httpSales.patch(`com-ecommerce-companies/${this.commerceId}`, body);
			this.showNotification('El centro de ayuda del comercio ha sido actualizado.');
			this.goTo('commerce');
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		} finally {
			this.loading = false;
		}
	}

	async function toggleActive(row, index) {
		const { id, flagActive } = row;
		this.$set(this.rows[index], 'flagActive', flagActive);
		const body = { flagActive };
		await this.$httpSales.patch(`commerce-information/${id}/active`, body);
	}

	function updateRows(section) {
		const index = this.rows.findIndex(r => r.id === section.id);
		this.$set(this.rows, index, { ...section });
	}

	function disabledSave() {
		return this.loading || this.rowsLength === this.rows.length;
	}

	async function saveCenter() {
		this.loading = true;
		const body = {
			settings: {
				codeTaxes: this.commerce.settings.codeTaxes,
				salPriceListId: this.commerce.settings.salPriceListId,
				limitHome: this.commerce.settings.limitHome,
				limitShownHome: this.commerce.settings.limitShownHome,
				template: this.commerce.settings.template,
				theme: this.commerce.settings.theme,
				defaultWarehouse: this.commerce.settings.defaultWarehouse,
				enablePushNotification: this.commerce.enablePushNotification,
			},
			itemId: this.commerce.itemId,
			address: this.commerce.address,
			bankAccountsRelated: this.commerce.bankAccountsRelated,
			colorCode: this.commerce.colorCode,
			email: this.commerce.email,
			favicon: this.commerce.favicon,
			phone: this.commerce.phone,
			socialNetworks: this.commerce.socialNetworks,
			templateCode: this.commerce.templateCode,
			templateId: this.commerce.templateId,
			warehousesRelated: this.commerce.warehousesRelated,
			wayPaymentRelated: this.commerce.wayPaymentRelated,
			whatsappNumber: this.commerce.whatsappNumber,
			urlQr: this.commerce.urlQr,
			urlImage: this.commerce.urlImage,
			scriptChat: this.commerce.scriptChat,
			helperCenter: this.buildHelperCenter(),
			wayPayment: this.commerce.wayPayment,
			deliveryType: this.commerce.deliveryType,
			name: this.commerce.name,
		};
		try {
			await this.$httpSales.patch(`com-ecommerce-companies/${this.commerceId}`, body);
			this.showNotification('El centro de ayuda del comercio ha sido actualizado.');
			this.goTo('commerce');
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		} finally {
			this.loading = false;
		}
	}

	function data() {
		return {
			columns: [
				{ id: 1, name: 'Orden', value: 'order', visible: true, checked: true },
				{ id: 2, name: 'Sección', value: 'typeHelperCenter', visible: true, checked: true },
				{ id: 3, name: 'Nombre', value: 'name', visible: true, checked: true },
				{ id: 4, name: 'Acciones', value: 'actions', visible: true, checked: true, flagVisible: true },
			],
			commerce: {},
			currentHelpSection: {},
			dialogCancel: false,
			dialogMessage: '',
			featureName: '',
			hideButtons: true,
			itemId: null,
			loading: false,
			openForm: true,
			rows: [],
			sections: [],
			show: false,
			title: '',
		};
	}

	export default {
		name: 'page-help-center',
		components: {
			appTable,
			formCenterHelp,
			headerPage,
		},
		created,
		computed: {
			disabledSave,
		},
		data,
		methods: {
			addHelpSection,
			addRows,
			addSectionNameRowsHelp,
			buildHelperCenter,
			cancelForm,
			cancelModal,
			confirmDelete,
			deleteHelpCenter,
			getListCenter,
			loadCommerceData,
			loadSections,
			openEditCenter,
			openFormHelpCenter,
			saveProduct,
			toggleActive,
			updateRows,
			saveCenter,
		},
		props: {
			commerceId: [Number, String],
		},
	};
</script>

<style lang="scss" scoped>
.content-buttons {
	background-color: map-get($colors, white);
	bottom: 0;
	display: flex;
	justify-content: center;
	left: 0px;
	padding: 12px 0;
	position: fixed;
	width: calc(50% - 24px);
}

.navigation-drawer--open + .container-view {
	.content-buttons {
		left: 200px;
		width: calc(50% - 101px);
	}
}

.navigation-drawer--mini-variant + .container-view,
.navigation-drawer--mini-variant.navigation-drawer--open + .container-view {
	.content-buttons {
		left: 48px;
		width: calc(50% - 24px);
	}
}

.navigation-drawer--is-mobile + .container-view {
	.content-buttons {
		left: 0px;
		width: 50%;
	}
}

.alert-tag {
	background-color: color(maki-white);
	border: 3px dashed color(background-sidebar);
	border-radius: 5px;
	font-family: font(open-semibold);
	font-size: size(small13);
	padding: 5px 10px;
}
</style>