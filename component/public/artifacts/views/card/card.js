if (!nabu) { var nabu = {} }
if (!nabu.page) { nabu.page = {} }
if (!nabu.page.views) { nabu.page.views = {} }
if (!nabu.page.views.data) { nabu.page.views.data = {} }

nabu.page.views.data.Card = Vue.extend({
	template: "#data-card",
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
	methods: {
		// standard methods!
		configure: function() {
			this.$refs.data.configuring = true;	
		},
		refresh: function() {
			this.$refs.data.load();
		},
		getEvents: function() {
			return this.$refs.data ? this.$refs.data.getEvents() : {};
		}
	}
});