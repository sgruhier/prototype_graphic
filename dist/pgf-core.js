// Emulate console.log for browser that does not have a console object (IE for example!)
function debug(msg) {
	var debugArea = $('debug-area')
	if(debugArea == null) {
		debugArea = document.createElement("div");
		debugArea.id = "debug-area";
		debugArea.style.top = "0px"
		debugArea.style.right = "0px"
		debugArea.style.width = "200px"
		debugArea.style.height = "800px"
		debugArea.style.position = "absolute"
		debugArea.style.border = "1px solid #000"
		debugArea.style.overflow = "auto"
		debugArea.style.background = "#FFF"
		debugArea.style.zIndex= 100000;
		document.body.appendChild(debugArea);
	}
	debugArea.innerHTML = msg + "<br/>" + debugArea.innerHTML;  
}

if (typeof console == "undefined") {
  console = function() {  
    return {
      log: function(msg) {
        debug(msg);
      }
    }
 }();
}


// Get WebKit version
if (Prototype.Browser.WebKit) {
  var array = navigator.userAgent.match(new RegExp(/AppleWebKit\/([\d\.\+]*)/));
  Prototype.Browser.WebKitVersion = parseFloat(array[1]);
}

// Convert degree to radian    
function degToRad(value) {
  return value / 180 * Math.PI;     
}       

function radToDeg(value) {
  return value / Math.PI * 180;
}       
                        

function computeAngle(x1, y1, x2, y2, radian) {
  var dx = x2 - x1;
  var dy = y1 - y2;   
  if (radian)
    var angle = dx != 0 ? Math.atan(dy / dx) : -Math.PI/2; 
  else
    var angle = dx != 0 ? radToDeg(Math.atan(dy / dx)) : 90;

  if (dx < 0 && dy < 0)
    angle = angle - (radian ? Math.PI : 180);
  if (dx < 0 && dy > 0)
    angle = (radian ? Math.PI : 180) + angle;

  return angle
}

// Disable browser selection
function disableSelection() {
  document.body.ondrag = function () { return false; };
  document.body.onselectstart = function () { return false; };
}                                                             

// Enable browser selection
function enableSelection() {
  document.body.ondrag = null;
  document.body.onselectstart = null;  
}
      
// From effect.js
String.prototype.parseColor = function() {  
  var color = '#';
  if(this.slice(0,4) == 'rgb(') {  
    var cols = this.slice(4,this.length-1).split(',');  
    var i=0; do { color += parseInt(cols[i]).toColorPart() } while (++i<3);  
  } else {  
    if(this.slice(0,1) == '#') {  
      if(this.length==4) for(var i=1;i<4;i++) color += (this.charAt(i) + this.charAt(i)).toLowerCase();  
      if(this.length==7) color = this.toLowerCase();  
    }  
  }  
  return(color.length==7 ? color : (arguments[0] || this));  
}        

// From dragdrop.js
function getWindowScroll(w) {
  var T, L, W, H;
  with (w.document) {
    if (w.document.documentElement && documentElement.scrollTop) {
      T = documentElement.scrollTop;
      L = documentElement.scrollLeft;
    } else if (w.document.body) {
      T = body.scrollTop;
      L = body.scrollLeft;
    }
    if (w.innerWidth) {
      W = w.innerWidth;
      H = w.innerHeight;
    } else if (w.document.documentElement && documentElement.clientWidth) {
      W = documentElement.clientWidth;
      H = documentElement.clientHeight;
    } else {
      W = body.offsetWidth;
      H = body.offsetHeight
    }
  }
  return { top: T, left: L, width: W, height: H };
}


function pickPoly(points, x, y) {
  var nbPt = points.length;
  var c = false;
  for (var i = 0, j = nbPt - 1; i < nbPt; j = i++) {
      if ((((points[i].y <= y) && (y < points[j].y)) ||
           ((points[j].y <= y) && (y < points[i].y))) &&
          (x < (points[j].x - points[i].x) * (y - points[i].y) / (points[j].y - points[i].y) + points[i].x))   {
        c = !c;
        console.log(i, c)
      }
  }                                                                                                             
  
  return c;
}      


  // C pick function
  // int pnpoly(int npol, float *xp, float *yp, float x, float y)
  // {
  //   int i, j, c = 0;
  //   for (i = 0, j = npol-1; i < npol; j = i++) {
  //     if ((((yp[i] <= y) && (y < yp[j])) ||
  //          ((yp[j] <= y) && (y < yp[i]))) &&
  //         (x < (xp[j] - xp[i]) * (y - yp[i]) / (yp[j] - yp[i]) + xp[i]))
  //       c = !c;
  //   }
  //   return c;
  // }


/*
Class: Graphic
	Used for namespace and for generic function about rendering and browser
	
  Author:
  	Sébastien Gruhier, <http://www.xilinus.com>

  License:
  	MIT-style license.
*/
Graphic = Class.create();

// Group: Class Methods       
Object.extend(Graphic, {
  functionMustBeOverriden: {
    name: 'functionMustBeOverriden',
    message: 'This function is an abstract function and must be overriden'
  },
  
  /* 
     Function:  rendererSupported
       Checks if a renderer is supported by the browser and by the framework

     Parameters:
       name - renderer name (VML, SVG or Canvas)
       
     Returns:
       true/false
  */
  rendererSupported: function(name) {  
    switch(name) {
      case "VML":
        return Prototype.Browser.IE;
      case "SVG":
        return ! (Prototype.Browser.IE || Prototype.Browser.WebKitVersion < 420);   
        // THIS DOES NOT WORK!!
        // $A(navigator.mimeTypes).each(function(m){console.log(m.type)})
        // if (navigator.mimeTypes != null && navigator.mimeTypes.length > 0)
        //   return navigator.mimeTypes["image/svg+xml"];
        // return false;
      case "Canvas":
        try {
          return document.createElement("canvas").getContext("2d") != null;
        }
        catch(e) {
          return false;
        }
      default:     
        throw "Renderer " + name + " not supported"
        return null;
    }
  }
});             
/*
Class: Matrix
	2D Matrix operation used for geometric transform of any shape.
	
  Author:
  	Sébastien Gruhier, <http://www.xilinus.com>

  License:
  	MIT-style license.
*/
Matrix = Class.create();  

