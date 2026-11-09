<template>
	<div class="px-4 pt-4 pb-5">
		<h3>Transacciones Bancarias</h3>
        <div v-for="(tran, index) in bankTransactions" :key="index">
          	<h4 class="mb-3">{{ tran.name }}</h4>
			<v-layout row wrap mb-4>
				<v-flex xs10>
					<v-text-field
						class="filter-select"
						name="new-product-model"
						label="Adjuntar Qr"
						disabled
						readonly
						v-model="tran.urlImage"
					></v-text-field>
				</v-flex>
				<v-flex xs2 d-flex align-center>
					<label :ref="`up-${index}`" for="upload-image">
						<vue-six-four id="upload-image" hidden @vue-six-four="getFile" />
						<button
							type="button"
							@click="actionUploadImage(index)"
							class="upload pl-add-container">
								<img src="/static/img/view-image.svg" alt="" class="view-image">
						</button>
					</label>
				</v-flex>
				<v-flex xs12 mt-3>
					<v-layout row wrap>
						<v-flex xs6>
							<v-checkbox
								color="primary"
								hide-details
								label="Mostrar en web"
								v-model="tran.flagWeb"
							></v-checkbox>
						</v-flex>
						<v-flex xs6>
							<v-checkbox
								color="primary"
								hide-details
								label="Mostrar en móvil"
								v-model="tran.flagMobile"
							></v-checkbox>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
        </div>
        <section class="modal-filter-footer">
			<modal-sidebar-button
				button-type="button"
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="saveConfiguration"
			/>
        </section>
	</div>
</template>
<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import VueSixFour from 'vue-six-four';
import upLoadImageMixin from '@/mixins/upLoadImage';

function actionUploadImage(index) {
	this.index = index;
	this.$refs[`up-${index}`][0].click();
}

function captureLocation(value) {
	this.bankTransactions[this.index].urlImage = value;
	this.index = null;
}

function saveConfiguration() {
	const validation = this.bankTransactions.every(c => c.urlImage.trim() !== '');
	if (validation) {
		this.$emit('save', this.bankTransactions);
	} else {
		this.showNotification('Debe adjuntar el código Qr por cada tipo de transacción bancaria', 'info');
	}
}

function created() {
	this.bankTransactions = this.transactions.map((t) => {
		const newTransaction = {};
		newTransaction.code = t.code;
		newTransaction.flagMobile = !!t.flagMobile;
		newTransaction.flagWeb = !!t.flagWeb;
		newTransaction.name = t.name;
		newTransaction.urlImage = t.urlImage;
		return newTransaction;
	});
}

function data() {
	return {
		bankTransactions: [],
		index: null,
	};
}

export default {
	name: 'bank-transaction-settings',
	data,
	created,
	components: {
		modalSidebarButton,
		VueSixFour,
	},
	methods: {
		actionUploadImage,
		saveConfiguration,
	},
	mixins: [upLoadImageMixin],
	props: {
		transactions: {
			type: Array,
			required: true,
		},
	},
	watch: {
		captureLocation,
	},
};
</script>
<style lang="scss" scoped>
h3 {
	border-bottom: 1px solid color(primary);
	color: color(primary);
	margin-bottom: 15px;
	padding-bottom: 5px;
}

.upload {
	height: 30px;
	width: 100%;
}
</style>