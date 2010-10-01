/*
Class: Graphic.CanvasRenderer
	Canvas Renderer Class
	
	This class implements all Graphic.AbstractRender functions.
	
  See Also:
   <AbstractRender>

  Author:
 	Sébastien Gruhier, <http://www.xilinus.com>
*/


//
// Graphic.CanvasRenderer render class. 
//
Graphic.CanvasRenderer = Class.create();
Object.extend(Graphic.CanvasRenderer.prototype, Graphic.AbstractRender.prototype);

// Keep parent initialize
Graphic.CanvasRenderer.prototype._parentInitialize = Graphic.AbstractRender.prototype.initialize;
Graphic.CanvasRenderer.prototype._parentSetSize = Graphic.AbstractRender.prototype.setSize; 
 
Object.extend(Graphic.CanvasRenderer.prototype, {
  initialize: function(element) {
    this._parentInitialize(element);
   
    this.element = document.createElement("canvas");

    this.element.setAttribute("width", this.bounds.w);
    this.element.setAttribute("height", this.bounds.h);
    
    this.element.shape = this;
    $(element).appendChild(this.element);
    
    this.context = this.element.getContext("2d");
    // Node lists
    this.nodes = new Array();
    this.offset = Position.cumulativeOffset(this.element.parentNode);
  },

  destroy: function() {  
    this.nodes.clear();
    this.element.parentNode.removeChild(this.element);    
  },
    
  setSize: function(width, height) { 
    this._parentSetSize(width, height);
    this.element.setAttribute("width", this.bounds.w);
    this.element.setAttribute("height", this.bounds.h);      
    this.zoom(this.viewing.sx, this.viewing.sy)
  },

  add: function(shape, parent) {
    if (parent != null)
      console.log("CanvasRenderer:add inside another shape (parent != null) not yet implemented")    
   if (shape.element)
    this.nodes.push(shape);
  },
  
  shapes: function() {
    return this.nodes;
  },

  updateAttributes:function(shape, attributes) {
    // Nothing to do, canvas shapes use shape's attributes
  },
  
  updateTransform:function(shape) {
    // Nothing to do, canvas shapes use shape's transform
  },
  
  createShape: function(shape){
    var canvasShape = null;
    switch(shape.nodeName) {
      case "rect":
        canvasShape = new CanvasRect(shape);
        break;
      case "ellipse":
        canvasShape = new CanvasEllipse(shape);
        break;
      case "circle":
        canvasShape = new CanvasCircle(shape);
        break;
      case "polygon":
        canvasShape = new CanvasPolygon(shape, true);
        break;      
      case "polyline":
        canvasShape = new CanvasPolygon(shape, false);
        break;      
      case "line":
        canvasShape = new CanvasLine(shape);
        break;      
      case "image":
        canvasShape = new CanvasImage(shape);
        break;      
      default: 
        console.log("shape " + shape.nodeName + " not yet implemented for canvas renderer");
        break;
    }
    return canvasShape;
  },
  
  draw: function() {
    var context = this.context; 
    context.clearRect(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);    
    context.save();
    context.translate(-this.viewing.tx, -this.viewing.ty);        
    context.translate(this.viewing.cx, this.viewing.cy);
    context.scale(this.viewing.sx, this.viewing.sy);
    context.translate(-this.viewing.cx, -this.viewing.cy);
    
    this.nodes.each(function(n) {if (n.element) n.element.draw(this)}.bind(this))
    context.restore();
  },
         
  pick: function(event) {
    var pt = this.viewingMatrix.multiplyPoint(Event.pointerX(event) - this.offset[0], Event.pointerY(event) - this.offset[1]);
    var element = null;
    for (var i = this.nodes.length - 1; i >= 0; i--) { 
      if (this.nodes[i].element.pick(pt.x, pt.y)) 
        break;
    }
    return (i < 0 ? null : this.nodes[i]);
  },
  
  moveToFront: function(shape) {
    var node = this.nodes.find(function(s){if (s == shape) return true});  
    this.nodes = this.nodes.without(node);  
    this.nodes.push(node);
  },
  
  moveToBack: function(node) {
    var node = this.nodes.find(function(s){if (s == shape) return true});  
    this.nodes = this.nodes.without(node);  
    this.nodes.unshift(node);
  },

  _setViewing: function() {
    this.draw();
  },            
  
  // Specific canvas functions
  fill:function(attributes) { 
    if (attributes.fill && attributes.fill != "none") {
      this.context.fillStyle   = attributes.fill;
      this.context.globalAlpha = attributes["fill-opacity"];  
      this.context.fill();  
    }
  },

  stroke:function(attributes) {        
    this.context.strokeStyle = attributes.stroke;    
    this.context.lineWidth   = attributes["stroke-width"]
    this.context.globalAlpha = attributes["stroke-opacity"];
    this.context.stroke();
  },
  
  moveTo: function(matrix, x, y) {
    var p = matrix.multiplyPoint(x, y);
    this.context.moveTo(p.x, p.y);        
  },

  lineTo: function(matrix, x, y) {
    var p = matrix.multiplyPoint(x, y);
    this.context.lineTo(p.x, p.y);        
  },
  
  bezierCurveTo: function(matrix, cp1x, cp1y, cp2x, cp2y, x, y) {
    var cp1 = matrix.multiplyPoint(cp1x, cp1y);
    var cp2 = matrix.multiplyPoint(cp2x, cp2y);
    var p   = matrix.multiplyPoint(x, y);
    this.context.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p.x, p.y);        
  }
  
});