// Group: Class Methods
Object.extend(Matrix, {
  /*
    Function: multiply
      Multiply 2 matrix
      
    Parameters:
      left -  Left matrix
      right -  Right matrix
      
    Returns:
      A new matrix result of left multiply by right
  */
  multiply: function(left, right) { 
    var matrices;
    if (left instanceof Array) 
      matrices = left;    
      else 
    matrices = [left, right];
		var matrix = matrices[0];
		for(var i = 1; i < matrices.length; ++i){
			var left = matrix;
			var right = matrices[i];
			matrix = new Matrix();
  		matrix.xx = left.xx * right.xx + left.xy * right.yx;
  		matrix.xy = left.xx * right.xy + left.xy * right.yy;
  		matrix.yx = left.yx * right.xx + left.yy * right.yx;
  		matrix.yy = left.yx * right.xy + left.yy * right.yy;
  		matrix.dx = left.xx * right.dx + left.xy * right.dy + left.dx;
  		matrix.dy = left.yx * right.dx + left.yy * right.dy + left.dy;
		}
    
    return matrix;
  },                
  
  /*
    Function: translate
      Create a translation matrix
      
    Parameters:
      x -  X translation value
      y -  Y translation value
      
    Returns:
      A new matrix 
  */
  translate: function(x, y) {
    return new Matrix({dx: x, dy: y});
  },

  /*
    Function: rotate
      Create a rotate matrix
      
    Parameters:
      a -  angle in degree
      
    Returns:
      A new matrix 
  */
  rotate: function(angle) {
    var c = Math.cos(degToRad(angle));
  	var s = Math.sin(degToRad(angle));
    return new Matrix({xx:c, xy:s, yx:-s, yy:c});    
  },

  /*
    Function: scale
      Create a scale matrix
      
    Parameters:
      sx -  x scale factor
      sy -  y scale factor (default sy = sx)
      
    Returns:
      A new matrix 
  */
  scale: function(sx, sy) {
    sy = sy || sx;
    return new Matrix({xx:sx, yy:sy});    
  },
     
  
  skewX:function (angle) {
  	return new Matrix({xy:Math.tan(degToRad(angle))});
	},
	
  skewY:function (angle) {
  	return new Matrix({yx:Math.tan(-degToRad(angle))});
	},
	
  /*
    Function: rotateAt
      Create a rotate matrix at a specific rotation center
      
    Parameters:
      a -  angle in degree
      x - X coordinate of rotation center
      y - Y coordinate of rotation center
    Returns:
      A new matrix 
  */
  rotateAt: function(angle, x, y) {
    return Matrix.multiply([Matrix.translate(x, y), Matrix.rotate(angle), Matrix.translate(-x, -y)])
  },
  
  /*
    Function: scaleAt
      Create a scale matrix at a specific center
      
    Parameters:
      sx - x scale factor
      sy - y scale factor 
      x  - X coordinate of scale center
      y  - Y coordinate of scale center
    Returns:
      A new matrix 
  */
  scaleAt: function(sx, sy, x, y) {
    return Matrix.multiply([Matrix.translate(x, y), Matrix.scale(sx, sy), Matrix.translate(-x, -y)])
  },
  
  /*
    Function: invert
      Inverts a matrix
      
    Parameters:
      matrix -  matrix to invert

    Returns:
      A new matrix 
  */
  invert: function(matrix) {
    var m = matrix;
    var D = m.xx * m.yy - m.xy * m.yx;
    return new Matrix({xx: m.yy/D, xy: -m.xy/D, yx: -m.yx/D, yy: m.xx/D, dx: (m.yx * m.dy - m.yy * m.dx) / D, dy: (m.xy * m.dx - m.xx * m.dy) / D	});
  }
  
})

