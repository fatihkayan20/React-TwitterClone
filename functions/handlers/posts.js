const { db } = require("../util/admin");

exports.getPosts = (req, res) => {
  db.collection("posts")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let posts = [];
      data.forEach((doc) => {
        posts.push({
          postID: doc.id,
          userImage: doc.data().userImage,
          ...doc.data(),
        });
      });
      return res.json(posts);
    })
    .catch((err) => console.error(err));
};

exports.createPost = (req, res) => {
  if (req.body.body.trim() === "") {
    return res.status(400).json({ body: "Must not be empty" });
  }

  const newPost = {
    body: req.body.body,
    user: req.user.handle,
    userImage: req.user.imageUrl,
    createdAt: new Date().toISOString(),
    likeCount: 0,
    commentCount: 0,
  };
  db.collection("posts")
    .add(newPost)
    .then((doc) => {
      const resPost = newPost;
      resPost.postID = doc.id;
      res.json(resPost);
    })
    .catch((err) => {
      res.status(500).json({ error: "Something went wrong" });
      console.error(err);
    });
};

exports.getPost = (req, res) => {
  let postData = {};
  db.doc(`/posts/${req.params.postId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(400).json({ error: "Not Found" });
      }
      postData = doc.data();
      postData.postID = doc.id;

      return db
        .collection("comments")
        .orderBy("createdAt", "desc")
        .where("postId", "==", req.params.postId)
        .get();
    })
    .then((data) => {
      postData.comments = [];
      data.forEach((doc) => {
        postData.comments.push(doc.data());
      });
      return res.json(postData);
    })
    .catch((err) => {
      console.error(err);
      res.json({ error: err.message });
    });
};

exports.postComment = (req, res) => {
  if (req.body.body.trim() === "")
    return res.status(400).json({ error: "Comment must not be empty" });

  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    postId: req.params.postId,
    user: req.user.handle,
    userImage: req.user.imageUrl,
  };

  db.doc(`/posts/${req.params.postId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(400).json({ error: "Post does not exists" });
      }
      return doc.ref.update({ commentCount: doc.data().commentCount + 1 });
    })
    .then(() => {
      return db.collection("comments").add(newComment);
    })
    .then(() => {
      res.json(newComment);
    })
    .catch((err) => {
      console.error(err);
      req.json({ error: err.message });
    });
};

exports.postLike = (req, res) => {
  const likeDocument = db
    .collection("likes")
    .where("user", "==", req.user.handle)
    .where("postId", "==", req.params.postId)
    .limit(1);

  const postDoc = db.doc(`/posts/${req.params.postId}`);

  let postData = {};

  postDoc
    .get()
    .then((doc) => {
      if (doc.exists) {
        postData = doc.data();
        postData.postID = doc.id;
        return likeDocument.get();
      } else {
        return res.status(400).json({ error: "Post Not Found" });
      }
    })
    .then((data) => {
      if (data.empty) {
        return db
          .collection("likes")
          .add({
            postId: req.params.postId,
            user: req.user.handle,
          })
          .then(() => {
            postData.likeCount++;
            return postDoc.update({
              likeCount: postData.likeCount,
            });
          })
          .then(() => {
            return res.json(postData);
          });
      } else {
        return db
          .doc(`/likes/${data.docs[0].id}`)
          .delete()
          .then(() => {
            postData.likeCount--;
            return postDoc.update({ likeCount: postData.likeCount });
          })
          .then(() => {
            res.json(postData);
          });
      }
    })
    .catch((err) => {
      console.error(err);
      return res.status(400).json({ error: err.message });
    });
};

exports.deletePost = (req, res) => {
  const document = db.doc(`/posts/${req.params.postId}`);
  document
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(400).json({ error: "Post Not Found" });
      }
      if (doc.data().user !== req.user.handle) {
        return res.status(400).json({ error: "You cant do this" });
      } else {
        return document.delete();
      }
    })
    .then(() => {
      res.json({ message: "Post deleted successfully" });
    })
    .catch((err) => {
      console.error(err);
      res.json({ error: err.message });
    });
};
