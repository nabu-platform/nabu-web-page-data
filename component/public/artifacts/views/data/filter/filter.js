Vue.component("nabu-data-filter-default", {
	template: "#nabu-data-filter-default",
	props: {
		showRefresh: {
			type: Boolean, 
			required: false
		},
		orderable: {
			type: Boolean,
			required: false
		},
		filters: {
			type: Array,
			required: true
		}
	},
	created: function() {
		console.log("filters are", this.filters);
	},
	data: function() {
		return {
			showFilter: false,
			state: {}
		}
	},
	methods: {
		setFilter: function(filter, newValue) {
			// set locally
			Vue.set(this.state, filter.name, newValue);
			// broadcast to parent
			this.$emit('filter', filter, newValue);
		}
	}
})