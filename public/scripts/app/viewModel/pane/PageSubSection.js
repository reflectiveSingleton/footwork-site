define([ "jquery", "lodash", "footwork", "jquery.pulse" ],
  function( $, _, fw ) {
    var globalNamespace = fw.namespace();

    var paneCollapsed = fw.observable().receiveFrom('Configuration', 'paneCollapsed');
    var viewPortLayoutMode = fw.observable().receiveFrom('ViewPort', 'layoutMode');
    var paneIsOverlapping = fw.observable().receiveFrom('Layout', 'overlapPane');
    var chosenSection = fw.observable().receiveFrom('PageSections', 'chosenSection');

    return fw.viewModel({
      namespace: 'PageSubSection',
      initialize: function(params) {
        var subSectionData = params.sectionData;
        var parent = this.parent = params.parent;
        var $anchorContainer = $('[name=' + subSectionData.anchor + ']');
        var $anchor = $('#' + (_.isObject(subSectionData) ? subSectionData.anchor : ''));

        var pageBaseURL = '';
        var resetURL = function() {
          if( !this.$globalNamespace.request('isRunningLocally') ) {
            pageBaseURL = window.location.pathname;
          }
          this.anchorAddress(pageBaseURL + '#' + (subSectionData.anchor || ''));
        }.bind(this);

        while(!_.isFunction(parent.isCollapsed) && !_.isUndefined(parent.parent)) {
          parent = parent.parent;
        }

        this.$namespace.event.handler('resetURL', resetURL);
        this.anchorAddress = fw.observable();
        resetURL();

        this.currentSection = fw.observable().receiveFrom('PageSections', 'currentSection');
        this.title = subSectionData.title;
        this.active = fw.computed(function() {
          var isActive = this.currentSection() === subSectionData.anchor;
          if(isActive) {
            parent.isCollapsed(false);
          }
          return isActive;
        }, this);

        this.hasSubSections = _.isArray(subSectionData.subSections) && subSectionData.subSections.length;
        this.subSections = subSectionData.subSections;

        this.chooseSection = function() {
          if(viewPortLayoutMode() === 'mobile' || paneIsOverlapping()) {
            if(!paneCollapsed()) {
              paneCollapsed(true);
            }
          }

          chosenSection( '' );
          chosenSection( subSectionData.anchor );
          $anchorContainer.pulse({ className: 'active', duration: 1000 });
          return true;
        }.bind(this);

        this.$namespace.request.handler('position', function() {
          var offset = $anchor.offset() || { top: 99999999999 };
          return { anchor: subSectionData.anchor, position: offset.top };
        }.bind(this));
      }
    });
  }
);
