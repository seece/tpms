
/*
 * GET home page.
 */

exports.index = function(req, res){
	console.log("index get");
  res.render('index', { title: 'Express' })
};
