<template>
	<div class="snowfall">
		<div
			v-for="i in snowflakesCount"
			:key="i"
			class="snowflake"
			:style="getSnowflakeStyle()"
		>
			❄️
		</div>
	</div>
</template>

<script>
export default {
	name: 'app-snow-fall',
	data() {
		return {
			snowflakesCount: 100,
		};
	},
	methods: {
		getSnowflakeStyle() {
			const size = Math.random() * 10 + 5;
			const startPositionX = Math.random() * 100;
			const animationDuration = Math.random() * 5 + 5;
			const delay = Math.random() * 2;
			const rotation = Math.random() * 360;
			const drift = Math.random() * 2 - 1;

			return {
				fontSize: `${size}px`,
				left: `${startPositionX}vw`,
				animationDuration: `${animationDuration}s`,
				animationDelay: `${delay}s`,
				animationTimingFunction: 'linear',
				transform: `rotate(${rotation}deg) translateX(${drift}vw)`,
			};
		},
	},
};
</script>

<style lang="scss" scoped>
.snowfall {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	pointer-events: none;
	z-index: 9999;
	overflow: hidden;
	font-family: 'Arial', sans-serif;
}

.snowflake {
	position: absolute;
	top: -10px;
	color: white;
	text-shadow: 0 0 5px rgba(255, 255, 255, 0.8),
		0 0 10px rgba(255, 255, 255, 0.6);
	opacity: 0.8;
	animation: fall linear infinite;
}

@keyframes fall {
	0% {
		transform: translateY(0) rotate(0deg);
		opacity: 0.9;
	}
	100% {
		transform: translateY(100vh) rotate(360deg);
		opacity: 0.5;
	}
}
</style>
