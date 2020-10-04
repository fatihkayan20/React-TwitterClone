const { db, admin } = require("../util/admin");
const firebase = require("firebase");

const config = require("../util/config");
firebase.initializeApp(config);

const {
  validateSignupData,
  validateLoginData,
  reduceUserDetails,
} = require("../util/validators");

exports.signUp = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    password2: req.body.password2,
    handle: req.body.handle,
  };

  const { valid, errors } = validateSignupData(newUser);

  if (!valid) return res.status(400).json(errors);

  const noIMG = "user-3331257_1280.png";

  let token, userId;

  db.doc(`/users/${newUser.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({ error: "This username already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((tokenn) => {
      token = tokenn;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        imageURL: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noIMG}?alt=media`,
        createdAt: new Date().toISOString(),
        userId,
      };
      return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(200).json({ token });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.message });
    });
};

exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  const { valid, errors } = validateLoginData(user);

  if (!valid) return res.status(400).json(errors);

  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        return res.status(500).json({ Invalid: "Username or password" });
      } else {
        return res.status(500).json({ error: err.message });
      }
    });
};

exports.uploadImage = (req, res) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  const busboy = new BusBoy({ headers: req.headers });

  let imageFileName;
  let imageToBeUploaded = {};

  busboy.on("file", (fieldname, file, filename, encoding, minetype) => {
    if (minetype !== "image/jpeg" && minetype !== "image/png") {
      return res.status(400).json({ error: "Wrong file type" });
    }
    //img.( png ? jpg)
    const imageExtension = filename.split(".")[filename.split(".").length - 1];

    //534654654654.png
    imageFileName = `${Math.round(
      Math.random() * 1000000000000000
    )}.${imageExtension}`;

    const filepath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = { filepath, minetype };
    file.pipe(fs.createWriteStream(filepath));
  });

  busboy.on("finish", () => {
    admin
      .storage()
      .bucket()
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.minetype,
          },
        },
      })
      .then(() => {
        const imageURL = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
        return db.doc(`/users/${req.user.handle}`).update({ imageURL });
      })
      .then(() => {
        return res.json({ message: "Image uploaded successfully" });
      })
      .catch((err) => {
        console.error(err);
        return res.status(400).json(err.message);
      });
  });
  busboy.end(req.rawBody);
};

exports.addUserDetails = (req, res) => {
  const { userDetails, error } = reduceUserDetails(req.body);
  if (Object.keys(error).length > 0) {
    return res.status(400).json({ error: error.website });
  }
  db.doc(`/users/${req.user.handle}`)
    .update(userDetails)
    .then(() => {
      return res
        .status(400)
        .json({ message: "Detail updated was successfully" });
    })
    .catch((err) => {
      console.error(err);
      return res.status(400).json({ error: err.message });
    });
};

exports.getMyUserDetails = (req, res) => {
  let userData = {};
  db.doc(`/users/${req.user.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        userData.credentials = doc.data();
        return db
          .collection("likes")
          .where("user", "==", req.user.handle)
          .get();
      }
    })
    .then((data) => {
      userData.likes = [];
      data.forEach((doc) => {
        userData.likes.push(doc.data());
      });
      return db
        .collection("notifications")
        .where("recipient", "==", req.user.handle)
        .orderBy("createdAt", "DESC")
        .limit(10)
        .get();
    })
    .then((data) => {
      userData.notifications = [];
      data.forEach((doc) => {
        userData.notifications.push({
          notificationId: doc.id,
          ...doc.data(),
        });
      });
      return res.json(userData);
    })
    .catch((err) => {
      console.error(err);
      return res.status(400).json({ error: err.message });
    });
};

exports.getUserDetail = (req, res) => {
  let userData = {};

  db.doc(`/users/${req.params.handle}`)
    .get()
    .then((doc) => {
      console.log(doc.data());
      if (doc.exists) {
        userData.user = doc.data();
        return db
          .collection("posts")
          .where("user", "==", req.params.handle)
          .orderBy("createdAt", "desc")
          .get();
      } else {
        return res.status(400).json({ error: "User does not exists" });
      }
    })
    .then((data) => {
      userData.posts = [];
      data.forEach((doc) => {
        userData.posts.push({
          postID: doc.id,
          ...doc.data(),
        });
      });
      return res.json(userData);
    })
    .catch((err) => {
      console.error(err);
      return res.status(400).json({ error: err.message });
    });
};

exports.markNotificationsRead = (req, res) => {
  let batch = db.batch();
  req.body.forEach((notificationId) => {
    const notification = db.doc(`/notifications/${notificationId}`);
    batch.update(notification, { read: true });
  });
  batch
    .commit()
    .then(() => {
      return res.json({ message: "Notifications marked read" });
    })
    .catch((err) => {
      console.error(err);
      return res.status(400).json({ error: err.message });
    });
};