CanvasRect = Class.create();
CanvasRect.prototype =  {
  initialize: function(shape) {
    this.shape = shape;
  },
    
  draw: function(renderer) { 
    var context = renderer.context;
    var matrix = this.shape.getMatrix();
    context.save();
    
    with (this.shape) {  
      
      context.beginPath();                 

      renderer.moveTo(matrix, attributes.x, attributes.y);
      renderer.lineTo(matrix, attributes.x + attributes.width, attributes.y);
      renderer.lineTo(matrix, attributes.x + attributes.width, attributes.y + attributes.height);
      renderer.lineTo(matrix, attributes.x, attributes.y + attributes.height);

      context.closePath();      
      
      renderer.fill(attributes);
      renderer.stroke(attributes);
    }
    context.restore();
  },
  
  pick: function(x, y) {     
    var pt = this.shape.getInverseMatrix().multiplyPoint(x, y);
    var a = this.shape.attributes;
    return a.x <= pt.x && pt.x <= a.x + a.width && a.y <= pt.y && pt.y <= a.y + a.height;
  }
}

CanvasEllipse = Class.create();
CanvasEllipse.prototype =  {
  initialize: function(shape) {
    this.shape = shape;
  },
    
  draw: function(renderer) { 
    var context = renderer.context;
    var matrix = this.shape.getMatrix();
    context.save();
    
    with (this.shape) {  
      var KAPPA = 4 * ((Math.sqrt(2) -1) / 3);

      var rx = attributes.rx;
      var ry = attributes.ry;

      var cx = attributes.cx;
      var cy = attributes.cy;

      context.beginPath();        
      renderer.moveTo(matrix, cx, cy - ry);
      renderer.bezierCurveTo(matrix, cx + (KAPPA * rx), cy - ry,  cx + rx, cy - (KAPPA * ry), cx + rx, cy);
      renderer.bezierCurveTo(matrix, cx + rx, cy + (KAPPA * ry), cx + (KAPPA * rx), cy + ry, cx, cy + ry);
      renderer.bezierCurveTo(matrix, cx - (KAPPA * rx), cy + ry, cx - rx, cy + (KAPPA * ry), cx - rx, cy);
      renderer.bezierCurveTo(matrix, cx - rx, cy - (KAPPA * ry), cx - (KAPPA * rx), cy - ry, cx, cy - ry);
      context.closePath();

      renderer.fill(attributes);
      renderer.stroke(attributes);
    }
    context.restore();
  },
  pick: function(x, y) {     
    return false;
  }
}

