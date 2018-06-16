if (!nabu) { var nabu = {} }
if (!nabu.page) { nabu.page = {} }
if (!nabu.page.views) { nabu.page.views = {} }
if (!nabu.page.views.data) { nabu.page.views.data = {} }

nabu.page.views.data.TableList = Vue.extend({
	mixins: [nabu.page.views.data.DataCommon],
	template: "#data-table-list",
	data: function() {
		return {
			configuring: false
		}
	},
	activate: function(done) {
		this.activate(done);
	},
	created: function() {
		this.create();
	},
	methods: {
		configure: function() {
			this.configuring = true;
		}
	}
});