// Group: Instance Methods
Object.extend(Matrix.prototype, {
  /*
    Function: initialize
      Constructor. Creates a identity matrix by default
      
    Parameters:
      values - Hash tables with matrix values: keys are xx, xy, yx, yy, dx, dy
      
    Returns:
      A new matrix 
  */
  initialize: function(values) {    
    Object.extend(Object.extend(this, {xx:1 , xy: 0, yx: 0, yy: 1, dx: 0, dy:0 }), values || {});
    return this;
  },
  
	
  /*
    Function: mutliplyRight
      Multiply this matrix by another one to the right (this * matrix)
      
    Parameters:
      matrix -  Right matrix
      
    Returns:
      this 
  */
  multiplyRight: function(matrix) {
    var matrix = Matrix.multiply(this, matrix);
    this._affectValues(matrix);
  	return this;
  },
  
  /*
    Function: mutliplyLeft
      Multiply this matrix by another one to the left (matrix * this)
      
    Parameters:
      matrix -  Left matrix
      
    Returns:
      this 
  */
  multiplyLeft: function(matrix) {
    var matrix = Matrix.multiply(matrix, this);
    this._affectValues(matrix);
  	return this;
  },
    
  /*
    Function: multiplyPoint
      Multiply a point 
      
    Parameters:
      x -  x coordinate
      y -  y coordinate
      
    Returns:
      {x:, y:}  
      
    TODO: unit test
  */
  multiplyPoint: function(x, y) {
		return {x: this.xx * x + this.xy * y + this.dx, y: this.yx * x + this.yy * y + this.dy}; 
  },
	
  /*
    Function: multiplyBounds
      Multiply a bound area (x, y, w, h) 
      
    Parameters:
      bounds - has table {x:, y:, w:, h:}
      
    Returns:
      {x:, y:, w:, h:} 
      
    TODO: unit test
  */
	multiplyBounds: function(bounds) {
	  var pt1 = this.multiplyPoint(bounds.x, bounds.y);
	  var pt2 = this.multiplyPoint(bounds.x + bounds.w, bounds.y);
	  var pt3 = this.multiplyPoint(bounds.x, bounds.y + bounds.h);
	  var pt4 = this.multiplyPoint(bounds.x + bounds.w, bounds.y + bounds.h);
	  
	  var xmin = Math.min(Math.min(pt1.x, pt2.x), Math.min(pt3.x, pt4.x));
	  var ymin = Math.min(Math.min(pt1.y, pt2.y), Math.min(pt3.y, pt4.y));
	  var xmax = Math.max(Math.max(pt1.x, pt2.x), Math.max(pt3.x, pt4.x));
	  var ymax = Math.max(Math.max(pt1.y, pt2.y), Math.max(pt3.y, pt4.y));
	  
	  return {x: xmin, y:ymin, w: xmax - xmin, h: ymax - ymin};
	},
	
  /*
    Function: values
      Gets matrix values (xx, yx, xy, yy, dx, dy)
      
    Returns:
      An array of 6 float values: xx, yx, xy, yy, dx, dy
  */
  values: function() {
    return $A([this.xx, this.yx, this.xy, this.yy, this.dx, this.dy]);
  },
   
  /*
    Function: setValues
      Sets matrix values (xx, yx, xy, yy, dx, dy) with an array
      
    Parameters:
      array- An array of 6 float values: xx, yx, xy, yy, dx, dy
      
    Returns:
      this
  */
  setValues: function(array) {
    this.xx = parseFloat(array[0]);
    this.yx = parseFloat(array[1]);
    this.xy = parseFloat(array[2]);
    this.yy = parseFloat(array[3]);
    this.dx = parseFloat(array[4]);
    this.dy = parseFloat(array[5]);
    
    return this;
  },
  
  /*
    Function: hashValues
      Gets matrix values (xx, xy, yx, yy, dx, dy)
      
    Returns:
      An hash table {xx: , xy: , yx: , yy: , dx: , dy: };
  */
  hashValues: function() {
    return $H({xx: this.xx , xy: this.xy, yx: this.yx, yy: this.yy, dx: this.dx, dy: this.dy});
  },
  
  toString: function() {
    return Object.inspect(this.hashValues());
  },        
  
  toJSON: function() { 
    return this.hashValues().toJSON();
  },
  
  // Private function to affect values from another matrix
  _affectValues: function(matrix) {
    Object.extend(this, matrix);
    return this;
  }
});
/*
Class: Graphic.AbstractRender
	Abstract Renderer Class
	
	This class should not be used directly, just as an new renderer parent class.
	
	It lists all function that a renderer should implement.
		
  Author:
  	Sébastien Gruhier, <http://www.xilinus.com>
*/
Graphic.AbstractRender = Class.create();
Graphic.AbstractRender.prototype = {
  /*
    Function: initialize
      Constructor. 
      
    Returns:
      A new renderer
  */
  initialize: function(element) {        
    var dimension = $(element).getDimensions();

    this.viewing = {tx:0, ty: 0, sx: 1, sy:1, cx: dimension.width/2, cy: dimension.height/2};   
    this._setViewMatrix();
    this.bounds  = {x: 0, y:0, w: dimension.width, h: dimension.height};                        
    return this;
  },
     
  
  /*
    Function: pan
      Pans current viewing. 
      
    Parameters:
      x - x shift value
      y - y shift value
      
    Returns:
      this
  */
  pan: function(x, y) {
    this.viewing.tx = x;
    this.viewing.ty = y;
    this._setViewMatrix();
    this._setViewing();  
    return this;
  },
  
  /*
    Function: zoom
      Zooms current viewing. 
      
    Parameters:
      sx - x scale value
      sy - y scale value
      cx - x center (default renderer center)
      cy - y center (default renderer center)   
      
    Returns:
      this
  */
  zoom: function(sx, sy, cx, cy) {
    this.viewing.sx = sx;
    this.viewing.sy = sy;  
    this.viewing.cx = cx || this.bounds.w/2;
    this.viewing.cy = cy || this.bounds.h/2;  
    this._setViewMatrix();
    this._setViewing();  
    return this;
  },

  /*
    Function: getViewing
      Gets current viewing. 
      
    Returns:
      An hash {tx:, ty:, sx:, sy:, cx:, cy:}
  */
  getViewing: function() {
    return this.viewing;
  },
    
  /*
    Function: setViewing
      Sets current viewing. 
      
    Parameters:
      An hash {tx:, ty:, sx:, sy:, cx:, cy:}
      
    Returns:
      this
  */
  setViewing: function(viewing) {
    this.viewing = Object.extend(this.viewing, viewing);
    this._setViewMatrix();
    this._setViewing();  
    
    return this;
  },
    
  _setViewMatrix: function() {
    this.viewingMatrix = Matrix.translate(this.viewing.tx, this.viewing.ty).multiplyLeft(Matrix.scaleAt(1/this.viewing.sx, 1/this.viewing.sy, this.viewing.cx, this.viewing.cy));     
  },
      
  /*
    Function: setSize
      Sets current renderer size
      
    Parameters:
      width  - renderer width
      height - renderer height
      
    Returns:
      this
  */
  setSize: function(width, height) {
    this.bounds.w = width;
    this.bounds.h = height;          
    
    return this;
  },
  
  /*
    Function: getSize
      Gets current renderer size
            
    Returns:
      An hash {width:, height:}
  */
  getSize: function() {
    return {width: this.bounds.w, height: this.bounds.h};
  },
  
  /*
    Function: destroy
      Destructor. Should clean DOM and memory
  */
  destroy: function()                {console.log("Graphic.AbstractRender:destroy")},
  
  /*
    Function: createShape
      Creates a new shape. 
      
    Parameters:
      type - Shape type (like rect, ellipse...)
      
    Returns:
      A new object handling renderer information for drawing the shape
  */
  createShape: function(type)        {console.log("Graphic.AbstractRender:createShape")},
  
  /*
    Function: add
      Adds a new shape to be displayed. 
    Parameters:
      shape -  Shape object to be added
      parent - Parent Shape object for the added shape, used for grouping shapes.
               if null (default value) the shape is added as child of the renderer
      
     See Also:
      <Shape>
  */   
  add: function(shape, parent)       {console.log("Graphic.AbstractRender:add")},

  /*
    Function: remove
      Removes a shape from rendering
      
    Parameters:
      shape - Prototype Grpahic Shape object to be removed
      parent - Parent Shape object for the removed shape, used when grouping shapes.
               if null (default value) the shape is removed as child of the renderer
      
     See Also:
      <Shape>
  */   
  remove:function(shape, parent)     {console.log("Graphic.AbstractRender:remove")},
  
  /*
    Function: get
      Gets a shape from an ID
      
    Parameters:
      id - shape id
      
    Returns:
      A shape or null
      
    See Also:
      <Shape>
  */   
  get:function(id)                   {console.log("Graphic.AbstractRender:get")},
  
  /*
    Function: shapes
      Gets all shapes of the renderer
      
    Parameters:
      
    Returns:
      A array of shapes or null
      
    See Also:
      <Shape>
  */   
  shapes:function(id)                {console.log("Graphic.AbstractRender:shapes")},
  
  /*
    Function: clear
      Clears all shapes from rendering
  */   
  clear:function()                   {console.log("Graphic.AbstractRender:clear")},
  
  /*
    Function: updateAttributes
      Updates shape attributes. Called when a shape has been modified like fill color or 
      specific attributes like roundrect value 
      
    Parameters:
      shape - Prototype Grpahic Shape object 
      
     See Also:
      <Shape>
  */   
  updateAttributes:function(shape, attributes)  {console.log("Graphic.AbstractRender:update")},

  /*
    Function: updateTransform
      Updates shape transformation. Called when a shape transformation has been modified like rotation, translation...
      
    Parameters:
      shape - Prototype Grpahic Shape object 
      
     See Also:
      <Shape>
  */   
  updateTransform:function(shape)    {console.log("Graphic.AbstractRender:updateTransform")},
  
  /*
    Function: nbShapes
      Gets nb shapes displayed in the renderer
      
    Returns:
      int value
      
     See Also:
      <Shape>
  */   
  nbShapes: function()               {console.log("Graphic.AbstractRender:nbShapes")},
  
  /*
    Function: show
      Shows a shape. The shape should have been added to the renderer before
      
    Parameters:
      shape - Prototype Grpahic Shape object 
      
     See Also:
      <Shape>
  */   
  show:function(shape)               {console.log("Graphic.AbstractRender:show")},    
  
  /*
    Function: hide
      Hides a shape. The shape should have been added to the renderer before
      
    Parameters:
      shape - Prototype Grpahic Shape object 
      
     See Also:
      <Shape>
  */   
  hide:function(shape)               {console.log("Graphic.AbstractRender:hide")},
  
  /*
    Function: moveToFront
      Changes shape z-index order to be display above all other shapes
      
    Parameters:
      shape - Prototype Grpahic Shape object 
      
     See Also:
      <Shape>
  */   
  moveToFront: function(shape)       {console.log("Graphic.AbstractRender:moveToFront")},
  
  /*
    Function: moveToBack
      Changes shape z-index order to be display under all other shapes
      
    Parameters:
      shape - Prototype Grpahic Shape object 
      
     See Also:
      <Shape>
  */   
  moveToBack: function(shape)       {console.log("Graphic.AbstractRender:moveToBack")},
  
  /*
    Function: draw
      Performs shape rendering. 
  */   
  draw: function()                   {console.log("Graphic.AbstractRender:draw")},
  
  /*
    Function: position
      Gets top-left renderer position
      
    Returns:
      An array of 2 values (x, y)
      
     See Also:
      <Shape>
  */   
  position: function()               {console.log("Graphic.AbstractRender:position")},
  
  /*
    Function: pick
      Gets shape for a mouse event 
      
    Returns:
      null or first shape under mouse position
      
     See Also:
      <Shape>
  */   
  pick: function(event)              {console.log("Graphic.AbstractRender:pick")},       
  
  addComment: function(shape, text) {},

  addText: function(shape, text)     {console.log("Graphic.AbstractRender:addText")},
  
  _setViewing: function()            {console.log("Graphic.AbstractRender:_setViewing")}   
}/*
Class: Graphic.Shape
	Abstract class for vectorial shapes. Must be used for new shape definition.
	
	Any shape must be used by a renderer.
	
  Author:
  	Sébastien Gruhier, <http://www.xilinus.com>

  License:
  	MIT-style license.
*/
Graphic.Shape = Class.create();
Object.extend(Graphic.Shape.prototype, {
  // Group: Implemented Functions

  /*
    Function: initialize
      Constructor. Creates a new shape.
      
    Parameters:
      renderer - Renderer used to display this shape 
      nodeName - Node name (not linked to any renderer), like rect, ellipse ...
      
    Returns:
      A new shape object 
  */
  initialize: function(renderer, nodeName) {
    this.attributes = {};
    this.renderer = renderer;
    this.nodeName = nodeName;
    this.element = renderer.createShape(this);     
    if (this.element) 
      this.element.shape = this;

    // Identity by default
    this.setMatrix(new Matrix()); 
    
    // No stroke, no fill by default  
    this.setStroke(null);
    this.setFill(null);
    return this;
  },
  
  /*
    Function: destroy
      Destructor. 
  */
  destroy: function() {
    this.renderer.remove(this);
  },
  
  /*
    Function: getType
      Gets node type ( = node name)
      
    Returns:
      Node name string
  */
  getType: function() {
    return this.nodeName;
  },
  
  /*
    Function: setID
      Sets shape ID

    Parameters:
      id - Shape id value
      
    Returns:
      this
  */
  setID: function(id) {
    this._setAttribute("id", id, true); 
    return this;
  },

  /*
    Function: getID
      Gets node ID
      
    Returns:
      ID string
  */
  getID: function() {
     return this.attributes.id;
  },
  
  /*
    Function: setClassName
      Sets shape class name

    Parameters:
      className - Shape class name value
      
    Returns:
      this
  */
  setClassName: function(className) {
    this._setAttribute("class", className, true);  
    return this;
  },

  /*
    Function: getClassName
      Gets shape class name
      
    Returns:
      Shape class name string
  */
  getClassName: function() {
     return this.attributes["class"];
  },
  
  /*
    Function: show
      Sets shape visible

    Returns:
      this
  */
  show: function() {
    this.renderer.show(this);
    return this;
  },
  
  /*
    Function: hide
      Sets shape invisible

    Returns:
      this
  */
  hide: function() {
    this.renderer.hide(this);
    return this;
  },
  
  /*
    Function: setFill
      Sets fill attributes. Currently it could be
      - null or  attributes.fill == "none" for no filling
      - an hash of 4 keys {r:, g:, b:, a:}
      - a string : rgb(r,g,b,a) 
   
    Parameters:
      attributes: fill attributes (see above for details)
      
    Returns:
      this
  */
  setFill: function(attributes) {
    // No fill
    if(!attributes || attributes.fill == "none"){
			this._setAttribute("fill", "none");
			this._setAttribute("fill-opacity", 0);
		}
		// Handle just {r:RRR, g:GGG, b:BBB, a:AAA} right now with 0 <= value <= 255, alpha is optional (default 255)
		else if (typeof attributes.r != "undefined"){
		  this._setAttribute("fill", "rgb(" + parseInt(attributes.r) + "," + parseInt(attributes.g) + "," + parseInt(attributes.b) + ")");
		  this._setAttribute("fill-opacity", (attributes.a || 255)/255.0);
		} 
    return this;
  },
  
  /*
    Function: getFill
      Gets fill attributes

    Returns:
      a string : rgb(r,g,b) or none
  */
  getFill: function() {
    return this.attributes.fill;
  },

  /*
    Function: getFillOpacity
      Gets fill opacity attribute

    Returns:
      a float [0..1]
  */
  getFillOpacity: function() {
     return this.attributes["fill-opacity"];
  },
  
  /*
    Function: setStroke
      Sets stroke attributes. Currently it could be
      - null or  attributes.fill == "none" for no filling
      - an hash of 4 keys {r:, g:, b:, a:, w:} w is stroke width
      - a string : rgb(r,g,b,a, w) 
   
    Parameters:
      attributes: stroke attributes (see above for details)  
      
    Returns:
      this
  */
  setStroke: function(attributes) {
		// No stroke
		if(!attributes || attributes.stroke == "none"){
			this._setAttribute("stroke", "none");
			this._setAttribute("stroke-opacity", 0);
			this._setAttribute("stroke-width", 0);
		} 
		// Handle just {r:RRR, g:GGG, b:BBB, a:AAA} right now with 0 <= value <= 255, alpha is optional (default 255)
		else if (typeof attributes.r != "undefined"){
		  this._setAttribute("stroke", "rgb(" + parseInt(attributes.r) + "," + parseInt(attributes.g) + "," + parseInt(attributes.b) + ")");
		  this._setAttribute("stroke-opacity", (attributes.a || 255)/255.0);  
			this._setAttribute("stroke-width", (attributes.w || 1));
		}
		return this;
	},
  
  /*
    Function: setStrokeWidth
      Sets stroke width attribute
      
    Parameters:
      w: width in pixels  
      
    Returns:
      this
  */
	setStrokeWidth : function(w){
	  this._setAttribute("stroke-width", (w || 1));   
	  return this;
	},	
	
  /*
    Function: setStrokeOpacity
      Sets stroke opacity attribute
      
    Parameters:
      a: opacity [0..255]
      
    Returns:
      this
  */
	setStrokeOpacity : function(a){
    this._setAttribute("stroke-opacity", (a || 255) / 255.0);  
	  return this;
	},
	
  /*
    Function: setStrokeColor
      Sets stroke color attributes
      
    Parameters:
      r: red   [0..255]
      g: green [0..255]
      b: blue  [0..255]
      
    Returns:
      this
  */
	setStrokeColor : function(r,g,b){
    this._setAttribute("stroke", "rgb(" + parseInt(r) + "," + parseInt(g) + "," + parseInt(b) + ")");
 	  return this;
	},
	
	/*
    Function: getStroke
      Gets stroke attributes

    Returns:
      a string : rgb(r,g,b) or none
  */
  getStroke: function() {
    return this.attributes.stroke;
  },
  
  /*
    Function: getStrokeOpacity
      Gets stroke opacity attribute

    Returns:
      a float [0..1]
  */
  getStrokeOpacity: function() {
     return this.attributes["stroke-opacity"];
  },
  
  /*
    Function: getStrokeWidth
      Gets stroke width attribute

    Returns:
      a float 
  */
  getStrokeWidth: function() {
     return this.attributes["stroke-width"];
  },
  
  /*
    Function: setAntialiasing
      Sets antialiasing on or off
      
    Parameters:
     on - boolean, true for activating antialiasing

    Returns:
      this
  */
  setAntialiasing: function(on) {
    if (on)
      this._setAttribute("shape-rendering","auto");
    else
      this._setAttribute("shape-rendering","crispEdges");
      
    return this;
  },
      
  /*
    Function: getAntialiasing
      Gets antialiasing value
      
     Returns:
      true/false
  */
  getAntialiasing: function() {
    return this.attributes["shape-rendering"] == "auto";
  },
      
  /*
    Function: setBounds
      Sets shape bounds (it calls setSize and setLocation)
      
    Parameters:
      x - shape X corner
      y - shape Y corner
      w - shape width 
      h - shape height

    Returns:
      this
  */
  setBounds: function(x, y, w, h) {
    this.setLocation(x, y);
    this.setSize(w, h);
    
    return this;
  },
  
  /*
    Function: getBounds
      Gets object bounds 
      
    Returns:
      An hash table {x:, y:, w:, h:}
  */
  getBounds: function() {
    return Object.extend(this.getSize(), this.getLocation());    
  },

  /*
    Function: moveToFront
      Moves this shape above all others

    Returns:
      this
  */
  moveToFront: function() {
    if (this.renderer) 
      this.renderer.moveToFront(this);
    
    return this;
  }, 
    
  /*
    Function: rotate
      Rotates shape (by default rotation center = shape center)
      
    Parameters:
      angle - Angle in degree
      rx - rotation center X value (default shape center)
      ry - rotation center Y value (default shape center)

    Returns:
      this
  */
  rotate: function(angle, rx, ry) {
    var bounds = this.getBounds();
    if (typeof rx == "undefined")
      rx = bounds.x + (bounds.w / 2);

    if (typeof ry == "undefined")
      ry = bounds.y + (bounds.h / 2); 
    
    this.postTransform(Matrix.translate(rx, ry));
    this.postTransform(Matrix.rotate(angle));
    this.postTransform(Matrix.translate(-rx, -ry));

    return this;
  },
  
  /*
    Function: translate
      Translates shape 
      
    Parameters:
      tx - X value 
      ty - Y value

    Returns:
      this
  */
  translate: function(tx, ty) { 
    return this.postTransform(Matrix.translate(tx, ty));
  },


  /*
    Function: scale
      Scales shape 
      
    Parameters:
      sx - sx scale factor 
      sy - sy scale factor 
      cy - scale center X value (default current CTM center)
      cy - scale center Y value (default current CTM center)
    Returns:
      this
  */
  scale: function(sx, sy, cx, cy) { 
    if (cx)
      this.postTransform(Matrix.translate(cx, cy));
    this.postTransform(Matrix.scale(sx, sy));
    if (cx)
      this.postTransform(Matrix.translate(-cx, -cy));
    return this
  },

  /*
    Function: postTransform
      Add a transformation "after" the current CTM
      
    Parameters:
      matrix - matrix to post transform 

    Returns:
      this
  */
  postTransform: function(matrix) {
    this.matrix.multiplyRight(matrix)
    this.inverseMatrix.multiplyLeft(Matrix.invert(matrix));
    this._updateTransform();

    return this;
  },

  /*
    Function: preTransform
      Add a transformation "before" the current CTM
      
    Parameters:
      matrix - matrix to pre transform 

    Returns:
      this
  */
  preTransform: function(matrix) {    
    this.matrix.multiplyLeft(matrix)
    this.inverseMatrix.multiplyRight(Matrix.invert(matrix));
    this._updateTransform();

    return this;
  },
  
  /*
    Function: setMatrix
      Sets CTM (current transformation matrix)
      
    Parameters:
      matrix - new shape CTM
    Returns:
      this      
  */
  setMatrix: function(matrix, inverse) {  
    this.matrix = new Matrix(matrix);
    this.inverseMatrix = inverse || Matrix.invert(this.matrix); 
    this._updateTransform();        
                                          
    return this;
  },  

  /*
    Function: getMatrix
      Gets CTM (current transformation matrix)
      
    Returns:
      An matrix object  
  */
  getMatrix: function() {
    return this.matrix;
  },   
   
  /*
    Function: getInverseMatrix
      Gets inverse CTM (current transformation matrix)
      
    Returns:
      An matrix object  
  */
  getInverseMatrix: function() {
    return this.inverseMatrix;
  },    

  /*
    Function: getRendererObject
      Gets renderer object link to this shape
      
    Returns:
      An object 
  */
  getRendererObject: function() { 
    return this.element;
  },
  
     
  // Group: Abstract Functions
  // Those functions have to be overriden by any shapes. 
  /*
    Function: getSize
      Gets object size

    Returns:
      An hash table {w:, h:}
  */
  getSize: function() {   
    console.log("getSize")
    throw Graphic.functionMustBeOverriden;    
  },

  /*
    Function: setSize
      Sets object size

    Parameters:
      width: shape width
      height: shape height
      
    Returns:
      this
  */
  setSize: function(width, height) {
    console.log("setSize")
    throw Graphic.functionMustBeOverriden;    
  },
  
  /*
    Function: getLocation
      Gets object location

      Returns:
        An hash table {x:, y:}
  */
  getLocation: function() {
    console.log("getLocation")
    throw Graphic.functionMustBeOverriden;    
  },

  /*
    Function: setLocation
      Sets object location

    Parameters:
      x: shape x value
      y: shape y value
      
    Returns:
      this
  */
  setLocation: function(x, y) {
    console.log("setLocation") 
    throw Graphic.functionMustBeOverriden;    
  },      
  
  addComment: function(commentText) { 
	  var commentNode = this.renderer.addComment(this, commentText);
	  return this;
  },

  // Private function for settings attributes and calls renderer updateAttributes function
  _setAttributes: function(attributes) {
    this.attributes = Object.extend(this.attributes, attributes || {});
    this.renderer.updateAttributes(this, attributes);
    return this;
  },

  _setAttribute: function(name, value) {
    var hash = {}
    hash[name] = value;
    this._setAttributes(hash);
    return this;
  },
  
  _updateTransform: function() {
    this._setAttributes({matrix: this.matrix.values().join(","), invmatrix: this.inverseMatrix.values().join(",")}); 
    this.renderer.updateTransform(this);
  }
})
/*
Class: Graphic.Rectangle
	Shape implementation of a rectangle. A Rectangle can have rounded corners

  Author:
  	Sébastien Gruhier, <http://www.xilinus.com>

  License:
  	MIT-style license.
*/
Graphic.Rectangle = Class.create();
Object.extend(Graphic.Rectangle.prototype, Graphic.Shape.prototype);

