<template>
	<div class="page-commerce-ecommerce-table">
		<header-page
			:title="$route.meta.title"
			btn-header-text="Ver Dashboard"
			btn-header-show
			btn-header-link="commerce"
		>
		</header-page>
		<app-actions
			:resource-uri="$route.name"
			:value-disabled="valueDisabled"
			@run-action="runAction"
		/>
		<v-layout row wrap justify-end my-3 pr-5 v-if="!isMibodega">
			<v-flex xs1>
				<v-btn
					type="button"
					color="primary"
					class="btn-action btn-action-block"
					@click="openNewCommerceModal"
				>
					Nuevo comercio
				</v-btn>
			</v-flex>
		</v-layout>
		<v-layout wrap pt-4 px-4>
			<v-flex xs2 pr-3>
				<v-select
					class="filter-select shadow-inset mt-3"
					item-text="name"
					item-value="value"
					label="Estados"
					v-model="flagActiveParams"
					:items="flags"
				></v-select>
			</v-flex>
			<v-flex xs2 pr-3>
				<v-select
					class="filter-select shadow-inset mt-3"
					item-text="name"
					item-value="id"
					label="Rubros"
					v-model="params.itemId"
					:items="items"
				></v-select>
			</v-flex>
			<v-flex xs1 mr-3 pt-3>
				<v-btn
					class="btn-action white--text"
					color="success"
					@click="listCommerce(1)"
				>
					Filtrar
				</v-btn>
			</v-flex>
			<v-flex xs1 pt-3>
				<v-btn class="btn-action white--text" color="error" @click="clearData">
					Limpiar
				</v-btn>
			</v-flex>
		</v-layout>
		<div class="mt-5">
			<app-table
				name="commerce-list"
				:check-all="checkAll"
				:columns="columns"
				:current-page="currentPage"
				:input-search="false"
				:last-page="lastPage"
				:rows="rows"
				selectable
				@on-page="onPage"
				@on-selected-all="selectedAll"
				@row-is-selected="rowIsSelected"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)">{{ props.row.name }}</td>
					<td v-show="showRow(columns, 2)">
						<a
							v-if="props.row.urlDomain"
							:href="props.row.urlDomain"
							target="_blank"
							class="url-domain"
						>
							<v-tooltip
								top
								v-if="props.row.urlDomain && props.row.urlDomain.length > 20"
							>
								<span slot="activator">{{
									props.row.urlDomain | limitTo(20)
								}}</span>
								<span>{{ props.row.urlDomain }}</span>
							</v-tooltip>
							<span v-else>{{ props.row.urlDomain }}</span>
						</a>
					</td>
					<td v-show="showRow(columns, 3)">
						<div class="layout justify-space-around">
							<a
								:href="
									props.row.settings
										? props.row.settings.appleStoreLink || null
										: null
								"
								class="mr-2"
								v-if="showLinkAppStore(props.row)"
							>
								<img
									src="/static/img/app-store.svg"
									alt="app-store"
									height="16"
								/>
							</a>
							<img
								src="/static/img/app-store-disabled.svg"
								alt="app-store"
								height="16"
								class="mr-2"
								v-else
							/>
							<a
								:href="
									props.row.settings
										? props.row.settings.playStoreLink || null
										: null
								"
								v-if="showLinkGooglePlay(props.row)"
							>
								<img
									src="/static/img/google-play.png"
									alt="google-play"
									height="16"
								/>
							</a>
							<img
								src="/static/img/google-play-disabled.svg"
								alt="google-play"
								height="16"
								v-else
							/>
						</div>
					</td>
					<td v-show="showRow(columns, 4)">
						<v-layout py-2>
							<v-flex xs9 class="text">
								<v-tooltip
									top
									v-if="isEmail(props.row) && isEmail(props.row).length > 15"
								>
									<span slot="activator">{{
										isEmail(props.row) | limitTo(15)
									}}</span>
									<span>{{ isEmail(props.row) }}</span>
								</v-tooltip>
								<span v-else>{{ isEmail(props.row) }}</span>
							</v-flex>
							<v-flex xs3 text-xs-right>
								<app-tooltip-button
									v-if="disabledEmail(props.row)"
									img="/static/img/contrasena.svg"
									height="20"
									text="Cambiar contraseña"
									@click-icon="openDialogPassword(props.row)"
								></app-tooltip-button>
							</v-flex>
						</v-layout>
					</td>
					<td v-show="showRow(columns, 5)">
						<div class="wrapper-text-loader" v-if="props.row.loadingLogo">
							<span>Cargando</span>
							<div class="container-loader">
								<div class="mb-0 loader"></div>
							</div>
						</div>
						<div v-else>
							<v-layout v-if="props.row.urlImage" pa-2>
								<v-flex xs10 text-xs-center>
									<img
										v-if="props.row.urlImage"
										:src="props.row.urlImage"
										:alt="props.row.name"
										height="21"
									/>
								</v-flex>
								<v-flex xs2>
									<label
										:ref="`label-table-logo-${props.row.id}`"
										:for="`upload-table-logo-${props.row.id}`"
									>
										<vue-six-four
											:id="`upload-table-logo-${props.row.id}`"
											hidden
											@vue-six-four="getFile($event)"
										/>
										<v-tooltip top>
											<button
												slot="activator"
												@click.stop="
													showDialog(
														`label-table-logo-${props.row.id}`,
														props.row.id,
														'loadingLogo'
													)
												"
											>
												<img src="/static/img/change-image.svg" alt="Cambiar" />
											</button>
											<span>Cambiar</span>
										</v-tooltip>
									</label>
								</v-flex>
							</v-layout>
							<div v-else>
								<label
									:ref="`label-table-btn-logo-${props.row.id}`"
									:for="`upload-table-btn-logo-${props.row.id}`"
								>
									<vue-six-four
										:id="`upload-table-btn-logo-${props.row.id}`"
										hidden
										@vue-six-four="getFile($event)"
									/>
									<button
										class="btn-upload"
										@click.stop="
											showDialog(
												`label-table-btn-logo-${props.row.id}`,
												props.row.id,
												'loadingLogo'
											)
										"
									>
										SUBIR
									</button>
								</label>
							</div>
						</div>
					</td>
					<td
						v-show="showRow(columns, 6)"
						class="td-action layout justify-space-around pt-2 pb-1"
					>
						<app-tooltip-button
							:disabled="!props.row.fairCommerce.length > 0"
							img="/static/img/fair-table.svg"
							:text="textFair(props.row)"
							@click-icon="openDialogFair(props.row)"
						/>
						<app-tooltip-button
							text="Configuración General"
							img="/static/icon/config-general.svg"
							height="20"
							@click-icon="edit('configuration', props.row)"
						/>
						<app-tooltip-button
							img="/static/icon/config-mobile.svg"
							text="Configuración Móbile"
							height="20"
							@click-icon="edit('page-configuration-mobile', props.row)"
						/>
						<app-tooltip-button
							img="/static/icon/config-desktop.svg"
							text="Configuración Desktop"
							height="20"
							@click-icon="edit('page-configuration-desktop', props.row)"
						/>
						<app-tooltip-button
							height="20"
							img="/static/img/menu.svg"
							text="Categorías"
							@click-icon="goToCategory(props.row)"
						/>
						<app-tooltip-button
							img="/static/img/received.svg"
							text="Ver Productos"
							height="20"
							@click-icon="goToMasterProduct(props.row)"
						/>
						<app-tooltip-button
							img="/static/img/informacion.svg"
							text="Centro de Ayuda"
							height="20"
							@click-icon="
								goTo('page-help-center', {
									params: { commerceId: props.row.id },
									query: { origin: '/ecommerce/commerce-table' },
								})
							"
						/>
						<app-tooltip-button
							img="/static/img/banner.svg"
							text="Banners"
							height="20"
							@click-icon="goToBanners(props.row)"
						/>
						<v-tooltip top>
							<v-switch
								slot="activator"
								class="switch-inline"
								hide-details
								color="success"
								v-model="props.row.flagActive"
								@change="changeActive(props.row.id, $event)"
							></v-switch>
							<span>{{ stateName(props.row) }}</span>
						</v-tooltip>
					</td>
				</template>
			</app-table>
		</div>
		<action-sidebar
			v-model="action.value"
			:title="action.title"
			:width="action.width"
			:help-actions="actionsToHelp"
			@close-modal="closeModal"
		>
			<new-commerce-form
				v-if="action.code === 'new-commerce'"
				:subsidiaries="subsidiaries"
				:items="items"
				@saved="reLoadCommerce"
				@cancel="closeModal"
			/>
			<sale-points-form
				v-if="isSalePoints"
				:is-loading="isLoading"
				:sale-points="salePoints"
				:type-documents="typeDocuments"
				:war-code-taxes="warehouse.codeTaxes"
				:war-subsidiary-id="warehouse.subsidiaryId"
				:war-warehouses-id="warehouse.id"
				@cancel="cancelSalePoints"
				@save="saveSalePoints"
			/>
		</action-sidebar>
		<v-dialog v-model="dialog" persistent max-width="425">
			<v-card>
				<v-card-title class="headline">
					¿Deseas resetear el token?
				</v-card-title>
				<v-card-actions class="btn-block">
					<v-layout row wrap>
						<v-flex xs6 pr-1 text-xs-right>
							<v-btn
								color="info"
								class="btn-action white--text"
								@click.native="cancelDialog"
							>
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs6 pl-1 text-xs-left>
							<v-btn
								color="pink"
								class="btn-action white--text"
								@click.native="resetToken"
							>
								Aceptar
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<div class="modal-fair" v-if="dialogFair">
			<div class="modal-content-fair">
				<v-card-title class="headline bg-header">
					<v-layout row align-center>
						<v-flex class="title-fair-dialog"
							>Participas en las siguientes ferias:
						</v-flex>
						<v-flex text-xs-right>
							<button type="button" @click="closeDiaglogFair">
								<v-icon color="primary">clear</v-icon>
							</button>
						</v-flex>
					</v-layout>
				</v-card-title>
				<v-divider></v-divider>
				<v-card-text class="relative px-4">
					<v-layout
						v-for="(item, index) in fairs"
						:key="index"
						row
						justify-space-between
						align-center
						pt-2
						pb-2
						class="border-bottom"
					>
						<v-flex xs6>
							<v-layout column>
								<v-flex>
									<img
										v-if="item.fair.urlImage"
										height="35"
										:src="item.fair.urlImage"
									/>
									<span class="name-fair" v-else>
										{{ item.fair.name }}
									</span>
								</v-flex>
								<v-flex
									class="label-gray mt-2"
									v-if="item.fair.startDate && item.fair.endDate"
								>
									{{ item.fair.startDate | exactDate }} al
									{{ item.fair.endDate | exactDate }}
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex xs6 pl-5>
							<v-layout class="switch-commerce" column>
								<v-flex text-xs-right class="content-image-action">
									<button
										type="button"
										class="btn-assign mx-2"
										color="assignGray"
										x-small
										fab
										:class="{ 'btn-active': item.flagSync }"
										@click="btnAssignFair(item)"
									>
										<img
											class="icon-refresh"
											src="/static/img/icons/refresh-1.svg"
											height="12"
										/>
										<img
											v-if="item.flagSync"
											src="/static/img/icons/check-assync.svg"
											class="check-async"
										/>
										<div class="message-action">
											<p class="mb-1 primary--text bold title-modal">
												Sincronizar
											</p>
											<p class="mb-0 subtitle-modal">
												Sincroniza tu tienda con la fería.
											</p>
										</div>
									</button>
								</v-flex>
							</v-layout>
						</v-flex>
					</v-layout>
				</v-card-text>
			</div>
		</div>
		<v-dialog v-model="dialogPassword" max-width="400">
			<modal-change-password
				@close="closeChangePassword"
				@update="changePassword"
			/>
		</v-dialog>
	</div>
