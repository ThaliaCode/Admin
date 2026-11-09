<template>
	<div content-class="px-5">
		<v-layout wrap px-4 py-3>
			<v-flex xs12 md12 mt-3>
				<app-input-text
					label="Orden"
					:text="model.order"
					model="order"
					type="number"
					@input="$emit('set-data', $event)"
				/>
			</v-flex>
			<v-flex xs12 md12 mt-3>
				<app-select
					:disabled="disabled"
					:item="model.itemId"
					item-text="name"
					item-value="id"
					:items="headings"
					label="Rubro Maestro"
					model="itemId"
					@input="setHeading"
				></app-select>
				<span class="form-group__message" v-if="!$v.model.itemId.required">
					Este campo es requerido.
				</span>
			</v-flex>
			<v-flex xs12 md12 mt-3>
				<label ref="label-image" for="upload-file-image">
					<vue-six-four
						id="upload-file-image"
						hidden
						ref="image-vuesixfour"
						@vue-six-four="getFile('image', $event)" />
					<v-layout wrap>
						<v-flex :class="model.image ? 'xs10' : 'xs11'">
							<app-input-text
								label="Imagen"
								readonly
								:text="model.image"
							/>
						</v-flex>
						<v-flex xs1 mt-4 text-xs-left>
							<v-btn @click="showDialog('label-image')"
								class="ma-0 pl-0 btn-auto"
								small
								color="info">
								<v-icon color="white">image</v-icon>
							</v-btn>
						</v-flex>
						<v-flex
							v-if="model.image"
							mt-4
						>
							<app-tooltip-button
								color="error"
								height="30"
								icon="remove_circle"
								text="Eliminar"
								@click-icon="deleteImage('image', 'image-vuesixfour')"
							></app-tooltip-button>
						</v-flex>
					</v-layout>
				</label>
			</v-flex>
			<v-flex xs12 md12 mt-3>
				<label ref="label-icon" for="upload-file-icon">
					<vue-six-four
						id="upload-file-icon"
						hidden
						ref="icon-vuesixfour"
						@vue-six-four="getFile('icon', $event)" />
					<v-layout wrap>
						<v-flex :class="model.icon ? 'xs10' : 'xs11'">
							<app-input-text
								label="Icon"
								readonly
								:text="model.icon"
							/>
						</v-flex>
						<v-flex xs1 mt-4 text-xs-left>
							<v-btn @click="showDialog('label-icon')"
								class="ma-0 pl-0 btn-auto"
								small
								color="info">
								<v-icon color="white">image</v-icon>
							</v-btn>
						</v-flex>
						<v-flex
						v-if="model.icon"
						mt-4>
							<app-tooltip-button
								color="error"
								height="30"
								icon="remove_circle"
								text="Eliminar"
								@click-icon="deleteImage('icon', 'icon-vuesixfour')"
							></app-tooltip-button>
						</v-flex>
					</v-layout>
				</label>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="$v.$invalid"
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="saveFormHeading"
			/>
		</section>
	</div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import VueSixFour from 'vue-six-four';

function created() {
	this.loadHeading();
}

async function loadHeading() {
	try {
		({ data: this.headings } = await this.$httpSales.get('items-list', { params: { type: 2 } }));
	} catch (error) {
		this.showGenericError();
	}
}

function setHeading({ value }) {
	this.model.itemId = value.id;
}

function saveFormHeading() {
	this.$emit('save-form', this.model);
}

function deleteImage(prop, refProp) {
	this.model[prop] = null;
	this.clear(prop, refProp);
}

function clear(prop, refProp) {
	this.model[prop] = null;
	this.$refs[refProp].$el.value = null;
}

async function getFile(name, fileInfo) {
	this.loadImage = true;
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
			this.model[name] = file.Location;
		} else {
			this.showNotification(`Archivo no válido, solo se permite ${this.allowedFiles.join(',')}`, 'warning');
		}
	} catch (error) {
		this.showGenericError();
	} finally {
		this.loadImage = false;
	}
}

function showDialog(name) {
	this.$refs[name].click();
}

function validations() {
	return {
		model: {
			itemId: {
				required,
			},
		},
	};
}

function data() {
	return {
		allowedFiles: ['jpg', 'jpeg', 'png', 'svg'],
		headings: [],
	};
}

export default {
	name: 'create-heading',
	data,
	created,
	components: {
		modalSidebarButton,
		VueSixFour,
	},
	validations,
	methods: {
		clear,
		deleteImage,
		getFile,
		loadHeading,
		saveFormHeading,
		setHeading,
		showDialog,
	},
	props: {
		model: {
			type: Object,
			default: () => {},
		},
		disabled: {
			type: Boolean,
			default: false,
		},
	},
};
</script>