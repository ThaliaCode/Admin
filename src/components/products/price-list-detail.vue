<template>
	<div class="price-lists-viewer">
		<div
			v-for="list in formattedPriceLists"
			:key="list.id"
			class="price-list-item m-4"
		>
			<button
				class="price-list-heading"
				:class="{ open: openedLists.includes(list.id) }"
				@click="toggleOpen(list.id)"
				type="button"
			>
				<div class="heading-text">{{ list.name }}</div>
				<v-icon color="primary" size="26">
					{{
						openedLists.includes(list.id) ? 'arrow_drop_up' : 'arrow_drop_down'
					}}
				</v-icon>
			</button>

			<transition name="fade">
				<div v-if="openedLists.includes(list.id)" class="price-info">
					<div class="grid-row">
						<div class="grid-cell">
							<label>P. Vent.</label><span class="value">{{ list.price }}</span>
						</div>
						<div class="grid-cell">
							<label>P. Unit.</label
							><span class="value">{{ list.unitPrice }}</span>
						</div>
						<div class="grid-cell">
							<label>Imp.</label><span class="value">{{ list.taxes }}</span>
						</div>
						<div class="grid-cell">
							<label>Dscto.</label
							><span class="value">{{ list.discount }}%</span>
						</div>
					</div>

					<div v-if="list.ranges.length" class="section">
						<div class="section-title">Precio x mayor</div>
						<div
							class="range-row"
							v-for="(range, index) in list.ranges"
							:key="index"
						>
							De <span class="value">{{ range.from }}</span> a
							<span class="value">{{ range.to }}</span> :
							<span class="value"
								><b> {{ range.price }}</b></span
							>
						</div>
					</div>

					<div v-if="list.units.length" class="section">
						<div v-for="unit in list.units" :key="unit.id" class="unit-block">
							<div class="unit-title">Precio por {{ unit.name }}</div>
							<div class="grid-row">
								<div class="grid-cell">
									<label>P. Vent.</label
									><span class="value">{{ unit.price }}</span>
								</div>
								<div class="grid-cell">
									<label>P. Unit.</label
									><span class="value">{{ unit.unitPrice }}</span>
								</div>
								<div class="grid-cell">
									<label>Imp.</label><span class="value">{{ unit.taxes }}</span>
								</div>
								<div class="grid-cell">
									<label>Dscto.</label
									><span class="value">{{ unit.discount }}%</span>
								</div>
							</div>

							<div v-if="unit.ranges.length" class="ranges-unit">
								<div class="section-title">Precio x mayor</div>
								<div
									class="range-row"
									v-for="(range, rIndex) in unit.ranges"
									:key="rIndex"
								>
									De <span class="value">{{ range.from }}</span> a
									<span class="value">{{ range.to }}</span> :
									<span class="value"
										><b> {{ range.price }}</b></span
									>
								</div>
							</div>
						</div>
					</div>
				</div>
			</transition>
		</div>
	</div>
</template>

<script>
export default {
	name: 'PriceListDetail',
	props: {
		formattedPriceLists: {
			type: Array,
			required: true,
		},
	},
	data() {
		return {
			openedLists: [],
		};
	},
	methods: {
		toggleOpen(id) {
			if (this.openedLists.includes(id)) {
				this.openedLists = this.openedLists.filter((openId) => openId !== id);
			} else {
				this.openedLists.push(id);
			}
		},
	},
};
</script>

<style lang="scss">
.price-lists-viewer {
	padding: 8px;
}

.price-list-item {
	background-color: rgba(#f2f7f7, 0.45);
	border: 1px solid color(item-select);
	border-radius: 5px;
	margin-bottom: 7px;
	border-radius: 5px;
	margin-bottom: 12px;
	overflow: hidden;
	transition: all 0.3s ease;
}

.price-list-heading {
	background-color: rgba(#f2f7f7, 0.45);
	border: 5px;
	width: 100%;
	padding: 10px 14px;
	font-size: 14px;
	font-weight: 600;
	color: color(primary);
	text-align: left;
	display: flex;
	align-items: center;
	justify-content: space-between;
	cursor: pointer;
	text-transform: uppercase;
	&.open {
		border-bottom: 1px solid color(item-select);
		border-radius: 0px;
	}
}

.heading-text {
	flex-grow: 1;
}

.price-info {
	padding: 10px 14px;
	background-color: white;
}

.grid-row {
	display: flex;
	flex-wrap: wrap;
	margin-bottom: 6px;
}

.grid-cell {
	flex: 1 1 25%;
	min-width: 50px;
	padding: 4px 8px;
	box-sizing: border-box;
}

.grid-cell label {
	display: block;
	font-weight: 600;
	font-size: 11px;
	color: gray;
	margin-bottom: 2px;
}

.grid-cell span {
	display: block;
	font-size: 13px;
	color: #263238;
}

.section {
	margin-top: 12px;
}

.section-title {
	font-size: 13px;
	font-weight: 600;
	color: #455a64;
	margin-bottom: 6px;
}

.range-row {
	display: flex;
	align-items: center;
	// justify-content: space-between;
	font-size: 12px;
	padding-left: 6px;
	margin-bottom: 4px;
	.value {
		margin: 0 5px;
		min-width: 3rem;
	}
}

.value {
	border: 1px solid #e4e4e4;
	// margin: 0 4px;
	padding: 5px;
	border-radius: 5px;
	background: white;
}

.unit-block {
	background-color: #f1f8e9aa;
	border: 1px solid #c5e1a5ba;
	border-radius: 4px;
	padding: 6px;
	margin-bottom: 10px;
}

.unit-title {
	font-size: 12px;
	font-weight: bold;
	color: #558b2f;
	margin-bottom: 6px;
	text-transform: uppercase;
}

.ranges-unit {
	margin-top: 8px;
}
</style>
