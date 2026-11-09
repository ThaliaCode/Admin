export default {
	props: {
		trackFilters: {
			type: Object,
			default: () => ({}),
		},
		trackKeys: {
			type: Array,
			default: null,
		},
	},
	data() {
		return {
			lastTrackedFilters: {},
			trackingTimeout: null,
		};
	},
	watch: {
		trackFilters: {
			deep: true,
			handler(newVal) {
				if (!newVal) return;

				if (this.trackingTimeout) {
					clearTimeout(this.trackingTimeout);
				}

				// Use a clone to ensure we're looking at the snapshotted values after 300ms
				const clonedVal = { ...newVal };
				this.trackingTimeout = setTimeout(() => {
					this._trackFilterChanges(clonedVal);
				}, 300);
			},
		},
	},
	methods: {
		_trackFilterChanges(newFilters) {
			if (!newFilters) return;
			const ignoredKeys = ['page', 'limit', 'offset', 'sort'];

			Object.keys(newFilters).forEach((key) => {
				const value = newFilters[key];

				// Check ignored keys
				if (ignoredKeys.includes(key)) return;

				// Check whitelist if exists
				if (this.trackKeys && !this.trackKeys.includes(key)) return;

				// Ignore empty values
				if (value === null || value === '' || value === undefined) return;

				// Ignore objects array too
				// if (typeof value === 'object') return;

				// Avoid consecutive duplicates
				if (this.lastTrackedFilters[key] === value) return;

				// Save to avoid duplicates
				this.lastTrackedFilters[key] = value;

				if (this.$analytics) {
					this.$analytics.trackFilter({
						page: this.$route ? this.$route.name : 'unknown',
						filter: key,
						// value, // de momento el value no se necesita
					});
				}
			});
		},
	},
};
