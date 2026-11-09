<template>
	<div>
		<v-tabs v-model="active" color="primary" right slider-color="primary darken-1">
			<v-tab href="#tab-general" class="caption white--text"> Datos Generales </v-tab>
			<v-tab href="#tab-additional" class="caption white--text">
				Datos Adicionales
			</v-tab>
			<v-tab-item id="tab-general">
				<v-layout wrap row px-3 pt-4 pb-5 mb-5>
					<v-flex xs6 px-2 mb-3>
						<label class="label">RUC</label>
						<v-text-field
							hide-details
							single-line
							label="RUC"
							v-model="model.ruc"
							class="filter-select"
							:disabled="!canEditRuc"
							@input="$emit('get-data', { model: 'ruc', value: $event })"
							@blur="$emit('validation-ruc')"
						></v-text-field>
						<transition name="fade" mode="out-in">
							<span class="form-group__message">
								{{ spanRuc }}
							</span>
						</transition>
					</v-flex>
					<v-flex xs6 px-2 mb-3>
						<label class="label">Razón Social</label>
						<v-text-field
							hide-details
							single-line
							label="Razón Social"
							v-model="model.rzSocial"
							class="filter-select"
							@input="$emit('get-data', { model: 'rzSocial', value: $event })"
						></v-text-field>
						<transition name="fade" mode="out-in">
							<span class="form-group__message" v-if="!model.rzSocial">
								La Razón Social es obligatoria
							</span>
						</transition>
					</v-flex>
					<v-flex xs6 px-2 mb-3>
						<app-input-text
							label="Nombre"
							model="sucursalName"
							:text="model.sucursalName"
							@input="$emit('get-data', $event)"
						></app-input-text>
						<transition name="fade" mode="out-in">
							<span class="form-group__message" v-if="!model.sucursalName">
								El nombre es requerido
							</span>
						</transition>
					</v-flex>
					<v-flex xs6 px-2 mb-3>
						<app-input-text
							label="Código"
							model="sucursalCode"
							:text="model.sucursalCode"
							@input="$emit('get-data', $event)"
						></app-input-text>
						<transition name="fade" mode="out-in">
							<span class="form-group__message" v-if="!model.sucursalCode">
								El codigo es requerido
							</span>
						</transition>
						<span class="form-group__message" v-if="checkBlankCode(model.sucursalCode)">
							No se permite espacios en blanco
						</span>
					</v-flex>
					<v-flex xs12 px-2 mb-3>
						<label ref="label" for="upload-create-section" class="w-100">
							<vue-six-four id="upload-create-section" hidden @vue-six-four="getFile" />
							<v-layout wrap>
								<v-flex xs11 mt-1>
									<app-input-text
										label="Logo"
										readonly
										:text="model.urlLogo"
									></app-input-text>
								</v-flex>
								<v-flex xs1 mt-4 pt-1 text-xs-center>
									<v-btn
										class="ma-0 pl-0 btn-auto"
										color="info"
										:disabled="loadingImage"
										small
										@click="showDialog"
									>
										<v-icon color="white">image</v-icon>
									</v-btn>
								</v-flex>
							</v-layout>
						</label>
					</v-flex>
					<v-flex xs6 px-2 mb-3>
						<app-input-text
							label="Correo"
							model="email"
							:text="model.email"
							@input="$emit('get-data', $event)"
						></app-input-text>
					</v-flex>
					<v-flex xs6 px-2 mb-3>
						<app-input-text
							label="Teléfono"
							model="phone"
							:text="model.phone"
							@input="$emit('get-data', $event)"
						></app-input-text>
					</v-flex>
					<v-flex xs6 px-2 mb-3>
						<app-input-text
							label="Persona de Contacto"
							model="contactName"
							:text="model.contactName"
							@input="$emit('get-data', $event)"
						></app-input-text>
					</v-flex>
					<v-flex xs6 px-2 mb-3>
						<app-input-text
							label="Apellido"
							model="contactLastname"
							:text="model.contactLastname"
							@input="$emit('get-data', $event)"
						></app-input-text>
					</v-flex>
					<v-flex xs12 px-2 mb-3>
						<app-input-text
							label="Dirección"
							model="address"
							:text="model.address"
							textarea
							@input="$emit('get-data', $event)"
						></app-input-text>
					</v-flex>
					<v-flex xs6 px-2 mb-3 v-if="isEcuador">
						<app-input-text
							label="Agente de retención"
							model="withholdingAgent"
							:text="model.settings.withholdingAgent"
							@input="changeModel({ model: 'withholdingAgent', value: $event.value })"
						></app-input-text>
						<span class="error--text caption" v-if="!$v.withholdingAgent.numeric">
							El agente de retención de ser un número
						</span>
						<span class="error--text caption" v-if="!$v.withholdingAgent.maxLength">
							Ingresar de 1 a 8 caracteres
						</span>
					</v-flex>
					<v-flex xs6 px-5 mb-3 v-if="isEcuador">
						<label class="caption-rimpe">Régimen RIMPE </label>
						<v-switch
							color="success"
							hide-details
							v-model="model.settings.rimpe"
							@change="changeModel({ model: 'rimpe', value: $event })"
						></v-switch>
					</v-flex>
					<v-flex xs6 px-2>
						<label class="caption">Permitir la venta de productos gratuitos</label>
					</v-flex>
					<v-flex xs5 px-5 px-2>
						<v-switch
							color="success"
							hide-details
							:label="labelProductFree"
							v-model="allowProductFree"
							@change="
								$emit('change-free', {
									model: 'allowProductFree',
									value: $event,
								})
							"
						></v-switch>
					</v-flex>
					<v-flex xs6 px-2>
						<label class="caption">Agente de Retención</label>
					</v-flex>
					<v-flex xs5 px-5 px-2>
						<v-switch
							color="success"
							hide-details
							:label="labelWithholding"
							v-model="model.settings.withHolding"
							@change="
								$emit('change-free', {
									model: 'withHolding',
									value: $event,
								})
							"
						></v-switch>
					</v-flex>
					<v-flex xs6 px-2>
						<label class="caption"> Incluir a la Facturación Automática</label>
					</v-flex>
					<v-flex xs5 px-5 px-2>
						<v-switch
							color="success"
							hide-details
							:label="flagBillingCron ? 'Si' : 'No'"
							v-model="flagBillingCron"
							@change="
								$emit('change-flag', {
									model: 'flagBillingCron',
									value: $event,
								})
							"
						></v-switch>
					</v-flex>
					<v-flex xs6 px-2>
						<label class="caption"> Permitir generar facturas con detracción</label>
					</v-flex>
					<v-flex xs5 px-5 px-2>
						<v-switch
							color="success"
							hide-details
							:label="flagDetraction ? 'Si' : 'No'"
							v-model="flagDetraction"
							@change="
								$emit('change-flag', {
									model: 'flagDetraction',
									value: $event,
								})
							"
						></v-switch>
					</v-flex>
					<v-flex xs6 px-2>
						<label class="caption">
							Enviar copia del correo de la venta a la sucursal</label
						>
					</v-flex>
					<v-flex xs5 px-5 px-2>
						<v-switch
							color="success"
							hide-details
							:label="flagSendCopyEmail ? 'Si' : 'No'"
							v-model="flagSendCopyEmail"
							@change="
								$emit('change-flag', {
									model: 'flagSendCopyEmail',
									value: $event,
								})
							"
						></v-switch>
					</v-flex>
					<v-flex xs6 px-2 v-if="$userInfo.roleCode === 'SUPPORT'">
						<label class="caption">Configurar Integracion por defecto</label>
					</v-flex>
					<v-flex xs5 px-5 px-2 v-if="$userInfo.roleCode === 'SUPPORT'">
						<v-switch
							color="success"
							hide-details
							:label="flagDefault ? 'Si' : 'No'"
							v-model="flagDefault"
							@change="
								$emit('change-flag', {
									model: 'flagCompanyDefault',
									value: $event,
								})
							"
						></v-switch>
					</v-flex>
					<v-flex xs6 px-2 mt-2 v-if="$userInfo.roleCode === 'SUPPORT'">
						<app-input-text
							label="Sucursal ACl code"
							readonly
							model="subsidiaryAclCode"
							:text="aclCodeSub"
							@input="
								$emit('change-flag', {
									model: 'subsidiaryAclCode',
									value: $event,
								})
							"
						/>
					</v-flex>
					<template v-if="flagAccounting">
						<v-flex xs7 px-2>
							<label class="caption">Contabilidad</label>
						</v-flex>
						<v-flex xs5 px-2>
							<v-switch
								color="success"
								hide-details
								:label="labelAccountant"
								v-model="flagAccountingEngine"
								@change="
									$emit('change-flag', {
										model: 'flagAccountingEngine',
										value: $event,
									})
								"
							></v-switch>
						</v-flex>
						<v-flex xs7 px-2>
							<label class="caption">Envío Automático</label>
						</v-flex>
						<v-flex xs5 px-2>
							<v-switch
								color="success"
								hide-details
								:label="labelAccountantAutomatic"
								v-model="flagAccountingAutomatic"
								@change="
									$emit('change-flag', {
										model: 'flagAccountingAutomatic',
										value: $event,
									})
								"
							></v-switch>
						</v-flex>
					</template>
				</v-layout>
			</v-tab-item>
			<v-tab-item id="tab-additional">
				<v-layout
					align-end
					row
					wrap
					px-3
					pt-4
					pb-5
					mb-5
					v-if="!labelsByCountry.code === 'PER'"
				>
					<v-flex xs11>
						<v-layout row wrap align-center>
							<v-flex xs6 px-2>
								<app-input-text
									label="Label"
									model="label"
									:text="additionalInformationModel.label"
									@input="setAdditionalData"
									@input-enter="addAdditional"
								></app-input-text>
							</v-flex>
							<v-flex xs6 px-2>
								<app-input-text
									label="Valor"
									model="value"
									:text="additionalInformationModel.value"
									@input="setAdditionalData"
									@input-enter="addAdditional"
								></app-input-text>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs1 pb-1>
						<app-tooltip-button
							color="success"
							:disabled="
								!additionalInformationModel.label || !additionalInformationModel.value
							"
							icon="add_circle"
							text="Agregar Dato Adicional"
							@click-icon="addAdditional"
						></app-tooltip-button>
					</v-flex>
					<v-flex xs12>
						<v-layout
							row
							wrap
							px-2
							pt-3
							v-if="model.settings.additionalInformation.length > 0"
						>
							Datos adicionales agregados:
						</v-layout>
						<v-layout
							row
							wrap
							align-end
							v-for="(additionalData, index) in model.settings.additionalInformation"
							:key="index"
						>
							<v-flex xs11>
								<v-layout row wrap align-center>
									<v-flex xs6 px-2>
										<app-input-text
											disabled
											readonly
											label="Label"
											:text="additionalData.label"
										></app-input-text>
									</v-flex>
									<v-flex xs6 px-2>
										<app-input-text
											disabled
											readonly
											label="Valor"
											:text="additionalData.value"
										></app-input-text>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs1 pb-1>
								<app-tooltip-button
									color="error"
									icon="remove_circle"
									text="Eliminar Dato Adicional"
									@click-icon="$emit('remove-additional-data', additionalData)"
								></app-tooltip-button>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
				<v-layout wrap row px-3 pt-4 pb-5 mb-5>
					<v-flex xs6 px-2 mb-3>
						<app-select
							model="departmentId"
							item-text="name"
							item-value="id"
							label="Departamento"
							:items="departments"
							:item="model.departmentId"
							@input="setValueUbigeo"
						/>
					</v-flex>
					<v-flex xs6 px-2 mb-3>
						<app-select
							item-text="name"
							item-value="id"
							label="Provincia"
							:items="provinces"
							:item="model.provinceId"
							model="provinceId"
							@input="setValueUbigeo"
						/>
						<transition name="fade" mode="out-in">
							<span
								class="form-group__message"
								v-if="model.departmentId && !model.provinceId"
							>
								Provincia es requerido
							</span>
						</transition>
					</v-flex>
					<v-flex xs6 px-2 mb-3>
						<app-select
							item-text="name"
							item-value="id"
							label="Distrito"
							:items="districs"
							:item="model.districtId"
							model="districtId"
							@input="setValueUbigeo"
						/>
						<transition name="fade" mode="out-in">
							<span
								class="form-group__message"
								v-if="model.departmentId && !model.districtId"
							>
								Distrito es requerido
							</span>
						</transition>
					</v-flex>
					<v-flex xs6 px-2 mb-3>
						<app-input-text
							label="Ubigeo"
							model="ubigeo"
							:text="model.ubigeo"
							disabled
						></app-input-text>
					</v-flex>
					<v-flex xs6 px-2 mb-3>
						<app-input-text
							label="Numero MTC"
							:text="model.settings.numberMtc"
							model="numberMtc"
							@input="$emit('get-data', $event)"
						></app-input-text>
					</v-flex>
				</v-layout>
			</v-tab-item>
		</v-tabs>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="loading || (isEcuador ? $v.$invalid : false)"
				@accept-button-clicked="$emit('save')"
				@cancel-button-clicked="$emit('close')"
			/>
		</section>
	</div>