// Keep parent initialize
Graphic.Rectangle.prototype._shapeInitialize = Graphic.Shape.prototype.initialize;

Object.extend(Graphic.Rectangle.prototype, {
  // Group: Shape functions
  // See Also:
  // <Shape>
  initialize: function(renderer) {
    this._shapeInitialize(renderer, "rect");
    Object.extend(this.attributes, {x:0, y:0, w:0, h:0, rx: 0, ry: 0});
    return this;
  },
    
  getSize: function() {        
    return {w: this.attributes.width, h: this.attributes.height}
  },
  
  setSize: function(width, height) {     
    this._setAttributes({width: width, height: height});
    return this;
  },
    
  getLocation: function() {
    return {x: this.attributes.x, y: this.attributes.y}
  },
  
  setLocation: function(x, y) {
    this._setAttributes({x: x, y: y});
    return this;
  },
  
  // Group: Specific Rectangle Functions
  /*
    Function: setRoundCorner
      Sets round corners values in pixel
      
    Parameters:
      rx - round X value
      ry - round Y value
      
    Returns:
      this
  */
  setRoundCorner: function(rx, ry) {
    rx = Math.max(0, rx);
    ry = Math.max(0, ry);
    if (! ry)
      ry = rx;
    this._setAttributes({rx: rx, ry: ry});
    return this;
  },
  
  /*
    Function: getRoundCorner
      Gets round corners values in pixel
      
    Returns:
      An hash table {rx:, ry:}
  */
  getRoundCorner: function(rx, ry) {
    return  {rx: this.attributes.rx, ry: this.attributes.ry}
  }
})
/*
Class: Graphic.Ellipse
	Shape implementation of an ellipse.

  Author:
  	Sébastien Gruhier, <http://www.xilinus.com>

  License:
  	MIT-style license.

  See Also:
    <Shape>
*/
Graphic.Ellipse = Class.create();
Object.extend(Graphic.Ellipse.prototype, Graphic.Shape.prototype);
// Keep parent initialize
Graphic.Ellipse.prototype._shapeInitialize = Graphic.Shape.prototype.initialize;

