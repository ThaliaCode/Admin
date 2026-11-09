<template>
	<div>
		<header-page :title="$route.meta.title" />
		<div class="request-form pl-5">
			<v-tabs v-model="activeTab" icons-and-text dark color="primary">
				<v-tabs-slider color="success"></v-tabs-slider>
				<v-tab href="#requirement">
					Requerimiento
					<v-icon>work</v-icon>
				</v-tab>
				<v-tab href="#files">
					Archivos
					<v-icon>attach_file</v-icon>
				</v-tab>
				<v-tab href="#quotation" :disabled="!model.quotationId">
					Cotización
					<v-icon>shopping_cart</v-icon>
				</v-tab>
				<v-tab-item id="requirement">
					<v-card class="pt-3 pb-3">
						<v-layout row wrap px-4>
							<v-flex xs12 sm6 pr-2>
								<span class="request-title-client">Información</span>
								<v-layout row wrap mt-3 mb-4>
									<v-flex xs12>
										<v-select
											label="Empresa"
											autocomplete
											:loading="loading"
											:items="customers"
											item-text="typePerson.fullName"
											:search-input.sync="search"
											v-model="customer"
											bottom
											hide-details
											required
											:class="{ 'form-group--error' : $v.model.customerId.$error }"
											@input="setModalCustomerId"
											class="filter-select shadow-inset"
											content-class="filter-select-content"
										></v-select>
										<span class="form-group__message" v-if="!$v.model.customerId.required">
											Debe seleccionar la empresa correspondiente
										</span>
									</v-flex>
								</v-layout>
								<v-layout row wrap>
									<v-flex xs12 sm6 pr-1>
										<v-text-field
											class="filter-select shadow-inset mb-4"
											label="RUC"
											readonly
											v-model="customer.typePerson.documentNumber">
										</v-text-field>
									</v-flex>
									<v-flex xs12 sm6 pl-1>
										<v-text-field
											class="filter-select shadow-inset mb-4"
											label="Correo de contacto"
											type="email"
											v-model="customer.email">
										</v-text-field>
									</v-flex>
								</v-layout>
								<v-layout row wrap>
									<v-flex xs12 sm6 pr-1>
										<v-text-field
											class="filter-select shadow-inset mb-4"
											label="Contacto"
											v-model="customer.contact">
										</v-text-field>
									</v-flex>
									<v-flex xs12 sm6 pl-1>
										<v-text-field
											class="filter-select shadow-inset mb-4"
											label="Teléfono de contacto"
											v-model="customer.phone"
										>
										</v-text-field>
									</v-flex>
								</v-layout>
								<v-layout row wrap mb-4>
									<v-flex xs12 sm6 pr-2>
										<v-select
											bottom
											hide-details
											label="Tipo de requerimiento"
											class="filter-select shadow-inset"
											:class="{ 'form-group--error' : $v.model.typeRequirementId.$error }"
											:items="types"
											v-model="model.typeRequirementId"
											item-text="name"
											item-value="id"
											content-class="filter-select-content"
										></v-select>
										<span class="form-group__message" v-if="!$v.model.typeRequirementId.required">
											Debe seleccionar el tipo de requerimiento
										</span>
									</v-flex>
								</v-layout>
								<v-layout row wrap>
									<v-flex xs11>
										<v-text-field
											class="filter-select shadow-inset input-address"
											label="Dirección de obra"
											type="text"
											:class="{ 'form-group--error' : $v.model.address.$error }"
											v-model="model.address">
										</v-text-field>
										<span class="form-group__message" v-if="!$v.model.address.required">
											Este campo es requerido
										</span>
									</v-flex>
									<v-flex xs1 pl-1 text-xs-center>
										<img
											src="https://s3.amazonaws.com/apprunn-acl/icons/CkqkmBz1C9tgy0Ia1qmf&aiqxsau3h.svg"
											alt=""
											height="36">
									</v-flex>
									<v-flex xs6 sm6 pl-1>
										<v-text-field
											class="filter-select shadow-inset mt-3"
											label="Horas Hombre"
											type="text"
											v-model="model.totalHours">
										</v-text-field>
										<span class="form-group__message" v-if="!$v.model.totalHours.required">
											Indicar horas hombre
										</span>
									</v-flex>
									<v-flex xs6 sm6 pl-1>
										<v-text-field
											class="filter-select shadow-inset mt-3"
											label="Costo Estimado"
											type="text"
											v-model="model.estimatedCost">
										</v-text-field>
										<span class="form-group__message" v-if="!$v.model.estimatedCost.required">
											Indicar costo estimado del proyecto
										</span>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 sm6 pl-1>
								<span class="request-title-client">Descripción</span>
								<v-text-field
									class="filter-select shadow-inset mt-3"
									label="Título"
									type="text"
									:class="{ 'form-group--error' : $v.model.title.$error }"
									v-model="model.title">
								</v-text-field>
								<span class="form-group__message" v-if="!$v.model.title.required">
									Este campo es requerido
								</span>
								<v-text-field
									textarea
									multi-line
									no-resize
									class="textarea-content filter-select shadow-inset mt-4 mb-3"
									label="Descripción"
									v-model="model.description">
								</v-text-field>
								<v-text-field
									textarea
									multi-line
									no-resize
									class="textarea-content filter-select shadow-inset mt-3"
									label="Observaciones"
									v-model="model.observation">
								</v-text-field>
								<v-select
									bottom
									hide-details
									:items="requirements"
									v-model="model.requirementId"
									item-value="id"
									item-text="autoCode"
									label="OIT asociada"
									class="filter-select shadow-inset my-4"
								>
								</v-select>
								<v-layout row wrap v-if="id">
									<v-flex xs4 pr-1>
										<v-text-field
											class="filter-select shadow-inset"
											label="Nº de orden de compra"
											type="text"
											v-model="model.saleOrder">
										</v-text-field>
									</v-flex>
									<v-flex xs8 pl-1>
										<v-layout row wrap>
											<v-flex xs7 pl-0>
												<label ref="labelOs" for="upload-file-os">
													<v-btn @click="showDialogOs"
														color="success">
														<v-icon>attach_file</v-icon>
														Orden de compra
													</v-btn>
													<vue-six-four id="upload-file-os" hidden @vue-six-four="getFileOrder" />
												</label>
											</v-flex>
											<v-flex xs5 text-xs-right>
												<a v-show="model.fileOrder"
													:href="model.fileOrder"
													class="see-order"
													target="_blank"
													rel="noopener">
													Ver Orden de Compra
												</a>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 my-4>
								<v-divider class="hr-info"></v-divider>
							</v-flex>
							<v-flex xs12 sm6 pl-1  v-if="!commercialRole && projectRole">
								<v-layout row wrap>
									<v-flex xs12 sm6 pr-1>
										<v-select
											bottom
											hide-details
											label="Asignar especialista"
											class="filter-select shadow-inset mb-4"
											:items="employees"
											v-model="model.employeeId"
											item-text="fullName"
											item-value="id"
											content-class="filter-select-content"
										></v-select>
									</v-flex>
									<v-flex sm6>
										<v-menu
											lazy
											v-model="menu"
											transition="scale-transition"
											full-width>
											<v-text-field
												slot="activator"
												label="Programar visita"
												v-model="model.scheduledVisit"
												append-icon="event"
												class="filter-select shadow-inset shadow-inset-calendar shadow-inset-calendar-requirement"
												readonly
											></v-text-field>
											<v-date-picker
												v-model="model.scheduledVisit"
												no-title
												scrollable
											></v-date-picker>
										</v-menu>
									</v-flex>
								</v-layout>
							</v-flex>
						</v-layout>
						<v-layout>
							<v-flex xs12 text-xs-center>
								<v-btn
									type="button"
									color= "error"
									class="btn-action mt-4"
									@click="reject"
									v-if="id && model.statusName === 'Nuevo'"
									is-loading="cancelRequirement">
									Desaprobar
									<img src="//s3.amazonaws.com/japi-admin/icon-cancel.svg" alt="">
								</v-btn>
								<v-btn
									:disabled="isLoading || $v.$invalid"
									type="button"
									color= "success"
									class="btn-action mt-4"
									@click="saveRequirement">
									Guardar
									<img src="//s3.amazonaws.com/japi-admin/icon-apply.svg" alt="">
								</v-btn>
							</v-flex>
						</v-layout>
					</v-card>
				</v-tab-item>
				<v-tab-item id="files">
					<v-layout>
						<v-flex xs12>
							<v-card class="pa-2 pb-3">
								<v-layout>
									<v-flex xs3>
										<v-select
											class="filter-select shadow-inset mb-4"
											item-id="id"
											item-text="name"
											:items="fileTypes"
											v-model="selectedType"
										>
										</v-select>
									</v-flex>
									<v-flex xs3>
										<label ref="labelUf" for="upload-file">
											<v-btn @click="showDialog" color="success">Añadir archivo</v-btn>
											<vue-six-four id="upload-file" hidden @vue-six-four="getFile" />
										</label>
									</v-flex>
								</v-layout>
								<v-flex xs8 class="pa-2">
									<app-table
										class="is-not-selectable"
										:columns="columns"
										:rows="files"
										:input-search="false"
										:filter-columns="false"
										:main-list="false"
									>
										<template slot="rows" slot-scope="props">
											<td class="is-not-selectable">{{ props.row.name }}</td>
											<td class="is-not-selectable">{{ props.row.typeFile.name }}</td>
											<td class="is-not-selectable">{{ props.row.createdAt | formatDate }}</td>
											<td>
												<v-btn @click="openFile(props.row)" :disabled="!props.row.url"
													icon flat class="table-icon"
												>
													<v-icon color="primary">file_download</v-icon>
												</v-btn>
												<v-btn @click="removeFile(props.row)" icon flat
													class="table-icon"
												>
													<v-icon color="error">delete_forever</v-icon>
												</v-btn>
											</td>
										</template>
									</app-table>
								</v-flex>
								<v-flex xs6 class="pa-2" v-if="!$route.params.id && files.length > 0">
									<v-alert type="info" :value="true">
										<v-btn dark flat @click="goToRequirement">
											Los archivos se guardaran al crear el requerimiento
										</v-btn>
									</v-alert>
								</v-flex>
							</v-card>
						</v-flex>
					</v-layout>
				</v-tab-item>
				<v-tab-item id="quotation">
					<v-layout row wrap align-center>
						<v-flex xs12>
							<v-card class="pt-3 pb-3">
								<v-layout wrap align-center>
									<v-flex xs12 pl-4>
										<v-card-text>Cotización {{model.quotationDocument}}.pdf
											<v-tooltip top>
												<a
													class="pl-2 pr-1"
													slot="activator"
													@click.prevent="download(model, 'pdf-categories')"
												>
													<img :src="`${$imageUrl}/download.svg`" alt="" />
												</a>
												<span>Descargar Cotización Agrupada</span>
											</v-tooltip>
											<v-tooltip top>
												<a
													class="pl-1 pr-2"
													slot="activator"
													@click.prevent="download(model, 'pdf')"
												>
													<v-icon color="warning">file_download</v-icon>
												</a>
												<span>Descargar Cotización</span>
											</v-tooltip>
											<v-tooltip top>
												<router-link v-if="model.quotationId"
													slot="activator"
													:to="{ name: 'edit-quotation', params: { id: model.quotationId } }"
												>
													<img :src="`${$imageUrl}/editar.svg`" alt="">
												</router-link>
												<span>Editar</span>
											</v-tooltip>
										</v-card-text>
									</v-flex>
									<v-flex sm12>
										<div class="pl-4">
											<div class="input-group__input" inline>
												<img class="pr-2" :src="`${$imageUrl}/icon-message.svg`" alt="">
												<v-select
														label="Indicar un email y presionar enter o tab"
														chips
														tags
														solo
														clearable
														v-model="emails"
													>
														<template slot="selection" slot-scope="data">
															<v-chip
																close
																@input="removeEmail(data.item)"
																:selected="data.selected"
															>
																<strong>{{ data.item }}</strong>&nbsp;
															</v-chip>
														</template>
												</v-select>
												<div>
													<v-btn
														style="height: 100%"
														type="button"
														color="primary"
														@click="sendEmails"
														:disabled="!emails.length > 0 || isLoadingEmail">
														Enviar cotización
													</v-btn>
												</div>
											</div>
										</div>
									</v-flex>
								</v-layout>
							</v-card>
						</v-flex>
					</v-layout>
				</v-tab-item>
			</v-tabs>
		</div>
	</div>
