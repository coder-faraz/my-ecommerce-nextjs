export const Utility = () => {

  /**
   * Capitalize the first letter of a string and lowercase the rest.
   * @param {string} str - The string whose first letter is to be capitalized.
   * @returns {string|undefined} The transformed string, or undefined if input is falsy.
   */
  function capitalizeFirstLetter(str) {
    if (str) {
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
  }

  /**
   * Calculate the number of days elapsed since a given date.
   * @param {string} dateString - A date string parseable by Date().
   * @returns {number} The number of days since the given date.
   */
  function calculateDaysAgo(dateString) {
    const today = new Date();
    const pastDate = new Date(dateString);
    const diffTime = Math.abs(today.getTime() - pastDate.getTime());
    // Convert milliseconds to days and round up
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Debounce a function call by a specified delay.
   * @param {Function} func - The function to debounce.
   * @param {number} delay - The delay in milliseconds.
   * @returns {Function} A debounced version of the input function.
   */
  function debounceScroll(func, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  }

  /**
   * Format a date string into MM/DD/YYYY.
   * @param {string} dateString - A date string parseable by Date().
   * @returns {string} A formatted date, or "Invalid Date" for invalid input.
   */
  function formatDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) {
      return "Invalid Date";
    }
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  /**
   * Format a number or numeric string into Indian Rupee format.
   * @param {number|string} amount - The amount to format.
   * @returns {string} The formatted amount, prefixed with ₹.
   */
  function formatAmount(amount) {
    return `₹ ${new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
    }).format(amount)}`;
  }

  /**
   * Retrieve a parsed JSON value from localStorage.
   * @param {string} key - The localStorage key.
   * @returns {*} The parsed value, or null if not found or parse fails.
   */
  function getLocalStorage(key) {
    if (typeof window === "undefined") return null;
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  /**
   * Remove an item from localStorage.
   * @param {string} key - The localStorage key to remove.
   */
  function remLocalStorage(key) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }

  /**
   * Store a value in localStorage after serializing to JSON.
   * @param {string} key - The localStorage key.
   * @param {*} value - The value to store.
   */
  function setLocalStorage(key, value) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  };

  return {
    capitalizeFirstLetter,
    calculateDaysAgo,
    debounceScroll,
    formatDate,
    formatAmount,
    getLocalStorage,
    remLocalStorage,
    setLocalStorage
  };
};