Object.extend(Graphic.Ellipse.prototype, {
  initialize: function(renderer) {
    this._shapeInitialize(renderer, "ellipse");   
    Object.extend(this.attributes, {cx: 0, cy: 0, rx: 0, ry: 0})
    return this;
  },
  
  getSize: function() {
    return {w: 2 * this.attributes.rx, h: 2 * this.attributes.ry}
  },
  
  setSize: function(width, height) {
    var location = this.getLocation();
    this._setAttributes({rx: width/2, ry: height/2});  
    this.setLocation(location.x, location.y);
    return this;
  },
    
  getLocation: function() {
    return {x: this.attributes.cx - this.attributes.rx, y: this.attributes.cy - this.attributes.ry}
  },
  
  setLocation: function(x, y) { 
    this._setAttributes({cx: x + this.attributes.rx, cy: y + this.attributes.ry});
    return this;
  }
})
/*
Class: Graphic.Circle
	Shape implementation of a circle.

  Author:
  	Sébastien Gruhier, <http://www.xilinus.com>

  License:
  	MIT-style license.

  See Also:
    <Shape>
*/
Graphic.Circle = Class.create();
Object.extend(Graphic.Circle.prototype, Graphic.Shape.prototype);
// Keep parent initialize
Graphic.Circle.prototype._parentInitialize = Graphic.Shape.prototype.initialize;

Object.extend(Graphic.Circle.prototype, {
  initialize: function(renderer) {    
    this._parentInitialize(renderer, "circle");
    Object.extend(this.attributes, {cx: 0, cy: 0, r: 0})
    return this;
  },

  getSize: function() {
    return {w: 2 * this.attributes.r, h: 2 * this.attributes.r}
  },
  
  setSize: function(width, height) {
    var location = this.getLocation();
    this._setAttributes({r:  Math.max(width, height)/2});
    this.setLocation(location.x, location.y);
    return this;
  },
    
  getLocation: function() {
    return {x: this.attributes.cx - this.attributes.r, y: this.attributes.cy - this.attributes.r}
  },
  
  setLocation: function(x, y) { 
    this._setAttributes({cx: x + this.attributes.r, cy: y + this.attributes.r});
    return this;
  },
  
  setCenter: function(cx, cy) {
    this._setAttributes({cx: cx, cy: cy});
    return this;
  },

  getCenter: function() {
    return {cx: this.attributes.cx, cy: this.attributes.cy};
  },

  setRadius: function(r) {
    this._setAttributes({r: r});
    return this;
  },
  
  getRadius: function() {
    return this.attributes.r;
  }
  
})
/*
Class: Graphic.Polyline
	Shape implementation of a Polyline.

  Author:
  	Sébastien Gruhier, <http://www.xilinus.com>

  License:
  	MIT-style license.

  See Also:
    <Shape>
*/
Graphic.Polyline = Class.create();
Object.extend(Graphic.Polyline.prototype, Graphic.Shape.prototype);
// Keep parent initialize
Graphic.Polyline.prototype._parentInitialize = Graphic.Shape.prototype.initialize;

