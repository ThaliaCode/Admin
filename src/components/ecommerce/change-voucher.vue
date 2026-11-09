<template>
	<div class="pa-4">
		<p>{{ order.voucherStatus }}</p>
		<v-layout mb-3>
			<v-flex xs2 mr-3>
				<span>Rechazar</span>
			</v-flex>
			<v-flex xs2>
				<v-switch
					color="success"
					hide-details
					v-model="flag"
				></v-switch>
			</v-flex>
			<v-flex xs3>
				<span>Confirmar</span>
			</v-flex>
		</v-layout>
		<div v-if="showImageVoucher">
			<a :href="order.additionalInfo.urlVoucher" target="_blank">
				<img 
					:src="order.additionalInfo.urlVoucher" 
					:alt="order.additionalInfo.urlVoucher"
					height="150">
			</a>
		</div>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="$emit('save', flag, order.id)"
			/>
		</section>
	</div>
</template>
<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import voucherStatus from '@/shared/voucher-status';

function created() {
	this.flag = Number(this.order.additionalInfo.flagVoucherState) === voucherStatus.Confirmed;
}

function showImageVoucher() {
	if (this.order.additionalInfo) {
		if (this.order.additionalInfo.urlVoucher) {
			return true;
		}
		return false;
	}
	return false;
}

function data() {
	return {
		flag: false,
	};
}

export default {
	data,
	name: 'change-voucher',
	created,
	computed: {
		showImageVoucher,
	},
	components: {
		modalSidebarButton,
	},
	props: {
		order: {
			default: () => {},
			type: Object,
		},
	},
};
</script>