</template>

<script>
import actionSidebar from '@/components/shared/action-sidebar';
import appActions from '@/components/shared/app-actions';
import appTable from '@/components/shared/table/app-table';
import salePointsForm from '@/components/warehouses/sale-points-form';
import headerPage from '@/components/shared/header-page';
import lib from '@/shared/lib';
import newCommerceForm from '@/components/ecommerce/new-commerce';
import modalChangePassword from '@/components/ecommerce/modal-change-password';
import VueSixFour from 'vue-six-four';

function created() {
	this.listCommerce();
	this.loadCategories();
	this.loadSubsidiaries();
}

function onPage(page) {
	this.listCommerce(page);
}

function edit(action, { id }) {
	this.goTo(action, { params: { id }, query: { origin: 'commerce-table' } });
}

function runAction({ code }) {
	if (code === 'create-commerce') {
		this.goTo('configuration');
	} else if (code === 'sale-points') {
		this.action.code = code;
		this.action.title = 'PUNTO DE VENTA';
		this.action.value = true;
		this.loadTypeDocuments();
	} else if (code === 'new-ecommerce') {
		this.openNewCommerceModal();
	}
}

async function listCommerce(page = 1) {
	this.currentPage = page;
	this.params.page = this.currentPage;
	if (this.flagActiveParams !== null) {
		this.params.flagActive = Number(this.flagActiveParams);
	}
	try {
		const { data: response, headers } = await this.$httpSales.get(
			'com-ecommerce-companies',
			{ params: this.params }
		);
		this.rows = response;
		this.setRowSelected(false);
		this.lastPage = Number(headers['x-last-page']);
	} catch (error) {
		this.showGenericError();
	}
}

