/*
Class: Graphic.PolylineTool
	Drawing tool.
	
	Register this tool to be able to draw polylines/polygons with a mouse.
  
  Author:
  	Sébastien Gruhier, <http://www.xilinus.com>

  License:
  	MIT-style license.

  See Also:
    <Tool>, <EventNotifier>
*/
Graphic.PolylineTool = Class.create();
Object.extend(Graphic.PolylineTool.prototype, Graphic.Tool.prototype);
Object.extend(Graphic.PolylineTool.prototype, {
  initialize: function() {  
    this.renderer = null;
    this.polyline     = null;  
    this.stroke   =  {r: 127, g: 156, b: 215, a: 255, w: 3}          
    this.fill     =  {r: 200, g: 230, b: 255, a: 128} 
    this.usePolygon = false;
  },
  
  activate: function(manager) {
    this.renderer = manager.renderer;
  },
  
  unactivate: function(manager) {
    this.renderer = null;
  }, 
  
  setUsePolygon: function(on) {
    this.usePolygon = on;
  },
  
  initDrag: function(x, y, event) { 
    if (this.polyline == null) {
      this.polyline =  this.usePolygon ? new Graphic.Polygon(this.renderer) : new Graphic.Polyline(this.renderer);
      this.polyline.setStroke(this.stroke);  
      if (this.usePolygon)
        this.polyline.setFill(this.fill);
      this.polyline.addPoint(x, y); 
    
      this.renderer.add(this.polyline);
    }
    this.polyline.addPoint(x, y); 
    this.renderer.draw();              
    disableSelection();
  },
  
  drag: function(x, y, dx, dy, ddx, ddy, event) { 
    this.mouseMove(x, y, event);   
  },
  
  endDrag: function(x, y, event) { 
  },
  
  mouseMove: function(x, y, event) { 
    if (this.polyline) {
      this.polyline.setPoint(x, y, this.polyline.getNbPoints()-1);
      this.renderer.draw();
    }    
  },
  
  doubleClick: function(x, y, event) {
    this.polyline = null;
    enableSelection();
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
