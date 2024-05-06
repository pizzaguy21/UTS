const usersRepository = require('./users-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');

// Simpan percobaan login yang gagal dalam memori
const failedLoginAttempts = {};

/**
 * Get list of users with filtering, sorting, and pagination
 * @param {object} options - Options for filtering, sorting, and pagination
 * @param {number} options.pageNumber - Page number
 * @param {number} options.pageSize - Page size
 * @param {string} options.searchTerm - Search term to filter users by email
 * @param {string} options.sortBy - Field to sort by
 * @param {string} options.sortOrder - Sort order ('asc' or 'desc')
 * @returns {Array}
 */
async function getFilteredUsers({
  pageNumber = 1,
  pageSize = 10,
  searchTerm = '',
  sortBy = 'email',
  sortOrder = 'asc',
}) {
  const users = await usersRepository.getUsers(); // Ambil semua pengguna dari repositori

  // Filter pengguna berdasarkan searchTerm (jika disediakan)
  const filteredUsers = searchTerm
    ? users.filter((user) => user.email.includes(searchTerm))
    : users;

  // Lakukan sorting berdasarkan sortBy dan sortOrder
  filteredUsers.sort((a, b) => {
    const compareValueA = a[sortBy].toLowerCase();
    const compareValueB = b[sortBy].toLowerCase();
    if (compareValueA < compareValueB) return sortOrder === 'asc' ? -1 : 1;
    if (compareValueA > compareValueB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Hitung total jumlah pengguna
  const totalCount = filteredUsers.length;

  // Potong hasil berdasarkan pagination
  const startIndex = (pageNumber - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Bentuk objek respons sesuai dengan format yang diinginkan
  const response = {
    page_number: pageNumber,
    page_size: pageSize,
    count: paginatedUsers.length,
    total_pages: Math.ceil(totalCount / pageSize),
    has_previous_page: pageNumber > 1,
    has_next_page: endIndex < totalCount,
    data: paginatedUsers.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
    })),
  };

  return response;
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Object}
 */
async function getUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {boolean}
 */
async function createUser(name, email, password) {
  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    await usersRepository.createUser(name, email, hashedPassword);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {boolean}
 */
async function updateUser(id, name, email) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.updateUser(id, name, email);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {boolean}
 */
async function deleteUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.deleteUser(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Check whether the email is registered
 * @param {string} email - Email
 * @returns {boolean}
 */
async function emailIsRegistered(email) {
  const user = await usersRepository.getUserByEmail(email);

  if (user) {
    return true;
  }

  return false;
}

/**
 * Check whether the password is correct
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function checkPassword(userId, password) {
  const user = await usersRepository.getUser(userId);

  // Jika pengguna tidak ditemukan, kembalikan false
  if (!user) {
    return {
      success: false,
      message: 'Invalid credentials',
      attemptCount: 0,
    };
  }

  // Periksa apakah password cocok
  const isPasswordMatched = await passwordMatched(password, user.password);

  // Jika password tidak cocok, tambahkan percobaan login yang gagal
  if (!isPasswordMatched) {
    failedLoginAttempts[user.email] =
      (failedLoginAttempts[user.email] || 0) + 1;
    console.log(
      `[${getCurrentDateTime()}] User ${user.email} gagal login. Attempt = ${failedLoginAttempts[user.email]}.`
    );
  } else {
    // Jika password cocok, reset attemptCount
    failedLoginAttempts[user.email] = 0;
  }

  return {
    success: isPasswordMatched,
    message: isPasswordMatched ? 'Login successful' : 'Wrong email or password',
    attemptCount: failedLoginAttempts[user.email] || 0,
  };
}

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function changePassword(userId, password) {
  const user = await usersRepository.getUser(userId);

  // Check if user not found
  if (!user) {
    return null;
  }

  const hashedPassword = await hashPassword(password);

  const changeSuccess = await usersRepository.changePassword(
    userId,
    hashedPassword
  );

  if (!changeSuccess) {
    return null;
  }

  return true;
}

/**
 * Get current date and time in a formatted string
 * @returns {string} Formatted date and time string
 */
function getCurrentDateTime() {
  const now = new Date();
  return now.toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

module.exports = {
  getFilteredUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  emailIsRegistered,
  checkPassword,
  changePassword,
};
