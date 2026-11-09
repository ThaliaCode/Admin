<template>
	<div>
		<section class="price-list">
			<div
				class="price-list-component"
				v-for="(item, index) in priceLists"
				:key="index">
				<app-new-pricelist
					:list="item"
					:open-container-from-outside="index === 0"
					@add-price-range="addPriceRange($event, index)"
					@remove-price-range="removePriceRange($event, index)"
				/>
			</div>
		</section>
		<section class="feature-footer">
			<modal-sidebar-button
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="registerPrices"/>
		</section>
	</div>
</template>
<script>
import appNewPricelist from '@/components/products/utils/app-new-pricelist';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function data() {
	return {
		priceLists: [],
	};
}

function addPriceRange(id, itemIndex) {
	this.priceLists[itemIndex][id].ranges.push({ from: 0, to: 0, price: 0 });
}

function created() {
	this.loadPriceList();
}

async function loadPriceList() {
	try {
		const { data: response } = await this.listPricingPromise();
		this.priceLists = response.map((list) => {
			const newList = { ...list };
			newList[list.id] = {
				price: 0,
				ranges: [{ from: 0, price: 0, to: 0 }],
			};
			return newList;
		});
	} catch (error) {
		this.showGenericError();
	}
}

function removePriceRange({ id, index }, indexGeneral) {
	this.priceLists[indexGeneral][id].ranges.splice(index, 1);
}

async function registerPrices() {
	const price = {};
	this.priceLists.forEach((p) => {
		price[p.id] = p[p.id];
	});
	const body = {
		name: this.category.name,
		priceList: price,
	};
	try {
		await this.$httpProducts.patch(`categories/${this.id}`, body);
		this.$emit('update');
	} catch (error) {
		this.showGenericError('Error');
	}
}

export default {
	name: 'price-list-categories',
	components: {
		appNewPricelist,
		modalSidebarButton,
	},
	data,
	created,
	methods: {
		addPriceRange,
		loadPriceList,
		removePriceRange,
		registerPrices,
	},
	props: {
		id: [Number, String],
		categoryPrices: {
			type: [Object, Array],
			default: () => {},
		},
		category: {
			type: Object,
			default: () => {},
		},
	},
};
</script>
<style lang="scss" scoped>
	.add-new-price-list {
		@include vertical-displacement;
		height: 50px;
		margin-bottom: 30px;
		overflow: hidden;
		padding: 15px 30px;
	}

	.add-price-list {
		height: 190px;
	}

	.new-price-list-icon {
		align-items: center;
		cursor: pointer;
		display: flex;
		label {
			@include txt-config (open-regular, medium);
		}
	}

	.register-new-price-list {
		@include flex-around;
		margin-top: 19px;
		.icon {
			cursor: pointer;
		}
	}

	.price-list-component {
		width: 100%;
	}

	.price-list-component:nth-child(even) {
		background-color: map-get($colors, background-sidebar);
	}

	.new-list-title {
		color: black !important;
		font-family: map-get($fonts, open-semibold) !important;
		font-size: 13px !important;
	}
</style>


