<template>
	<div>
		<v-layout wrap pt-2 px-4>
			<v-flex xs12 v-if="$route.name === 'new-distributor'" mt-2 mb-3>
				<v-flex class="product-general-column image">
					<label ref="up" for="upload-image">
						<vue-six-four id="upload-image" hidden @vue-six-four="getFile" />
						<button
							class="product-image-container"
							:disabled="isLoadingImage"
							type="button"
							@click="actionUploadImage"
						>
							<template v-if="vendor.photo">
								<img
									:src="vendor.photo"
									class="product-image"
									alt="sube una imagen"
								/>
								<span class="product-image-hover">Cambiar foto</span>
								<button
									@click.stop="openDialogImagen"
									class="product-image-hover-delete"
								>
									<v-icon color="white">clear</v-icon>
								</button>
							</template>
							<template v-else>
								<template v-if="isLoadingImage">
									<span class="product-image-loading"> CARGANDO... </span>
								</template>
								<template v-else>
									<img
										src="/static/img/user-default.svg"
										height="85"
										alt="sube una imagen"
									/>
									<p class="product-image-title mb-0">SUBIR FOTO</p>
									<p class="product-image-size mb-0">HASTA 500KB</p>
								</template>
							</template>
						</button>
					</label>
				</v-flex>
			</v-flex>
			<v-flex xs12>
				<app-input-text
					label="Nombre"
					model="name"
					:text="vendor.name"
					@input="$emit('on-input', $event)"
				></app-input-text>
				<template v-if="validations && validations.name">
					<span class="error--text caption" v-if="validations.name.$invalid">
						El nombre es requerido
					</span>
				</template>
			</v-flex>
			<v-flex xs12 pt-1 v-if="!isRuc">
				<app-input-text
					label="Apellido"
					model="lastName"
					:text="vendor.lastName"
					@input="$emit('on-input', $event)"
				></app-input-text>
				<template v-if="validations && validations.lastName">
					<span
						class="error--text caption"
						v-if="validations.lastName.$invalid"
					>
						El apellido es requerido
					</span>
				</template>
			</v-flex>
			<v-flex xs6 pr-2 pt-1>
				<app-select
					:item="vendor.documentTypeId"
					item-text="name"
					item-value="id"
					:items="documentTypes"
					label="Tipo de Documento"
					model="documentTypeId"
					@input="$emit('on-input', $event)"
				></app-select>
				<template v-if="validations && validations.documentTypeId">
					<span
						class="error--text caption"
						v-if="validations.documentTypeId.$invalid"
					>
						El tipo de documento es requerido
					</span>
				</template>
			</v-flex>
			<v-flex xs6 pl-2 pt-1>
				<app-input-text
					label="Nro Documento"
					model="documentNumber"
					:text="vendor.documentNumber"
					@input="$emit('on-input', $event)"
				></app-input-text>
				<template v-if="validations && validations.documentNumber">
					<span
						class="error--text caption"
						v-if="validations.documentNumber.$invalid"
					>
						El número de documento es requerido
					</span>
				</template>
			</v-flex>
			<v-flex xs6 pt-1>
				<label class="caption">Grupos</label>
				<v-select
					placeholder="Seleccionar Grupo"
					class="filter-select"
					item-text="name"
					item-value="id"
					:items="groups"
					v-model="vendor.group"
				></v-select>
				<small class="warning--text" v-if="groups.length <= 0">
					* No tiene grupos asignados
				</small>
			</v-flex>
			<v-flex xs6 pt-1 pl-2>
				<app-input-text
					:max-length="typeTransportCode === 'Moto' ? 11 : 9"
					label="Número de Licencia"
					model="numberLicence"
					:text="vendor.numberLicence"
					@input="$emit('on-input', $event)"
				></app-input-text>
			</v-flex>
			<v-flex xs12 pt-1>
				<app-input-text
					:disabled="disabledEmail"
					label="Correo Electrónico"
					model="email"
					:text="vendor.email"
					@input="$emit('on-input', $event)"
				></app-input-text>
				<template v-if="validations && validations.email">
					<span class="error--text caption" v-if="!validations.email.required">
						El correo electrónico es requerido
					</span>
					<span class="error--text caption" v-if="!validations.email.email">
						El formato del correo electrónico ingresado es incorrecto
					</span>
				</template>
				<!-- <template v-if="vendor.email && !isValid && !vendor.id">
					<span class="error--text caption">
						El correo ingresado no es válido
					</span>
				</template> -->
			</v-flex>
			<v-flex v-if="!$route.params.id && $route.name === 'new-vendor'">
				<app-input-text
					autocomplete="off"
					label="Contraseña"
					model="password"
					:text="vendor.password"
					type="password"
					@input="$emit('on-input', $event)"
				></app-input-text>
			</v-flex>
			<v-flex mt-2 xs12 md10 pr-2 v-if="$route.name !== 'new-vendor'">
				<v-flex xs12>
					<v-checkbox
						:disabled="vendor.flagLimit === 1"
						color="primary"
						class="checkbox-customers"
						model="flagLimitUsers"
						label="Crear usuario con acceso al sistema"
						v-model="vendor.flagLimitUsers"
						:true-value="1"
						:false-value="0"
						@change="
							$emit('on-change', { model: 'flagLimitUsers', value: $event })
						"
					></v-checkbox>
				</v-flex>
			</v-flex>
			<v-flex xs6 pt-1 v-if="createPassword && vendor.flagLimitUsers">
				<app-input-text
					autocomplete="off"
					label="Contraseña"
					model="password"
					:text="vendor.password"
					type="password"
					@input="$emit('on-input', $event)"
				></app-input-text>
				<template v-if="validations && validations.password">
					<span
						class="error--text caption"
						v-if="!validations.password.required"
					>
						La contraseña es requerida
					</span>
					<span
						class="error--text caption"
						v-if="
							!validations.password.minLength || !validations.password.maxLength
						"
					>
						Ingresar de 6 a 12 caracteres
					</span>
				</template>
			</v-flex>
			<v-flex pt-1 pl-2 :class="createPassword ? 'xs6' : 'xs12 pl-0'">
				<app-input-text
					label="Teléfono"
					model="phone"
					type="number"
					:text="vendor.phone"
					@input="$emit('on-input', $event)"
				></app-input-text>
				<template v-if="validations && validations.phone">
					<span class="error--text caption" v-if="validations.phone.$invalid">
						El teléfono es requerido
					</span>
				</template>
			</v-flex>
			<v-flex xs12 pt-1>
				<app-input-text
					label="Dirección"
					model="address"
					:text="vendor.address"
					@input="$emit('on-input', $event)"
				></app-input-text>
			</v-flex>
		</v-layout>
		<v-dialog v-model="dialogImage" persistent max-width="425">
			<v-card>
				<v-card-text class="subtext">
					Desea eliminar la imagen del producto
				</v-card-text>
				<v-card-actions class="btn-block">
					<v-layout row wrap justify-center>
						<v-btn
							color="error"
							class="btn-auto btn-action py-2 px-4 white--text"
							@click.native="cancelDialogImage"
						>
							Cancelar
						</v-btn>
						<v-btn
							color="primary"
							class="btn-auto btn-action py-2 px-4 white--text"
							@click.native="deleteImagenProduct"
						>
							Aceptar
						</v-btn>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import upLoadImageMixin from '@/mixins/upLoadImage';
