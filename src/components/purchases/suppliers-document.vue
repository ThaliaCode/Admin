<template>
	<div>
		<v-layout xs12 class="my-3 px-4">
			<v-flex xs10>
				<label ref="label" for="upload-file-2">
					<vue-six-four id="upload-file-2" hidden @vue-six-four="getFileUpdate"/>
					<v-layout wrap>
						<v-flex xs11>
							<app-input-text
								label="Adjuntar Archivos"
								readonly
								:text="urlImage"
							/>
						</v-flex>
						<v-flex xs1 mt-4 text-xs-center>
							<v-btn	
								@click="showDialog"
								class="ma-0 pl-0 btn-auto"
								small
								color="pink"
								:disabled="loadImage">
								<v-icon color="white">attach_file</v-icon>
							</v-btn>
						</v-flex>
					</v-layout>
				</label>
			</v-flex>
			<v-flex xs2>
				<v-btn 
					class="upload-button add"
					:disabled="!urlImage"
					@click="addDocument">
					<v-icon dark>add</v-icon>
				</v-btn>
			</v-flex>
		</v-layout>
		<v-layout wrap class="my-3 px-4">
			<v-flex
				v-for="(document, index) in arrayUrlImages"
				:key="index"
				xs12
			>
				<v-layout wrap>
					<v-flex xs10>
						<a :href="document" target="_blank">{{document}}</a>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="!arrayUrlImages.length || loadImage"
				@cancel-button-clicked="$emit('cancel')"
				@accept-button-clicked="attachDocument"
			/>
		</section>
	</div>
</template>
<script>
import VueSixFour from 'vue-six-four';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function showDialog() {
	this.$refs.label.click();
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
			this.urlImage = file.Location;
		} else {
			this.showNotification(`Archivo no válido, solo se permite ${this.allowedFiles.join('  ,  ')}`, 'warning');
		}
	} catch (error) {
		this.showGenericError('Peso mayor permitido 1 Mb');
	} finally {
		this.loadImage = false;
	}
}

function addDocument() {
	this.arrayUrlImages.push(this.urlImage);
	this.urlImage = null;
}

async function attachDocument() {
	const body = {
		urlFiles: this.arrayUrlImages,
	};
	try {
		await this.$httpSales.patch(`/suppliers/${this.id}/files`, body);
		this.showNotification('Se actualizo correctamente');
		this.$emit('cancel');
	} catch (error) {
		this.showGenericError();
	}
}

function created() {
	this.loadData();
}

async function loadData() {
	try {
		const response = await this.$httpSales.get(`/suppliers/${this.id}`);
		this.arrayUrlImages = response.data.urlFiles || [];
	} catch (error) {
		this.showGenericError();
	}
}


function data() {
	return {
		arrayUrlImages: [],
		urlImage: null,
		allowedFiles: [
			'jpg',
			'jpeg',
			'png',
			'doc',
			'docx',
			'xls',
			'xlsx',
			'pdf',
			'txt',
		],
		model: {
			urlImage: null,
		},
		loadImage: false,
	};
}

export default {
	name: 'suppliers-document',
	components: {
		VueSixFour,
		modalSidebarButton,
	},
	methods: {
		getFileUpdate,
		showDialog,
		addDocument,
		attachDocument,
		loadData,
	},
	data,
	created,
	props: {
		id: {
			type: [String, Number],
		},
	},
};
</script>
<style lang="scss" scoped>
	.upload-button {
		background-color: color(error) !important;
	}

	.add {
		background-color: color(primary) !important;
		margin: 23px 0 0 30px;
	}
</style>


