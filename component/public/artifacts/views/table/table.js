if (!nabu) { var nabu = {} }
if (!nabu.page) { nabu.page = {} }
if (!nabu.page.views) { nabu.page.views = {} }
if (!nabu.page.views.data) { nabu.page.views.data = {} }

nabu.page.views.data.Table = Vue.extend({
	template: "#data-table",
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
		},
		records: {
			type: Array,
			required: false,
			default: function() { return [] }
		},
		selected: {
			type: Array,
			required: false,
			default: function() { return [] }
		},
		inactive: {
			type: Boolean,
			required: false,
			default: false
		},
		showEmpty: {
			type: Boolean,
			required: false,
			default: false
		}
	},
	data: function() {
		return {
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