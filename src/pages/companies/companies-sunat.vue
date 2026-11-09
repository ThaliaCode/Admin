<template>
	<section>
		<form class="pa-3" method="post" @submit.prevent="uploadFiles">
			<v-layout wrap>
				<v-flex mb-3 xs6 v-if="isPeru">
					<app-select
						:item="facturador"
						:disabled="true"
						item-text="name"
						item-value="id"
						:items="facturadorOptions"
						label="Facturador"
						model="facturador"
						:return-object="false"
						@input="getData"
					/>
				</v-flex>
				<v-flex mb-3 xs6 pr-2>
					<app-select
						:item="subsidiary"
						item-text="sucursalName"
						:item-value="labelsByCountry.subsidiaryValue"
						:items="subsidiaries"
						:label="labelSucursal()"
						model="subsidiary"
						return-object
						@input="getData"
					/>
				</v-flex>
				<v-flex mb-3 xs6 pl-2>
					<app-select
						:item="flagProduction"
						item-text="name"
						item-value="value"
						:items="environments"
						label="Entorno"
						model="flagProduction"
						:return-object="false"
						@input="getData"
					/>
				</v-flex>
				<v-flex xs6 mb-3 pr-2 v-if="isPeru && showCredentialsFields">
					<label class="caption">Usuario Sunat</label>
					<v-text-field
						single-line
						class="filter-select"
						content-class="filter-select-content"
						label="Usuario Sunat"
						v-model="sunatUser"
					>
					</v-text-field>
					<span class="form-group__message" v-if="$v.sunatUser.$invalid">
						El usuario es requerido
					</span>
				</v-flex>
				<v-flex xs6 mb-3 pl-2 v-if="!isPeru || showCredentialsFields">
					<label class="caption">Contraseña {{ labelsByCountry.taxAgency }}</label>
					<v-text-field
						single-line
						class="filter-select"
						content-class="filter-select-content"
						:label="`Contraseña ${labelsByCountry.taxAgency}`"
						type="password"
						v-model="sunatPassword"
					>
					</v-text-field>
					<span
						class="form-group__message"
						v-if="
							($v.sunatPassword && $v.sunatPassword.$invalid) ||
							($v.sunatInfo && $v.sunatInfo.clave.$invalid)
						"
					>
						La contraseña es requerida
					</span>
				</v-flex>
				<v-flex xs12 v-if="!isPeru || showCredentialsFields">
					<label for="cert" ref="cert">
						<v-btn
							block
							color="primary lighten-1"
							type="button"
							@click="showDialog('cert')"
						>
							Seleccionar Certificado
						</v-btn>
						<span>{{ files[0].name }}</span>
						<vue-six-four
							:accept="acceptByCountry"
							hidden
							id="cert"
							@vue-six-four="getFileInfo($event)"
						>
						</vue-six-four>
					</label>
					<span
						class="form-group__message"
						v-if="
							($v.files && $v.files.$each[0].$invalid) ||
							($v.sunatInfo && $v.sunatInfo.certificado.$invalid)
						"
					>
						El certificado es requerido
					</span>
				</v-flex>
				<v-flex xs12 v-if="isPeru && showCredentialsFields">
					<label for="key" ref="key">
						<v-btn
							block
							color="primary lighten-1"
							type="button"
							@click="showDialog('key')"
						>
							Seleccionar Llave
						</v-btn>
						<span>{{ files[1].name }}</span>
						<vue-six-four
							accept=".key, .pem, .cert"
							hidden
							id="key"
							@vue-six-four="getFileInfo($event, 'key')"
						>
						</vue-six-four>
					</label>
					<span class="form-group__message" v-if="$v.files && $v.files.$each[1].$invalid">
						La llave es requerida
					</span>
					<span class="form-group__message" v-if="$v.files && $v.files.pairComplete === false">
						Debes subir certificado y llave juntos
					</span>
				</v-flex>
			</v-layout>
		</form>
		<section class="fast-register-footer">
			<modal-sidebar-button
				:is-loading="disabled"
				:on-run-service="isLoading"
				@cancel-button-clicked="closeModal"
				@accept-button-clicked="uploadFiles"
			/>
		</section>
	</section>
</template>

<script>
import { minLength, required } from 'vuelidate/lib/validators';
import helper from '@/shared/helper';
import vueSixFour from 'vue-six-four';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function environments() {
	const list = this.isPeru ? this.environmentsPeru : this.enviromentsEcu;
	if (!this.isPeru) {
		return list;
	}
	if (this.currentEnvironmentIsProduction) {
		return list.filter((e) => e.value === true);
	}
	if (this.isConfigured) {
		return list.filter((e) => e.value !== null);
	}
	return list;
}

