// API configs

const functions = require("firebase-functions");
const app = require("express")(); // npm i express
const FBAuth = require("./util/fbAuth");

const cors = require("cors");
app.use(cors());

const { db } = require("./util/admin");

//  Import Routes

const {
  getPosts,
  createPost,
  getPost,
  postComment,
  deletePost,
  postLike,
} = require("./handlers/posts");
const {
  signUp,
  login,
  uploadImage,
  addUserDetails,
  getMyUserDetails,
  getUserDetail,
  markNotificationsRead,
} = require("./handlers/users");

//
//
//
//                              App Routes
//
//
//
//

app.get("/posts", getPosts);
app.post("/create", FBAuth, createPost);
app.get("/post/:postId", getPost);
app.post("/post/:postId/comment", FBAuth, postComment);
app.get("/post/:postId/like", FBAuth, postLike);
app.delete("/post/:postId", FBAuth, deletePost);

app.post("/signup", signUp);
app.post("/login", login);

app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getMyUserDetails);
app.get("/user/:handle", getUserDetail);
app.post("/notifications", FBAuth, markNotificationsRead);

exports.api = functions.region("europe-west1").https.onRequest(app);

exports.createNotificationOnLike = functions
  .region("europe-west1")
  .firestore.document("likes/{id}")
  .onCreate(async (snapshot) => {
    try {
      const doc = await db.doc(`/posts/${snapshot.data().postId}`).get();
      if (doc.exists && doc.data().user !== snapshot.data().user) {
        return db.doc(`/notifications/${snapshot.id}`).set({
          createdAt: new Date().toISOString(),
          recipient: doc.data().user,
          sender: snapshot.data().user,
          type: "like",
          read: false,
          postId: doc.id,
        });
      }
    } catch (err) {
      console.error(err);
    }
  });

exports.createNotificationOnComment = functions
  .region("europe-west1")
  .firestore.document("comments/{id}")
  .onCreate(async (snapshot) => {
    try {
      const doc = await db.doc(`/posts/${snapshot.data().postId}`).get();
      if (doc.exists && doc.data().user !== snapshot.data().user) {
        return db.doc(`/notifications/${snapshot.id}`).set({
          createdAt: new Date().toISOString(),
          recipient: doc.data().user,
          sender: snapshot.data().user,
          type: "comment",
          read: false,
          postId: doc.id,
        });
      }
    } catch (err) {
      console.error(err);
    }
  });

exports.deleteNotificationOnUnlike = functions
  .region("europe-west1")
  .firestore.document("likes/{id}")
  .onDelete(async (snapshot) => {
    try {
      return db.doc(`/notifications/${snapshot.id}`).delete();
    } catch (err) {
      console.error(err);
    }
  });

exports.onUserImageChange = functions
  .region("europe-west1")
  .firestore.document("/users/{id}")
  .onUpdate(async (change) => {
    if (change.before.data().imageURL !== change.after.data().imageURL) {
      const batch = db.batch();

      const data = await db
        .collection("posts")
        .where("user", "==", change.before.data().handle)
        .get();
      data.forEach((doc) => {
        const post = db.doc(`/posts/${doc.id}`);
        batch.update(post, { userImage: change.after.data().imageURL });
      });
      return batch.commit();
    } else return true;
  });

exports.onPostDelete = functions
  .region("europe-west1")
  .firestore.document("/posts/{id}")
  .onDelete(async (snapshot, context) => {
    const postId = context.params.id;

    const batch = db.batch();
    try {
      console.log("post İD : ", postId);
      const data = await db
        .collection("comments")
        .where("postId", "==", postId)
        .get();
      data.forEach((doc) => {
        batch.delete(db.doc(`/comments/${doc.id}`));
      });
      const data_1 = await db
        .collection("likes")
        .where("postId", "==", postId)
        .get();
      data_1.forEach((doc_1) => {
        batch.delete(db.doc(`/likes/${doc_1.id}`));
      });
      const data_2 = await db
        .collection("notifications")
        .where("postId", "==", postId)
        .get();
      data_2.forEach((doc_2) => {
        batch.delete(db.doc(`/notifications/${doc_2.id}`));
      });
      return batch.commit();
    } catch (err) {
      console.error(err);
    }
  });