Object.extend(Graphic.Polyline.prototype, {
  initialize: function(renderer, type) {  
    this._parentInitialize(renderer, type || "polyline");
    Object.extend(this.attributes, {x:0, y:0, w:0, h:0});

    this.points = new Array();
    return this;
  },
  
  addPoints: function(points) {
    points.each(function(p) {this.points.push([p[0], p[1]])}.bind(this));
    this._updatePath();
    return this;
  },
   
  setPoints: function(points) {
    this.points.clear();
    this.addPoints(points)
    return this;
  },
   
  setPoint: function(x, y, index) {  
    if (index < this.points.length) {
      this.points[index][0] = x;      
      this.points[index][1] = y;      
       this._updatePath();
    }
    return this;
  },
   
  addPoint: function(x, y) {
    this.points.push([x, y]);
    this._updatePath();
    return this;
  },
   
  getPoints: function() {
    return this.points;
  },
  
  getPoint: function(index) {
    return {x: this.points[index][0], y: this.points[index][1]};
  },
  
  getNbPoints: function() {
    return this.points.length;
  },
  
  // From shape
  setSize: function(width, height) {
    var x0 = this.x;
    var y0 = this.y;
    var fx = width / this.w;
    var fy = height / this.h;
    this.points.each(function(p) { 
      p[0] = (p[0] - this.x) * fx + this.x;
      p[1] = (p[1] - this.y) * fy + this.y;
    }.bind(this));
    this._updatePath();
    return this;
  },

  getSize: function() {
    return {w: this.w, h: this.h}
  },
  
  setLocation: function(x, y) {
    var dx = x - this.x;
    var dy = y - this.y;
    this.points.each(function(p) { 
      p[0] += dx;
      p[1] += dy;
    });
    this._updatePath();
    return this;
  },

  getLocation: function() {
    return {x: this.x, y: this.y}
  },

  // Private functions
  _updateBounds: function() {
    var xmin = 0, ymin = 0, xmax = 0, ymax = 0;
    if (this.points.length > 0) {
      var xmin = parseFloat(this.points[0][0]), ymin = parseFloat(this.points[0][1]),
          xmax = parseFloat(this.points[0][0]), ymax = parseFloat(this.points[0][1]);
      xmin = parseFloat(xmin);
      this.points.each(function(p) { 
        p[0] = parseFloat(p[0]);
        p[1] = parseFloat(p[1]);
        if (p[0] < xmin) xmin = p[0];
        if (p[0] > xmax) xmax = p[0];
        if (p[1] < ymin) ymin = p[1];
        if (p[1] > ymax) ymax = p[1];     
      });
      
      this.x = xmin;
      this.y = ymin;
      this.w = xmax - xmin;
      this.h = ymax - ymin;
    }
    else {
      this.x = 0;
      this.y = 0;
      this.w = 0;
      this.h = 0;
    };    
  },
  
  _updatePath: function() {
    // Converts points into SVG path
    var path = "";
    this.points.each(function(p) { path += p[0] + " " + p[1] + ","});
    path = path.slice(0, path.length-1);

    this._updateBounds();
    this._setAttribute("points", path);
  }
})
/*
Class: Graphic.Polygon
	Shape implementation of a polygon.

  Author:
  	Sébastien Gruhier, <http://www.xilinus.com>

  License:
  	MIT-style license.

  See Also:
    <Shape>
*/
Graphic.Polygon = Class.create();
Object.extend(Graphic.Polygon.prototype, Graphic.Polyline.prototype);
// Keep parent initialize
Graphic.Polygon.prototype._polylineInitialize = Graphic.Polyline.prototype.initialize;

Object.extend(Graphic.Polygon.prototype, {
  initialize: function(renderer) {
    this._polylineInitialize(renderer, "polygon");
    return this;
  }
})
/*
Class: Graphic.Line
	Shape implementation of a line.

  Author:
  	Sébastien Gruhier, <http://www.xilinus.com>

  License:
  	MIT-style license.

  See Also:
    <Shape>
*/
Graphic.Line = Class.create();
Object.extend(Graphic.Line.prototype, Graphic.Shape.prototype);
// Keep parent initialize
Graphic.Line.prototype._parentInitialize = Graphic.Shape.prototype.initialize;

Object.extend(Graphic.Line.prototype, {
  initialize: function(renderer) {
    this._parentInitialize(renderer, "line");
    return this;
  },
  
  getSize: function() {    
    return {w: Math.abs(this.attributes.x1 - this.attributes.x2), h: Math.abs(this.attributes.y1 - this.attributes.y2)}
  },
  
  setSize: function(width, height) {     
    // this._setAttributes({width: width, height: height});
    return this;
  },
    
  getLocation: function() {
    return {x: Math.min(this.attributes.x1, this.attributes.x2), y: Math.min(this.attributes.y1, this.attributes.y2)}
  },
  
  setLocation: function(x, y) {
    // this._setAttributes({x: x, y: y});
    return this;
  },
  
  setPoints: function(x1, y1, x2, y2) {
    this._setAttributes({x1: x1, y1: y1, x2: x2, y2: y2})
    return this;
  }, 
  
  getPoint: function(index) {
    if (index == 0)
      return {x: this.attributes.x1, y:this.attributes.y1}
    else
      return {x: this.attributes.x2, y:this.attributes.y2}
  }
})
/*
Class: Graphic.Group
	Shape implementation of a group.

  Author:
  	Sébastien Gruhier, <http://www.xilinus.com>

  License:
  	MIT-style license.

  See Also:
    <Shape>
*/
Graphic.Group = Class.create();
Object.extend(Graphic.Group.prototype, Graphic.Shape.prototype);
// Keep parent initialize
Graphic.Group.prototype._parentInitialize = Graphic.Shape.prototype.initialize;
Graphic.Group.prototype._parentPostTransform = Graphic.Shape.prototype.postTransform;
Graphic.Group.prototype._parentPreTransform = Graphic.Shape.prototype.preTransform;