async function changeActive(id, flag) {
	const body = {
		flagActive: flag,
	};
	try {
		await this.$httpSales.patch(`com-ecommerce-companies/${id}/active`, body);
		this.showNotification('Se actualizó correctamente');
		this.listCommerce();
	} catch (error) {
		this.showGenericError();
	}
}

function stateName({ flagActive }) {
	return flagActive ? 'Activo' : 'Inactivo';
}

function rowIsSelected() {
	this.setDataSelected();
	this.checkAll = this.rows.every((r) => r.isSelected);
}

function selectedAll(checked) {
	this.checkAll = checked;
	this.setRowSelected(checked);
	this.setDataSelected();
}

function valueDisabled() {
	const code = 'sale-points';
	const disabled = this.dataSelected.length !== 1;
	return [{ code, disabled }];
}

function closeModal() {
	this.action.value = false;
	this.action.code = null;
	this.action.title = '';
	this.salePoints = [];
	this.setRowSelected(false);
	this.setDataSelected();
}

function setDataSelected() {
	this.dataSelected = this.rows.filter((r) => r.isSelected);
	const [selected] = this.dataSelected;
	this.warehouse.subsidiaryId = selected ? selected.subsidiaryId : null;
	this.warehouse.codeTaxes = selected ? selected.settings.codeTaxes : null;
}

