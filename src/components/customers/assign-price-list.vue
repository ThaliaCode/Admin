<template>
  <div>
		<v-layout wrap align-center px-4 py-3>
			<v-flex xs12 md12>
				<v-layout>
					<v-flex xs11 mb-3>
						<v-radio-group v-model="idPriceList">
							<v-radio
							v-for="(item, index) in priceList"
							:key="index"
							color="primary"
							class="mb-3"
							:label="item.name"
							:value="item.id"
							></v-radio>
						</v-radio-group>
					</v-flex>
				</v-layout>
			</v-flex>
			<section class="modal-filter-footer">
				<modal-sidebar-button
				@cancel-button-clicked="closeModal"
				@accept-button-clicked="savePriceList"
				/>
			</section>
		</v-layout>
	</div>
</template>

<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function created() {
	this.loadListPrices();
}

function closeModal() {
	this.$emit('cancel-modal');
}

function savePriceList() {
	this.$emit('save-price', this.idPriceList);
}

async function loadListPrices() {
	try {
		const response = await this.listPricingPromise();
		this.priceList = response.data;
	} catch (error) {
		this.showGenericError();
	}
}

function data() {
	return {
		idPriceList: null,
		priceList: [],
	};
}

export default {
	name: 'assign-price-list',
	data,
	created,
	methods: {
		savePriceList,
		closeModal,
		loadListPrices,
	},
	components: {
		modalSidebarButton,
	},
};
</script>

<style lang="scss" scoped>
.content-list-prices {
	background-color: map-get($colors, title-table);
	margin-bottom: 3px;
	padding: 0 19px;
	width: 100%;
}
</style>