Object.extend(Graphic.Group.prototype, {
  initialize: function(renderer) {    
    this._parentInitialize(renderer, "g"); 
    this.children = new Array();
    return this;
  },

  destroy: function() {
    this.children.each(function(e) {
      e.destroy();
    });
    this.children.clear();
    this.renderer.remove(this);
  },
    
  
  add: function(shape) { 
    var hasShape = this.children.find( function(s) { return s == shape });                 
    if (!hasShape) {  
      this.children.push(shape); 
      shape.parent = this; 
      shape.originalMatrix = shape.matrix;
      this.renderer.add(shape, this);
    }
  },

  remove:function(shape) {
    var hasShape = this.children.find( function(s) { return s == shape });                 
    if (hasShape) {
      this.children = this.children.reject( function(s) { return s == shape });
      this.renderer.remove(shape);  
      shape.parent = null;
    }
  },

  get: function(index) {
    return (index >=0 && index < this.children.length ? this.children[index] : null);
  },                            
  
  getNbELements: function() {
    return this.children.length;
  },

  getSize: function() {
    if (this.getNbELements() == 0) 
      return {w: 0, h: 0};
    
    var first = this.children.first()
    var bounds = (first.getBounds());
    var xmin = bounds.x;
    var ymin = bounds.y;
    var xmax = bounds.x + bounds.w;
    var ymax = bounds.y + bounds.h;
    this.children.each(function(shape) {
      var bounds = (shape.getBounds());
      xmin = Math.min(xmin, bounds.x);
      xmax = Math.max(xmax, bounds.x + bounds.w);
      ymin = Math.min(ymin, bounds.y);
      ymax = Math.max(ymax, bounds.y + bounds.h);      
    });
    return {w: xmax - xmin, h: ymax - ymin};
  }, 

  getLocation: function() {
    if (this.getNbELements() == 0) 
      return {x: 0, y: 0};
      
    var first = this.children.first()
    var bounds = (first.getBounds());
    var xmin = bounds.x;
    var ymin = bounds.y;
    this.children.each(function(shape) {
      var bounds = (shape.getBounds());
      xmin = Math.min(xmin, bounds.x);
      ymin = Math.min(ymin, bounds.y);
    });
    return {x: xmin, y: ymin};
  },
  
  postTransform: function(matrix) {
    this._parentPostTransform(matrix);

    this.children.each(function(shape) {
      shape.postTransform(matrix);
    });
    return this;
  },
  
  preTransform: function(matrix) {
    this._parentPreTransform(matrix);

    this.children.each(function(shape) {
      shape.preTransform(matrix);
    });
    return this;
  },

  find:function(shapeId) {
    return this.children.find( function(s) { return s.getID() == shapeId });
  },

  findAll:function(shapeType) {
    return this.children.findAll( function(s) { return s.getType() == shapeType });
  }  
})
/*
Class: Graphic.Text
	Shape implementation of a text.

  Author:
  	Steven Pothoven

  License:
  	MIT-style license.

  See Also:
    <Shape>
*/
Graphic.Text = Class.create();
Object.extend(Graphic.Text.prototype, Graphic.Shape.prototype);
// Keep parent initialize
Graphic.Text.prototype._parentInitialize = Graphic.Shape.prototype.initialize;

Object.extend(Graphic.Text.prototype, {
  initialize: function(renderer) {    
    this._parentInitialize(renderer, "text");
    Object.extend(this.attributes, {x: 0, y: 0, 'font-size': '10', 'font-family': 'Veranda', 'font-weight': 'normal'});
    return this;
  },

  getSize: function() {
    return {fontSize: this.attributes['font-size'], fontWeight: this.attributes['font-weight']};
  },
  
  setSize: function(fontSize, fontWeight) {
    this._setAttributes({'font-size':  fontSize, 'font-weight': fontWeight});
    return this;
  },
    
  getLocation: function() {
    return {x: this.attributes.x, y: this.attributes.y}
  },
  
  setLocation: function(x, y) { 
    this._setAttributes({x: x, y: y});
    return this;
  },
  
  getFont: function() {
    return {fontSize: this.attributes['font-size'], fontFamily: this.attributes['font-family'], fontWeight: this.attributes['font-weight']};
  },

  setFont: function(size, family, weight) {
  	if (size) {
    	this._setAttribute('font-size',  size);
  	}
  	if (family) {
	    this._setAttribute('font-family', family);
  	}
  	if (weight) {
	    this._setAttribute('font-weight', weight);
  	}
  	return this;
  },
  
  setTextValue: function(textValue) { 
	  this.renderer.addText(this, textValue);
	  return this;
  }
})
/*
Class: Graphic.Image
	Shape implementation of an image. 

  Author:
  	Sébastien Gruhier, <http://www.xilinus.com>

  License:
  	MIT-style license.
*/
Graphic.Image = Class.create();
Object.extend(Graphic.Image.prototype, Graphic.Rectangle.prototype);

// Keep parent initialize
Graphic.Image.prototype._shapeInitialize = Graphic.Shape.prototype.initialize;