function setRowSelected(selected) {
	this.rows = this.rows.map((row) => {
		const newRow = { ...row };
		newRow.isSelected = selected;
		newRow.loadingLogo = false;
		newRow.loadingIcon = false;
		return newRow;
	});
}

function isSalePoints() {
	return this.action.code === 'sale-points';
}

function cancelSalePoints() {
	this.closeModal();
}

async function saveSalePoints(newSalePoints) {
	this.isLoading = true;
	const body = newSalePoints.map((sp) => {
		const newSalePoint = {
			cashId: sp.cashId,
			codeTaxes: null,
			comSubsidiariesId: sp.comSubsidiariesId,
			employeesId: sp.employeesId,
			flagActive: sp.flagActive,
			name: sp.name,
			typeDevice: sp.typeDevice || null,
			series: sp.documents.reduce((acum, spd) => {
				let acumRet = [...acum];
				const newDocument = {};
				if (spd.isSelected) {
					if (spd.billing) {
						const newBill = spd.billing.reduce((ac, bill) => {
							if (bill.serie !== '') {
								const newRe = {
									codeTaxes: this.isEcuador ? bill.codeTaxes : null,
									companyTemplateId: bill.companyTemplateId,
									description: bill.description,
									details: bill.details.map((d) => {
										const newDetail = {
											codeTaxes: this.isEcuador ? d.codeTaxes : null,
											companyTemplateId: d.companyTemplateId,
											description: d.description,
											serie: d.serie,
											number: d.number,
											salTypeDocumentsId: d.salTypeDocumentsId,
										};
										if (d.id) {
											newDetail.id = d.id;
										}
										return newDetail;
									}),
									serie: bill.serie,
									number: bill.number,
									salTypeDocumentsId: bill.salTypeDocumentsId,
									comSubsidiariesId: bill.comSubsidiariesId,
									typeBilling: bill.typeBilling,
									flagSendBilling: bill.flagSendBilling,
								};
								if (bill.id) {
									newRe.id = bill.id;
								}
								ac.push({ ...newRe });
							}
							return ac;
						}, []);
						acumRet = acumRet.concat(newBill);
					} else {
						newDocument.codeTaxes = this.isEcuador ? spd.codeTaxes : null;
						newDocument.companyTemplateId = spd.companyTemplateId;
						newDocument.description = spd.description;
						newDocument.details = spd.details.map((d) => {
							const newDetail = {
								codeTaxes: this.isEcuador ? d.codeTaxes : null,
								companyTemplateId: d.companyTemplateId,
								description: d.description,
								serie: d.serie,
								number: d.number,
								salTypeDocumentsId: d.salTypeDocumentsId,
							};
							if (d.id) {
								newDetail.id = d.id;
							}
							return newDetail;
						});
						newDocument.serie = spd.serie;
						newDocument.number = spd.number;
						newDocument.salTypeDocumentsId = spd.salTypeDocumentsId;
						newDocument.comSubsidiariesId = spd.comSubsidiariesId;
						newDocument.typeBilling = spd.typeBilling;
						newDocument.flagSendBilling = spd.flagSendBilling;
						if (spd.id) {
							newDocument.id = spd.id;
						}
						acumRet.push({ ...newDocument });
					}
				}
				return acumRet;
			}, []),
			warWarehousesId: sp.warWarehousesId,
			warWarehousesName: this.warehouse.name,
		};
		if (this.salePoints.length && sp.id) {
			newSalePoint.id = sp.id;
		}
		return newSalePoint;
	});
	try {
		await this.$httpSales.post('terminals-series', body);
		this.showNotification(
			'La edición de puntos de venta se realizó correctamente.'
		);
		this.closeModal();
	} catch (err) {
		if (err.status === 400) {
			if (err.data.messge === 'CORRELATIVE_EXISTS') {
				this.showGenericError('Los correlativos se repiten');
			}
		} else {
			this.showGenericError();
		}
	} finally {
		this.isLoading = false;
	}
}

