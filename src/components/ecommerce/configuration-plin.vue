<template>
	<div>
		<v-layout wrap pa-4>
			<v-flex xs12 mb-3>
				<app-input-text
					type="number"
					label="Teléfono"
					model="phone"
					:text="model.phone"
					@input="setData"
			></app-input-text>
			</v-flex>
			<v-flex xs12>
				<label ref="label-image-plin" for="upload-url-image-plin">
					<v-layout wrap xs12>
						<v-flex :class="[model.imageQR ? 'xs9' : 'xs12']">
							<v-layout>
								<v-flex xs11>
									<vue-six-four
										id="upload-url-image-plin"
										hidden
										@vue-six-four="getFileQR($event)"
									/>
									<app-input-text
										label="Imagen de Qr"
										readonly
										:text="model.imageQR"
									/>
								</v-flex>
								<v-flex flex text-xs-left xs1 pt-1>
									<button
										@click="showDialogFavicon('label-image-plin')"
										class="btn-upload"
									>
										<v-icon color="white" size="14">image</v-icon>
									</button>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex pt-4 v-if="model.imageQR" :class="{'xs3':model.imageQR}" text-xs-right>
							<a
								class="link-green"
								target="_blank"
								:href="model.imageQR">Ver Imagen</a>
						</v-flex>
					</v-layout>
				</label>
			</v-flex>
		</v-layout>
		<section class="fast-register-footer">
			<modal-sidebar-button
				:is-loading="!disabledBtn"
				@accept-button-clicked="$emit('change-config-billeters', model)"
				@cancel-button-clicked="$emit('cancel-action')"
			/>
		</section>
	</div>
</template>
<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import VueSixFour from 'vue-six-four';

function created() {
	if (this.billeters.plin) {
		this.model.phone = this.billeters.plin.phone || null;
		this.model.imageQR = this.billeters.plin.imageQR || null;
	}
}
async function getFileQR(fileInfo) {
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
			this.model.imageQR = file.Location;
		} else {
			this.showNotification(`Archivo no válido, solo se permite ${this.allowedFiles.join(',')}`, 'warning');
		}
	} catch (error) {
		this.showGenericError();
	}
}
function showDialogFavicon(name) {
	this.$refs[name].click();
}

function disabledBtn() {
	return Boolean(this.model.phone || this.model.imageQR);
}

function setData({ model, value }) {
	this.model[model] = value;
}

function data() {
	return {
		model: {
			phone: null,
			imageQR: null,
		},
		allowedFiles: [
			'jpg',
			'jpeg',
			'png',
		],
	};
}
export default {
	name: 'configuration-plin',
	data,
	components: {
		modalSidebarButton,
		VueSixFour,
	},
	computed: {
		disabledBtn,
	},
	created,
	methods: {
		getFileQR,
		showDialogFavicon,
		setData,
	},
	props: {
		billeters: {
			default: () => {},
		},
	},
};
</script>
<style lang="scss" scoped>
	.btn-upload {
		align-items: center;
		background: color(primary);
		border-radius: 0 5px 5px 0;
		display: flex;
		justify-content: center;
		height: 27px;
		margin-top: 15px;
		width: 100%;
	}
</style>
