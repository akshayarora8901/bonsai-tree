////////////////////////////////////////////////////
// Bonsai Tree (Custom Tree Component)
// Copyright (c) 2017 trendspurt.com // Trendspurt GmbH, Cologne Germany
////////////////////////////////////////////////////

(function(window) {
  var BonsaiTree = window.BonsaiTree = function(data, ul$) {
    this.data = data;
    this.ul$ = ul$;
    this.plugins = [];
  };

  BonsaiTree.pluginHooks = {
    ELEMENT_DRAGSTART: 'element_dragstart',
    ELEMENT_DRAG: 'element_drag',
    ELEMENT_DRAGEND: 'element_dragend',
    ELEMENT_DRAGOVER: 'element_dragover',
    ELEMENT_DROP: 'element_drop'
  };

  BonsaiTree.prototype.registerPlugin = function(plugin) {
    this.plugins.push(plugin);
  }

  BonsaiTree.prototype.execPlugin = function(type, data) {
    this.plugins.forEach(function(plugin) {
      if(typeof plugin[type] === 'function')
        plugin[type](data);
    });  
  }

  BonsaiTree.prototype.render = function() {
    this.destroy(this.ul$);
    this.loopLayers(this.data, this.ul$);
    this.logic(this.ul$);
    $("ul ul", this.ul$).show();
  }
  BonsaiTree.prototype.loopLayers = function(data, ul$) {
    // console.log(' BONSAI: loopLayers()', data);
    var that = this;
    if (typeof(data) === 'object' && !Array.isArray(data)) {
      var children = data.children ? data.children : [];
      // Render subnode
      let subnode$ = this.nodeTemplate(data);
      // Handle children
      if (children && children.length) {
        // ChildNodes jquery elements
        var ulChild$ = $("<ul/>");
        for (var childNode = 0; childNode < children.length; childNode++) {
          var childNodeOfChildren = children[childNode];
          // Traverse ChildNodes if present
          if (typeof(childNodeOfChildren) === 'object' && !Array.isArray(childNodeOfChildren)) {
            ulChild$.append(this.loopLayers(childNodeOfChildren, ulChild$));
          }
        }
        // Append children ul to subnode
        subnode$.append(ulChild$);
      }
      // Append subnode to current ul
      ul$.append(subnode$);
    } else if(Array.isArray(data)) {
      data.forEach(function(element, elementKey) {
        that.loopLayers(element, ul$);
      });
    }
  }
  /**
   * nodeTemplate
   * Template function for rendering a single node (li element)
   * @param  {Object} data Data to renderTree
   * @return {jQueryElement} jQuery element for the node (See comment for template)
   */
  BonsaiTree.prototype.nodeTemplate = function(data) {
    let tpl = `
      <li cbri-id="layer">
        ${data.tag}
        <button cbri-id="demoButton">Demo</button>
      </li>
    `;
    return $(tpl).data('data', data);
  };
  /**
   * logic
   * Implementation for tree logic
   * See commented lines for demo
   */
  BonsaiTree.prototype.logic = function() {
    // // Setup event handlers
    // ul$.on('click', (evt)=>{
    //   let target$ = $(evt.target),
    //       cbriId = target$.first().attr('cbri-id'),
    //       data = target$.is('li') ? target$.data('data') : target$.closest('li').data('data');
    //
    //   // Delegate click
    //   switch(cbriId) {
    //     case 'layer':
    //       L.debug('layer was clicked', data);
    //       break;
    //     case 'scriptButton':
    //       L.debug('scriptButton was clicked', data);
    //       break;
    //     case 'mqButton':
    //       L.debug('mqButton was clicked');
    //       break;
    //     default:
    //   }
    // });
  };
  /**
   * destroy
   * Method to destroy the tree elements and free up all events listeners for garbage collection
   * See commented lines for demo
   */
  BonsaiTree.prototype.destroy = function() {
    // if (ul$ && ul$.length) {
    //   ul$.find("*").off();
    //   ul$.empty();
    // }
  };
})(window);
