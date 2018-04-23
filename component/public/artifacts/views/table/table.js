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
			paging: {},
			configuring: false
		}	
	},
	created: function() {
		this.normalize(this.cell.state);
	},
	computed: {
		operation: function() {
			return this.cell.state.operation ? this.$services.swagger.operations[this.cell.state.operation] : null;
		},
		result: function() {
			var properties = {};
			if (this.operation) {
				var schema = this.operation.responses["200"].schema;
				var definition = this.$services.swagger.definition(schema["$ref"]);
				if (definition.properties) {
					var self = this;
					Object.keys(definition.properties).map(function(field) {
						if (definition.properties[field].type == "array") {
							var items = definition.properties[field].items;
							if (items["$ref"]) {
								items = self.$services.swagger.definition(items["$ref"]);
							}
							if (items.properties) {
								nabu.utils.objects.merge(properties, items.properties);
							}
						}
					});
				}
			}
			return properties;
		},
		// all the actual parameters (apart from the spec-based ones)
		parameters: function() {
			if (!this.operation) {
				return [];
			}
			var blacklist = ["limit", "offset", "orderBy", "connectionId"];
			var parameters = this.operation.parameters.filter(function(x) {
				return blacklist.indexOf(x.name) < 0;
			});
			return parameters.map(function(x) { return x.name });
		},
		events: function() {
			var result = {};
			if (this.operation) {
				var schema = this.operation.responses["200"].schema;
				var definition = this.$services.swagger.definition(schema["$ref"]);
				var parameters = [];
				Object.keys(this.result).map(function(key) {
					parameters.push(key);
					// TODO: we have more metadata about the field here, might want to pass it along?
				});
				this.cell.state.actions.map(function(action) {
					result[action.name] = parameters;
				});
			}
			return result;
		},
		keys: function() {
			return Object.keys(this.result);
		},
		orderable: function() {
			// the operation must have an input parameter called "orderBy"
			return this.operation && this.operation.parameters.filter(function(x) {
				return x.name == "orderBy";
			}).length > 0;
		}
	},
	activate: function(done) {
		this.load().then(function() {
			done();
		});
	},
	methods: {
		configure: function() {
			this.configuring = true;	
		},
		normalize: function(state) {
			if (!state.orderBy) {
				Vue.set(state, "orderBy", []);
			}
			if (!state.limit) {
				Vue.set(state, "limit", 20);
			}
			// actions you can perform on a single row
			if (!state.actions) {
				Vue.set(state, "actions", []);
			}
			
			// we add a result entry for each field
			// we can then set formatters for each field
			if (!state.result) {
				Vue.set(state, "result", {});
			}
			Object.keys(this.result).map(function(key) {
				if (!state.result[key]) {
					Vue.set(state.result, key, {
						label: null,
						format: null
					});
				}
			});
			var self = this;
			this.parameters.map(function(x) {
				if (!self.cell.bindings[x]) {
					Vue.set(self.cell.bindings, x, null);
				}
			});
		},
		removeAction: function(action) {
			var index = this.cell.state.actions.indexOf(action);
			if (index >= 0) {
				this.cell.state.actions.splice(index, 1);
			}
		},
		addAction: function() {
			this.cell.state.actions.push({
				name: "unnamed",
				icon: null
			});
		},
		sort: function(key) {
			if (this.orderable) {
				var newOrderBy = [];
				if (this.cell.state.orderBy.indexOf(key) >= 0) {
					newOrderBy.push(key + " desc");
				}
				else if (this.cell.state.orderBy.indexOf(key + " desc") >= 0) {
					// do nothing, we want to remove the filter
				}
				else {
					newOrderBy.push(key);
				}
				this.cell.state.orderBy.splice(0, this.cell.state.orderBy.length);
				nabu.utils.arrays.merge(this.cell.state.orderBy, newOrderBy);
				this.load();
			}
		},
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
		// we want to be able to hide fields to reuse the same data source in multiple settings
		isHidden: function(key) {
			return this.cell.state.result[key] && this.cell.state.result[key].format == "hidden";	
		},
		interpret: function(key, value) {
			if (value) {
				var format = this.cell.state.result[key] ? this.cell.state.result[key].format : null;
				if (format == "link") {
					if (value.indexOf("http://") == 0 || value.indexOf("https://") == 0) {
						return "<a target='_blank' href='" + value + "'>" + value.replace(/http[s]*:\/\/([^/]+).*/, "$1") + "</a>";
					}
				}
				else if (format == "dateTime") {
					value = new Date(value).toLocaleString();
				}
				else if (format == "date") {
					value = new Date(value).toLocaleDateString();
				}
				else if (format == "time") {
					value = new Date(value).toLocaleTimeString();
				}
			}
			return value;
		},
		load: function(page) {
			var promise = this.$services.q.defer();
			if (this.cell.state.operation) {
				var self = this;
				var parameters = {};
				if (this.orderable && this.cell.state.orderBy.length) {
					parameters.orderBy = this.cell.state.orderBy;
				}
				
				// we put a best effort limit & offset on there, but the operation might not support it
				// at this point the parameter is simply ignored
				var limit = this.cell.state.limit ? parseInt(this.cell.state.limit) : 20;
				parameters.offset = (page ? page : 0) * limit;
				parameters.limit = limit;
				
				var pageInstance = this.$services.page.instances[this.page.name];
				// bind additional stuff from the page
				Object.keys(this.cell.bindings).map(function(name) {
					if (self.cell.bindings[name]) {
						parameters[name] = pageInstance.get(self.cell.bindings[name]);
					}
				});
				
				this.$services.swagger.execute(this.cell.state.operation, parameters).then(function(list) {
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
		},
		configureParameters: function() {
			
		}
	}
});