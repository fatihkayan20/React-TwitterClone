import {
  SET_SCREAMS,
  LIKE_SCREAM,
  UNLIKE_SCREAM,
  LOADING_DATA,
  DELETE_SCREAM,
  POST_SCREAM,
  SET_SCREAM,
  SUBMIT_COMMENT,
} from "../types";

const initialState = {
  screams: [],
  scream: {},
  loading: false,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOADING_DATA:
      return {
        ...state,
        loading: true,
      };

    case SET_SCREAMS:
      return {
        ...state,
        screams: action.payload,
        loading: false,
      };

    case SET_SCREAM:
      return {
        ...state,
        scream: action.payload,
      };

    case LIKE_SCREAM:
    case UNLIKE_SCREAM:
      let index = state.screams.findIndex(
        (scream) => scream.postID === action.payload.postID
      );
      state.screams[index] = action.payload;
      if (state.scream.postID === action.payload.postID) {
        state.scream.likeCount = action.payload.likeCount;
      }

      return {
        ...state,
      };

    case SUBMIT_COMMENT:
      let commentCount = state.scream.commentCount;
      return {
        ...state,
        scream: {
          ...state.scream,
          commentCount: commentCount + 1,
          comments: [action.payload, ...state.scream.comments],
        },
      };

    case DELETE_SCREAM:
      let deleteIndex = state.screams.findIndex(
        (scream) => scream.postID === action.payload
      );
      state.screams.splice(deleteIndex, 1);
      return {
        ...state,
      };

    case POST_SCREAM:
      return {
        ...state,
        screams: [action.payload, ...state.screams],
      };

    default:
      return state;
  }
}
