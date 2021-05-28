if (!nabu) { var nabu = {} }
if (!nabu.page) { nabu.page = {} }
if (!nabu.page.views) { nabu.page.views = {} }
if (!nabu.page.views.data) { nabu.page.views.data = {} }

nabu.page.views.data.TableListGenerator = function(name) { return Vue.component(name, {
	mixins: [nabu.page.views.data.DataCommon],
	template: "#" + name,
	data: function() {
		return {
			configuring: false,
			hiddenColNames: []
		}
	},
	activate: function(done) {
		this.activate(done);
	},
	created: function() {
		this.create();
	},
	methods: {
		calculateRowspan: function(field, record) {
			// no rowspan at all, return 1
			if (!this.cell.state.rowGroups || this.cell.state.rowGroups.length == 0) {
				return 1;
			}
			// the index of the field
			var index = this.cell.state.fields.indexOf(field);
			var grouping = this.cell.state.rowGroups.filter(function(x) { return x.fieldIndex == index })[0];
			// if we are not grouping on this field or it is not fully configured, nobody cares
			if (!grouping || !grouping.fieldName) {
				return 1;
			}
			// if we are grouping this field, we need to get the value in the current field
			var current = this.$services.page.getValue(record, grouping.fieldName);
			var recordIndex = this.records.indexOf(record);
			// if we are not the first record, check if the previous record has the same value
			if (recordIndex > 0) {
				// if we don't allow for subgrouping on this record, we can just check the previous record
				// if it has the same value, we don't want to show this
				if (!grouping.subGroup) {
					var previousRecord = this.records[recordIndex - 1];
					var previous = this.$services.page.getValue(previousRecord, grouping.fieldName);
					// if we have the same value as the previous, we don't want to show this
					if (previous == current) {
						return -1;
					}
				}
				// if we allow for subgrouping, just the fact that the previous record has the same value is not enough
				// it might have the same value but still be restricted by a parent group
				else {
					for (var j = 0; j < recordIndex; j++) {
						var window = this.findRowGroupSizeForGroup(grouping, j);
						if (window > 1) {
							// we always increment with 1 in the loop itself, so if we have a window beyond 1, increment with that
							j += window - 1;
						}
					}
					// if we jumped onto or beyond the record index, this value is contained in a previous grouping
					if (j > recordIndex) {
						return -1;
					}
				}
			}
			// if we get here, we are row grouping and we are the first of our kind, check how far it goes
			return this.findRowGroupSize(field, recordIndex);
		},
		findRowGroupSize: function(field, recordIndex) {
			var index = this.cell.state.fields.indexOf(field);
			var grouping = this.cell.state.rowGroups.filter(function(x) { return x.fieldIndex == index })[0];
			if (!grouping || !grouping.fieldName) {
				return 1;
			}
			return this.findRowGroupSizeForGroup(grouping, recordIndex);
		},
		findRowGroupSizeForGroup: function(grouping, recordIndex) {
			var last = null;
			for (var i = recordIndex; i < this.records.length; i++) {
				var current = this.$services.page.getValue(this.records[i], grouping.fieldName);
				if (i == recordIndex) {
					last = current;
				}
				// we have reached the end!
				else if (last != current) {
					break;
				}
			}
			// suppose we have [a, b, b, b, c, d] and looking from recordIndex 1
			// i will be at "c" (position 4) by the time the loop breaks
			// if we return 4 - 1, we get the size of the group: 3
			var result = i - recordIndex;
			// if it is a subgroup -> we can't go beyond parent group
			if (grouping.subGroup) {
				var groupIndex = this.cell.state.rowGroups.indexOf(grouping);
				if (groupIndex > 0) {
					var limiter = this.findRowGroupSizeForGroup(this.cell.state.rowGroups[groupIndex - 1], recordIndex);
					if (limiter > 0) {
						result = Math.min(result, limiter);
					}
				}
			}
			return result;
		},
		addGroupingField: function() {
			if (!this.cell.state.rowGroups) {
				Vue.set(this.cell.state, "rowGroups", []);
			}
			this.cell.state.rowGroups.push({
				fieldIndex: 0,
				fieldName: null,
				subGroup: false
			});
		},
		addDevice: function(field) {
			if (!field.devices) {
				Vue.set(field, "devices", []);
			}
			field.devices.push({name: null, operator: '>='});
		},
		isAllowedDevice: function(field) {
			return !field.devices || field.devices.length == 0 || this.$services.page.isDevice(field.devices);
		},
		configure: function() {
			this.configuring = true;
		},
		configurator: function() {
			return "data-table-list-configure"
		},
		addTopHeaderField: function() {
			if (!this.cell.state.topHeaders) {
				Vue.set(this.cell.state, "topHeaders", []);
			}
			this.cell.state.topHeaders.push({
				label: null,
				subheaders: [],
				colspan: null,
				styles: []
			});
		},
		addSubheader: function(field) {
			field.subheaders.push(null);
		},
		addStyle: function(field) {
			field.styles.push({
				class: null,
				condition: null
			});
		},
		fieldUp: function(field) {
			var index = this.cell.state.topHeaders.indexOf(field);
			if (index > 0) {
				var replacement = this.cell.state.topHeaders[index - 1];
				this.cell.state.topHeaders.splice(index - 1, 1, field);
				this.cell.state.topHeaders.splice(index, 1, replacement);
			}
		},
		fieldDown: function(field) {
			var index = this.cell.state.topHeaders.indexOf(field);
			if (index < this.cell.state.topHeaders.length - 1) {
				var replacement = this.cell.state.topHeaders[index + 1];
				this.cell.state.topHeaders.splice(index + 1, 1, field);
				this.cell.state.topHeaders.splice(index, 1, replacement);
			}
		},
		fieldBeginning: function(field) {
			var index = this.cell.state.topHeaders.indexOf(field);
			if (index > 0) {
				this.cell.state.topHeaders.splice(index, 1);
				this.cell.state.topHeaders.unshift(field);
			}
		},
		fieldEnd: function(field) {
			var index = this.cell.state.topHeaders.indexOf(field);
			if (index < this.cell.state.topHeaders.length - 1) {
				this.cell.state.topHeaders.splice(index, 1);
				this.cell.state.topHeaders.push(field);
			}
		},
		calculateColspan: function(field) {
			var self = this;
			if (field.subheaders != null && this.cell.state.hideEmptyColumns) {
				var result = field.subheaders.filter(function(subheader) {
					return !self.isAllFieldHidden(self.cell.state.fields[subheader]) && self.isAllowedDevice(self.cell.state.fields[subheader]);
				});
				field.colspan = result.length;
			}
			else if (field.subheaders != null) {
				field.colspan = field.subheaders.length;
			}
			else {
				field.colspan = 1;	
			}
			return field.colspan
		},
		subheadersHidden: function(field) {
			var self = this;
			if (field.subheaders != null && field.subheaders.length > 1) {
				var result = field.subheaders.filter(function(subheader) {
					return !self.isAllFieldHidden(self.cell.state.fields[subheader]) && self.isAllowedDevice(self.cell.state.fields[subheader]);
				});
				return result.length == 0;
			}
			else {
				return false;
			}
		}
	}
});}

nabu.page.views.data.TableList = nabu.page.views.data.TableListGenerator("data-table-list");
nabu.page.views.data.TableListGenerator("data-table-list-configure");