</template>

<script>
import { maxLength, numeric } from 'vuelidate/lib/validators';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import VueSixFour from 'vue-six-four';

function created() {
	this.loadDepartament();
	const { company } = this.$userInfo || {};
	const { settings } = company || {};
	this.allowProductFree = this.allowProductFreeModel;
	this.flagAccounting = settings ? settings.flagShowAccountingEngine : false;
	this.flagAccountingEngine = this.flagAccountingEngineModel;
	this.flagBillingCron = this.flagBillingCronModel;
	this.flagDetraction = this.flagDetractionModel;
	this.flagSendCopyEmail = this.flagSendCopyEmailModel;
	this.flagDefault = this.flagDefaultModel;
	this.aclCodeSub = this.aclCodeSubModel;
	this.flagAccountingAutomatic = this.flagAccountingAutomaticModel;
	this.withHolding = this.withHoldingModel;
}

async function loadDepartament() {
	try {
		({ data: this.departments } = await this.$httpSales.get('province'));
		if (this.model.departmentId) {
			this.loadProvince(this.model.departmentId);
		}
	} catch (e) {
		this.showGenericError();
	}
}

async function loadProvince(id) {
	try {
		const response = await this.$httpSales(`cities/${id}`);
		this.provinces = [...response.data];
		if (this.model.provinceId) {
			this.loadDistrict(this.model.provinceId);
		}
	} catch (error) {
		this.showGenericError();
	}
}

