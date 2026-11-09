<template>
	<div class="main">
		<v-layout row>
			<label ref="up" for="upload-image">
				<vue-six-four id="upload-image" hidden @vue-six-four="getFile($event)" />
				<v-flex xs12 d-flex align-center>
					<text-field
						class="input-upload"
						disabled
						placeholder="Adjuntar foto / Adjuntar pdf"
						:text="captureLocation"
						readonly
					/>
					<v-btn class="upload-button" @click="actionUploadImage">
						<v-icon>add</v-icon>
					</v-btn>
					<!-- <v-btn
						color="primary"
						class="btn-action btn-auto px-4 py-2 ml-2"
						:disabled="!captureLocation"
						@click="addImage"
					>
						Agregar Foto / Pdf
					</v-btn> -->
				</v-flex>
			</label>
		</v-layout>
		<v-layout row wrap mt-4 v-if="images.length">
			<v-flex
				xs2
				class="proof-container mr-4"
				v-for="(image, indexImage) in images"
				:key="indexImage"
			>
				<v-tooltip top>
					<template slot="activator">
						<img
							:src="'/static/icon/icon-pdf.png'"
							alt="documento-pdf"
							style="width: 75px"
							v-if="isImgPdf(image)"
						/>
						<img :src="image" alt="documento-pdf" class="proof-image" v-else />
					</template>
					<span>{{ getImageName(image) }}</span>
				</v-tooltip>
				<v-btn fab class="proof-delete-image" @click="removeImage(indexImage)">
					<v-icon size="20" color="error">close</v-icon>
				</v-btn>
			</v-flex>
		</v-layout>
	</div>
</template>
<script>
import VueSixFour from 'vue-six-four';
import upLoadImageMixin from '@/mixins/upLoadImage';
import textField from '@/components/shared/app-input-text';
import lib from '@/shared/lib';

const { removeItemFromArrayByIndex } = lib;

function addImage() {
	this.images.push(this.captureLocation);
	this.captureLocation = '';
	this.$emit('add-proof-payment-image', this.images);
}

function removeImage(index) {
	this.images = removeItemFromArrayByIndex(index, this.images);
	this.$emit('image-deleted', this.images);
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
			this.captureLocation = file.Location;
			this.images.push(this.captureLocation);
			this.captureLocation = '';
			this.$emit('add-proof-payment-image', this.images);
		} else {
			this.showNotification(
				`Archivo no válido, solo se permite ${this.allowedFiles.join(',')}`,
				'warning'
			);
		}
	} catch (error) {
		this.showGenericError();
	}
}

function data() {
	return {
		images: [],
	};
}

export default {
	name: 'proof-payment',
	components: {
		textField,
		VueSixFour,
	},
	created() {
		this.images = Array.isArray(this.urlImages) ? [...this.urlImages] : [];
		this.$emit('add-proof-payment-image', this.images);
	},
	data,
	methods: {
		addImage,
		getFile,
		removeImage,
		isImgPdf(image) {
			return image.toLowerCase().endsWith('.pdf');
		},
		getImageName(image) {
			return image.split('/').pop();
		},
	},
	props: {
		urlImages: {
			type: Array,
			default: () => [],
		},
	},
	mixins: [upLoadImageMixin],
};
</script>
<style lang="scss" scoped>
.input-upload {
	width: 100%;
}

.upload-button {
	background-color: color(error) !important;
}

.add {
	background-color: color(primary) !important;
	margin-left: 30px;
}

.proof-container {
	position: relative;
}

.proof-image {
	height: 98px;
	object-fit: cover;
	width: 88px;
}

.proof-delete-image {
	background: transparent;
	border: 1px solid map-get($colors, error);
	height: 25px;
	position: absolute;
	right: 15;
	top: -20px;
	width: 25px;
}
</style>
