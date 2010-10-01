// Add a new assert method for checking matrix values
Object.extend(Test.Unit.Testcase.prototype, {
  assertMatrix: function(excepted, matrix) {
    if (excepted instanceof Matrix) 
      excepted = excepted.hashValues();

    $H(excepted).each(function(v){
      this.assertEqual(v[1].toFixed(8), matrix[v[0]].toFixed(8));
    }.bind(this));
  },
  
  assertShapeAttribute: function(values, shape) { 
    //console.log(shape.attributes);
    $H(values).keys().each(function(key){   
      this.assertEqual(values[key], shape.attributes[key]);
    }.bind(this));
  }
});
