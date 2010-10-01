var DisplayFunction = null;      
var CurrentRenderer = null; 

function setCookie(name, value, expires, path, domain, secure) {
  document.cookie= name + "=" + escape(value) +
    ((expires) ? "; expires=" + expires.toGMTString() : "") +
    ((path) ? "; path=" + path : "") +
    ((domain) ? "; domain=" + domain : "") +
    ((secure) ? "; secure" : "");
}

function getCookie(name) {
  var dc = document.cookie;
  var prefix = name + "=";
  var begin = dc.indexOf("; " + prefix);
  if (begin == -1) {
    begin = dc.indexOf(prefix);
    if (begin != 0) return null;
  } else {
    begin += 2;
  }
  var end = document.cookie.indexOf(";", begin);
  if (end == -1) {
    end = dc.length;
  }
  return unescape(dc.substring(begin + prefix.length, end));
}

function selectRenderer(a) {
  var rendererName = a.innerHTML;
  var current = $$("a.selected").first();
  current.removeClassName("selected");
  current.addClassName("unselected");
  
  $(a).removeClassName("unselected");
  $(a).addClassName("selected");
  if (CurrentRenderer)
    CurrentRenderer.destroy();

  setCookie("renderer", rendererName);    
  initDisplay();
}   

function initDisplay() {        
  var r = $$("a.selected").first().innerHTML;
  switch (r) {
    case 'VML':
      CurrentRenderer = new Graphic.VMLRenderer("whiteboard"); 
      break;
    case 'SVG':
      CurrentRenderer = new Graphic.SVGRenderer("whiteboard"); 
      break;
    case 'Canvas':
      CurrentRenderer = new Graphic.CanvasRenderer("whiteboard"); 
      break;
  } 
  DisplayFunction(CurrentRenderer)
} 

function addSelectRenderer(displayFunction, doNotAddPGFLink) { 
  DisplayFunction = displayFunction;
  
  var cookie = getCookie("renderer");
  if (!cookie) {
    if (Graphic.rendererSupported("VML"))
      cookie = 'VML';
    else if (Graphic.rendererSupported("SVG"))
      cookie = 'SVG';
    else if (Graphic.rendererSupported("Canvas"))
      cookie = 'Canvas';
  }         
  if (!cookie) {
    var html = "Renderer : VML, SVG and Canvas not supported by your browser";
  } 
  else {    
    var html = "Select Renderer : ";
    if (!Graphic.rendererSupported("SVG")) 
      html += "<span class='disabled'>SVG</span>"
    else
      html += "<a href='#' onclick='selectRenderer(this)' class='" + (cookie.toLowerCase() == 'svg' ? "selected" : "unselected") +"'>SVG</a>"
        
    if (!Graphic.rendererSupported("VML"))  
      html += "<span class='disabled'>VML</span>"
    else
      html += "<a href='#' onclick='selectRenderer(this)' class='" + (cookie.toLowerCase() == 'vml' ? "selected" : "unselected") + "'>VML</a>"
    if (!Graphic.rendererSupported("Canvas"))  
      html += "<span class='disabled'>Canvas</span>"
    else
      html += "<a href='#' onclick='selectRenderer(this)' class='" + (cookie.toLowerCase() == 'canvas' ? "selected" : "unselected") + "'>Canvas</a>"
      
    html += "<br class='clear'/><br/>";
    if (!doNotAddPGFLink) 
      html += "Check out <a href='http://prototype-graphic.xilinus.com/'>PGF website</a>  to see supported features for the selected renderer<br/>"
      html += "<script type=\"text/javascript\">Event.observe(window, 'load', initDisplay)</script>";                                              
  }
  setCookie("renderer", cookie);    
  document.writeln(html);     
} 

function SVGorVMLRenderer(id) {
  var renderer = null;         
  if (Graphic.rendererSupported("VML"))
    renderer = new Graphic.VMLRenderer("whiteboard"); 
  else {
    if (Graphic.rendererSupported("SVG")) 
      renderer = new Graphic.SVGRenderer("whiteboard"); 
    else
      alert("No SVG or VML renderers available for your browser")
  }
  return renderer;
}

function CanvasRenderer() {
  var renderer = null;
  if (Graphic.rendererSupported("Canvas"))
    renderer = new Graphic.CanvasRenderer("whiteboard"); 
  return renderer;
}

function randomColor() {     
  var r = Math.floor(255 * Math.random());
  var g = Math.floor(255 * Math.random());
  var b = Math.floor(255 * Math.random());
  var a = 128 + Math.floor(128 * Math.random());
  return  {r: r, g: g, b: b, a: a}
}  

function getFill(index, nb, alpha) {     
  var r = Math.floor(index / nb * 255);
  var g = Math.floor(index / nb * 255 + 128) % 256;
  var b = Math.floor(index / nb * 255 + 64) % 256;       
  var a = alpha || 255;
  return  {r: r, g: g, b: b, a: a}
}  

function getStroke(index, nb, width) {     
  var r = Math.floor(index / nb * 255 + 128) % 256;           
  var g = Math.floor(index / nb * 255 + 64) % 256;
  var b = Math.floor(index / nb * 255 ) % 256;       
  var a = 255;
  return  {r: r, g: g, b: b, a: a, w: width || 1 }
}  

