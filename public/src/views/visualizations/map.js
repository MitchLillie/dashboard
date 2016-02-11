define([
    "hr/utils",
    "hr/dom",
    "hr/hr",
    "utils/i18n",
    "datamaps",
    "utils/template",
    "core/api",
    "core/settings",
    "core/colors",
    "views/visualizations/base"
], function(_, $, hr, i18n, Datamap, template, api, settings, color, BaseVisualization) {
    var Visualization = BaseVisualization.extend({
        className: "visualization visualization-map",
        defaults: {},
        events: {},

        initialize: function() {
            Visualization.__super__.initialize.apply(this, arguments);

            this.$map = $("<div>", {
                "class": "map"
            });
            this.$map.appendTo(this.$el);
        },

        prepareMap: function() {
            if (this.map) return;

            var colorOption = settings.attributes.color;
            var c = colors[colorOption];

            this.map = new Datamap({
                element: this.$map.get(0),
                scope: 'world',
                fills: {
                    defaultFill: c(3),
                    marker: c(1)
                },
                geographyConfig: {
                    borderWidth: 1,
                    borderColor: "#e0e4e8",
                    highlightOnHover: false,
                    popupOnHover: false
                }
            });
        },

        finish: function() {
            this.prepareMap();

            var latLngs = [];
            var tplMessage = this.model.getConf("message") || "<%- $.date(date) %>";

            this.map.bubbles(
                _.chain(this.data)
                .map(function(e) {
                    if (!e.properties.position || !e.properties.position.latitude || !e.properties.position.longitude) return null;

                    return {
                        name: template(tplMessage, e),
                        latitude: e.properties.position.latitude,
                        longitude: e.properties.position.longitude,
                        radius: 5,
                        fillKey: 'marker'
                    };
                })
                .compact()
                .value()
            );

            return Visualization.__super__.finish.apply(this, arguments);
        },

        remove: function() {
            this.map.remove();

            return Visualization.__super__.remove.apply(this, arguments);
        },

        pull: function() {
            return api.execute("get:events", {
                type: this.model.get("eventName"),
                has: ["position.longitude", "position.latitude"].join(",")
            });
        }
    });

    return {
        title: i18n.t("visualizations.map.title"),
        View: Visualization,
        config: {
            'message': {
                'type': "text",
                'label': i18n.t("visualizations.map.config.message.label"),
                'help': i18n.t("visualizations.map.config.message.help")
            }
        }
    };
});
