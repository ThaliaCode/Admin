<template>
  <div>
		<div v-for="item in items" :key="item.id" class="wrapper-items">
			<div class="items">
				<span class="item-name">{{item.name}}</span>
				<div>
					<span 
						:class="{'mr-30' : !item.details}"
						class="item-value">{{currentSymbol}}{{item.amount | round}}</span>
					<button v-if="item.details" @click="toogleIcon(item)">
						<v-icon>{{item.icon}}</v-icon>
					</button>
				</div>
			</div>
			<div v-if="item.details && item.open" class="wrapper-list">
				<div v-for="list in item.details" :key="list.id" class="mb-2">
					<span>{{list.name}}</span>
					<span>S/.{{list.amount | round}}</span>
				</div>
			</div>
		</div>
		<div class="pa-2 d-flex justify-space-between text-right">
			<span class="item-total">Total</span>
			<span class="item-total mr-30">{{currentSymbol}}{{total | round}}</span>
		</div>
	</div>  
</template>
<script>
function toogleIcon(item) {
	const index = this.items.findIndex(i => i.id === item.id);
	if (index > -1) {
		this.items[index].open = !this.items[index].open;
		this.items[index].icon = this.items[index].open ? 'arrow_drop_up' : 'arrow_drop_down';
	}
}
export default {
	name: 'result-items',
	methods: {
		toogleIcon,
	},
	props: {
		items: {
			default: () => [],
			type: Array,
		},
		total: {
			type: [String, Number],
		},
		currentSymbol: String,
	},
};
</script>
<style lang="scss" scoped>
	.items {
		border-bottom: 2px solid map-get($colors, btn-toggle-text);
		display: flex;
		justify-content: space-between;
		
	}
	.wrapper-items {
		padding: 10px;
		&:last-child {
			border-bottom: none;
		}
	}
	.mr-30 {
		margin-right: 30px;
	}
	.item-name {
		font-family: map-get($fonts, lato-bold);
		font-size: 14px;
		text-transform: uppercase;
	}
	.item-value {
		font-family: map-get($fonts, lato-regular);
		font-size: 16px;
	}
	.item-total {
		font-family: map-get($fonts, lato-bold);
		font-size: 20px;
	}
	.wrapper-list {
		background: map-get($colors, stepper-content);
		display: flex;
		font-size: 12px;
		justify-content: space-around;
		flex-direction: column;
		padding: 7px;
	}
	.text-right {
		text-align: right;
	}
</style> 