async function loadDistrict(id) {
	try {
		const response = await this.$httpSales(`parish/${id}`);
		this.districs = [...response.data];
	} catch (error) {
		this.showGenericError();
	}
}

function addAdditional() {
	if (this.additionalInformationModel.label && this.additionalInformationModel.value) {
		this.$emit('add-additional-data', { ...this.additionalInformationModel });
		this.additionalInformationModel = { label: '', value: '' };
	} else {
		this.showNotification(
			'Es necesario agregar información en los dos campos.',
			'warning'
		);
	}
}
function changeModel({ model, value }) {
	this[model] = value;
	this.$emit('change-withHolding-rimpe', { model, value });
}

async function getFile(fileInfo) {
	this.loadingImage = true;
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
			const newImage = new Image();
			newImage.onload = () => {
				if (newImage.naturalWidth <= this.allowedMaxSize) {
					this.$emit('get-data', { model: 'urlLogo', value: file.Location });
					this.loadingImage = false;
				} else {
					this.showNotification(
						`El tamaño máximo de ancho ermitido es ${this.allowedMaxSize}px`,
						'warning'
					);
					this.loadingImage = false;
				}
			};
			newImage.src = file.Location;
		} else {
			this.showNotification(
				`Archivo No válido, solo se permite ${this.allowedFiles.join(',')}`,
				'warning'
			);
		}
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function labelAccountant() {
	return this.flagAccountingEngine ? 'Si' : 'No';
}

