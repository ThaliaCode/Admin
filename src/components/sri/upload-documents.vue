<template>
	<div>
		<v-layout wrap px-4 py-3>
			<v-flex xs12 mb-3>
				<app-input-text
					:text="model.name"
					label="Nombre"
					model="name"
					@input="setModelProp"
				></app-input-text>
			</v-flex>
			<v-flex xs12 mb-3>
				<app-input-text
					textarea
					:text="model.description"
					label="Descripción"
					model="description"
					@input="setModelProp"
				></app-input-text>
			</v-flex>
			<v-flex xs12>
				<label ref="label" for="upload-image" class="w-100">
					<vue-six-four id="upload-image" hidden @vue-six-four="getFileUpdate" />
					<v-layout wrap>
						<v-flex xs9 mt-1 pr-2>
							<app-input-text label="Documento SRI" readonly :text="link" />
						</v-flex>
						<v-flex xs3 mt-4 text-xs-center>
							<button @click="showDialog" :disabled="loadImage" class="btn-upload mt-1">
								Adjuntar
							</button>
						</v-flex>
					</v-layout>
				</label>
				<span class="error--text caption" v-if="$v.model.file.$invalid">
					Debe elegir un documento a importar
				</span>
			</v-flex>
		</v-layout>
		<section class="fast-register-footer">
			<modal-sidebar-button
				:is-loading="disabled || loadImage"
				@accept-button-clicked="$emit('import-document', model)"
				@cancel-button-clicked="$emit('cancel-modal')"
			/>
		</section>
	</div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import VueSixFour from 'vue-six-four';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import upLoadImageMixin from '@/mixins/upLoadImage';

function disabled() {
	return this.$v.$invalid || this.loading;
}

async function getFileUpdate(fileInfo) {
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
			this.link = file.Location;
			this.model.file = newFile.base64data;
		} else {
			this.showNotification(
				`Archivo no válido, solo se permite ${this.allowedFiles.join(',')}`,
				'warning'
			);
		}
	} catch (error) {
		this.showGenericError();
	} finally {
		this.loadImage = false;
	}
}

function setModelProp({ model, value }) {
	this.model[model] = value;
}

function showDialog() {
	this.$refs.label.click();
}

function validations() {
	return {
		model: {
			file: { required },
		},
	};
}

function data() {
	return {
		allowedFiles: ['text', 'txt', 'svg', 'json'],
		link: '',
		model: {
			description: '',
			file: '',
			name: '',
		},
		loadImage: false,
	};
}
export default {
	name: 'upload-documents',
	data,
	components: {
		modalSidebarButton,
		VueSixFour,
	},
	computed: {
		disabled,
	},
	mixins: [upLoadImageMixin],
	methods: {
		getFileUpdate,
		setModelProp,
		showDialog,
	},
	props: {
		loading: {
			default: false,
			type: Boolean,
		},
	},
	validations,
};
</script>
<style lang="scss" scoped>
.btn-upload {
	background: map-get($colors, primary);
	border-radius: 5px;
	color: map-get($colors, white);
	font-size: 10px;
	height: 29px;
	width: 100%;
}
</style>