async function loadTypeDocuments() {
	const params = { flagType: 1, flagTemplate: 1, flagSerie: 1 };
	({ data: this.typeDocuments } = await this.$httpSales.get(
		'type-documents-all',
		{ params }
	));
	this.loadSalePoints();
}
async function loadSalePoints() {
	const params = { commerceId: this.dataSelected[0].id, typeTerminalId: 2 };
	({ data: this.salePoints } = await this.$httpSales.get('terminals', {
		params,
	}));
	this.salePoints = this.salePoints.map((salePoint) => {
		const { employees } = salePoint;
		const newSalePoint = { ...salePoint };
		newSalePoint.employeesId = lib.map(lib.getPropertysValue('id'), employees);
		return newSalePoint;
	});
	this.action.open = true;
}

function openNewCommerceModal() {
	this.action.code = 'new-commerce';
	this.action.title = 'Nuevo Comercio';
	this.action.value = true;
}

function goToMasterProduct(commerce) {
	const { id, code, name, subsidiaryId } = commerce;
	this.goTo('master-product-ecommerce', {
		params: { commerceId: id, commerceCode: code, subsidiaryId },
		query: { name, origin: '/ecommerce/commerce-table' },
	});
}

function goToCategory({ id, name }) {
	this.goTo('categories-ecommerce', {
		params: { id },
		query: { name, origin: '/ecommerce/commerce-table' },
	});
}

function reLoadCommerce() {
	this.listCommerce();
	this.closeModal();
}

async function loadSubsidiaries() {
	({ data: this.subsidiaries } = await this.$httpSales.get('subsidiaries'));
}

async function loadCategories() {
	const params = { type: 2 };
	({ data: this.items } = await this.$httpSales.get('items', { params }));
}

function icon() {
	return this.isMibodega ? 'settings' : 'edit';
}

function cancelDialog() {
	this.dialog = false;
}

async function resetToken() {
	const id = this.dataSelected[0].id;
	const body = { flagAssigned: false };
	try {
		await this.$httpSales.patch(`com-ecommerce-companies/${id}/refresh`, body);
		this.showNotification('Se reseteo el token correctamente');
		this.cancelDialog();
	} catch (error) {
		this.showGenericError();
	}
}

function goToBanners({ id, name }) {
	this.goTo('banner', {
		params: { id },
		query: { name, origin: '/ecommerce/commerce-table' },
	});
}

function showDialog(name, id, label) {
	this.$refs[name].click();
	this.selectId = id;
	this.selecLabel = label;
}