CanvasCircle = Class.create();
CanvasCircle.prototype =  {
  initialize: function(shape) {
    this.shape = shape;
  },
    
  draw: function(renderer) { 
    var context = renderer.context;
    var matrix = this.shape.getMatrix();
    context.save();
    
    with (this.shape) {  
      context.beginPath();
      var c = matrix.multiplyPoint(attributes.cx, attributes.cy);
      context.arc(c.x, c.y, attributes.r, 0, Math.PI*2, 1)

      context.closePath();
      
      renderer.fill(attributes);
      renderer.stroke(attributes);
    }
    context.restore();
  },
  
  pick: function(x, y) {     
    return false;
  } 
}

CanvasPolygon = Class.create();
CanvasPolygon.prototype =  {
  initialize: function(shape, closed) {
    this.shape = shape;
    this.closed = closed;
  },
    
  draw: function(renderer) {  
    if (this.shape.getPoints().length == 0)
      return;
    var context = renderer.context;
    var matrix = this.shape.getMatrix();
    context.save();
    
    with (this.shape) {  
      context.beginPath();                 
      var first = getPoints()[0];

      renderer.moveTo(matrix, first[0], first[1]);    
      
      getPoints().each(function(point) {
        renderer.lineTo(matrix, point[0], point[1]);
      });
      
      if (this.closed)
        context.closePath();
      
      renderer.fill(attributes);
      renderer.stroke(attributes);
    }
    context.restore();
  },
  
  pick: function(x, y) {     
    return false;
  } 
}

CanvasLine = Class.create();
CanvasLine.prototype =  {
  initialize: function(shape) {
    this.shape = shape;
  },
    
  draw: function(renderer) {  
    var context = renderer.context;
    var matrix = this.shape.getMatrix();
    context.save();
    
    with (this.shape) {  
      context.beginPath();                 
      
      renderer.moveTo(matrix, attributes.x1, attributes.y1);    
      renderer.lineTo(matrix, attributes.x2, attributes.y2);    

      renderer.stroke(attributes);
    }
    context.restore();
  },
  
  pick: function(x, y) {     
    return false;
  } 
}                    

CanvasImage = Class.create();
CanvasImage.prototype =  {
  initialize: function(shape) {
    this.shape = shape;  
    this.loaded = false;
  },
    
  draw: function(renderer) {  
    var context = renderer.context;
    var matrix = this.shape.getMatrix();
    context.save();
    
    with (this.shape) {                                                        
      if (image) {           
        var p = matrix.multiplyPoint(attributes.x, attributes.y);
        if (!this.loaded)                                                    
          Event.observe(image, "load",function() {               
            context.drawImage(image, p.x, p.y); 
            this.loaded = true;
          }.bind(this));
        else
        context.drawImage(image, p.x, p.y); 
      }
    }
    context.restore();
  },
  
  pick: function(x, y) {     
    return false;
  } 
}/*
Class: Graphic.SVGRenderer
	SVG Renderer Class
	
	This class implements all Graphic.AbstractRender functions.
	
  See Also:
   <AbstractRender>

   Author:
   	Sébastien Gruhier, <http://www.xilinus.com>
*/

//
// Graphic.SVGRenderer render class. 
//
Graphic.SVGRenderer = Class.create();

//
// Graphic.SVGRenderer "static" data and functions
//
Object.extend(Graphic.SVGRenderer, {
  xmlns: {
    svg:   "http://www.w3.org/2000/svg",
    xlink: "http://www.w3.org/1999/xlink"
  },
  
  createNode:  function(nodeName) {
    return document.createElementNS(Graphic.SVGRenderer.xmlns.svg, nodeName);;
  }
})

Object.extend(Graphic.SVGRenderer.prototype, Graphic.AbstractRender.prototype);
// Keep parent initialize
Graphic.SVGRenderer.prototype._parentInitialize = Graphic.AbstractRender.prototype.initialize; 
Graphic.SVGRenderer.prototype._parentSetSize = Graphic.AbstractRender.prototype.setSize; 

