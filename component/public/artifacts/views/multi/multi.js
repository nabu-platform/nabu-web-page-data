if (!nabu) { var nabu = {} }
if (!nabu.page) { nabu.page = {} }
if (!nabu.page.views) { nabu.page.views = {} }
if (!nabu.page.views.data) { nabu.page.views.data = {} }

Vue.component("data-multi-select-configure", {
	template: "<div/>",
});

// need id field to prevent doubles
// need (optional) value field to extract information
nabu.page.views.data.MultiSelect = Vue.component("data-multi-select", {
	template: "#data-multi-select",
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
		field: {
			type: Object,
			required: false
		},
		value: {
			required: false
		}
	},
	data: function() {
		return {
			loaded: false,
			sourceSelected: [],
			targetSelected: [],
			targetRecords: []
		}	
	},
	created: function() {
		if (!this.cell.state.childCell) {
			Vue.set(this.cell.state, "childCell", nabu.utils.objects.clone(this.cell));
			this.cell.state.childCell.state = {};
		}
		this.normalize(this.cell.state.childCell.state);
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
		},
		getDisplayOptions: function() {
			return ["data-table", "data-table-list"];
		},
		normalize: function(state) {
			// always set multiselect
			if (!state.multiselect) {
				Vue.set(state, "multiselect", true);
			}
			if (!state.valueField) {
				Vue.set(state, "valueField", true);
			}
			if (!state.idField) {
				Vue.set(state, "idField", true);
			}
			if (!state.displayType) {
				Vue.set(state, "displayType", null);
			}
		},
		addAll: function() {
			var self = this;
			var available = this.cell.state.idField ? self.targetRecords.map(function(x) { return self.$services.page.getValue(x, self.cell.state.idField) }) : self.targetRecords;
			self.sourceSelected.map(function(x) {
				var match = self.cell.state.idField ? self.$services.page.getValue(x, self.cell.state.idField) : x;
				if (available.indexOf(match) < 0) {
					self.targetRecords.push(x);
				}
			});
			self.sourceSelected.splice(0, self.sourceSelected.length);
		},
		removeAll: function() {
			var self = this;
			self.targetSelected.map(function(x) {
				var index = self.targetRecords.indexOf(x);
				self.targetRecords.splice(index, 1);
			});
			self.targetSelected.splice(0, self.targetSelected.length);
		},
		getValueFields: function() {
			return this.$services.page.getSimpleKeysFor({properties:this.$refs.data.definition});
		}
	},
	watch: {
		targetRecords: function(newValue) {
			if (this.value) {
				if (!this.value[this.field.name]) {
					Vue.set(this.value, this.field.name, []);
				}
				// remove all current
				this.value[this.field.name].splice(0, this.value[this.field.name].length);
				if (newValue && newValue.length) {
					var self = this;
					// add the new
					if (this.cell.state.valueField) {
						nabu.utils.arrays.merge(this.value[this.field.name], newValue.map(function(x) {
							return self.$services.page.getValue(x, self.cell.state.valueField);
						}));
					}
					else {
						nabu.utils.arrays.merge(this.value[this.field.name], newValue);
					}
				}
			}
		}
	}
});