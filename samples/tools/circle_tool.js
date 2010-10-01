/*
Class: Graphic.CircleTool
	Drawing tool.
	
	Register this tool to be able to draw circles with a mouse.
  
  Author:
  	Sébastien Gruhier, <http://www.xilinus.com>

  License:
  	MIT-style license.

  See Also:
    <Tool>, <EventNotifier>
*/
Graphic.CircleTool = Class.create();
Object.extend(Graphic.CircleTool.prototype, Graphic.Tool.prototype);
Object.extend(Graphic.CircleTool.prototype, {
  initialize: function() {  
    this.renderer = null;
    this.circle     = null;  
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
    this.circle =  new Graphic.Circle(this.renderer);       
    this.circle.setID(new Date().getTime())
    this.circle.setStroke(this.stroke);
    this.circle.setFill(this.fill);
    this.circle.setBounds(x, y, 1, 1); 
    this.x = x;
    this.y = y;
    this.renderer.add(this.circle)
    this.renderer.draw();
  },
  
  drag: function(x, y, dx, dy, ddx, ddy, event) {    
    if (this.circle) {    
      var d = Math.max(Math.abs(dx), Math.abs(dy)) 
      if (event.shiftKey) {
        this.circle.setCenter(this.x, this.y);
        this.circle.setRadius(d);
      }
      else
        this.circle.setBounds(dx < 0 ? this.x - d : this.x, dy < 0 ? this.y - d : this.y, d, d);
        
      this.renderer.draw();
    }
  },
  
  endDrag: function(x, y, event) {
    if (this.circle) {
      this.circle = null;
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