async function getFile(fileInfo) {
	this.setLoadingRow(true);
	const newFile = {
		name: fileInfo.name.replace(/\s/g, '-'),
		base64data: fileInfo.sixFour,
	};
	try {
		const words = newFile.name.split('.');
		const lastItem = words.length;
		const extension = words[lastItem - 1];
		if (this.allowedFiles.indexOf(extension) > -1) {
			const { data: file } = await this.$httpProduction.post(
				'upload-files',
				newFile
			);
			this.image = file.Location;
			this.uploadImageCommerce(this.image);
		} else {
			this.showNotification(
				`Archivo no válido, solo se permite ${this.allowedFiles.join(',')}`,
				'warning'
			);
		}
	} catch (error) {
		this.showGenericError();
		this.setLoadingRow(false);
	}
}

async function uploadImageCommerce(image) {
	const body =
		this.selecLabel === 'loadingIcon'
			? { favicon: { value: image } }
			: { urlImage: image };
	try {
		await this.$httpSales.patch(
			`ecommerce-companies/${this.selectId}/update`,
			body
		);
		this.showNotification('Se actualizó correctamente');
		this.listCommerce();
	} catch (error) {
		this.showGenericError();
	} finally {
		setTimeout(() => {
			this.setLoadingRow(false);
		}, 300);
	}
}

function setLoadingRow(value) {
	const index = this.rows.findIndex((r) => r.id === this.selectId);
	if (index > -1) {
		this.rows[index][this.selecLabel] = value;
	}
}

function openDialogFair(item) {
	this.fairs = item.fairCommerce;
	this.dialogFair = true;
}

function closeDiaglogFair() {
	this.dialogFair = false;
}

async function btnAssignFair(item) {
	const { commerceId, fairId } = item;
	try {
		await this.$httpProducts.post(
			`sync-firebase/commerces/${commerceId}/fairs/${fairId}`
		);
		if (item.flagSync === 1) {
			this.showNotification('La feria fue desincronizada correctamente.');
		} else {
			this.showNotification('La feria fue sincronizada correctamente.');
		}
		this.listCommerce();
		const index = this.rows.findIndex((p) => p.id === item.commerceId);
		if (index > -1) {
			const indexFair = this.rows[index].fairCommerce.findIndex(
				(q) => q.fairId === item.fairId
			);
			if (item.flagSync === 0) {
				this.fairs[indexFair].flagSync = 1;
			} else {
				this.fairs[indexFair].flagSync = 0;
			}
		}
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'NO_COMMERCE_FOUND') {
				this.showGenericError('No productos asignados a la feria.');
			} else if (error.data.message === 'NO_COMMERCE_SLUG') {
				this.showNotification(
					'Se debe configurar el slug del comercio para proceder con la sincronización.',
					'warning'
				);
			}
		} else {
			this.showGenericError();
		}
	}
}

function textFair(row) {
	if (row.fairCommerce.length === 0) {
		return 'Este comercio no tiene ferias asignadas';
	}
	return 'Ver Feria';
}

function showLinkGooglePlay(commerce) {
	if (commerce.plan) {
		if (Object.keys(commerce.plan).length) {
			if (commerce.plan.components) {
				return commerce.plan.components.androidApp;
			}
		}
		return false;
	}
	return false;
}

function showLinkAppStore(commerce) {
	if (commerce.plan) {
		if (Object.keys(commerce.plan).length) {
			if (commerce.plan.components) {
				return commerce.plan.components.iosApp;
			}
		}
		return false;
	}
	return false;
}

function isEmail(commerce) {
	if (commerce.employee) {
		return commerce.employee.email;
	}
	return null;
}

function disabledEmail(commerce) {
	if (commerce.employee) {
		return commerce.employee.aclUserCode;
	}
	return false;
}

function openDialogPassword(commerce) {
	this.selectCommerce = { ...commerce };
	this.dialogPassword = true;
}

function closeChangePassword() {
	this.dialogPassword = false;
}

async function changePassword(password) {
	this.closeChangePassword();
	const codeUser = this.selectCommerce.employee
		? this.selectCommerce.employee.aclUserCode
		: null;
	const url = '/users/password';
	const body = {
		password,
		codeUser,
	};
	try {
		await this.$httpAcl.patch(url, body);
	} catch (error) {
		this.showGenericError();
	}
}

function clearData() {
	this.params.itemId = null;
	this.params.flagActive = null;
	this.flagActiveParams = null;
	this.listCommerce(1);
}