function data() {
	return {
		environmentsPeru: [
			{
				id: 0,
				name: 'Sin configurar',
				value: null,
			},
			{
				id: 1,
				name: 'Pruebas',
				value: false,
			},
			{
				id: 2,
				name: 'Producción',
				value: true,
			},
		],
		enviromentsEcu: [
			{ id: 0, name: 'Pruebas', value: 0 },
			{ id: 1, name: 'Producción', value: 1 },
		],
		facturador: 'legacy',
		facturadorOptions: [
			{ id: 'legacy', name: 'Facturador V1' },
			{ id: 'nuevo', name: 'Facturador V2' },
		],
		files: [
			{
				file: '',
				name: '',
				type: 'txt',
				typeDocument: '',
			},
			{
				name: '',
				file: '',
				type: 'txt',
				typeDocument: 'key',
			},
		],
		flagProduction: null,
		isLoading: false,
		subsidiary: null,
		sunatUser: '',
		sunatPassword: '',
	};
}

function mounted() {
	this.files[0].typeDocument = this.isPeru ? 'cert' : 'p12';
}

function acceptByCountry() {
	return this.isPeru ? 'application/x-x509-ca-cert' : 'application/x-pkcs12';
}

function closeModal() {
	this.$emit('close-modal');
}

function configuredFacturador() {
	if (!this.isConfigured) {
		return 'legacy';
	}
	const type = this.selectedSubsidiary && this.selectedSubsidiary.typeBillingAgreed;
	return type === 'sunatFactV4' ? 'nuevo' : 'legacy';
}

function currentEnvironmentIsProduction() {
	return this.isPeru && !!this.selectedSubsidiary && this.selectedSubsidiary.typeAmbientTax === 2;
}

function disabled() {
	return this.isLoading || this.$v.$invalid;
}

function getData({ model, value }) {
	if (model === 'subsidiary') {
		this.subsidiary = value[this.labelsByCountry.subsidiaryValue];
		if (this.isPeru) {
			const selected = this.selectedSubsidiary;
			this.flagProduction = this.isConfigured ? selected.typeAmbientTax === 2 : null;
			this.facturador = this.configuredFacturador;
			this.sunatUser = '';
			this.sunatPassword = '';
			this.files = this.files.map((f) => ({ ...f, file: '', name: '' }));
		}
	} else {
		this[model] = value;
	}
}

function getFileInfo({ sixFour, name }, key) {
	const keyFile = key || this.keyName;
	const fileIndex = this.files.findIndex((f) => f.typeDocument === keyFile);
	if (fileIndex > -1) {
		this.files[fileIndex].file = sixFour;
		this.files[fileIndex].name = name;
	}
}

function isConfigured() {
	return !!this.selectedSubsidiary && this.selectedSubsidiary.flagTaxes === 1;
}

function isPeru() {
	return this.labelsByCountry.id === 1;
}

function keyName() {
	return this.isPeru ? 'cert' : 'p12';
}

function selectFirst(newVal) {
	if (newVal.length > 0) {
		this.getData({ model: 'subsidiary', value: newVal[0] });
	}
}

function selectedSubsidiary() {
	return this.subsidiaries.find(
		(s) => s[this.labelsByCountry.subsidiaryValue] === this.subsidiary
	);
}

function filesPairComplete(files) {
	const hasAny = files.some((f) => f.file);
	const hasAll = files.every((f) => f.file);
	return !hasAny || hasAll;
}

function requireCredentials() {
	return !this.isConfigured || this.flagProduction;
}

function showCredentialsFields() {
	return this.isPeru && this.facturador === 'legacy';
}

function showDialog(key) {
	this.$refs[key].click();
}

function sunatInfo() {
	const subsidiary = this.selectedSubsidiary;
	const result = {};
	if (!subsidiary) {
		return result;
	}
	if (this.isPeru) {
		result.ruc = this.subsidiary;
		result.mode = this.flagProduction ? 'PRODUCCION' : 'DEMO';
		if (this.facturador === 'nuevo') {
			result.facturador = 'apiFacturadorV2';
		} else {
			result.facturador = 'facsunat';
			if (this.showCredentialsFields) {
				result.postalAddressStreetName = subsidiary.address;
				result.nameName = subsidiary.sucursalName;
				result.telephone = subsidiary.phone;
				result.email = subsidiary.email;
				result.legalEntityRegistrationName = subsidiary.rzSocial;
				if (this.sunatUser) {
					result.sunatUser = this.sunatUser;
				}
				if (this.sunatPassword) {
					result.sunatPassword = this.sunatPassword;
				}
			}
		}
	} else {
		const file = this.files[0].file.split(',');
		result.branchId = this.subsidiary;
		result.certificado = file[1];
		result.clave = this.sunatPassword;
		result.companyId = this.$userInfo.companyId;
		result.companyName = this.$userInfo.company.companyName;
		result.ruc = subsidiary.ruc;
		result.flagEnvironment = this.flagProduction;
	}
	return result;
}

