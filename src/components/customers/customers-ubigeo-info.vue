<template>
	<div>
		<v-layout wrap py-2 px-3>
			<v-flex xs6 px-2 mb-1>
				<app-input-text
					label="Alias"
					model="name"
					:text="model.name"
					@input="$emit('set-data', $event, true)"
				/>
			</v-flex>
			<v-flex xs6 px-2 mb-1>
				<app-select
					:item="model.provinceId"
					item-text="name"
					item-value="id"
					:items="provinces"
					:label="isPeru ? 'Departamento' : 'Provincia'"
					model="provinceId"
					:return-object="false"
					@input="$emit('set-data', $event, true)"
				/>
				<span class="error--text caption" v-if="disabled">
					{{ isPeru ? 'Departamento' : 'Provincia' }} es requerida
				</span>
			</v-flex>
			<v-flex xs6 px-2 mb-1>
				<app-select
					:item="model.cityId"
					item-text="name"
					item-value="id"
					:items="cities"
					:disabled="disabled"
					:readonly="disabled"
					:label="isPeru ? 'Provincia' : 'Ciudad'"
					model="cityId"
					:return-object="false"
					@input="$emit('set-data', $event, true)"
				/>
				<span class="error--text caption" v-if="!model.cityId">
					{{ isPeru ? 'Provincia' : 'Ciudad' }} es requerida
				</span>
			</v-flex>
			<v-flex xs6 px-2 mb-1>
				<app-select
					:item="model.parishId"
					item-text="name"
					item-value="id"
					:items="parishes"
					:disable="!model.cityId"
					:readonly="!model.cityId"
					:label="isPeru ? 'Distrito' : 'Parroquia'"
					model="parishId"
					:return-object="false"
					@input="$emit('set-data', $event, true)"
				/>
				<span class="error--text caption" v-if="!model.parishId">
					{{ isPeru ? 'Distrito' : 'Parroquia' }} es requerida
				</span>
			</v-flex>
			<v-flex xs6 px-2 mb-1>
				<app-input-text
					label="Zona"
					model="addressLine2"
					:text="model.addressLine2"
					@input="$emit('set-data', $event, true)"
				/>
			</v-flex>
			<v-flex xs6 px-2 mb-1>
				<app-input-text
					label="Cod. Postal"
					model="zipcode"
					:text="model.zipcode"
					@input="$emit('set-data', $event, true)"
				/>
			</v-flex>
			<v-flex xs6 px-2 mb-1>
				<app-input-text
					label="Interior"
					model="number"
					:text="model.number"
					@input="$emit('set-data', $event, true)"
				/>
			</v-flex>
			<v-flex xs6 px-2 mb-1>
				<app-input-text
					label="Refrencia"
					model="reference"
					:text="model.reference"
					@input="$emit('set-data', $event, true)"
				/>
			</v-flex>
			<v-flex xs12 px-2 mb-1>
				<app-input-text
					:readonly="disabled"
					:disabled="disabled"
					label="Dirección"
					model="addressLine1"
					tabindex="5"
					:text="model.addressLine1"
					@input="$emit('set-data', $event, true)"
				/>
				<span class="error--text caption" v-if="!model.addressLine1">
					La dirección es requerida
				</span>
			</v-flex>
			<v-flex xs6 px-2 mb-1>
				<app-input-text
					label="Longitud"
					model="longitude"
					:text="model.longitude"
					@input="$emit('set-data', $event, true)"
				/>
			</v-flex>
			<v-flex xs6 px-2 mb-1>
				<app-input-text
					label="Latitud"
					model="latitude"
					:text="model.latitude"
					@input="$emit('set-data', $event, true)"
				/>
			</v-flex>
			<v-flex xs12 px-2 mb-2>
				<label ref="label" for="upload-create-section" class="w-100">
					<vue-six-four
						id="upload-create-section"
						hidden
						@vue-six-four="getFile"
					/>
					<v-layout wrap>
						<v-flex xs10 mt-1 pr-1>
							<app-input-text
								label="Foto"
								readonly
								:text="model.additionalInformation.urlLocation"
							></app-input-text>
						</v-flex>
						<v-flex xs1 mt-4 text-xs-center>
							<v-btn
								class="ma-0 pl-0 btn-auto"
								color="info"
								small
								@click="showDialog"
							>
								<v-icon color="white">image</v-icon>
							</v-btn>
						</v-flex>
						<v-flex
							xs1
							mt-4
							text-xs-center
							v-if="model.additionalInformation.urlLocation"
						>
							<upload-img
								:url="model.additionalInformation.urlLocation"
								:icon="'visibility'"
								:text="''"
								:show-update="false"
							/>
						</v-flex>
					</v-layout>
				</label>
			</v-flex>
		</v-layout>
	</div>
</template>

<script>
import VueSixFour from 'vue-six-four';
import uploadImg from '@/components/shared/upload-img';

export default {
	name: 'customers-ubigeo-info',
	components: {
		VueSixFour,
		uploadImg,
	},
	methods: {
		showDialog() {
			this.$refs.label.click();
		},
		async getFile(fileInfo) {
			const allowedFiles = ['jpg', 'jpeg', 'png', 'svg'];
			this.loadingImage = true;
			const newFile = {
				name: fileInfo.name.replace(/\s/g, '-'),
				base64data: fileInfo.sixFour,
			};
			try {
				const words = newFile.name.split('.');
				const lastItem = words.length;
				const extension = words[lastItem - 1];
				if (allowedFiles.indexOf(extension) > -1) {
					const { data: file } = await this.$httpProduction.post(
						'upload-files',
						newFile
					);
					const newImage = new Image();
					newImage.onload = () => {
						if (newImage.naturalWidth <= 300) {
							this.$emit('set-data-img', file.Location);
							this.loadingImage = false;
						} else {
							this.showNotification(
								'El tamaño máximo de ancho permitido es 300px',
								'warning'
							);
							this.loadingImage = false;
						}
					};
					newImage.src = file.Location;
				} else {
					this.showNotification(
						`Archivo no válido, solo se permite ${allowedFiles.join(',')}`,
						'warning'
					);
				}
			} catch (err) {
				if (err.status === 500) {
					this.showGenericError();
				}
			}
		},
	},
	props: {
		disabled: {
			default: false,
			type: Boolean,
		},
		model: {
			default: () => {},
			type: Object,
		},
		cities: {
			default: () => [],
			type: Array,
		},
		parishes: {
			default: () => [],
			type: Array,
		},
		provinces: {
			default: () => [],
			type: Array,
		},
	},
};
</script>