function rectangleTest(renderer, nbShapes) {  
  nbShapes = nbShapes || 15;             
  for (var index = 0; index < nbShapes; index++) {
    var angle = 180 / nbShapes * index;
    var shape = new Graphic.Rectangle(renderer); 
    shape.setFill(getFill(index, nbShapes));
    shape.setStroke(getStroke(index, nbShapes));
    shape.setBounds(0, 0, 15, 200);
    shape.translate(130, 30);
    shape.rotate(angle);
    shape.setID("rectangle_" + index)
    renderer.add(shape);  
  }
}

function ellipseTest(renderer, nbShapes) { 
  nbShapes = nbShapes || 15;             
  for (var index = 0; index < nbShapes; index++) {
    var angle = 180 / nbShapes * index;
    var shape = new Graphic.Ellipse(renderer);
    shape.setFill(getFill(index, nbShapes));
    shape.setStroke(getStroke(index, nbShapes));
    shape.setBounds(0, 0, 15, 200);
    shape.translate(380, 30);
    shape.rotate(angle);
  
    renderer.add(shape);  
  }
}      

function circleTest(renderer, nbShapes) { 
  nbShapes = nbShapes || 15;             
  var index = 0;
  for (var index = 0; index < nbShapes; index++) {
    var angle = 360 / nbShapes * index;
    var shape = new Graphic.Circle(renderer);
    shape.setFill(getFill(index, nbShapes, 128));
    shape.setStroke(getStroke(index, nbShapes));
    shape.setBounds(0, 0, 100, 100);
    shape.translate(600 + 50 * Math.cos(degToRad(angle)), 80 + 50 * Math.sin(degToRad(angle)));
  
    renderer.add(shape);  
  }
}      

function polygonTest(renderer, nbShapes) {       
  nbShapes = nbShapes || 15;             
  var index = 0;
  
  for (var index = 0; index < nbShapes; index++) {
    var angle = 360 / nbShapes * index;
    var shape = new Graphic.Polygon(renderer);
   
    // Draw an arrow
    shape.addPoints([[0, 50],[100, 50],[100, 0],[150, 75], [100, 150], [100, 100],[0, 100]]);
  
    shape.setFill(getFill(index, nbShapes));
    shape.setStroke(getStroke(index, nbShapes));
    shape.setBounds(0, 0, 80 , 80);
    shape.translate(130, 350);

    shape.rotate(angle, 0, 0);
    
    renderer.add(shape);  
  }
}                          

function polylineTest(renderer, nbShapes) {       
  nbShapes = nbShapes || 15;             
  var index = 0;
  
  for (var index = 0; index < nbShapes; index++) {
    var angle = 360 / nbShapes * index;
    var shape = new Graphic.Polyline(renderer);
   
    // Draw an arrow
    shape.addPoints([[0, 50],[100, 50],[100, 0],[150, 75], [100, 150], [100, 100],[0, 100]]);
  
    shape.setStroke(getStroke(index, nbShapes, 5));
    shape.setBounds(0, 0, 80 , 80);
    shape.translate(380, 350);

    shape.rotate(angle, 0, 0);
    
    renderer.add(shape);  
  }
}            

function lineTest(renderer, nbShapes) {       
  nbShapes = (nbShapes || 15 )*3;     
  var index = 0;
  for (var index = 0; index < nbShapes; index++) {
    var angle = 360 / nbShapes * index;
    var shape = new Graphic.Line(renderer);
   
    shape.setPoints(0, 10, 0, 90);
  
    shape.setFill(getFill(index, nbShapes));
    shape.setStroke(getStroke(index, nbShapes));  
    shape.translate(640, 350);

    shape.rotate(angle, 0, 0);
    
    renderer.add(shape);  
  }
}                          

function textTest(renderer, nbShapes) { 
  nbShapes = nbShapes || 15;             
  
  for (var index = 0; index < nbShapes; index++) {
    var angle = 360 / nbShapes * index;
    var shape = new Graphic.Text(renderer); 
    shape.setTextValue("Hello World!");
    shape.setFill(getFill(index, nbShapes));
    shape.setStroke(getStroke(index, nbShapes, 1));
    shape.setBounds(0, 30, 15, 10);
    shape.translate(130, 600);

    shape.rotate(angle, 0, 0);
    shape.setID("text_" + index)
    renderer.add(shape); 
  }
}

function imageTest(renderer, nbShapes) { 
  for (var index = 0; index < nbShapes; index++) {
    var shape = new Graphic.Image(renderer); 
    shape.setSource("images/pgf.png", true);
    shape.translate(260 + index*10, 500 + index*40);
    renderer.add(shape); 
  }
}


function displayRenderingTime(time) {
  if ($('info'))
    $('info').update("( Rendering time : " + time + "ms )");
} 

function allTests(renderer, nbShapes) {   
  var start = new Date().getTime();
  rectangleTest(renderer, nbShapes);
  ellipseTest(renderer, nbShapes);   
  circleTest(renderer, nbShapes);
  polygonTest(renderer, nbShapes);
  polylineTest(renderer, nbShapes); 
  lineTest(renderer, nbShapes*3);
  textTest(renderer, nbShapes);
  imageTest(renderer, 5);
  
  renderer.draw();  
  var end = new Date().getTime();
  return end - start;
}