</template>

<script>
	import VueSixFour from 'vue-six-four';
	import { required } from 'vuelidate/lib/validators';
	import format from 'date-fns/format';
	import appTable from '@/components/shared/table/app-table';
	import headerPage from './../../shared/header-page';
	import helper from './../../../shared/helper';

	function created() {
		this.loadData();
	}

	async function loadData() {
		this.id = this.$route.params.id;
		const request = [
			this.$httpProduction.get('type-requirements'),
			this.$httpSales.get('employees', { params: { codeTypeRol: 'TECHNICAL' } }),
			this.$httpProduction.get('type-files'),
			this.$httpProduction.get('requirements'),
		];
		if (this.id) {
			const url = `requirements/${this.id}`;
			request.push(this.$httpProduction.get(url));
		}
		try {
			const [types, employees, fileTypes, requirements, requirement] = await Promise.all(request);
			this.types = types.data;
			this.fileTypes = fileTypes.data;
			this.selectedType = this.fileTypes.length > 0 ? this.fileTypes[0] : null;
			this.requirements = [{ id: null, autoCode: 'Ningun' }].concat(requirements.data);
			if (this.selectedType === null) {
				this.showNotification('Necesita configurar tipos de archivos', 'warning');
			}
			this.employees = employees.data.map((employee) => {
				const newEmployee = Object.assign({}, employee);
				newEmployee.fullName = `${employee.name} ${employee.lastname}`;
				return newEmployee;
			});
			if (this.id) {
				this.model = requirement.data;
				const url = `customers/${this.model.customerId}`;
				const customer = await this.$httpSales(url);
				this.customer = customer.data;
				this.search = this.customer.typePerson.fullName;
				if (this.model.scheduledVisit) {
					this.model.scheduledVisit = format(new Date(this.model.scheduledVisit), 'YYYY-MM-DD');
				}
				this.emails.push(this.$userInfo.company.email);
				this.files = this.model.files;
			}
		} catch (err) {
			this.showGenericError();
		}
	}

	async function saveRequirement() {
		this.isLoading = true;
		const method = this.id ? 'patch' : 'post';
		const url = this.id ? `requirements/${this.id}` : 'requirements';
		const update = 'se actualizó';
		const create = 'ha sido creado';
		const message = this.id ? update : create;
		const body = {
			typeRequirementId: this.model.typeRequirementId,
			employeeId: this.model.employeeId,
			customerId: this.model.customerId,
			title: this.model.title,
			scheduledVisit: this.model.scheduledVisit,
			description: this.model.description || '',
			address: this.model.address,
			observation: this.model.observation,
			totalHours: this.model.totalHours,
			estimatedCost: this.model.estimatedCost,
			requirementId: this.model.requirementId,
			customerInformation: {
				contactEmail: this.customer.email,
				contactName: this.customer.contact,
				contactPhone: this.customer.phone,
			},
		};
		if (!this.id) {
			body.files = this.files.map((fileItem) => {
				const newFile = fileItem;
				delete newFile.base64data;
				return newFile;
			});
		} else {
			body.saleOrder = this.model.saleOrder;
			body.fileOrder = this.model.fileOrder;
		}
		try {
			await this.$httpProduction[method](url, body);
			this.showNotification(`El requerimiento ${message} de manera exitosa`);
			this.goTo('request-list');
			this.isLoading = false;
		} catch (err) {
			this.showGenericError();
			this.isLoading = false;
		}
	}

	function search(val) {
		const searchTrim = val ? val.trim() : '';
		const customer = this.customers.findIndex(c => c.typePerson.fullName === searchTrim);
		if (customer === -1) {
			this.searchCustomers(val);
		}
	}

	async function searchCustomers(value) {
		const searchTrim = value ? value.trim() : '';
		if (searchTrim) {
			this.loading = true;
			try {
				const response = await this.customerSelections(searchTrim);
				this.customers = response.data;
				this.loading = false;
			} catch (err) {
				this.showGenericError();
				this.loading = false;
			}
		}
	}

	function setModalCustomerId({ id }) {
		this.model.customerId = id;
	}

	async function cancelRequirement() {
		this.isLoading = true;
		try {
			await this.$httpProduction.patch(`requirements/rejected/${this.model.id}`);
			this.showNotification('El requerimiento fue desaprobado');
			this.goTo('request-list');
		} catch (error) {
			this.showGenericError(error);
		} finally {
			this.isLoading = false;
		}
	}

	function approve() {
		return this.$route.params.id ? 'Actualizar' : 'Aprobar';
	}

	async function sendEmails() {
		this.isLoadingEmail = true;
		const id = this.model.quotationId;
		if (id) {
			const emailsToSend = this.formattedEmails();
			if (emailsToSend.length > 0) {
				const url = `sale-documents/${id}/email`;
				const body = {
					code: 'pdf-categories',
					email: emailsToSend,
				};
				try {
					await this.$httpSales.post(url, body);
					this.showNotification('Correo enviado correctamente');
					await this.$httpProduction.patch(`requirements/send-quotation/${this.id}`);
				} catch (e) {
					this.showGenericError();
				} finally {
					this.isLoadingEmail = false;
				}
			} else {
				this.showNotification('Ningún correo es válido', 'warning');
			}
		} else {
			this.showNotification('No existe cotización asociada al requerimiento', 'warning');
		}
	}

	async function getFile(fileInfo) {
		const newFile = {
			name: fileInfo.name.replace(/\s/g, '-'),
			base64data: fileInfo.sixFour,
		};
		try {
			const words = newFile.name.split('.');
			const lastItem = words.length;
			const extension = words[lastItem - 1];
			if (this.allowedFiles.indexOf(extension) > -1) {
				const { data: file } = await this.$httpProduction.post('upload-files', newFile);
				newFile.extension = extension;
				newFile.url = file.Location;
				if (this.id) {
					delete newFile.base64data;
					newFile.typeFileId = this.selectedType.id;
					await this.$httpProduction.post(`/requirement-files/${this.id}`, [newFile]);
					this.showNotification(`Archivo adjuntado al requerimiento ${this.model.autoCode}`);
				}
				newFile.typeFile = this.selectedType;
				newFile.createdAt = new Date();
				this.files.push(newFile);
			} else {
				this.showNotification(`Archivo no válido, solo se permite ${this.allowedFiles.join(',')}`, 'warning');
			}
		} catch (error) {
			this.showGenericError();
		}
	}

	async function getFileOrder(fileInfo) {
		const newFile = {
			name: fileInfo.name.replace(/\s/g, '-'),
			base64data: fileInfo.sixFour,
		};
		try {
			const words = newFile.name.split('.');
			const lastItem = words.length;
			const extension = words[lastItem - 1];
			if (this.allowedFiles.indexOf(extension) > -1) {
				const { data: file } = await this.$httpProduction.post('upload-files', newFile);
				this.model.fileOrder = file.Location;
			} else {
				this.showNotification(`Archivo no válido, solo se permite ${this.allowedFiles.join(',')}`, 'warning');
			}
		} catch (error) {
			this.showGenericError();
		}
	}

	function goToRequirement() {
		this.activeTab = 'requirement';
	}

	function openFile({ url }) {
		window.open(url);
	}

	function formattedEmails() {
		const regular = /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g;
		const emailsToValidate = this.emails.join(',');
		return emailsToValidate.match(regular);
	}

	function data() {
		return {
			activeTab: 'requirement',
			allowedFiles: ['jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx', 'pdf', 'txt'],
			columns: [
				{ id: 1, name: 'Nombre', value: 'name', visible: true },
				{ id: 2, name: 'Tipo', value: 'fileType.name', visible: true },
				{ id: 3, name: 'Fecha', value: 'createdAt', visible: true },
				{ id: 4, name: 'Acciones', visible: true, flagVisible: true },
			],
			rows: [],
			commercialRole: false,
			customer: {
				typePerson: {},
			},
			customers: [],
			emails: [],
			employees: [],
			files: [],
			fileTypes: [],
			id: null,
			loading: false,
			menu: false,
			model: {
				id: '',
				customerId: null,
				typeRequirementId: '',
				address: '',
				title: '',
				description: '',
				employeeId: null,
				scheduledVisit: format(new Date(), 'YYYY-MM-DD'),
				statusName: 0,
				rzSocial: '',
				observation: '',
				totalHours: null,
				estimatedCost: null,
				requirementId: null,
				saleOrder: '',
				fileOrder: null,
			},
			projectRole: true,
			requirements: [],
			requerimentData: {},
			search: null,
			selectedType: null,
			emailsDirections: [],
			types: [],
			isLoading: false,
			isLoadingEmail: false,
		};
	}

	async function download({ quotationId, quotationDocument }, code) {
		try {
			const downloadDialog = this.$userInfo.company.settings.downloadSale;
			const model = { code };
			const responseType = 'blob';
			const contentType = downloadDialog ? 'application/pdf' : 'text/html';
			const response = await this.$httpReportSales.post(`sale-documents/${quotationId}/pdf`, model, { responseType });
			const blob = helper.generateBlob(response.data, contentType);
			helper.showDownloadDialog(blob, quotationDocument, downloadDialog);
		} catch (error) {
			this.showGenericError();
		}
	}

	async function reject() {
		try {
			await this.$httpProduction.patch(`requirements/rejected/${this.id}`);
			this.showNotification('Requerimiento desaprobado');
		} catch (error) {
			const message = error.data.message;
			if (message === 'REQUIREMENT_STATUS_INVALID') {
				this.showNotification('El requerimiento ya ha sido aprobado, no puede ser rechazado', 'warning');
			} else {
				this.showGenericError(error);
			}
		}
	}

	function removeEmail(item) {
		this.emails.splice(this.emails.indexOf(item), 1);
		this.emails = [...this.emails];
	}

	async function removeFile({ id, name }) {
		if (id) {
			const ids = [id];
			await this.$httpProduction.delete('requirement-files', {
				data: ids,
			});
			const fileIndex = this.files.findIndex(f => f.id === id);
			this.files.splice(fileIndex, 1);
			this.showNotification('Archivo eliminado correctamente');
		} else {
			const fileIndex = this.files.findIndex(f => f.name === name);
			this.files.splice(fileIndex, 1);
		}
	}

	function showDialog() {
		this.$refs.labelUf.click();
	}

	function showDialogOs() {
		this.$refs.labelOs.click();
	}

	export default {
		name: 'requirement-new',
		components: {
			appTable,
			headerPage,
			VueSixFour,
		},
		computed: {
			approve,
		},
		created,
		data,
		methods: {
			loadData,
			cancelRequirement,
			download,
			formattedEmails,
			getFile,
			getFileOrder,
			goToRequirement,
			openFile,
			reject,
			removeEmail,
			removeFile,
			saveRequirement,
			searchCustomers: helper.debounce(searchCustomers),
			sendEmails,
			setModalCustomerId,
			showDialog,
			showDialogOs,
		},
		validations: {
			model: {
				address: { required },
				customerId: { required },
				title: { required },
				typeRequirementId: { required },
				totalHours: { required },
				estimatedCost: { required },
			},
		},
		watch: {
			search,
		},
	};
</script>

<style lang="scss" scoped>
	.request {
		&-form {
			background-color: map-get($colors, background-table);
			margin: 0 auto;
			min-height: calc(100vh - 133px);
			padding: 26px 15px;

			@media (min-width: 768px) {
				padding: 26px 70px;
			}
		}

		&-title-client {
			color: map-get($colors, paginationText);
			@include txt-config (open-regular, medium18);
		}

		&-phone {
			margin-top: -8px;
		}
	}

	.btn{
		align-items: center;
		border-radius: 2px;
		display: inline-flex;
		height: 30px;
		flex: 0 1 auto;
		font-size: 14px;
		font-weight: 500;
		justify-content: center;
		margin: 0px 8px;
		min-width: 88px;
		outline: 0;
		position: relative;
		text-decoration: none;
		text-transform:Normal;
		transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1), color 1ms;
		user-select: none;
		vertical-align: middle;
	}

	.see-order {
		font-size: map-get($sizes, medium);
	}
</style>
