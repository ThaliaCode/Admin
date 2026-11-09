<template>
	<div class="payroll-employee-create grey-background pa-5">
		<div>
			<div>
				<h4 class="py-2 pl-2 mb-2 title-payroll">DATOS DEL EMPLEADO</h4>
			</div>
			<v-layout row wrap>
				<v-flex xs6 pr-3>
					<v-layout row wrap>
						<v-flex xs12 md12 pr-2 mb-3>
							<label ref="label" for="upload-file-payroll" class="w-100">
							<vue-six-four id="upload-file-payroll" hidden @vue-six-four="getFileUpdate"/>
								<v-layout wrap>
									<v-flex xs11>
										<app-input-text
											label="Foto"
											readonly
											:text="model.urlImage"
										/>
									</v-flex>
									<v-flex xs1 mt-4 text-xs-right>
										<v-btn	
											class="ma-0 pl-0 btn-auto"
											small
											@click="showDialog"
											color="primary">
											<v-icon color="white">camera_alt</v-icon>
										</v-btn>
									</v-flex>
								</v-layout>
								</label>
						</v-flex>
						<v-flex xs12 md12 pr-2 mb-3 v-if="model.urlImage">
							<img 
								:src="model.urlImage" 
								:alt="model.urlImage"
								class="photo"
							>
						</v-flex>
						<v-flex xs12 md12 pr-2 mb-2 mt-2>
							<v-text-field
								label="Código"
								v-model="model.code"
								:readonly="!!code"
								class="filter-select shadow-inset"
							></v-text-field>
							<span class="form-group__message"
								v-if="$v.model.code.$invalid">
								El código es requerido.
							</span>
							<span
								class="text-not-code-blank"
								v-if="checkBlankCode(model.code)">
								No se permite espacios en blanco
							</span>
						</v-flex>
						<v-flex xs6 md6 pr-2 mb-3>
							<label class="caption">Tipo de Documento</label>
							<v-select
								label="Tipo de Documento"
								:items="typeDocuments"
								single-line
								item-text="name"
								item-value="id"
								bottom
								hide-details
								class="filter-select shadow-inset"
								v-model="model.typePersonId"
								@input="setData($event, 'type-document')"
							></v-select>
							<span class="form-group__message"
								v-if="$v.model.typePersonId.$invalid">
								El tipo de documento es requerido.
							</span>
						</v-flex>
						<v-flex xs6 md6 pr-2 mb-3 pt-4>
							<v-text-field
								label="Número de documento"
								v-model="model.documentNumber"
								class="filter-select shadow-inset"
								:disabled="!model.typePersonId"
								@input="setData($event, 'document')"
							></v-text-field>
							<span class="form-group__message"
								v-if="!$v.model.documentNumber.required">
								El número de documento es requerido.
							</span>
							<span class="form-group__message"
								v-if="!$v.model.documentNumber.minLength
								|| !$v.model.documentNumber.maxLength">
								{{ documentMessage }}
							</span>
						</v-flex>
						<v-flex xs12 md12 pr-2 mb-3>
							<v-text-field
								label="Cod.Contable"
								v-model="model.accountingAccount"
								class="filter-select shadow-inset"
							></v-text-field>
						</v-flex>
						<v-flex xs12 md12 pr-2 mb-3>
							<v-text-field
								label="Nombres"
								v-model="model.name"
								class="filter-select shadow-inset"
							></v-text-field>
							<span class="form-group__message"
								v-if="$v.model.name.$invalid">
								El nombre es requerido.
							</span>
						</v-flex>
						<v-flex xs12 md12 pr-2 mb-3>
							<v-text-field
								label="Apellidos"
								v-model="model.lastname"
								class="filter-select shadow-inset"
							></v-text-field>
							<span class="form-group__message"
								v-if="$v.model.lastname.$invalid">
								El apellido es requerido.
							</span>
						</v-flex>
						<v-flex xs12 md12 pr-2 mb-3 v-if="id">
							<v-text-field
								label="Nro Carga Familiar"
								v-model="model.familyNumber"
								class="filter-select shadow-inset"
							></v-text-field>
						</v-flex>
						<v-flex xs12 md12 pr-2 mb-3 v-if="id">
							<v-text-field
								label="Nro de Hijos"
								v-model="model.numberOfChildren"
								class="filter-select shadow-inset"
							></v-text-field>
						</v-flex>
						<v-flex xs12 md12 pr-2 mb-3 v-if="id">
							<v-text-field
								label="Nro Carga Estudiantes"
								v-model="model.numberOfstudents"
								class="filter-select shadow-inset"
							></v-text-field>
						</v-flex>
						<v-flex xs12 md12 pr-2 mb-3>
							<v-text-field
								label="Ext Contable"
								v-model="model.accountingExt"
								class="filter-select shadow-inset"
							></v-text-field>
						</v-flex>
						<v-flex 
							xs12 
							pr-2 mb-3 
							v-if="edit && model.familyBurden">
							<v-text-field
								label="Carga Familiar"
								v-model="model.familyBurden.cantFamilyBurden"
								class="filter-select shadow-inset"
								readonly
							></v-text-field>
						</v-flex>
						<v-flex 
							xs12 
							pr-2 
							mb-3 
							v-if="edit && model.familyBurden">
							<v-text-field
								label="Número de hijos"
								v-model="model.familyBurden.cantChildrens"
								class="filter-select shadow-inset"
								readonly
							></v-text-field>
						</v-flex>
						<v-flex 
							xs12 
							pr-2 
							mb-3 
							v-if="edit && model.familyBurden">
							<v-text-field
								label="Número de Estudiantes"
								v-model="model.familyBurden.cantStudents"
								class="filter-select shadow-inset"
								readonly
							></v-text-field>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs6 pl-3>
					<v-layout row wrap>
						<v-flex xs12 md12 pr-2 mb-3 pt-4>
							<v-text-field
								label="Nacionalidad"
								v-model="model.nationality"
								class="filter-select shadow-inset"
							></v-text-field>
						</v-flex>
						<v-flex xs12 md12 pr-2 mb-3>
							<label class="caption">Sexo</label>
							<v-select
								:items="gender"
								label="Sexo"
								single-line
								item-text="name"
								item-value="id"
								bottom
								hide-details
								class="filter-select shadow-inset"
								v-model="model.genderId"
							></v-select>
							<span class="form-group__message"
								v-if="$v.model.genderId.$invalid">
								El sexo es requerido.
							</span>
						</v-flex>
						<v-flex xs12 md12 mb-3>
							<label class="caption">Estado Cívil</label>
							<v-select
								label="Estado Cívil"
								:items="civilStatus"
								single-line
								item-text="name"
								item-value="id"
								bottom
								hide-details
								class="filter-select shadow-inset"
								v-model="model.civilStatusId"
							></v-select>
							<span class="form-group__message"
								v-if="$v.model.civilStatusId.$invalid">
								El estado cívil es requerido.
							</span>
						</v-flex>
						<v-flex xs12 md12 mb-3>
							<label class="caption">Tipo de Sangre</label>
							<v-select
								label="Tipo de Sangre"
								:items="bloodType"
								single-line
								item-text="name"
								item-value="id"
								bottom
								hide-details
								class="filter-select shadow-inset"
								v-model="model.bloodTypeId"
							></v-select>
						</v-flex>
						<v-flex xs12 md12 mb-3>
							<v-layout class="max-height">
								<v-flex xs5 md5 mb-3>
									<v-checkbox
										label="Licencia de Conducir"
										hide-details
										v-model="flagDriverLicense"
									></v-checkbox>
								</v-flex>
								<v-flex xs7 md7>
									<v-text-field
										v-show="flagDriverLicense"
										label="Licencia de Conducir"
										v-model="model.driverLicense"
										class="filter-select shadow-inset"
									></v-text-field>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex xs12 md12 mb-3>
							<v-text-field
								label="Teléfono"
								model="phone"
								type="number"
								v-model="model.phone"
								class="filter-select shadow-inset"
							></v-text-field>
						</v-flex>
						<v-flex xs12 md12 pr-2 mb-3>
							<v-text-field
								label="Email"
								v-model="model.email"
								class="filter-select shadow-inset"
							></v-text-field>
							<span class="form-group__message"
								v-if="$v.model.email.$invalid">
								Ingrese un email válido
							</span>
						</v-flex>
						<v-flex xs12 md12 mb-3>
							<v-text-field
								label="Dirección"
								v-model="model.address"
								class="filter-select shadow-inset"
							></v-text-field>
							<span class="form-group__message"
								v-if="$v.model.address.$invalid">
								La dirección es requerida
							</span>
						</v-flex>
						<v-flex xs12 md12 mb-3>
							<v-text-field
								label="Notificar a"
								v-model="model.referenceFullName"
								class="filter-select shadow-inset"
							></v-text-field>
						</v-flex>
						<v-flex xs12 md12 mb-3>
							<v-text-field
								class="filter-select shadow-inset"
								label="Télefono Notificar"
								v-model="model.referencePhone"
								type="number"
							></v-text-field>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
		</div>
		<div>
			<div>
				<h4 class="py-2 pl-2 mt-3 title-payroll">OBSERVACIÓN</h4>
			</div>
			<v-layout row wrap>
				<v-flex xs12 md12 pr-2 mb-3>
					<label class="caption">Observación</label>
					<v-text-field
						no-resize
						multi-line
						class="textarea-content filter-select shadow-inset"
						v-model="model.observation"
					></v-text-field>
				</v-flex>
			</v-layout>
		</div>
	</div>
