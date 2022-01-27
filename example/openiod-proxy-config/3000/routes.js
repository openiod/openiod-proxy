
var routes = [
  {
    path: '/',
    //controller: () => import('controller/')
    controller: function(req, res, next) {
  		console.log("app.all/: " + req.url );
  		//  res.header("Access-Control-Allow-Origin", "*");
  		//  res.header("Access-Control-Allow-Headers", "X-Requested-With");
      console.log('Headers:')
      console.dir(req.headers)
      console.log('Body:')
      console.dir(req.body)
      console.dir(req.params)
      console.dir(req.query)

  		next();
  	}
  }
]

// Always leave this as last one
//if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    controller: () => import('controller/default.js')
  })
//}
;

//export default routes
module.exports = {
  routes: routes
};
