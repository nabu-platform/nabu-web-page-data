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
			paging: {}
		}	
	},
	computed: {
		operation: function() {
			return this.cell.state.operation ? this.$services.swagger.operations[this.cell.state.operation] : null;
		}
	},
	activate: function(done) {
		this.load().then(function() {
			done();
		});
	},
	methods: {
		updateOperation: function(operation) {
			this.cell.state.operation = operation.id;
			var bindings = {};
			if (operation.parameters) {
				var self = this;
				operation.parameters.map(function(parameter) {
					bindings[parameter.name] = self.cell.state.bindings && self.cell.state.bindings[parameter.name]
						? self.cell.state.bindings[parameter.name]
						: null;
				});
			}
			Vue.set(this.cell.state, "bindings", bindings);
		},
		getOperations: function(name) {
			var self = this;
			return this.$services.dashboard.getOperations(function(operation) {
				// must be a get
				var isAllowed = operation.method.toLowerCase() == "get"
					// and contain the name fragment (if any)
					&& (!name || operation.id.toLowerCase().indexOf(name.toLowerCase()) >= 0)
					// must have _a_ response
					&& operation.responses["200"];
				// we also need at least _a_ complex array in the results
				if (isAllowed) {
					var schema = operation.responses["200"].schema;
					var definition = self.$services.swagger.definition(schema["$ref"]);
					// now we need a child in the definition that is a record array
					// TODO: we currently don't actually check for a complex array, just any array, could be an array of strings...
					isAllowed = false;
					if (definition.properties) {
						Object.keys(definition.properties).map(function(field) {
							if (definition.properties[field].type == "array") {
								isAllowed = true;
							}
						});
					}
				}
				return isAllowed;
			});
		},
		load: function(page) {
			var promise = this.$services.q.defer();
			if (this.cell.state.operation) {
				var self = this;
				this.$services.swagger.execute(this.cell.state.operation).then(function(list) {
					self.records.splice(0, self.records.length);
					Object.keys(list).map(function(field) {
						if (list[field] instanceof Array && !self.records.length) {
							nabu.utils.arrays.merge(self.records, list[field]);
						}
					});
					if (list.page) {
						nabu.utils.objects.merge(self.paging, list.page);
					}
					promise.resolve();
				}, function(error) {
					promise.resolve(error);
				});
			}
			else {
				promise.resolve("No operation found");
			}
			return promise;
		}
	}
});