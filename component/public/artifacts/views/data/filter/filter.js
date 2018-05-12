Vue.component("data-filter-default", {
	template: "#data-filter-default",
	props: {
		page: {
			type: Object,
			required: true
		},
		cell: {
			type: Object,
			required: true
		},
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