</template>
<script>
import VueSixFour from 'vue-six-four';
import { required, email, maxLength, minLength } from 'vuelidate/lib/validators';
import helper from '@/shared/helper';

function onDate(value, modelName) {
	if (modelName === 'familyNumber' || modelName === 'numberOfChildren' || modelName === 'numberOfstudents') {
		this[modelName] = value;
	} else {
		this.model[modelName] = value;
	}
}

function showDialog() {
	this.$refs.label.click();
}

async function getFileUpdate(fileInfo) {
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
			this.model.urlImage = file.Location;
		} else {
			this.showNotification(`Archivo no válido, solo se permite ${this.allowedFiles.join(',')}`, 'warning');
		}
	} catch (error) {
		this.showGenericError();
	}
}

function setData(value, flag) {
	if (flag === 'type-document') {
		this.personType = this.typeDocuments.find(p => p.id === value) || {};
	} else if (!this.$v.model.documentNumber.$invalid) {
		if (this.isEcuador) {
			this.peruDatosRequest(value);
		}
	}
}

function validations() {
	const newValidation = { required };
	if (this.personValidations) {
		if (this.personValidations.maxLength) {
			newValidation.maxLength = maxLength(this.maxDocument);
		}
		if (this.personValidations.minLength) {
			newValidation.minLength = minLength(this.minDocument);
		}
	}
	return {
		model: {
			code: { required },
			name: { required },
			lastname: { required },
			email: { email },
			documentNumber: newValidation,
			typePersonId: { required },
			genderId: { required },
			civilStatusId: { required },
			address: { required },
		},
	};
}

