import React, { Component } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import Scream from "../components/scream/Scream";
import StaticProfile from "../components/profile/StaticProfile";
import ScreamSkeleton from "../utils/ScreamSkeleton";
import ProfileSkeleton from "../utils/ProfileSkeleton";

// Redux Stuf
import { connect } from "react-redux";
import { getUserData } from "../redux/actions/dataActions";

// MUI Stuf
import { Grid } from "@material-ui/core";

class user extends Component {
  state = {
    profile: null,
    postIDparam: null,
  };

  componentDidMount() {
    const user = this.props.match.params.user;
    const postID = this.props.match.params.postID;

    if (postID) this.setState({ postIDparam: postID });

    this.props.getUserData(user);
    axios
      .get(`/user/${user}`)
      .then((result) => {
        this.setState({ profile: result.data.user });
      })
      .catch((err) => {
        console.error(err.message);
      });
  }

  render() {
    const { screams, loading } = this.props.data;
    const { postIDparam } = this.state;

    const screamsMarkup = loading ? (
      <ScreamSkeleton />
    ) : screams.length === 0 ? (
      <ProfileSkeleton />
    ) : !postIDparam ? (
      screams.map((scream) => <Scream key={scream.postID} scream={scream} />)
    ) : (
      screams.map((scream) => {
        if (scream.postID !== postIDparam)
          return <Scream key={scream.postID} scream={scream} />;
        else return <Scream key={scream.postID} scream={scream} openDialog />;
      })
    );

    return (
      <Grid container spacing={5}>
        <Grid item sm={8} xs={12}>
          {screamsMarkup}
        </Grid>
        <Grid item sm={4} xs={12}>
          {this.state.profile == null ? (
            <p>Loading Profile</p>
          ) : (
            <StaticProfile profile={this.state.profile} />
          )}
        </Grid>
      </Grid>
    );
  }
}

user.propTypes = {
  getUserData: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  data: state.data,
});

export default connect(mapStateToProps, { getUserData })(user);
