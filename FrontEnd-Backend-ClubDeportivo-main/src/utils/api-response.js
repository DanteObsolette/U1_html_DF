function success(res, message, data = null, status = 200) {
  return res.status(status).json({
    ok: true,
    message,
    data
  });
}

function fail(res, message, status = 400, errors = null) {
  return res.status(status).json({
    ok: false,
    message,
    errors
  });
}

module.exports = { success, fail };
