Vue.component("page-data-filter-default", {
	template: "#page-data-filter-default",
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