import React, { Component, Fragment } from "react";
import withStyles from "@material-ui/styles/withStyles";
import PropTypes from "prop-types";
import MyButton from "../../utils/MyButton";
// Redux

import { connect } from "react-redux";
import { deletePost } from "../../redux/actions/dataActions";

// MUI
import { DeleteOutline } from "@material-ui/icons";
import { Button, Dialog, DialogActions, DialogTitle } from "@material-ui/core";

const styles = {
  deleteButton: {
    left: "90%",
    top: "10%",
    position: "absolute",
  },
};

class DeleteScream extends Component {
  state = {
    open: false,
  };
  handleOpen = () => {
    this.setState({ open: true });
  };
  handleClose = () => {
    this.setState({ open: false });
  };
  deletePost = () => {
    this.props.deletePost(this.props.postID);
    this.setState({ open: false });
  };

  render() {
    const { classes } = this.props;
    return (
      <Fragment>
        <MyButton
          tip="Delete Post"
          onClick={this.handleOpen}
          btnClassName={classes.deleteButton}
        >
          <DeleteOutline color="secondary" />
        </MyButton>

        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Are you want to delete this post ?</DialogTitle>

          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={this.deletePost} color="secondary">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Fragment>
    );
  }
}

DeleteScream.propTypes = {
  deletePost: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  postID: PropTypes.string.isRequired,
};

export default connect(null, { deletePost })(withStyles(styles)(DeleteScream));
