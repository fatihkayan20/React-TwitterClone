import React, { Component, Fragment } from "react";
import withStyles from "@material-ui/styles/withStyles";
import { Grid, Typography } from "@material-ui/core";
import { Link } from "react-router-dom";
import dayjs from "dayjs";

// MUI

const styles = (theme) => ({
  ...theme.styles,
  commentImage: {
    maxWidth: "100%",
    height: 100,
    objectFit: "cover",
    borderRadius: "50%",
  },
  commentData: {
    marginLeft: 20,
  },
});

class Comments extends Component {
  render() {
    const { comments, classes } = this.props;
    return (
      <Grid container>
        {comments?.map((comment) => {
          const { body, createdAt, userImage, user } = comment;
          return (
            <Fragment key={createdAt}>
              <hr className={classes.visibleSeparator} />
              <Grid item sm={12}>
                <Grid container>
                  <Grid item sm={2}>
                    <img
                      src={userImage}
                      alt=""
                      className={classes.commentImage}
                    />
                  </Grid>

                  <Grid item sm={9}>
                    <div className={classes.commentData}>
                      <Typography
                        variant="h5"
                        component={Link}
                        to={`/users/{user}`}
                        color="primary"
                      >
                        {user}
                      </Typography>

                      <Typography variant="body2" color="textSecondary">
                        {dayjs(createdAt).format("h:mm a, DD MMMM YYYY")}
                      </Typography>
                      <hr className={classes.invisibleSeparator} />
                      <Typography variant="body1"> {body} </Typography>
                    </div>
                  </Grid>
                </Grid>
              </Grid>
            </Fragment>
          );
        })}
      </Grid>
    );
  }
}

export default withStyles(styles)(Comments);
