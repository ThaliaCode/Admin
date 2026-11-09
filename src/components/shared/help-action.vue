<template>
	<div class="help">
		<v-layout wrap px-4 pt-3>
			<v-flex xs12 mb-4
				v-for="item in items"
				:key="item.id"
			>
				<v-layout wrap align-center>
					<v-flex xs12>
						<img
							:alt="item.languages"
							:src="item.pathIcon"
							class="help-img"
							height="24"
							width="29"
						/>
						<label class="help-title">
							{{ item.languages }}
						</label>
					</v-flex>
					<v-flex xs12 mt-2 mb-4>
						<v-divider></v-divider>
					</v-flex>
				</v-layout>
				<v-layout wrap>
					<v-flex xs12>
						<label>Descripción:</label>
						<p class="help-content">{{ item.description }}</p>
					</v-flex>
					<v-flex xs12 v-show="item.link">
						<label class="help-subtitle">Tutorial:</label>
						<a
							class="help-link"
							:href="item.link"
							target="_blank"
							rel="noopener"
						>
							{{ item.link }}
						</a>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
	</div>
</template>

<script>
	export default {
		name: 'help-action',
		props: {
			items: {
				required: true,
				type: Array,
			},
		},
	};
</script>

<style lang="scss" scoped>
	.help {
		color: map-get($colors, paginationText);
		font-family: map-get($fonts, open-semibold);
		font-size: 13px;

		&-title {
			text-transform: uppercase;
			vertical-align: middle;
		}

		&-img {
			margin-right: 5px;
			vertical-align: middle;
		}

		&-content {
			color: map-get($colors, background-card-black);
			font-family: map-get($fonts, open-regular);
			font-size: 12px;
			margin-top: 10px;
		}

		&-link {
			color: map-get($colors, expansion-panel-header);
			font-family: map-get($fonts, open-regular);
		}
	}
</style>