function labelAccountantAutomatic() {
	return this.flagAccountingAutomatic ? 'Si' : 'No';
}

function labelProductFree() {
	return this.allowProductFree ? 'Si' : 'No';
}

function labelWithholding() {
	return this.model.settings.withHolding ? 'Si' : 'No';
}

function setAdditionalData({ model, value }) {
	this.additionalInformationModel[model] = value;
}

function showDialog() {
	this.$refs.label.click();
}

function validations() {
	return {
		withholdingAgent: {
			numeric,
			maxLength: maxLength(8),
		},
	};
}

function setValueUbigeo({ model, value }) {
	if (value) {
		if (model === 'departmentId' && value.id) {
			this.model.departmentId = value.id;
			this.model.provinceId = null;
			this.model.districtId = null;
			this.model.ubigeo = '';
			this.districs = [];
			this.loadProvince(value.id);
		} else if (model === 'provinceId' && value.id) {
			this.model.districtId = null;
			this.model.provinceId = value.id;
			this.model.ubigeo = '';
			this.loadDistrict(value.id);
		} else if (model === 'districtId' && value.id) {
			this.model.districtId = value.id;
			this.model.ubigeo = value.code;
		}
	}
}

function data() {
	return {
		active: 'tab-general',
		additionalInformationModel: {
			label: '',
			value: '',
		},
		allowedFiles: ['png'],
		allowedMaxSize: 300,
		allowProductFree: false,
		flagAccounting: false,
		flagAccountingEngine: false,
		flagBillingCron: false,
		flagDetraction: false,
		flagSendCopyEmail: false,
		flagDefault: false,
		aclCodeSub: null,
		flagAccountingAutomatic: false,
		departments: [],
		provinces: [],
		districs: [],
		loadingImage: false,
		withholdingAgent: null,
		withHolding: false,
		rimpe: false,
	};
}

