<template>
	<div class="header-date-inventory">
		<div class="header-item">
			<span class="header-label title">Fecha de Inicio: </span>
			<span class="header-label date">{{ dateStart }}</span>
		</div>
		<div class="header-item">
			<span class="header-label title">Fecha Fin: </span>
			<span class="header-label date">{{ dateEnd }}</span>
		</div>
	</div>
</template>

<script>
export default {
	name: 'header-inventory',
	props: {
		dateStart: [Date, String],
		dateEnd: [Date, String],
	},
};
</script>

<style lang="scss" scoped>
.header-label {
	color: map-get($colors, background-sidebar);
	font-size: 14px !important;
	&.date {
		font-size: 18px !important;
		font-weight: bold;
	}
}

.header-date-inventory {
	display: flex;
	margin-right: 10px;
	.header-item {
		display: flex !important;
		flex-direction: column;
		margin-right: 10px;
		width: 115px;
	}
}
</style>
