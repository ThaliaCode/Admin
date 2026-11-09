<template>
	<button 
		class="btn-average"
		:class="{ 'big': big }"
		:disabled="isLoading || disabledBtn"
		@click="checkAverageCost"
		>
		<span class="btn-average__text">Verficar Costo Promedio</span>
		<div class="ml-1">
			<v-progress-circular
				indeterminate
				v-if="isLoading"
				color="primary"
				size="10"
				:width="2"
			></v-progress-circular>
			<v-icon v-else-if="success" size="18">done</v-icon>
			<v-icon v-else-if="noSuccess" size="18">clear</v-icon>
		</div>
	</button>
</template>
<script>
import flagType from '@/shared/flag-type';

async function checkAverageCost() {
	this.isLoading = true;
	const body = {
		costValidation: this.products.map((p) => {
			const newV = {
				productId: p.productId || p.id,
				price: this.codeModule === flagType.Sales ? p.pricePerSale : p.priceCost || p.price,
			};
			if (this.codeModule === flagType.Purchases) {
				newV.quantity = p.quantity;
				newV.warehouseId = this.warehouseGeneral || p.warehouseSelectId;
			}
			return newV;
		}),
	};
	try {
		const { data: response } = await this.$httpProducts.patch(`products/average-cost-validation/${this.codeModule}`, body);
		this.noSuccess = response.every(r => r.exceeded);
		if (this.noSuccess) {
			this.isLoading = false;
			this.success = false;
			const sendProducts = response.reduce((acum, r) => {
				if (r.exceeded) {
					const newAcum = { ...r };
					newAcum.productName = this.products.find(p => p.productId === r.productId).name ||
						this.products.find(p => p.productId === r.productId).product.name || '';
					acum.push(newAcum);
				}
				return acum;
			}, []);
			this.$emit('average-cost-error', sendProducts);
		} else {
			this.success = true;
		}
	} catch (error) {
		this.showGenericError();
	} finally {
		this.isLoading = false;
	}
}

function data() {
	return {
		isLoading: false,
		success: false,
		noSuccess: false,
	};
}

export default {
	name: 'btn-average-cost',
	data,
	methods: {
		checkAverageCost,
	},
	props: {
		codeModule: [Number, String],
		big: {
			type: Boolean,
			default: false,
		},
		products: {
			type: Array,
			default: () => [],
		},
		disabledBtn: {
			type: Boolean,
			default: false,
		},
		warehouseGeneral: [Number],
	},
};
</script>
<style lang="scss" scoped>
	.btn-average {
		align-items: center;
		background-color: map-get($colors, success);
		border-radius: 5px;
		color: map-get($colors, paginationText);
		display: inline-flex;
		justify-content: center;
		height: 22px;
		width: 160px;

		&__text {
			font-size: 10px;
		}

		&.big {
			height: 30px;
		}
	}
</style>