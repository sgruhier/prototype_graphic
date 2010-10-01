/*
Class: Graphic.LineTool
	Drawing tool.
	
	Register this tool to be able to draw lines with a mouse.
  
  Author:
  	Sébastien Gruhier, <http://www.xilinus.com>

  License:
  	MIT-style license.

  See Also:
    <Tool>, <EventNotifier>
*/
Graphic.LineTool = Class.create();
Object.extend(Graphic.LineTool.prototype, Graphic.Tool.prototype);
Object.extend(Graphic.LineTool.prototype, {
  initialize: function() {  
    this.renderer = null;
    this.line     = null;  
    this.stroke   =  {r: 127, g: 156, b: 215, a: 255, w: 3}          
  },
  
  activate: function(manager) {
    this.renderer = manager.renderer;
  },
  
  unactivate: function(manager) {
    this.renderer = null;
  }, 
  
  initDrag: function(x, y, event) {     
    this.line =  new Graphic.Line(this.renderer); 
    this.line.setStroke(this.stroke);
    this.line.setPoints(x, y, x, y); 
    
    this.renderer.add(this.line)
    this.renderer.draw();
  },
  
  drag: function(x, y, dx, dy, ddx, ddy, event) {    
    if (this.line) {    
      var pt = this.line.getPoint(0);       
      this.line.setPoints(pt.x, pt.y, x, y); 
      this.renderer.draw();
    }
  },
  
  endDrag: function(x, y, event) {
    if (this.line) {
      this.line = null;
    }
  },
  
  getStroke: function() {
    return this.stroke;
  },
  
  setStroke: function(stroke) {
    this.stroke = stroke;
  }
});
