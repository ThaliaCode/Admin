
<template>
	<button 
		class="btn-win" 
		@click="goToPrize"
		:class="{'close': mini }">
		<div class="btn-win__content">
			<img 
				src="/static/img/gift-box.svg" 
				alt="premio" 
				class="btn-win__image">
		</div>
		<div class="btn-win__content--prize" :class="{'close': mini }">
			<span class="btn-win__text">Ganate Premios</span>
		</div>
	</button>
</template>
<script>

function goToPrize() {
	this.goTo('earn-loyalty');
}

export default {
	name: 'btn-win-prizes',
	methods: {
		goToPrize,
	},
	props: {
		mini: {
			type: Boolean,
			default: false,
		},
	},
};
</script>

<style lang="scss" scoped>
	.btn-win {
		align-items: center;
		background-color: color(success);
		display: flex;
		justify-content: flex-start;
		padding: 19px 10px;
		width: 100%;

		&__text {
			color: color(background-sidebar);
			font-size: 16px;
			font-weight: bold;
		}

		&.close {
			text-align: center;
		}

		&__content {
			background-color: color(success);
			position: relative;
			z-index: 2;
			
			&--prize {
				position: absolute;
				transform: translateX(50px);
				transition: transform 200ms ease-out;
				z-index: 1;

				&.close {
					transform: translateX(-185px) !important;
				}
			}
		}
	}
</style>