<template>
	<label :ref="file.ref" :for="file.id" class="app-input-upload">
		<vue-six-four :id="file.id" hidden @vue-six-four="getFileUpdate"/>
		<v-layout wrap>
			<v-flex xs8 mt-1>
				<app-input-text
					:label="label"
					readonly
					:text="text"
				/>
			</v-flex>
			<v-flex xs4 mt-4 text-xs-left>
				<button 
					@click="showDialog"
					class="btn-upload mt-1"
				>
					{{ file.btn }}
				</button>
			</v-flex>
		</v-layout>
	</label>
</template>

<script>
	import VueSixFour from 'vue-six-four';

	async function getFileUpdate(fileInfo) {
		const newFile = {
			name: fileInfo.name.replace(/\s/g, '-'),
			base64data: fileInfo.sixFour,
		};
		const words = newFile.name.split('.');
		const lastItem = words.length;
		const extension = words[lastItem - 1];
		if (this.baseSixFour) {
			if (this.file.allowed.indexOf(extension) > -1) {
				this.$emit('input', { model: this.model, value: newFile.base64data });
			} else {
				this.showNotification(`Archivo no válido, solo se permite ${this.file.allowed.join(',')}`, 'warning');
			}
		} else {
			try {
				if (this.file.allowed.indexOf(extension) > -1) {
					const { data: file } = await this.$httpProduction.post('upload-files', newFile);
					this.$emit('input', { model: this.model, value: file.Location });
				} else {
					this.showNotification(`Archivo no válido, solo se permite ${this.file.allowed.join(',')}`, 'warning');
				}
			} catch (err) {
				if (err.status === 500) {
					this.showGenericError();
				}
			}
		}
	}

	function showDialog() {
		this.$refs[this.file.ref].click();
	}

	export default {
		name: 'app-input-upload',
		components: {
			VueSixFour,
		},
		methods: {
			getFileUpdate,
			showDialog,
		},
		props: {
			file: {
				default: () => {},
				type: Object,
			},
			label: String,
			model: [String, Number],
			text: String,
			baseSixFour: {
				type: Boolean,
				default: false,
			},
		},
	};
</script>

<style lang="scss" scoped>
	.btn-upload {
		background-color: color(primary);
		border-bottom-left-radius: 0px !important;
		border-bottom-right-radius: 5px !important;
		border-top-left-radius: 0px !important;
		border-top-right-radius: 5px !important;
		color: color(white);
		font-family: font(open-semibold);
		font-size: size(small10);
		height: 30px;
		margin: 0px;
		padding: 5px 0px;
		width: 100%;
	}
</style>