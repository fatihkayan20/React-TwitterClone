import Axios from "axios";
import {
  SET_SCREAMS,
  LOADING_DATA,
  LIKE_SCREAM,
  UNLIKE_SCREAM,
  DELETE_SCREAM,
  LOADING_UI,
  POST_SCREAM,
  CLEAR_ERRORS,
  SET_ERRORS,
  SET_SCREAM,
  STOP_LOADING_UI,
  SUBMIT_COMMENT,
} from "../types";

// Get All Posts
export const getScreams = () => (dispatch) => {
  dispatch({
    type: LOADING_DATA,
  });

  Axios.get("/posts")
    .then((res) => {
      dispatch({
        type: SET_SCREAMS,
        payload: res.data,
      });
    })
    .catch((err) => {
      console.log(err.message);
    });
};

// Get Single Post

export const getScream = (postID) => (dispatch) => {
  dispatch({
    type: LOADING_UI,
  });

  Axios.get(`/post/${postID}`)
    .then((res) => {
      dispatch({
        type: SET_SCREAM,
        payload: res.data,
      });
      dispatch({
        type: STOP_LOADING_UI,
      });
    })
    .catch((err) => {
      dispatch({ type: SET_SCREAMS, payload: [] });
    });
};

// Create a Post
export const postScream = (newScream) => (dispatch) => {
  dispatch({ type: LOADING_UI });
  Axios.post("/create", newScream)
    .then((res) => {
      dispatch({ type: CLEAR_ERRORS });
      dispatch({ type: POST_SCREAM, payload: res.data });
    })
    .catch((err) => {
      dispatch({
        type: SET_ERRORS,
        payload: err.response.data,
      });
    });
};

// Like a post
export const likePost = (postID) => (dispatch) => {
  Axios.get(`/post/${postID}/like`)
    .then((res) => {
      dispatch({
        type: LIKE_SCREAM,
        payload: res.data,
      });
    })
    .catch((err) => console.log(err.message));
};
//UnLike a Posts
export const unlikePost = (postID) => (dispatch) => {
  Axios.get(`/post/${postID}/like`)
    .then((res) => {
      dispatch({
        type: UNLIKE_SCREAM,
        payload: res.data,
      });
    })
    .catch((err) => console.error(err));
};

// Submit a Comment
export const submitComment = (postID, commentData) => (dispatch) => {
  Axios.post(`/post/${postID}/comment`, commentData)
    .then((result) => {
      dispatch({ type: CLEAR_ERRORS });
      dispatch({
        type: SUBMIT_COMMENT,
        payload: result.data,
      });
    })
    .catch((err) => {
      dispatch({ type: SET_ERRORS, payload: err.response.data });
      console.error(err.message);
    });
};

// Delete Post
export const deletePost = (postID) => (dispatch) => {
  Axios.delete(`/post/${postID}`)
    .then(() => {
      dispatch({
        type: DELETE_SCREAM,
        payload: postID,
      });
    })
    .catch((err) => console.error(err));
};

// User Page

// Get User Data
export const getUserData = (user) => (dispatch) => {
  dispatch({ type: LOADING_DATA });
  Axios.get(`/user/${user}`)
    .then((result) => {
      dispatch({ type: SET_SCREAMS, payload: result.data.posts });
    })
    .catch(() => {
      dispatch({ type: SET_SCREAMS, payload: [] });
    });
};
