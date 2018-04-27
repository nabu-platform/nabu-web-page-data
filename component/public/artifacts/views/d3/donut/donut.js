if (!nabu) { var nabu = {} };
if (!nabu.views) { nabu.views = {} };
if (!nabu.views.dashboard) { nabu.views.dashboard = {} };

nabu.views.dashboard.Table = Vue.extend({
	template: "#dashboard-donut",
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
	created: function() {
		this.normalize(this.cell.state);
	},
	methods: {
		normalize: function(state) {
			if (!state.title) {
				Vue.set(state, "title", null);
			}
			if (!state.width) {
				Vue.set(state, "width", null);
			}
			if (!state.height) {
				Vue.set(state, "height", null);
			}
		}
	}
});