function created() {
	this.disabled = this.$v.model.$invalid;
}

async function peruDatosRequest(value) {
	const url = `dni/${value}`;
	const params = { codeCountry: 'ECU' };
	try {
		const { data: response } = await this.$httpSunat.get(url, { params });
		this.model.name = response.data.nombres;
		this.model.lastname = `${response.data.ape_paterno} ${response.data.ape_materno}`;
	} catch (error) {
		this.showNotification(
			'Los datos no se consiguieron. Verifique la información o complete el formulario manualmente',
			'info');
	}
}

function data() {
	return {
		driverLicense: [],
		country: [],
		province: [],
		gradeOfDisability: [],
		disabilitys: [],
		disability: false,
		birthdate: null,
		allowedFiles: [
			'jpg',
			'jpeg',
			'png',
		],
		familyNumber: '',
		numberOfChildren: '',
		numberOfstudents: '',
		disabled: true,
		flagDriverLicense: false,
	};
}
export default {
	name: 'employee-data',
	components: {
		VueSixFour,
	},
	data,
	created,
	methods: {
		onDate,
		getFileUpdate,
		showDialog,
		setData,
		peruDatosRequest: helper.debounce(peruDatosRequest),
	},
	props: {
		bloodType: {
			type: [Array, Object],
			default: () => [],
		},
		typeDocuments: {
			type: [Array, Object],
			default: () => [],
		},
		gender: {
			type: [Array, Object],
			default: () => [],
		},
		civilStatus: {
			type: [Array, Object],
			default: () => [],
		},
		id: {
			type: [Array, String],
		},
		model: {
			type: Object,
			default: () => {},
		},
		code: {
			type: [Number, String],
			default: null,
		},
		edit: {
			type: Boolean,
			default: false,
		},
	},
	validations,
};
</script>
<style lang="scss" scoped>
	.payroll-employee-create {
		.title-payroll {
			border-bottom: 1px solid map-get($colors , blue-grey);
		}

		.max-height {
			height: 54px;
		}

		.photo {
			display: block;
			height: 200px;
			margin: auto;
			max-width: 400px;
		}
	}
</style>


