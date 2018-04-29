if (!nabu) { var nabu = {} };
if (!nabu.views) { nabu.views = {} };
if (!nabu.views.dashboard) { nabu.views.dashboard = {} };

nabu.views.dashboard.Bar = Vue.extend({
	template: "#dashboard-bar",
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
	created: function() {
		this.normalize(this.cell.state);
	},
	computed: {
		events: function() {
			return this.$refs.data ? this.$refs.data.events : {};
		},
		fromColor: function() {
			return this.cell.state.fromColor ? this.cell.state.fromColor : "darkred";
		},
		toColor: function() {
			return this.cell.state.toColor ? this.cell.state.toColor : "darkolivegreen";
		}
	},
	ready: function() {
		this.draw();		
	},
	methods: {
		// based heavily on: https://bl.ocks.org/mbostock/3886208
		draw: function() {
			var self = this;
			if (this.cell.state.y && this.$refs.svg && self.cell.state.y) {
				var records = this.records.filter(function(record) {
					return !!record[self.cell.state.y];
				});
				
				var zValues = [];
				var xValues = [];
				var yValues = [];
				var minY = 0;
				records.map(function(record, i) {
					if (self.cell.state.z) {
						var z = record[self.cell.state.z];
						if (zValues.indexOf(z) < 0) {
							zValues.push(z);
						}
					}
					if (self.cell.state.x) {
						var x = record[self.cell.state.x];
						if (xValues.indexOf(x) < 0) {
							xValues.push(x);
							yValues.push(0);
						}
					}
					else {
						xValues.push(i);
					}
					var y = record[self.cell.state.y];
					if (minY == null || y < minY) {
						minY = y;
					}
					if (self.cell.state.x) {
						yValues[xValues.indexOf(record[self.cell.state.x])] += y;
					}
					else {
						yValues.push(y);
					}
				});
				
				if (this.cell.state.sortBy) {
					var combined = xValues.map(function(x, i) {
						return {
							x: x,
							y: yValues[i]
						}
					});
					combined.sort(function(a, b) {
						var value1 = a[self.cell.state.sortBy == 'x' ? 'x' : 'y'];
						var value2 = b[self.cell.state.sortBy == 'x' ? 'x' : 'y'];
						var comparison;
						if (typeof(value1) == "string") {
							comparison = value1.localeCompare(value2);
						}
						else if (value1 instanceof Date) {
							comparison = value1.getTime() - value2.getTime();
						}
						else {
							comparison = value1 - value2;
						}
						if (self.cell.state.reverseSortBy) {
							comparison *= -1;
						}
						return comparison;
					});
					xValues = combined.map(function(a) { return a.x });
					yValues = combined.map(function(a) { return a.y });
				}
				
				// calculate the range of the Y-axis
				var maxY = d3.max(yValues);
				
				// we don't calculate the min y value here, for stacked bars this could be a concatenated value
				// that means the "lowest" is the sum of many
				// instead we want the absolute lowest
				//var minY = d3.min(yValues);
				
				var margin = {top: 10, right: 10, bottom: 50, left: 50};
				
				// remove previous drawing (if any)
				nabu.utils.elements.clear(this.$refs.svg);
				
				var svg = d3.select(this.$refs.svg),
					width = this.$el.offsetWidth - margin.right - margin.left,
					// reserve some space for title etc
					height = this.$el.offsetHeight - (self.cell.state.title ? 80 : 30);

				// it is obviously not an exact science, one is an angle, the other is pixels
				// but the bigger the angle, the more space we need
				// so it is closely related...
				if (this.cell.state.rotateX) {
					var longest = 0;
					xValues.map(function(value) {
						if (("" + value).length > longest) {
							longest = ("" + value).length;
						}
					});
					// we assume a fixed size per letter (e.g. 12)
					// we take a percentage based on the angle
					height -= longest * 14 * (Math.min(50, this.cell.state.rotateX) / 100);
				}
					
				svg.attr('width', width + margin.left + margin.right)
					.attr('height', height + margin.top + margin.bottom);
					
				var x = d3.scaleBand()
					.rangeRound([0, width])
					.domain(xValues)
					.paddingInner(0.05)
					.align(0.1);
				
				var y = d3.scaleLinear()
					.rangeRound([height, 0])
					.domain([minY, maxY])
					.nice();
				
				var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
				
				var htmlBuilder = null;
				
				if (zValues.length) {
					
					if (this.cell.state.groupType == "stacked") {
						// to retrieve the original record, we have to jump through some hoops
						// we transformed the data to match the stuff that is required by the stacked bars
						// however, we want to show the original record in the popup
						htmlBuilder = function (data, i, rects) {
							console.log("got here?");
							// we get the rectangle that triggered the event
							var rect = rects[i];
							// in the parent, we injected the zValue as an attribute with the correct key
							var zValue = rect.parentNode.getAttribute("zValue");
							// we can extract the correct x value from the record
							var xValue = data.data[self.cell.state.x];
							// now we need to pinpoint the correct record based on that information
							var record = records.filter(function(x) {
								return x[self.cell.state.x] == xValue && x[self.cell.state.z] == zValue;
							})[0];
							// build the standard tooltip from that
							self.$services.dashboard.buildStandardD3Tooltip(record, i, self.$refs.data.buildToolTip);	
						};
						// we need to transform the data, we receive M records
						// where each record has one combination of x,y,z
						// however the format expected is
						// M / z records where each record has x and a y for each z
						var data = [];
						
						xValues.map(function(xValue) {
							var single = {};
							single[self.cell.state.x] = xValue;
							records.map(function(record) {
								if (record[self.cell.state.x] == xValue) {
									single[record[self.cell.state.z]] = record[self.cell.state.y];
								}
								else if (!single[record[self.cell.state.z]]) {
									single[record[self.cell.state.z]] = 0;
								}
							});
							data.push(single);
						})
						
						var z = d3.scaleLinear()
							.domain([0, zValues.length])
							.range([this.fromColor, this.toColor])
							.interpolate(d3.interpolateHcl);
							
						g.append("g")
							.selectAll("g")
							.data(d3.stack().keys(zValues)(data))
							.enter().append("g")
								.attr("fill", function(d) { return z(zValues.indexOf(d.key)) })
								.attr("zValue", function(d) { return d.key })
							.selectAll("rect")
							.data(function(d) { return d; })
							.enter().append("rect")
								.attr("class", "bar bar-" + self.cell.id)
								.attr("x", function(d, i) { return self.cell.state.x ? x(d.data[self.cell.state.x]) : x(i); })
								.attr("y", function(d) { return y(d[1]); })
								.attr("height", function(d) { return y(d[0]) - y(d[1]); })
								.attr("width", x.bandwidth());
						
						g.append("g")
							.attr("class", "axis")
							.attr("transform", "translate(0," + height + ")")
							.call(d3.axisBottom(x));
						
						var yAxis = g.append("g")
							.attr("class", "axis")
							.call(d3.axisLeft(y).ticks(10))
							.append("text")
	//						.attr("x", 2)
	//						.attr("y", y(y.ticks().pop()) + 0.5)
							.attr("class", "y-axis-label")
							.attr("fill", "#333")
							.attr("font-weight", "bold")
	//						.attr("text-anchor", "start")
							// rotate and shift a bit
							.attr("transform", "rotate(-90)")
							.attr("y", 6)
							.attr("dy", "0.71em");
							
						if (this.cell.state.yLabel) {
							yAxis.text(this.cell.state.yLabel);
						}
					}
					// side-by-side
					else {
						
					}
					
					if (this.cell.state.legend) {
						var legend = g.append("g")
							.attr("font-family", "sans-serif")
							.attr("font-size", 10)
							.attr("text-anchor", "end")
							.selectAll("g")
							.data(zValues.slice().reverse())
							.enter().append("g")
							.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
						
						legend.append("rect")
							.attr("x", width - 19)
							.attr("width", 19)
							.attr("height", 19)
							.attr("fill", function(d) { return z(zValues.indexOf(d)) });
						
						legend.append("text")
							.attr("x", width - 24)
							.attr("y", 9.5)
							.attr("dy", "0.32em")
							.text(function(d) { return d; });
					}
				}
				else {
					htmlBuilder = function (data, i) {
						console.log("wtf?");
						self.$services.dashboard.buildStandardD3Tooltip(data, i, self.$refs.data.buildToolTip);	
					}
					var xAxis = g.append("g")
						.attr("class", "axis axis--x")
						.attr("transform", "translate(0," + height + ")")
						.call(d3.axisBottom(x));
						
					// if you want to rotate the labels on the x axis, make it so scotty
					if (this.cell.state.rotateX) {
						xAxis
							.selectAll("text")
							.style("text-anchor", "end")
							.attr("transform", "rotate(-" + this.cell.state.rotateX + ")");
					}
					
					var yAxis = g.append("g")
						.attr("class", "axis axis--y")
						.call(d3.axisLeft(y).ticks(10))
						.append("text")
						.attr("class", "y-axis-label")
						.attr("fill", "#333")
						.attr("transform", "rotate(-90)")
						.attr("y", 6)
						.attr("dy", "0.71em")
						.attr("text-anchor", "end");
					
					if (this.cell.state.yLabel) {
						yAxis.text(this.cell.state.yLabel);
					}
					
					g.selectAll(".bar-" + self.cell.id)
						.data(records)
						.enter().append("rect")
						// round the corners
						.attr("ry", "5")
						.attr("fill", this.fromColor)
						.attr("class", "bar bar-" + self.cell.id)
						.attr("x", function(d, i) { return self.cell.state.x ? x(d[self.cell.state.x]) : x(i) })
						.attr("y", function(d) { return y(d[self.cell.state.y]); })
						.attr("width", x.bandwidth())
						.attr("height", function(d) { return height - y(d[self.cell.state.y]); });
				}
				
				// standard tooltip logic
				var toolTip = function(selection) {
					selection.on('mouseenter', htmlBuilder);
					selection.on('mouseout', function () {
						self.$services.dashboard.removeStandardD3Tooltip();
					});
				}
				d3.selectAll(".bar-" + self.cell.id).call(toolTip);
			}
		},
		normalize: function(state) {
			if (!state.x) {
				Vue.set(state, "x", null);
			}
			if (!state.y) {
				Vue.set(state, "y", null);
			}
			if (!state.z) {
				Vue.set(state, "z", null);
			}
			if (!state.rotateX) {
				Vue.set(state, "rotateX", 0);
			}
			if (!state.yLabel) {
				Vue.set(state, "yLabel", null);
			}
			if (!state.unit) {
				Vue.set(state, "unit", null);
			}
			if (!state.fromColor) {
				Vue.set(state, "fromColor", null);
			}
			if (!state.toColor) {
				Vue.set(state, "toColor", null);
			}
			if (!state.arcWidth) {
				Vue.set(state, "arcWidth", 30);
			}
			if (!state.legend) {
				Vue.set(state, "legend", false);
			}
			if (!state.sortBy) {
				Vue.set(state, "sortBy", null);
			}
			if (!state.reverseSortBy) {
				Vue.set(state, "reverseSortBy", false);
			}
			if (!state.groupType) {
				Vue.set(state, "groupType", false);
			}
		},
		// standard methods!
		configure: function() {
			this.$refs.data.configuring = true;	
		},
		refresh: function() {
			this.$refs.data.load();
		}
	},
	watch: {
		records: function(newValue) {
			if (this.loaded) {
				this.draw();
			}
		}
	}
});