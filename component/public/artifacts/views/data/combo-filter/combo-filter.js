Vue.component("data-combo-filter", {
	template: "#data-combo-filter",
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
		}, 
		state: {
			type: Object,
			required: false,
			default: function() { return {} }
		}
	},
	data: function() {
		return {
			activeFilter: false,
			showLabels: false
		}
	},
	created: function() {
		this.activeFilter = this.filters[0];
	},
	methods: {
		filter: function(value, label) {
			
		},
		setFilter: function(filter, newValue) {
			// set locally
			Vue.set(this.state, filter.name, newValue);
			// broadcast to parent
			this.$emit('filter', filter, newValue);
		}
	}
})