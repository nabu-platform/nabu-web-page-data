if (!nabu) { var nabu = {} };
if (!nabu.views) { nabu.views = {} };
if (!nabu.views.dashboard) { nabu.views.dashboard = {} };

nabu.views.dashboard.Table = Vue.extend({
	template: "#dashboard-table",
	props: {
		page: {
			type: Object,
			required: true
		},
		parameters: {
			type: Object,
			required: false
		},
		cell: {
			type: Object,
			required: true
		},
		edit: {
			type: Boolean,
			required: true
		}
	},
	data: function() {
		return {
			records: [],
			loaded: false
		}	
	},
	computed: {
		events: function() {
			return this.$refs.data ? this.$refs.data.events : {};
		}
	},
	methods: {
		// standard methods!
		configure: function() {
			this.$refs.data.configuring = true;	
		},
		refresh: function() {
			this.$refs.data.load();
		}
	}
});