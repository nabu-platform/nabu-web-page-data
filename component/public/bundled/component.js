window.addEventListener("load", function() {
	application.bootstrap(function($services) {
		
		$services.router.register({
			alias: "data-table",
			enter: function(parameters) {
				return new nabu.page.views.data.Table({propsData:parameters});
			},
			slow: true
		});
		
		$services.router.register({
			alias: "data-table-list",
			icon: "page/data/images/table.svg",
			description: "A tabular view of data",
			name: "Table",
			category: "data",
			enter: function(parameters) {
				return new nabu.page.views.data.TableList({propsData:parameters});
			},
			slow: true
		});
		
		// should be possible but no immediate usecase for it
		// it is exposed as a list handler for forms, that should be enough for now
		/*$services.router.register({
			alias: "data-multi-select",
			enter: function(parameters) {
				return new nabu.page.views.data.MultiSelect({propsData:parameters});
			}
		});*/
		
		$services.router.register({
			alias: "data-donut",
			enter: function(parameters) {
				return new nabu.page.views.data.Donut({propsData:parameters});
			},
			slow: true
		});
		
		$services.router.register({
			alias: "data-gauge",
			enter: function(parameters) {
				return new nabu.page.views.data.Gauge({propsData:parameters});
			},
			slow: true
		});
		
		$services.router.register({
			alias: "data-bar",
			enter: function(parameters) {
				return new nabu.page.views.data.Bar({propsData:parameters});
			},
			slow: true
		});
		
		$services.router.register({
			alias: "data-line",
			enter: function(parameters) {
				return new nabu.page.views.data.Line({propsData:parameters});
			},
			slow: true
		});
		
		$services.router.register({
			alias: "data-card",
			icon: "page/data/images/card.svg",
			description: "Display a list of data records as separate cards",
			category: "data",
			name: "Card",
			enter: function(parameters) {
				return new nabu.page.views.data.Card({propsData:parameters});
			},
			slow: true
		});
		
		// form list providers
		nabu.page.provide("page-form-list-input", { 
			component: "data-multi-select", 
			configure: "data-multi-select-configure", 
			name: "multi-select",
			namespace: "nabu.page"
		});
	
		return $services.$register({
			dataUtils: nabu.services.DataUtils
		});	
	});
	
	// register data filter provider
	nabu.page.provide("data-filter", { component: "data-filter-default", name: "Default Filter" });
	nabu.page.provide("data-filter", { component: "data-combo-filter", name: "Combo Filter", configure: "data-combo-filter-configure" });
});