function data() {
	return {
		action: {
			code: null,
			title: '',
			value: false,
			width: 500,
		},
		checkAll: false,
		columns: [
			{ id: 1, name: 'Nombre', value: 'name', visible: true, checked: true },
			{ id: 2, name: 'Mi web', value: 'web', visible: true, checked: true },
			{ id: 3, name: 'Mi app', value: 'app', visible: true, checked: true },
			{ id: 4, name: 'Usuario', value: 'user', visible: true, checked: true },
			{ id: 5, name: 'Logo', value: 'logo', visible: true, checked: true },
			{
				id: 6,
				name: 'Acciones',
				value: 'actions',
				visible: true,
				checked: true,
				flagVisible: true,
			},
		],
		currentPage: 1,
		dialogFair: false,
		dataSelected: [],
		fairs: [],
		isLoading: false,
		items: [],
		lastPage: 0,
		params: {
			page: 1,
			limit: 15,
			flagActive: null,
			itemId: null,
		},
		rows: [],
		salePoints: [],
		typeDocuments: [],
		warehouse: {
			subsidiaryId: null,
			codeTaxes: null,
		},
		subsidiaries: [],
		dialog: false,
		dialogPassword: false,
		selectCommerce: {},
		allowedFiles: ['jpg', 'jpeg', 'png', 'svg'],
		selectId: null,
		flags: [
			{
				value: true,
				name: 'Activo',
			},
			{
				value: false,
				name: 'Inactivo',
			},
		],
		flagActiveParams: null,
	};
}
export default {
	name: 'page-commerce',
	data,
	created,
	components: {
		actionSidebar,
		appActions,
		appTable,
		headerPage,
		newCommerceForm,
		salePointsForm,
		modalChangePassword,
		VueSixFour,
	},
	computed: {
		isSalePoints,
		valueDisabled,
		icon,
	},
	methods: {
		btnAssignFair,
		cancelSalePoints,
		changeActive,
		closeModal,
		closeDiaglogFair,
		edit,
		goToMasterProduct,
		listCommerce,
		loadCategories,
		loadSalePoints,
		loadSubsidiaries,
		loadTypeDocuments,
		openDialogFair,
		onPage,
		openNewCommerceModal,
		reLoadCommerce,
		rowIsSelected,
		runAction,
		saveSalePoints,
		selectedAll,
		setDataSelected,
		setRowSelected,
		stateName,
		goToCategory,
		cancelDialog,
		resetToken,
		goToBanners,
		showDialog,
		getFile,
		uploadImageCommerce,
		setLoadingRow,
		textFair,
		showLinkGooglePlay,
		showLinkAppStore,
		isEmail,
		disabledEmail,
		changePassword,
		openDialogPassword,
		closeChangePassword,
		clearData,
	},
};
</script>
<style lang="scss" scoped>
.master-product {
	border: 1px solid color(primary);
	border-radius: 8px;
	color: color(primary);
	padding: 1px 7px;
}

.btn-upload {
	border: 1px solid color(grey-border);
	border-radius: 2px;
	color: color(grey-border);
	font-size: 12px;
	font-weight: 600;
	padding: 2px 5px;
}

.wrapper-text-loader {
	align-items: center;
	color: color(grey-border);
	display: flex;
	font-size: 12px;
	justify-content: center;
}

.container-loader {
	height: 50px;
	width: 37px;
}

.loader:before,
.loader:after,
.loader {
	border-radius: 50%;
	width: 4px;
	height: 4px;
	-webkit-animation-fill-mode: both;
	animation-fill-mode: both;
	-webkit-animation: load7 1.8s infinite ease-in-out;
	animation: load7 1.8s infinite ease-in-out;
}

.loader {
	margin: 0 auto;
	font-size: 10px;
	position: relative;
	text-indent: -9999em;
	-webkit-animation-delay: 0.16s;
	animation-delay: 0.16s;
}

.loader:before {
	left: -0.9em;
}

.loader:after {
	left: 0.9em;
	-webkit-animation-delay: 0.32s;
	animation-delay: 0.32s;
}

.loader:before,
.loader:after {
	content: '';
	position: absolute;
	top: 0;
}

@-webkit-keyframes load7 {
	0%,
	80%,
	100% {
		box-shadow: 0 2.5em 0 -1.3em color(grey-border);
	}
	40% {
		box-shadow: 0 2.5em 0 0 color(grey-border);
	}
}

@keyframes load7 {
	0%,
	80%,
	100% {
		box-shadow: 0 2.5em 0 -1.3em color(grey-border);
	}
	40% {
		box-shadow: 0 2.5em 0 0 color(grey-border);
	}
}
.title-fair-dialog {
	color: color(primary);
	font-family: map-get($fonts, lato-regular);
	font-weight: 900;
	font-size: 14px;
}

