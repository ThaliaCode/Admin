<template>
	<div class="wraper-container-conversion">
		<v-layout align-center>
			<v-flex xs2>
				<app-input-text
					label="Cant."
					model="quantityTo"
					type="number"
					class="conversion-quantity"
					:text="localConversion.quantityTo"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs3>
				<app-select
					label="Unidades"
					model="code"
					class="conversion-id"
					:items="unitsValidates"
					item-text="name"
					item-value="code"
					:item="localConversion.code"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs1 pt-3>
				<v-tooltip top>
					<template slot="activator">
						<v-icon>visibility</v-icon>
					</template>
					<img
						v-if="localConversion.image"
						class="pt-2 pb-2 px-1"
						width="100px"
						height="100px"
						:src="localConversion.image"
					/>
					<span v-else>Esta unidad no tiene imagen</span>
				</v-tooltip>
			</v-flex>
			<v-flex mb-3>
				<label ref="label" for="upload-create-section" class="w-100">
					<vue-six-four
						id="upload-create-section"
						hidden
						@vue-six-four="getFile"
					/>
					<v-flex xs1 mt-4 pt-1 text-xs-center>
						<app-tooltip-button
							color="primary"
							icon="cloud_upload"
							:disabled="loadingImage"
							height="25"
							text="Subir imagen"
							@click-icon="showDialog"
						></app-tooltip-button>
					</v-flex>
				</label>
			</v-flex>
			<!-- -------------------------- -->
			<v-flex xs1>
				<app-tooltip-button
					color="grey"
					icon="sync_alt"
					height="30"
					text="Equivale a"
				></app-tooltip-button>
			</v-flex>
			<!-- -------------------------- -->
			<v-flex xs2>
				<app-input-text
					label="Cant."
					model="quantity"
					type="number"
					class="conversion-quantity"
					:text="localConversion.quantity"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs3>
				<app-input-text
					readonly
					label="Unidad"
					class="conversion-selected ml-1"
					:text="selectedUnit.name"
				/>
			</v-flex>
		</v-layout>
		<v-layout align-center mt-1 v-if="!onlyConversion">
			<v-flex xs2>
				<app-input-text
					tooltip="Código Conversión"
					placeholder="Precio costo"
					class="code-conversion"
					model="cost"
					type="number"
					:text="localConversion.cost"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs7>
				<app-input-text
					tooltip="Nombre"
					placeholder="Nombre"
					class="code-conversion"
					model="name"
					:text="localConversion.name"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs3>
				<app-input-text
					tooltip="Código Conversión"
					placeholder="Código Conversión"
					class="code-conversion ml-1"
					model="barcode"
					:text="localConversion.barcode"
					@input="setData"
				/>
			</v-flex>
		</v-layout>
	</div>
</template>
<script>
import VueSixFour from 'vue-six-four';
// function setCode({ model, value }) {
// 	this.localConversion[model] = value;
// 	this.$emit('set-conversion', this.localConversion);
// }

function setData({ model, value }) {
	// const newValue = model === 'id' ? value.id : Number(value);
	if (model === 'code') {
		this.localConversion.name = value.name || '';
		this.localConversion.code = value.code || '';
	}
	if (model === 'cost') {
		this.localConversion.cost = Number(value);
	}
	if (model === 'quantity' || model === 'quantityTo') {
		this.localConversion[model] = Number(value);
	}

	this.$emit('set-conversion', this.localConversion);
}

function conversionHandler(newConversion) {
	this.localConversion = newConversion;
}

function data() {
	return {
		allowedFiles: ['jpg', 'jpeg', 'png', 'svg'],
		localConversion: { ...this.conversion },
		loadingImage: false,
	};
}

export default {
	name: 'cms-unit-conversion',
	data,
	components: {
		VueSixFour,
	},
	methods: {
		conversionHandler,
		// setCode,
		setData,
		showDialog() {
			this.$refs.label.click();
		},
		async getFile(fileInfo) {
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
					const { data: file } = await this.$httpProduction.post(
						'upload-files',
						newFile
					);
					const newImage = new Image();
					newImage.onload = () => {
						if (newImage.naturalWidth <= 300) {
							this.showNotification(
								'Se actulizo correctamente la imagen de la unidad'
							);
							this.$emit('set-image', {
								model: 'image',
								value: file.Location,
							});
						} else {
							this.showNotification(
								'El tamaño máximo de ancho permitido es 300px',
								'warning'
							);
						}
					};
					newImage.src = file.Location;
				} else {
					this.showNotification(
						`Archivo no válido, solo se permite ${this.allowedFiles.join(',')}`,
						'warning'
					);
				}
			} catch (err) {
				if (err.status === 500) {
					this.showGenericError();
				}
			} finally {
				this.loadingImage = false;
			}
		},
	},
	props: {
		conversion: {
			default: () => {},
			type: Object,
		},
		onlyConversion: {
			default: false,
			type: Boolean,
		},
		selectedUnit: {
			default: () => {},
			type: Object,
		},
		units: {
			default: () => [],
			type: Array,
		},
	},
	computed: {
		unitsValidates() {
			const tags = this.selectedUnit.tags || [];
			const tagsObjects = this.units.filter((e) => tags.includes(e.code));
			return tagsObjects || [];
		},
	},
	watch: {
		conversion: {
			deep: true,
			handler: conversionHandler,
		},
		selectedUnit() {
			this.localConversion.unitCode = this.selectedUnit.code;
			this.localConversion.code = null;
			this.localConversion.name = null;
		},
	},
};
</script>
<style lang="scss" scoped>
.wraper-container-conversion {
	align-items: center;
	display: flex;
	flex-wrap: wrap;
}

.conversion-quantity {
	flex: 1 1 12%;
	text-align: left;
}

.conversion-selected {
	flex: 1 1 12%;
	text-align: left;
}

.code-conversion {
	flex: 1 1 17%;
	text-align: left;
}

.conversion-quantityTo {
	flex: 1 1 16%;
	text-align: left;
}

.eq {
	flex: 1 1 14%;
	margin-top: 18px;
	margin-right: 5px;
}

.conversion-id {
	flex: 23%;
	text-align: left;
}

.title-caption {
	color: color(sidebar);
	font-weight: bold;
}
</style>