export default {
	name: 'subsidiaries-form',
	components: {
		modalSidebarButton,
		VueSixFour,
	},
	computed: {
		labelAccountant,
		labelAccountantAutomatic,
		labelProductFree,
		labelWithholding,
		spanRuc() {
			if (this.repeatedRuc) {
				return 'El ruc ya está registrado';
			}
			if (!this.model.ruc) {
				return 'El ruc es requerido';
			}
			return null;
		},
	},
	created,
	data,
	methods: {
		addAdditional,
		getFile,
		setAdditionalData,
		showDialog,
		changeModel,
		setValueUbigeo,
		loadDepartament,
		loadProvince,
		loadDistrict,
	},
	validations,
	props: {
		canEditRuc: {
			default: true,
			type: Boolean,
		},
		flagDetractionModel: {
			default: false,
			type: Boolean,
		},
		flagSendCopyEmailModel: {
			default: false,
			type: Boolean,
		},
		allowProductFreeModel: {
			default: false,
			type: Boolean,
		},
		flagAccountingAutomaticModel: {
			default: false,
			type: Boolean,
		},
		flagAccountingEngineModel: {
			default: false,
			type: Boolean,
		},
		loading: {
			default: false,
			type: Boolean,
		},
		model: {
			default: () => {},
			type: Object,
		},
		repeatedRuc: {
			default: false,
			type: Boolean,
		},
		withHoldingModel: {
			default: false,
			type: Boolean,
		},
		flagBillingCronModel: [Number, String],
		flagDefaultModel: [Number, String],
		aclCodeSubModel: [Number, String],
		withholdingRimpe: [Number, String],
	},
	watch: {
		withholdingRimpe: {
			immediate: true,
			handler(val) {
				this.withholdingAgent = val;
			},
		},
	},
};
</script>

<style lang="scss" scoped>
.caption-rimpe {
	color: #8f8f8f;
	font-size: 13px;
}
.label {
	color: color(brown-grey) !important;
	font-family: font(open-regular);
	font-size: size(small13);
	margin-bottom: 1px;
}
</style>