Object.extend(Graphic.SVGRenderer.prototype, {
  initialize: function(element) {
    this._parentInitialize(element);
    this.element = Graphic.SVGRenderer.createNode("svg");  
    
    this.element.setAttribute("width", this.bounds.w);
    this.element.setAttribute("height", this.bounds.h);      
    this.element.setAttribute("preserveAspectRatio", "none");      
    
    this._setViewing();
    
    this.element.shape = this;     
    $(element).appendChild(this.element);
  },
  
  destroy: function() {  
    $A(this.element.childNodes).each(function(node) {
      if (node.shape) {
        node.shape.destroy();
      } else {
        node.parentNode.removeChild(node);
      }
    })
    this.element.parentNode.removeChild(this.element);
  },
  
  setSize: function(width, height) { 
    this._parentSetSize(width, height);
    this.element.setAttribute("width", this.bounds.w);
    this.element.setAttribute("height", this.bounds.h);      
    this.zoom(this.viewing.sx, this.viewing.sy)
  },
  
  createShape: function(shape){
    return Graphic.SVGRenderer.createNode(shape.nodeName);
  },
  
  add: function(shape) {      
    if (shape.parent)
      shape.parent.getRendererObject().appendChild(shape.getRendererObject());
    else
      this.element.appendChild(shape.getRendererObject());
  },

  remove:function(shape) {
    if (shape.parent) 
      shape.parent.getRendererObject().removeChild(shape.getRendererObject());
    else
      this.element.removeChild(shape.getRendererObject());
  },
  
  get: function(id) {
    var element = $(id)
    return element && element.shape ? element.shape : null;
  },
  
  shapes: function() {
    return $A(this.element.childNodes).collect(function(element) {return element.shape});
  },
  
  clear: function() {
    $A(this.element.childNodes).each(function(element)  {
      element.shape.destroy();
    })
  },
  
  updateAttributes:function(shape, attributes) {   
    $H(attributes).keys().each(function(key) {
      if (key == "href")
        shape.element.setAttributeNS(Graphic.SVGRenderer.xmlns.xlink, "href", attributes[key]); 
      else  
        shape.element.setAttribute(key, attributes[key])
    });
  },
  
  updateTransform:function(shape) {  
    if (shape.nodeName != "g")
      shape.element.setAttribute("transform", "matrix(" + shape.getMatrix().values().join(",") +  ")");
  },
  
  nbShapes: function() {
    return this.element.childNodes.length;
  },
  
  moveToFront: function(node) {
    if (this.nbShapes() > 0) {
      this.element.appendChild(node.element);
    }
  },
  
  moveToBack: function(node) {
    if (this.nbShapes() > 0) {
      this.element.insertBefore(node.element, this.element.firstChild);  
    }
  },
  
  show:function(shape) {
    shape.element.style.display = "block";
  },
  
  hide:function(shape) {
    shape.element.style.display = "none";    
  },
  
  draw: function() {
    // Nothing to do in SVG
  },
  
  pick: function(event) {
    var element = Event.element(event); 
    return element == this.element ? null : element.shape;
  },
  
  position: function() {
    if (this.offset == null)
      this.offset = Position.cumulativeOffset(this.element.parentNode);
    return this.offset;
  },
    
  addComment: function(shape, text) {
  	shape.element.appendChild(document.createComment(text));
  },                   
  
  addText: function(shape, text) {
  	shape.element.appendChild(document.createTextNode(text));
  },                   
  
  _setViewing: function() {                
    var bounds = this.viewingMatrix.multiplyBounds(this.bounds);
    this.element.setAttribute("viewBox", bounds.x + " " + bounds.y + " "  +  bounds.w + " " + bounds.h);   
  }
});

/*
Class: Graphic.VMLRenderer
        VML Renderer Class

        This class implements all Graphic.AbstractRender functions.

  See Also:
   <AbstractRender>

  Author:
        Sébastien Gruhier, <http://www.xilinus.com>
*/

//
// Graphic.VMLRenderer render class. 
//
Graphic.VMLRenderer = Class.create();

