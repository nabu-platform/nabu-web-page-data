if (!nabu) { var nabu = {} }
if (!nabu.page) { nabu.page = {} }
if (!nabu.page.views) { nabu.page.views = {} }
if (!nabu.page.views.data) { nabu.page.views.data = {} }

nabu.page.views.data.Line = Vue.extend({
	template: "#data-line",
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
		fromColor: function() {
			return this.cell.state.fromColor ? this.cell.state.fromColor : "darkred";
		},
		toColor: function() {
			return this.cell.state.toColor ? this.cell.state.toColor : "darkolivegreen";
		},
		arcWidth: function() {
			return this.cell.state.arcWidth ? this.cell.state.arcWidth / 100 : 0.1;
		}
	},
	methods: {
		getEvents: function() {
			return this.$refs.data ? this.$refs.data.getEvents() : {};
		},
		// http://projects.delimited.io/experiments/multi-series/multi-line-full.html
		draw: function() {
			var self = this;
			if (this.cell.state.y && this.$refs.svg) {
				nabu.utils.elements.clear(this.$refs.svg);
				var records = this.records.filter(function(record) {
					return typeof(record[self.cell.state.y]) != "undefined";
				});
				var margin = {top: 20, right: 55, bottom: 30, left: 40};
					
				var x = d3.scaleBand()
					.rangeRound([0, width]);
				
				var y = d3.scaleLinear()
					.rangeRound([height, 0]);
				
				var svg = d3.select(this.$refs.svg),
					width = this.$el.offsetWidth - margin.right - margin.left,
					// reserve some space for title etc
					height = this.$el.offsetHeight - (self.cell.state.title ? 80 : 30);
					
				// subtract for actions
				if (self.$refs.data.globalActions.length) {
					height -= 75;
				}
				
				// copy from bar.js to determine height based on angle of labels
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
					
				var result = this.$services.dataUtils.extractValues(self.cell, records);
				var xValues = result.xValues;
				var yValues = result.yValues;
				var zValues = result.zValues;
				var minY = result.minY;
				var maxY = result.maxY;
				
				var g = svg.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
				
				var x = d3.scaleBand()
					.rangeRound([0, width])
					.padding(0.1)
					.domain(xValues)
					.align(0.1);
					
				var y = d3.scaleLinear()
					.rangeRound([height, 0])
					.domain([minY, maxY])
					.nice();
	
				var xAxis = g.append("g")
					.attr("class", "axis")
					.attr("transform", "translate(0," + height + ")")
					.call(d3.axisBottom(x).tickFormat(function(d) {
						return self.$services.formatter.format(d, self.cell.state.xFormat);	
					}));
					
				// if you want to rotate the labels on the x axis, make it so scotty
				if (this.cell.state.rotateX) {
					xAxis
						.selectAll("text")
						.style("text-anchor", "end")
						.attr("transform", "rotate(-" + this.cell.state.rotateX + ")");
				}
					
				var yAxis = g.append("g")
					.attr("class", "axis")
					.call(d3.axisLeft(y).tickFormat(function(d) {
						return self.$services.formatter.format(d, self.cell.state.yFormat);	
					}))
					.append("text")
					.attr("class", "y-axis-label")
					.attr("fill", "#333")
					// rotate and shift a bit
					.attr("transform", "rotate(-90)")
					.attr("y", 6)
					.attr("dy", "0.71em");
					
				if (this.cell.state.yLabel) {
					yAxis.text(this.cell.state.yLabel);
				}
				
				var line = d3.line()
					.x(function (d) { return x(d.label) + x.bandwidth() / 2; })
					.y(function (d) { return y(d.value); });
					
				if (self.cell.state.interpolation) {
					line.curve(self.cell.state.interpolation);
				}
					
				var color = d3.scaleLinear()
					.domain([0, zValues.length ? zValues.length : 1])
					.range([this.fromColor, this.toColor])
					.interpolate(d3.interpolateHcl);
					
				var seriesData;
				if (zValues.length) {
					seriesData = zValues.map(function (name) {
						return {
							name: name,
							values: records.filter(function(record) {
								return record[self.cell.state.z] == name;
							}).map(function (d, i) {
								return { name: name, label: self.cell.state.x ? d[self.cell.state.x] : i, value: d[self.cell.state.y], data: d };
							})
						};
					});
				}
				else {
					seriesData = [{
						name: "series",
						values: records.map(function(record, i) {
							return {
								name: "series",
								label: self.cell.state.x ? record[self.cell.state.x] : i,
								value: record[self.cell.state.y],
								data: record
							}
						})
					}];
				}
				
				var htmlBuilder = function (data, i) {
					self.$services.dataUtils.buildStandardD3Tooltip(data.data, i, self.$refs.data.buildToolTip);	
				};
				
				var series = svg.selectAll(".series")
					.data(seriesData)
					.enter().append("g")
					.attr("class", "series");
				
				series.append("path")
					.attr("class", "line")
					.attr("d", function (d) { return line(d.values); })
					.style("stroke", function (d) { return color(zValues.length ? zValues.indexOf(d.name) : 0); })
					.style("stroke-width", "4px")
					.style("fill", "none")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
				
				if (self.cell.state.pointRadius) {
					series.selectAll(".point")
						.data(function (d) { return d.values; })
						.enter().append("circle")
						.attr("class", "point")
						.attr("cx", function (d) { return x(d.label) + x.bandwidth()/2; })
						.attr("cy", function (d) { return y(d.value); })
						.attr("r", self.cell.state.pointRadius + "px")
						//.style("fill", function (d) { return color(zValues.length ? zValues.indexOf(d.name) : 0); })
						//.style("stroke", "grey")
						//.style("stroke-width", "1px")
						.style("fill", "#fff")
						.style("stroke", function (d) { return color(zValues.length ? zValues.indexOf(d.name) : 0); })
						.style("stroke-width", "2px")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
						.on("mouseover", htmlBuilder)
						.on("mouseout",  self.$services.dataUtils.removeStandardD3Tooltip)
				}
				
				if (this.cell.state.legend && zValues.length) {
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
						.attr("fill", function(d) { return color(zValues.indexOf(d)) });
					
					legend.append("text")
						.attr("x", width - 24)
						.attr("y", 9.5)
						.attr("dy", "0.32em")
						.text(function(d) { return d; });
				}
				
			}
		},
		getInterpolation: function() {
			return [d3.curveLinear,d3.curveStepBefore,d3.curveStepAfter,d3.curveBasis,d3.curveBasisOpen, d3.curveBasisClosed, d3.curveBundle,d3.curveCardinal,d3.curveCardinal,d3.curveCardinalOpen,d3.curveCardinalClosed,d3.curveNatural];
		},
		normalize: function(state) {
			if (!state.x) {
				Vue.set(state, "x", null);
			}
			if (!state.xFormat) {
				Vue.set(state, "xFormat", {});
			}
			if (!state.y) {
				Vue.set(state, "y", null);
			}
			if (!state.yFormat) {
				Vue.set(state, "yFormat", {});
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
			if (!state.fromColor) {
				Vue.set(state, "fromColor", null);
			}
			if (!state.toColor) {
				Vue.set(state, "toColor", null);
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
			if (!state.interpolation) {
				Vue.set(state, "interpolation", null);
			}
			if (!state.pointRadius) {
				Vue.set(state, "pointRadius", 0);
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
		},
		cell: {
			handler: function() {
				console.log("state updated");
				this.draw();
			},
			deep: true
		},
		loaded: function(newValue) {
			this.draw();
		}
	}
});