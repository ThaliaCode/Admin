<template>
	<v-layout align-center wrap pb-1
		:class="[
			'border-bottom user-wrap-container',
		]"
		@click="$emit('click')"
	>
		<span class="user-image">
			<img
				:src="userAvatar"
				alt=""
				height="33"
				width="33"
			/>
		</span>
		<span class="d-flex user-container align-center justify-space-between pl-3">
			<span class="user-info">
				<p class="user-name mb-1">{{ userFullName }}</p>
				<p class="date">{{ date | exactDate('DD/MM/YYYY - HH:mm:ss') }}</p>
			</span>
			<app-tooltip-button
				v-if="isVisibleUser"
				class="user-config text-center"
				img="/static/img/user-config.svg"
				text="Usuarios"
				@click-icon="$emit('open-users')"
			></app-tooltip-button>
		</span>
	</v-layout>
</template>

<script>
	export default {
		name: 'user-data',
		props: {
			date: [Date, String],
			userAvatar: {
				default: 'https://s3.amazonaws.com/japi-admin/place-holder.svg',
				type: String,
			},
			userFullName: String,
			isVisibleUser: {
				type: Boolean,
				default: false,
			},
		},
	};
</script>

<style lang="scss" scoped>
	.user-wrap-container {
		height: 57px;
	}

	.user-image {
		border-radius: 100%;
		display: inline-block;
		height: 33px;
		overflow: hidden;
		width: 33px;
	}

	.user-info {
		line-height: 1;
	}

	.user-name {
		color: color(primary);
		font-family: font(open-semibold);
		font-size: size(small11);
		margin: 0px;
	}

	.user-container {
		width: calc(100% - 33px);
	}

	.date {
		color: color(blue-card);
		font-family: font(open-semibold);
		font-size: size(small10);
		margin: 0px;
	}

	.border-bottom {
		border-bottom: 1px solid color(blue-grey);
	}

	.disabled-class {
		opacity: 0.4;
	}

	.text-center {
		text-align: center;
	}
</style>