//
// Graphic.VMLRenderer "static" data and functions
//
Object.extend(Graphic.VMLRenderer, {
  init: false,
  
  createNode:  function(nodeName) {
    return document.createElement(nodeName);;
  },
  
  initBrowser: function () {  
    if (!Graphic.VMLRenderer.init && document.readyState == "complete") {                        
      // create xmlns
      if (!document.namespaces["v"]) {
        document.namespaces.add("v", "urn:schemas-microsoft-com:vml");
      }

      // setup default css
      var ss = document.createStyleSheet();
      ss.cssText = "v\\:* {behavior:url(#default#VML);}";
      Graphic.VMLRenderer.init = true;
    }
  }
})

Object.extend(Graphic.VMLRenderer.prototype, Graphic.AbstractRender.prototype);
Graphic.VMLRenderer.prototype._parentInitialize = Graphic.AbstractRender.prototype.initialize; 
Graphic.VMLRenderer.prototype._parentSetSize = Graphic.AbstractRender.prototype.setSize; 

Object.extend(Graphic.VMLRenderer.prototype, {
  initialize: function(element) {
    Graphic.VMLRenderer.initBrowser();
    
    this._parentInitialize(element);
    
    this.element = Graphic.VMLRenderer.createNode("v:group");
    this.element.style.height = this.bounds.h + "px";   
    this.element.style.width  = this.bounds.w + "px";    

    this._setViewing();

    this.element.graphicNode = this;
    $(element).appendChild(this.element);   
  },
  
  destroy: function() {  
    $A(this.element.childNodes).each(function(node) {
      if (node.shape) {
        node.shape.destroy();
      } else {
        node.parentNode.removeChild(node);
      }
    })
    this.element.parentNode.removeChild(this.element);
  },
  
  setSize: function(width, height) { 
    this._parentSetSize(width, height);
    this.element.style.height = this.bounds.h + "px";   
    this.element.style.width  = this.bounds.w + "px";    
    this.zoom(this.viewing.sx, this.viewing.sy)
  },

  createShape: function(shape){    
    var node = null;           
    switch (shape.nodeName) {
      case "rect":
        node = Graphic.VMLRenderer.createNode("v:roundrect"); 
        node.arcsize = 0;
        break;        
      case "ellipse":
      case "circle":
        node = Graphic.VMLRenderer.createNode("v:oval");
        break;        
      case "polygon":
      case "polyline":
        node = Graphic.VMLRenderer.createNode("v:shape");   
        node.style.height = this.bounds.h + "px";   
        node.style.width  = this.bounds.w + "px";    
        node.coordsize = this.bounds.w + ", " + this.bounds.h;
        node.coordorigin = "0, 0";        
        break; 
      case "line":
        node = Graphic.VMLRenderer.createNode("v:line");   
        break; 
      // case "text":
      //   node = Graphic.VMLRenderer.createNode("v:text");   
      //   break; 
      // case "image":
      //        node = document.createElement("div");
      //  node.style.position = "relative";
      //   node.style.width = "300px";
      //   node.style.height = "100px";
      //  node.style.filter = "progid:DXImageTransform.Microsoft.Matrix(M11=1, M12=0, M21=0, M22=1, Dx=100, Dy=0)";
      //  var img = document.createElement("img");
      //  node.appendChild(img);
      //   break; 
      // case "image":
      //        node = document.createElement("div");
      //  node.style.position = "relative";
      //   node.style.width = "300px";
      //   node.style.height = "100px";
      //  node.style.filter = "progid:DXImageTransform.Microsoft.Matrix(M11=1, M12=0, M21=0, M22=1, Dx=100, Dy=0)";
      //  var img = document.createElement("img");
      //  node.appendChild(img);
      //   break; 
      case "g":
        node = Graphic.VMLRenderer.createNode("v:group");  
        node.stroked = "false";
        node.filled = "false";
        node.style.height = this.bounds.w + "px";   
        node.style.width = this.bounds.h + "px";    
        node.coordsize = this.bounds.w + ", " + this.bounds.h;
        node.coordorigin = "0, 0";        
        break;  
      default:
        // console.log("shape " + shape.nodeName + " not yet implemented for VML renderer");
        break;
    }
    if (!node)
      return null;
    if (shape.nodeName != "g" && shape.nodeName != "image") {
      // Create a fill node
      var fill =  Graphic.VMLRenderer.createNode("v:fill"); 
      fill.on = "false";
      node.appendChild(fill);
      node.fill = fill;
    
      // Create a stroke node
      var stroke =  Graphic.VMLRenderer.createNode("v:stroke"); 
      stroke.on = "false";
      node.appendChild(stroke);
      node.stroke = stroke;  

      // Create a skew node
      var skew =  Graphic.VMLRenderer.createNode("v:skew"); 
      skew.on = "true";
      node.appendChild(skew);
      node.skew = skew;  
    }
    
    return node;
  },
  
  add: function(shape) {
    if (shape.parent) {    
      shape.parent.getRendererObject().appendChild(shape.getRendererObject());
      // Why IE lost node attributes!!!
      this.updateAttributes(shape, shape.attributes);
    }
    else {
      if (shape && shape.getRendererObject())
        this.element.appendChild(shape.getRendererObject());
    }
  },
  
  remove:function(shape) {
    if (shape.parent) 
      shape.parent.getRendererObject().removeChild(shape.getRendererObject());
    else
      this.element.removeChild(shape.getRendererObject());
  },

  get: function(id) {
    var element = $(id)
    return element && element.shape ? element.shape : null;
  },
  
  shapes: function() {
    return $A(this.element.childNodes).collect(function(element) {return element.shape});
  },
  
  clear: function() {
    $A(this.element.childNodes).each(function(element)  {
      element.shape.destroy();
    })
  },

  updateAttributes:function(shape, attributes) {
    var element = shape.element;
    if (!element)
      return;
      
    $H(attributes).keys().each(function(key) {     
      //console.log(element.nodeName + " " + key +  " "+ attributes[key])
      switch (key) {
        case "width":
        case "height":
          element.style[key] = attributes[key] + "px";
          break; 
        case "cx":
        case "cy":
        case "rx":
        case "ry": 
        case "r": 
          if (element.nodeName != "roundrect") {
            var rx =  typeof shape.attributes.rx != "undefined" ? shape.attributes.rx : shape.attributes.r;
            var ry =  typeof shape.attributes.ry != "undefined" ? shape.attributes.ry : shape.attributes.r;
            element.style.left   = (shape.attributes.cx - rx).toFixed(); 
            element.style.top    = (shape.attributes.cy - ry).toFixed();
            element.style.width  = (rx * 2).toFixed();
            element.style.height = (ry * 2).toFixed();
          }
          break; 
        case "x":
          element.style["left"] = attributes[key] + "px"; 
          break;
        case "y":
          element.style["top"] = attributes[key] + "px";
          break;
        case "fill":
          if (element.fill) {
            element.fill.color = attributes[key].parseColor();
            element.fill.on = "true";
          }
          break;  
        case "fill-opacity":
          if (element.fill) {
            if (attributes[key] == "none") {
              element.fill.on = "false";            
            }
            else {                         
              element.fill.opacity = attributes[key]; 
              element.fill.on = "true";
            }
          }
          break;
        case "stroke":
          if (element.stroke) {
            if (attributes[key] == "none") {
              element.stroke.on = "false";            
            }
            else {
              element.stroke.color = attributes[key].parseColor();
              element.stroke.on = "true";
            }
          }
          break;  
        case "stroke-opacity":
          if (element.stroke) {
            element.stroke.opacity = attributes[key]; 
            element.stroke.on = "true";
          }
          break;
        case "stroke-width":
          if (element.stroke) {
            element.stroke.weight = attributes[key] + "px"; 
            element.stroke.on = "true";
          }
          break; 
        case "points":  
          var p =  shape.getPoints();  
          var attr = [];
          if (p.length > 0) {
            attr.push("m");
            attr.push(p[0][0].toFixed());
            attr.push(p[0][1].toFixed());
            if (p.length > 1) {
              attr.push("l");
              for (var i = 1; i < p.length; ++i) {
                attr.push(p[i][0].toFixed());
                attr.push(p[i][1].toFixed());
              }
            }
          }            
          if (shape.getType() == "polygon") 
            attr.push("x");      
          else                     
            attr.push("e");      
          element.path = attr.join(" ");     
          break;        
        case "x1": //x2, y1, y2   
          element.from = shape.attributes.x1.toFixed() + " " + shape.attributes.y1.toFixed();
          element.to   = shape.attributes.x2.toFixed() + " " + shape.attributes.y2.toFixed();
          break
        case "id":
          element.id = attributes[key]
          break;
        case "class":
          // Nothing to do  
          element.id = attributes[key]
          break;
        case "href":
          element.firstChild.src = attributes[key]
          break;
        default:
          //console.log("updateAttributes: key " + key + "/" +  attributes[key] + " not supported")
          break;
      }
    });           
  },
  
  updateTransform:function(shape) {
    if (!shape.element)     
      return;
    var matrix = shape.getMatrix(); 
    if (shape instanceof Graphic.Group && shape.children) {
       shape.children.each(function(s) {
         var m = s.getMatrix()
         this._updateSkew(s, Matrix.multiply(matrix, m))
       }.bind(this))
    }
    else if (shape instanceof Graphic.Image) {    	
      //       if (shape.element.filters.length >0)
      //       with (shape.element.filters["DXImageTransform.Microsoft.Matrix"]) {
      //  M11 = matrix.xx;
      //  M12 = matrix.xy;
      //  M21 = matrix.yx;
      //  M22 = matrix.yy;
      //  Dx = matrix.dx;
      //  Dy = matrix.dy;
      // }    	
    }
    else {
      this._updateSkew(shape, matrix);
    }
  },
  
  _updateSkew:function(shape, matrix) { 
    if (!shape.element.skew)
      return;
      
    var bounds = shape.getBounds();
    shape.element.skew.on = "false";
    shape.element.skew.matrix = matrix.xx.toFixed(8) + " " + matrix.xy.toFixed(8) + " " + matrix.yx.toFixed(8) + " " + matrix.yy.toFixed(8) + " 0 0";  
    // TODO: Fix it with renderer viewing
    //var pt = Matrix.invert(this.viewingMatrix).multiplyPoint(matrix.dx, matrix.dy)
    pt = {x:matrix.dx, y:matrix.dy}
    shape.element.skew.offset = Math.floor(pt.x).toFixed() + "px " + Math.floor(pt.y).toFixed() + "px";         
    shape.element.skew.origin =  ((bounds.w != 0 ? -bounds.x / bounds.w : 1) - 0.5).toFixed(8) + " " + ((bounds.h != 0 ? -bounds.y / bounds.h : 1) - 0.5).toFixed(8);  
    shape.element.skew.on = "true";    
  },
  
  nbShapes: function() {
    return this.element.childNodes.length;
  },
  
  moveToFront: function(node) {
    if (this.nbShapes() > 0) {
      //this.element.removeChild(node.element);
      this.element.appendChild(node.element);
    }
  },
  
  moveToBack: function(node) {
    if (this.nbShapes() > 0) {
      this.element.insertBefore(node.element, this.element.firstChild);  
    }
  },

  show:function(shape) {
    shape.element.style.display = "block";
  },
  
  hide:function(shape) {
    shape.element.style.display = "none";    
  },
  
  draw: function() {
    // Nothing to do in VML
  },
  
  pick: function(event) {
    var element = Event.element(event); 
    return element == this.element.parent ? null : element.shape;
  },
  
  position: function() {
    if (this.offset == null)
      this.offset = Position.cumulativeOffset(this.element.parentNode);
    return this.offset;
  },
  
  addComment: function(shape, text) {
  	shape.element.appendChild(document.createComment(text));
  },                   
  
  addText: function(shape, text) {
//  	shape.element.appendChild(document.createTextNode(text));
  },                   

  _setViewing: function() {  
    var bounds = this.viewingMatrix.multiplyBounds(this.bounds);
    this.element.coordsize   = bounds.w + ", " + bounds.h;
    this.element.coordorigin = bounds.x + ", " + bounds.y;
  }
});