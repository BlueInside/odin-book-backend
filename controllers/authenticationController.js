const asyncHandler = require('express-async-handler');

const register = asyncHandler(async (req, res, next) => {
  const registerData = req.body;
  res.status(201).send(`POST /register/ not implemented`);
});

const login = asyncHandler(async (req, res, next) => {
  const loginData = req.body;
  res.status(200).send(`POST /login/ not implemented`);
});

const logout = asyncHandler(async (req, res, next) => {
  res.status(200).send(`POST /logout/ not implemented`);
});

module.exports = { register, login, logout };
