import React, { Component } from "react";
import { Link } from "react-router-dom";
import MyButton from "../../utils/MyButton";
import PropTypes from "prop-types";
// Icons
import { Favorite, FavoriteBorder } from "@material-ui/icons";

// Redux Stuf
import { connect } from "react-redux";
import { likePost, unlikePost } from "../../redux/actions/dataActions";

export class LikeButton extends Component {
  likedScream = () => {
    if (
      this.props.user.likes.find((like) => like.postId === this.props.postID)
    ) {
      return true;
    } else return false;
  };

  likePost = () => {
    this.props.likePost(this.props.postID);
  };

  unlikePost = () => {
    this.props.unlikePost(this.props.postID);
  };
  render() {
    const { authenticated } = this.props.user;
    const likeButton = !authenticated ? (
      <Link to="/login">
        <MyButton tip="Like">
          <FavoriteBorder color="primary" />
        </MyButton>
      </Link>
    ) : this.likedScream() ? (
      <MyButton tip="Unlike" onClick={this.unlikePost}>
        <Favorite color="primary" />
      </MyButton>
    ) : (
      <MyButton tip="Like" onClick={this.likePost}>
        <FavoriteBorder color="primary" />
      </MyButton>
    );
    return likeButton;
  }
}

LikeButton.propTypes = {
  user: PropTypes.object.isRequired,
  postID: PropTypes.string.isRequired,
  likePost: PropTypes.func.isRequired,
  unlikePost: PropTypes.func.isRequired,
};

const mapActionsToProps = {
  likePost,
  unlikePost,
};
const mapStateToProps = (state) => ({
  scream: state.data,
  user: state.user,
  UI: state.UI,
});

export default connect(mapStateToProps, mapActionsToProps)(LikeButton);
