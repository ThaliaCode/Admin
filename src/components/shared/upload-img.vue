<template>
	<div :key="id">
		<label :ref="`label-${id}`" :for="`upload-file-${id}`">
			<vue-six-four
				:key="id"
				:id="`upload-file-${id}`"
				hidden
				@vue-six-four="getFile"
			/>
		</label>

		<!-- <v-layout wrap>
				<v-flex xs10>
					<app-input-text label="Actualizar imagen" readonly :text="url" />
				</v-flex>
				<v-flex xs2 mt-4 text-xs-left>
					<v-btn @click="showDialog" class="ma-0 pl-0 btn-auto" small color="pink">
						<v-icon color="white">attach_file</v-icon>
					</v-btn>
				</v-flex>
			</v-layout> -->
		<div class="d-flex align-center">
			<v-tooltip top>
				<template slot="activator">
					<a
						:href="url"
						@click.prevent="handleClick"
						target="_blank"
						class="link-transaction header--text"
						style="text-wrap: nowrap; font-size: 14px"
					>
						<v-icon class="header--text" stt>{{ icon }}</v-icon>
						<span>{{ text }}{{ extension && ` (.${extension})` }}</span>
					</a>
					<!-- <img v-if="url" class="pt-2 pb-2 px-1" width="55px" height="55px" :src="url" /> -->
				</template>

				<div v-if="extension === 'pdf'">
					<span>{{ fileName }}</span>
					<v-icon class="white--text" color="white"> picture_as_pdf </v-icon>
				</div>

				<img
					v-else-if="url"
					class="pt-2 pb-2 px-1"
					width="190px"
					height="195px"
					:src="url"
				/>
				<div v-else>No hay archivo</div>
			</v-tooltip>
			<v-tooltip top v-if="showUpdate">
				<template slot="activator">
					<v-btn
						@click="showDialog"
						outline
						fab
						small
						class="ma-0 ml-2 btn-update"
						color="primary"
					>
						<v-icon color="primary">cloud_upload</v-icon>
					</v-btn>
					<!-- <img v-if="url" class="pt-2 pb-2 px-1" width="55px" height="55px" :src="url" /> -->
				</template>
				<span>Actualizar archivo</span>
			</v-tooltip>
		</div>
	</div>
</template>

<script>
import VueSixFour from 'vue-six-four';

export default {
	name: 'upload-img',
	components: {
		VueSixFour,
	},
	data() {
		return {};
	},
	props: {
		id: [Number, String],
		url: {
			type: String,
			default: '',
		},
		icon: {
			type: String,
			default: 'link',
		},
		text: {
			type: String,
			default: 'Ver archivo',
		},
		allowedFiles: {
			type: Array,
			default: () => [],
		},
		showUpdate: {
			type: Boolean,
			default: true,
		},
	},
	computed: {
		extension() {
			return (
				(this.url && this.url.split('.') && this.url.split('.').at(-1)) || ''
			);
		},
		fileName() {
			return this.url && this.url.split('/') && this.url.split('/').at(-1);
		},
	},

	methods: {
		handleClick() {
			if (this.url) {
				window.open(this.url, '_blank');
			}
		},
		showDialog() {
			this.$refs[`label-${this.id}`].click();
		},
		async getFile(fileInfo) {
			const files = ['jpg', 'jpeg', 'png', 'pdf'];
			const newFile = {
				name: fileInfo.name.replace(/\s/g, '-'),
				base64data: fileInfo.sixFour,
			};
			const allowedFiles =
				this.allowedFiles && this.allowedFiles.length
					? this.allowedFiles
					: files;
			try {
				const words = newFile.name.split('.');
				const lastItem = words.length;
				const extension = words[lastItem - 1];
				if (allowedFiles.indexOf(extension) > -1) {
					const { data: file } = await this.$httpProduction.post(
						'upload-files',
						newFile
					);
					const urlFile = file.Location;
					this.$emit('getUrlFile', urlFile);
				} else {
					this.showNotification(
						`Archivo no válido, solo se permite ${allowedFiles.join(',')}`,
						'warning'
					);
				}
			} catch (error) {
				if (error && error.data && error.data.statusCode === 413) {
					this.showGenericError('Tamaño máximo de imagen permitido es 1024Kb');
				} else {
					this.showGenericError();
				}
			}
		},
	},
};
</script>

<style lang="scss" scoped>
.btn-update {
	padding: 0.1rem;
}
.btn--floating.btn--small {
	height: 30px;
	width: 30px;
}

.btn--floating .icon {
	height: auto;
	width: auto;
}
</style>
