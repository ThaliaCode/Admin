<template>
	<div>
		<v-layout
			v-if="notifications.length === 0"
			justify-center mt-4>
			No hay notificaciones por el momento
		</v-layout>
		<v-layout
			v-else
			row
			wrap
			pa-3
			justify-center>
			<v-flex xs12
				v-for="notification in notifications"
				text-xs-center
				my-1
				:key="notification['.key']">
				<v-btn
					v-on:click="seeNotification(notification)"
					class="notification-card mx-0">
					<span
						:style="`background-color: ${notification.color}; color: ${notification.color};`"
						class="type">
						<img :src="notification.icon" alt="">
					</span>
					<div class="message">
						{{ notification.message }}
					</div>
					<span class="date">
						{{ notification.createdAt }}
					</span>
				</v-btn>
			</v-flex>
		</v-layout>
	</div>
</template>

<script>
	async function seeNotification(notification) {
		try {
			await this.$httpSales.delete(`notifications/${notification['.key']}/${notification.type}`);
			if (notification.type === 'sales') {
				this.goTo('sale-detail', { params: { saleId: notification.data.id } });
			}
			if (notification.type === 'oit') {
				this.goTo('oit-edit', { params: { id: notification.data.id } });
			}
			this.$emit('close-notifications-center');
		} catch (err) {
			this.showGenericError();
		}
	}

	export default {
		name: 'notifications-center',
		methods: {
			seeNotification,
		},
		props: {
			notifications: {
				default: () => [],
				type: Array,
			},
		},
	};
</script>

<style lang="scss" scoped>
	.notification-card {
		background-color: white !important;
		border-radius: 5px;
		box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, .25);
		color: map-get($colors, paginationText);
		font-family: map-get($fonts, open-semibold);
		font-size: 13px;
		height: auto;
		max-width: 427px;
		min-height: 92px;
		padding: 19px 18px 19px 0px;
		text-transform: none;
		width: 98%;

		.type {
			border-bottom-left-radius: 5px;
			border-top-left-radius: 5px;
			display: inline-block;
			height: 100%;
			left: 0px;
			padding-top: 15px;
			position: absolute;
			width: 12%;

			img {
				height: 20px;
			}

			&:before {
				border-bottom: 5px solid transparent;
				border-left: 6px solid;
				border-left-color: inherit;
				border-top: 5px solid transparent;
				bottom: 14px;
				content: '';
				position: absolute;
				right: -4px;
			}
		}

		.message {
			text-align: left;
		}

		.date {
			bottom: 2px;
			color: map-get($colors, subheaderText);
			font-size: map-get($sizes, small10);
			position: absolute;
			right: 5px;
		}
	}
</style>