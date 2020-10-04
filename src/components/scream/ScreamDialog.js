import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import MyButton from "../../utils/MyButton";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import LikeButton from "./LikeButton";
import Comments from "./Comments";
import CommentForm from "./CommentForm";

// MUI Stuff
import {
  CircularProgress,
  Dialog,
  DialogContent,
  Grid,
  Typography,
} from "@material-ui/core";
// Icons
import { Chat, Close, UnfoldMore } from "@material-ui/icons";

// Redux Stuff

import { connect } from "react-redux";
import { getScream } from "../../redux/actions/dataActions";

const styles = (theme) => ({
  ...theme.styles,

  profileImage: {
    maxWidth: 200,
    height: 200,
    borderRadius: "50%",
    objectFit: "cover",
  },
  dialogContent: {
    padding: 20,
  },
  closeButton: {
    position: "absolute",
    left: "91%",
  },
  explandButton: {
    position: "absolute",
    left: "90%",
  },
  progressDiv: {
    textAlign: "center",
    margin: "50px 0",
  },
});

class ScreamDialog extends Component {
  state = {
    open: false,
    oldPath: "",
    newPath: "",
  };

  componentDidMount() {
    if (this.props.openDialog) {
      this.handleOpen();
    }
  }
  compo;

  handleOpen = () => {
    let oldPath = window.location.pathname;

    const { postID } = this.props;
    const user = this.props.user.credentials.handle;
    const newPath = `/users/${user}/post/${postID}`;

    if (oldPath === newPath) oldPath = `/users/${user}`;

    window.history.pushState(null, null, newPath);

    this.setState({ open: true, oldPath, newPath });
    this.props.getScream(this.props.postID);
  };
  handleClose = () => {
    window.history.pushState(null, null, this.state.oldPath);
    this.setState({ open: false });
  };
  render() {
    const {
      classes,
      scream: {
        postID,
        body,
        createdAt,
        likeCount,
        userImage,
        commentCount,
        user,
        comments,
      },
      UI: { loading },
    } = this.props;

    const dialogMarkup = loading ? (
      <div className={classes.progressDiv}>
        {" "}
        <CircularProgress />
      </div>
    ) : (
      <Grid container spacing={1}>
        <Grid item sm={5}>
          <img src={userImage} alt="" className={classes.profileImage} />
        </Grid>

        <Grid item sm={7}>
          <Typography component={Link} to={`/users/${user}`}>
            @{user}
          </Typography>
          <hr className={classes.invisibleSeparator} />

          <Typography variant="body2" color="textSecondary">
            {dayjs(createdAt).format("h:mm a, MMMMM DD YYYY")}
          </Typography>
          <hr className={classes.invisibleSeparator} />
          <Typography variant="body1">{body}</Typography>
          <LikeButton postID={postID} />
          <span>{likeCount} Likes </span>

          <MyButton tip="Comments">
            <Chat color="primary" />
          </MyButton>
          <span>{commentCount} Comments</span>
        </Grid>

        <CommentForm postID={postID} />
        <Comments comments={comments} />
      </Grid>
    );

    return (
      <Fragment>
        <MyButton
          onClick={this.handleOpen}
          tip="Expland Post"
          tipClassName={classes.explandButton}
        >
          <UnfoldMore color="primary" />
        </MyButton>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          fullWidth
          maxWidth="sm"
        >
          <MyButton
            tip="Close"
            onClick={this.handleClose}
            tipClassName={classes.closeButton}
          >
            <Close />
          </MyButton>

          <DialogContent className={classes.dialogContent}>
            {dialogMarkup}
          </DialogContent>
        </Dialog>
      </Fragment>
    );
  }
}

ScreamDialog.propTypes = {
  getScream: PropTypes.func.isRequired,
  postID: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired,
  scream: PropTypes.object.isRequired,
  UI: PropTypes.object.isRequired,
};
const mapActionsToProps = {
  getScream,
};

const mapStateToProps = (state) => ({
  scream: state.data.scream,
  user: state.user,
  UI: state.UI,
});

export default connect(
  mapStateToProps,
  mapActionsToProps
)(withStyles(styles)(ScreamDialog));