import VueSixFour from 'vue-six-four';

function captureLocation(value) {
	this.$emit('on-input', { model: 'photo', value });
}

function cancelDialogImage() {
	this.dialogImage = false;
}

function deleteImagenProduct() {
	this.$emit('on-input', { model: 'photo', value: null });
	this.cancelDialogImage();
}

function openDialogImagen() {
	this.dialogImage = true;
}

function data() {
	return {
		dialogImage: false,
	};
}

export default {
	name: 'vendors-general-data',
	components: {
		VueSixFour,
	},
	data,
	methods: {
		cancelDialogImage,
		deleteImagenProduct,
		openDialogImagen,
	},
	computed: {
		isRuc() {
			return this.vendor.documentTypeId === 2;
		},
	},
	mixins: [upLoadImageMixin],
	props: {
		createPassword: {
			default: true,
			type: Boolean,
		},
		disabledEmail: {
			default: false,
			type: Boolean,
		},
		documentTypes: {
			default: () => [],
			type: Array,
		},
		isValid: {
			default: true,
			type: Boolean,
		},
		validations: {
			default: () => {},
			type: Object,
		},
		vendor: {
			default: () => {},
			type: Object,
		},
		groups: {
			default: () => [],
			type: Array,
		},
		typeTransportCode: {
			type: String,
		},
	},
	watch: {
		captureLocation,
	},
};
</script>
<style lang="scss" scoped>
.product-image-container {
	align-items: center;
	background-color: rgba(156, 166, 176, 0.07);
	border: 1px dashed #9ca6b0;
	border-radius: 5px;
	color: rgba(156, 166, 176, 0.4);
	display: flex;
	flex-direction: column;
	flex-wrap: wrap;
	font-family: font(open-bold);
	font-size: size(medium15);
	height: 206px;
	justify-content: center;
	max-width: 232px;
	position: relative;
	width: 100%;

	&:hover > .product-image-hover {
		display: flex;
	}

	&:hover > .product-image-hover-delete {
		display: block;
	}
}

.product-image {
	border-radius: 4px;
	max-height: 90%;
	max-width: 90%;

	&-hover {
		align-content: center;
		background-color: rgba(0, 0, 0, 0.35);
		border-radius: 4px;
		bottom: 0px;
		color: color(white);
		display: none;
		flex-direction: row;
		flex-wrap: wrap;
		font-family: font(open-bold);
		font-size: size(small13);
		height: 100%;
		justify-content: center;
		left: 0px;
		margin: auto;
		max-height: 90%;
		max-width: 90%;
		position: absolute;
		right: 0px;
		top: 0px;
		width: 100%;
	}

	&-hover-delete {
		display: none;
		position: absolute;
		top: 13px;
		right: 10px;
	}
}

.subtext {
	color: color(paginationText);
	font-family: font(open-semibold);
	font-size: size(medium) !important;
	letter-spacing: normal !important;
	line-height: 1 !important;
	margin: auto !important;
	max-width: 340px !important;
	padding: 34px 0px 0px !important;
	text-align: center !important;
}
</style>