Object.extend(Graphic.Image.prototype, {
  initialize: function(renderer, image) {
    this._shapeInitialize(renderer, "image");
    Object.extend(this.attributes, {x:0, y:0, width:0, height:0});
    return this;
  },
  
  // Group: Specific Image Functions
  /*
    Function: setSource
      Sets image source
      
    Parameters:
      url      - image url
      autoSize - Set width and height from image (default false)
      
    Returns:
      this
  */
  setSource: function(url, autoSize) {       
    if (autoSize) {
      this.image = new Image(); 
      this.image.src= url;  
      Event.observe(this.image, "load",function() {   
        this.setSize(this.image.width, this.image.height);
        this._setAttribute('href', url);  
      }.bind(this));
    }
    else
      this._setAttribute('href', url);  
    return this;
  }
});/*
Class: EventNotifier
	Singleton to send messages to any observers.
	
	To receive message, you just need to register an object as observer.
	You can observe messages from any objects or for a specific object. 
	
	All messages will receive two parameters :
	- sender object
	- options (hash table or object)
	
	Sample Code  
	> myObserver =  {
  >   shapeHasBeenMoved: function(sender, options) {
  >     console.log(options)
  >   }
  > }
  > EventNotifier.addObserver(myObserver)
  
  Author:
  	Sébastien Gruhier, <http://www.xilinus.com>

  License:
  	MIT-style license.
*/
EventNotifier = {
  observers: new Array(),
  
  /*
    Function: addObserver
      Registers a new object as observer
      
    Parameters:
      observer - Observer (should implement message function to be notified)
      sender   - Sender object (default:null) If not null, observer will only received message from this object
  */
  addObserver: function(observer, sender) {
    sender = sender || null;
    this.removeObserver(observer);
    this.observers.push({observer:observer, sender:sender});
  },
  
  /*
    Function: removeObserver
      Unregisters an observer
      
    Parameters:
      observer - Observer 
  */
  removeObserver: function(observer) {  
    this.observers = this.observers.reject( function(o) { return o.observer == observer });
  },
  
  /*
    Function: send
      Send a new message to all registered observers
      
    Parameters:
      sender    - Sender object (can be null)
      eventName - Event name (observers have to implement this method)
      options   - Object or Hash table (for multiple options) of sending event  (default null)
  */
  send: function(sender, eventName, options) {  
    options = options || null;
    this.observers.each( function(o) {
      if ((o.sender == null || o.sender == sender) && o.observer[eventName]) 
        o.observer[eventName](sender, options);
    });
  }
}/*
Class: Graphic.Tool
	Abstract class used by Graphic.ToolManager.
	
	Any tools used by Graphic.ToolManager should implemented those methods

  Author:
  	Sébastien Gruhier, <http://www.xilinus.com>

  License:
  	MIT-style license.

  See Also:
    <ToolManager>
*/
Graphic.Tool = Class.create();
Graphic.Tool.prototype = { 
  /*
    Function: activate
      Activates the current tool
     
    Parameters:
      manager - tool manager
      
  */
  activate: function(manager) {},
  
  /*
    Function: unactivate
      Unactivates the current tool
     
    Parameters:
      manager - tool manager
      
  */
  unactivate: function(manager) {}, 

  /*
    Function: clear
      Clears the current tool
     
    Parameters:
      manager - tool manager
      
  */
  clear: function(manager) {},
  
  /*
    Function: initDrag
      Called by tool manager to start a drag session (mouse down on a shape)
     
    Parameters:
      x - x mouse coordinate in current area
      y - y mouse coordinate in current area
      event - browser mouse event      
  */
  initDrag: function(x, y, event) {},
  
  /*
    Function: drag
      Called by tool manager on mouse drag
     
    Parameters:
      x - x mouse coordinate in current area
      y - y mouse coordinate in current area
      dx - x delta since the init drag
      dx - y delta since the init drag
      ddx - x delta since the last drag
      ddx - y delta since the last drag
      event - browser mouse event
  */
  drag: function(x, y, dx, dy, ddx, ddy, event) {},
  
  /*
    Function: endDrag
      Called by tool manager to end a drag session (mouse up on a shape)
     
    Parameters:
      x - x mouse coordinate in current area
      y - y mouse coordinate in current area
      event - browser mouse event      
  */
  endDrag: function(x, y, event) {},

  /*
    Function: mouseMove
      Called by tool manager on mouseMove (not called while draggin)
     
    Parameters:
      x - x mouse coordinate in current area
      y - y mouse coordinate in current area
      event - browser mouse event      
  */              
  
  mouseMove: function(x, y, event) {},                             
  
  /*
    Function: click
      Called by tool manager on a click
       
    Parameters:
      x - x mouse coordinate in current area
      y - y mouse coordinate in current area
      event - browser mouse event      
  */
  click: function(x, y, event) {},
  
  /*
    Function: doubleClick
      Called by tool manager on a double click
     
    Parameters:
      x - x mouse coordinate in current area
      y - y mouse coordinate in current area
      event - browser mouse event      
  */
  doubleClick: function(x, y, event) {},

  /*
    Function: keyUp
      Called by tool manager on a key up
     
    Parameters:  
      keyCode - key code 
      event   - browser key event    
      
    Returns: 
      true if tool handle key, else false
  */
  keyUp: function(keyCode, event) {},  
  
  /*
    Function: keyDown
      Called by tool manager on a key up
     
    Parameters:  
      keyCode - key code 
      event   - browser key event    
      
    Returns: 
      true if tool handle key, else false
  */
  keyDown: function(keyCode, event) {},

  /*
    Function: mouseOver
      Called by tool manager on a mouse over

    Parameters:  
      x - x mouse coordinate in current area
      y - y mouse coordinate in current area
      event - browser mouse event      

  */
  mouseOver: function(x, y, event) {},

  /*
    Function: mouseOut
      Called by tool manager on a mouse out

    Parameters:  
      event - browser mouse event      

  */
  mouseOut: function(event) {}
}
/*
Class: Graphic.ToolManager
	Class to handle mouse event for any tools.
	Just initialize a tool manager on a renderer and set your a tool (setTool)
 
  Author:
  	Sébastien Gruhier, <http://www.xilinus.com>

  License:
  	MIT-style license.

  See Also:
    <Tool>
*/
Graphic.ToolManager = Class.create();
Graphic.ToolManager.prototype = {    
  initialize: function(renderer) {
    this.renderer = renderer;
    this.element = renderer.element.parentNode;
    this.currentTool = null;
    
    this.eventMappings = $A([ [this.element, "mousedown", this.mouseDown],
    						              [this.element, "click",     this.click],
    						              [this.element, "dblclick",  this.doubleClick],
    						              [document,     "mousemove", this.mouseMove],
    						              [document,     "mouseup",   this.mouseUp],
    						              [document,     "keyup",     this.keyUp],
    						              [document,     "keydown",   this.keyDown],
    						              [this.element, "mouseover", this.mouseOver],
    						              [this.element, "mouseout",  this.mouseOut]
    						              ]);

    this.eventMappings.each(function(eventMap) { 
      eventMap.push(eventMap[2].bindAsEventListener(this))
    	Event.observe($(eventMap[0]), eventMap[1], eventMap[3]);
     }.bind(this));
    this.offset = Position.cumulativeOffset(this.element);  
    this.dimension = $(this.element).getDimensions();
  },

  destroy: function() {
    this.currentTool.unactivate();
    this.currentTool = null;
   
    // Remove event listeners
    this.eventMappings.each(function(eventMap) {
   	  Event.stopObserving($(eventMap[0]), eventMap[1], eventMap[3]);
    });
    this.eventMappings.clear();
  },

  setRenderer: function(renderer) {
    this.renderer = renderer;
    this.setTool(this.currentTool);  
  },
  
  setTool: function(tool) {
    if (this.currentTool && this.currentTool.unactivate)
      this.currentTool.unactivate(this);
      
    this.currentTool = tool;
    
    if (this.currentTool && this.currentTool.activate)
      this.currentTool.activate(this);    
  },
  
  getTool: function() {
    return this.currentTool;
  },
  
  doubleClick: function(event) {   
    if (this.currentTool == null)
      return;
   
    this.offset = Position.page(this.element);   
    var x = this._getX(event); 
    var y = this._getY(event);
    this.currentTool.doubleClick(x, y, event);
    
    Event.stop(event);
  },
  
  click: function(event) {   
    if (this.currentTool == null)
      return;
   
    this.offset = Position.page(this.element);   
    var x = this._getX(event); 
    var y = this._getY(event);
    this.currentTool.click(x, y, event);
    
    Event.stop(event);
  },
  
  mouseDown: function(event) {   
    if (this.currentTool == null)
      return;

    if (!Event.isLeftClick(event))
      return; 
      
    this.offset = Position.page(this.element);  
    this.xi = this._getX(event);
    this.yi = this._getY(event);
    
    this.xlast = this.xi;
    this.ylast = this.yi;

    this.currentTool.initDrag(this.xi, this.yi, event);
    this.isDragging = true;
    disableSelection();
    Event.stop(event);
  },
  
  mouseMove: function(event) { 
    if (this.currentTool == null)
      return;
    var x = this._getX(event); 
    var y = this._getY(event);
    if (this.isDragging) {
      var dx = x - this.xi;
      var dy = y - this.yi;
      var ddx = x - this.xlast;
      var ddy = y - this.ylast;
     
      var org = this.renderer.viewingMatrix.multiplyPoint(0, 0);
      var pt = this.renderer.viewingMatrix.multiplyPoint(ddx, ddy);
      ddx =  pt.x - org.x;
      ddy =  pt.y - org.y;

      var pt = this.renderer.viewingMatrix.multiplyPoint(dx, dy); 
      dx =  pt.x - org.x;
      dy =  pt.y - org.y;
      
      this.xlast = x;
      this.ylast = y;
      this.currentTool.drag(x, y, dx, dy, ddx, ddy, event);
    } 
    else
      if (this.currentTool.mouseMove)
        this.currentTool.mouseMove(x, y, event);
    
    Event.stop(event);
  },
  
  mouseUp: function(event) {
    if (this.currentTool == null)
      return;

    if (!this.isDragging)
      return false;
      
    var x = this._getX(event); 
    var y = this._getY(event);

    this.isDragging = false;
    this.currentTool.endDrag(x, y, event);
    enableSelection();
    Event.stop(event);
  },
  
  keyUp: function(event) {    
    if (this.currentTool == null)
     return;

    var keyCode = event.keyCode || event.which
    if (this.currentTool.keyUp(keyCode, event))
      Event.stop(event);
  },

  keyDown: function(event) {     
    if (this.currentTool == null)
     return;

    var keyCode = event.keyCode || event.which
    if (this.currentTool.keyDown(keyCode, event))
      Event.stop(event);
  },
  
  mouseOver: function(event) {   
    if (this.currentTool == null)
      return;
    
    var x = this._getX(event); 
    var y = this._getY(event);

    this.currentTool.mouseOver(x, y, event);
    Event.stop(event);
  },
  
  mouseOut: function(event) {   
    if (this.currentTool == null)
      return;
    
    this.currentTool.mouseOut(event);
    Event.stop(event);
  },
  
  scrollX: function() {
    var page = Position.page(this.element);       
    var offset = Position.cumulativeOffset(this.element);
    return offset[0] - page[0];
  },
  
  scrollY: function() {
    var page = Position.page(this.element);       
    var offset = Position.cumulativeOffset(this.element);
    return offset[1] - page[1];
  },
  
  _getX: function(event) {
    this.dimension = $(this.element).getDimensions();
    var scroll = getWindowScroll(window);
    var x = Event.pointerX(event) - this.offset[0] - scroll.left;    
    if (x < 0)
      x = 0;
    if (x > this.dimension.width)
      x = this.dimension.width;   
    return x;
  },
  
  _getY: function(event) {
    this.dimension = $(this.element).getDimensions();
    var scroll = getWindowScroll(window);    
    var y = Event.pointerY(event) - this.offset[1] - scroll.top;    
    if (y < 0)
      y = 0;
    if (y > this.dimension.height)
      y = this.dimension.height;   
    return y;
  }
}

