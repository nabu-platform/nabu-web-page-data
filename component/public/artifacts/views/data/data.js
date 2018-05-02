if (!nabu) { var nabu = {} };
if (!nabu.views) { nabu.views = {} };
if (!nabu.views.dashboard) { nabu.views.dashboard = {} };

Vue.component("n-dashboard-data", {
	template: "#dashboard-data",
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
			required: true
		},
		value: {
			required: true
		}
	},
	data: function() {
		return {
			paging: {},
			configuring: false,
			actionHovering: false,
			last: null,
			showFilter: false,
			filters: {},
			ready: false,
			subscriptions: [],
			lastTriggered: null
		}	
	},
	created: function() {
		this.load();
		
		this.normalize(this.cell.state);
		var pageInstance = this.$services.page.instances[this.page.name];
		var self = this;
		this.cell.state.refreshOn.map(function(x) {
			self.subscriptions.push(pageInstance.subscribe(x, function() {
				self.load();
			}));
		});
	},
	beforeDestroy: function() {
		this.subscriptions.map(function(x) {
			x();
		});
	},
	ready: function() {
		this.ready = true;
		this.$emit("input", true);
	},
	computed: {
		filterable: function() {
			return this.cell.state.filters.length;  
		},
		actions: function() {
			return this.cell.state.actions.filter(function(x) {
				return !x.global && x.icon;
			});
		},
		globalActions: function() {
			return this.cell.state.actions.filter(function(x) {
				return x.global && x.label;
			});
		},
		dataClass: function() {
			return this.cell.state.class ? this.cell.state.class : [];        
		},
		events: function() {
			var result = {};
			if (this.operation) {
				var schema = this.operation.responses["200"].schema;
				var definition = this.$services.swagger.definition(schema["$ref"]);
				var parameters = [];
				Object.keys(this.definition).map(function(key) {
					parameters.push(key);
					// TODO: we have more metadata about the field here, might want to pass it along?
				});
				var self = this;
				this.cell.state.actions.map(function(action) {
					result[action.name] = action.global && !action.useSelection
						//? (self.cell.on ? self.$services.page.instances[self.page.name].getEvents()[self.cell.on] : [])
						? (self.cell.on ? self.cell.on : [])
						: parameters;
				});
			}
			return result;
		},
		operation: function() {
			return this.cell.state.operation ? this.$services.swagger.operations[this.cell.state.operation] : null;
		},
		availableParameters: function() {
			var parameters = this.$services.page.instances[this.page.name].availableParameters;
			var result = {};
			result.page = parameters.page;
			if (this.cell.on) {
				result[this.cell.on] = parameters[this.cell.on];
			}
			return result;
		},
		definition: function() {
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
		hasLimit: function() {
			return !this.operation || !this.operation.parameters ? false : this.operation.parameters.filter(function(x) {
				return x.name == "limit";
			}).length;
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
		eventDefinition: function() {
			if (this.operation) {
				var schema = this.operation.responses["200"].schema;
				var definition = this.$services.swagger.definition(schema["$ref"]);
				var parameters = [];
				Object.keys(this.definition).map(function(key) {
					parameters.push(key);
				});
				return parameters;
			}
			else {
				return [];
			}
		},
		keys: function() {
			var keys = Object.keys(this.definition);
			var self = this;
			keys.map(function(key) {
				if (!self.cell.state.result[key]) {
					Vue.set(self.cell.state.result, key, {
						label: null,
						format: null,
						custom: null,
						styles: []
					});
				}
			});
			return keys;
		},
		orderable: function() {
			// the operation must have an input parameter called "orderBy"
			return this.operation && this.operation.parameters.filter(function(x) {
				return x.name == "orderBy";
			}).length > 0;
		}
	},
	methods: {
		buildToolTip: function(d) {
			var html = "";
			var counter = 0;
			for (var index in this.keys) {
				var key = this.keys[index];
				if (!this.isHidden(key)) {
					html += "<div class='property'><span class='key'>" 
						+ (this.cell.state.result[key].label ? this.cell.state.result[key].label : key) 
						+ "</span><span class='value'>" 
						+ this.interpret(key, d[key], d) + "</span></div>";
				}
			}
			return html;
		},
		addStyle: function(key) {
			if (!this.cell.state.result[key].styles) {
				Vue.set(this.cell.state.result[key], "styles", []);
			}
			this.cell.state.result[key].styles.push({
				class:null,
				condition:null
			});
		},
		// standard methods!
		configure: function() {
			this.configuring = true;	
		},
		refresh: function() {
			this.load();
		},
		// custom methods
		setFilter: function(filter, newValue) {
			this.filters[filter.field] = newValue;
			this.load();
		},
		filtersToAdd: function(ignoreCurrentFilters) {
			var self = this;
			var currentFilters = this.cell.state.filters.map(function(x) {
				return x.name;
			});
			// any input parameters that are not bound
			return this.parameters.filter(function(x) {
				return !self.cell.bindings[x] && (currentFilters.indexOf(x) < 0 || ignoreCurrentFilters);
			});
		},
		addFilter: function() {
			this.cell.state.filters.push({
				field: null,
				label: null,
				type: 'text',
				enumerations: [],
				value: null
			})
		},
		trigger: function(action, data) {
			if (!action) {
				this.lastTriggered = data;
			}
			// if no action is specified, it is the one without the icon (and not global)
			if (!action && !this.actionHovering) {
				action = this.cell.state.actions.filter(function(x) {
					return !x.icon && !x.global;
				})[0];
			}
			if (action) {
				var pageInstance = this.$services.page.instances[this.page.name];
				var self = this;
				pageInstance.emit(action.name, data).then(function() {
					if (action.refresh) {
						self.load();
					}
				});
			}
		},
		normalize: function(state) {
			/*if (!state.transform) {
				Vue.set(state, "transform", null);
			}*/
			if (!state.orderBy) {
				Vue.set(state, "orderBy", []);
			}
			if (!state.title) {
				Vue.set(state, "title", null);
			}
			if (!state.limit) {
				Vue.set(state, "limit", 20);
			}
			// actions you can perform on a single row
			if (!state.actions) {
				Vue.set(state, "actions", []);
			}
			if (!state.filters) {
				Vue.set(state, "filters", []);
			}
			if (!state.refreshOn) {
				Vue.set(state, "refreshOn", []);
			}
			else {
				var self = this;
				state.filters.map(function(x) {
					Vue.set(self.filters, x.field, null);
				});
			}
			if (!state.showRefresh) {
				Vue.set(state, "showRefresh", false);
			}
			// we add a result entry for each field
			// we can then set formatters for each field
			if (!state.result) {
				Vue.set(state, "result", {});
			}
			Object.keys(this.definition).map(function(key) {
				if (!state.result[key]) {
					Vue.set(state.result, key, {
						label: null,
						format: null,
						custom: null,
						styles: []
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
		getDynamicClasses: function(key, record) {
			var styles = this.cell.state.result[key].styles;
			if (styles) {
				var self = this;
				return styles.filter(function(style) {
					return self.isCondition(style.condition, record);
				}).map(function(style) {
					return style.class;
				});
			}
			else {
				return [];
			}
		},
		isCondition: function(condition, record) {
			for (var key in record) {
				eval("var " + key + " = record[key];");
			}
			var result = eval(condition);
			if (result instanceof Function) {
				result = result(record);
			}
			return result == true;
		},
		addAction: function() {
			this.cell.state.actions.push({
				name: "unnamed",
				icon: null,
				label: null,
				condition: null,
				refresh: false,
				global: false,
				useSelection: false
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
					bindings[parameter.name] = self.cell.bindings && self.cell.bindings[parameter.name]
						? self.cell.bindings[parameter.name]
						: null;
				});
			}
			// TODO: is it OK that we simply remove all bindings?
			// is the table the only one who sets bindings here?
			Vue.set(this.cell, "bindings", bindings);
		},
		isHidden: function(key) {
			return this.cell.state.result[key] && this.cell.state.result[key].format == "hidden";	
		},
		interpret: function(key, value, record) {
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
				else if (format == "masterdata") {
					value = this.$services.masterdata.resolve(value);
				}
				else if (format == "custom") {
					value = this.formatCustom(key, value, record);
				}
				else if (typeof(value) == "string") {
					value = value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
						.replace(/\n/g, "<br/>").replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
				}
			}
			return value;
		},
		formatCustom: function(key, value, record) {
			if (this.cell.state.result[key].custom) {
				try {
					var result = eval(this.cell.state.result[key].custom);
					if (result instanceof Function) {
						result = result(key, value, record);	
					}
					return result;
				}
				catch (exception) {
					return exception.message;
				}
			}
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
				this.cell.state.filters.map(function(filter) {
					parameters[filter.field] = filter.type == 'fixed' ? filter.value : self.filters[filter.field];	
				});
				try {
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
						self.last = new Date();
						promise.resolve();
					}, function(error) {
						promise.resolve(error);
					});
				}
				catch(error) {
					console.warn("Could not run", this.cell.state.operation, error);
					promise.resolve(error);
				}
			}
			else {
				promise.resolve("No operation found");
			}
			return promise;
		}
	}
});