.bg-header {
	background-color: rgba(76, 103, 104, 0.21);
	border-top-left-radius: 12px;
	border-top-right-radius: 12px;
}

.btn-assign {
	background-color: #d2d2d2;
	border-radius: 50%;
	height: 23px !important;
	box-shadow: none !important;
	margin: 0 !important;
	position: relative;
	width: 23px !important;

	&:hover {
		.message-action {
			display: block;
			width: 158px !important;
			z-index: 300 !important;
		}
	}
}

.label-gray {
	color: #4a4a4a;
	font-family: map-get($fonts, lato-regular);
	font-size: 8px;
}

.check-async {
	bottom: 13px;
	left: 6px;
	position: relative;
}

.btn-active {
	background-color: color(success);
}

.message-action {
	background-color: color(white);
	border: 1px solid color(item-select);
	border-radius: 5px;
	box-shadow: 0 2px 4px 0 rgba(157, 157, 157, 0.5);
	color: color(brown-grey);
	display: none;
	font-size: 12px;
	left: -90px;
	padding: 12px;
	position: absolute;
	text-transform: none;
	top: 36px;
	transition: all 0.5s ease-in-out 0s;
	width: 100%;
	z-index: 2;
	&::before {
		background: color(white);
		border: 1px solid color(item-select);
		border-bottom-width: 0;
		border-right-width: 0;
		content: '';
		height: 15px;
		left: 60%;
		position: absolute;
		top: -9px;
		width: 15px;
		-webkit-transform: rotate(45deg);
		-moz-transform: rotate(45deg);
		-ms-transform: rotate(45deg);
		-o-transform: rotate(45deg);
		transform: rotate(45deg);
	}
}

.subtitle-modal {
	font-family: map-get($fonts, open-regular);
	font-size: 10px !important;
	line-height: 1.1;
	max-width: 100px;
	text-align: left;
}
.title-modal {
	font-family: map-get($fonts, open-semibold);
	font-size: 11px;
	text-align: left;
}

.border-bottom {
	border-bottom: 1px solid #9ca6b0;
	&:last-child {
		border-bottom: none !important;
	}
}

.modal-fair {
	background-color: rgba(0, 0, 0, 0.2);
	position: fixed;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	z-index: 20;
}

.modal-content-fair {
	background-color: white;
	border-radius: 12px;
	box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.5);
	margin: 25% auto;
	position: relative;
	width: 403px;
}

.name-fair {
	color: map-get($colors, paginationText);
	font-family: map-get($fonts, lato-regular);
	font-size: 11px;
}

.wrapper-text-loader {
	align-items: center;
	color: color(grey-border);
	display: flex;
	font-size: 12px;
	justify-content: center;
}

.container-loader {
	height: 50px;
	width: 37px;
}

.loader:before,
.loader:after,
.loader {
	border-radius: 50%;
	width: 4px;
	height: 4px;
	-webkit-animation-fill-mode: both;
	animation-fill-mode: both;
	-webkit-animation: load7 1.8s infinite ease-in-out;
	animation: load7 1.8s infinite ease-in-out;
}

.loader {
	margin: 0 auto;
	font-size: 10px;
	position: relative;
	text-indent: -9999em;
	-webkit-animation-delay: 0.16s;
	animation-delay: 0.16s;
}

.loader:before {
	left: -0.9em;
}

.loader:after {
	left: 0.9em;
	-webkit-animation-delay: 0.32s;
	animation-delay: 0.32s;
}

.loader:before,
.loader:after {
	content: '';
	position: absolute;
	top: 0;
}

@-webkit-keyframes load7 {
	0%,
	80%,
	100% {
		box-shadow: 0 2.5em 0 -1.3em color(grey-border);
	}
	40% {
		box-shadow: 0 2.5em 0 0 color(grey-border);
	}
}

@keyframes load7 {
	0%,
	80%,
	100% {
		box-shadow: 0 2.5em 0 -1.3em color(grey-border);
	}
	40% {
		box-shadow: 0 2.5em 0 0 color(grey-border);
	}
}

.btn-upload {
	border: 1px solid color(grey-border);
	border-radius: 2px;
	color: color(grey-border);
	font-size: 12px;
	font-weight: 600;
	padding: 2px 5px;
}

.td-action {
	height: 100% !important;
}
</style>