async function uploadFiles() {
	this.isLoading = true;
	try {
		const body = { ...this.sunatInfo };
		if (this.isPeru) {
			if (this.showCredentialsFields) {
				body.aclId =
					this.$userInfo.company && this.$userInfo.company.id
						? this.$userInfo.company.id
						: undefined;
				body.domainResponse =
					helper.getEndPointDynamic('SALES_URL') || process.env.SALES_URL;
				body.flagProduction = this.flagProduction;
				if (this.files.some((f) => f.file)) {
					body.fileUpload = this.files;
				}
				await this.$httpFacSunat.post('admin/one-upload', body);
				await this.$httpSales.patch(`subsidiaries-type-ambient-tax/${this.subsidiary}`, {
					typeAmbientTax: this.flagProduction ? 2 : 1,
				});
			} else {
				await this.$httpSales.post('facturacion-sunat-environment', body);
			}
		} else {
			body.fileUpload = this.files;
			await this.$httpFacSunat.post('admin/one-upload', body);
		}

		this.showNotification('Credenciales configuradas correctamente');
		this.$emit('sunat-success', {
			subsidiary: this.subsidiary,
			typeAmbientTax: this.isPeru ? (this.flagProduction ? 2 : 1) : undefined,
			typeBillingAgreed:
				this.isPeru && this.facturador === 'nuevo' ? 'sunatFactV4' : undefined,
		});
		this.closeModal();
	} catch (rawError) {
		const error = rawError || {};
		const errorCode = error.data && error.data.message;
		if (errorCode === 'ENVIRONMENT_DOWNGRADE_NOT_ALLOWED') {
			this.showGenericError('No es posible volver de Producción a Pruebas');
		} else if (errorCode === 'SUBSIDIARY_HAS_SALES') {
			this.showGenericError(
				error.data.messageError ||
					'No se puede pasar a Producción: la sucursal ya registra ventas'
			);
		} else if (
			error.status === 400 &&
			error.data &&
			error.data.apierror &&
			error.data.apierror.subErrors
		) {
			error.data.apierror.subErrors.forEach((err) => {
				if (err.field === 'clave') {
					this.showGenericError('Debe ingresar la contraseña');
				}
				if (err.field === 'certificado') {
					this.showGenericError('Debe adjuntar un certificado');
				}
			});
		} else {
			this.showGenericError();
		}
	} finally {
		this.isLoading = false;
	}
}

function validations() {
	if (this.isPeru) {
		const rules = {
			subsidiary: {
				required,
			},
		};
		if (this.showCredentialsFields) {
			const credentialRules = this.requireCredentials ? { required } : {};
			rules.sunatUser = credentialRules;
			rules.sunatPassword = credentialRules;
			rules.files = {
				pairComplete: filesPairComplete,
				$each: {
					file: this.requireCredentials
						? {
								required,
								minLength: minLength(1),
						  }
						: {},
				},
			};
		}
		return rules;
	}
	return {
		sunatInfo: {
			branchId: {
				required,
			},
			certificado: {
				required,
			},
			clave: {
				required,
			},
			companyId: {
				required,
			},
			companyName: {
				required,
			},
			ruc: {
				required,
			},
		},
	};
}

export default {
	name: 'companies-sunat',
	components: {
		modalSidebarButton,
		vueSixFour,
	},
	computed: {
		acceptByCountry,
		configuredFacturador,
		currentEnvironmentIsProduction,
		disabled,
		environments,
		isConfigured,
		isPeru,
		keyName,
		requireCredentials,
		selectedSubsidiary,
		showCredentialsFields,
		sunatInfo,
	},
	data,
	methods: {
		closeModal,
		getData,
		getFileInfo,
		showDialog,
		uploadFiles,
	},
	mounted,
	props: {
		subsidiaries: {
			type: Array,
			default: () => [],
		},
	},
	validations,
	watch: {
		subsidiaries: {
			handler: selectFirst,
			immediate: true,
		},
	},
};
</script>
