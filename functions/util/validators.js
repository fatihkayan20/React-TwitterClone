// email validation
const isEmail = (email) => {
  const regEx = /^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z_ğüşıöç]{2,6}(?:\.[a-z_ğüşıöç]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/;
  if (email.match(regEx)) return true;
  else return false;
};

// Empty validation
const isEmpty = (string) => {
  if (string.trim() === "") return true;
  else return false;
};

const isWebSite = (string) => {
  if (string.split(".").length > 1) return true;
  else return false;
};

exports.validateSignupData = (data) => {
  let errors = {};
  if (isEmpty(data.email)) {
    errors.email = "Email must not be empty";
  }
  if (!isEmail(data.email)) {
    errors.email = "Email is not valid";
  }

  // Password validation
  if (isEmpty(data.password)) {
    errors.password = "Password must not be empty";
  }
  if (isEmpty(data.password2)) {
    errors.password2 = "Confirm Password must not be empty";
  }
  if (data.password !== data.password2) {
    errors.passwordConfirm = "Passwords must match";
  }

  if (isEmpty(data.handle)) {
    errors.username = "Username must not be empty";
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

exports.validateLoginData = (data) => {
  let errors = {};

  if (!isEmail(data.email)) errors.email = "Email is badly formated ";

  if (isEmpty(data.email)) errors.email = "Email required";
  if (isEmpty(data.password)) errors.password = "Password required";

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

exports.reduceUserDetails = (data) => {
  let userDetails = {};
  let error = {};

  if (!isEmpty(data.bio.trim())) userDetails.bio = data.bio;

  if (!isEmpty(data.website.trim())) {
    if (!isWebSite(data.website)) {
      error.website = "This website is not valid";
    } else if (data.website.trim().substring(0, 4) !== "http") {
      userDetails.website = `https://${data.website.trim()}`;
    } else {
      userDetails.website = data.website.trim();
    }
  }

  if (!isEmpty(data.location.trim())) {
    userDetails.location = data.location;
  }

  return {
    error,
    userDetails,
  };
};
