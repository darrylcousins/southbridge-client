'use strict';

const fs = require('fs');
const express = require('express');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const morgan = require('morgan'); // http request logger
const winston = require('./winston-config'); // logger

global._logger = winston;

module.exports = function startServer(PORT, PATH, callback) {
  const app = express();
  const server = http.createServer(app);

  // brunch compiled static files
  app.use(express.static(path.join(__dirname, PATH)));

  app.use(bodyParser.urlencoded({ extended: true }));

  // set templating engine
  app.set('view engine', 'ejs');

  // logging
  app.use(morgan('dev', { stream: winston.stream })); // simple

  const useCrank = (req, res, next) => {
    const name = req.route.path.slice(1);
    let tpl;
    if (name === "") {
      tpl = "pages/index";
    } else {
      tpl = `pages/${name}`;
    }
    const tpl_path = path.join(__dirname, "views", `${tpl}.ejs`);
    _logger.info(`${name} ${tpl} ${tpl_path}`);
    if (!fs.existsSync(tpl_path)) {
      next();
      return;
    } else {
      res.render(tpl,
        (err, html) => {
          if (err) next(err);
          res.send(html);
        }
      )
    }
  };

  app.get('/', useCrank);
  app.get('/apples-sansa', useCrank);
  app.get('/small-box', useCrank);

  // render 404 page
  app.use(function (req, res, next) {
    res.status(404).render('pages/notfound',
      (err, html) => {
        if (err) next(err);
        res.send(html);
      }
    )
  })

  // error handler https://www.digitalocean.com/community/tutorials/how-to-use-winston-to-log-node-js-applications
  app.use(function(err, req, res, next) {
    _logger.info('error', err);
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page - see above code for 404 to render a view
    res.locals.status = err.status || 500;
    res.status(res.locals.status);
    res.render('pages/error');
  });

  server.listen(PORT, () => {
    _logger.info(`Server started on port ${server.address().port}`);
    callback();
  });
};
