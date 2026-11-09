async function getFile(fileInfo) {
	this.isLoadingImage = true;
	const newFile = {
		name: fileInfo.name.replace(/\s/g, '-'),
		base64data: fileInfo.sixFour,
	};
	try {
		const words = newFile.name.split('.');
		const lastItem = words.length;
		let extension = words[lastItem - 1];
		extension = extension ? extension.toLowerCase() : extension;
		if (this.allowedFiles.indexOf(extension) > -1) {
			const { data: response } = await this.$httpProduction.post('upload-files', newFile);
			this.captureLocation = response.Location;
			this.isLoadingImage = false;
			this.showNotification('La imagen se subió correctamente.');
		} else {
			this.showNotification(`Archivo no válido, solo se permite ${this.allowedFiles.join(',')}`, 'warning');
			this.isLoadingImage = false;
		}
	} catch (error) {
		if (error.data.statusCode === 413) {
			this.showGenericError('Tamaño máximo de imagen permitido es 1024Kb');
		} else {
			this.showGenericError();
		}
		this.isLoadingImage = false;
	}
}

function actionUploadImage() {
	this.$refs.up.click();
}

function data() {
	return {
		allowedFiles: ['jpg', 'jpeg', 'png', 'pdf'],
		captureLocation: '',
		isLoadingImage: false,
	};
}

const mixin = {
	data,
	methods: {
		actionUploadImage,
		getFile,
	},
};

export default mixin;
