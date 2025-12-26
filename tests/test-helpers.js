
module.exports = {
  randomMetricType,
  now,
};

function randomMetricType(context, events, done) {
  const types = ['cpu', 'memory', 'disk', 'network'];
  context.vars.metricType = types[Math.floor(Math.random() * types.length)];
  return done();
}

function now(context, events, done) {
  context.vars.timestamp = new Date().toISOString();
  return done();
}