const { generateToken } = require('../../../utils/session-token');
const { passwordMatched } = require('../../../utils/password');
const authenticationRepository = require('./authentication-repository');

// Simpan percobaan login yang gagal dalam memori
const failedLoginAttempts = {};

/**
 * Check username and password for login.
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {object} An object containing, among others, the JWT token if the email and password are matched. Otherwise returns null.
 */
async function checkLoginCredentials(email, password) {
  // Cek apakah sudah ada percobaan login gagal untuk email ini
  if (failedLoginAttempts[email] >= 5) {
    return {
      error: 'Too many failed login attempts. Please try again in 30 minutes.',
      status: 403, // Forbidden
      remainingAttempts: 0, // Tidak ada sisa kesempatan login
    };
  }

  const user = await authenticationRepository.getUserByEmail(email);

  const userPassword = user ? user.password : '<RANDOM_PASSWORD_FILLER>';
  const passwordChecked = await passwordMatched(password, userPassword);

  if (user && passwordChecked) {
    // Reset counter login attempts
    delete failedLoginAttempts[email];

    return {
      email: user.email,
      name: user.name,
      user_id: user.id,
      token: generateToken(user.email, user.id),
      remainingAttempts: 5, // Reset to maximum attempts
    };
  } else {
    // Jika login gagal, tambahkan percobaan login yang gagal
    failedLoginAttempts[email] = (failedLoginAttempts[email] || 0) + 1;
    const remainingAttempts = 5 - (failedLoginAttempts[email] || 0);
    return {
      error: 'Wrong email or password',
      status: 403, // Forbidden
      remainingAttempts: remainingAttempts,
    };
  }
}

module.exports = {
  checkLoginCredentials,
};
