/*
Class: Graphic.RectangleTool
	Drawing tool.
	
	Register this tool to be able to draw rectangles with a mouse.
  
  Author:
  	Sébastien Gruhier, <http://www.xilinus.com>

  License:
  	MIT-style license.

  See Also:
    <Tool>, <EventNotifier>
*/
Graphic.RectangleTool = Class.create();
Object.extend(Graphic.RectangleTool.prototype, Graphic.Tool.prototype);
Object.extend(Graphic.RectangleTool.prototype, {
  initialize: function() {  
    this.renderer = null;
    this.rect     = null;  
    this.stroke   =  {r: 127, g: 156, b: 215, a: 255, w: 3}          
    this.fill     =  {r: 200, g: 230, b: 255, a: 128}          
  },
  
  activate: function(manager) {
    this.renderer = manager.renderer;
  },
  
  unactivate: function(manager) {
    this.renderer = null;
  }, 
  
  initDrag: function(x, y, event) { 
    this.rect =  new Graphic.Rectangle(this.renderer); 
    this.rect.setStroke(this.stroke);
    this.rect.setFill(this.fill);
    this.rect.setBounds(x, y, 1, 1); 
    this.x = x;
    this.y = y;
    this.renderer.add(this.rect)
    this.renderer.draw();
  },
  
  drag: function(x, y, dx, dy, ddx, ddy, event) {    
    if (this.rect) {                             
      var d = Math.max(Math.abs(dx), Math.abs(dy))
      if (event.shiftKey) {
        dx = dx < 0 ? -d : d;
        dy = dy < 0 ? -d : d;
      }
      this.rect.setBounds(dx < 0 ? this.x + dx : this.x, dy < 0 ? this.y + dy : this.y, Math.abs(dx), Math.abs(dy));
      this.renderer.draw();
    }
  },
  
  endDrag: function(x, y, event) {
    if (this.rect) {
      this.rect = null;
    }
  },
  
  getStroke: function() {
    return this.stroke;
  },
  
  setStroke: function(stroke) {
    this.stroke = stroke;
  },

  getFill: function() {
    return this.fill;
  },
  
  setFill: function(fill) {
    this.fill = fill;
  }
});
